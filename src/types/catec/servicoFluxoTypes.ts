export type CatecPropostaStatus =
  | 'RASCUNHO'
  | 'PENDENTE_AVALIACAO'
  | 'AGUARDANDO_ENVIO'
  | 'ENVIADA_AO_CLIENTE'
  | 'AGUARDANDO_AJUSTE'
  | 'ACEITA'
  | 'NEGADA'

export type CatecContratoStatus =
  | 'RASCUNHO'
  | 'ENVIADO_AO_CLIENTE'
  | 'AGUARDANDO_ASSINATURA'
  | 'AGUARDANDO_AJUSTE'
  | 'ACEITO'
  | 'RECUSADO'

export type CatecTipoInteracaoFluxo = 'CONSIDERACOES_CLIENTE' | 'ACEITE_CLIENTE' | 'RECUSA_CLIENTE'

export const STATUS_PROPOSTA_ROTULO: Record<CatecPropostaStatus, string> = {
  RASCUNHO: 'Rascunho',
  PENDENTE_AVALIACAO: 'Pendente avaliação',
  AGUARDANDO_ENVIO: 'Aguardando envio ao cliente',
  ENVIADA_AO_CLIENTE: 'Enviada ao cliente',
  AGUARDANDO_AJUSTE: 'Aguardando ajuste',
  ACEITA: 'Aceita pelo cliente',
  NEGADA: 'Recusada pelo cliente'
}

export const STATUS_PROPOSTA_ROTULO_BADGE: Record<CatecPropostaStatus, string> = {
  RASCUNHO: 'Rascunho',
  PENDENTE_AVALIACAO: 'Pendente avaliação',
  AGUARDANDO_ENVIO: 'Aprovada',
  ENVIADA_AO_CLIENTE: 'Enviada',
  AGUARDANDO_AJUSTE: 'Aguardando ajuste',
  ACEITA: 'Aceita',
  NEGADA: 'Recusada pelo cliente'
}

export const STATUS_CONTRATO_ROTULO: Record<CatecContratoStatus, string> = {
  RASCUNHO: 'Em elaboração',
  ENVIADO_AO_CLIENTE: 'Enviado ao cliente',
  AGUARDANDO_ASSINATURA: 'Aguardando assinatura',
  AGUARDANDO_AJUSTE: 'Aguardando ajuste',
  ACEITO: 'Aceito pelo cliente',
  RECUSADO: 'Recusado pelo cliente'
}

export const STATUS_CONTRATO_ROTULO_BADGE: Record<CatecContratoStatus, string> = {
  RASCUNHO: 'Elaborando',
  ENVIADO_AO_CLIENTE: 'Enviado',
  AGUARDANDO_ASSINATURA: 'Aguardando assinatura',
  AGUARDANDO_AJUSTE: 'Aguardando ajuste',
  ACEITO: 'Aceito pelo cliente',
  RECUSADO: 'Recusado pelo cliente'
}

export const ORDEM_STATUS_PROPOSTA: CatecPropostaStatus[] = [
  'RASCUNHO',
  'PENDENTE_AVALIACAO',
  'AGUARDANDO_ENVIO',
  'ENVIADA_AO_CLIENTE',
  'AGUARDANDO_AJUSTE',
  'ACEITA',
  'NEGADA'
]

export const ORDEM_STATUS_CONTRATO: CatecContratoStatus[] = [
  'RASCUNHO',
  'ENVIADO_AO_CLIENTE',
  'AGUARDANDO_ASSINATURA',
  'AGUARDANDO_AJUSTE',
  'ACEITO',
  'RECUSADO'
]

export const TIPO_INTERACAO_ROTULO_PROPOSTA: Record<CatecTipoInteracaoFluxo, string> = {
  ACEITE_CLIENTE: 'Proposta aceita',
  RECUSA_CLIENTE: 'Proposta recusada',
  CONSIDERACOES_CLIENTE: 'Ajustar proposta'
}

export const TIPO_INTERACAO_ROTULO_CONTRATO: Record<CatecTipoInteracaoFluxo, string> = {
  ACEITE_CLIENTE: 'Contrato aceito',
  RECUSA_CLIENTE: 'Contrato recusado',
  CONSIDERACOES_CLIENTE: 'Ajustar contrato'
}

export const STATUS_PROPOSTA_UPLOAD: CatecPropostaStatus[] = [
  'RASCUNHO',
  'PENDENTE_AVALIACAO',
  'AGUARDANDO_AJUSTE',
  'NEGADA'
]
export const STATUS_PROPOSTA_ENVIADA: CatecPropostaStatus[] = [
  'ENVIADA_AO_CLIENTE',
  'AGUARDANDO_AJUSTE',
  'ACEITA',
  'NEGADA'
]
export const STATUS_PROPOSTA_RESPOSTA_CLIENTE: CatecPropostaStatus[] = [
  'ENVIADA_AO_CLIENTE',
  'AGUARDANDO_AJUSTE'
]

/** Normaliza status legados da API (ex.: APROVADA, RASCUNHO + avaliadaSocioEm). */
export function normalizarStatusProposta(
  status: string,
  avaliadaSocioEm?: string | null
): CatecPropostaStatus {
  if (status === 'APROVADA') return 'AGUARDANDO_ENVIO'
  if (status === 'RASCUNHO' && avaliadaSocioEm) return 'AGUARDANDO_ENVIO'

  return status as CatecPropostaStatus
}

export function propostaAguardandoEnvioAoCliente(proposta: {
  status: string
  avaliadaSocioEm?: string | null
}): boolean {
  return normalizarStatusProposta(proposta.status, proposta.avaliadaSocioEm) === 'AGUARDANDO_ENVIO'
}

export const STATUS_CONTRATO_UPLOAD: CatecContratoStatus[] = ['RASCUNHO', 'AGUARDANDO_AJUSTE', 'RECUSADO']
export const STATUS_CONTRATO_INTERACAO_CLIENTE: CatecContratoStatus[] = [
  'ENVIADO_AO_CLIENTE',
  'AGUARDANDO_ASSINATURA'
]

export type CatecDocumentoAnexo = {
  id: number
  nomeOriginal: string
  versao: number
  uploadedPorNome: string
  criadoEm: string
  tipoArquivo: string | null
}

export type CatecOrigemRespostaContrato = 'MANUAL' | 'ASSINATURA_ELETRONICA'

export const ORIGEM_RESPOSTA_ROTULO: Record<CatecOrigemRespostaContrato, string> = {
  MANUAL: 'Manual',
  ASSINATURA_ELETRONICA: 'Assinatura eletrônica'
}

export type CatecProposta = {
  id: number
  servicoId: number
  status: CatecPropostaStatus
  versao: number
  elaboradoPorId: number
  elaboradoPorNome: string
  enviadaClienteEm: string | null
  avaliadaSocioEm: string | null
  consideracoesPendentes: boolean
  comentarioCliente: string | null
  criadoEm: string
  atualizadoEm: string
  documentos: CatecDocumentoAnexo[]
}

export type CatecContrato = {
  id: number
  servicoId: number
  status: CatecContratoStatus
  elaboradoPorId: number
  elaboradoPorNome: string
  enviadoClienteEm: string | null
  aceitoClienteEm: string | null
  recusadoClienteEm: string | null
  consideracoesPendentes: boolean
  comentarioCliente: string | null
  criadoEm: string
  atualizadoEm: string
  documentos: CatecDocumentoAnexo[]
}

export type CatecInteracaoTimelineItem = {
  key: string
  titulo: string
  meta: string
  texto: string
  criadoEm: string
  origem: 'PROPOSTA' | 'CONTRATO'
}

export type CatecHistoricoFluxoItem = {
  origem: 'AUDITORIA' | 'INTERACAO'
  registroId: number
  tipoEntidade: string
  entidadeId: number
  acao: string | null
  statusAnterior: string | null
  statusNovo: string | null
  tipoInteracao: CatecTipoInteracaoFluxo | null
  texto: string | null
  usuarioNome: string
  ocorridoEm: string
  origemResposta: CatecOrigemRespostaContrato | null
}

export type CatecServicoFluxoResumo = {
  servicoId: number
  propostaStatus: CatecPropostaStatus | null
  contratoStatus: CatecContratoStatus | null
  ultimaInteracaoEm: string | null
}

export type CatecServicoFluxoData = {
  propostas: CatecProposta[]
  contrato: CatecContrato | null
  interacoes: CatecInteracaoTimelineItem[]
  historico: CatecHistoricoFluxoItem[]
}

export type CatecPropostaWorkflowActionKey =
  | 'solicitar-revisao'
  | 'aprovar-socio'
  | 'reprovar-socio'
  | 'enviar-cliente'

export function parseCatecDocumentoAnexo(raw: unknown): CatecDocumentoAnexo {
  const data = raw as Record<string, unknown>

  return {
    id: Number(data.id),
    nomeOriginal: String(data.nomeOriginal ?? ''),
    versao: Number(data.versao ?? 1),
    uploadedPorNome: String(data.uploadedPorNome ?? ''),
    criadoEm: String(data.criadoEm ?? ''),
    tipoArquivo: data.tipoArquivo == null ? null : String(data.tipoArquivo)
  }
}

export function parseCatecProposta(raw: unknown): CatecProposta {
  const data = raw as Record<string, unknown>
  const avaliadaSocioEm = data.avaliadaSocioEm == null ? null : String(data.avaliadaSocioEm)

  return {
    id: Number(data.id),
    servicoId: Number(data.servicoId),
    status: normalizarStatusProposta(String(data.status ?? 'RASCUNHO'), avaliadaSocioEm),
    versao: Number(data.versao ?? 1),
    elaboradoPorId: Number(data.elaboradoPorId ?? 0),
    elaboradoPorNome: String(data.elaboradoPorNome ?? ''),
    enviadaClienteEm: data.enviadaClienteEm == null ? null : String(data.enviadaClienteEm),
    avaliadaSocioEm,
    consideracoesPendentes: data.consideracoesPendentes === true,
    comentarioCliente: data.comentarioCliente == null ? null : String(data.comentarioCliente),
    criadoEm: String(data.criadoEm ?? ''),
    atualizadoEm: String(data.atualizadoEm ?? ''),
    documentos: []
  }
}

export function parseCatecPropostaList(raw: unknown): CatecProposta[] {
  if (!Array.isArray(raw)) return []

  return raw.map(parseCatecProposta)
}

export function parseCatecContrato(raw: unknown): CatecContrato {
  const data = raw as Record<string, unknown>

  return {
    id: Number(data.id),
    servicoId: Number(data.servicoId),
    status: String(data.status ?? 'RASCUNHO') as CatecContratoStatus,
    elaboradoPorId: Number(data.elaboradoPorId ?? 0),
    elaboradoPorNome: String(data.elaboradoPorNome ?? ''),
    enviadoClienteEm: data.enviadoClienteEm == null ? null : String(data.enviadoClienteEm),
    aceitoClienteEm: data.aceitoClienteEm == null ? null : String(data.aceitoClienteEm),
    recusadoClienteEm: data.recusadoClienteEm == null ? null : String(data.recusadoClienteEm),
    consideracoesPendentes: data.consideracoesPendentes === true,
    comentarioCliente: data.comentarioCliente == null ? null : String(data.comentarioCliente),
    criadoEm: String(data.criadoEm ?? ''),
    atualizadoEm: String(data.atualizadoEm ?? ''),
    documentos: []
  }
}

export function parseCatecHistoricoFluxoItem(raw: unknown): CatecHistoricoFluxoItem {
  const data = raw as Record<string, unknown>
  const origem = data.origem === 'INTERACAO' ? 'INTERACAO' : 'AUDITORIA'
  const origemRespostaRaw = data.origemResposta == null ? null : String(data.origemResposta)

  const origemResposta: CatecOrigemRespostaContrato | null =
    origemRespostaRaw === 'ASSINATURA_ELETRONICA' || origemRespostaRaw === 'MANUAL'
      ? origemRespostaRaw
      : null

  return {
    origem,
    registroId: Number(data.registroId ?? 0),
    tipoEntidade: String(data.tipoEntidade ?? ''),
    entidadeId: Number(data.entidadeId ?? 0),
    acao: data.acao == null ? null : String(data.acao),
    statusAnterior: data.statusAnterior == null ? null : String(data.statusAnterior),
    statusNovo: data.statusNovo == null ? null : String(data.statusNovo),
    tipoInteracao:
      data.tipoInteracao == null ? null : (String(data.tipoInteracao) as CatecTipoInteracaoFluxo),
    texto: data.texto == null ? null : String(data.texto),
    usuarioNome: String(data.usuarioNome ?? ''),
    ocorridoEm: String(data.ocorridoEm ?? ''),
    origemResposta
  }
}

export type CatecHistoricoPage = {
  content: CatecHistoricoFluxoItem[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
