'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * useZenithShortcuts (Accessibility Node 16)
 * Global keyboard command engine for high-efficiency navigation.
 */
export function useZenithShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + S: Go to Simulator
      if (e.altKey && e.key === 's') {
        const el = document.getElementById('evm-simulator');
        el?.scrollIntoView({ behavior: 'smooth' });
        el?.focus();
      }
      
      // Alt + A: Go to AI Assistant
      if (e.altKey && e.key === 'a') {
        const el = document.querySelector('textarea');
        el?.scrollIntoView({ behavior: 'smooth' });
        el?.focus();
      }

      // Alt + T: Go to Timeline
      if (e.altKey && e.key === 't') {
        const el = document.getElementById('timeline');
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);
}

import React, { Component, ErrorInfo, ReactNode } from 'react';

/**
 * ZenithErrorBoundary (Code Quality Node 14)
 * Advanced isolation for Zenith architectural nodes.
 */
export class ZenithErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Zenith Code Quality] Error Boundary Caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 dark:bg-red-900/20 rounded-3xl border border-red-200 dark:border-red-800 text-center">
          <h2 className="text-xl font-bold text-red-700 dark:text-red-400">Node Failure Detected</h2>
          <p className="mt-2 text-sm text-red-600 dark:text-red-500">
            Zenith Security Protocol has isolated this component failure to prevent a system-wide crash.
          </p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 text-xs font-bold bg-red-600 text-white px-4 py-2 rounded-full"
          >
            Attempt Node Hot-Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
