"""Word timing for Cwaya Captions, as a Hugging Face Space.

Whisper's word times are only approximate. This worker takes the known text and finds
where each word sits in the audio, using a wav2vec2 acoustic model (CTC forced alignment).
It is the same work the Modal worker in captions-worker/ does, served over plain HTTP.

Hindi text must be in Devanagari, so English words arrive spelt phonetically (कैपकट).
Every call needs the secret in WORKER_TOKEN, set in the Space's settings.
"""

import base64
import hmac
import os
import subprocess
import tempfile
import unicodedata
from concurrent.futures import ThreadPoolExecutor

import numpy as np
import torch
import torchaudio.functional as F
from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.responses import Response
from pydantic import BaseModel
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor

MODELS = {
    "hi": "theainerd/Wav2Vec2-large-xlsr-hindi",
    "en": "jonatasgrosman/wav2vec2-large-xlsr-53-english",
}
SAMPLE_RATE = 16000

torch.set_num_threads(os.cpu_count() or 2)
app = FastAPI(title="Cwaya word timing")


def read_model(name: str) -> dict:
    processor = Wav2Vec2Processor.from_pretrained(name)
    vocab = processor.tokenizer.get_vocab()
    return {
        "processor": processor,
        "model": Wav2Vec2ForCTC.from_pretrained(name).eval(),
        "vocab": {char.lower(): index for char, index in vocab.items()},
        "blank": processor.tokenizer.pad_token_id,
        "separator": vocab.get("|"),
    }


# In the background, so the loudness check at the start of a job doesn't wait for them.
pool = ThreadPoolExecutor(len(MODELS))
loaded = {language: pool.submit(read_model, name) for language, name in MODELS.items()}


def allowed(authorization: str | None = Header(default=None)):
    secret = os.environ.get("WORKER_TOKEN", "")
    if not secret or not hmac.compare_digest(authorization or "", f"Bearer {secret}"):
        raise HTTPException(status_code=401, detail="Not allowed")


def decode(audio: bytes):
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
        raise HTTPException(status_code=400, detail=f"No audio decoded: {result.stderr.decode()[:300]}")
    return np.frombuffer(result.stdout, dtype=np.float32).copy()


def envelope(samples, step: float = 0.01):
    """Loudness in dB every `step` seconds, used to check timing independently."""
    size = int(SAMPLE_RATE * step)
    frames = samples[: len(samples) // size * size].reshape(-1, size)
    return (20 * np.log10(np.sqrt((frames**2).mean(axis=1)) + 1e-6)).round(1).tolist()


def spell(word: str, bundle: dict) -> list[int]:
    """Keeps only the characters the model knows, dropping nukta variants it lacks."""
    text = unicodedata.normalize("NFC", word).lower()
    vocab, blank = bundle["vocab"], bundle["blank"]
    return [vocab[c] for c in text if c in vocab and vocab[c] != blank]


def align_span(samples, words: list[str], bundle: dict):
    inputs = bundle["processor"].feature_extractor(samples, sampling_rate=SAMPLE_RATE, return_tensors="pt").input_values
    with torch.inference_mode():
        log_probs = torch.log_softmax(bundle["model"](inputs).logits, dim=-1)

    separator, blank = bundle["separator"], bundle["blank"]
    targets, owner = [], []
    for index, chars in enumerate(spell(w, bundle) for w in words):
        if not chars:
            continue
        if targets and separator is not None:
            targets.append(separator)
            owner.append(-1)
        targets.extend(chars)
        owner.extend([index] * len(chars))
    if not targets:
        return [None] * len(words)

    path, scores = F.forced_align(log_probs, torch.tensor([targets], dtype=torch.int32), blank=blank)
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
    return [r and {"start": r["start"], "end": r["end"], "score": sum(r["scores"]) / len(r["scores"])} for r in result]


class Segment(BaseModel):
    start: float
    end: float
    words: list[str]


class AudioJob(BaseModel):
    """The audio travels as base64, so one JSON body carries everything."""

    audio: str
    segments: list[Segment] = []
    language: str = "hi"


@app.get("/")
@app.get("/health")
def health():
    """Open to all, so a daily ping can keep the Space from going to sleep."""
    return {"ok": True, "ready": {language: future.done() for language, future in loaded.items()}}


@app.post("/loudness", dependencies=[Depends(allowed)])
def loudness(job: AudioJob):
    """Lets the server check transcribed words against where sound actually is."""
    return envelope(decode(base64.b64decode(job.audio)))


@app.post("/align", dependencies=[Depends(allowed)])
def align(job: AudioJob):
    """Each segment is aligned on its own, so a mistake in one cannot shift the next."""
    if job.language not in loaded:
        raise HTTPException(status_code=400, detail=f"Unknown language {job.language}")
    bundle = loaded[job.language].result()
    samples = decode(base64.b64decode(job.audio))
    duration = len(samples) / SAMPLE_RATE
    out = []
    for segment in job.segments:
        start = max(0.0, segment.start)
        end = min(duration, segment.end)
        span = samples[int(start * SAMPLE_RATE) : int(end * SAMPLE_RATE)]
        if span.size < SAMPLE_RATE / 10:
            raise HTTPException(status_code=400, detail=f"Audio span too short: {span.size} samples, {segment.start}-{segment.end}")
        timed = align_span(span, segment.words, bundle)
        out.append([t and {**t, "start": t["start"] + start, "end": t["end"] + start} for t in timed])
    return {"duration": duration, "segments": out, "envelope": envelope(samples)}


@app.post("/burn", dependencies=[Depends(allowed)])
def burn(video: UploadFile = File(...), overlay: UploadFile = File(...), width: int = Form(...), height: int = Form(...), crop: str | None = Form(default=None)):
    """Server export: lays the browser's transparent caption layer over the video.

    The captions were drawn by the same engine as a normal export, so only the final step
    moves here. Files last only as long as this request.
    """
    import json

    options = json.loads(crop) if crop else None
    with tempfile.TemporaryDirectory() as folder:
        source, layer, result = f"{folder}/source", f"{folder}/captions.mov", f"{folder}/result.mp4"
        with open(source, "wb") as file:
            file.write(video.file.read())
        with open(layer, "wb") as file:
            file.write(overlay.file.read())

        base = f"[0:v]scale={width}:{height},setsar=1[base]"
        if options:
            # The camera path arrives as moves through time, so the crop follows it.
            with open(f"{folder}/camera.txt", "w") as file:
                for point in options["path"]:
                    file.write(f"{float(point['time']):.3f} crop x {float(point['left'])}*iw;\n")
            share = float(options["share"])
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
            return Response(content=file.read(), media_type="video/mp4")
