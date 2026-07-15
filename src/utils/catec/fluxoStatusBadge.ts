import type { SxProps, Theme } from '@mui/material/styles'

import type { CatecContratoStatus, CatecPropostaStatus } from '@/types/catec/projetoFluxoTypes'
import type { CatecProjetoStatus } from '@/types/catec/projetoTypes'

export type FluxoStatusSemantica =
  | 'emAndamento'
  | 'aguardandoAcao'
  | 'concluidoSucesso'
  | 'encerradoNegativo'
  | 'neutro'

export const FLUXO_STATUS_CORES: Record<FluxoStatusSemantica, { background: string; text: string }> = {
  emAndamento: { background: '#E0F2FE', text: '#0369A1' },
  aguardandoAcao: { background: '#FEF3C7', text: '#B45309' },
  concluidoSucesso: { background: '#DCFCE7', text: '#15803D' },
  encerradoNegativo: { background: '#FEE2E2', text: '#DC2626' },
  neutro: { background: '#F3F4F6', text: '#6B7280' }
}

export const FLUXO_STATUS_SEMANTICA_ROTULO: Record<FluxoStatusSemantica, string> = {
  emAndamento: 'Em andamento',
  aguardandoAcao: 'Aguardando ação',
  concluidoSucesso: 'Concluído com sucesso',
  encerradoNegativo: 'Encerrado negativamente',
  neutro: 'Estado neutro'
}

const SEMANTICA_PROJETO: Record<CatecProjetoStatus, FluxoStatusSemantica> = {
  PENDENTE_CLIENTE: 'aguardandoAcao',
  AGUARDANDO_PROPOSTA_COMERCIAL: 'aguardandoAcao',
  ELABORANDO_PROPOSTA: 'emAndamento',
  AGUARDANDO_REVISAO_PROPOSTA: 'aguardandoAcao',
  AGUARDANDO_AJUSTE: 'aguardandoAcao',
  AGUARDANDO_ENVIO_CLIENTE: 'aguardandoAcao',
  AGUARDANDO_ACEITE_PROPOSTA: 'aguardandoAcao',
  AGUARDANDO_CONTRATO: 'aguardandoAcao',
  AGUARDANDO_EXECUCAO: 'aguardandoAcao',
  EM_EXECUCAO: 'emAndamento',
  FINALIZADO: 'concluidoSucesso',
  CANCELADO: 'encerradoNegativo'
}

const SEMANTICA_PROPOSTA: Record<CatecPropostaStatus, FluxoStatusSemantica> = {
  RASCUNHO: 'neutro',
  PENDENTE_AVALIACAO: 'aguardandoAcao',

  /** Parecer positivo do sócio — marco concluído; próximo passo é envio ao cliente. */
  AGUARDANDO_ENVIO: 'concluidoSucesso',
  ENVIADA_AO_CLIENTE: 'emAndamento',
  AGUARDANDO_AJUSTE: 'aguardandoAcao',
  ACEITA: 'concluidoSucesso',
  NEGADA: 'encerradoNegativo'
}

const SEMANTICA_CONTRATO: Record<CatecContratoStatus, FluxoStatusSemantica> = {
  RASCUNHO: 'emAndamento',
  ENVIADO_AO_CLIENTE: 'emAndamento',
  AGUARDANDO_AJUSTE: 'aguardandoAcao',
  ACEITO: 'concluidoSucesso',
  RECUSADO: 'encerradoNegativo'
}

export function semanticaProjetoStatus(status: CatecProjetoStatus): FluxoStatusSemantica {
  return SEMANTICA_PROJETO[status]
}

export function semanticaPropostaStatus(status: CatecPropostaStatus): FluxoStatusSemantica {
  return SEMANTICA_PROPOSTA[status]
}

export function semanticaContratoStatus(status: CatecContratoStatus): FluxoStatusSemantica {
  return SEMANTICA_CONTRATO[status]
}

export function fluxoStatusBadgeSx(semantica: FluxoStatusSemantica): SxProps<Theme> {
  const { background, text } = FLUXO_STATUS_CORES[semantica]

  return {
    bgcolor: background,
    color: text,
    fontWeight: 500,
    border: 'none',
    '& .MuiChip-label': { px: 1.5 }
  }
}
