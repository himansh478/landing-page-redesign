import crypto from 'crypto';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { sessions_auth, users_auth } from '@/db/schema';
import { eq } from 'drizzle-orm';

// 1. PASSWORD HASHING MACHINE (PBKDF2)
// Kisi plain text password ko unbreakable code mein badalna
export function hashPassword(password: string): string {
    // Salt ek unique word hota hai jo hashing ko aur strong banata hai
    const salt = 'cwaya_super_secret_salt_100x'; 
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

// 2. GET CURRENT LOGGED IN USER (Session Checker)
// Ye function browser ke cookie se session ID lekar check karega ki user logged-in hai ya nahi
export async function getCurrentUser() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    if (!sessionId) return null; // Agar cookie nahi hai, toh user Guest hai

    // Database mein check karna ki kya ye session active hai aur kis user ki hai
    const sessionWithUser = await db.query.sessions_auth.findFirst({
        where: eq(sessions_auth.id, sessionId),
        with: {
            user: true, // User details ko bhi automatic fetch kar lo (JOIN Query)
        }
    });

    // Agar session exist karta hai aur expire nahi hua hai, toh user object return karein
    if (sessionWithUser && sessionWithUser.expiresAt > new Date()) {
        return sessionWithUser.user;
    }

    return null;
}
