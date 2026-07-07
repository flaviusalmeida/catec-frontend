export type CatecGrupoValor =
  | 'COLABORADOR'
  | 'ADMINISTRATIVO'
  | 'SOCIO'
  | 'SALA_TECNICA'
  | 'CAMPO'
  | 'FINANCEIRO'

export type CatecAdminUsuario = {
  id: number
  nome: string
  email: string
  telefone: string | null
  ativo: boolean
  requerTrocaSenha: boolean
  grupos: CatecGrupoValor[]
  criadoEm?: string
  atualizadoEm?: string
}

export type CatecUsuarioCreateInput = {
  nome: string
  email: string
  telefone: string | null
  grupos: CatecGrupoValor[]
}

export type CatecUsuarioUpdateInput = {
  nome: string
  email: string
  telefone: string | null
  ativo: boolean
  grupos: CatecGrupoValor[]
}

export function parseCatecAdminUsuario(raw: unknown): CatecAdminUsuario {
  const data = raw as Record<string, unknown>

  return {
    id: Number(data.id),
    nome: String(data.nome ?? ''),
    email: String(data.email ?? ''),
    telefone: data.telefone == null ? null : String(data.telefone),
    ativo: data.ativo === true,
    requerTrocaSenha: data.requerTrocaSenha === true,
    grupos: Array.isArray(data.grupos) ? (data.grupos as CatecGrupoValor[]) : [],
    criadoEm: data.criadoEm != null ? String(data.criadoEm) : undefined,
    atualizadoEm: data.atualizadoEm != null ? String(data.atualizadoEm) : undefined
  }
}

export function parseCatecAdminUsuarioList(raw: unknown): CatecAdminUsuario[] {
  if (!Array.isArray(raw)) return []

  return raw.map(parseCatecAdminUsuario)
}

export type CatecUsuarioFormState = {
  nome: string
  email: string
  telefone: string
  ativo: boolean
  grupos: Set<CatecGrupoValor>
}

export const GRUPOS_OPCOES: ReadonlyArray<{
  valor: CatecGrupoValor
  rotulo: string
  detalhe: string
}> = [
  {
    valor: 'COLABORADOR',
    rotulo: 'Colaborador',
    detalhe: 'Operações do dia a dia, sem gestão de usuários.'
  },
  {
    valor: 'ADMINISTRATIVO',
    rotulo: 'Administrativo',
    detalhe: 'Gestão de usuários e cadastros administrativos sensíveis.'
  },
  {
    valor: 'SOCIO',
    rotulo: 'Sócio',
    detalhe: 'Visão estratégica, aprovações e direcionamento de alto nível.'
  },
  {
    valor: 'SALA_TECNICA',
    rotulo: 'Sala técnica',
    detalhe: 'Análises técnicas e apoio especializado interno.'
  },
  {
    valor: 'CAMPO',
    rotulo: 'Campo',
    detalhe: 'Inspeções, medições e registos em obra.'
  },
  {
    valor: 'FINANCEIRO',
    rotulo: 'Financeiro',
    detalhe: 'Faturação, pagamentos e relatórios financeiros.'
  }
]

export function rotuloGrupo(valor: string): string {
  return GRUPOS_OPCOES.find(g => g.valor === valor)?.rotulo ?? valor
}
