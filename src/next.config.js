const nextConfig = {
  output: 'export',
  basePath: '/test_task',
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fakestoreapi.com',
      },
    ],
  },
}

module.exports = nextConfig
