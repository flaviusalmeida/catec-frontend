import { catecApiFetch } from '@/libs/catecApi'
import { assertCatecOk, readCatecJsonBody } from '@/libs/catecApiHelpers'
import type { CatecPropostaPendenteSocio } from '@/types/catec/socioPropostaTypes'
import { parseCatecPropostaPendenteSocioList } from '@/types/catec/socioPropostaTypes'

export async function listarPropostasPendentesSocioCatec(): Promise<CatecPropostaPendenteSocio[]> {
  const res = await catecApiFetch('/api/v1/socio/propostas/pendentes')
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível carregar as propostas pendentes.')

  return parseCatecPropostaPendenteSocioList(data)
}

export async function aprovarPropostaSocioCatec(
  propostaId: number,
  body: { projetoId: number; observacao?: string }
): Promise<void> {
  const res = await catecApiFetch(`/api/v1/socio/propostas/${propostaId}/aprovar`, {
    method: 'POST',
    body: JSON.stringify(body)
  })

  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível aprovar a proposta.')
}

export async function devolverPropostaSocioCatec(
  propostaId: number,
  body: { projetoId: number; observacao: string }
): Promise<void> {
  const res = await catecApiFetch(`/api/v1/socio/propostas/${propostaId}/devolver`, {
    method: 'POST',
    body: JSON.stringify(body)
  })

  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível reprovar a proposta.')
}
