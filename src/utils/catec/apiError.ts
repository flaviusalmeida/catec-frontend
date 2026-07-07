type ApiErrorBody = {
  mensagem?: string
}

export function mensagemErroApiFromBody(body: unknown, fallback: string, status?: number): string {
  if (body && typeof body === 'object' && 'mensagem' in body) {
    const mensagem = String((body as ApiErrorBody).mensagem).trim()

    if (mensagem) {
      return mensagem
    }
  }

  return status != null ? `${fallback} (${status})` : fallback
}

export async function mensagemErroApi(res: Response, fallback: string): Promise<string> {
  const body = await res.json().catch(() => null)

  return mensagemErroApiFromBody(body, fallback, res.status)
}
