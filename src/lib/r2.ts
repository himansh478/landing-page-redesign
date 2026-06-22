import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const r2AccountId = process.env.R2_ACCOUNT_ID;
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const r2BucketName = process.env.R2_BUCKET_NAME || '';

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
