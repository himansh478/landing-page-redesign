export interface ReelVideo {
  id: number;
  title: string;
  thumbnail: string;
  videoUrl: string;
  type?: 'bike' | 'car' | 'other';
}

export interface VlogVideo {
  id: number;
  title: string;
  thumbnail: string;
  videoUrl: string;
  category?: string;
  duration?: string;
  description?: string;
  type?: string;
}

export interface CorporateVideo {
  id: number;
  title: string;
  thumbnail: string;
  videoUrl: string;
  duration?: string;
}

export interface Partner {
  id: string;
  name: string;
  whatsapp: string;
  insta_id?: string;
  gmail: string;
  state: string;
  district: string;
  exact_location: string;
  skills: string; // e.g. "Cinematic Shoot, Editing"
  equipments: string;
  experience: string;
  created_at: string;
}

// ───────────── Course platform ─────────────

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  cover_image_url: string | null;
  published: boolean;
  created_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  duration_seconds: number | null;
  thumbnail_url: string | null;
  is_free_preview: boolean;
  status: 'draft' | 'published';
  created_at: string;
  // video_key is intentionally NOT included here — it must never be sent
  // to the browser except as a short-lived signed URL at playback time.
  video_key?: string; // present only on admin-only queries
}

export interface CoursePurchase {
  id: string;
  user_id: string;
  course_id: string;
  order_id: string;
  payment_id: string | null;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  created_at: string;
}
