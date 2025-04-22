/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", 
  generateBuildId: () => 'build-' + Date.now(),
  onPostBuild: ({ outDir }) => {
    require('fs').writeFileSync(outDir + '/.nojekyll', '')
  },
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
