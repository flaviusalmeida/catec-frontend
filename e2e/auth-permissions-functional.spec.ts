import { test, expect } from '@playwright/test'

import { permissoesAdministrativo } from './fixtures/me'
import { setCatecSession } from './helpers/session'

test('redireciona para login quando não autenticado', async ({ page }) => {
  await page.goto('/catec/usuarios')
  await expect(page).toHaveURL(/\/login/)
})

test('redireciona para login quando a API retorna 401', async ({ page }) => {
  await setCatecSession(page)

  await page.route(/\/api\/v1\/admin\/usuarios\/?$/, async route => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ mensagem: 'Token inválido.' })
    })
  })

  await page.goto('/catec/usuarios')
  await expect(page).toHaveURL(/\/login/, { timeout: 15_000 })
})

test('mostra erro de permissão quando listagem retorna 403', async ({ page }) => {
  await setCatecSession(page, {
    id: 2,
    nome: 'Colaborador',
    email: 'colab@catec.local',
    grupos: ['ADMINISTRATIVO'],
    permissoes: [...permissoesAdministrativo],
    ativo: true,
    telefone: null,
    requerTrocaSenha: false
  })

  await page.route(/\/api\/v1\/admin\/usuarios\/?$/, async route => {
    await route.fulfill({
      status: 403,
      contentType: 'application/json',
      body: JSON.stringify({ mensagem: 'Acesso negado.' })
    })
  })

  await page.goto('/catec/usuarios')
  await expect(page.getByText('Você não tem permissão para gerenciar usuários.')).toBeVisible()
})
