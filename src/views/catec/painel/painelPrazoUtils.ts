import type { ThemeColor } from '@core/types'

import type { CatecAlertaPrazoProjeto, CatecProjetoPainelItem, CatecProjetoStatus } from '@/types/catec/projetoTypes'

export const STATUS_EXECUCAO_PRAZO: CatecProjetoStatus[] = ['AGUARDANDO_EXECUCAO', 'EM_EXECUCAO']

export type FaixaFiltroPrazo = '' | 'ATRASADO' | 'CRITICO' | 'ATENCAO' | 'SEM_PREVISAO'

export const ROTULO_ALERTA_PRAZO: Record<CatecAlertaPrazoProjeto, string> = {
  ATRASADO: 'Atrasado',
  CRITICO: 'Crítico',
  ATENCAO: 'Atenção',
  OK: 'Em dia'
}

export const COR_ALERTA_PRAZO: Record<CatecAlertaPrazoProjeto, ThemeColor> = {
  ATRASADO: 'error',
  CRITICO: 'warning',
  ATENCAO: 'warning',
  OK: 'success'
}

export function rotuloFaixaFiltroPrazo(faixa: FaixaFiltroPrazo): string {
  switch (faixa) {
    case 'ATRASADO':
      return 'Atrasados'
    case 'CRITICO':
      return 'Crítico (≤7 dias)'
    case 'ATENCAO':
      return 'Atenção (8–15 dias)'
    case 'SEM_PREVISAO':
      return 'Sem previsão'
    default:
      return 'Todas as faixas'
  }
}

export function itemSemPrevisao(item: CatecProjetoPainelItem): boolean {
  return STATUS_EXECUCAO_PRAZO.includes(item.status) && item.previsaoConclusaoEm == null
}

export function itemPassaFiltroPrazo(item: CatecProjetoPainelItem, faixa: FaixaFiltroPrazo): boolean {
  if (!faixa) return true
  if (faixa === 'SEM_PREVISAO') return itemSemPrevisao(item)
  return item.alertaPrazo === faixa
}

export function corProgressoPrazo(item: CatecProjetoPainelItem): ThemeColor {
  if (item.alertaPrazo === 'ATRASADO') return 'error'
  if (item.alertaPrazo === 'CRITICO') return 'warning'
  if (item.alertaPrazo === 'ATENCAO') return 'warning'
  return 'success'
}

export function formatarDiasRestantes(dias: number | null): string {
  if (dias == null) return '—'
  if (dias < 0) return `${Math.abs(dias)} dia(s) em atraso`
  if (dias === 0) return 'Vence hoje'
  if (dias === 1) return '1 dia restante'

  return `${dias} dias restantes`
}
