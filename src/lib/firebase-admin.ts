import { Storage } from '@google-cloud/storage';

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
// Firebase private keys contain literal '\n' characters that need to be parsed
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

let storage: Storage | null = null;

if (projectId && clientEmail && privateKey) {
  storage = new Storage({
    projectId,
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
  });
} else {
  console.warn('Firebase Admin credentials missing. Signed URLs will fail.');
}

/**
 * Check if Firebase Admin is configured
 */
export function isFirebaseConfigured(): boolean {
  return !!(storage && bucketName);
}

/**
 * Generates a temporary, expiring download link for a file in Firebase Storage.
 * @param fileKey The path or filename of the video in the Firebase bucket.
 * @param expiresInSeconds Duration for which the link is valid (default 3600 seconds / 1 hour).
 */
export async function getFirebaseSignedUrl(fileKey: string, expiresInSeconds: number = 3600): Promise<string> {
  if (!storage || !bucketName) {
    throw new Error('Firebase Admin/Storage is not configured.');
  }

  try {
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileKey);

    // Get signed URL
    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + expiresInSeconds * 1000,
    });

    return url;
  } catch (err) {
    console.error('Error generating Firebase signed URL:', err);
    throw err;
  }
}

/**
 * Delete a file from Firebase Storage.
 * @param fileKey The path of the file in the bucket.
 */
export async function deleteFromFirebase(fileKey: string): Promise<boolean> {
  if (!storage || !bucketName) return false;

  try {
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileKey);
    await file.delete();
    return true;
  } catch (err) {
    console.error('Error deleting from Firebase Storage:', err);
    return false;
  }
}
