export type CatecLoginRequest = {
  email: string
  password: string
}

export type CatecNovaSenhaRequest = {
  senhaNova: string
}

export type CatecLoginResponse = {
  tokenType: string
  accessToken: string
  expiresInSeconds: number
  trocaSenhaObrigatoria?: boolean
}

export type CatecMeUser = {
  id: number
  nome: string
  email: string
  grupos: string[]
  permissoes: string[]
  ativo: boolean
  telefone: string | null
  requerTrocaSenha: boolean
}

export function parseCatecLoginResponse(raw: unknown): CatecLoginResponse {
  const data = raw as Record<string, unknown>

  return {
    tokenType: String(data.tokenType ?? 'Bearer'),
    accessToken: String(data.accessToken ?? ''),
    expiresInSeconds: Number(data.expiresInSeconds ?? 0),
    trocaSenhaObrigatoria: data.trocaSenhaObrigatoria === true
  }
}

export function parseCatecMeUser(raw: unknown): CatecMeUser {
  const data = raw as Record<string, unknown>
  const grupos = (data.grupos ?? []) as string[]
  const permissoes = (data.permissoes ?? []) as string[]

  return {
    id: Number(data.id),
    nome: String(data.nome ?? ''),
    email: String(data.email ?? ''),
    grupos,
    permissoes,
    ativo: Boolean(data.ativo),
    telefone: data.telefone != null ? String(data.telefone) : null,
    requerTrocaSenha: data.requerTrocaSenha === true
  }
}
