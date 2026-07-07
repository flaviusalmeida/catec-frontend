export type CatecPropostaPendenteSocio = {
  propostaId: number
  projetoId: number
  projetoTitulo: string
  clienteNome: string | null
  versao: number
  elaboradoPorNome: string
  criadoEm: string
}

export function parseCatecPropostaPendenteSocioList(raw: unknown): CatecPropostaPendenteSocio[] {
  if (!Array.isArray(raw)) return []

  return raw.map(item => {
    const data = item as Record<string, unknown>

    return {
      propostaId: Number(data.propostaId),
      projetoId: Number(data.projetoId),
      projetoTitulo: String(data.projetoTitulo ?? ''),
      clienteNome: data.clienteNome == null ? null : String(data.clienteNome),
      versao: Number(data.versao ?? 1),
      elaboradoPorNome: String(data.elaboradoPorNome ?? ''),
      criadoEm: String(data.criadoEm ?? '')
    }
  })
}
