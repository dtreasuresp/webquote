/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Para Netlify: usar standalone en lugar de export para evitar pre-render de rutas API
  output: 'standalone',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
