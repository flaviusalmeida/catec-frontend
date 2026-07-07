import type { Page } from '@playwright/test'
import { encode } from 'next-auth/jwt'

import { meAdministrativo, type CatecMeFixture } from '../fixtures/me'

const SESSION_COOKIE = 'next-auth.session-token'

export async function setCatecSession(page: Page, me: CatecMeFixture = meAdministrativo()) {
  const secret = process.env.NEXTAUTH_SECRET

  if (!secret) {
    throw new Error('NEXTAUTH_SECRET é obrigatório para e2e (defina em .env).')
  }

  const sessionToken = await encode({
    token: {
      sub: String(me.id),
      id: String(me.id),
      name: me.nome,
      email: me.email,
      accessToken: 'token-e2e',
      tokenType: 'Bearer',
      permissoes: me.permissoes,
      grupos: me.grupos,
      requerTrocaSenha: me.requerTrocaSenha,
      trocaSenhaObrigatoria: false
    },
    secret,
    maxAge: 30 * 24 * 60 * 60
  })

  await page.context().addCookies([
    {
      name: SESSION_COOKIE,
      value: sessionToken,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax'
    }
  ])
}
