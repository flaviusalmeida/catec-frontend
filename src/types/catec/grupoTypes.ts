export type CatecGrupo = {
  id: number
  codigo: string
  nome: string
  descricao: string | null
  ativo: boolean
  sistema: boolean
  permissoes: string[]
  criadoEm: string
  atualizadoEm: string
}

export type CatecGrupoCreateInput = {
  nome: string
  descricao: string | null
  permissoes: string[]
}

export type CatecGrupoUpdateInput = {
  nome: string
  descricao: string | null
  ativo: boolean
  permissoes: string[]
}

export function parseCatecGrupo(raw: unknown): CatecGrupo {
  const data = raw as Record<string, unknown>

  return {
    id: Number(data.id),
    codigo: String(data.codigo ?? ''),
    nome: String(data.nome ?? ''),
    descricao: data.descricao == null ? null : String(data.descricao),
    ativo: data.ativo === true,
    sistema: data.sistema === true,
    permissoes: Array.isArray(data.permissoes) ? data.permissoes.map(String) : [],
    criadoEm: String(data.criadoEm ?? ''),
    atualizadoEm: String(data.atualizadoEm ?? '')
  }
}

export function parseCatecGrupoList(raw: unknown): CatecGrupo[] {
  if (!Array.isArray(raw)) return []

  return raw.map(parseCatecGrupo)
}

export function parseCatecPermissaoCatalogo(raw: unknown): CatecPermissaoCatalogo {
  const data = raw as Record<string, unknown>
  const tipo = data.tipo === 'ACAO' ? 'ACAO' : 'TELA'

  return {
    id: Number(data.id),
    codigo: String(data.codigo ?? ''),
    nome: String(data.nome ?? ''),
    tipo,
    modulo: String(data.modulo ?? ''),
    descricao: data.descricao == null ? null : String(data.descricao)
  }
}

export function parseCatecPermissaoCatalogoList(raw: unknown): CatecPermissaoCatalogo[] {
  if (!Array.isArray(raw)) return []

  return raw.map(parseCatecPermissaoCatalogo)
}

export type CatecPermissaoCatalogo = {
  id: number
  codigo: string
  nome: string
  tipo: 'TELA' | 'ACAO'
  modulo: string
  descricao: string | null
}

export type CatecGrupoFormState = {
  nome: string
  descricao: string
  ativo: boolean
  permissoes: Set<string>
}

export const MODULO_LABEL: Record<string, string> = {
  acesso: 'Acesso',
  painel: 'Painel',
  projeto: 'Projeto',
  atividade: 'Atividades',
  cliente: 'Clientes',
  usuario: 'Usuários',
  proposta: 'Propostas',
  contrato: 'Contrato',
  documento: 'Documentos',
  interacao: 'Interações',
  grupo: 'Grupos'
}

export function rotuloModulo(modulo: string): string {
  return MODULO_LABEL[modulo] ?? modulo.charAt(0).toUpperCase() + modulo.slice(1)
}

export function emptyGrupoForm(): CatecGrupoFormState {
  return {
    nome: '',
    descricao: '',
    ativo: true,
    permissoes: new Set()
  }
}

export function grupoToForm(grupo: CatecGrupo): CatecGrupoFormState {
  return {
    nome: grupo.nome,
    descricao: grupo.descricao ?? '',
    ativo: grupo.ativo,
    permissoes: new Set(grupo.permissoes)
  }
}

export function agruparPermissoesPorModulo(
  catalogo: CatecPermissaoCatalogo[]
): Map<string, CatecPermissaoCatalogo[]> {
  const map = new Map<string, CatecPermissaoCatalogo[]>()

  for (const p of catalogo) {
    const list = map.get(p.modulo) ?? []

    list.push(p)
    map.set(p.modulo, list)
  }

  for (const [modulo, list] of map) {
    list.sort((a, b) => {
      if (a.tipo !== b.tipo) return a.tipo === 'TELA' ? -1 : 1

      return a.nome.localeCompare(b.nome, 'pt-BR')
    })
    map.set(modulo, list)
  }

  return map
}

export function modulosOrdenados(map: Map<string, CatecPermissaoCatalogo[]>): string[] {
  return [...map.keys()].sort((a, b) => rotuloModulo(a).localeCompare(rotuloModulo(b), 'pt-BR'))
}

export function slugCodigoGrupo(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40)
}
