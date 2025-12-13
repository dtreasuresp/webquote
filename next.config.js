/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  // Nota: la opción `eslint` en `next.config.js` ya no es soportada en Next.js 16.
  // Se eliminó `ignoreDuringBuilds` para evitar warnings en tiempo de ejecución.
  // Configure ESLint mediante archivos de configuración dedicados (.eslintrc) o scripts npm.
}

module.exports = nextConfig
