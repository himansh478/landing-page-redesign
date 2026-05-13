export interface AIVideo {
  id: number;
  title: string;
  thumbnail: string;
  videoUrl: string;
  category: string;
  duration: string;
  description: string;
}

export const aiVideos: AIVideo[] = [
  {
    id: 1,
    title: 'sample 1 ',
    thumbnail: '/images/Ai edit.png',
    videoUrl: 'https://www.youtube.com/embed/_KcZp4nIvUY',
    category: 'Captions',
    duration: '5:30',
    description: 'Professional video with AI-generated captions automatically synchronized with audio.'
  },
  {
    id: 2,
    title: 'sample 2',
    thumbnail: '/images/Ai edit.png',
    videoUrl: 'https://www.youtube.com/embed/u3OyDaydIpw',
    category: 'Audio',
    duration: '3:45',
    description: 'Crystal clear audio processing using AI voice enhancement technology.'
  },
  {
    id: 3,
    title: 'sample 3',
    thumbnail: '/images/Ai edit.png',
    videoUrl: 'https://www.youtube.com/embed/F1yRHMKjJOo',
    category: 'Editing',
    duration: '4:20',
    description: 'AI intelligently identifies and optimizes scene transitions for perfect pacing.'
  },
  {
    id: 4,
    title: 'sample 4',
    thumbnail: '/images/Ai edit.png',
    videoUrl: 'https://www.youtube.com/embed/-TKslrccxo4',
    category: 'B-Roll',
    duration: '6:15',
    description: 'AI-generated B-roll seamlessly integrated with original footage.'
  },
  {
    id: 5,
    title: 'sample 5',
    thumbnail: '/images/Ai edit.png',
    videoUrl: 'https://www.youtube.com/embed/5y6R7LMUIQ0',
    category: 'Graphics',
    duration: '5:00',
    description: 'AI-created virtual characters and avatars bringing your content to life.'
  },
  {
    id: 6,
    title: 'sample 6',
    thumbnail: '/images/Ai edit.png',
    videoUrl: 'https://www.youtube.com/embed/SLqDBXW_QF8',
    category: 'Effects',
    duration: '4:30',
    description: 'Stunning AI-generated visuals and dynamic graphics elevating production quality.'
  },
];
