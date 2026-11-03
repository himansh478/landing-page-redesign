'use client';

import { Eye, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { ServiceBookingForm } from '@/components/ServiceBookingForm';
import { ViewSamplesModal } from '@/components/ViewSamplesModal';
import { socialVideoHighlights } from '@/data/socialVideoHighlights';
import { PageIntro, PageShell } from '@/components/editorial/PageIntro';
import { CtaBand } from '@/components/editorial/CtaBand';
import { ClipGrid, ClipSection, VideoLightbox, type ShowcaseClip } from '@/components/editorial/Showcase';
import { btnArrow, btnCoralOnInk, btnGhostOnInk } from '@/components/editorial/styles';

export default function SocialVideoPortfolioPage() {
  const [selectedVideo, setSelectedVideo] = useState<ShowcaseClip | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSamplesModalOpen, setIsSamplesModalOpen] = useState(false);

  return (
    <>
      <PageShell>
        <PageIntro
          back={{ href: '/', label: 'Back to Home' }}
          note="High-Engagement Social Content"
          title={['Social', 'Portfolio']}
          lede="ImageIcon Reels and YouTube Shorts designed for maximum viral potential and engagement."
        />

        <ClipSection
          reel="Reel 01"
          title="Social Highlights"
          sub="Content that stops the scroll"
          count={socialVideoHighlights.length}
          className="mt-16 sm:mt-20"
        >
          <ClipGrid clips={socialVideoHighlights} format="vertical" onSelect={setSelectedVideo} />
        </ClipSection>

        <CtaBand
          title={['Go', 'Viral']}
          body="We specialize in creating unique visual content tailored to your specific requirements."
          className="mt-24 sm:mt-32"
        >
          <button type="button" onClick={() => setIsSamplesModalOpen(true)} className={`${btnGhostOnInk} w-full sm:w-auto`}>
            <Eye className="w-5 h-5" aria-hidden="true" />
            View Samples
          </button>
          <button type="button" onClick={() => setIsBookingModalOpen(true)} className={`${btnCoralOnInk} w-full sm:w-auto`}>
            Get Started
            <ArrowRight className={btnArrow} aria-hidden="true" />
          </button>
        </CtaBand>
      </PageShell>

      {/* video player */}
      <VideoLightbox clip={selectedVideo} format="vertical" onClose={() => setSelectedVideo(null)} />

      {/* booking modal */}
      <ServiceBookingForm
        isOpen={isBookingModalOpen}
        onOpenChange={setIsBookingModalOpen}
        selectedService="Insta & YouTube Video Shoot"
      />

      {/* samples modal */}
      <ViewSamplesModal
        isOpen={isSamplesModalOpen}
        onOpenChange={setIsSamplesModalOpen}
        shootType="Insta & YouTube Video Shoot"
      />
    </>
  );
}
