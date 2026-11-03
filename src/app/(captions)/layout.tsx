import type { ReactNode } from 'react';
import './captions.css';

export const metadata = { title: 'AI Captions | Cwaya' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
