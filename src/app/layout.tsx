import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LanguageProvider } from '@/lib/i18n';
import ZenithClientWrapper from '@/components/ZenithClientWrapper';


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
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Fallback CSP for extra security on static exports/vercel */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://maps.googleapis.com; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com; img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com https://maps.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-src 'self' https://*.firebaseapp.com;"
        />

        {/* Efficiency optimizations: DNS & TCP Preconnects */}
        <link rel="preconnect" href="https://maps.googleapis.com" />
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://identitytoolkit.googleapis.com" />


      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen flex flex-col`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
        >
          Skip to main content
        </a>
        <ZenithClientWrapper>
          <LanguageProvider>
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
