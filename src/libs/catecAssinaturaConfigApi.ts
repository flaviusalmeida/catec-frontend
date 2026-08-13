import { catecApiFetch } from '@/libs/catecApi'
import { assertCatecOk, readCatecJsonBody } from '@/libs/catecApiHelpers'
import type {
  CatecAssinaturaConfig,
  CatecAssinaturaConfigUpdate,
  CatecSignatarioCatec,
  CatecUsuarioCandidatoSignatario
} from '@/types/catec/assinaturaTypes'
import {
  parseCatecAssinaturaConfig,
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

export async function listarUsuariosDisponiveisSignatarioCatec(): Promise<CatecUsuarioCandidatoSignatario[]> {
  const res = await catecApiFetch('/api/v1/assinatura/config/usuarios-disponiveis')
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível carregar os usuários disponíveis.')

  return parseCatecUsuariosCandidatosSignatario(data)
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
