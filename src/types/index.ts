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
