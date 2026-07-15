import type { CatecProjeto } from '@/types/catec/projetoTypes'
import type { CatecContrato, CatecDocumentoAnexo } from '@/types/catec/projetoFluxoTypes'

import { formatarDataCurta } from '../projetoFluxoHelpers'

import type { ProjetoMetaItem } from './ProjetoMetaItensGrid'

const STATUS_CONTRATO_COM_PRAZO_SALVO = ['ENVIADO_AO_CLIENTE', 'ACEITO', 'RECUSADO', 'AGUARDANDO_AJUSTE'] as const

type PrazosContratoMeta = {
  prazoInicioExecucaoDias?: number | null
  prazoConclusaoDias?: number | null
}

function formatarPrazoDias(dias: number | null | undefined): string | null {
  if (dias == null || !Number.isFinite(dias) || dias < 1) return null

  return `${dias} dias`
}

function parsePrazoFormulario(valor: string): number | null {
  const dias = Number.parseInt(valor.trim(), 10)

  if (!Number.isFinite(dias) || dias < 1) return null

  return dias
}

/** Combina prazos salvos no projeto com os digitados no formulário (quando ainda disponíveis). */
export function resolverPrazosContratoMeta(
  projeto: CatecProjeto,
  prazoInicioForm: string,
  prazoConclusaoForm: string
): PrazosContratoMeta {
  return {
    prazoInicioExecucaoDias: projeto.prazoInicioExecucaoDias ?? parsePrazoFormulario(prazoInicioForm),
    prazoConclusaoDias: projeto.prazoConclusaoDias ?? parsePrazoFormulario(prazoConclusaoForm)
  }
}

export function buildContratoDocumentoMetaItens(
  projeto: CatecProjeto,
  contrato?: CatecContrato | null,
  prazosOverride?: PrazosContratoMeta
): ProjetoMetaItem[] {
  const itens: ProjetoMetaItem[] = []

  if (
    contrato &&
    STATUS_CONTRATO_COM_PRAZO_SALVO.includes(
      contrato.status as (typeof STATUS_CONTRATO_COM_PRAZO_SALVO)[number]
    )
  ) {
    const prazoInicio =
      prazosOverride?.prazoInicioExecucaoDias !== undefined
        ? prazosOverride.prazoInicioExecucaoDias
        : projeto.prazoInicioExecucaoDias

    const prazoConclusao =
      prazosOverride?.prazoConclusaoDias !== undefined
        ? prazosOverride.prazoConclusaoDias
        : projeto.prazoConclusaoDias

    // Sempre exibe as duas linhas nesta etapa do contrato.
    itens.push({
      label: 'Prazo para início',
      value: formatarPrazoDias(prazoInicio) ?? '—'
    })
    itens.push({
      label: 'Prazo para conclusão',
      value: formatarPrazoDias(prazoConclusao) ?? '—'
    })
  }

  if (contrato?.status === 'ACEITO' && contrato.aceitoClienteEm) {
    itens.push({ label: 'Aceito em', value: formatarDataCurta(contrato.aceitoClienteEm) })
  }

  if (contrato?.status === 'ACEITO' && projeto.previsaoInicioExecucaoEm) {
    itens.push({ label: 'Início previsto', value: formatarDataCurta(projeto.previsaoInicioExecucaoEm) })
  }

  if (projeto.previsaoConclusaoEm) {
    itens.push({ label: 'Conclusão prevista', value: formatarDataCurta(projeto.previsaoConclusaoEm) })
  }

  return itens
}

export function metaDocumentoResumo(documento: CatecDocumentoAnexo): string {
  return `Versão ${documento.versao}${documento.criadoEm ? ` • ${formatarDataCurta(documento.criadoEm)}` : ''}`
}
