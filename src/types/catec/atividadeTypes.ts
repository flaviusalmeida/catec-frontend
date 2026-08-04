import type { ThemeColor } from '@core/types'

export type CatecAtividadeStatus = 'A_FAZER' | 'EM_ANDAMENTO' | 'AGUARDANDO' | 'CONCLUIDA'

export type CatecAtividadePrioridade = 'BAIXA' | 'MEDIA' | 'ALTA'

export type CatecAtividadeTipo = 'ETAPA' | 'ATIVIDADE' | 'SUBATIVIDADE'

export type CatecAtividadeBoardAgrupar = 'ETAPA' | 'ATIVIDADE' | 'RESPONSAVEL' | 'PROJETO'

export const AGRUPAR_BOARD_DEFAULT: CatecAtividadeBoardAgrupar = 'PROJETO'

export type CatecAtividade = {
  id: number
  numero: number
  codigo: string
  projetoId: number
  projetoTitulo: string
  paiId: number | null
  paiCodigo: string | null
  nivel: number
  tipo: CatecAtividadeTipo
  titulo: string
  descricao: string | null
  status: CatecAtividadeStatus
  prioridade: CatecAtividadePrioridade
  responsavelId: number | null
  responsavelNome: string | null
  prazoEm: string | null
  ordem: number
  criadoPorId: number
  criadoPorNome: string
  criadoEm: string
  atualizadoEm: string
}

export type CatecAtividadeBoardColuna = {
  status: CatecAtividadeStatus
  rotulo: string
  atividades: CatecAtividade[]
}

export type CatecAtividadeBoardFaixa = {
  chave: string
  titulo: string
  atividadeId: number | null
  tipo: CatecAtividadeTipo | null
  status: CatecAtividadeStatus | null
  responsavelId: number | null
  responsavelNome: string | null
  colunas: CatecAtividadeBoardColuna[]
  subFaixas: CatecAtividadeBoardFaixa[]
}

export type CatecAtividadeBoard = {
  agrupar: CatecAtividadeBoardAgrupar
  colunas: { status: CatecAtividadeStatus; rotulo: string }[]
  faixas: CatecAtividadeBoardFaixa[]
}

export type CatecAtividadeCreateInput = {
  titulo: string
  descricao?: string | null
  status?: CatecAtividadeStatus
  prioridade?: CatecAtividadePrioridade
  responsavelId?: number | null
  prazoEm?: string | null
  ordem?: number | null
}

export type CatecAtividadeUpdateInput = {
  titulo: string
  descricao?: string | null
  status?: CatecAtividadeStatus
  prioridade?: CatecAtividadePrioridade
  responsavelId?: number | null
  prazoEm?: string | null
  ordem?: number | null
}

export type CatecAtividadeStatusPatchInput = {
  status: CatecAtividadeStatus
  ordem?: number | null
}

export type CatecAtividadeBoardFiltros = {
  projetoId?: number | null
  responsavelId?: number | null
  q?: string | null
  agrupar?: CatecAtividadeBoardAgrupar | null
}

export type CatecAtividadeDocumento = {
  id: number
  nomeOriginal: string
  mimeType: string
  tamanhoBytes: number
  versao: number
  uploadedPorId: number
  uploadedPorNome: string
  criadoEm: string
}

export type CatecAtividadeComentario = {
  id: number
  atividadeId: number
  texto: string
  criadoPorId: number
  criadoPorNome: string
  criadoEm: string
}

export type CatecAtividadeHistoricoItem = {
  id: number
  acao: string
  statusAnterior: string | null
  statusNovo: string | null
  payloadJson: string | null
  usuarioId: number
  usuarioNome: string
  criadoEm: string
}

export const ORDEM_STATUS_ATIVIDADE: CatecAtividadeStatus[] = [
  'A_FAZER',
  'EM_ANDAMENTO',
  'AGUARDANDO',
  'CONCLUIDA'
]

export const STATUS_ATIVIDADE_ROTULO: Record<CatecAtividadeStatus, string> = {
  A_FAZER: 'A fazer',
  EM_ANDAMENTO: 'Em andamento',
  AGUARDANDO: 'Aguardando',
  CONCLUIDA: 'Concluída'
}

export const PRIORIDADE_ATIVIDADE_ROTULO: Record<CatecAtividadePrioridade, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta'
}

export const TIPO_ATIVIDADE_ROTULO: Record<CatecAtividadeTipo, string> = {
  ETAPA: 'Etapa',
  ATIVIDADE: 'Atividade',
  SUBATIVIDADE: 'Subatividade'
}

export const TIPO_ATIVIDADE_SIGLA: Record<CatecAtividadeTipo, string> = {
  ETAPA: 'E',
  ATIVIDADE: 'A',
  SUBATIVIDADE: 'S'
}

export const AGRUPAR_BOARD_ROTULO: Record<CatecAtividadeBoardAgrupar, string> = {
  PROJETO: 'Projeto',
  ETAPA: 'Etapa',
  ATIVIDADE: 'Atividade',
  RESPONSAVEL: 'Responsável'
}

export const ORDEM_AGRUPAR_BOARD: CatecAtividadeBoardAgrupar[] = [
  'PROJETO',
  'ETAPA',
  'ATIVIDADE',
  'RESPONSAVEL'
]

export const PRIORIDADE_ATIVIDADE_COR: Record<CatecAtividadePrioridade, ThemeColor> = {
  BAIXA: 'info',
  MEDIA: 'warning',
  ALTA: 'error'
}

export const STATUS_ATIVIDADE_COR: Record<CatecAtividadeStatus, ThemeColor> = {
  A_FAZER: 'secondary',
  EM_ANDAMENTO: 'primary',
  AGUARDANDO: 'warning',
  CONCLUIDA: 'success'
}

export const TIPO_ATIVIDADE_COR: Record<CatecAtividadeTipo, ThemeColor> = {
  ETAPA: 'warning',
  ATIVIDADE: 'primary',
  SUBATIVIDADE: 'secondary'
}

function inferTipo(nivel: number, rawTipo: unknown): CatecAtividadeTipo {
  if (rawTipo === 'ETAPA' || rawTipo === 'ATIVIDADE' || rawTipo === 'SUBATIVIDADE') {
    return rawTipo
  }

  if (nivel === 2) return 'ATIVIDADE'
  if (nivel === 3) return 'SUBATIVIDADE'

  return 'ETAPA'
}

export function parseCatecAtividade(raw: unknown): CatecAtividade {
  const data = raw as Record<string, unknown>
  const nivel = Number(data.nivel ?? 1)

  return {
    id: Number(data.id),
    numero: Number(data.numero ?? data.id ?? 0),
    codigo: String(data.codigo ?? `CAT-${data.numero ?? data.id ?? 0}`),
    projetoId: Number(data.projetoId),
    projetoTitulo: String(data.projetoTitulo ?? ''),
    paiId: data.paiId == null ? null : Number(data.paiId),
    paiCodigo: data.paiCodigo == null ? null : String(data.paiCodigo),
    nivel,
    tipo: inferTipo(nivel, data.tipo),
    titulo: String(data.titulo ?? ''),
    descricao: data.descricao == null ? null : String(data.descricao),
    status: String(data.status ?? 'A_FAZER') as CatecAtividadeStatus,
    prioridade: String(data.prioridade ?? 'MEDIA') as CatecAtividadePrioridade,
    responsavelId: data.responsavelId == null ? null : Number(data.responsavelId),
    responsavelNome: data.responsavelNome == null ? null : String(data.responsavelNome),
    prazoEm: data.prazoEm == null ? null : String(data.prazoEm),
    ordem: Number(data.ordem ?? 0),
    criadoPorId: Number(data.criadoPorId ?? 0),
    criadoPorNome: String(data.criadoPorNome ?? ''),
    criadoEm: String(data.criadoEm ?? ''),
    atualizadoEm: String(data.atualizadoEm ?? '')
  }
}

export function parseCatecAtividadeList(raw: unknown): CatecAtividade[] {
  if (!Array.isArray(raw)) return []

  return raw.map(parseCatecAtividade)
}

function parseColuna(raw: unknown): CatecAtividadeBoardColuna {
  const data = raw as Record<string, unknown>
  const status = String(data.status ?? 'A_FAZER') as CatecAtividadeStatus
  const itens = data.itens ?? data.atividades

  return {
    status,
    rotulo: String(data.rotulo ?? STATUS_ATIVIDADE_ROTULO[status] ?? status),
    atividades: parseCatecAtividadeList(itens)
  }
}

export function parseCatecAtividadeBoard(raw: unknown): CatecAtividadeBoard {
  if (Array.isArray(raw)) {
    return {
      agrupar: AGRUPAR_BOARD_DEFAULT,
      colunas: ORDEM_STATUS_ATIVIDADE.map(status => ({
        status,
        rotulo: STATUS_ATIVIDADE_ROTULO[status]
      })),
      faixas: [
        {
          chave: 'todos',
          titulo: 'Todas',
          atividadeId: null,
          tipo: null,
          status: null,
          responsavelId: null,
          responsavelNome: null,
          colunas: raw.map(parseColuna),
          subFaixas: []
        }
      ]
    }
  }

  const data = (raw ?? {}) as Record<string, unknown>
  const agruparRaw = String(data.agrupar ?? AGRUPAR_BOARD_DEFAULT)
  const agrupar = (ORDEM_AGRUPAR_BOARD.includes(agruparRaw as CatecAtividadeBoardAgrupar)
    ? agruparRaw
    : AGRUPAR_BOARD_DEFAULT) as CatecAtividadeBoardAgrupar

  const colunasMeta = Array.isArray(data.colunas)
    ? (data.colunas as Record<string, unknown>[]).map(c => {
        const status = String(c.status ?? 'A_FAZER') as CatecAtividadeStatus

        return {
          status,
          rotulo: String(c.rotulo ?? STATUS_ATIVIDADE_ROTULO[status] ?? status)
        }
      })
    : ORDEM_STATUS_ATIVIDADE.map(status => ({
        status,
        rotulo: STATUS_ATIVIDADE_ROTULO[status]
      }))

  const faixasRaw = Array.isArray(data.faixas) ? data.faixas : []

  const faixas: CatecAtividadeBoardFaixa[] = faixasRaw.map(parseFaixa)

  return { agrupar, colunas: colunasMeta, faixas }
}

function parseFaixa(item: unknown): CatecAtividadeBoardFaixa {
  const f = (item ?? {}) as Record<string, unknown>
  const tipoRaw = f.tipo
  const statusRaw = f.status
  const status =
    statusRaw === 'A_FAZER' ||
    statusRaw === 'EM_ANDAMENTO' ||
    statusRaw === 'AGUARDANDO' ||
    statusRaw === 'CONCLUIDA'
      ? statusRaw
      : null

  return {
    chave: String(f.chave ?? ''),
    titulo: String(f.titulo ?? ''),
    atividadeId: f.atividadeId == null ? null : Number(f.atividadeId),
    tipo: tipoRaw === 'ETAPA' || tipoRaw === 'ATIVIDADE' || tipoRaw === 'SUBATIVIDADE' ? tipoRaw : null,
    status,
    responsavelId: f.responsavelId == null ? null : Number(f.responsavelId),
    responsavelNome: f.responsavelNome == null ? null : String(f.responsavelNome),
    colunas: Array.isArray(f.colunas) ? f.colunas.map(parseColuna) : boardColunasVazias(),
    subFaixas: Array.isArray(f.subFaixas) ? f.subFaixas.map(parseFaixa) : []
  }
}

export function boardColunasVazias(): CatecAtividadeBoardColuna[] {
  return ORDEM_STATUS_ATIVIDADE.map(status => ({
    status,
    rotulo: STATUS_ATIVIDADE_ROTULO[status],
    atividades: []
  }))
}

export function boardVazio(agrupar: CatecAtividadeBoardAgrupar = AGRUPAR_BOARD_DEFAULT): CatecAtividadeBoard {
  return {
    agrupar,
    colunas: ORDEM_STATUS_ATIVIDADE.map(status => ({
      status,
      rotulo: STATUS_ATIVIDADE_ROTULO[status]
    })),
    faixas: [
      {
        chave: 'todos',
        titulo: 'Todas',
        atividadeId: null,
        tipo: null,
        status: null,
        responsavelId: null,
        responsavelNome: null,
        colunas: boardColunasVazias(),
        subFaixas: []
      }
    ]
  }
}

export function flatAtividadesDoBoard(board: CatecAtividadeBoard): CatecAtividade[] {
  const flatFaixa = (f: CatecAtividadeBoardFaixa): CatecAtividade[] => [
    ...f.colunas.flatMap(c => c.atividades),
    ...f.subFaixas.flatMap(flatFaixa)
  ]

  return board.faixas.flatMap(flatFaixa)
}

export function contagemItensFaixa(faixa: CatecAtividadeBoardFaixa): number {
  if (faixa.subFaixas.length > 0) {
    return faixa.subFaixas.reduce((acc, sf) => acc + contagemItensFaixa(sf), 0)
  }

  return faixa.colunas.reduce((acc, c) => acc + c.atividades.length, 0)
}

export function parseCatecAtividadeDocumento(raw: unknown): CatecAtividadeDocumento {
  const data = raw as Record<string, unknown>

  return {
    id: Number(data.id),
    nomeOriginal: String(data.nomeOriginal ?? ''),
    mimeType: String(data.mimeType ?? ''),
    tamanhoBytes: Number(data.tamanhoBytes ?? 0),
    versao: Number(data.versao ?? 1),
    uploadedPorId: Number(data.uploadedPorId ?? 0),
    uploadedPorNome: String(data.uploadedPorNome ?? ''),
    criadoEm: String(data.criadoEm ?? '')
  }
}

export function parseCatecAtividadeDocumentoList(raw: unknown): CatecAtividadeDocumento[] {
  if (!Array.isArray(raw)) return []

  return raw.map(parseCatecAtividadeDocumento)
}

export function parseCatecAtividadeComentario(raw: unknown): CatecAtividadeComentario {
  const data = raw as Record<string, unknown>

  return {
    id: Number(data.id),
    atividadeId: Number(data.atividadeId),
    texto: String(data.texto ?? ''),
    criadoPorId: Number(data.criadoPorId ?? 0),
    criadoPorNome: String(data.criadoPorNome ?? ''),
    criadoEm: String(data.criadoEm ?? '')
  }
}

export function parseCatecAtividadeComentarioList(raw: unknown): CatecAtividadeComentario[] {
  if (!Array.isArray(raw)) return []

  return raw.map(parseCatecAtividadeComentario)
}

export function parseCatecAtividadeHistoricoItem(raw: unknown): CatecAtividadeHistoricoItem {
  const data = raw as Record<string, unknown>

  return {
    id: Number(data.id),
    acao: String(data.acao ?? ''),
    statusAnterior: data.statusAnterior == null ? null : String(data.statusAnterior),
    statusNovo: data.statusNovo == null ? null : String(data.statusNovo),
    payloadJson: data.payloadJson == null ? null : String(data.payloadJson),
    usuarioId: Number(data.usuarioId ?? 0),
    usuarioNome: String(data.usuarioNome ?? ''),
    criadoEm: String(data.criadoEm ?? '')
  }
}

export function parseCatecAtividadeHistoricoList(raw: unknown): CatecAtividadeHistoricoItem[] {
  if (!Array.isArray(raw)) return []

  return raw.map(parseCatecAtividadeHistoricoItem)
}

function rotuloStatusHistorico(codigo: string | null): string {
  if (!codigo) return '—'

  return STATUS_ATIVIDADE_ROTULO[codigo as CatecAtividadeStatus] ?? codigo
}

function rotuloPrioridadeHistorico(codigo: string | null): string {
  if (!codigo) return '—'

  return PRIORIDADE_ATIVIDADE_ROTULO[codigo as CatecAtividadePrioridade] ?? codigo
}

/** Texto amigável para um item de auditoria da atividade. */
export function tituloHistoricoAtividade(item: CatecAtividadeHistoricoItem): string {
  switch (item.acao) {
    case 'CRIAR':
      return 'Item criado'
    case 'EXCLUIR':
      return 'Item excluído'
    case 'ALTERAR_STATUS':
      return `Status: ${rotuloStatusHistorico(item.statusAnterior)} → ${rotuloStatusHistorico(item.statusNovo)}`
    case 'ALTERAR_RESPONSAVEL':
      return 'Responsável alterado'
    case 'ALTERAR_PRAZO':
      return 'Prazo alterado'
    case 'ALTERAR_PRIORIDADE':
      return item.statusAnterior || item.statusNovo
        ? `Prioridade: ${rotuloPrioridadeHistorico(item.statusAnterior)} → ${rotuloPrioridadeHistorico(item.statusNovo)}`
        : 'Prioridade alterada'
    case 'ANEXAR':
      return item.payloadJson ? `Anexo adicionado: ${item.payloadJson}` : 'Anexo adicionado'
    case 'REMOVER_ANEXO':
      return 'Anexo removido'
    default:
      return item.acao || 'Alteração registrada'
  }
}
