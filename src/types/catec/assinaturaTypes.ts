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
  ultimoErro: string | null
  tentativas: number
  enviadoEm: string | null
  atualizadoEm: string | null
  concluidoEm: string | null
  contratoStatus: string | null
  providerAtivo: boolean
  providerCodigo: string
  eventos: CatecAssinaturaEvento[]
}

export type CatecAssinaturaProviderInfo = {
  ativo: boolean
  provider: string
}

export type CatecEnviarAssinaturaPayload = {
  prazoInicioExecucaoDias: number
  prazoConclusaoDias: number
  emails: string[]
}

export type CatecSignatarioDisponivel = {
  nome: string
  email: string
  papel: string
  rotulo: string
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
    ultimoErro: raw.ultimoErro == null ? null : String(raw.ultimoErro),
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
    })
  }
}
