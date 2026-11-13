# OBRA CONTROL

Controle financeiro e operacional de obras: despesas por obra, recebimentos, cronograma, lucro real e relatórios em PDF e Excel. A mesma conta funciona no computador e no celular.

## Como funciona

- **Interface:** página única em `index.html`, `src/app.js` e `src/style.css`, empacotada com Vite.
- **Login e dados:** Neon (Managed Better Auth + Data API) pelo pacote `@neon/neon-js`.
- **Banco:** esquema e políticas de segurança por usuário em `sql/schema.sql`.

## Rodar no computador

```bash
npm install
npm run dev
```

## Publicar

`npm run build` gera a pasta `dist`. Na Vercel, use o preset Vite. Depois de publicar, adicione o endereço do site aos domínios confiáveis do login no Neon.

O endereço do banco pode ser trocado pela variável `VITE_NEON_DATABASE_URL` (URL https do banco, sem usuário nem senha).
