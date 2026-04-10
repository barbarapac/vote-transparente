# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Comandos de Desenvolvimento

```bash
npm run dev      # Dev server em localhost:3000
npm run build    # Build de produção
npm start        # Rodar build de produção
npm run lint     # ESLint (sem flag de fix — rode manualmente se precisar)
```

**Servidor MCP Brasil (pré-requisito para qualquer funcionalidade de dados):**
```bash
pip install mcp-brasil
fastmcp run mcp_brasil.server:mcp --transport http --port 8000
```

Não há testes automatizados configurados.

## Arquitetura

Aplicação cívica que cruza dados oficiais do governo brasileiro com IA para ajudar eleitores a pesquisar candidatos. A IA nunca emite opinião — apenas apresenta dados com fontes.

### Fluxo principal

```
Browser → Next.js API Route → Groq LLaMA 3.3 70B (function calling)
                                      ↕
                              mcp-brasil (HTTP/JSON-RPC)
                              363 tools → APIs gov BR (TSE, TCU, Câmara, Senado, etc.)
```

### Camadas

- **Frontend** (`src/app/*/page.tsx`): Páginas client-side — Home, Raio-X do Candidato (`/candidato`), Match de Valores (`/match`). Tema escuro com Tailwind + shadcn/ui.
- **API Routes** (`src/app/api/`): Cada rota monta um prompt específico e chama `consultarComIA()`. Rotas: `/api/chat` (pergunta livre), `/api/candidato` (relatório de candidato), `/api/match` (match por valores), `/api/mcp/tools` (lista ferramentas).
- **Orquestração LLM** (`src/lib/llm.ts`): Função central `consultarComIA(pergunta)` — inicia sessão MCP, carrega tools (cache 5min), executa loop de tool calling (até 10 rodadas) via Groq SDK, trunca respostas grandes (8k chars).
- **Cliente MCP** (`src/lib/mcp-client.ts`): Comunicação HTTP com mcp-brasil via JSON-RPC 2.0 sobre SSE. Funções: `createMcpSession()`, `listMcpTools()`, `callMcpTool()`.

### Decisões importantes

- **Groq (não Gemini)**: Migrado de Gemini para Groq LLaMA 3.3 70B. O `@google/generative-ai` ainda está no package.json mas não é mais usado — `src/lib/gemini.ts` foi deletado. A dependência `groq-sdk` precisa ser adicionada ao package.json.
- **Sem banco de dados**: MVP stateless — dados vêm ao vivo das APIs do governo a cada consulta.
- **Sem streaming**: Respostas completas (não SSE), com loading de 10-30s.
- **MCP como servidor separado**: mcp-brasil (Python) roda independente; Next.js comunica via HTTP.

## Variáveis de Ambiente (.env.local)

```
GROQ_API_KEY=...           # Obrigatória — LLM
MCP_BRASIL_URL=...         # Default: http://localhost:8000
TRANSPARENCIA_API_KEY=...  # Opcional — Portal da Transparência
DATAJUD_API_KEY=...        # Opcional — CNJ/DataJud
META_ACCESS_TOKEN=...      # Opcional — Meta Ad Library
```

## Stack

- Next.js 16.2.3 (App Router) / React 19 / TypeScript 5
- Tailwind CSS 4 + shadcn/ui (estilo base-nova, tema escuro)
- Groq SDK com LLaMA 3.3 70B (function calling)
- mcp-brasil para APIs do governo brasileiro
- Path alias: `@/*` → `./src/*`
