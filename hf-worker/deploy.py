"""Deploys the timing worker to its Hugging Face Space, which then builds it by itself.

Run from the website folder, with its keys loaded from .env.local:
    node --env-file=.env.local -e "require('child_process').execFileSync('../ai caption/.venv/Scripts/python.exe', ['hf-worker/deploy.py'], { stdio: 'inherit' })"

Needs HF_TOKEN (a Hugging Face token with write access) and CAPTIONS_WORKER_TOKEN (the
secret the website sends). It sets that secret on the Space, uploads this folder, and takes
away the Space's old static page.
"""

import os
import pathlib

# The fast uploader is a native library that Windows Application Control blocks on the Cwaya
# PC, so files go up over plain HTTP. They are small. Set before the import, which reads it.
os.environ.setdefault("HF_HUB_DISABLE_XET", "1")

from huggingface_hub import HfApi  # noqa: E402

SPACE = os.environ.get("CAPTIONS_SPACE", "Himansh001/himansh_aisubtitle")
FILES = ["app.py", "Dockerfile", "requirements.txt", "download.py", "README.md"]

api = HfApi(token=os.environ["HF_TOKEN"])
api.add_space_secret(SPACE, "WORKER_TOKEN", os.environ["CAPTIONS_WORKER_TOKEN"])
api.upload_folder(
    folder_path=pathlib.Path(__file__).parent,
    repo_id=SPACE,
    repo_type="space",
    allow_patterns=FILES,
    delete_patterns=["index.html", "style.css"],
    commit_message="Cwaya word timing worker",
)
print(f"Uploaded to {SPACE}. It builds now: https://huggingface.co/spaces/{SPACE}")
