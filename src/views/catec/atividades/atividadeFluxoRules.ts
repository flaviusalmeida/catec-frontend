import type { CatecAtividade, CatecAtividadeStatus } from '@/types/catec/atividadeTypes'
import type { CatecProjeto, CatecProjetoStatus } from '@/types/catec/projetoTypes'

export const STATUS_PROJETO_MUTACAO_ATIVIDADE: CatecProjetoStatus[] = [
  'AGUARDANDO_EXECUCAO',
  'EM_EXECUCAO'
]

export function projetoPermiteMutacaoAtividade(status: CatecProjetoStatus): boolean {
  return STATUS_PROJETO_MUTACAO_ATIVIDADE.includes(status)
}

export function filtrarProjetosParaCriacaoAtividade(projetos: CatecProjeto[]): CatecProjeto[] {
  return projetos.filter(p => projetoPermiteMutacaoAtividade(p.status))
}

/** Extrai YYYY-MM-DD em fuso America/Sao_Paulo (alinhado ao backend). */
export function dataCivilSp(iso: string | null | undefined): string {
  if (!iso) return ''

  const d = new Date(iso)

  if (Number.isNaN(d.getTime())) return ''

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(d)
}

export function prazoAposPrevisaoProjeto(
  prazoYmd: string,
  previsaoConclusaoEm: string | null | undefined
): boolean {
  if (!prazoYmd || !previsaoConclusaoEm) return false

  const previsaoYmd = dataCivilSp(previsaoConclusaoEm)

  if (!previsaoYmd) return false

  return prazoYmd > previsaoYmd
}

export function temFilhasNaoConcluidas(
  atividadeId: number,
  catalogo: CatecAtividade[],
  statusDestino?: CatecAtividadeStatus
): boolean {
  if (statusDestino != null && statusDestino !== 'CONCLUIDA') return false

  return catalogo.some(a => a.paiId === atividadeId && a.status !== 'CONCLUIDA')
}

export const MSG_PRAZO_APOS_PREVISAO =
  'O prazo da atividade não pode ser posterior à previsão de entrega do projeto.'

export const MSG_CONCLUSAO_COM_FILHAS =
  'Não é possível concluir enquanto houver atividades ou subatividades filhas sem conclusão.'
