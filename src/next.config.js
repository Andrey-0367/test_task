/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  modularizeImports: {
    '@reduxjs/toolkit': {
      transform: '@reduxjs/toolkit/dist/{{member}}',
    },
    'react-redux': {
      transform: 'react-redux/es/{{member}}',
    },
  },
  experimental: {
    swcPlugins: [
      ['next-superjson-plugin', {}]
    ],
    serverActions: true,
  },
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: ['fakestoreapi.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fakestoreapi.com',
        pathname: '/img/**',
      },
      {
        protocol: 'https',
        hostname: 'jsonplaceholder.typicode.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.example.com', 
      },
    ],
    minimumCacheTTL: 86400,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    config.resolve.alias = {
      ...config.resolve.alias,
      '@reduxjs/toolkit': '@reduxjs/toolkit/dist/index.js',
    };

    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;