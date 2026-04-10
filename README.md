# Voto Transparente

> Plataforma cívica de transparência eleitoral com IA — ajude eleitores a pesquisar candidatos e descobrir quem melhor representa seus valores, com base em dados oficiais do governo brasileiro.

---

## O que é

O **Voto Transparente** é uma plataforma web pública e gratuita onde qualquer eleitor pode:

- **Raio-X do Candidato** — Pesquisar um candidato e receber um relatório completo baseado em fontes oficiais: candidaturas, financiamento de campanha, histórico parlamentar, processos no TCU, gastos de mandato e anúncios pagos em redes sociais.
- **Match de Valores** — Responder um questionário sobre prioridades (saúde, educação, segurança, meio ambiente, etc.) e receber uma recomendação de candidato com justificativa baseada em dados reais — não em opiniões.

**Princípio central:** a IA nunca opina. Ela apenas cruza dados oficiais e explica o que encontrou. Toda informação tem fonte rastreável.

---

## Objetivo

Combater a desinformação eleitoral democratizando o acesso a dados públicos que já existem, mas são difíceis de encontrar e interpretar. A aplicação conecta APIs oficiais do governo brasileiro a um modelo de linguagem capaz de sintetizar e apresentar essas informações de forma clara para qualquer cidadão.

---

## Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| 🔍 Raio-X do Candidato | Relatório completo com dados do TSE, TCU, Portal da Transparência e Meta Ad Library |
| 🗳️ Match de Valores | Questionário de prioridades temáticas + recomendação fundamentada em dados |
| 🤖 IA sem opinião | Modelo de linguagem orientado a citar fontes e nunca emitir posicionamento político |
| 📡 Dados em tempo real | Consulta APIs oficiais a cada pesquisa — sem banco de dados local |

---

## Arquitetura

```
┌──────────────────────────────────────────────────────────────────┐
│  USUÁRIO (Browser)                                               │
│  Next.js Frontend — Cloudflare Pages                             │
│  Páginas: Home / Raio-X do Candidato / Match de Valores          │
└────────────────────────┬─────────────────────────────────────────┘
                         │ HTTP (fetch)
┌────────────────────────▼─────────────────────────────────────────┐
│  BACKEND (Next.js API Routes — mesmo projeto)                    │
│  /api/candidato  →  orquestra IA + MCP                           │
│  /api/match      →  orquestra IA + MCP                           │
└──────────┬─────────────────────────────┬─────────────────────────┘
           │ Groq API                    │ HTTP (JSON-RPC)
┌──────────▼──────────┐      ┌───────────▼───────────────────────┐
│  Groq API           │      │  mcp-brasil (Render)              │
│  llama-3.3-70b      │      │  Servidor HTTP na porta 8000      │
│  Function Calling   │      │  363+ ferramentas → APIs gov BR   │
└─────────────────────┘      └───────────────────────────────────┘
```

**Fluxo de uma consulta:**
1. Usuário digita o nome de um candidato
2. Next.js envia a pergunta para a API Route
3. A API Route chama o Groq com a lista de ferramentas do MCP Brasil
4. O modelo decide quais ferramentas chamar (TSE, Transparência, TCU, etc.)
5. O servidor `mcp-brasil` consulta as APIs oficiais e retorna os dados
6. O modelo sintetiza e apresenta a resposta com as fontes citadas

---

## Tecnologias

| Categoria | Tecnologia |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) + TypeScript |
| UI | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) + [Lucide React](https://lucide.dev) |
| IA | [Groq API](https://groq.com) — modelo `llama-3.3-70b-versatile` |
| Dados gov. | [mcp-brasil](https://github.com/jxnxts/mcp-brasil) — servidor MCP com 363+ ferramentas |
| Deploy frontend | [Cloudflare Pages](https://pages.cloudflare.com) |
| Deploy backend MCP | [Render](https://render.com) |

---

## Pré-requisitos

- **Node.js** 20 ou superior — [nodejs.org](https://nodejs.org)
- **Python** 3.11 ou superior — [python.org](https://python.org) *(para rodar o mcp-brasil localmente)*
- **uv** (gerenciador Python): `pip install uv`
- **Git** — [git-scm.com](https://git-scm.com)
- Chave de API da **Groq** — [console.groq.com](https://console.groq.com) *(gratuita)*

---

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Obrigatória — motor de IA da aplicação
GROQ_API_KEY=sua_chave_aqui

# URL do servidor MCP Brasil (localhost em desenvolvimento, Render em produção)
MCP_BRASIL_URL=http://localhost:8000

# Opcionais — ampliam as ferramentas disponíveis no MCP Brasil
TRANSPARENCIA_API_KEY=sua_chave_aqui   # portaldatransparencia.gov.br/api-de-dados
DATAJUD_API_KEY=sua_chave_aqui         # datajud.cnj.jus.br
META_ACCESS_TOKEN=seu_token_aqui       # developers.facebook.com (Ad Library API)
```

> ⚠️ O arquivo `.env.local` nunca deve ser enviado ao GitHub — ele já está no `.gitignore` por padrão.

Sem as variáveis opcionais a aplicação ainda funciona. As ferramentas que dependem delas ficam simplesmente indisponíveis; as demais 38+ APIs abertas do MCP Brasil continuam funcionando normalmente.

---

## Como Executar Localmente

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/voto-transparente.git
cd voto-transparente
```

### 2. Instalar dependências do projeto

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Crie o `.env.local` conforme a seção acima e preencha pelo menos `GROQ_API_KEY` e `MCP_BRASIL_URL`.

### 4. Subir o servidor mcp-brasil localmente

Em um terminal separado:

```bash
pip install mcp-brasil
fastmcp run mcp_brasil.server:mcp --transport http --port 8000
```

Confirme que está rodando acessando `http://localhost:8000`.

### 5. Rodar a aplicação

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

---

## Scripts Disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm run start` | Inicia a aplicação em modo produção |
| `npm run lint` | Executa o linting com ESLint |

---

## Deploy em Produção

### Render — Servidor mcp-brasil (backend Python)

1. Crie uma conta em [render.com](https://render.com)
2. Clique em **New → Web Service** e conecte o repositório do [mcp-brasil](https://github.com/jxnxts/mcp-brasil)
3. Configure:
   - **Build Command:** `pip install mcp-brasil`
   - **Start Command:** `fastmcp run mcp_brasil.server:mcp --transport http --port 8000`
4. Adicione as variáveis de ambiente opcionais no painel do Render:
   - `TRANSPARENCIA_API_KEY`
   - `DATAJUD_API_KEY`
   - `META_ACCESS_TOKEN`
5. Após o deploy, copie a **URL pública** gerada (ex: `https://mcp-brasil.onrender.com`)

### Cloudflare Pages — Frontend + API Routes

1. Crie uma conta em [cloudflare.com](https://cloudflare.com)
2. Vá em **Pages → Create a project → Connect to Git**
3. Selecione o repositório `voto-transparente`
4. Configure o build:
   - **Build command:** `npm run build`
   - **Output directory:** `.next`
5. Adicione as variáveis de ambiente:
   - `GROQ_API_KEY` — sua chave da Groq API
   - `MCP_BRASIL_URL` — URL pública do servidor no Render (passo anterior)
6. Clique em **Save and Deploy**

A aplicação estará disponível em `https://voto-transparente.pages.dev` (ou domínio personalizado).

---

## Fontes de Dados

| Fonte | Categoria | O que consulta |
|---|---|---|
| [TSE](https://dadosabertos.tse.jus.br) | Eleitoral | Candidaturas, financiamento, resultados de eleições |
| [Portal da Transparência](https://portaldatransparencia.gov.br) | Gastos públicos | Contratos, sanções, gastos de mandato |
| [Câmara dos Deputados](https://dadosabertos.camara.leg.br) | Legislativo | Votações, gastos com cota parlamentar, projetos de lei |
| [Senado Federal](https://dadosabertos.senado.leg.br) | Legislativo | Matérias, votações, comissões |
| [TCU / TCE](https://portal.tcu.gov.br) | Auditoria | Processos, dívidas, entidades punidas |
| [CNJ / DataJud](https://datajud.cnj.jus.br) | Jurídico | Processos judiciais |
| [Meta Ad Library](https://www.facebook.com/ads/library) | Publicidade | Anúncios políticos pagos no Facebook e Instagram |

Todas as consultas são feitas via [mcp-brasil](https://github.com/jxnxts/mcp-brasil), servidor MCP open-source com 363+ ferramentas conectadas a APIs oficiais do governo brasileiro.

---

## Licença

MIT
