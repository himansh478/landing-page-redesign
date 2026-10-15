import cloudinary from './cloudinary';

/**
 * Course videos live on Cloudinary (not Cloudflare R2 — switched because R2
 * requires a card on file for identity verification, and the account this
 * project runs under has UPI only, no card).
 *
 * This only works if the Cloudinary upload preset used for course videos
 * (NEXT_PUBLIC_CLOUDINARY_COURSE_PRESET) has "Access Mode: Authenticated"
 * set in the Cloudinary dashboard (Settings -> Upload -> that preset).
 * Without that setting, uploaded videos are PUBLIC — anyone who learns the
 * public_id could play them directly, bypassing purchase checks entirely.
 *
 * video_key (stored per lesson) is a Cloudinary public_id, e.g.
 * "courses/<course_id>/<timestamp>-lesson".
 */

/**
 * A short-lived URL to stream one lesson's video. Only call this after
 * verifying the requester is allowed to watch this lesson — the URL itself
 * is enough to play the video for anyone who has it until it expires.
 */
export function getVideoPlaybackUrl(publicId: string, expiresInSeconds = 300): string {
  return cloudinary.utils.url(publicId, {
    resource_type: 'video',
    type: 'authenticated',
    sign_url: true,
    secure: true,
    expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
  });
}
