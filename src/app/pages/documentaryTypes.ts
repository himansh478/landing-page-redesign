export interface DocumentaryVideo {
  id: number;
  title: string;
  thumbnail: string;
  videoUrl: string;
  category: string;
  duration: string;
  description: string;
  type: 'documentary' | 'short';
}
