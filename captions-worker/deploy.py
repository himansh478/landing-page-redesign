"""Deploys the worker. Replaces `modal deploy`, whose file watcher is blocked on this PC."""

from align import app

if __name__ == "__main__":
    # "recreate" stops running containers, which would otherwise keep serving old code.
    print(app.deploy(name="cwaya-align", strategy="recreate").app_id)
