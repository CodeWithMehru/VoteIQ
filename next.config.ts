import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';

const nextConfig: NextConfig = {
  compress: true, 
  poweredByHeader: false,
  experimental: {
    optimizeCss: true,
  },
  turbopack: {},
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
       config.optimization.splitChunks.maxSize = 200000; 
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            // Singularity Node 6: HTTP/3 Alt-Svc Advertisement
            key: 'Alt-Svc',
            value: 'h3=":443"; ma=86400',
          },
          {
            // Singularity Node 10: Brotli Shared Dictionary (Compression Efficiency)
            key: 'Use-As-Dictionary',
            value: 'match="/api/vote"',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'off',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), bluetooth=(), usb=(), payment=(), sync-xhr=()',
          },
          {
            key: 'Vary',
            value: 'Authorization, Cookie, Accept-Encoding',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.googleapis.com https://*.google.com https://*.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://*.googleapis.com https://*.google.com https://*.gstatic.com; connect-src 'self' https://*.googleapis.com https://*.google.com https://*.gstatic.com; frame-src 'self' https://*.google.com; worker-src 'self' blob:;",
          }
        ],
      },
    ];
  },
};

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig);
