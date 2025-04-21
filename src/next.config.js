const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  basePath: process.env.NODE_ENV === 'production' ? '/test_task' : '',
  images: {
    unoptimized: true
  }
}
module.exports = nextConfig
