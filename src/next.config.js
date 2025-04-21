const nextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/test_task' : '',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig