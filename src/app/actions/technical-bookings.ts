'use server';

import { supabase } from '@/lib/supabase';

// Turnstile verification helper
async function verifyTurnstileToken(token: string) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA';
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: secretKey, response: token }),
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}

interface TechnicalBookingInput {
  name: string;
  whatsappNumber: string;
  location: string;
  serviceType: string;
  description: string;
  message?: string;
  turnstileToken: string;
  website_url?: string;
}

export async function createTechnicalBooking(input: TechnicalBookingInput) {
  // 1. Honeypot check
  if (input.website_url) {
    return { success: false, error: 'Spam detected!' };
  }

  // 2. Input validation
  if (!input.name || !input.whatsappNumber || !input.location || !input.serviceType || !input.description) {
    return { success: false, error: 'Mandatory fields missing hain!' };
  }

  // 3. CAPTCHA Check (Removed Cloudflare Turnstile check)
  const isTokenValid = true;

  try {
    const { error } = await supabase.from('technical_bookings').insert([
      {
        name: input.name,
        whatsapp_number: input.whatsappNumber,
        location: input.location,
        service_type: input.serviceType,
        description: input.description,
        message: input.message || null,
      },
    ]);

    if (error) throw error;

    return { success: true };
  } catch (err: any) {
    console.error('Server action technical booking error:', err);
    return { success: false, error: err.message || 'Database submission failed.' };
  }
}
