# Voto Transparente — Plano de Desenvolvimento

> Documento vivo. Atualizar conforme o projeto avança.
> Criado em: 2026-04-09

---

## Visão Geral da Arquitetura

```
┌──────────────────────────────────────────────────────────────────┐
│  USUÁRIO (Browser)                                               │
│  Next.js Frontend — Cloudflare Pages                            │
│  Páginas: Home / Raio-X do Candidato / Match de Valores         │
└────────────────────────┬─────────────────────────────────────────┘
                         │ HTTP (fetch)
┌────────────────────────▼─────────────────────────────────────────┐
│  BACKEND (Next.js API Routes — mesmo projeto)                    │
│  /api/candidato  →  orquestra Gemini + MCP                      │
│  /api/match      →  orquestra Gemini + MCP                      │
└──────────┬─────────────────────────────┬────────────────────────┘
           │ Gemini API                  │ HTTP (JSON-RPC)
┌──────────▼──────────┐      ┌───────────▼───────────────────────┐
│  Google Gemini API  │      │  mcp-brasil (Render)              │
│  gemini-2.5-flash   │      │  Servidor HTTP na porta 8000      │
│  Function Calling   │      │  363 ferramentas → APIs gov BR    │
└─────────────────────┘      └───────────────────────────────────┘
```

---

## Fases de Desenvolvimento

### FASE 1 — Fundação do Projeto
**Objetivo:** Ter o projeto Next.js criado, configurado e no GitHub.

#### Tarefas
- [ ] Criar projeto Next.js com TypeScript e Tailwind
  ```bash
  npx create-next-app@latest voto-transparente --typescript --tailwind --app --src-dir
  ```
- [ ] Instalar dependências principais
  ```bash
  npm install @google/generative-ai
  npx shadcn@latest init
  ```
- [ ] Mover `.env.local` para a raiz do projeto Next.js
- [ ] Criar repositório no GitHub e fazer primeiro commit
- [ ] Configurar `.gitignore` (garantir que `.env.local` está ignorado)

#### Resultado esperado
Projeto rodando em `http://localhost:3000` com página inicial padrão do Next.js.

---

### FASE 2 — Integração com o MCP Brasil
**Objetivo:** Next.js consegue conversar com o servidor mcp-brasil.

#### Tarefas
- [ ] Criar `src/lib/mcp-client.ts` — cliente HTTP para o mcp-brasil
  - Função para iniciar sessão MCP
  - Função para listar as ferramentas disponíveis
  - Função para executar uma ferramenta
- [ ] Criar `src/lib/mcp-tools.ts` — definição das ferramentas relevantes
  - Mapear as tools de eleições (TSE)
  - Mapear as tools de transparência
  - Mapear as tools de processos judiciais
- [ ] Criar API route de teste: `GET /api/mcp/tools`
  - Deve retornar a lista de ferramentas disponíveis
- [ ] Testar localmente com mcp-brasil rodando na porta 8000

#### Resultado esperado
Acessar `/api/mcp/tools` e ver a lista das ferramentas do mcp-brasil.

---

### FASE 3 — Integração com o Gemini
**Objetivo:** Gemini consegue usar as ferramentas do MCP para responder perguntas.

#### Tarefas
- [ ] Criar `src/lib/gemini.ts` — cliente do Gemini
  - Configurar SDK com `GEMINI_API_KEY`
  - Configurar o modelo `gemini-2.5-flash`
  - Implementar o loop de function calling:
    1. Enviar pergunta + lista de tools ao Gemini
    2. Gemini decide qual tool chamar
    3. Backend executa a tool no mcp-brasil
    4. Retorna resultado ao Gemini
    5. Repetir até Gemini ter resposta final
- [ ] Criar API route de teste: `POST /api/chat`
  - Recebe uma pergunta em texto livre
  - Retorna resposta do Gemini com dados reais
- [ ] Testar com pergunta simples: "Quem é Lula?"

#### Resultado esperado
Enviar uma pergunta para `/api/chat` e receber resposta com dados do TSE.

---

### FASE 4 — Raio-X do Candidato
**Objetivo:** Funcionalidade completa de pesquisa de candidato.

#### Tarefas

**Backend:**
- [ ] Criar `POST /api/candidato`
  - Recebe: `{ nome: string, cargo?: string, estado?: string }`
  - Prompt do sistema: instruir Gemini a buscar dados completos
    - Dados eleitorais (TSE)
    - Financiamento de campanha
    - Histórico parlamentar (se aplicável)
    - Processos/sanções (TCU/Transparência)
    - Anúncios pagos (Meta)
  - Retorna relatório estruturado
- [ ] Implementar streaming da resposta (SSE) para UX mais rápida

**Frontend:**
- [ ] Página `src/app/candidato/page.tsx`
  - Campo de busca por nome
  - Seletor de estado (opcional)
  - Botão "Pesquisar"
- [ ] Componente `RelatorioCandidato.tsx`
  - Seções: Dados Pessoais / Campanha / Histórico / Processos / Anúncios
  - Cada seção com fonte citada
- [ ] Estado de loading com animação
- [ ] Tratamento de erro (candidato não encontrado, etc.)

#### Resultado esperado
Usuário digita um nome, clica em pesquisar e vê um relatório completo.

---

### FASE 5 — Match de Valores
**Objetivo:** Funcionalidade de recomendação de candidato por valores.

#### Tarefas

**Backend:**
- [ ] Criar `POST /api/match`
  - Recebe: `{ valores: string[], cargo: string, estado: string, municipio?: string }`
  - Prompt do sistema: instruir Gemini a buscar candidatos ao cargo e cruzar com valores
  - Retorna: lista de candidatos ordenados por aderência com justificativa

**Frontend:**
- [ ] Página `src/app/match/page.tsx`
- [ ] Componente `QuestionarioValores.tsx`
  - Passo 1: Selecionar cargo (Presidente, Governador, Senador, Deputado, Prefeito, Vereador)
  - Passo 2: Selecionar estado/município
  - Passo 3: Marcar temas prioritários (checkboxes):
    - Segurança pública
    - Saúde
    - Educação
    - Meio ambiente
    - Economia e emprego
    - Combate à corrupção
    - Habitação
    - Transporte público
  - Passo 4: Campo livre "O que mais importa para você?"
- [ ] Componente `ResultadoMatch.tsx`
  - Card por candidato com % de aderência
  - Explicação baseada em dados reais
  - Link para ver Raio-X completo do candidato

#### Resultado esperado
Usuário preenche questionário e recebe recomendações fundamentadas.

---

### FASE 6 — Interface e Experiência
**Objetivo:** Aplicação visualmente polida e fácil de usar.

#### Tarefas
- [ ] Página inicial (`src/app/page.tsx`)
  - Apresentação clara do projeto
  - Dois cards de acesso: Raio-X e Match de Valores
  - Aviso de transparência: "Dados de fontes oficiais do governo"
- [ ] Layout global com header e footer
  - Header: logo + navegação
  - Footer: fontes de dados + aviso de uso responsável
- [ ] Responsividade mobile (Tailwind)
- [ ] Tema de cores (verde/amarelo/azul — Brasil cívico, sem ser partidário)
- [ ] Componente de loading global
- [ ] Páginas de erro (404, erro de API)

#### Resultado esperado
Aplicação com aparência profissional e usável no celular.

---

### FASE 7 — Deploy em Produção
**Objetivo:** Aplicação online e acessível para qualquer pessoa.

#### Tarefas

**Render (mcp-brasil):**
- [ ] Criar `render.yaml` ou configurar via painel
- [ ] Definir comando de start do servidor mcp-brasil
- [ ] Configurar variáveis de ambiente no Render:
  - `TRANSPARENCIA_API_KEY`
  - `DATAJUD_API_KEY`
  - `META_ACCESS_TOKEN`
- [ ] Testar URL pública do servidor MCP

**Cloudflare Pages (frontend + API):**
- [ ] Conectar repositório GitHub ao Cloudflare Pages
- [ ] Configurar variáveis de ambiente:
  - `GEMINI_API_KEY`
  - `MCP_BRASIL_URL` (URL do Render)
- [ ] Configurar build command: `npm run build`
- [ ] Testar URL pública da aplicação

#### Resultado esperado
Aplicação online em URL pública (ex: voto-transparente.pages.dev).

---

## Decisões Técnicas

### Por que streaming (SSE) nas respostas?
As consultas ao mcp-brasil podem chamar múltiplas APIs em sequência, o que pode
levar 10-30 segundos. Com streaming, o usuário vê o texto sendo gerado em tempo
real em vez de esperar uma tela em branco.

### Por que shadcn/ui?
Componentes prontos e acessíveis (Accordion, Card, Badge, Progress) que aceleram
o desenvolvimento sem precisar criar do zero. Totalmente customizável via Tailwind.

### Por que não usar banco de dados?
O MVP não precisa de persistência. Cada consulta é independente e os dados vêm
diretamente das APIs do governo em tempo real. Simplifica o deploy e elimina
custos de banco.

### Sobre os prompts do sistema
O prompt do Gemini deve ser muito bem escrito para garantir que:
1. A IA sempre cita a fonte dos dados
2. A IA nunca emite opinião política própria
3. A IA informa quando não encontrar dados suficientes
4. A linguagem é acessível para qualquer eleitor

---

## Ordem de Implementação Recomendada

```
Fase 1 (Fundação)
    ↓
Fase 2 (MCP)  ←  testar aqui antes de avançar
    ↓
Fase 3 (Gemini + MCP)  ←  testar aqui antes de avançar
    ↓
Fase 4 (Raio-X)  ←  primeira funcionalidade real
    ↓
Fase 6 parcial (Home + layout)
    ↓
Fase 5 (Match de Valores)
    ↓
Fase 6 completa (polish)
    ↓
Fase 7 (Deploy)
```

---

## Riscos e Mitigações

| Risco | Probabilidade | Mitigação |
|-------|--------------|-----------|
| APIs do governo fora do ar | Média | Mensagem de erro clara para o usuário |
| Gemini não encontrar candidato | Alta | Prompt robusto + fallback para dados parciais |
| Limite de requisições Gemini free | Baixa | Cache de respostas frequentes |
| mcp-brasil dormindo no Render | Alta | Implementar health check periódico |

---

*Plano criado em: 2026-04-09*
