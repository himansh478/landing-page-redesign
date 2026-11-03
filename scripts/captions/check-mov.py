"""Checks a transparent MOV with real ffmpeg, on Modal, because this PC has no ffmpeg."""

import json
import sys

import modal

app = modal.App("cwaya-mov-check", image=modal.Image.debian_slim(python_version="3.12").apt_install("ffmpeg"))


@app.function(timeout=600, cpu=2, memory=4096)
def check(data: bytes, times: list[float], width: int, height: int) -> dict:
    import subprocess
    import tempfile

    with tempfile.TemporaryDirectory() as folder:
        path = f"{folder}/in.mov"
        with open(path, "wb") as file:
            file.write(data)

        probe = subprocess.run(
            ["ffprobe", "-v", "error", "-count_frames", "-show_streams", "-show_format", "-of", "json", path],
            capture_output=True,
            text=True,
        )
        decode = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "null", "-"], capture_output=True, text=True)

        frames = {}
        for time in times:
            # Over magenta, so transparency and edges can be seen.
            out = f"{folder}/{time}.png"
            subprocess.run(
                [
                    "ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"color=magenta:s={width}x{height}",
                    "-ss", str(time), "-i", path,
                    "-filter_complex", "[0:v][1:v]overlay=format=auto,format=rgb24", "-frames:v", "1", out,
                ],
                check=True,
                capture_output=True,
            )
            with open(out, "rb") as file:
                frames[str(time)] = file.read()

        return {"probe": probe.stdout, "probe_error": probe.stderr, "decode_errors": decode.stderr[:2000], "frames": frames}


if __name__ == "__main__":
    name, width, height = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
    times = [float(t) for t in sys.argv[4:]]
    with open(name, "rb") as source:
        data = source.read()
    with app.run():
        result = check.remote(data, times, width, height)
    probe = json.loads(result["probe"])
    video = probe["streams"][0]
    keep = ["codec_name", "codec_tag_string", "pix_fmt", "width", "height", "r_frame_rate", "avg_frame_rate", "nb_frames", "nb_read_frames", "duration", "bits_per_coded_sample"]
    print({key: video.get(key) for key in keep})
    print("format", probe["format"].get("format_name"), probe["format"].get("duration"))
    print("streams", len(probe["streams"]), "probe errors:", result["probe_error"][:300] or "none")
    print("decode errors:", result["decode_errors"] or "none")
    for time, png in result["frames"].items():
        out = f"work/mov-{time}.png"
        with open(out, "wb") as file:
            file.write(png)
        print(out, len(png))
