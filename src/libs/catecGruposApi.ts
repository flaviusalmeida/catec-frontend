'use client'

import { catecApiFetch } from '@/libs/catecApi'
import type {
  CatecGrupo,
  CatecGrupoCreateInput,
  CatecGrupoUpdateInput,
  CatecPermissaoCatalogo
} from '@/types/catec/grupoTypes'
import {
  parseCatecGrupo,
  parseCatecGrupoList,
  parseCatecPermissaoCatalogoList
} from '@/types/catec/grupoTypes'
import { mensagemErroApiFromBody } from '@/utils/catec/apiError'

async function readJsonBody(res: Response): Promise<unknown> {
  const text = await res.text()

  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function assertOk(res: Response, data: unknown, fallback: string): void {
  if (res.status === 403) {
    throw new Error('Você não tem permissão para gerenciar grupos de acesso.')
  }

  if (!res.ok) {
    throw new Error(mensagemErroApiFromBody(data, fallback, res.status))
  }
}

export async function listarGruposCatec(): Promise<CatecGrupo[]> {
  const res = await catecApiFetch('/api/v1/admin/grupos')
  const data = await readJsonBody(res)

  assertOk(res, data, 'Não foi possível carregar os grupos.')

  return parseCatecGrupoList(data)
}

export async function obterGrupoCatec(id: number): Promise<CatecGrupo> {
  const res = await catecApiFetch(`/api/v1/admin/grupos/${id}`)
  const data = await readJsonBody(res)

  assertOk(res, data, 'Não foi possível carregar o grupo.')

  return parseCatecGrupo(data)
}

export async function listarPermissoesCatalogoCatec(): Promise<CatecPermissaoCatalogo[]> {
  const res = await catecApiFetch('/api/v1/admin/grupos/permissoes')
  const data = await readJsonBody(res)

  assertOk(res, data, 'Não foi possível carregar o catálogo de permissões.')

  return parseCatecPermissaoCatalogoList(data)
}

export async function criarGrupoCatec(body: CatecGrupoCreateInput): Promise<CatecGrupo> {
  const res = await catecApiFetch('/api/v1/admin/grupos', {
    method: 'POST',
    body: JSON.stringify({
      nome: body.nome,
      descricao: body.descricao,
      permissoes: body.permissoes
    })
  })

  const data = await readJsonBody(res)

  assertOk(res, data, 'Não foi possível criar o grupo.')

  return parseCatecGrupo(data)
}

export async function atualizarGrupoCatec(id: number, body: CatecGrupoUpdateInput): Promise<CatecGrupo> {
  const res = await catecApiFetch(`/api/v1/admin/grupos/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      nome: body.nome,
      descricao: body.descricao,
      ativo: body.ativo,
      permissoes: body.permissoes
    })
  })

  const data = await readJsonBody(res)

  assertOk(res, data, 'Não foi possível atualizar o grupo.')

  return parseCatecGrupo(data)
}

export async function excluirGrupoCatec(id: number): Promise<void> {
  const res = await catecApiFetch(`/api/v1/admin/grupos/${id}`, { method: 'DELETE' })
  const data = await readJsonBody(res)

  assertOk(res, data, 'Não foi possível excluir o grupo.')
}
