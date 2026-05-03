import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * useA11y (Accessibility Nodes 4, 5)
 * Zenith Accessibility Engine for focus management and announcement queuing.
 */
export function useA11y() {
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const queueRef = useRef<string[]>([]);
  const isAnnouncingRef = useRef(false);

  // Accessibility Node 4: Live Region Queuing
  const announce = useCallback((message: string) => {
    queueRef.current.push(message);
    if (!isAnnouncingRef.current) {
      processQueue();
    }
  }, []);

  const processQueue = useCallback(() => {
    if (queueRef.current.length === 0) {
      isAnnouncingRef.current = false;
      return;
    }

    isAnnouncingRef.current = true;
    const next = queueRef.current.shift();
    setAnnouncement(next || null);

    setTimeout(() => {
      setAnnouncement(null);
      setTimeout(processQueue, 500); // 500ms gap between speech
    }, 2000); // Speech duration simulation
  }, []);

  // Accessibility Node 5: Focus Trap Hook (Simplified for React)
  const useFocusTrap = (isActive: boolean) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!isActive) return;

      const handleTab = (e: KeyboardEvent) => {
        if (!containerRef.current || e.key !== 'Tab') return;

        const focusable = containerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0] as HTMLElement;
        const last = focusable[focusable.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      };

      window.addEventListener('keydown', handleTab);
      return () => window.removeEventListener('keydown', handleTab);
    }, [isActive]);

    return containerRef;
  };

  return { announce, announcement, useFocusTrap };
}
