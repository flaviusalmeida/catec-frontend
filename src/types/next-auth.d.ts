import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      accessToken: string
      permissoes: string[]
      grupos: string[]
      requerTrocaSenha: boolean
      trocaSenhaObrigatoria: boolean
    } & DefaultSession['user']
  }

  interface User {
    id: string
    accessToken: string
    tokenType: string
    permissoes: string[]
    grupos: string[]
    requerTrocaSenha: boolean
    trocaSenhaObrigatoria: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    accessToken?: string
    tokenType?: string
    permissoes?: string[]
    grupos?: string[]
    requerTrocaSenha?: boolean
    trocaSenhaObrigatoria?: boolean
  }
}
