/** Base URL da API Spring Boot CATEC. */
export const CATEC_API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'
).replace(/\/$/, '')
