/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", 
  basePath: process.env.NODE_ENV === "production" ? "/test_task" : "", 
  assetPrefix: process.env.NODE_ENV === "production" ? "/test_task/" : "", 
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fakestoreapi.com',
      },
    ],
  },
};

module.exports = nextConfig;
