"""CTC forced alignment on a Modal GPU.

Whisper's word times are only approximate. This worker takes the known text and
finds where each word sits in the audio, using a wav2vec2 acoustic model.

Hindi text must be in Devanagari, so English words arrive spelt phonetically (कैपकट).
"""

import subprocess
import tempfile
import unicodedata
from concurrent.futures import ThreadPoolExecutor

import modal

MODELS = {
    "hi": "theainerd/Wav2Vec2-large-xlsr-hindi",
    "en": "jonatasgrosman/wav2vec2-large-xlsr-53-english",
}
SAMPLE_RATE = 16000
CORES = 4


def download_model():
    from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor

    for name in MODELS.values():
        Wav2Vec2Processor.from_pretrained(name)
        Wav2Vec2ForCTC.from_pretrained(name)


image = (
    modal.Image.debian_slim(python_version="3.12")
    .apt_install("ffmpeg")
    .pip_install("torch==2.5.1", "torchaudio==2.5.1", "transformers==4.46.3", "numpy<2")
    .run_function(download_model)
)

app = modal.App("cwaya-align", image=image)


def decode(audio: bytes):
    import numpy as np

    # A real file, because MP4 audio can keep its index at the end and pipes can't seek.
    with tempfile.NamedTemporaryFile(suffix=".m4a") as file:
        file.write(audio)
        file.flush()
        result = subprocess.run(
            ["ffmpeg", "-v", "error", "-i", file.name, "-ac", "1", "-ar", str(SAMPLE_RATE), "-f", "f32le", "pipe:1"],
            capture_output=True,
            check=True,
        )
    if not result.stdout:
        raise ValueError(f"No audio decoded: {result.stderr.decode()[:300]}")
    return np.frombuffer(result.stdout, dtype=np.float32).copy()


def envelope(samples, step: float = 0.01):
    """Loudness in dB every `step` seconds, used to check timing independently."""
    import numpy as np

    size = int(SAMPLE_RATE * step)
    frames = samples[: len(samples) // size * size].reshape(-1, size)
    return (20 * np.log10(np.sqrt((frames**2).mean(axis=1)) + 1e-6)).round(1).tolist()


# CPU keeps this free. GPU needs a payment method on Modal; the code picks it up by itself.
# Importing torch is most of a start, about 30 s, and the snapshot skips it. The weights stay
# out of it: a snapshot hands them back a page at a time, which took 45 s in the first job.
@app.cls(cpu=CORES, memory=4096, scaledown_window=60, timeout=1800, enable_memory_snapshot=True)
class Aligner:
    @modal.enter(snap=True)
    def load(self):
        import torch  # noqa: F401
        from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor  # noqa: F401

    @modal.enter(snap=False)
    def wake(self):
        import torch

        # A Modal core is two hardware threads and torch assumes one: 18 s on 4, 10 s on 8.
        torch.set_num_threads(CORES * 2)
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        # In the background, so the loudness check at the start of a job doesn't wait for them.
        pool = ThreadPoolExecutor(len(MODELS))
        self.loaded = {language: pool.submit(self.read_model, name) for language, name in MODELS.items()}

    def read_model(self, name: str) -> dict:
        from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor

        processor = Wav2Vec2Processor.from_pretrained(name)
        vocab = processor.tokenizer.get_vocab()
        return {
            "processor": processor,
            "model": Wav2Vec2ForCTC.from_pretrained(name).to(self.device).eval(),
            "vocab": {char.lower(): index for char, index in vocab.items()},
            "blank": processor.tokenizer.pad_token_id,
            "separator": vocab.get("|"),
        }

    def spell(self, word: str, bundle: dict) -> list[int]:
        """Keeps only the characters the model knows, dropping nukta variants it lacks."""
        text = unicodedata.normalize("NFC", word).lower()
        vocab, blank = bundle["vocab"], bundle["blank"]
        return [vocab[c] for c in text if c in vocab and vocab[c] != blank]

    def align_span(self, samples, words: list[str], bundle: dict):
        import torch
        import torchaudio.functional as F

        inputs = bundle["processor"].feature_extractor(samples, sampling_rate=SAMPLE_RATE, return_tensors="pt")
        inputs = inputs.input_values.to(self.device)
        with torch.inference_mode():
            log_probs = torch.log_softmax(bundle["model"](inputs).logits, dim=-1)

        separator, blank = bundle["separator"], bundle["blank"]
        spelled = [self.spell(w, bundle) for w in words]
        targets, owner = [], []
        for index, chars in enumerate(spelled):
            if not chars:
                continue
            if targets and separator is not None:
                targets.append(separator)
                owner.append(-1)
            targets.extend(chars)
            owner.extend([index] * len(chars))
        if not targets:
            return [None] * len(words)

        path, scores = F.forced_align(
            log_probs.cpu(), torch.tensor([targets], dtype=torch.int32), blank=blank
        )
        spans = F.merge_tokens(path[0], scores[0].exp(), blank=blank)

        seconds_per_frame = len(samples) / SAMPLE_RATE / log_probs.shape[1]
        result = [None] * len(words)
        for span, who in zip(spans, owner):
            if who < 0:
                continue
            start, end, score = span.start * seconds_per_frame, span.end * seconds_per_frame, span.score
            if result[who] is None:
                result[who] = {"start": start, "end": end, "scores": [score]}
            else:
                result[who]["end"] = end
                result[who]["scores"].append(score)
        return [
            r and {"start": r["start"], "end": r["end"], "score": sum(r["scores"]) / len(r["scores"])} for r in result
        ]

    @modal.method()
    def burn(self, video: bytes, overlay: bytes, options: dict) -> bytes:
        """Server export: lays the browser's transparent caption layer over the video.

        The captions were drawn by the same engine as a normal export, so only the
        final step moves here. Files last only as long as this job.
        """
        width, height = int(options["width"]), int(options["height"])
        crop = options.get("crop")
        with tempfile.TemporaryDirectory() as folder:
            source, layer, result = f"{folder}/source", f"{folder}/captions.mov", f"{folder}/result.mp4"
            with open(source, "wb") as file:
                file.write(video)
            with open(layer, "wb") as file:
                file.write(overlay)

            base = f"[0:v]scale={width}:{height},setsar=1[base]"
            if crop:
                # The camera path arrives as moves through time, so the crop follows it.
                with open(f"{folder}/camera.txt", "w") as file:
                    for point in crop["path"]:
                        file.write(f"{float(point['time']):.3f} crop x {float(point['left'])}*iw;\n")
                share = float(crop["share"])
                base = f"[0:v]sendcmd=f={folder}/camera.txt,crop=w={share}*iw:h=ih:x=0:y=0,scale={width}:{height},setsar=1[base]"

            subprocess.run(
                [
                    "ffmpeg", "-v", "error", "-y", "-i", source, "-i", layer,
                    "-filter_complex", f"{base};[base][1:v]overlay=0:0:format=auto:shortest=1[out]",
                    "-map", "[out]", "-map", "0:a?", "-c:a", "copy",
                    "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p",
                    "-movflags", "+faststart", result,
                ],
                check=True,
                capture_output=True,
            )
            with open(result, "rb") as file:
                return file.read()

    @modal.method()
    def loudness(self, audio: bytes) -> list[float]:
        """Lets the server check transcribed words against where sound actually is."""
        return envelope(decode(audio))

    @modal.method()
    def align(self, audio: bytes, segments: list[dict], language: str = "hi") -> dict:
        """segments: [{start, end, words: [str]}]. Each is aligned on its own, so a
        mistake in one segment cannot shift the timing of the next."""
        bundle = self.loaded[language].result()
        samples = decode(audio)
        duration = len(samples) / SAMPLE_RATE
        out = []
        for segment in segments:
            start = max(0.0, segment["start"])
            end = min(duration, segment["end"])
            span = samples[int(start * SAMPLE_RATE) : int(end * SAMPLE_RATE)]
            if span.size < SAMPLE_RATE / 10:
                raise ValueError(f"Audio span too short: {span.size} of {samples.size} samples, {segment['start']}-{segment['end']}")
            timed = self.align_span(span, segment["words"], bundle)
            out.append([t and {**t, "start": t["start"] + start, "end": t["end"] + start} for t in timed])
        return {"duration": duration, "segments": out, "envelope": envelope(samples)}
