# CATEC — frontend (Next.js / Vuexy)

Frontend oficial do sistema CATEC. Consome a API Spring Boot (`NEXT_PUBLIC_API_BASE_URL`, padrão `http://localhost:8080`).

Documentação do produto (funcional, técnica e manual de desenvolvimento): repositório `catec-doc` → `Analise Projeto/docs/README.md`.

Notas rápidas deste repo: [docs/FRONTEND.md](docs/FRONTEND.md).

## Pré-requisitos

- Node.js 20+ e [pnpm](https://pnpm.io/)
- Backend em execução (repositório `catec-backend`)

## Início rápido

```bash
cp .env.example .env
# Preencha NEXTAUTH_SECRET: openssl rand -base64 32

pnpm install
pnpm dev
```

- **App:** http://localhost:3000
- **Login:** http://localhost:3000/login
- **Área autenticada:** http://localhost:3000/catec/projetos
- **Credenciais iniciais:** `consultoria@catec.eng.br` / `Catec@Inicial1` (trocar senha no primeiro login)

Interface em português, sem prefixo `/pt` ou `/en` nas URLs.

## Scripts úteis

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Servidor de desenvolvimento (Webpack) |
| `pnpm dev:turbo` | Turbopack — evitar no Mac |
| `pnpm build` | Build de produção |
| `pnpm test:e2e` | Smoke tests Playwright |
| `pnpm clean` | Remove `.next` |

## Variáveis principais

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_API_BASE_URL` | URL da API CATEC |
| `NEXTAUTH_SECRET` | Segredo do NextAuth (obrigatório) |
| `NEXTAUTH_URL` | URL base do NextAuth |
