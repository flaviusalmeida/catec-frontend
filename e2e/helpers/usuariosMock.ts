import type { Page, Route } from '@playwright/test'

export type UsuarioMock = {
  id: number
  nome: string
  email: string
  telefone: string | null
  ativo: boolean
  requerTrocaSenha: boolean
  grupos: string[]
  criadoEm: string
  atualizadoEm: string
}

type Options = {
  usuarios: UsuarioMock[]
  onResetSenha?: (id: number) => void
}

function isListUrl(url: string): boolean {
  return /\/api\/v1\/admin\/usuarios\/?$/.test(new URL(url).pathname)
}

function isItemUrl(url: string): boolean {
  return /\/api\/v1\/admin\/usuarios\/\d+$/.test(new URL(url).pathname)
}

function isResetUrl(url: string): boolean {
  return /\/api\/v1\/admin\/usuarios\/\d+\/resetar-senha$/.test(new URL(url).pathname)
}

export async function mockUsuariosApi(page: Page, { usuarios, onResetSenha }: Options) {
  await page.route(/\/api\/v1\/admin\/usuarios\/?$/, async (route: Route) => {
    const request = route.request()

    if (request.method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(usuarios)
      })

      return
    }

    if (request.method() === 'POST') {
      const body = request.postDataJSON() as {
        nome: string
        email: string
        telefone: string | null
        grupos: string[]
      }

      const agora = new Date().toISOString()

      const novo: UsuarioMock = {
        id: usuarios.length + 1,
        nome: body.nome,
        email: body.email,
        telefone: body.telefone,
        ativo: false,
        requerTrocaSenha: true,
        grupos: body.grupos,
        criadoEm: agora,
        atualizadoEm: agora
      }

      usuarios.push(novo)
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(novo) })

      return
    }

    await route.fallback()
  })

  await page.route(/\/api\/v1\/admin\/usuarios\/\d+\/resetar-senha$/, async (route: Route) => {
    const request = route.request()
    const match = new URL(request.url()).pathname.match(/\/api\/v1\/admin\/usuarios\/(\d+)\/resetar-senha$/)
    const id = match ? Number(match[1]) : -1
    const idx = usuarios.findIndex(u => u.id === id)

    if (idx >= 0) {
      usuarios[idx] = {
        ...usuarios[idx],
        ativo: false,
        requerTrocaSenha: true,
        atualizadoEm: new Date().toISOString()
      }
      onResetSenha?.(id)
    }

    await route.fulfill({ status: 204, body: '' })
  })

  await page.route(/\/api\/v1\/admin\/usuarios\/\d+$/, async (route: Route) => {
    const request = route.request()
    const url = request.url()

    if (!isItemUrl(url) || isListUrl(url) || isResetUrl(url)) {
      await route.fallback()

      return
    }

    const match = new URL(url).pathname.match(/\/api\/v1\/admin\/usuarios\/(\d+)$/)
    const id = match ? Number(match[1]) : -1
    const idx = usuarios.findIndex(u => u.id === id)

    if (idx < 0) {
      await route.fulfill({ status: 404 })

      return
    }

    if (request.method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(usuarios[idx])
      })

      return
    }

    if (request.method() === 'PUT') {
      const body = request.postDataJSON() as {
        nome: string
        email: string
        telefone: string | null
        ativo: boolean
        grupos: string[]
      }

      usuarios[idx] = {
        ...usuarios[idx],
        nome: body.nome,
        email: body.email,
        telefone: body.telefone,
        ativo: body.ativo,
        grupos: body.grupos,
        atualizadoEm: new Date().toISOString()
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(usuarios[idx])
      })

      return
    }

    await route.fallback()
  })
}
