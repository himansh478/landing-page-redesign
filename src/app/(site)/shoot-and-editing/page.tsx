'use client';

import { Em, ShowcaseClip, ShowcasePage } from '@/components/editorial/Showcase';

const makeClip = (id: number, code: string, title: string, category: string): ShowcaseClip => ({
  id,
  title,
  thumbnail: `https://api.microlink.io/?url=https://www.instagram.com/reel/${code}/&screenshot=true&meta=false&embed=screenshot.url`,
  videoUrl: `https://www.instagram.com/reel/${code}/embed`,
  category,
});

// 1. Shop Inauguration
const shopInaugurationReels: ShowcaseClip[] = [
  makeClip(1, 'DfPmKkRuJgx', 'Shop Inauguration Alpha', 'Shop Opening'),
  makeClip(2, 'DfH4PNZqcqe', 'Shop Inauguration Beta', 'Shop Opening'),
];

// 2. Birthday and Baby Welcome Shoot
const birthdayBabyReels: ShowcaseClip[] = [
  makeClip(3, 'DeefGRWtaGB', 'Birthday Celebration I', 'Birthday'),
  makeClip(4, 'DZ1njv7NzFt', 'Baby Welcome Ceremony I', 'Baby Welcome'),
  makeClip(5, 'DfXSfN3NWjZ', 'Birthday Celebration II', 'Birthday'),
  makeClip(6, 'Dd6dF6BN6k9', 'Baby Welcome Moments II', 'Baby Welcome'),
];

// 3. Car Delivery
const carDeliveryReels: ShowcaseClip[] = [
  makeClip(7, 'Ddx4-I6Sq6n', 'Car Delivery Premiere I', 'Car Delivery'),
  makeClip(8, 'DdDVWrnojz9', 'Car Delivery Premiere II', 'Car Delivery'),
  makeClip(9, 'DevrfwktTGK', 'Car Delivery Premiere III', 'Car Delivery'),
  makeClip(10, 'DfeCVKnC39y', 'Car Delivery Premiere IV', 'Car Delivery'),
];

// 4. Bike Delivery
const bikeDeliveryReels: ShowcaseClip[] = [
  makeClip(11, 'DeqiYoztyHD', 'Bike Delivery Rollout I', 'Bike Delivery'),
  makeClip(12, 'Ddu80QsyBSW', 'Bike Delivery Rollout II', 'Bike Delivery'),
  makeClip(13, 'DcNYAQHy2Nf', 'Bike Delivery Rollout III', 'Bike Delivery'),
];

// 5. Wedding Shoot
const weddingShootReels: ShowcaseClip[] = [
  makeClip(14, 'DZhPdlYINK6', 'Wedding Cinema I', 'Wedding'),
  makeClip(15, 'DYZpcz2N1ZI', 'Wedding Cinema II', 'Wedding'),
  makeClip(16, 'DX_Ly0dKEtP', 'Wedding Moments III', 'Wedding'),
  makeClip(17, 'DX8j6iRKwLZ', 'Wedding Celebration IV', 'Wedding'),
];

export default function ShootAndEditingPage() {
  return (
    <ShowcasePage
      back={{ href: '/', label: 'Back to Home' }}
      kicker="Cinematic Production & Post"
      title={['Shoot &', 'Editing.']}
      lede={
        <>
          Complete creative execution from <Em>precision camera capture</Em> to high-impact post-production. Explore our verified portfolio across categories.
        </>
      }
      sections={[
        {
          title: 'Shop Inauguration',
          sub: 'Store launches, ribbon cuttings, and grand commercial openings.',
          clips: shopInaugurationReels,
          format: 'vertical',
          player: 'vertical',
        },
        {
          title: 'Birthday & Baby Welcome Shoot',
          sub: 'Precious family milestones, birthday celebrations, and baby welcomes.',
          clips: birthdayBabyReels,
          format: 'vertical',
          player: 'vertical',
        },
        {
          title: 'Car Delivery',
          sub: 'High-energy vehicle unveilings and showroom delivery celebrations.',
          clips: carDeliveryReels,
          format: 'vertical',
          player: 'vertical',
        },
        {
          title: 'Bike Delivery',
          sub: 'Two-wheel delivery reveals, engine roar, and road-ready moments.',
          clips: bikeDeliveryReels,
          format: 'vertical',
          player: 'vertical',
        },
        {
          title: 'Wedding Shoot',
          sub: 'Emotional wedding ceremonies, sacred rituals, and royal receptions.',
          clips: weddingShootReels,
          format: 'vertical',
          player: 'vertical',
        },
      ]}
      cta={{
        label: 'Production Booking',
        title: ['Ready To', 'Book Your Shoot?'],
        body: "Ready to schedule your shoot and cinematic edit with our production crew? Let's initiate your project.",
      }}
      service="Shoot and Editing"
    />
  );
}
