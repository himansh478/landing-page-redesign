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

// Shoot types and Editing services list to identify booking type
const shootTypes = [
  'Wedding Shoot',
  'Insta & YouTube Video Shoot',
  'Commercial Shoot',
  'Corporate Event Shoot',
  'Marketing Shoot',
  'Religious Shoot',
  'Political Shoot',
  'Cinematic Shoot',
];

interface BookingInput {
  name: string;
  email: string;
  whatsappNumber: string;
  location: string;
  editingOption: string;
  projectTitle: string;
  description: string;
  budget: string;
  timeline: string;
  referenceVideoLink: string;
  turnstileToken: string;
  website_url?: string;
}

export async function createBooking(input: BookingInput) {
  // 1. Honeypot anti-spam check
  if (input.website_url) {
    return { success: false, error: 'Spam detected!' };
  }

  // 2. Input validation
  if (!input.name || !input.email || !input.whatsappNumber || !input.location || !input.editingOption || !input.budget || !input.timeline) {
    return { success: false, error: 'Kripya saare mandatory fields bharein!' };
  }

  // 3. CAPTCHA Check (Removed Cloudflare Turnstile check)
  const isTokenValid = true;

  const isShootBooking = shootTypes.includes(input.editingOption);

  const commonData = {
    name: input.name,
    email: input.email,
    whatsapp_number: input.whatsappNumber,
    location: input.location,
    budget: input.budget,
    timeline: input.timeline,
    reference_video_link: input.referenceVideoLink || null,
  };

  try {
    if (isShootBooking) {
      // Shoot booking table mein insert karein
      const { error } = await supabase.from('shoot_bookings').insert([
        {
          ...commonData,
          shoot_type: input.editingOption,
          event_details: input.description || null,
        },
      ]);
      if (error) throw error;
    } else {
      // General booking table mein insert karein
      const { error } = await supabase.from('bookings').insert([
        {
          ...commonData,
          service_type: input.editingOption,
          project_title: input.projectTitle || null,
          description: input.description || null,
        },
      ]);
      if (error) throw error;
    }

    return { success: true };
  } catch (err: any) {
    console.error('Server action booking error:', err);
    return { success: false, error: err.message || 'Database booking submission failed.' };
  }
}
