'use client'

import { catecApiFetch } from '@/libs/catecApi'
import { assertCatecOk, readCatecJsonBody } from '@/libs/catecApiHelpers'
import type {
  CatecAtividade,
  CatecAtividadeBoardColuna,
  CatecAtividadeBoardFiltros,
  CatecAtividadeComentario,
  CatecAtividadeCreateInput,
  CatecAtividadeDocumento,
  CatecAtividadeHistoricoItem,
  CatecAtividadeStatus,
  CatecAtividadeStatusPatchInput,
  CatecAtividadeUpdateInput
} from '@/types/catec/atividadeTypes'
import {
  parseCatecAtividade,
  parseCatecAtividadeBoard,
  parseCatecAtividadeComentario,
  parseCatecAtividadeComentarioList,
  parseCatecAtividadeDocumento,
  parseCatecAtividadeDocumentoList,
  parseCatecAtividadeHistoricoList,
  parseCatecAtividadeList
} from '@/types/catec/atividadeTypes'

function buildQuery(params: Record<string, string | number | null | undefined>): string {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === '') continue
    search.set(key, String(value))
  }

  const qs = search.toString()

  return qs ? `?${qs}` : ''
}

export async function obterBoardAtividadesCatec(
  filtros: CatecAtividadeBoardFiltros = {}
): Promise<CatecAtividadeBoardColuna[]> {
  const qs = buildQuery({
    projetoId: filtros.projetoId ?? undefined,
    responsavelId: filtros.responsavelId ?? undefined,
    q: filtros.q?.trim() || undefined
  })
  const res = await catecApiFetch(`/api/v1/atividades/board${qs}`)
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível carregar o board de atividades.')

  return parseCatecAtividadeBoard(data)
}

export async function listarAtividadesCatec(filtros: {
  projetoId?: number | null
  status?: CatecAtividadeStatus | null
  responsavelId?: number | null
  q?: string | null
} = {}): Promise<CatecAtividade[]> {
  const qs = buildQuery({
    projetoId: filtros.projetoId ?? undefined,
    status: filtros.status ?? undefined,
    responsavelId: filtros.responsavelId ?? undefined,
    q: filtros.q?.trim() || undefined
  })
  const res = await catecApiFetch(`/api/v1/atividades${qs}`)
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível carregar as atividades.')

  return parseCatecAtividadeList(data)
}

export async function listarAtividadesPorProjetoCatec(projetoId: number): Promise<CatecAtividade[]> {
  const res = await catecApiFetch(`/api/v1/projetos/${projetoId}/atividades`)
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível carregar as atividades do projeto.')

  return parseCatecAtividadeList(data)
}

export async function obterAtividadeCatec(id: number): Promise<CatecAtividade> {
  const res = await catecApiFetch(`/api/v1/atividades/${id}`)
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível carregar a atividade.')

  return parseCatecAtividade(data)
}

export async function criarAtividadeRaizCatec(
  projetoId: number,
  body: CatecAtividadeCreateInput
): Promise<CatecAtividade> {
  const res = await catecApiFetch(`/api/v1/projetos/${projetoId}/atividades`, {
    method: 'POST',
    body: JSON.stringify(body)
  })
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível criar a atividade.')

  return parseCatecAtividade(data)
}

export async function criarAtividadeFilhaCatec(
  paiId: number,
  body: CatecAtividadeCreateInput
): Promise<CatecAtividade> {
  const res = await catecApiFetch(`/api/v1/atividades/${paiId}/filhas`, {
    method: 'POST',
    body: JSON.stringify(body)
  })
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível criar a atividade filha.')

  return parseCatecAtividade(data)
}

export async function atualizarAtividadeCatec(
  id: number,
  body: CatecAtividadeUpdateInput
): Promise<CatecAtividade> {
  const res = await catecApiFetch(`/api/v1/atividades/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body)
  })
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível atualizar a atividade.')

  return parseCatecAtividade(data)
}

export async function alterarStatusAtividadeCatec(
  id: number,
  body: CatecAtividadeStatusPatchInput
): Promise<CatecAtividade> {
  const res = await catecApiFetch(`/api/v1/atividades/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(body)
  })
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível alterar o status da atividade.')

  return parseCatecAtividade(data)
}

export async function excluirAtividadeCatec(id: number): Promise<void> {
  const res = await catecApiFetch(`/api/v1/atividades/${id}`, { method: 'DELETE' })
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível excluir a atividade.')
}

export async function listarDocumentosAtividadeCatec(atividadeId: number): Promise<CatecAtividadeDocumento[]> {
  const res = await catecApiFetch(`/api/v1/atividades/${atividadeId}/documentos`)
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível carregar os anexos.')

  return parseCatecAtividadeDocumentoList(data)
}

export async function uploadDocumentoAtividadeCatec(
  atividadeId: number,
  file: File
): Promise<CatecAtividadeDocumento> {
  const fd = new FormData()

  fd.append('file', file)

  const res = await catecApiFetch(`/api/v1/atividades/${atividadeId}/documentos`, {
    method: 'POST',
    body: fd
  })
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível anexar o arquivo.')

  return parseCatecAtividadeDocumento(data)
}

export async function excluirDocumentoAtividadeCatec(atividadeId: number, documentoId: number): Promise<void> {
  const res = await catecApiFetch(`/api/v1/atividades/${atividadeId}/documentos/${documentoId}`, {
    method: 'DELETE'
  })
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível remover o anexo.')
}

export async function listarComentariosAtividadeCatec(atividadeId: number): Promise<CatecAtividadeComentario[]> {
  const res = await catecApiFetch(`/api/v1/atividades/${atividadeId}/comentarios`)
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível carregar os comentários.')

  return parseCatecAtividadeComentarioList(data)
}

export async function criarComentarioAtividadeCatec(
  atividadeId: number,
  texto: string
): Promise<CatecAtividadeComentario> {
  const res = await catecApiFetch(`/api/v1/atividades/${atividadeId}/comentarios`, {
    method: 'POST',
    body: JSON.stringify({ texto })
  })
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível adicionar o comentário.')

  return parseCatecAtividadeComentario(data)
}

export async function excluirComentarioAtividadeCatec(atividadeId: number, comentarioId: number): Promise<void> {
  const res = await catecApiFetch(`/api/v1/atividades/${atividadeId}/comentarios/${comentarioId}`, {
    method: 'DELETE'
  })
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível excluir o comentário.')
}

export async function listarHistoricoAtividadeCatec(atividadeId: number): Promise<CatecAtividadeHistoricoItem[]> {
  const res = await catecApiFetch(`/api/v1/atividades/${atividadeId}/historico`)
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível carregar o histórico.')

  return parseCatecAtividadeHistoricoList(data)
}
