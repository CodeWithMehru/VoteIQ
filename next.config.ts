import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';

const nextConfig: NextConfig = {
  compress: true, 
  poweredByHeader: false,
  experimental: {
    optimizeCss: false, // Disabled to resolve 'critters' missing module crash
  },
  turbopack: {}, // Silences the Webpack config conflict error
  webpack: (config, { dev, isServer }) => {
    // Efficiency Node 20: Strict Bundle Size Budget (Webpack integration)
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
        ],
      },
    ];
  },
};

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig);
