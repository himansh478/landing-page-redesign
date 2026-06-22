'use client';

import { useEffect, useState } from 'react';
import { getAllClips } from '@/app/actions/clips';
import { ClipCard } from '@/components/ClipCard';
import { UnlockModal } from '@/components/UnlockModal';
import { Film, Download, Zap, ChevronDown } from 'lucide-react';

const CATEGORIES = ['All', 'Wedding', 'Cinematic', 'Commercial', 'Corporate', 'Drone', 'Reel'];

interface Clip {
  id: string;
  title: string;
  category: string;
  description?: string;
  thumbnail_url: string;
  free_drive_url?: string;
  paid_drive_url?: string;
  duration?: string;
  tags?: string;
  is_free: boolean;
  download_count?: number;
}

// Demo clips shown when DB is empty
const DEMO_CLIPS: Clip[] = [
  {
    id: 'demo-1',
    title: 'Golden Hour Wedding Ceremony — Raw 4K',
    category: 'Wedding',
    description: 'Bhopal mein ek stunning golden hour wedding ceremony ke raw clips.',
    thumbnail_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
    free_drive_url: '#',
    duration: '01:24',
    tags: 'wedding, golden hour, outdoor',
    is_free: true,
    download_count: 142,
  },
  {
    id: 'demo-2',
    title: 'Cinematic Drone City Flyover — RAW Log',
    category: 'Drone',
    description: 'DJI Mavic 3 Pro se liya gaya D-Log M footage. Color grade ready.',
    thumbnail_url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80',
    free_drive_url: '#',
    duration: '00:58',
    tags: 'drone, aerial, cityscape',
    is_free: true,
    download_count: 89,
  },
  {
    id: 'demo-3',
    title: 'Commercial Product Shoot — Studio Lighting',
    category: 'Commercial',
    description: 'Professional studio lighting setup ke saath product shoot raw clips.',
    thumbnail_url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80',
    free_drive_url: '#',
    duration: '02:10',
    tags: 'commercial, product, studio',
    is_free: true,
    download_count: 67,
  },
  {
    id: 'demo-4',
    title: 'Slow Motion Water Drops — 120fps 4K',
    category: 'Cinematic',
    description: '120fps mein shoot kiye gaye stunning water drop clips. Editing ke liye perfect.',
    thumbnail_url: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=800&q=80',
    free_drive_url: '#',
    duration: '00:45',
    tags: 'slow motion, cinematic, water',
    is_free: true,
    download_count: 203,
  },
  {
    id: 'demo-5',
    title: 'Corporate Event Coverage — Sony A7IV LOG',
    category: 'Corporate',
    description: 'Full corporate event coverage — Sony A7IV S-Log3 mein shoot kiya gaya.',
    thumbnail_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    paid_drive_url: '#',
    duration: '05:30',
    tags: 'corporate, event, log footage',
    is_free: false,
    download_count: 45,
  },
  {
    id: 'demo-6',
    title: 'Wedding Reception Dance Floor — Low Light 4K',
    category: 'Wedding',
    description: 'Low light reception footage — Sony A7SIII se liya gaya stunning night footage.',
    thumbnail_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
    paid_drive_url: '#',
    duration: '03:15',
    tags: 'wedding, reception, low light',
    is_free: false,
    download_count: 78,
  },
  {
    id: 'demo-7',
    title: 'Instagram Reel B-Roll Pack — 20 Clips',
    category: 'Reel',
    description: '20 premium B-roll clips — reels aur shorts ke liye perfectly sized.',
    thumbnail_url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80',
    paid_drive_url: '#',
    duration: '08:00',
    tags: 'reel, broll, pack',
    is_free: false,
    download_count: 312,
  },
  {
    id: 'demo-8',
    title: 'Political Rally Crowd — Cinematic Angles',
    category: 'Commercial',
    description: 'Multiple angles se liye gaye high-energy political rally raw clips.',
    thumbnail_url: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80',
    paid_drive_url: '#',
    duration: '04:50',
    tags: 'political, crowd, cinematic',
    is_free: false,
    download_count: 56,
  },
];

export default function RawClipsPage() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [filtered, setFiltered] = useState<Clip[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeFilter, setActiveFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [modalPrice, setModalPrice] = useState(19);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await getAllClips();
      const clipsToShow = data.length > 0 ? data : DEMO_CLIPS;
      setClips(clipsToShow);
      setFiltered(clipsToShow);
      setIsLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    let result = clips;
    if (activeCategory !== 'All') {
      result = result.filter(c => c.category === activeCategory);
    }
    if (activeFilter === 'free') result = result.filter(c => c.is_free);
    if (activeFilter === 'paid') result = result.filter(c => !c.is_free);
    setFiltered(result);
  }, [activeCategory, activeFilter, clips]);

  const freeCount = clips.filter(c => c.is_free).length;
  const paidCount = clips.filter(c => !c.is_free).length;

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Hero */}
      <section className="relative pt-28 pb-20 px-4 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-10 w-[300px] h-[300px] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Film className="w-4 h-4" />
            Raw Footage Library
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Download{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Raw Clips
            </span>
          </h1>

          <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            Professional <span className="text-white font-semibold">4K RAW footage</span> — weddings, cinematic, drone, commercial aur bahut kuch. 
            Seedha color grade karo aur apne projects mein use karo.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 mb-10">
            <div className="text-center">
              <p className="text-4xl font-black text-green-400">{freeCount}</p>
              <p className="text-slate-400 text-sm mt-1">Free Clips</p>
            </div>
            <div className="w-px h-10 bg-slate-700" />
            <div className="text-center">
              <p className="text-4xl font-black text-indigo-400">{paidCount}+</p>
              <p className="text-slate-400 text-sm mt-1">Premium Clips</p>
            </div>
            <div className="w-px h-10 bg-slate-700" />
            <div className="text-center">
              <p className="text-4xl font-black text-amber-400">4K</p>
              <p className="text-slate-400 text-sm mt-1">RAW Quality</p>
            </div>
            <div className="w-px h-10 bg-slate-700" />
            <div className="text-center">
              <p className="text-4xl font-black text-purple-400">₹19</p>
              <p className="text-slate-400 text-sm mt-1">Unlimited Access</p>
            </div>
          </div>

          {/* Scroll hint */}
          <div className="flex flex-col items-center gap-2 text-slate-500 animate-bounce">
            <ChevronDown className="w-6 h-6" />
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="sticky top-16 z-30 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800 px-4 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Free/Paid toggle */}
          <div className="flex bg-slate-800 rounded-xl p-1 gap-1">
            {(['all', 'free', 'paid'] as const).map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-all ${
                  activeFilter === f
                    ? f === 'free' ? 'bg-green-500 text-white' : f === 'paid' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f === 'free' ? '✨ Free' : f === 'paid' ? '🔒 Paid' : 'All'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clips Grid */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-slate-800 rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-slate-700" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-700 rounded w-1/3" />
                  <div className="h-5 bg-slate-700 rounded" />
                  <div className="h-4 bg-slate-700 rounded w-2/3" />
                  <div className="h-10 bg-slate-700 rounded-xl mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <Film className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">Is category mein koi clip nahi hai abhi.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(clip => (
              <ClipCard key={clip.id} clip={clip} />
            ))}
          </div>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-slate-800 bg-gradient-to-b from-slate-950 to-indigo-950/30 py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 text-amber-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Zap className="w-4 h-4" />
            Unlimited Access — Sirf ₹19
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Saare Premium Clips Unlock Karo
          </h2>
          <p className="text-slate-400 mb-8">
            Ek baar ₹19 pay karo, poori library access karo. 
            Weddings, corporate, cinematic — sab kuch!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => {
                setModalPrice(19);
                setShowUnlockModal(true);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-indigo-900/50"
            >
              <Download className="w-5 h-5" />
              Abhi Unlock Karo @ ₹19
            </button>
            <button
              onClick={() => {
                setModalPrice(99);
                setShowUnlockModal(true);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-orange-900/50 border border-amber-400/30"
            >
              <Zap className="w-5 h-5" />
              Unlock ALL Clips @ ₹99
            </button>
          </div>
        </div>
      </section>

      {showUnlockModal && (
        <UnlockModal onClose={() => setShowUnlockModal(false)} price={modalPrice} />
      )}
    </div>
  );
}
