# Frontend CATEC

## Projeto

| Item | Valor |
|------|--------|
| Stack | Next.js 16, React 19, MUI 7, NextAuth |
| Package manager | **pnpm** |
| URL dev | http://localhost:3000 |
| Login | `/login` |
| Home pós-login | `/catec/projetos` |

Interface em **português** (sem i18n / sem prefixo de idioma nas URLs).

## Pré-requisitos

- Node.js 20+
- [pnpm](https://pnpm.io/)
- API Spring Boot em http://localhost:8080 (repositório `catec-backend`)
- PostgreSQL via `docker compose up -d` no repositório do backend

## Configuração

```bash
cp .env.example .env
```

Variáveis mínimas para desenvolvimento:

| Variável | Exemplo |
|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8080` |
| `NEXTAUTH_SECRET` | string aleatória (32+ caracteres) |
| `NEXTAUTH_URL` | `http://localhost:3000/api/auth` |

Menus demo do template Vuexy ficam ocultos por padrão. Para exibir: `NEXT_PUBLIC_SHOW_VUEXY_DEMOS=true`.

### Problemas comuns

**`NO_SECRET` / `JWT_SESSION_ERROR`**

1. Confirme `.env` com `NEXTAUTH_SECRET` preenchido.
2. Limpe cookies de `localhost:3000`.
3. Reinicie o dev server após editar `.env`.

**`Turbopack Error`**

Use `pnpm dev` (Webpack por defeito). Evite `pnpm dev:turbo`.

## Executar

```bash
pnpm install
pnpm dev
```

## Testes e2e (smoke)

```bash
pnpm test:e2e
```

Requer API e `NEXTAUTH_SECRET` no `.env`.

## Rotas CATEC

| Rota | Descrição |
|------|-----------|
| `/login` | Entrada |
| `/catec/definir-senha` | Troca de senha obrigatória |
| `/catec/projetos` | Lista de projetos |
| `/catec/clientes` | Clientes |
| `/catec/usuarios` | Usuários |
| `/catec/grupos` | Grupos de acesso |
