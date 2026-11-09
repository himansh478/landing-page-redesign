---
title: Cwaya word timing
emoji: 🎬
colorFrom: yellow
colorTo: red
sdk: docker
app_port: 7860
pinned: false
---

# Cwaya word timing

The worker behind [Cwaya Captions](https://www.cwaya.me/ai-caption): it finds where each
word sits in the audio (CTC forced alignment with wav2vec2), measures loudness, and, for
the server export, lays a caption layer over a video with ffmpeg.

It is an API, not a page. Every call except `/health` needs the secret set as
`WORKER_TOKEN` in this Space's settings, sent as `Authorization: Bearer <secret>`.

- `GET /health`: whether the models are loaded
- `POST /loudness`: `{ audio }` (base64) → loudness in dB every 10 ms
- `POST /align`: `{ audio, segments: [{ start, end, words }], language }` → word times
- `POST /burn`: form with `video`, `overlay`, `width`, `height` and optional `crop` → MP4

The code lives in the website repository, in `hf-worker/`.
