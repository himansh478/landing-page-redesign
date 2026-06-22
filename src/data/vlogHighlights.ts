export interface VlogVideo {
  id: number;
  title: string;
  thumbnail: string;
  videoUrl: string;
  category: string;
  duration: string;
  description: string;
  type: 'youtube' | 'reel';
}

export const youtubeVideos: VlogVideo[] = [
  {
    id: 1,
    title: 'Sample 1',
    videoUrl: 'https://www.youtube.com/embed/ycx5GzNAzRk',
    thumbnail: '/images/vlog-image.png',
    category: '',
    duration: '',
    description: '',
    type: 'youtube'
  },
  {
    id: 2,
    title: 'sample 2 ',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: '/images/vlog-image.png',
    category: '',
    duration: '',
    description: '',
    type: 'youtube'
  },
  {
    id: 3,
    title: 'sample 3',
    videoUrl: 'https://www.youtube.com/embed/ulTmnr_u_Ew?si=AS3-4qqjMV9A0qLr',
    thumbnail: '/images/vlog-image.png',
    category: '',
    duration: '',
    description: '',
    type: 'youtube'
  },
  {
    id: 4,
    title: 'sample 4',
    videoUrl: 'https://www.youtube.com/embed/tiQP9n2fEak?si=GCGcpIIjBGTe6Zzb',
    thumbnail: '/images/vlog-image.png',
    category: '',
    duration: '',
    description: '',
    type: 'youtube'
  },
];
