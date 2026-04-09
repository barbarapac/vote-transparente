# Voto Transparente — Checklist de Pendências

> Tudo que precisa ser resolvido **antes de começar a codar**.
> Marque cada item conforme for concluindo.

---

## BLOCO 1 — Contas e Plataformas

Contas gratuitas que precisam existir para hospedar e versionar o projeto.

- [ ] **GitHub** — Repositório do código
  - Acesse: https://github.com
  - Crie uma conta (ou use uma existente)
  - Depois de criar o projeto, suba o código aqui

- [ ] **Google** — Para obter a chave da Gemini API
  - Uma conta Google comum já serve (Gmail, etc.)
  - Não precisa criar conta nova se já tiver

- [ ] **Cloudflare** — Hospedagem do frontend (gratuito, sem restrição)
  - Acesse: https://cloudflare.com
  - Clique em "Sign Up" → plano Free
  - Usado para: publicar o site para o mundo

- [ ] **Render** — Hospedagem do servidor MCP Brasil (backend Python)
  - Acesse: https://render.com
  - Clique em "Get Started for Free"
  - Usado para: rodar o mcp-brasil como servidor HTTP

---

## BLOCO 2 — Chaves de API Obrigatórias

Sem essas, a aplicação não funciona.

### Gemini API (Google AI Studio)
- [ ] Acesse: https://aistudio.google.com
- [ ] Faça login com sua conta Google
- [ ] Clique em **"Get API key"** → **"Create API key"**
- [ ] Copie a chave e guarde em local seguro
- [ ] Variável de ambiente: `GEMINI_API_KEY`

---

## BLOCO 3 — Chaves de API do MCP Brasil (Opcionais, mas importantes)

O MCP Brasil funciona sem essas chaves, mas **as ferramentas mais relevantes
para transparência e eleições dependem delas**. Todas são gratuitas.

### Portal da Transparência (CGU)
- [ ] Acesse: https://portaldatransparencia.gov.br/api-de-dados
- [ ] Clique em **"Solicitar chave de API"**
- [ ] Preencha o formulário (nome, e-mail, uso pretendido)
- [ ] Confirme pelo e-mail recebido
- [ ] Variável de ambiente: `TRANSPARENCIA_API_KEY`
- **Dá acesso a:** Gastos do governo, contratos, sanções, servidores públicos

### DataJud / CNJ (Processos Judiciais)
- [ ] Acesse: https://datajud-wiki.cnj.jus.br/api-publica/acesso
- [ ] Faça o cadastro no portal CNJ
- [ ] Solicite a chave de acesso à API pública
- [ ] Variável de ambiente: `DATAJUD_API_KEY`
- **Dá acesso a:** Processos judiciais de candidatos e políticos

### Meta Ad Library (Anúncios Políticos)
- [ ] Acesse: https://developers.facebook.com
- [ ] Faça login com conta do Facebook
- [ ] Vá em **"Meus Apps"** → **"Criar App"** → tipo "Outro"
- [ ] No painel do app, procure por **"Ad Library API"**
- [ ] Gere o token de acesso
- [ ] Variável de ambiente: `META_ACCESS_TOKEN`
- **Dá acesso a:** Quanto cada candidato gastou em anúncios no Facebook/Instagram

---

## BLOCO 4 — Ambiente de Desenvolvimento Local

O que precisa estar instalado no computador para desenvolver.

- [ ] **Node.js** (versão 20 ou superior)
  - Acesse: https://nodejs.org → baixe a versão LTS
  - Verifique: `node --version` no terminal

- [ ] **Python** (versão 3.11 ou superior) — apenas para rodar o mcp-brasil localmente
  - Acesse: https://python.org → baixe a versão mais recente
  - Verifique: `python --version` no terminal

- [ ] **uv** (gerenciador de pacotes Python, mais rápido que pip)
  - No terminal: `pip install uv`
  - Verifique: `uv --version`

- [ ] **Git**
  - Acesse: https://git-scm.com → baixe e instale
  - Verifique: `git --version` no terminal

- [ ] **VS Code** (editor de código) — ou outro de sua preferência
  - Acesse: https://code.visualstudio.com

---

## BLOCO 5 — Teste do MCP Brasil Localmente

Antes de subir no Render, confirmar que o mcp-brasil funciona na máquina.

- [ ] Instalar o mcp-brasil:
  ```bash
  pip install mcp-brasil
  ```

- [ ] Rodar como servidor HTTP local:
  ```bash
  fastmcp run mcp_brasil.server:mcp --transport http --port 8000
  ```

- [ ] Confirmar que está rodando acessando: http://localhost:8000

- [ ] Testar uma ferramenta básica (sem precisar de chave):
  ```bash
  curl http://localhost:8000/tools
  ```
  Deve retornar a lista das 363 ferramentas disponíveis.

---

## BLOCO 6 — Arquivo .env.local (após ter as chaves)

Criar na raiz do projeto Next.js com as chaves obtidas:

```env
# Obrigatória
GEMINI_API_KEY=sua_chave_aqui

# URL do servidor MCP Brasil (local em dev, Render em produção)
MCP_BRASIL_URL=http://localhost:8000

# Opcionais — MCP Brasil
TRANSPARENCIA_API_KEY=sua_chave_aqui
DATAJUD_API_KEY=sua_chave_aqui
META_ACCESS_TOKEN=seu_token_aqui
```

> **IMPORTANTE:** O arquivo `.env.local` nunca deve ser enviado ao GitHub.
> Ele já fica ignorado automaticamente pelo `.gitignore` do Next.js.

---

## Resumo Visual do Status

```
BLOCO 1 — Contas          [ ] GitHub  [ ] Google  [ ] Cloudflare  [ ] Render
BLOCO 2 — IA              [ ] Gemini API Key
BLOCO 3 — MCP Brasil      [ ] Transparência  [ ] DataJud  [ ] Meta
BLOCO 4 — Dev Local       [ ] Node.js  [ ] Python  [ ] uv  [ ] Git  [ ] VSCode
BLOCO 5 — Teste MCP       [ ] Instalar  [ ] Rodar local  [ ] Confirmar tools
BLOCO 6 — Env             [ ] Criar .env.local com todas as chaves
```

---

*Documento criado em: 2026-04-09*
*Quando todos os blocos estiverem completos, o desenvolvimento pode começar.*
