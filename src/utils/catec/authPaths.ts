import type { Session } from 'next-auth'

import themeConfig from '@configs/themeConfig'

export const CATEC_LOGIN_PATH = '/login'
export const CATEC_DEFINIR_SENHA_PATH = '/catec/definir-senha'

const LEGACY_LOCALE_PREFIX = /^\/(en|pt|ar|fr)(?=\/|$)/

/** Remove prefixos de locale do template Vuexy (/en, /pt, …). */
export function stripLocalePrefix(path: string): string {
  if (!path || path === '/') return path

  const normalized = path.startsWith('/') ? path : `/${path}`
  const stripped = normalized.replace(LEGACY_LOCALE_PREFIX, '')

  return stripped === '' ? '/' : stripped
}

export function needsTrocaSenha(session: Session | null): boolean {
  return session?.user?.requerTrocaSenha === true || session?.user?.trocaSenhaObrigatoria === true
}

export function getCatecLoginUrl(redirectTo?: string): string {
  if (!redirectTo) {
    return CATEC_LOGIN_PATH
  }

  const safeRedirect = stripLocalePrefix(redirectTo)

  return `${CATEC_LOGIN_PATH}?redirectTo=${encodeURIComponent(safeRedirect)}`
}

export function getCatecDefinirSenhaUrl(): string {
  return CATEC_DEFINIR_SENHA_PATH
}

export function getCatecHomeUrl(): string {
  return themeConfig.homePageUrl
}

export function getPostAuthDestination(session: Session, redirectTo?: string | null): string {
  if (needsTrocaSenha(session)) {
    return getCatecDefinirSenhaUrl()
  }

  if (redirectTo) {
    const safeRedirect = stripLocalePrefix(redirectTo.startsWith('/') ? redirectTo : `/${redirectTo}`)

    return safeRedirect
  }

  return getCatecHomeUrl()
}
