import { catecApiFetch } from '@/libs/catecApi'
import { assertCatecOk, readCatecJsonBody } from '@/libs/catecApiHelpers'
import type {
  CatecAssinaturaConfig,
  CatecAssinaturaConfigUpdate,
  CatecAssinaturaTesteConexao,
  CatecSignatarioCatec,
  CatecUsuarioCandidatoSignatario
} from '@/types/catec/assinaturaTypes'
import {
  parseCatecAssinaturaConfig,
  parseCatecAssinaturaTesteConexao,
  parseCatecSignatarioCatec,
  parseCatecUsuariosCandidatosSignatario
} from '@/types/catec/assinaturaTypes'

export async function obterAssinaturaConfigCatec(): Promise<CatecAssinaturaConfig> {
  const res = await catecApiFetch('/api/v1/assinatura/config')
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível carregar a configuração de assinatura.')

  return parseCatecAssinaturaConfig(data)
}

export async function atualizarAssinaturaConfigCatec(
  payload: CatecAssinaturaConfigUpdate
): Promise<CatecAssinaturaConfig> {
  const res = await catecApiFetch('/api/v1/assinatura/config', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível salvar a configuração de assinatura.')

  return parseCatecAssinaturaConfig(data)
}

export async function testarConexaoAssinaturaCatec(): Promise<CatecAssinaturaTesteConexao> {
  const res = await catecApiFetch('/api/v1/assinatura/config/testar-conexao', { method: 'POST' })
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível testar a conexão com o provedor.')

  return parseCatecAssinaturaTesteConexao(data)
}

export async function listarUsuariosCandidatosAssinaturaCatec(
  q?: string
): Promise<CatecUsuarioCandidatoSignatario[]> {
  const query = q?.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''
  const res = await catecApiFetch(`/api/v1/assinatura/config/usuarios-candidatos${query}`)
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível carregar os usuários CATEC.')

  return parseCatecUsuariosCandidatosSignatario(data)
}

export async function listarUsuariosDisponiveisSignatarioCatec(): Promise<CatecUsuarioCandidatoSignatario[]> {
  return listarUsuariosCandidatosAssinaturaCatec()
}

export async function adicionarSignatarioCatec(usuarioId: number): Promise<CatecSignatarioCatec> {
  const res = await catecApiFetch('/api/v1/assinatura/config/signatarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuarioId })
  })

  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível adicionar o responsável CATEC.')

  return parseCatecSignatarioCatec(data)
}

export async function atualizarSignatarioCatec(
  id: number,
  payload: { ativo?: boolean; ordem?: number }
): Promise<CatecSignatarioCatec> {
  const res = await catecApiFetch(`/api/v1/assinatura/config/signatarios/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível atualizar o responsável CATEC.')

  return parseCatecSignatarioCatec(data)
}

export async function removerSignatarioCatec(id: number): Promise<void> {
  const res = await catecApiFetch(`/api/v1/assinatura/config/signatarios/${id}`, { method: 'DELETE' })
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível remover o responsável CATEC.')
}
