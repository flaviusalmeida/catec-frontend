export type CatecProjetoStatus =
  | 'PENDENTE_CLIENTE'
  | 'AGUARDANDO_PROPOSTA_COMERCIAL'
  | 'ELABORANDO_PROPOSTA'
  | 'AGUARDANDO_REVISAO_PROPOSTA'
  | 'AGUARDANDO_AJUSTE'
  | 'AGUARDANDO_ENVIO_CLIENTE'
  | 'AGUARDANDO_ACEITE_PROPOSTA'
  | 'AGUARDANDO_CONTRATO'
  | 'AGUARDANDO_EXECUCAO'
  | 'EM_EXECUCAO'
  | 'CANCELADO'
  | 'FINALIZADO'

export type CatecProjeto = {
  id: number
  clienteId: number | null
  clienteNome: string | null
  titulo: string
  escopo: string
  emailContato: string | null
  telefoneContato: string | null
  criadoPorId: number
  criadoPorNome: string
  status: CatecProjetoStatus
  criadoEm: string
  atualizadoEm: string
  clienteAssociadoEm?: string | null
  clienteAssociadoPorId?: number | null
  clienteAssociadoPorNome?: string | null
  prazoConclusaoDias: number | null
  previsaoConclusaoEm: string | null
  conclusaoEm: string | null
}

export type CatecProjetoCreateInput = {
  clienteId?: number | null
  titulo: string
  escopo: string
}

export type CatecProjetoUpdateInput = {
  clienteId?: number | null
  titulo?: string
  escopo?: string
  status?: CatecProjetoStatus
}

export function parseCatecProjeto(raw: unknown): CatecProjeto {
  const data = raw as Record<string, unknown>

  return {
    id: Number(data.id),
    clienteId: data.clienteId == null ? null : Number(data.clienteId),
    clienteNome: data.clienteNome == null ? null : String(data.clienteNome),
    titulo: String(data.titulo ?? ''),
    escopo: String(data.escopo ?? ''),
    emailContato: data.emailContato == null ? null : String(data.emailContato),
    telefoneContato: data.telefoneContato == null ? null : String(data.telefoneContato),
    criadoPorId: Number(data.criadoPorId ?? 0),
    criadoPorNome: String(data.criadoPorNome ?? ''),
    status: String(data.status ?? 'PENDENTE_CLIENTE') as CatecProjetoStatus,
    criadoEm: String(data.criadoEm ?? ''),
    atualizadoEm: String(data.atualizadoEm ?? ''),
    clienteAssociadoEm: data.clienteAssociadoEm == null ? null : String(data.clienteAssociadoEm),
    clienteAssociadoPorId: data.clienteAssociadoPorId == null ? null : Number(data.clienteAssociadoPorId),
    clienteAssociadoPorNome:
      data.clienteAssociadoPorNome == null ? null : String(data.clienteAssociadoPorNome),
    prazoConclusaoDias: data.prazoConclusaoDias == null ? null : Number(data.prazoConclusaoDias),
    previsaoConclusaoEm: data.previsaoConclusaoEm == null ? null : String(data.previsaoConclusaoEm),
    conclusaoEm: data.conclusaoEm == null ? null : String(data.conclusaoEm)
  }
}

export function parseCatecProjetoList(raw: unknown): CatecProjeto[] {
  if (!Array.isArray(raw)) return []

  return raw.map(parseCatecProjeto)
}

export type CatecProjetoResumoCardStatus =
  | 'ELABORANDO_PROPOSTA'
  | 'AGUARDANDO_ACEITE_PROPOSTA'
  | 'AGUARDANDO_EXECUCAO'
  | 'EM_EXECUCAO'

export type CatecProjetoResumoCard = {
  status: CatecProjetoResumoCardStatus
  total: number
  totalHa30Dias: number
  variacaoPercentual: number
}

export type CatecProjetoResumo = {
  periodoDias: number
  cards: CatecProjetoResumoCard[]
}

export function parseCatecProjetoResumo(raw: unknown): CatecProjetoResumo {
  const data = raw as Record<string, unknown>
  const cardsRaw = Array.isArray(data.cards) ? data.cards : []

  return {
    periodoDias: Number(data.periodoDias ?? 30),
    cards: cardsRaw.map(card => {
      const item = card as Record<string, unknown>

      return {
        status: String(item.status ?? 'ELABORANDO_PROPOSTA') as CatecProjetoResumoCardStatus,
        total: Number(item.total ?? 0),
        totalHa30Dias: Number(item.totalHa30Dias ?? 0),
        variacaoPercentual: Number(item.variacaoPercentual ?? 0)
      }
    })
  }
}

export type CatecAlertaPrazoProjeto = 'ATRASADO' | 'CRITICO' | 'ATENCAO' | 'OK'

export type CatecProjetoPainelItem = {
  id: number
  titulo: string
  clienteNome: string | null
  criadoPorNome: string | null
  status: CatecProjetoStatus
  previsaoConclusaoEm: string | null
  prazoConclusaoDias: number | null
  diasRestantes: number | null
  alertaPrazo: CatecAlertaPrazoProjeto | null
  percentualPrazoConsumido: number | null
  atualizadoEm: string
}

export type CatecProjetoPainelAlertasPrazo = {
  atrasados: number
  criticos7Dias: number
  atencao15Dias: number
  semPrevisao: number
}

export type CatecProjetoPainelTotais = {
  emAndamento: number
  aguardandoRevisaoSocio: number
  aguardandoRespostaCliente: number
  emExecucao: number
  porStatus: Record<CatecProjetoStatus, number>
  alertasPrazo: CatecProjetoPainelAlertasPrazo
}

export type CatecProjetoPainel = {
  totais: CatecProjetoPainelTotais
  projetosPrazoProximo: CatecProjetoPainelItem[]
  projetos: CatecProjetoPainelItem[]
}

function parsePainelItem(raw: unknown): CatecProjetoPainelItem {
  const data = raw as Record<string, unknown>

  return {
    id: Number(data.id),
    titulo: String(data.titulo ?? ''),
    clienteNome: data.clienteNome == null ? null : String(data.clienteNome),
    criadoPorNome: data.criadoPorNome == null ? null : String(data.criadoPorNome),
    status: String(data.status ?? 'PENDENTE_CLIENTE') as CatecProjetoStatus,
    previsaoConclusaoEm: data.previsaoConclusaoEm == null ? null : String(data.previsaoConclusaoEm),
    prazoConclusaoDias: data.prazoConclusaoDias == null ? null : Number(data.prazoConclusaoDias),
    diasRestantes: data.diasRestantes == null ? null : Number(data.diasRestantes),
    alertaPrazo:
      data.alertaPrazo == null ? null : (String(data.alertaPrazo) as CatecAlertaPrazoProjeto),
    percentualPrazoConsumido:
      data.percentualPrazoConsumido == null ? null : Number(data.percentualPrazoConsumido),
    atualizadoEm: String(data.atualizadoEm ?? '')
  }
}

function emptyPorStatus(): Record<CatecProjetoStatus, number> {
  return ORDEM_STATUS_PROJETO.reduce(
    (acc, status) => {
      acc[status] = 0

      return acc
    },
    {} as Record<CatecProjetoStatus, number>
  )
}

export function parseCatecProjetoPainel(raw: unknown): CatecProjetoPainel {
  const data = raw as Record<string, unknown>
  const totaisRaw = (data.totais ?? {}) as Record<string, unknown>
  const alertasRaw = (totaisRaw.alertasPrazo ?? {}) as Record<string, unknown>
  const porStatusRaw = (totaisRaw.porStatus ?? {}) as Record<string, number>
  const porStatus = emptyPorStatus()

  for (const status of ORDEM_STATUS_PROJETO) {
    porStatus[status] = Number(porStatusRaw[status] ?? 0)
  }

  const projetos = Array.isArray(data.projetos) ? data.projetos.map(parsePainelItem) : []
  const projetosPrazoProximo = Array.isArray(data.projetosPrazoProximo)
    ? data.projetosPrazoProximo.map(parsePainelItem)
    : []

  return {
    totais: {
      emAndamento: Number(totaisRaw.emAndamento ?? 0),
      aguardandoRevisaoSocio: Number(totaisRaw.aguardandoRevisaoSocio ?? 0),
      aguardandoRespostaCliente: Number(totaisRaw.aguardandoRespostaCliente ?? 0),
      emExecucao: Number(totaisRaw.emExecucao ?? 0),
      porStatus,
      alertasPrazo: {
        atrasados: Number(alertasRaw.atrasados ?? 0),
        criticos7Dias: Number(alertasRaw.criticos7Dias ?? 0),
        atencao15Dias: Number(alertasRaw.atencao15Dias ?? alertasRaw.atencao30Dias ?? 0),
        semPrevisao: Number(alertasRaw.semPrevisao ?? 0)
      }
    },
    projetosPrazoProximo,
    projetos
  }
}

export const ORDEM_STATUS_PROJETO: CatecProjetoStatus[] = [
  'PENDENTE_CLIENTE',
  'AGUARDANDO_PROPOSTA_COMERCIAL',
  'ELABORANDO_PROPOSTA',
  'AGUARDANDO_REVISAO_PROPOSTA',
  'AGUARDANDO_AJUSTE',
  'AGUARDANDO_ENVIO_CLIENTE',
  'AGUARDANDO_ACEITE_PROPOSTA',
  'AGUARDANDO_CONTRATO',
  'AGUARDANDO_EXECUCAO',
  'EM_EXECUCAO',
  'CANCELADO',
  'FINALIZADO'
]

export const STATUS_PROJETO_ROTULO: Record<CatecProjetoStatus, string> = {
  PENDENTE_CLIENTE: 'Pendente de cadastro de cliente',
  AGUARDANDO_PROPOSTA_COMERCIAL: 'Aguardando proposta comercial',
  ELABORANDO_PROPOSTA: 'Elaborando proposta',
  AGUARDANDO_REVISAO_PROPOSTA: 'Aguardando revisão de proposta',
  AGUARDANDO_AJUSTE: 'Aguardando ajuste',
  AGUARDANDO_ENVIO_CLIENTE: 'Aguardando envio ao cliente',
  AGUARDANDO_ACEITE_PROPOSTA: 'Aguardando aceite da proposta',
  AGUARDANDO_CONTRATO: 'Aguardando contrato',
  AGUARDANDO_EXECUCAO: 'Aguardando execução',
  EM_EXECUCAO: 'Em execução',
  CANCELADO: 'Cancelado',
  FINALIZADO: 'Finalizado'
}

export const STATUS_PROJETO_ROTULO_BADGE: Record<CatecProjetoStatus, string> = {
  PENDENTE_CLIENTE: 'Pendente cliente',
  AGUARDANDO_PROPOSTA_COMERCIAL: 'Aguardando proposta',
  ELABORANDO_PROPOSTA: 'Elaborando proposta',
  AGUARDANDO_REVISAO_PROPOSTA: 'Aguardando revisão da proposta',
  AGUARDANDO_AJUSTE: 'Aguardando ajuste da proposta',
  AGUARDANDO_ENVIO_CLIENTE: 'Aguardando envio da proposta',
  AGUARDANDO_ACEITE_PROPOSTA: 'Aguardando aceite da proposta',
  AGUARDANDO_CONTRATO: 'Aguardando contrato',
  AGUARDANDO_EXECUCAO: 'Aguardando execução',
  EM_EXECUCAO: 'Em execução',
  CANCELADO: 'Cancelado',
  FINALIZADO: 'Finalizado'
}
