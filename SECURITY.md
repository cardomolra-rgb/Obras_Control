# Segurança do OBRA CONTROL

- **Dados:** Neon PostgreSQL com RLS em todas as tabelas (cada usuário só acessa as próprias linhas). O navegador nunca recebe a `DATABASE_URL`; acessa a Data API com o token do Neon Auth.
- **Trilha de auditoria:** gatilhos no banco registram toda inclusão, alteração e exclusão em `audit_trail`. O app só pode ler; ninguém altera ou apaga pelo navegador.
- **Cadastro:** fechado. Contas novas só pelo painel do Neon Auth.
- **Segredos:** apenas em variáveis de ambiente da Vercel (`DABRA_API_KEY`, `CNPJWS_TOKEN`, `DABRA_BASE_URL`). Nunca no código, nunca com prefixo `VITE_`.
- **Cabeçalhos:** CSP, HSTS, nosniff, Referrer-Policy e bloqueio de iframe em `vercel.json`.
- **CI:** build, testes de segurança (`npm test`) e `npm audit` a cada envio. A branch `main` exige o CI aprovado.
- **Migrações:** em `sql/`. Antes de qualquer migração, crie um snapshot no Neon.

Encontrou um problema de segurança? Avise o responsável pelo sistema diretamente; não abra issue pública.
