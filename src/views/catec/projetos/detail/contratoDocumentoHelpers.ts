import type { CatecProjeto } from '@/types/catec/projetoTypes'
import type { CatecContrato, CatecDocumentoAnexo } from '@/types/catec/projetoFluxoTypes'

import { formatarDataCurta } from '../projetoFluxoHelpers'

import type { ProjetoMetaItem } from './ProjetoMetaItensGrid'

const STATUS_CONTRATO_COM_PRAZO_SALVO = ['ENVIADO_AO_CLIENTE', 'ACEITO', 'RECUSADO', 'AGUARDANDO_AJUSTE'] as const

export function buildContratoDocumentoMetaItens(
  projeto: CatecProjeto,
  contrato?: CatecContrato | null
): ProjetoMetaItem[] {
  const itens: ProjetoMetaItem[] = []

  if (
    contrato &&
    projeto.prazoConclusaoDias != null &&
    STATUS_CONTRATO_COM_PRAZO_SALVO.includes(
      contrato.status as (typeof STATUS_CONTRATO_COM_PRAZO_SALVO)[number]
    )
  ) {
    itens.push({ label: 'Prazo', value: `${projeto.prazoConclusaoDias} dias` })
  }

  if (contrato?.status === 'ACEITO' && contrato.aceitoClienteEm) {
    itens.push({ label: 'Aceito em', value: formatarDataCurta(contrato.aceitoClienteEm) })
  }

  if (contrato?.status === 'ACEITO' && projeto.previsaoConclusaoEm) {
    itens.push({ label: 'Conclusão prevista', value: formatarDataCurta(projeto.previsaoConclusaoEm) })
  }

  return itens
}

export function metaDocumentoResumo(documento: CatecDocumentoAnexo): string {
  return `Versão ${documento.versao}${documento.criadoEm ? ` • ${formatarDataCurta(documento.criadoEm)}` : ''}`
}
