'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useRef } from 'react';

/**
 * IntentLink (Efficiency Node 3)
 * Preloads dynamic routes or components when the user hovers with intent.
 */
interface IntentLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function IntentLink({ href, children, className }: IntentLinkProps): React.JSX.Element {
  const router = useRouter();
  const prefetchTimeout = useRef<NodeJS.Timeout | null>(null);

  const onMouseEnter = useCallback(() => {
    // 100ms threshold for "Intent"
    prefetchTimeout.current = setTimeout(() => {
      router.prefetch(href);
      console.warn(`[Zenith Efficiency] Intent detected: Preloading ${href}`);
    }, 100);
  }, [href, router]);

  const onMouseLeave = useCallback(() => {
    if (prefetchTimeout.current) {
      clearTimeout(prefetchTimeout.current);
    }
  }, []);

  return (
    <a 
      href={href} 
      className={className} 
      onMouseEnter={onMouseEnter} 
      onMouseLeave={onMouseLeave}
      onClick={(e) => {
        e.preventDefault();
        router.push(href);
      }}
    >
      {children}
    </a>
  );
}
