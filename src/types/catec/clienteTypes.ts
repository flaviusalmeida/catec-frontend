export type TipoPessoa = 'PF' | 'PJ'

export type CatecClienteResponsavel = {
  id: number
  nome: string
  email: string
  telefone: string
}

export type CatecCliente = {
  id: number
  tipoPessoa: TipoPessoa
  razaoSocialOuNome: string
  nomeFantasia: string | null
  documento: string | null
  email: string | null
  telefone: string | null
  enderecoLogradouro: string | null
  enderecoNumero: string | null
  enderecoComplemento: string | null
  enderecoCidade: string | null
  enderecoUf: string | null
  enderecoCep: string | null
  periodoFaturamento: string
  observacoes: string | null
  responsaveis: CatecClienteResponsavel[]
  criadoEm?: string
  atualizadoEm?: string
}

export type CatecClienteResponsavelRequest = {
  nome: string
  email: string
  telefone: string
}

export type CatecClienteRequest = {
  tipoPessoa: TipoPessoa
  razaoSocialOuNome: string
  nomeFantasia: string | null
  documento: string
  email: string
  telefone: string
  enderecoLogradouro: string | null
  enderecoNumero: string | null
  enderecoComplemento: string | null
  enderecoCidade: string | null
  enderecoUf: string | null
  enderecoCep: string | null
  periodoFaturamento: string
  observacoes: string | null
  responsaveis: CatecClienteResponsavelRequest[]
}

export function parseCatecClienteResponsavel(raw: unknown): CatecClienteResponsavel {
  const data = raw as Record<string, unknown>

  return {
    id: Number(data.id),
    nome: String(data.nome ?? ''),
    email: String(data.email ?? ''),
    telefone: String(data.telefone ?? '')
  }
}

export function parseCatecCliente(raw: unknown): CatecCliente {
  const data = raw as Record<string, unknown>
  const tipoPessoa = data.tipoPessoa === 'PJ' ? 'PJ' : 'PF'

  return {
    id: Number(data.id),
    tipoPessoa,
    razaoSocialOuNome: String(data.razaoSocialOuNome ?? ''),
    nomeFantasia: data.nomeFantasia == null ? null : String(data.nomeFantasia),
    documento: data.documento == null ? null : String(data.documento),
    email: data.email == null ? null : String(data.email),
    telefone: data.telefone == null ? null : String(data.telefone),
    enderecoLogradouro: data.enderecoLogradouro == null ? null : String(data.enderecoLogradouro),
    enderecoNumero: data.enderecoNumero == null ? null : String(data.enderecoNumero),
    enderecoComplemento: data.enderecoComplemento == null ? null : String(data.enderecoComplemento),
    enderecoCidade: data.enderecoCidade == null ? null : String(data.enderecoCidade),
    enderecoUf: data.enderecoUf == null ? null : String(data.enderecoUf),
    enderecoCep: data.enderecoCep == null ? null : String(data.enderecoCep),
    periodoFaturamento: String(data.periodoFaturamento ?? ''),
    observacoes: data.observacoes == null ? null : String(data.observacoes),
    responsaveis: Array.isArray(data.responsaveis) ? data.responsaveis.map(parseCatecClienteResponsavel) : [],
    criadoEm: data.criadoEm != null ? String(data.criadoEm) : undefined,
    atualizadoEm: data.atualizadoEm != null ? String(data.atualizadoEm) : undefined
  }
}

export function parseCatecClienteList(raw: unknown): CatecCliente[] {
  if (!Array.isArray(raw)) return []

  return raw.map(parseCatecCliente)
}

export type CatecClienteResumoCardTipo = 'TOTAL' | 'PF' | 'PJ' | 'COM_RESPONSAVEL'

export type CatecClienteResumoCard = {
  tipo: CatecClienteResumoCardTipo
  total: number
  totalInicioTrimestre: number
  variacaoPercentual: number
}

export type CatecClienteResumo = {
  periodoTipo: string
  periodoRotulo: string
  cards: CatecClienteResumoCard[]
}

export function parseCatecClienteResumo(raw: unknown): CatecClienteResumo {
  const data = raw as Record<string, unknown>
  const cardsRaw = Array.isArray(data.cards) ? data.cards : []

  return {
    periodoTipo: String(data.periodoTipo ?? 'TRIMESTRE'),
    periodoRotulo: String(data.periodoRotulo ?? ''),
    cards: cardsRaw.map(card => {
      const item = card as Record<string, unknown>

      return {
        tipo: String(item.tipo ?? 'TOTAL') as CatecClienteResumoCardTipo,
        total: Number(item.total ?? 0),
        totalInicioTrimestre: Number(item.totalInicioTrimestre ?? 0),
        variacaoPercentual: Number(item.variacaoPercentual ?? 0)
      }
    })
  }
}

export type CatecClienteResponsavelFormState = {
  nome: string
  email: string
  telefone: string
}

export type CatecClienteFormState = {
  tipoPessoa: TipoPessoa
  razaoSocialOuNome: string
  nomeFantasia: string
  documento: string
  email: string
  telefone: string
  enderecoLogradouro: string
  enderecoNumero: string
  enderecoComplemento: string
  enderecoCidade: string
  enderecoUf: string
  enderecoCep: string
  periodoFaturamento: string
  observacoes: string
  responsavel: CatecClienteResponsavelFormState
}

export const EMPTY_RESPONSAVEL_FORM: CatecClienteResponsavelFormState = {
  nome: '',
  email: '',
  telefone: ''
}

export const EMPTY_CLIENTE_FORM: CatecClienteFormState = {
  tipoPessoa: 'PF',
  razaoSocialOuNome: '',
  nomeFantasia: '',
  documento: '',
  email: '',
  telefone: '',
  enderecoLogradouro: '',
  enderecoNumero: '',
  enderecoComplemento: '',
  enderecoCidade: '',
  enderecoUf: '',
  enderecoCep: '',
  periodoFaturamento: '',
  observacoes: '',
  responsavel: { ...EMPTY_RESPONSAVEL_FORM }
}

export function rotuloTipoPessoa(tipo: TipoPessoa): string {
  return tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'
}
