export type CatecServicoStatus =
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

export type CatecServico = {
  id: number
  clienteId: number | null
  clienteNome: string | null
  titulo: string
  escopo: string
  emailContato: string | null
  telefoneContato: string | null
  criadoPorId: number
  criadoPorNome: string
  status: CatecServicoStatus
  criadoEm: string
  atualizadoEm: string
  clienteAssociadoEm?: string | null
  clienteAssociadoPorId?: number | null
  clienteAssociadoPorNome?: string | null
  prazoInicioExecucaoDias: number | null
  previsaoInicioExecucaoEm: string | null
  prazoConclusaoDias: number | null
  previsaoConclusaoEm: string | null
  conclusaoEm: string | null
}

export type CatecServicoCreateInput = {
  clienteId?: number | null
  titulo: string
  escopo: string
}

export type CatecServicoUpdateInput = {
  clienteId?: number | null
  titulo?: string
  escopo?: string
  status?: CatecServicoStatus
}

export function parseCatecServico(raw: unknown): CatecServico {
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
    status: String(data.status ?? 'PENDENTE_CLIENTE') as CatecServicoStatus,
    criadoEm: String(data.criadoEm ?? ''),
    atualizadoEm: String(data.atualizadoEm ?? ''),
    clienteAssociadoEm: data.clienteAssociadoEm == null ? null : String(data.clienteAssociadoEm),
    clienteAssociadoPorId: data.clienteAssociadoPorId == null ? null : Number(data.clienteAssociadoPorId),
    clienteAssociadoPorNome:
      data.clienteAssociadoPorNome == null ? null : String(data.clienteAssociadoPorNome),
    prazoInicioExecucaoDias:
      data.prazoInicioExecucaoDias == null ? null : Number(data.prazoInicioExecucaoDias),
    previsaoInicioExecucaoEm:
      data.previsaoInicioExecucaoEm == null ? null : String(data.previsaoInicioExecucaoEm),
    prazoConclusaoDias: data.prazoConclusaoDias == null ? null : Number(data.prazoConclusaoDias),
    previsaoConclusaoEm: data.previsaoConclusaoEm == null ? null : String(data.previsaoConclusaoEm),
    conclusaoEm: data.conclusaoEm == null ? null : String(data.conclusaoEm)
  }
}

export function parseCatecServicoList(raw: unknown): CatecServico[] {
  if (!Array.isArray(raw)) return []

  return raw.map(parseCatecServico)
}

export type CatecServicoResumoCardStatus =
  | 'ELABORANDO_PROPOSTA'
  | 'AGUARDANDO_ACEITE_PROPOSTA'
  | 'AGUARDANDO_EXECUCAO'
  | 'EM_EXECUCAO'

export type CatecServicoResumoCard = {
  status: CatecServicoResumoCardStatus
  total: number
  totalHa30Dias: number
  variacaoPercentual: number
}

export type CatecServicoResumo = {
  periodoDias: number
  cards: CatecServicoResumoCard[]
}

export function parseCatecServicoResumo(raw: unknown): CatecServicoResumo {
  const data = raw as Record<string, unknown>
  const cardsRaw = Array.isArray(data.cards) ? data.cards : []

  return {
    periodoDias: Number(data.periodoDias ?? 30),
    cards: cardsRaw.map(card => {
      const item = card as Record<string, unknown>

      return {
        status: String(item.status ?? 'ELABORANDO_PROPOSTA') as CatecServicoResumoCardStatus,
        total: Number(item.total ?? 0),
        totalHa30Dias: Number(item.totalHa30Dias ?? 0),
        variacaoPercentual: Number(item.variacaoPercentual ?? 0)
      }
    })
  }
}

export type CatecAlertaPrazoServico = 'ATRASADO' | 'CRITICO' | 'ATENCAO' | 'OK'

export type CatecServicoPainelItem = {
  id: number
  titulo: string
  clienteNome: string | null
  criadoPorNome: string | null
  status: CatecServicoStatus
  previsaoInicioExecucaoEm: string | null
  prazoInicioExecucaoDias: number | null
  previsaoConclusaoEm: string | null
  prazoConclusaoDias: number | null
  diasRestantes: number | null
  alertaPrazo: CatecAlertaPrazoServico | null
  percentualPrazoConsumido: number | null
  atualizadoEm: string
}

export type CatecServicoPainelAlertasPrazo = {
  atrasados: number
  criticos7Dias: number
  atencao15Dias: number
  semPrevisao: number
}

export type CatecServicoPainelTotais = {
  emAndamento: number
  aguardandoRevisaoSocio: number
  aguardandoRespostaCliente: number
  emExecucao: number
  porStatus: Record<CatecServicoStatus, number>
  alertasPrazo: CatecServicoPainelAlertasPrazo
}

export type CatecServicoPainel = {
  totais: CatecServicoPainelTotais
  servicosPrazoProximo: CatecServicoPainelItem[]
  servicos: CatecServicoPainelItem[]
}

function parsePainelItem(raw: unknown): CatecServicoPainelItem {
  const data = raw as Record<string, unknown>

  return {
    id: Number(data.id),
    titulo: String(data.titulo ?? ''),
    clienteNome: data.clienteNome == null ? null : String(data.clienteNome),
    criadoPorNome: data.criadoPorNome == null ? null : String(data.criadoPorNome),
    status: String(data.status ?? 'PENDENTE_CLIENTE') as CatecServicoStatus,
    previsaoInicioExecucaoEm:
      data.previsaoInicioExecucaoEm == null ? null : String(data.previsaoInicioExecucaoEm),
    prazoInicioExecucaoDias:
      data.prazoInicioExecucaoDias == null ? null : Number(data.prazoInicioExecucaoDias),
    previsaoConclusaoEm: data.previsaoConclusaoEm == null ? null : String(data.previsaoConclusaoEm),
    prazoConclusaoDias: data.prazoConclusaoDias == null ? null : Number(data.prazoConclusaoDias),
    diasRestantes: data.diasRestantes == null ? null : Number(data.diasRestantes),
    alertaPrazo:
      data.alertaPrazo == null ? null : (String(data.alertaPrazo) as CatecAlertaPrazoServico),
    percentualPrazoConsumido:
      data.percentualPrazoConsumido == null ? null : Number(data.percentualPrazoConsumido),
    atualizadoEm: String(data.atualizadoEm ?? '')
  }
}

function emptyPorStatus(): Record<CatecServicoStatus, number> {
  return ORDEM_STATUS_SERVICO.reduce(
    (acc, status) => {
      acc[status] = 0

      return acc
    },
    {} as Record<CatecServicoStatus, number>
  )
}

export function parseCatecServicoPainel(raw: unknown): CatecServicoPainel {
  const data = raw as Record<string, unknown>
  const totaisRaw = (data.totais ?? {}) as Record<string, unknown>
  const alertasRaw = (totaisRaw.alertasPrazo ?? {}) as Record<string, unknown>
  const porStatusRaw = (totaisRaw.porStatus ?? {}) as Record<string, number>
  const porStatus = emptyPorStatus()

  for (const status of ORDEM_STATUS_SERVICO) {
    porStatus[status] = Number(porStatusRaw[status] ?? 0)
  }

  const servicos = Array.isArray(data.servicos) ? data.servicos.map(parsePainelItem) : []

  const servicosPrazoProximo = Array.isArray(data.servicosPrazoProximo)
    ? data.servicosPrazoProximo.map(parsePainelItem)
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
    servicosPrazoProximo,
    servicos
  }
}

export const ORDEM_STATUS_SERVICO: CatecServicoStatus[] = [
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

export const STATUS_SERVICO_ROTULO: Record<CatecServicoStatus, string> = {
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

export const STATUS_SERVICO_ROTULO_BADGE: Record<CatecServicoStatus, string> = {
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
