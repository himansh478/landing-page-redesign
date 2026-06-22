'use server';

import { supabase } from '@/lib/supabase';

// Cloudflare Turnstile verification ke liye server-side call
async function verifyTurnstileToken(token: string) {
  // Agar humne env mein secret key set nahi ki hai, toh hum Cloudflare ki official 'Always Pass' test key use karenge
  const secretKey = process.env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA';

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
      }),
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}

interface RegisterPartnerInput {
  name: string;
  whatsapp: string;
  insta_id: string;
  gmail: string;
  state: string;
  district: string;
  exact_location: string;
  skills: string;
  equipments: string;
  experience: string;
  portfolio_link: string;
  turnstileToken: string;
  website_url?: string; // Honeypot field for bots
}

export async function registerPartner(input: RegisterPartnerInput) {
  // 1. Honeypot check (Agar koi bot direct fill kar raha hai, toh silent block)
  if (input.website_url) {
    return { success: false, error: 'Bot activity detected!' };
  }

  // 2. Input Validation (Basic sanity check)
  if (!input.name || !input.whatsapp || !input.state || !input.district || !input.exact_location || !input.skills || !input.equipments || !input.experience) {
    return { success: false, error: 'Zaroori details missing hain! Kripya saare fields bharein.' };
  }

  // 3. Turnstile CAPTCHA Token Verify (Removed Cloudflare Turnstile check)
  const isCaptchaValid = true;

  // 4. Secure Insertion in Supabase Database
  try {
    const { error } = await supabase.from('partners').insert([
      {
        name: input.name,
        whatsapp: input.whatsapp,
        insta_id: input.insta_id || null,
        gmail: input.gmail || null,
        state: input.state,
        district: input.district,
        exact_location: input.exact_location,
        skills: input.skills,
        equipments: input.equipments,
        experience: input.experience,
        portfolio_link: input.portfolio_link || null,
      },
    ]);

    if (error) {
      console.error('Supabase registration error:', error);
      return { success: false, error: error.message || 'Database registration fail ho gayi.' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Server action registration crash:', err);
    return { success: false, error: 'Server par ek unknown error aayi hai.' };
  }
}
