/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  transpilePackages: ['react-markdown', 'remark-parse', 'unified', 'vfile', 'unist-util-visit'],
  experimental: {
    esmExternals: false,
  },
};

export default nextConfig;
