'use client';

import { useEffect, useState } from 'react';
import { getAllClips } from '@/app/actions/clips';
import { ClipCard } from '@/components/ClipCard';
import { UnlockModal } from '@/components/UnlockModal';

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
];

export function RawClipsSection() {
  const [filtered, setFiltered] = useState<Clip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [modalPrice] = useState(19);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      try {
        const data = await getAllClips();
        const clipsToShow = data.length > 0 ? data : DEMO_CLIPS;
        if (mounted) {
          setFiltered(clipsToShow);
        }
      } catch {
        if (mounted) {
          setFiltered(DEMO_CLIPS);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="bg-paper border-t border-ink/10 py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6 border-t border-ink/20 pt-5 mb-8">
          <div>
            <p className="slate text-editorial mb-2">4K RAW library</p>
            <h2 className="font-display text-3xl font-extrabold text-ink tracking-[-0.03em]">Raw Clips</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-ivory ring-1 ring-ink/10 rounded-[4px] overflow-hidden animate-pulse motion-reduce:animate-none">
                <div className="aspect-video bg-sand" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-sand rounded w-1/3" />
                  <div className="h-5 bg-sand rounded" />
                </div>
              </div>
            ))
          ) : (
            filtered.slice(0, 8).map(clip => (
              <ClipCard key={clip.id} clip={clip} />
            ))
          )}
        </div>
      </div>

      {showUnlockModal && (
        <UnlockModal onClose={() => setShowUnlockModal(false)} price={modalPrice} />
      )}
    </section>
  );
}
