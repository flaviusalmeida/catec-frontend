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
