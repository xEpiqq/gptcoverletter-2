/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  module: {
    rules: [
      {
        test: /canvas\.node$/,
        use: 'ignore-loader',
      },
    ],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /canvas\.node$/,
      use: 'ignore-loader',
    });

    return config;
  },
};

module.exports = nextConfig;
