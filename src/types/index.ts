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
