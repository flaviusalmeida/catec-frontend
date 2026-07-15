import { test, expect } from '@playwright/test'

import { setCatecSession } from './helpers/session'
import { mockUsuariosApi, type UsuarioMock } from './helpers/usuariosMock'

test('modal de reset: cancelar não chama endpoint e confirmar chama', async ({ page }) => {
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
    },
    {
      id: 2,
      nome: 'Usuario Reset',
      email: 'reset@catec.local',
      telefone: null,
      ativo: true,
      requerTrocaSenha: false,
      grupos: ['COLABORADOR'],
      criadoEm: agora,
      atualizadoEm: agora
    }
  ]

  let resetChamadas = 0

  await setCatecSession(page)
  await mockUsuariosApi(page, {
    usuarios,
    onResetSenha: () => {
      resetChamadas += 1
    }
  })

  await page.goto('/catec/usuarios/view/2')
  await expect(page.getByText('Usuario Reset')).toBeVisible()

  await page.getByRole('button', { name: 'Redefinir senha' }).click()
  await expect(page.getByText('Confirmar redefinição')).toBeVisible()

  await page.getByRole('button', { name: 'Cancelar' }).click()
  await expect(page.getByText('Confirmar redefinição')).not.toBeVisible()
  expect(resetChamadas).toBe(0)

  await page.getByRole('button', { name: 'Redefinir senha' }).click()
  await expect(page.getByText('Confirmar redefinição')).toBeVisible()
  await page.getByRole('button', { name: 'Confirmar' }).click()

  await expect(page.getByText('Nova senha provisória enviada por e-mail.')).toBeVisible()
  expect(resetChamadas).toBe(1)
})
