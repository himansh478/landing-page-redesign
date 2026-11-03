const WIDTH = 240;
const QUALITY = 0.72;
/** A second in, so the card doesn't show a black opening frame. */
const INTO_VIDEO = 1;

/** A small picture of a video for the project list. */
export async function makeThumbnail(file: File) {
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.src = url;
  try {
    await new Promise((loaded, failed) => {
      video.onloadeddata = loaded;
      video.onerror = failed;
    });
    video.currentTime = Math.min(INTO_VIDEO, video.duration / 2);
    await new Promise((seeked) => (video.onseeked = seeked));

    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = Math.round((WIDTH * video.videoHeight) / video.videoWidth);
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob | null>((done) => canvas.toBlob(done, 'image/jpeg', QUALITY));
  } finally {
    URL.revokeObjectURL(url);
  }
}
