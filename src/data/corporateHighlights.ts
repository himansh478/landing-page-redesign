export interface CorporateVideo {
  id: number;
  title: string;
  thumbnail: string;
  videoUrl: string;
  category: string;
  duration: string;
  description: string;
  type: 'youtube' | 'reel';
}

export const corporateReelVideos: CorporateVideo[] = [
  {
    id: 1,
    title: 'sample 1',
    videoUrl: 'https://www.ImageIcon.com/reel/DMCdspZSACx/embed/',
    thumbnail: '/images/reel edit.png',
    category: '',
    duration: '',
    description: '',
    type: 'reel'
  },
  {
    id: 2,
    title: 'sample 2',
    videoUrl: 'https://www.youtube.com/embed/hdtGKrTJnrE',
    thumbnail: '/images/reel edit.png',
    category: '',
    duration: '',
    description: '',
    type: 'reel'
  },
  {
    id: 3,
    title: 'sample 3',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: '/images/reel edit.png',
    category: '',
    duration: '',
    description: '',
    type: 'reel'
  },
  {
    id: 4,
    title: 'sample 4',
    videoUrl: 'https://www.youtube.com/embed/I2R467vzWRo',
    thumbnail: '/images/reel edit.png',
    category: '',
    duration: '',
    description: '',
    type: 'reel'
  }
];
