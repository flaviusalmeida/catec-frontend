import type { CatecProjetoFluxoData, CatecProjetoFluxoResumo, CatecProposta } from '@/types/catec/projetoFluxoTypes'
import { normalizarStatusProposta } from '@/types/catec/projetoFluxoTypes'

export {
  metaHistoricoItem,
  tituloHistoricoItem as rotuloHistoricoItem
} from './historicoFluxoHelpers'

export function formatarDataCurta(iso: string | null): string {
  if (!iso) return '—'

  return new Date(iso).toLocaleDateString('pt-BR')
}

export function formatarDataHora(iso: string | null): string {
  if (!iso) return '—'

  return new Date(iso).toLocaleString('pt-BR')
}

const STATUS_PROJETO_EDITAR_CONTRATO = [
  'AGUARDANDO_CONTRATO',
  'AGUARDANDO_EXECUCAO',
  'EM_EXECUCAO'
] as const

export function projetoPermiteEditarContrato(status: string): boolean {
  return STATUS_PROJETO_EDITAR_CONTRATO.includes(status as (typeof STATUS_PROJETO_EDITAR_CONTRATO)[number])
}

/** @deprecated use projetoPermiteEditarContrato */
export function projetoPermiteContrato(status: string): boolean {
  return projetoPermiteEditarContrato(status)
}

export function projetoPermiteVisualizarContrato(status: string, temContrato: boolean): boolean {
  return temContrato || projetoPermiteEditarContrato(status)
}

export function propostaMaisRecente(propostas: CatecProposta[]): CatecProposta | null {
  if (propostas.length === 0) return null

  return [...propostas].sort((a, b) => b.versao - a.versao)[0]
}

export function computeProjetoFluxoResumo(projetoId: number, data: CatecProjetoFluxoData): CatecProjetoFluxoResumo {
  const propostaAtual = propostaMaisRecente(data.propostas)
  const ultimaInteracao = data.interacoes[0]?.criadoEm ?? null

  return {
    projetoId,
    propostaStatus: propostaAtual?.status ?? null,
    contratoStatus: data.contrato?.status ?? null,
    ultimaInteracaoEm: ultimaInteracao
  }
}

export function resolvePropostaWorkflowActions(
  status: string,
  opts: {
    hasAttachment: boolean
    podeAprovarSocio?: boolean
    podeDevolverSocio?: boolean
  }
): Array<{ key: string; label: string; color: 'primary' | 'secondary' | 'error' }> {
  const { hasAttachment, podeAprovarSocio = false, podeDevolverSocio = false } = opts
  const statusNormalizado = normalizarStatusProposta(status)

  if ((statusNormalizado === 'RASCUNHO' || statusNormalizado === 'AGUARDANDO_AJUSTE') && hasAttachment) {
    return [{ key: 'solicitar-revisao', label: 'Enviar para revisão', color: 'primary' }]
  }

  if (statusNormalizado === 'AGUARDANDO_ENVIO' && hasAttachment) {
    return [{ key: 'enviar-cliente', label: 'Enviar ao cliente', color: 'primary' }]
  }

  if (statusNormalizado === 'PENDENTE_AVALIACAO') {
    const actions: Array<{ key: string; label: string; color: 'primary' | 'secondary' | 'error' }> = []

    if (podeAprovarSocio) {
      actions.push({ key: 'aprovar-socio', label: 'Aprovar', color: 'primary' })
    }

    if (podeDevolverSocio) {
      actions.push({ key: 'reprovar-socio', label: 'Reprovar', color: 'error' })
    }

    return actions
  }

  return []
}
