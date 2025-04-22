/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  generateBuildId: () => 'build-' + Date.now(),
  basePath: process.env.NODE_ENV === "production" ? "/test_task" : "",
  assetPrefix: process.env.NODE_ENV === "production" ? "/test_task/" : "",
  trailingSlash: true,
  images: {
    unoptimized: true, 
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fakestoreapi.com',
      },
    ],
  },
};


if (process.env.NODE_ENV === 'production') {
  const fs = require('fs');
  const path = require('path');
  
  nextConfig.webpack = (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new (class {
          apply(compiler) {
            compiler.hooks.afterEmit.tap('AfterEmitPlugin', () => {
              fs.writeFileSync(
                path.join(__dirname, 'out', '.nojekyll'), 
                ''
              );
            });
          }
        })()
      );
    }
    return config;
  };
}

module.exports = nextConfig;