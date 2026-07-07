'use client'

import { catecApiFetch } from '@/libs/catecApi'
import { assertCatecOk, readCatecJsonBody } from '@/libs/catecApiHelpers'
import type {
  CatecAdminUsuario,
  CatecUsuarioCreateInput,
  CatecUsuarioUpdateInput
} from '@/types/catec/usuarioTypes'
import { parseCatecAdminUsuario, parseCatecAdminUsuarioList } from '@/types/catec/usuarioTypes'

export async function listarUsuariosCatec(): Promise<CatecAdminUsuario[]> {
  const res = await catecApiFetch('/api/v1/admin/usuarios')
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível carregar os usuários.', 'Você não tem permissão para gerenciar usuários.')

  return parseCatecAdminUsuarioList(data)
}

export async function obterUsuarioCatec(id: number): Promise<CatecAdminUsuario> {
  const res = await catecApiFetch(`/api/v1/admin/usuarios/${id}`)
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível carregar o usuário.')

  return parseCatecAdminUsuario(data)
}

export async function criarUsuarioCatec(body: CatecUsuarioCreateInput): Promise<CatecAdminUsuario> {
  const res = await catecApiFetch('/api/v1/admin/usuarios', {
    method: 'POST',
    body: JSON.stringify(body)
  })

  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível criar o usuário.')

  return parseCatecAdminUsuario(data)
}

export async function atualizarUsuarioCatec(id: number, body: CatecUsuarioUpdateInput): Promise<CatecAdminUsuario> {
  const res = await catecApiFetch(`/api/v1/admin/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body)
  })

  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível atualizar o usuário.')

  return parseCatecAdminUsuario(data)
}

export async function resetarSenhaUsuarioCatec(id: number): Promise<void> {
  const res = await catecApiFetch(`/api/v1/admin/usuarios/${id}/resetar-senha`, { method: 'POST' })
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível redefinir a senha.')
}
