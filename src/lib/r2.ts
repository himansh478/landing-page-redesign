import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const r2AccountId = process.env.R2_ACCOUNT_ID;
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const r2BucketName = process.env.R2_BUCKET_NAME || 'cwaya-clips';

// Initialize S3 client for Cloudflare R2
const s3Client = new S3Client({
  endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: r2AccessKeyId || '',
    secretAccessKey: r2SecretAccessKey || '',
  },
  region: 'auto',
});

/**
 * Check if R2 credentials are configured
 */
export function isR2Configured(): boolean {
  return !!(r2AccountId && r2AccessKeyId && r2SecretAccessKey);
}

/**
 * Upload a file to Cloudflare R2.
 * @param fileBuffer The file content as a Buffer.
 * @param key The destination path in the bucket (e.g. "clips/my-video.mp4").
 * @param contentType The MIME type of the file.
 */
export async function uploadToR2(
  fileBuffer: Buffer,
  key: string,
  contentType: string
): Promise<{ success: boolean; key: string; error?: string }> {
  if (!isR2Configured()) {
    return { success: false, key, error: 'Cloudflare R2 credentials are not configured.' };
  }

  try {
    const command = new PutObjectCommand({
      Bucket: r2BucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await s3Client.send(command);
    return { success: true, key };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown upload error';
    console.error('R2 upload error:', message);
    return { success: false, key, error: message };
  }
}

/**
 * Delete a file from Cloudflare R2.
 * @param key The path of the file in the bucket.
 */
export async function deleteFromR2(key: string): Promise<boolean> {
  if (!isR2Configured()) return false;

  try {
    const command = new DeleteObjectCommand({
      Bucket: r2BucketName,
      Key: key,
    });
    await s3Client.send(command);
    return true;
  } catch (err) {
    console.error('R2 delete error:', err);
    return false;
  }
}

/**
 * Generates a temporary, expiring download link for a file in Cloudflare R2.
 * @param fileKey The path or filename of the video in the R2 bucket.
 * @param expiresInSeconds Duration for which the link is valid (default 3600 seconds / 1 hour).
 */
export async function getPreSignedDownloadUrl(fileKey: string, expiresInSeconds: number = 3600): Promise<string> {
  if (!r2AccountId || !r2AccessKeyId || !r2SecretAccessKey) {
    throw new Error('Cloudflare R2 environment variables are missing.');
  }

  const command = new GetObjectCommand({
    Bucket: r2BucketName,
    Key: fileKey,
  });

  // Generate the signed URL
  const url = await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
  return url;
}

/**
 * Generates a pre-signed upload URL (alternative upload method for large files).
 * @param key The destination path in the bucket.
 * @param contentType The MIME type.
 * @param expiresInSeconds How long the URL is valid (default 1 hour).
 */
export async function getPreSignedUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds: number = 3600
): Promise<string> {
  if (!isR2Configured()) {
    throw new Error('Cloudflare R2 environment variables are missing.');
  }

  const command = new PutObjectCommand({
    Bucket: r2BucketName,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
  return url;
}
