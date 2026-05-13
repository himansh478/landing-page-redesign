export interface WeddingVideo {
  id: number;
  title: string;
  thumbnail: string;
  videoUrl: string;
  category: string;
  duration: string;
  description: string;
  type: string;
}

export const weddingHighlights: WeddingVideo[] = [
  {
    id: 5,
    title: 'Wedding Glow',
    thumbnail: '/images/wedding%20edit.png',
    videoUrl: 'https://www.youtube.com/embed/dIRN9hI6_Rk',
    category: 'Highlights',
    duration: '0:45',
    description: 'Romantic first dance moment captured with cinematic detail and emotional color grading.',
    type: 'highlight'
  },
  {
    id: 6,
    title: 'Eternal Vows',
    thumbnail: '/images/wedding%20edit.png',
    videoUrl: 'https://www.youtube.com/embed/nX41UPdjDV4',
    category: 'Emotions',
    duration: '1:20',
    description: 'Intimate vow exchange with heartfelt reactions and tender moments beautifully edited.',
    type: 'highlight'
  },
  {
    id: 7,
    title: 'Sacred Details',
    thumbnail: '/images/wedding%20edit.png',
    videoUrl: 'https://www.youtube.com/embed/mDTOyJBvJs8',
    category: 'Details',
    duration: '0:30',
    description: 'Elegant close-ups of wedding details with professional macro cinematography.',
    type: 'highlight'
  },
  {
    id: 8,
    title: 'Joyous Union',
    thumbnail: '/images/wedding%20edit.png',
    videoUrl: "https://www.youtube.com/embed/-l0cn9-bCEs",
    category: 'Celebration',
    duration: '1:00',
    description: 'Joyous moments of the newly married couple celebrating with family and friends.',
    type: 'highlight'
  },
];
