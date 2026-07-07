import { CATEC_API_BASE_URL } from '@/libs/catecConfig'
import type { CatecLoginRequest, CatecMeUser, CatecNovaSenhaRequest } from '@/types/catec/authTypes'
import { parseCatecLoginResponse, parseCatecMeUser } from '@/types/catec/authTypes'

function resolveUrl(path: string): string {
  return path.startsWith('http') ? path : `${CATEC_API_BASE_URL}${path}`
}

export async function catecApiFetchServer(
  path: string,
  accessToken: string,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers)

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }

  if (init.body != null && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  headers.set('Authorization', `Bearer ${accessToken}`)

  return fetch(resolveUrl(path), { ...init, headers })
}

/** Login público — usado pelo NextAuth `authorize` (Fase 4B-05). */
export async function postCatecLogin(body: CatecLoginRequest): Promise<Response> {
  return fetch(resolveUrl('/api/v1/auth/login'), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
}

/** Troca de senha autenticada — usado após login com senha provisória. */
export async function postCatecTrocarSenha(accessToken: string, body: CatecNovaSenhaRequest): Promise<Response> {
  return catecApiFetchServer('/api/v1/auth/trocar-senha', accessToken, {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

export async function trocarSenhaCatecServer(
  accessToken: string,
  senhaNova: string
): Promise<{ login: ReturnType<typeof parseCatecLoginResponse>; me: CatecMeUser }> {
  const res = await postCatecTrocarSenha(accessToken, { senhaNova })

  const text = await res.text()

  let data: unknown = null

  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }

  if (!res.ok) {
    const mensagem =
      data && typeof data === 'object' && 'mensagem' in data
        ? String((data as { mensagem?: string }).mensagem)
        : `Não foi possível definir a senha (${res.status})`

    throw new Error(mensagem)
  }

  const login = parseCatecLoginResponse(data)

  if (!login.accessToken) {
    throw new Error('Resposta inválida do servidor.')
  }

  const me = await fetchCatecMe(login.accessToken)

  return { login, me }
}

export async function fetchCatecMe(accessToken: string): Promise<CatecMeUser> {
  const res = await catecApiFetchServer('/api/v1/me', accessToken)

  if (!res.ok) {
    throw new Error('Não foi possível carregar o perfil do usuário.')
  }

  return parseCatecMeUser(await res.json())
}
