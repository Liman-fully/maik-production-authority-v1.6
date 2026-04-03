/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 启用standalone模式 - 优化部署大小
  output: 'standalone',
  // 压缩优化
  compress: true,
}

export default nextConfig
