import type { ThemeColor } from '@core/types'

import type {
  CatecAlertaPrazoProjeto,
  CatecProjeto,
  CatecProjetoPainelItem,
  CatecProjetoStatus
} from '@/types/catec/projetoTypes'

export const STATUS_EXECUCAO_PRAZO: CatecProjetoStatus[] = ['AGUARDANDO_EXECUCAO', 'EM_EXECUCAO']

export type FaixaFiltroPrazo = '' | 'ATRASADO' | 'CRITICO' | 'ATENCAO' | 'SEM_PREVISAO'

const ZONA_SP = 'America/Sao_Paulo'

export const FAIXAS_FILTRO_PRAZO: Exclude<FaixaFiltroPrazo, ''>[] = [
  'ATRASADO',
  'CRITICO',
  'ATENCAO',
  'SEM_PREVISAO'
]

type ProjetoPrazoLike = Pick<CatecProjeto, 'status' | 'previsaoConclusaoEm'>

function dataLocalSaoPaulo(instantIso: string | Date): string {
  return new Date(instantIso).toLocaleDateString('en-CA', { timeZone: ZONA_SP })
}

function hojeSaoPaulo(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: ZONA_SP })
}

function diasEntreDatasLocal(inicioYmd: string, fimYmd: string): number {
  const [y1, m1, d1] = inicioYmd.split('-').map(Number)
  const [y2, m2, d2] = fimYmd.split('-').map(Number)
  const inicio = Date.UTC(y1, m1 - 1, d1)
  const fim = Date.UTC(y2, m2 - 1, d2)

  return Math.round((fim - inicio) / 86_400_000)
}

/** Alinhado ao cálculo do painel (backend): projetos não terminais com previsão. */
export function calcularAlertaPrazoProjeto(projeto: ProjetoPrazoLike): CatecAlertaPrazoProjeto | null {
  if (projeto.status === 'CANCELADO' || projeto.status === 'FINALIZADO') return null
  if (!projeto.previsaoConclusaoEm) return null

  const hoje = hojeSaoPaulo()
  const previsao = dataLocalSaoPaulo(projeto.previsaoConclusaoEm)
  const diasRestantes = diasEntreDatasLocal(hoje, previsao)

  if (diasRestantes < 0) return 'ATRASADO'
  if (diasRestantes <= 7) return 'CRITICO'
  if (diasRestantes <= 15) return 'ATENCAO'

  return 'OK'
}

export function projetoSemPrevisao(projeto: ProjetoPrazoLike): boolean {
  return STATUS_EXECUCAO_PRAZO.includes(projeto.status) && projeto.previsaoConclusaoEm == null
}

export function projetoPassaFiltroPrazo(projeto: ProjetoPrazoLike, faixa: FaixaFiltroPrazo): boolean {
  if (!faixa) return true
  if (faixa === 'SEM_PREVISAO') return projetoSemPrevisao(projeto)

  return calcularAlertaPrazoProjeto(projeto) === faixa
}

export function parseFaixaFiltroPrazo(value: string | null): FaixaFiltroPrazo {
  if (value && (FAIXAS_FILTRO_PRAZO as string[]).includes(value)) {
    return value as Exclude<FaixaFiltroPrazo, ''>
  }

  return ''
}

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
