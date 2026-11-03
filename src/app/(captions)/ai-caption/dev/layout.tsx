import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

// Test tools. They must not exist on a deployed site.
export default function DevLayout({ children }: { children: ReactNode }) {
  if (process.env.NODE_ENV !== 'development') notFound();
  return children;
}
