import { Heart, Smartphone, Megaphone, Briefcase, Zap, Cross, TrendingUp, Film } from 'lucide-react';
import React from 'react';

export interface ShootService {
  id: number;
  title: string;
  icon: any;
  description: string;
  features: string[];
  image: string;
  price: string;
  gradient: string;
}

export const shootServices: ShootService[] = [
  {
    id: 1,
    title: 'Wedding Shoot',
    icon: Heart,
    description: 'Complete wedding coverage with cinematic storytelling',
    features: ['Bridal shots & portraits', 'Ceremony coverage', 'Candid moments', 'Reception highlights', 'Drone footage', 'Same-day teaser video'],
    image: '/images/wedding%20edit.png',
    price: '5000 to 20000',
    gradient: 'from-rose-600 to-pink-600',
  },
  {
    id: 2,
    title: 'Insta & YouTube Video Shoot',
    icon: Smartphone,
    description: 'High-quality content creation for social platforms',
    features: ['ImageIcon Reels shoots', 'YouTube video production', 'B-roll footage', 'Multi-camera setup', 'Green screen sessions', 'Professional lighting'],
    image: '/images/reel%20edit.png',
    price: '2000 to 10000',
    gradient: 'from-pink-600 to-rose-600',
  },
  {
    id: 3,
    title: 'Commercial Shoot',
    icon: Megaphone,
    description: 'Professional ad and products',
    features: ['30-60 second ads', 'Product showcasing', 'Studio & location shoots'],
    image: '/images/Ai%20edit.png',
    price: '1000 to 20000',
    gradient: 'from-orange-600 to-yellow-600',
  },
  {
    id: 4,
    title: 'Corporate Event Shoot',
    icon: Briefcase,
    description: 'Professional coverage of corporate events and conferences',
    features: ['Multi-camera coverage', 'Speaker & presentation footage', 'Crowd interactions', 'Venue setup videos', 'Highlight reel creation', 'Quick turnaround editing'],
    image: '/images/documentry%20image.png',
    price: '5000 to 30000',
    gradient: 'from-blue-600 to-cyan-600',
  },
  {
    id: 5,
    title: 'Marketing Shoot',
    icon: Zap,
    description: 'Strategic marketing video production for campaigns',
    features: ['Tutorial content', 'Explainer videos', 'Multi-format delivery'],
    image: '/images/vlog-image.png',
    price: '1000 to 10000',
    gradient: 'from-purple-600 to-violet-600',
  },
  {
    id: 6,
    title: 'Religious Shoot',
    icon: Cross,
    description: 'Respectful coverage of religious ceremonies and events',
    features: ['Pooja & ritual coverage', 'Prayer sessions', 'Devotional content', 'Sermon recordings', 'Sacred moment capture', 'Culturally sensitive editing'],
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=1000',
    price: '1000 to 10000',
    gradient: 'from-amber-600 to-orange-600',
  },
  {
    id: 7,
    title: 'Political Shoot',
    icon: TrendingUp,
    description: 'Campaign and political event video production',
    features: ['Rally coverage', 'Candidate interviews', 'Campaign messaging', 'Crowd reactions', 'Political ads', 'Documentary style editing'],
    image: 'https://images.unsplash.com/photo-1540575467063-178f50002e59?auto=format&fit=crop&q=80&w=1000',
    price: '2000 to 20000',
    gradient: 'from-red-600 to-orange-600',
  },
  {
    id: 8,
    title: 'Cinematic Shoot',
    icon: Film,
    description: 'High-end cinematic production with Hollywood-style quality',
    features: ['4K/8K resolution', 'Drone cinematography', 'Color graded footage', 'Professional sound recording', 'Visual effects ready', 'Cinema camera equipment'],
    image: '/images/documentry%20image.png',
    price: '3000 to 30000',
    gradient: 'from-purple-600 to-pink-600',
  },
];
