'use client'

import { getSession, signOut } from 'next-auth/react'

import { CATEC_LOGIN_PATH } from '@/utils/catec/authPaths'
import { CATEC_API_BASE_URL } from '@/libs/catecConfig'

type UnauthorizedHandler = () => void

let unauthorizedHandler: UnauthorizedHandler | null = null

/** Regista callback para 401 (ex.: logout + ir ao login). */
export function registerCatecUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler
}

export function resolveCatecApiUrl(path: string): string {
  return path.startsWith('http') ? path : `${CATEC_API_BASE_URL}${path}`
}

function isPublicAuthPath(path: string): boolean {
  const url = resolveCatecApiUrl(path)

  try {
    const { pathname } = new URL(url)

    return pathname === '/api/v1/auth/login'
  } catch {
    return path.includes('/api/v1/auth/login')
  }
}

/**
 * Cliente HTTP CATEC (browser): base URL, JSON por defeito, Bearer JWT da sessão NextAuth.
 * Em 401 (exceto login), dispara logout.
 */
export async function catecApiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const session = await getSession()
  const token = session?.user?.accessToken
  const headers = new Headers(init.headers)

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }

  if (init.body != null && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const url = resolveCatecApiUrl(path)
  const res = await fetch(url, { ...init, headers })

  if (res.status === 401 && !isPublicAuthPath(path)) {
    unauthorizedHandler?.()

    if (!unauthorizedHandler) {
      await signOut({ callbackUrl: CATEC_LOGIN_PATH })
    }
  }

  return res
}
