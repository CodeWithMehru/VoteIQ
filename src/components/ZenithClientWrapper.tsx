'use client';

import { useEffect } from 'react';
import { useZenithShortcuts } from '@/components/ZenithSystem';

function ServiceWorkerRegistry(): null {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => console.error('SW Failed:', err));
    }
  }, []);
  return null;
}

export default function ZenithClientWrapper({ children }: { children: React.ReactNode }): React.JSX.Element {
  useZenithShortcuts(); // Accessibility Node 16
  return (
    <>
      <ServiceWorkerRegistry />
      {children}
    </>
  );
}
