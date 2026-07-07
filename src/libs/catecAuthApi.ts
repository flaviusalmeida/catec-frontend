'use client'

import { catecApiFetch } from '@/libs/catecApi'
import type { CatecLoginResponse, CatecNovaSenhaRequest } from '@/types/catec/authTypes'
import { parseCatecLoginResponse } from '@/types/catec/authTypes'
import { mensagemErroApiFromBody } from '@/utils/catec/apiError'

/** POST /api/v1/auth/trocar-senha (requer Bearer da sessão). */
export async function trocarSenhaCatec(senhaNova: string): Promise<CatecLoginResponse> {
  const body: CatecNovaSenhaRequest = { senhaNova }

  const res = await catecApiFetch('/api/v1/auth/trocar-senha', {
    method: 'POST',
    body: JSON.stringify(body)
  })

  const text = await res.text()

  let data: unknown = null

  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }

  if (!res.ok) {
    throw new Error(mensagemErroApiFromBody(data, 'Não foi possível definir a senha.', res.status))
  }

  const login = parseCatecLoginResponse(data)

  if (!login.accessToken) {
    throw new Error('Resposta inválida do servidor.')
  }

  return login
}
