import type { Metadata } from 'next';
import ContactUsClient from './ContactUsClient';

export const metadata: Metadata = {
  title: 'Contact Us — Book Cwaya Creative Services | Indore, Bhopal, Sehore',
  description: 'Get in touch with Cwaya for video editing, professional shoots, social media management, and web development. Call, email, or fill the form — we respond within 24 hours.',
  alternates: {
    canonical: 'https://www.cwaya.me/contact-us',
  },
};

export default function ContactUsPage() {
  return <ContactUsClient />;
}
