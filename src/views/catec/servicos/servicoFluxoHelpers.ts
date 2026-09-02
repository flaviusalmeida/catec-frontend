import type { CatecServicoFluxoData, CatecServicoFluxoResumo, CatecProposta } from '@/types/catec/servicoFluxoTypes'
import { normalizarStatusProposta } from '@/types/catec/servicoFluxoTypes'

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

const STATUS_SERVICO_EDITAR_CONTRATO = [
  'AGUARDANDO_CONTRATO',
  'AGUARDANDO_EXECUCAO',
  'EM_EXECUCAO'
] as const

export function servicoPermiteEditarContrato(status: string): boolean {
  return STATUS_SERVICO_EDITAR_CONTRATO.includes(status as (typeof STATUS_SERVICO_EDITAR_CONTRATO)[number])
}

/** @deprecated use servicoPermiteEditarContrato */
export function servicoPermiteContrato(status: string): boolean {
  return servicoPermiteEditarContrato(status)
}

export function servicoPermiteVisualizarContrato(status: string, temContrato: boolean): boolean {
  return temContrato || servicoPermiteEditarContrato(status)
}

export function propostaMaisRecente(propostas: CatecProposta[]): CatecProposta | null {
  if (propostas.length === 0) return null

  return [...propostas].sort((a, b) => b.versao - a.versao)[0]
}

export function computeServicoFluxoResumo(servicoId: number, data: CatecServicoFluxoData): CatecServicoFluxoResumo {
  const propostaAtual = propostaMaisRecente(data.propostas)
  const ultimaInteracao = data.interacoes[0]?.criadoEm ?? null

  return {
    servicoId,
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
