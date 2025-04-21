const nextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/Andrey-0367/test_task' : '',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig
