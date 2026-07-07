import { test, expect } from '@playwright/test'

import { setCatecSession } from './helpers/session'
import { mockUsuariosApi, type UsuarioMock } from './helpers/usuariosMock'

test('crud funcional básico na tela de usuários', async ({ page }) => {
  const agora = '2026-04-20T00:00:00Z'
  const usuarios: UsuarioMock[] = [
    {
      id: 1,
      nome: 'Administrador',
      email: 'admin@catec.local',
      telefone: null,
      ativo: true,
      requerTrocaSenha: false,
      grupos: ['ADMINISTRATIVO'],
      criadoEm: agora,
      atualizadoEm: agora
    }
  ]

  await setCatecSession(page)
  await mockUsuariosApi(page, { usuarios })

  await page.goto('/catec/usuarios')

  await expect(page.getByRole('heading', { name: 'Usuários' })).toBeVisible()

  await page.getByRole('button', { name: 'Novo usuário' }).click()

  const drawer = page.locator('.MuiDrawer-paper')

  await drawer.getByLabel('Nome').fill('Usuário E2E')
  await drawer.getByLabel('E-mail').fill('e2e@catec.local')
  await drawer.getByLabel('Telefone').fill('11999990000')
  await drawer.getByRole('button', { name: 'Criar' }).click()

  await expect(page.getByText('Usuário E2E')).toBeVisible()

  await page.getByRole('row', { name: /Usuário E2E/ }).click()
  await expect(page).toHaveURL(/\/catec\/usuarios\/view\/2/)

  await page.getByLabel('Nome').fill('Usuário E2E Editado')
  await page.getByRole('button', { name: 'Salvar alterações' }).click()

  await expect(page.getByText('Usuário E2E Editado')).toBeVisible()
})
