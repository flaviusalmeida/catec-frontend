'use client'

import { catecApiFetch } from '@/libs/catecApi'
import { assertCatecOk, readCatecJsonBody } from '@/libs/catecApiHelpers'
import { aprovarPropostaSocioCatec, devolverPropostaSocioCatec } from '@/libs/catecSocioPropostasApi'
import type {
  CatecAssinatura,
  CatecAssinaturaProviderInfo,
  CatecEnviarAssinaturaPayload,
  CatecSignatarioDisponivel
} from '@/types/catec/assinaturaTypes'
import {
  parseCatecAssinatura,
  parseCatecAssinaturaProviderInfo,
  parseCatecSignatariosDisponiveis
} from '@/types/catec/assinaturaTypes'
import type {
  CatecContrato,
  CatecDocumentoAnexo,
  CatecHistoricoPage,
  CatecInteracaoTimelineItem,
  CatecProposta,
  CatecPropostaWorkflowActionKey,
  CatecTipoInteracaoFluxo
} from '@/types/catec/servicoFluxoTypes'
import {
  parseCatecContrato,
  parseCatecDocumentoAnexo,
  parseCatecHistoricoFluxoItem,
  parseCatecPropostaList,
  STATUS_PROPOSTA_RESPOSTA_CLIENTE,
  TIPO_INTERACAO_ROTULO_CONTRATO,
  TIPO_INTERACAO_ROTULO_PROPOSTA
} from '@/types/catec/servicoFluxoTypes'
import type {
  CatecServico,
  CatecServicoCreateInput,
  CatecServicoPainel,
  CatecServicoResumo,
  CatecServicoUpdateInput
} from '@/types/catec/servicoTypes'
import { parseCatecServico, parseCatecServicoList, parseCatecServicoPainel, parseCatecServicoResumo } from '@/types/catec/servicoTypes'

import { formatarDataHora } from '@/views/catec/servicos/servicoFluxoHelpers'

type InteracaoApi = {
  id: number
  tipoInteracao: CatecTipoInteracaoFluxo
  texto: string
  origem?: string | null
  registradoPorNome: string
  criadoEm: string
}

function rotuloOrigemResposta(origem: string | null | undefined): string | null {
  if (origem === 'ASSINATURA_ELETRONICA') return 'Assinatura eletrônica'
  if (origem === 'MANUAL') return 'Manual'

  return null
}

function rotuloInteracao(tipo: CatecTipoInteracaoFluxo, origem: 'PROPOSTA' | 'CONTRATO'): string {
  return origem === 'CONTRATO' ? TIPO_INTERACAO_ROTULO_CONTRATO[tipo] : TIPO_INTERACAO_ROTULO_PROPOSTA[tipo]
}

export async function listarServicosCatec(): Promise<CatecServico[]> {
  const res = await catecApiFetch('/api/v1/servicos')
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível carregar os servicos.')

  return parseCatecServicoList(data)
}

export async function obterServicosResumoCatec(): Promise<CatecServicoResumo> {
  const res = await catecApiFetch('/api/v1/servicos/resumo')
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível carregar o resumo dos servicos.')

  return parseCatecServicoResumo(data)
}

export async function obterServicosPainelCatec(): Promise<CatecServicoPainel> {
  const res = await catecApiFetch('/api/v1/servicos/painel')
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível carregar o painel de servicos.')

  return parseCatecServicoPainel(data)
}

export async function obterServicoCatec(id: number): Promise<CatecServico> {
  const res = await catecApiFetch(`/api/v1/servicos/${id}`)
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível carregar o servico.')

  return parseCatecServico(data)
}

export async function criarServicoCatec(body: CatecServicoCreateInput): Promise<CatecServico> {
  const res = await catecApiFetch('/api/v1/servicos', {
    method: 'POST',
    body: JSON.stringify(body)
  })

  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível criar o servico.')

  return parseCatecServico(data)
}

export async function atualizarServicoCatec(id: number, body: CatecServicoUpdateInput): Promise<CatecServico> {
  const res = await catecApiFetch(`/api/v1/servicos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body)
  })

  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível atualizar o servico.')

  return parseCatecServico(data)
}

export async function excluirServicoCatec(id: number): Promise<void> {
  const res = await catecApiFetch(`/api/v1/servicos/${id}`, { method: 'DELETE' })
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível excluir o servico.')
}

export async function associarClienteServicoCatec(id: number, clienteId: number): Promise<CatecServico> {
  const res = await catecApiFetch(`/api/v1/servicos/${id}/cliente`, {
    method: 'PUT',
    body: JSON.stringify({ clienteId })
  })

  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível associar o cliente.')

  return parseCatecServico(data)
}

export async function listarPropostasCatec(servicoId: number): Promise<CatecProposta[]> {
  const res = await catecApiFetch(`/api/v1/servicos/${servicoId}/propostas`)
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível carregar as propostas.')

  return parseCatecPropostaList(data)
}

export async function listarDocumentosPropostaCatec(
  servicoId: number,
  propostaId: number
): Promise<CatecDocumentoAnexo[]> {
  const res = await catecApiFetch(`/api/v1/servicos/${servicoId}/propostas/${propostaId}/documentos`)
  const data = await readCatecJsonBody(res)

  if (!res.ok) return []

  if (!Array.isArray(data)) return []

  return data.map(parseCatecDocumentoAnexo)
}

export async function uploadDocumentoPropostaCatec(
  servicoId: number,
  propostaId: number | null,
  file: File
): Promise<void> {
  const fd = new FormData()

  fd.append('file', file)
  fd.append('tipoArquivo', 'PROPOSTA_COMERCIAL')

  const path =
    propostaId != null
      ? `/api/v1/servicos/${servicoId}/propostas/${propostaId}/documentos`
      : `/api/v1/servicos/${servicoId}/propostas/documentos`

  const res = await catecApiFetch(path, { method: 'POST', body: fd })
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Erro no upload da proposta.')
}

export async function acaoPropostaCatec(
  servicoId: number,
  propostaId: number,
  acao: CatecPropostaWorkflowActionKey,
  opts?: { observacao?: string }
): Promise<void> {
  if (acao === 'solicitar-revisao') {
    const res = await catecApiFetch(
      `/api/v1/servicos/${servicoId}/propostas/${propostaId}/submeter-avaliacao-socio`,
      { method: 'POST' }
    )

    const data = await readCatecJsonBody(res)

    assertCatecOk(res, data, 'Não foi possível enviar para avaliação.')

    return
  }

  if (acao === 'aprovar-socio') {
    await aprovarPropostaSocioCatec(propostaId, {
      servicoId,
      observacao: opts?.observacao
    })

    return
  }

  if (acao === 'reprovar-socio') {
    await devolverPropostaSocioCatec(propostaId, {
      servicoId,
      observacao: opts?.observacao ?? ''
    })

    return
  }

  const pathMap: Record<Exclude<CatecPropostaWorkflowActionKey, 'solicitar-revisao' | 'aprovar-socio' | 'reprovar-socio'>, string> = {
    'enviar-cliente': '/enviar-cliente'
  }

  const res = await catecApiFetch(`/api/v1/servicos/${servicoId}/propostas/${propostaId}${pathMap[acao as 'enviar-cliente']}`, {
    method: 'POST'
  })

  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Ação não concluída.')
}

export async function listarContratosCatec(servicoId: number): Promise<CatecContrato[]> {
  const res = await catecApiFetch(`/api/v1/servicos/${servicoId}/contratos`)
  const data = await readCatecJsonBody(res)

  if (!res.ok) return []

  if (!Array.isArray(data)) return []

  return data.map(parseCatecContrato)
}

export async function listarDocumentosContratoCatec(
  servicoId: number,
  contratoId: number
): Promise<CatecDocumentoAnexo[]> {
  const res = await catecApiFetch(`/api/v1/servicos/${servicoId}/contratos/${contratoId}/documentos`)
  const data = await readCatecJsonBody(res)

  if (!res.ok) return []

  if (!Array.isArray(data)) return []

  return data.map(parseCatecDocumentoAnexo)
}

export async function uploadDocumentoContratoCatec(
  servicoId: number,
  contratoId: number | null,
  file: File
): Promise<void> {
  const fd = new FormData()

  fd.append('file', file)
  fd.append('tipoArquivo', 'CONTRATO')

  const path =
    contratoId != null
      ? `/api/v1/servicos/${servicoId}/contratos/${contratoId}/documentos`
      : `/api/v1/servicos/${servicoId}/contratos/documentos`

  const res = await catecApiFetch(path, { method: 'POST', body: fd })
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Erro no upload do contrato.')
}

export async function enviarContratoClienteCatec(
  servicoId: number,
  contratoId: number,
  prazos: { prazoInicioExecucaoDias: number; prazoConclusaoDias: number }
): Promise<void> {
  const res = await catecApiFetch(
    `/api/v1/servicos/${servicoId}/contratos/${contratoId}/enviar-cliente`,
    {
      method: 'POST',
      body: JSON.stringify(prazos)
    }
  )

  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível enviar o contrato.')
}

export async function obterAssinaturaProviderInfoCatec(
  servicoId: number,
  contratoId: number
): Promise<CatecAssinaturaProviderInfo> {
  const res = await catecApiFetch(
    `/api/v1/servicos/${servicoId}/contratos/${contratoId}/assinatura/provider`
  )

  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível consultar o provedor de assinatura.')

  return parseCatecAssinaturaProviderInfo(data)
}

export async function obterAssinaturaContratoCatec(
  servicoId: number,
  contratoId: number
): Promise<CatecAssinatura> {
  const res = await catecApiFetch(`/api/v1/servicos/${servicoId}/contratos/${contratoId}/assinatura`)
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível obter o status da assinatura.')

  return parseCatecAssinatura(data)
}

export async function listarSignatariosAssinaturaCatec(
  servicoId: number,
  contratoId: number
): Promise<CatecSignatarioDisponivel[]> {
  const res = await catecApiFetch(
    `/api/v1/servicos/${servicoId}/contratos/${contratoId}/assinatura/signatarios`
  )

  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível listar os e-mails para assinatura.')

  return parseCatecSignatariosDisponiveis(data)
}

export async function enviarAssinaturaContratoCatec(
  servicoId: number,
  contratoId: number,
  payload: CatecEnviarAssinaturaPayload
): Promise<CatecAssinatura> {
  const res = await catecApiFetch(
    `/api/v1/servicos/${servicoId}/contratos/${contratoId}/assinatura/enviar`,
    {
      method: 'POST',
      body: JSON.stringify(payload)
    }
  )

  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível enviar o contrato para assinatura.')

  return parseCatecAssinatura(data)
}

export async function atualizarStatusAssinaturaContratoCatec(
  servicoId: number,
  contratoId: number
): Promise<CatecAssinatura> {
  const res = await catecApiFetch(
    `/api/v1/servicos/${servicoId}/contratos/${contratoId}/assinatura/atualizar-status`,
    { method: 'POST' }
  )

  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível atualizar o status da assinatura.')

  return parseCatecAssinatura(data)
}

async function listarInteracoesPropostaCatec(
  servicoId: number,
  proposta: CatecProposta
): Promise<CatecInteracaoTimelineItem[]> {
  const res = await catecApiFetch(`/api/v1/servicos/${servicoId}/propostas/${proposta.id}/interacoes`)
  const data = await readCatecJsonBody(res)

  if (!res.ok || !Array.isArray(data)) return []

  return (data as InteracaoApi[]).map(i => ({
    key: `P-${i.id}`,
    titulo: rotuloInteracao(i.tipoInteracao, 'PROPOSTA'),
    meta: [i.registradoPorNome, formatarDataHora(i.criadoEm), rotuloOrigemResposta(i.origem), `proposta v${proposta.versao}`]
      .filter(Boolean)
      .join(' · '),
    texto: i.texto,
    criadoEm: i.criadoEm,
    origem: 'PROPOSTA' as const
  }))
}

async function listarInteracoesContratoCatec(
  servicoId: number,
  contratoId: number
): Promise<CatecInteracaoTimelineItem[]> {
  const res = await catecApiFetch(`/api/v1/servicos/${servicoId}/contratos/${contratoId}/interacoes`)
  const data = await readCatecJsonBody(res)

  if (!res.ok || !Array.isArray(data)) return []

  return (data as InteracaoApi[]).map(i => ({
    key: `C-${i.id}`,
    titulo: rotuloInteracao(i.tipoInteracao, 'CONTRATO'),
    meta: [i.registradoPorNome, formatarDataHora(i.criadoEm), rotuloOrigemResposta(i.origem), 'contrato']
      .filter(Boolean)
      .join(' · '),
    texto: i.texto,
    criadoEm: i.criadoEm,
    origem: 'CONTRATO' as const
  }))
}

export async function carregarInteracoesServicoCatec(
  servicoId: number,
  propostas: CatecProposta[],
  contrato: CatecContrato | null
): Promise<CatecInteracaoTimelineItem[]> {
  const timeline: CatecInteracaoTimelineItem[] = []

  for (const proposta of propostas) {
    timeline.push(...(await listarInteracoesPropostaCatec(servicoId, proposta)))
  }

  if (contrato) {
    timeline.push(...(await listarInteracoesContratoCatec(servicoId, contrato.id)))
  }

  timeline.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())

  return timeline
}

export async function registrarInteracaoPropostaCatec(
  servicoId: number,
  propostaId: number,
  tipoInteracao: CatecTipoInteracaoFluxo,
  texto: string
): Promise<void> {
  const res = await catecApiFetch(`/api/v1/servicos/${servicoId}/propostas/${propostaId}/interacoes`, {
    method: 'POST',
    body: JSON.stringify({ tipoInteracao, texto })
  })

  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Erro ao registrar interação.')
}

export async function registrarInteracaoContratoCatec(
  servicoId: number,
  contratoId: number,
  tipoInteracao: CatecTipoInteracaoFluxo,
  texto: string
): Promise<void> {
  const res = await catecApiFetch(`/api/v1/servicos/${servicoId}/contratos/${contratoId}/interacoes`, {
    method: 'POST',
    body: JSON.stringify({ tipoInteracao, texto })
  })

  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Erro ao registrar interação.')
}

export async function listarHistoricoServicoCatec(
  servicoId: number,
  page: number,
  size: number
): Promise<CatecHistoricoPage> {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  const res = await catecApiFetch(`/api/v1/servicos/${servicoId}/historico?${params}`)
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível carregar o histórico.')

  const body = data as Record<string, unknown>
  const content = Array.isArray(body.content) ? body.content.map(parseCatecHistoricoFluxoItem) : []

  return {
    content,
    page: Number(body.page ?? page),
    size: Number(body.size ?? size),
    totalElements: Number(body.totalElements ?? content.length),
    totalPages: Number(body.totalPages ?? 1)
  }
}

export async function carregarPropostasComDocumentosCatec(servicoId: number): Promise<CatecProposta[]> {
  const propostas = await listarPropostasCatec(servicoId)

  return Promise.all(
    propostas.map(async proposta => {
      const documentos = await listarDocumentosPropostaCatec(servicoId, proposta.id)

      return { ...proposta, documentos }
    })
  )
}

export async function carregarContratoComDocumentosCatec(servicoId: number): Promise<CatecContrato | null> {
  const contratos = await listarContratosCatec(servicoId)
  const contrato = contratos[0] ?? null

  if (!contrato) return null

  const documentos = await listarDocumentosContratoCatec(servicoId, contrato.id)

  return { ...contrato, documentos }
}

export function propostaParaRegistroInteracao(propostas: CatecProposta[]): CatecProposta | null {
  return propostas.find(p => STATUS_PROPOSTA_RESPOSTA_CLIENTE.includes(p.status)) ?? null
}

export function contratoParaRegistroInteracao(contrato: CatecContrato | null): CatecContrato | null {
  if (!contrato) return null

  return contrato.status === 'ENVIADO_AO_CLIENTE' ? contrato : null
}
