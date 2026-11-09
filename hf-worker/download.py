"""Fetches the timing models while the image builds, so the Space starts with them."""

from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor

for name in ("theainerd/Wav2Vec2-large-xlsr-hindi", "jonatasgrosman/wav2vec2-large-xlsr-53-english"):
    Wav2Vec2Processor.from_pretrained(name)
    Wav2Vec2ForCTC.from_pretrained(name)
