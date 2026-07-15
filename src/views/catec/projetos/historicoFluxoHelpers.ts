import type {
  CatecHistoricoFluxoItem,
  CatecProposta,
  CatecTipoInteracaoFluxo
} from '@/types/catec/projetoFluxoTypes'
import { TIPO_INTERACAO_ROTULO_PROPOSTA } from '@/types/catec/projetoFluxoTypes'

function tituloInteracaoHistorico(tipo: CatecTipoInteracaoFluxo, entidade: string): string {
  const ent = entidade.toUpperCase()

  switch (tipo) {
    case 'ACEITE_CLIENTE':
      return ent === 'CONTRATO' ? 'Contrato aceito pelo cliente' : 'Proposta aceita pelo cliente'
    case 'RECUSA_CLIENTE':
      return ent === 'CONTRATO' ? 'Contrato recusado pelo cliente' : 'Proposta recusada pelo cliente'
    case 'CONSIDERACOES_CLIENTE':
      return ent === 'CONTRATO' ? 'Cliente solicitou ajustes no contrato' : 'Cliente solicitou ajustes na proposta'
  }
}

function tituloRegistroInteracao(acao: string, tipoEntidade: string): string | null {
  if (!acao.startsWith('REGISTRO_')) return null

  const tipo = acao.slice('REGISTRO_'.length) as CatecTipoInteracaoFluxo

  if (!(tipo in TIPO_INTERACAO_ROTULO_PROPOSTA)) return null

  return tituloInteracaoHistorico(tipo, tipoEntidade)
}

function tituloAcaoAuditoria(acao: string, tipoEntidade: string): string {
  const ent = tipoEntidade.toUpperCase()

  const registro = tituloRegistroInteracao(acao, tipoEntidade)

  if (registro) return registro

  switch (acao) {
    case 'CRIAR':
      if (ent === 'CONTRATO') return 'Contrato criado'
      if (ent === 'PROPOSTA') return 'Proposta comercial iniciada'

      return 'Projeto criado'
    case 'SINCRONIZAR_PROPOSTA':
    case 'ATUALIZACAO_MANUAL_STATUS':
      return 'Status atualizado'
    case 'ENVIAR_CLIENTE':
      if (ent === 'CONTRATO') return 'Contrato enviado ao cliente'

      return 'Proposta enviada ao cliente'
    case 'SUBMETER_AVALIACAO_SOCIO':
      return 'Proposta enviada para revisão'
    case 'REPROVAR_SOCIO':
    case 'DEVOLVER_RASCUNHO_SOCIO':
      return 'Proposta devolvida para ajustes'
    case 'APROVAR_SOCIO':
      return 'Proposta aprovada pelo sócio'
    case 'PROPOSTA_ACEITA_CLIENTE':
      return 'Proposta aceita pelo cliente'
    case 'PROPOSTA_NEGADA_CLIENTE':
      return 'Proposta recusada pelo cliente'
    case 'PROPOSTA_AJUSTE_CLIENTE':
      return 'Cliente solicitou ajustes na proposta'
    case 'CONTRATO_ACEITO_CLIENTE':
      return 'Contrato aceito pelo cliente'
    case 'CONTRATO_RECUSADO_CLIENTE':
      return 'Contrato recusado pelo cliente'
    default:
      return acao
        .replaceAll('_', ' ')
        .toLowerCase()
        .replace(/\b\w/g, letra => letra.toUpperCase())
  }
}

export function formatarDataHoraHistorico(iso: string | null): string {
  if (!iso) return '—'

  const data = new Date(iso)
  const dia = data.toLocaleDateString('pt-BR')
  const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  return `${dia} às ${hora}`
}

export function tituloHistoricoItem(item: CatecHistoricoFluxoItem): string {
  if (item.origem === 'INTERACAO' && item.tipoInteracao) {
    return tituloInteracaoHistorico(item.tipoInteracao, item.tipoEntidade)
  }

  if (item.acao) {
    return tituloAcaoAuditoria(item.acao, item.tipoEntidade)
  }

  return item.origem === 'AUDITORIA' ? 'Evento registrado' : 'Interação registrada'
}

export function metaHistoricoItem(item: CatecHistoricoFluxoItem): string {
  const data = formatarDataHoraHistorico(item.ocorridoEm)
  const usuario = item.usuarioNome?.trim()

  return usuario ? `${data} • ${usuario}` : data
}

export type HistoricoEntidadeTipo = 'PROJETO' | 'PROPOSTA' | 'CONTRATO'

export function iconeEntidadeHistorico(tipo: HistoricoEntidadeTipo): string {
  switch (tipo) {
    case 'PROPOSTA':
      return 'tabler-file'
    case 'CONTRATO':
      return 'tabler-file-text'
    default:
      return 'tabler-folder'
  }
}

export const ICONE_HISTORICO_PADRAO = 'tabler-pin'

const ICONES_ACAO: Record<string, string> = {
  CRIAR: 'tabler-folder',
  SINCRONIZAR_PROPOSTA: 'tabler-refresh',
  ENVIAR_CLIENTE: 'tabler-send',
  SUBMETER_AVALIACAO_SOCIO: 'tabler-user-check',
  APROVAR_SOCIO: 'tabler-circle-check',
  REPROVAR_SOCIO: 'tabler-arrow-back-up',
  PROPOSTA_ACEITA_CLIENTE: 'tabler-heart-handshake',
  PROPOSTA_NEGADA_CLIENTE: 'tabler-x',
  PROPOSTA_AJUSTE_CLIENTE: 'tabler-message',
  CONTRATO_ACEITO_CLIENTE: 'tabler-file-check',
  CONTRATO_RECUSADO_CLIENTE: 'tabler-file-x',
  ATUALIZACAO_MANUAL_STATUS: 'tabler-edit',
  DEVOLVER_RASCUNHO_SOCIO: 'tabler-arrow-back-up'
}

function iconeInteracao(tipo: CatecTipoInteracaoFluxo, entidade: string): string {
  const ent = entidade.toUpperCase()

  switch (tipo) {
    case 'ACEITE_CLIENTE':
      return ent === 'CONTRATO' ? 'tabler-file-check' : 'tabler-heart-handshake'
    case 'RECUSA_CLIENTE':
      return ent === 'CONTRATO' ? 'tabler-file-x' : 'tabler-x'
    case 'CONSIDERACOES_CLIENTE':
      return 'tabler-message'
  }
}

function iconeRegistroInteracao(acao: string, tipoEntidade: string): string | null {
  if (!acao.startsWith('REGISTRO_')) return null

  const tipo = acao.slice('REGISTRO_'.length) as CatecTipoInteracaoFluxo

  if (!(tipo in TIPO_INTERACAO_ROTULO_PROPOSTA)) return null

  return iconeInteracao(tipo, tipoEntidade)
}

export function iconeHistoricoItem(item: CatecHistoricoFluxoItem): string {
  if (item.origem === 'INTERACAO' && item.tipoInteracao) {
    return iconeInteracao(item.tipoInteracao, item.tipoEntidade)
  }

  const acao = item.acao ?? ''
  const registro = iconeRegistroInteracao(acao, item.tipoEntidade)

  if (registro) return registro

  if (acao === 'CRIAR' && item.tipoEntidade.toUpperCase() === 'CONTRATO') {
    return 'tabler-file'
  }

  return ICONES_ACAO[acao] ?? ICONE_HISTORICO_PADRAO
}

export function historicoTemTransicaoStatus(item: CatecHistoricoFluxoItem): boolean {
  return Boolean(item.statusAnterior || item.statusNovo)
}

/** Normaliza status legado ou contextual do histórico para exibição alinhada ao domínio atual. */
export function statusHistoricoParaExibicao(
  item: CatecHistoricoFluxoItem,
  status: string,
  papel: 'anterior' | 'novo'
): string {
  const ent = item.tipoEntidade.toUpperCase()

  if (ent === 'PROPOSTA' && item.acao === 'APROVAR_SOCIO' && papel === 'novo' && (status === 'RASCUNHO' || status === 'APROVADA')) {
    return 'AGUARDANDO_ENVIO'
  }

  return status
}

export function tipoEntidadeHistorico(item: CatecHistoricoFluxoItem): HistoricoEntidadeTipo {
  const ent = item.tipoEntidade.toUpperCase()

  if (ent === 'PROPOSTA') return 'PROPOSTA'
  if (ent === 'CONTRATO') return 'CONTRATO'

  return 'PROJETO'
}

export function rotuloEntidadeHistorico(item: CatecHistoricoFluxoItem, _propostas: CatecProposta[]): string {
  const tipo = tipoEntidadeHistorico(item)

  if (tipo === 'PROPOSTA') return 'Proposta'
  if (tipo === 'CONTRATO') return 'Contrato'

  return 'Projeto'
}

export function metaHistoricoComEntidade(item: CatecHistoricoFluxoItem, propostas: CatecProposta[]): string {
  const entidade = rotuloEntidadeHistorico(item, propostas)
  const resto = metaHistoricoItem(item)

  return `${entidade} • ${resto}`
}
