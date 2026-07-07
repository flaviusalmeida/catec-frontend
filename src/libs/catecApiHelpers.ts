import { mensagemErroApiFromBody } from '@/utils/catec/apiError'

export async function readCatecJsonBody(res: Response): Promise<unknown> {
  const text = await res.text()

  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export function assertCatecOk(res: Response, data: unknown, fallback: string, forbidden?: string): void {
  if (res.status === 403) {
    throw new Error(forbidden ?? 'Você não tem permissão para esta operação.')
  }

  if (!res.ok) {
    throw new Error(mensagemErroApiFromBody(data, fallback, res.status))
  }
}
