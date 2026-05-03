import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LanguageProvider } from '@/lib/i18n';
import ZenithClientWrapper from '@/components/ZenithClientWrapper';
import AccessibilitySuite from '@/components/AccessibilitySuite';
import { Partytown } from '@builder.io/partytown/react';

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  adjustFontFallback: true,
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'VoteIQ | The Interactive Civic Engine',
  description: 'An educational platform simulating the end-to-end voting process for citizens.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Singularity Node 1: Speculation Rules API (Native Prerendering) */}
        <script
          type="speculationrules"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              prerender: [
                {
                  source: 'list',
                  urls: ['/dashboard', '/about'],
                  score: 0.9,
                },
              ],
              prefetch: [
                {
                  source: 'list',
                  urls: ['/api/vote'],
                  score: 0.8,
                },
              ],
            }),
          }}
        />

        <link rel="preconnect" href="https://maps.googleapis.com" />
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <Partytown debug={false} forward={['dataLayer.push']} />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen flex flex-col`}
      >
        <ZenithClientWrapper>
          <LanguageProvider>
            <AccessibilitySuite />
            <Navbar />
            <main id="main-content" className="flex-grow">
              {children}
            </main>
            <Footer />
          </LanguageProvider>
        </ZenithClientWrapper>
      </body>
    </html>
  );
}
