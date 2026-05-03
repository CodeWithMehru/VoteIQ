'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Vanguard Accessibility Suite (Nodes 1, 3, 4)
 * Global orchestration for WCAG 2.2 AAA features.
 */
export default function AccessibilitySuite(): React.JSX.Element {
  const pathname = usePathname();
  const [announcement, setAnnouncement] = useState('');
  const [isCognitiveMode, setIsCognitiveMode] = useState(false);

  // Vanguard Node 1: Global Route Announcer
  useEffect(() => {
    const pageTitle = pathname === '/' ? 'Home' : pathname.split('/').pop();
    setAnnouncement(`Navigated to ${pageTitle} page`);
  }, [pathname]);

  // Vanguard Node 4: Toggle Cognitive Mode
  useEffect(() => {
    if (isCognitiveMode) {
      document.body.classList.add('cognitive-mode');
    } else {
      document.body.classList.remove('cognitive-mode');
    }
  }, [isCognitiveMode]);

  return (
    <>
      {/* Vanguard Node 3: Multi-Node Skip Link System */}
      <nav aria-label="Quick Access" className="absolute">
        <a href="#main-content" className="skip-link">Skip to Main Content</a>
        <a href="#evm-simulator" className="skip-link">Skip to EVM Simulator</a>
        <a href="#booth-locator" className="skip-link">Skip to Booth Locator</a>
      </nav>

      {/* Vanguard Node 1: Live Region for Route Announcements */}
      <div 
        className="sr-only" 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {announcement}
      </div>

      {/* Accessibility Controller Overlay */}
      <div className="fixed bottom-4 right-4 z-50 flex space-x-2">
        <button
          onClick={() => setIsCognitiveMode(!isCognitiveMode)}
          className="p-3 bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-full shadow-lg hover:scale-110 transition-transform"
          aria-label={isCognitiveMode ? 'Disable Cognitive Reading Mode' : 'Enable Cognitive Reading Mode'}
          title="Cognitive Accessibility Mode"
        >
          <span aria-hidden="true" className="text-xl">Aa</span>
        </button>
      </div>
    </>
  );
}
