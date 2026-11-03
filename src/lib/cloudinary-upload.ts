// Browser-side upload to Cloudinary using the project's public upload preset
// (the same one the raw-clips uploader uses). Safe for client components:
// it only reads NEXT_PUBLIC_ settings.

export type CloudinaryResult = { secure_url: string; public_id: string; width?: number; height?: number };

export function uploadToCloudinary(
  file: File,
  resourceType: 'image' | 'video',
  onProgress: (pct: number) => void,
  folder?: string
): Promise<CloudinaryResult> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !preset) return Promise.reject(new Error('Cloudinary is not configured (.env.local).'));

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', preset);
    if (folder) formData.append('folder', folder);
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve(JSON.parse(xhr.responseText))
        : reject(new Error('Cloudinary upload failed: ' + xhr.responseText));
    xhr.onerror = () => reject(new Error('Network error during upload.'));
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, true);
    xhr.send(formData);
  });
}
