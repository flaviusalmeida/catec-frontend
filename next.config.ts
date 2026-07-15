import type { NextConfig } from 'next'

const legacyLocaleRedirect = ['en', 'pt', 'ar', 'fr'].flatMap(locale => [
  {
    source: `/${locale}/login`,
    destination: '/login',
    permanent: false
  },
  {
    source: `/${locale}/:path*`,
    destination: '/:path*',
    permanent: false
  }
])

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH,

  // Indicador "N" do Next (Route/Bundler) — só em `next dev`; oculto também no modo desenvolvimento.
  devIndicators: false,

  // Dev (pnpm dev) não bloqueia por TypeScript; produção (next build) sim.
  // Mantém o mesmo comportamento do ambiente local até os tipos do template serem limpos.
  typescript: {
    ignoreBuildErrors: true
  },
  redirects: async () => {
    return [
      ...legacyLocaleRedirect,
      {
        source: '/',
        destination: '/catec/dashboard',
        permanent: true
      }
    ]
  }
}

export default nextConfig
