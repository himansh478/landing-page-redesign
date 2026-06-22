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
