import crypto from 'crypto';
import { supabase } from './supabase';

// 1. PASSWORD HASHING MACHINE (PBKDF2)
// Kisi plain text password ko unbreakable code mein badalna
export function hashPassword(password: string): string {
    // Salt ek unique word hota hai jo hashing ko aur strong banata hai
    const salt = 'cwaya_super_secret_salt_100x'; 
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

// 2. GET CURRENT LOGGED IN USER (Supabase Session Checker)
// Ye function active Supabase token/session se user data verify karega
export async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
            return null;
        }
        return user;
    } catch {
        return null;
    }
}

// 3. VERIFY A BUYER'S IDENTITY FROM AN API REQUEST
// Reads the "Authorization: Bearer <access_token>" header a logged-in
// browser sends, and asks Supabase who that token belongs to. Server
// routes that must know WHICH user is acting (creating a course order,
// requesting a signed playback URL) use this — never trust a client-
// supplied user id directly.
export async function getUserFromBearer(req: Request) {
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.slice('Bearer '.length).trim();
    if (!token) return null;

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user;
}
