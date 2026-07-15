'use client'

import { useEffect } from 'react'

import { usePathname, useRouter } from 'next/navigation'

import { getCatecLoginUrl, stripLocalePrefix } from '@/utils/catec/authPaths'

const AuthRedirect = () => {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const safePath = stripLocalePrefix(pathname)

    router.replace(getCatecLoginUrl(safePath === '/login' ? undefined : safePath))
  }, [pathname, router])

  return null
}

export default AuthRedirect
