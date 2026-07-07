'use client'

import { catecApiFetch } from '@/libs/catecApi'
import { assertCatecOk, readCatecJsonBody } from '@/libs/catecApiHelpers'
import { aprovarPropostaSocioCatec, devolverPropostaSocioCatec } from '@/libs/catecSocioPropostasApi'
import type {
  CatecContrato,
  CatecDocumentoAnexo,
  CatecHistoricoPage,
  CatecInteracaoTimelineItem,
  CatecProposta,
  CatecPropostaWorkflowActionKey,
  CatecTipoInteracaoFluxo
} from '@/types/catec/projetoFluxoTypes'
import {
  parseCatecContrato,
  parseCatecDocumentoAnexo,
  parseCatecHistoricoFluxoItem,
  parseCatecPropostaList,
  STATUS_PROPOSTA_RESPOSTA_CLIENTE,
  TIPO_INTERACAO_ROTULO_CONTRATO,
  TIPO_INTERACAO_ROTULO_PROPOSTA
} from '@/types/catec/projetoFluxoTypes'
import type {
  CatecProjeto,
  CatecProjetoCreateInput,
  CatecProjetoPainel,
  CatecProjetoResumo,
  CatecProjetoUpdateInput
} from '@/types/catec/projetoTypes'
import { parseCatecProjeto, parseCatecProjetoList, parseCatecProjetoPainel, parseCatecProjetoResumo } from '@/types/catec/projetoTypes'

import { formatarDataHora } from '@/views/catec/projetos/projetoFluxoHelpers'

type InteracaoApi = {
  id: number
  tipoInteracao: CatecTipoInteracaoFluxo
  texto: string
  registradoPorNome: string
  criadoEm: string
}

function rotuloInteracao(tipo: CatecTipoInteracaoFluxo, origem: 'PROPOSTA' | 'CONTRATO'): string {
  return origem === 'CONTRATO' ? TIPO_INTERACAO_ROTULO_CONTRATO[tipo] : TIPO_INTERACAO_ROTULO_PROPOSTA[tipo]
}

export async function listarProjetosCatec(): Promise<CatecProjeto[]> {
  const res = await catecApiFetch('/api/v1/projetos')
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível carregar os projetos.')

  return parseCatecProjetoList(data)
}

export async function obterProjetosResumoCatec(): Promise<CatecProjetoResumo> {
  const res = await catecApiFetch('/api/v1/projetos/resumo')
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível carregar o resumo dos projetos.')

  return parseCatecProjetoResumo(data)
}

export async function obterProjetosPainelCatec(): Promise<CatecProjetoPainel> {
  const res = await catecApiFetch('/api/v1/projetos/painel')
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível carregar o painel de projetos.')

  return parseCatecProjetoPainel(data)
}

export async function obterProjetoCatec(id: number): Promise<CatecProjeto> {
  const res = await catecApiFetch(`/api/v1/projetos/${id}`)
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível carregar o projeto.')

  return parseCatecProjeto(data)
}

export async function criarProjetoCatec(body: CatecProjetoCreateInput): Promise<CatecProjeto> {
  const res = await catecApiFetch('/api/v1/projetos', {
    method: 'POST',
    body: JSON.stringify(body)
  })

  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível criar o projeto.')

  return parseCatecProjeto(data)
}

export async function atualizarProjetoCatec(id: number, body: CatecProjetoUpdateInput): Promise<CatecProjeto> {
  const res = await catecApiFetch(`/api/v1/projetos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body)
  })

  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível atualizar o projeto.')

  return parseCatecProjeto(data)
}

export async function associarClienteProjetoCatec(id: number, clienteId: number): Promise<CatecProjeto> {
  const res = await catecApiFetch(`/api/v1/projetos/${id}/cliente`, {
    method: 'PUT',
    body: JSON.stringify({ clienteId })
  })

  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível associar o cliente.')

  return parseCatecProjeto(data)
}

export async function listarPropostasCatec(projetoId: number): Promise<CatecProposta[]> {
  const res = await catecApiFetch(`/api/v1/projetos/${projetoId}/propostas`)
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível carregar as propostas.')

  return parseCatecPropostaList(data)
}

export async function listarDocumentosPropostaCatec(
  projetoId: number,
  propostaId: number
): Promise<CatecDocumentoAnexo[]> {
  const res = await catecApiFetch(`/api/v1/projetos/${projetoId}/propostas/${propostaId}/documentos`)
  const data = await readCatecJsonBody(res)

  if (!res.ok) return []

  if (!Array.isArray(data)) return []

  return data.map(parseCatecDocumentoAnexo)
}

export async function uploadDocumentoPropostaCatec(
  projetoId: number,
  propostaId: number | null,
  file: File
): Promise<void> {
  const fd = new FormData()

  fd.append('file', file)
  fd.append('tipoArquivo', 'PROPOSTA_COMERCIAL')

  const path =
    propostaId != null
      ? `/api/v1/projetos/${projetoId}/propostas/${propostaId}/documentos`
      : `/api/v1/projetos/${projetoId}/propostas/documentos`

  const res = await catecApiFetch(path, { method: 'POST', body: fd })
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Erro no upload da proposta.')
}

export async function acaoPropostaCatec(
  projetoId: number,
  propostaId: number,
  acao: CatecPropostaWorkflowActionKey,
  opts?: { observacao?: string }
): Promise<void> {
  if (acao === 'solicitar-revisao') {
    const res = await catecApiFetch(
      `/api/v1/projetos/${projetoId}/propostas/${propostaId}/submeter-avaliacao-socio`,
      { method: 'POST' }
    )

    const data = await readCatecJsonBody(res)

    assertCatecOk(res, data, 'Não foi possível enviar para avaliação.')

    return
  }

  if (acao === 'aprovar-socio') {
    await aprovarPropostaSocioCatec(propostaId, {
      projetoId,
      observacao: opts?.observacao
    })

    return
  }

  if (acao === 'reprovar-socio') {
    await devolverPropostaSocioCatec(propostaId, {
      projetoId,
      observacao: opts?.observacao ?? ''
    })

    return
  }

  const pathMap: Record<Exclude<CatecPropostaWorkflowActionKey, 'solicitar-revisao' | 'aprovar-socio' | 'reprovar-socio'>, string> = {
    'enviar-cliente': '/enviar-cliente'
  }

  const res = await catecApiFetch(`/api/v1/projetos/${projetoId}/propostas/${propostaId}${pathMap[acao as 'enviar-cliente']}`, {
    method: 'POST'
  })

  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Ação não concluída.')
}

export async function listarContratosCatec(projetoId: number): Promise<CatecContrato[]> {
  const res = await catecApiFetch(`/api/v1/projetos/${projetoId}/contratos`)
  const data = await readCatecJsonBody(res)

  if (!res.ok) return []

  if (!Array.isArray(data)) return []

  return data.map(parseCatecContrato)
}

export async function listarDocumentosContratoCatec(
  projetoId: number,
  contratoId: number
): Promise<CatecDocumentoAnexo[]> {
  const res = await catecApiFetch(`/api/v1/projetos/${projetoId}/contratos/${contratoId}/documentos`)
  const data = await readCatecJsonBody(res)

  if (!res.ok) return []

  if (!Array.isArray(data)) return []

  return data.map(parseCatecDocumentoAnexo)
}

export async function uploadDocumentoContratoCatec(
  projetoId: number,
  contratoId: number | null,
  file: File
): Promise<void> {
  const fd = new FormData()

  fd.append('file', file)
  fd.append('tipoArquivo', 'CONTRATO')

  const path =
    contratoId != null
      ? `/api/v1/projetos/${projetoId}/contratos/${contratoId}/documentos`
      : `/api/v1/projetos/${projetoId}/contratos/documentos`

  const res = await catecApiFetch(path, { method: 'POST', body: fd })
  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Erro no upload do contrato.')
}

export async function enviarContratoClienteCatec(
  projetoId: number,
  contratoId: number,
  prazoConclusaoDias: number
): Promise<void> {
  const res = await catecApiFetch(
    `/api/v1/projetos/${projetoId}/contratos/${contratoId}/enviar-cliente`,
    {
      method: 'POST',
      body: JSON.stringify({ prazoConclusaoDias })
    }
  )

  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Não foi possível enviar o contrato.')
}

async function listarInteracoesPropostaCatec(
  projetoId: number,
  proposta: CatecProposta
): Promise<CatecInteracaoTimelineItem[]> {
  const res = await catecApiFetch(`/api/v1/projetos/${projetoId}/propostas/${proposta.id}/interacoes`)
  const data = await readCatecJsonBody(res)

  if (!res.ok || !Array.isArray(data)) return []

  return (data as InteracaoApi[]).map(i => ({
    key: `P-${i.id}`,
    titulo: rotuloInteracao(i.tipoInteracao, 'PROPOSTA'),
    meta: `${i.registradoPorNome} · ${formatarDataHora(i.criadoEm)} · proposta v${proposta.versao}`,
    texto: i.texto,
    criadoEm: i.criadoEm,
    origem: 'PROPOSTA' as const
  }))
}

async function obterUltimaConsideracaoClienteProposta(
  projetoId: number,
  propostaId: number
): Promise<string | null> {
  const res = await catecApiFetch(`/api/v1/projetos/${projetoId}/propostas/${propostaId}/interacoes`)
  const data = await readCatecJsonBody(res)

  if (!res.ok || !Array.isArray(data)) return null

  const ultima = (data as InteracaoApi[]).find(i => i.tipoInteracao === 'CONSIDERACOES_CLIENTE')

  return ultima?.texto?.trim() ? ultima.texto.trim() : null
}

async function obterUltimaConsideracaoClienteContrato(
  projetoId: number,
  contratoId: number
): Promise<string | null> {
  const res = await catecApiFetch(`/api/v1/projetos/${projetoId}/contratos/${contratoId}/interacoes`)
  const data = await readCatecJsonBody(res)

  if (!res.ok || !Array.isArray(data)) return null

  const ultima = (data as InteracaoApi[]).find(i => i.tipoInteracao === 'CONSIDERACOES_CLIENTE')

  return ultima?.texto?.trim() ? ultima.texto.trim() : null
}

async function listarInteracoesContratoCatec(
  projetoId: number,
  contratoId: number
): Promise<CatecInteracaoTimelineItem[]> {
  const res = await catecApiFetch(`/api/v1/projetos/${projetoId}/contratos/${contratoId}/interacoes`)
  const data = await readCatecJsonBody(res)

  if (!res.ok || !Array.isArray(data)) return []

  return (data as InteracaoApi[]).map(i => ({
    key: `C-${i.id}`,
    titulo: rotuloInteracao(i.tipoInteracao, 'CONTRATO'),
    meta: `${i.registradoPorNome} · ${formatarDataHora(i.criadoEm)} · contrato`,
    texto: i.texto,
    criadoEm: i.criadoEm,
    origem: 'CONTRATO' as const
  }))
}

export async function carregarInteracoesProjetoCatec(
  projetoId: number,
  propostas: CatecProposta[],
  contrato: CatecContrato | null
): Promise<CatecInteracaoTimelineItem[]> {
  const timeline: CatecInteracaoTimelineItem[] = []

  for (const proposta of propostas) {
    timeline.push(...(await listarInteracoesPropostaCatec(projetoId, proposta)))
  }

  if (contrato) {
    timeline.push(...(await listarInteracoesContratoCatec(projetoId, contrato.id)))
  }

  timeline.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())

  return timeline
}

export async function registrarInteracaoPropostaCatec(
  projetoId: number,
  propostaId: number,
  tipoInteracao: CatecTipoInteracaoFluxo,
  texto: string
): Promise<void> {
  const res = await catecApiFetch(`/api/v1/projetos/${projetoId}/propostas/${propostaId}/interacoes`, {
    method: 'POST',
    body: JSON.stringify({ tipoInteracao, texto })
  })

  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Erro ao registrar interação.')
}

export async function registrarInteracaoContratoCatec(
  projetoId: number,
  contratoId: number,
  tipoInteracao: CatecTipoInteracaoFluxo,
  texto: string
): Promise<void> {
  const res = await catecApiFetch(`/api/v1/projetos/${projetoId}/contratos/${contratoId}/interacoes`, {
    method: 'POST',
    body: JSON.stringify({ tipoInteracao, texto })
  })

  const data = await readCatecJsonBody(res)

  assertCatecOk(res, data, 'Erro ao registrar interação.')
}

export async function listarHistoricoProjetoCatec(
  projetoId: number,
  page: number,
  size: number
): Promise<CatecHistoricoPage> {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  const res = await catecApiFetch(`/api/v1/projetos/${projetoId}/historico?${params}`)
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

export async function carregarPropostasComDocumentosCatec(projetoId: number): Promise<CatecProposta[]> {
  const propostas = await listarPropostasCatec(projetoId)

  return Promise.all(
    propostas.map(async proposta => {
      const documentos = await listarDocumentosPropostaCatec(projetoId, proposta.id)
      let consideracoesCliente = proposta.consideracoesCliente

      if (
        !consideracoesCliente &&
        proposta.consideracoesPendentes &&
        proposta.status === 'AGUARDANDO_AJUSTE'
      ) {
        consideracoesCliente = await obterUltimaConsideracaoClienteProposta(projetoId, proposta.id)
      }

      return { ...proposta, documentos, consideracoesCliente }
    })
  )
}

export async function carregarContratoComDocumentosCatec(projetoId: number): Promise<CatecContrato | null> {
  const contratos = await listarContratosCatec(projetoId)
  const contrato = contratos[0] ?? null

  if (!contrato) return null

  const documentos = await listarDocumentosContratoCatec(projetoId, contrato.id)
  let consideracoesCliente = contrato.consideracoesCliente

  if (
    !consideracoesCliente &&
    contrato.consideracoesPendentes &&
    (contrato.status === 'AGUARDANDO_AJUSTE' || contrato.status === 'RASCUNHO')
  ) {
    consideracoesCliente = await obterUltimaConsideracaoClienteContrato(projetoId, contrato.id)
  }

  return { ...contrato, documentos, consideracoesCliente }
}

export function propostaParaRegistroInteracao(propostas: CatecProposta[]): CatecProposta | null {
  return propostas.find(p => STATUS_PROPOSTA_RESPOSTA_CLIENTE.includes(p.status)) ?? null
}

export function contratoParaRegistroInteracao(contrato: CatecContrato | null): CatecContrato | null {
  if (!contrato) return null

  return contrato.status === 'ENVIADO_AO_CLIENTE' ? contrato : null
}
