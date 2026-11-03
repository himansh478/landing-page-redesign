/** What stops this browser from running the editor at all, if anything. */
export function browserProblem() {
  if (typeof FileSystemFileHandle === 'undefined' || !('createWritable' in FileSystemFileHandle.prototype)) {
    return 'This browser cannot store projects. Please update it, or use Chrome or Edge.';
  }
  if (!document.createElement('canvas').getContext('webgl2')) {
    return 'This browser cannot draw captions. Please update it, or use Chrome or Edge.';
  }
  return null;
}

/** Whether this browser can encode the final video by itself. */
export async function canEncodeVideo(width: number, height: number) {
  if (typeof VideoEncoder === 'undefined' || typeof VideoDecoder === 'undefined') return false;
  try {
    const { supported } = await VideoEncoder.isConfigSupported({ codec: 'avc1.640033', width, height, bitrate: 12_000_000, framerate: 30 });
    return !!supported;
  } catch {
    return false;
  }
}
