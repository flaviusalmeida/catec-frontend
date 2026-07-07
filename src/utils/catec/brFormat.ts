export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

export function formatCpf(digits: string): string {
  const d = digits.slice(0, 11)

  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`

  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`
}

export function formatCnpj(digits: string): string {
  const d = digits.slice(0, 14)

  if (d.length <= 2) return d
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`

  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`
}

export function formatDocumentoByTipo(tipo: 'PF' | 'PJ', digits: string): string {
  return tipo === 'PF' ? formatCpf(digits) : formatCnpj(digits)
}

export function formatCep(digits: string): string {
  const d = onlyDigits(digits).slice(0, 8)

  if (d.length <= 5) return d

  return `${d.slice(0, 5)}-${d.slice(5)}`
}

export function formatTelefoneBrasil(value: string): string {
  const d = onlyDigits(value).slice(0, 11)

  if (d.length === 0) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`

  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`
}

export function documentoParaExibicao(tipo: 'PF' | 'PJ', documento: string | null): string {
  const d = onlyDigits(documento ?? '')

  return d ? formatDocumentoByTipo(tipo, d) : '—'
}
