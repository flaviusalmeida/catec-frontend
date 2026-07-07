import type { CatecProjetoStatus } from '@/types/catec/projetoTypes'

export type StatusCorPainel = {
  main: string
  light: string
}

/** Uma cor distinta por status — cards do painel e gráfico de distribuição. */
export const STATUS_PROJETO_PAINEL_CORES: Record<CatecProjetoStatus, StatusCorPainel> = {
  PENDENTE_CLIENTE: { main: '#64748B', light: '#F1F5F9' },
  AGUARDANDO_PROPOSTA_COMERCIAL: { main: '#D97706', light: '#FEF3C7' },
  ELABORANDO_PROPOSTA: { main: '#0284C7', light: '#E0F2FE' },
  AGUARDANDO_REVISAO_PROPOSTA: { main: '#7C3AED', light: '#EDE9FE' },
  AGUARDANDO_AJUSTE: { main: '#EA580C', light: '#FFEDD5' },
  AGUARDANDO_ENVIO_CLIENTE: { main: '#0891B2', light: '#CFFAFE' },
  AGUARDANDO_ACEITE_PROPOSTA: { main: '#CA8A04', light: '#FEF9C3' },
  AGUARDANDO_CONTRATO: { main: '#4F46E5', light: '#E0E7FF' },
  AGUARDANDO_EXECUCAO: { main: '#9333EA', light: '#F3E8FF' },
  EM_EXECUCAO: { main: '#0369A1', light: '#DBEAFE' },
  CANCELADO: { main: '#DC2626', light: '#FEE2E2' },
  FINALIZADO: { main: '#15803D', light: '#DCFCE7' }
}

export function corGraficoProjetoStatus(status: CatecProjetoStatus): string {
  return STATUS_PROJETO_PAINEL_CORES[status].main
}

export function corPainelProjetoStatus(status: CatecProjetoStatus): StatusCorPainel {
  return STATUS_PROJETO_PAINEL_CORES[status]
}
