export interface PortfolioVideo {
  id: number;
  title: string;
  thumbnail: string;
  videoUrl: string;
  category: string;
  duration: string;
  description: string;
  type: string;
}

export const commercialHighlights: PortfolioVideo[] = [
  {
    id: 1,
    title: 'Commercial Sample 1',
    thumbnail: '/images/Ai%20edit.png',
    videoUrl: 'https://www.instagram.com/reel/DPd-UfYiO1e/embed/',
    category: 'Commercial',
    duration: '0:30',
    description: 'High-impact commercial shoot focusing on product details and brand messaging.',
    type: 'highlight'
  },
  {
    id: 2,
    title: 'Commercial Sample 2',
    thumbnail: '/images/Ai%20edit.png',
    videoUrl: 'https://www.instagram.com/reel/DOvjZH2DTJq/embed/',
    category: 'Ad',
    duration: '0:45',
    description: 'Cinematic advertisement with professional color grading and sound design.',
    type: 'highlight'
  }
];
