export function formatVariacaoPercentual(valor: number): string {
  return `${Math.abs(Math.round(valor))}%`
}

export function trendFromVariacao(valor: number): 'positive' | 'negative' {
  return valor >= 0 ? 'positive' : 'negative'
}
