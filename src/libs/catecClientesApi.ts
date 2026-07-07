'use client'

import { catecApiFetch } from '@/libs/catecApi'
import { assertCatecOk, readCatecJsonBody } from '@/libs/catecApiHelpers'
import type { CatecCliente, CatecClienteRequest, CatecClienteResumo } from '@/types/catec/clienteTypes'
import { parseCatecCliente, parseCatecClienteList, parseCatecClienteResumo } from '@/types/catec/clienteTypes'

export async function listarClientesCatec(): Promise<CatecCliente[]> {
  const res = await catecApiFetch('/api/v1/admin/clientes')
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível carregar os clientes.', 'Você não tem permissão para acessar clientes.')

  return parseCatecClienteList(data)
}

export async function obterClientesResumoCatec(): Promise<CatecClienteResumo> {
  const res = await catecApiFetch('/api/v1/admin/clientes/resumo')
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível carregar o resumo dos clientes.', 'Você não tem permissão para acessar clientes.')

  return parseCatecClienteResumo(data)
}

export async function obterClienteCatec(id: number): Promise<CatecCliente> {
  const res = await catecApiFetch(`/api/v1/admin/clientes/${id}`)
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível carregar o cliente.')

  return parseCatecCliente(data)
}

export async function criarClienteCatec(body: CatecClienteRequest): Promise<CatecCliente> {
  const res = await catecApiFetch('/api/v1/admin/clientes', {
    method: 'POST',
    body: JSON.stringify(body)
  })

  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível criar o cliente.')

  return parseCatecCliente(data)
}

export async function atualizarClienteCatec(id: number, body: CatecClienteRequest): Promise<CatecCliente> {
  const res = await catecApiFetch(`/api/v1/admin/clientes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body)
  })

  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível atualizar o cliente.')

  return parseCatecCliente(data)
}

export async function excluirClienteCatec(id: number): Promise<void> {
  const res = await catecApiFetch(`/api/v1/admin/clientes/${id}`, { method: 'DELETE' })
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível excluir o cliente.')
}
