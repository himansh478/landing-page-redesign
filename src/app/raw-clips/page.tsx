'use client';

import { useEffect, useMemo, useState } from 'react';
import { getAllClips } from '@/app/actions/clips';
import { ClipCard } from '@/components/ClipCard';
import { UnlockModal } from '@/components/UnlockModal';
import { Film, Download, Zap, Lock } from 'lucide-react';
import { PageIntro, PageShell } from '@/components/editorial/PageIntro';
import { CtaBand } from '@/components/editorial/CtaBand';
import { Em } from '@/components/editorial/Showcase';
import { btnCoralOnInk, btnGhostOnInk } from '@/components/editorial/styles';

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
      setIsLoading(false);
    }
    load();
  }, []);

  // Derived from the filters (was state synced in an effect)
  const filtered = useMemo(() => {
    let result = clips;
    if (activeCategory !== 'All') {
      result = result.filter(c => c.category === activeCategory);
    }
    if (activeFilter === 'free') result = result.filter(c => c.is_free);
    if (activeFilter === 'paid') result = result.filter(c => !c.is_free);
    return result;
  }, [activeCategory, activeFilter, clips]);

  const freeCount = clips.filter(c => c.is_free).length;
  const paidCount = clips.filter(c => !c.is_free).length;

  const stats = [
    { value: <span className="tabular">{freeCount}</span>, label: 'Free Clips' },
    { value: <span className="tabular">{paidCount}+</span>, label: 'Premium Clips' },
    { value: '4K', label: 'RAW Quality' },
    { value: <span className="tabular">₹19</span>, label: 'Unlimited Access' },
  ];

  return (
    <>
      <PageShell>
        <PageIntro
          label="Raw Footage Library"
          note={
            <span className="inline-flex items-center gap-2">
              <span aria-hidden="true" className="rec-dot w-1.5 h-1.5 rounded-full bg-coral" />
              4K RAW
            </span>
          }
          title={['Download', 'Raw Clips']}
          lede={
            <>
              Professional <Em>4K RAW footage</Em> — weddings, cinematic, drone, commercial aur bahut kuch.
              Seedha color grade karo aur apne projects mein use karo.
            </>
          }
        />

        {/* Stats */}
        <dl className="mt-14 sm:mt-20 grid grid-cols-2 lg:grid-cols-4 border-t border-ink/20">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`py-6 sm:py-8 border-b border-ink/15 lg:border-b-0 ${i % 2 === 1 ? 'pl-5 sm:pl-8 border-l' : 'lg:pl-8'} ${i === 0 ? '!pl-0' : ''} ${i === 2 ? 'lg:border-l' : ''}`}
            >
              <dt className="slate text-ink/55 mb-3">{stat.label}</dt>
              <dd className="font-display font-extrabold text-ink tracking-[-0.04em] leading-none [font-size:clamp(2.25rem,1.6rem+2.4vw,4rem)]">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        {/* Filters */}
        <div className="sticky top-16 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mt-10 py-4 bg-ivory/90 backdrop-blur-md border-y border-ink/10">
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            {/* Category filter */}
            <div className="flex flex-wrap gap-2" role="group" aria-label="Category">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  aria-pressed={activeCategory === cat}
                  className={`h-9 px-3.5 rounded-[3px] text-sm font-semibold transition-colors duration-300 ${
                    activeCategory === cat
                      ? 'bg-ink text-ivory'
                      : 'border border-ink/20 text-ink/70 hover:border-ink hover:text-ink'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Free/Paid toggle */}
            <div className="inline-flex self-start md:self-auto bg-sand rounded-md p-1 gap-1" role="group" aria-label="Price">
              {(['all', 'free', 'paid'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveFilter(f)}
                  aria-pressed={activeFilter === f}
                  className={`h-8 px-4 rounded-[3px] text-sm font-semibold inline-flex items-center gap-1.5 transition-colors duration-300 ${
                    activeFilter === f
                      ? f === 'free' ? 'bg-coral text-ink' : f === 'paid' ? 'bg-editorial text-ivory' : 'bg-ink text-ivory'
                      : 'text-ink/65 hover:text-ink'
                  }`}
                >
                  {f === 'paid' && <Lock className="w-3.5 h-3.5" aria-hidden="true" />}
                  {f === 'free' ? 'Free' : f === 'paid' ? 'Paid' : 'All'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Clips Grid */}
        <section className="pt-10" aria-live="polite">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-paper ring-1 ring-ink/10 rounded-[4px] overflow-hidden animate-pulse motion-reduce:animate-none">
                  <div className="aspect-video bg-sand" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-sand rounded w-1/3" />
                    <div className="h-5 bg-sand rounded" />
                    <div className="h-4 bg-sand rounded w-2/3" />
                    <div className="h-11 bg-sand rounded-md mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 border-y border-ink/15">
              <Film className="w-8 h-8 mx-auto mb-4 text-ink/30" aria-hidden="true" />
              <p className="text-lg text-ink/65">Is category mein koi clip nahi hai abhi.</p>
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
        <CtaBand
          label="Unlimited Access — Sirf ₹19"
          title={['Saare Premium Clips', 'Unlock Karo']}
          body="Ek baar ₹19 pay karo, poori library access karo. Weddings, corporate, cinematic — sab kuch!"
          className="mt-24 sm:mt-32"
        >
          <button
            type="button"
            onClick={() => {
              setModalPrice(19);
              setShowUnlockModal(true);
            }}
            className={`${btnCoralOnInk} w-full sm:w-auto`}
          >
            <Download className="w-5 h-5" aria-hidden="true" />
            Abhi Unlock Karo @ ₹19
          </button>
          <button
            type="button"
            onClick={() => {
              setModalPrice(99);
              setShowUnlockModal(true);
            }}
            className={`${btnGhostOnInk} w-full sm:w-auto`}
          >
            <Zap className="w-5 h-5" aria-hidden="true" />
            Unlock ALL Clips @ ₹99
          </button>
        </CtaBand>
      </PageShell>

      {showUnlockModal && (
        <UnlockModal onClose={() => setShowUnlockModal(false)} price={modalPrice} />
      )}
    </>
  );
}
