/** Tipos e parsers da assinatura eletrônica do contrato (Eixo 2). */

export type CatecAssinaturaStatusInterno =
  | 'CRIADO'
  | 'ENVIADO'
  | 'AGUARDANDO'
  | 'CONCLUIDO'
  | 'RECUSADO'
  | 'CANCELADO'
  | 'ERRO'

export type CatecAssinaturaProvedor = 'NONE' | 'STUB' | 'CLICKSIGN'

export type CatecAssinaturaEvento = {
  id: number
  tipo: string
  correlationId: string | null
  statusExterno: string | null
  processado: boolean
  criadoEm: string
}

export type CatecAssinatura = {
  id: number | null
  contratoId: number
  provedor: CatecAssinaturaProvedor | null
  externalEnvelopeId: string | null
  externalDocumentId: string | null
  statusInterno: CatecAssinaturaStatusInterno | null
  statusExterno: string | null
  documentoOrigemId: number | null
  documentoAssinadoId: number | null
  correlationId: string | null
  ultimaIteracao: string | null
  tentativas: number
  enviadoEm: string | null
  atualizadoEm: string | null
  concluidoEm: string | null
  contratoStatus: string | null
  providerAtivo: boolean
  providerCodigo: string
  eventos: CatecAssinaturaEvento[]
  signatarios: CatecAssinaturaSignatarioSnapshot[]
}

export type CatecAssinaturaSignatarioSnapshot = {
  id: number
  nome: string
  email: string
  papel: string
  rotulo: string
  usuarioId: number | null
}

export type CatecAssinaturaProviderInfo = {
  ativo: boolean
  provider: string
}

export type CatecEnviarAssinaturaPayload = {
  prazoInicioExecucaoDias: number
  prazoConclusaoDias: number
  emails: string[]
  papel?: 'EMPRESA' | 'RESPONSAVEL'
}

export type CatecSignatarioDisponivel = {
  nome: string
  email: string
  papel: string
  rotulo: string
}

export function chaveSignatarioCliente(s: Pick<CatecSignatarioDisponivel, 'papel' | 'email'>): string {
  return `${s.papel}|${s.email}`
}

export function parseChaveSignatarioCliente(chave: string): { papel: string; email: string } {
  const i = chave.indexOf('|')

  if (i < 0) {
    return { papel: '', email: chave }
  }

  return { papel: chave.slice(0, i), email: chave.slice(i + 1) }
}

export type CatecSignatarioCatec = {
  id: number
  usuarioId: number
  nome: string
  email: string
  ativo: boolean
  usuarioAtivo: boolean
  ordem: number
}

export type CatecAssinaturaConfig = {
  exigeSignatarioCatec: boolean
  permiteInteracaoManualContrato: boolean
  desativaAssinaturaViaApi: boolean
  clientePapelPreferido: 'EMPRESA' | 'RESPONSAVEL'
  atualizadoEm: string | null
  providerAtivo: boolean
  providerCodigo: string
  apiBaseUrl: string | null
  ambiente: string
  webhookPath: string
  webhookUrl: string | null
  webhookUrlPublica: boolean
  accessTokenConfigurado: boolean
  webhookSecretConfigurado: boolean
  webhookEventosEsperados: string[]
  signatariosCatec: CatecSignatarioCatec[]
}

export type CatecAssinaturaConfigUpdate = {
  exigeSignatarioCatec: boolean
  permiteInteracaoManualContrato: boolean
  desativaAssinaturaViaApi: boolean
  clientePapelPreferido: 'EMPRESA' | 'RESPONSAVEL'
}

export type CatecUsuarioCandidatoSignatario = {
  id: number
  nome: string
  email: string
}

export function parseCatecSignatarioDisponivel(data: unknown): CatecSignatarioDisponivel {
  const raw = (data ?? {}) as Record<string, unknown>

  return {
    nome: String(raw.nome ?? ''),
    email: String(raw.email ?? ''),
    papel: String(raw.papel ?? ''),
    rotulo: String(raw.rotulo ?? raw.papel ?? 'Signatário')
  }
}

export function parseCatecSignatariosDisponiveis(data: unknown): CatecSignatarioDisponivel[] {
  if (!Array.isArray(data)) {
    return []
  }

  return data.map(parseCatecSignatarioDisponivel)
}

export function parseCatecAssinaturaProviderInfo(data: unknown): CatecAssinaturaProviderInfo {
  const raw = (data ?? {}) as Record<string, unknown>

  return {
    ativo: raw.ativo === true,
    provider: String(raw.provider ?? 'none')
  }
}

function parseUltimaIteracao(raw: Record<string, unknown>): string | null {
  const value = raw.ultimaIteracao ?? raw.ultimoErro

  return value == null ? null : String(value)
}

/** Falha da iteração atual (PDF/provedor), não um mero registro de webhook/consulta. */
export function isFalhaUltimaIteracao(mensagem: string | null | undefined): boolean {
  if (!mensagem) {
    return false
  }

  return /não retornou URL|não está pronta|vazio|Falha ao|Evento de erro|Download do PDF/i.test(mensagem)
}

export function parseCatecAssinatura(data: unknown): CatecAssinatura {
  const raw = (data ?? {}) as Record<string, unknown>
  const eventosRaw = Array.isArray(raw.eventos) ? raw.eventos : []

  return {
    id: raw.id == null ? null : Number(raw.id),
    contratoId: Number(raw.contratoId ?? 0),
    provedor: raw.provedor == null ? null : (String(raw.provedor) as CatecAssinaturaProvedor),
    externalEnvelopeId: raw.externalEnvelopeId == null ? null : String(raw.externalEnvelopeId),
    externalDocumentId: raw.externalDocumentId == null ? null : String(raw.externalDocumentId),
    statusInterno:
      raw.statusInterno == null ? null : (String(raw.statusInterno) as CatecAssinaturaStatusInterno),
    statusExterno: raw.statusExterno == null ? null : String(raw.statusExterno),
    documentoOrigemId: raw.documentoOrigemId == null ? null : Number(raw.documentoOrigemId),
    documentoAssinadoId: raw.documentoAssinadoId == null ? null : Number(raw.documentoAssinadoId),
    correlationId: raw.correlationId == null ? null : String(raw.correlationId),
    ultimaIteracao: parseUltimaIteracao(raw),
    tentativas: Number(raw.tentativas ?? 0),
    enviadoEm: raw.enviadoEm == null ? null : String(raw.enviadoEm),
    atualizadoEm: raw.atualizadoEm == null ? null : String(raw.atualizadoEm),
    concluidoEm: raw.concluidoEm == null ? null : String(raw.concluidoEm),
    contratoStatus: raw.contratoStatus == null ? null : String(raw.contratoStatus),
    providerAtivo: raw.providerAtivo === true,
    providerCodigo: String(raw.providerCodigo ?? 'none'),
    eventos: eventosRaw.map(e => {
      const ev = (e ?? {}) as Record<string, unknown>

      return {
        id: Number(ev.id ?? 0),
        tipo: String(ev.tipo ?? ''),
        correlationId: ev.correlationId == null ? null : String(ev.correlationId),
        statusExterno: ev.statusExterno == null ? null : String(ev.statusExterno),
        processado: ev.processado === true,
        criadoEm: String(ev.criadoEm ?? '')
      }
    }),
    signatarios: parseCatecAssinaturaSignatariosSnapshot(raw.signatarios)
  }
}

function parseCatecAssinaturaSignatariosSnapshot(data: unknown): CatecAssinaturaSignatarioSnapshot[] {
  if (!Array.isArray(data)) {
    return []
  }

  return data.map(item => {
    const raw = (item ?? {}) as Record<string, unknown>

    return {
      id: Number(raw.id ?? 0),
      nome: String(raw.nome ?? ''),
      email: String(raw.email ?? ''),
      papel: String(raw.papel ?? ''),
      rotulo: String(raw.rotulo ?? raw.papel ?? 'Signatário'),
      usuarioId: raw.usuarioId == null ? null : Number(raw.usuarioId)
    }
  })
}

export function parseCatecSignatarioCatec(data: unknown): CatecSignatarioCatec {
  const raw = (data ?? {}) as Record<string, unknown>

  return {
    id: Number(raw.id ?? 0),
    usuarioId: Number(raw.usuarioId ?? 0),
    nome: String(raw.nome ?? ''),
    email: String(raw.email ?? ''),
    ativo: raw.ativo === true,
    usuarioAtivo: raw.usuarioAtivo === true,
    ordem: Number(raw.ordem ?? 0)
  }
}

export function parseCatecAssinaturaConfig(data: unknown): CatecAssinaturaConfig {
  const raw = (data ?? {}) as Record<string, unknown>
  const papelRaw = String(raw.clientePapelPreferido ?? 'RESPONSAVEL').toUpperCase()

  const clientePapelPreferido: 'EMPRESA' | 'RESPONSAVEL' =
    papelRaw === 'EMPRESA' ? 'EMPRESA' : 'RESPONSAVEL'

  const signatariosRaw = Array.isArray(raw.signatariosCatec) ? raw.signatariosCatec : []
  const eventosWebhookRaw = Array.isArray(raw.webhookEventosEsperados) ? raw.webhookEventosEsperados : []

  return {
    exigeSignatarioCatec: raw.exigeSignatarioCatec === true,
    permiteInteracaoManualContrato: raw.permiteInteracaoManualContrato === true,
    desativaAssinaturaViaApi: raw.desativaAssinaturaViaApi === true,
    clientePapelPreferido,
    atualizadoEm: raw.atualizadoEm == null ? null : String(raw.atualizadoEm),
    providerAtivo: raw.providerAtivo === true,
    providerCodigo: String(raw.providerCodigo ?? 'none'),
    apiBaseUrl: raw.apiBaseUrl == null || raw.apiBaseUrl === '' ? null : String(raw.apiBaseUrl),
    ambiente: String(raw.ambiente ?? 'desconhecido'),
    webhookPath: String(raw.webhookPath ?? ''),
    webhookUrl: raw.webhookUrl == null || raw.webhookUrl === '' ? null : String(raw.webhookUrl),
    webhookUrlPublica: raw.webhookUrlPublica === true,
    accessTokenConfigurado: raw.accessTokenConfigurado === true,
    webhookSecretConfigurado: raw.webhookSecretConfigurado === true,
    webhookEventosEsperados: eventosWebhookRaw.map(String),
    signatariosCatec: signatariosRaw.map(parseCatecSignatarioCatec)
  }
}

export function parseCatecUsuarioCandidatoSignatario(data: unknown): CatecUsuarioCandidatoSignatario {
  const raw = (data ?? {}) as Record<string, unknown>

  return {
    id: Number(raw.id ?? 0),
    nome: String(raw.nome ?? ''),
    email: String(raw.email ?? '')
  }
}

export function parseCatecUsuariosCandidatosSignatario(data: unknown): CatecUsuarioCandidatoSignatario[] {
  if (!Array.isArray(data)) {
    return []
  }

  return data.map(parseCatecUsuarioCandidatoSignatario)
}
