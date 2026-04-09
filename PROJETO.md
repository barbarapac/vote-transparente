# Voto Transparente — Documentação de Projeto

> Aplicação cívica que usa IA + dados oficiais do governo brasileiro para ajudar
> eleitores a pesquisar candidatos e descobrir quem melhor representa seus valores.

---

## 1. Visão do Produto

### O que é

Uma plataforma web gratuita e pública onde qualquer eleitor pode:

1. **Raio-X do Candidato** — Digitar o nome de um candidato e receber um
   relatório completo baseado em dados oficiais: candidaturas, financiadores,
   bens declarados, histórico parlamentar (se aplicável), processos no TCU,
   gastos de mandato e anúncios pagos em redes sociais.

2. **Match de Valores** — Responder um questionário rápido sobre o que prioriza
   (segurança pública, saúde, meio ambiente, educação, economia, etc.), informar
   o cargo e a cidade/estado, e receber uma recomendação de candidato com
   explicação baseada em dados reais — não em opiniões.

### Princípio central

> A IA **nunca opina**. Ela apenas cruza dados oficiais e explica o que encontrou.
> Toda informação tem fonte rastreável.

---

## 2. Fonte de Dados — MCP Brasil

O projeto usa o servidor **mcp-brasil** (https://github.com/jxnxts/mcp-brasil),
um servidor MCP que expõe **363 ferramentas** conectadas a APIs oficiais do
governo brasileiro. Abaixo, as categorias mais relevantes para o projeto:

| Categoria             | Fonte          | Nº Tools | O que dá pra buscar                                    |
|-----------------------|----------------|----------|--------------------------------------------------------|
| Electoral             | TSE            | 15       | Candidatos, eleições por cargo/município, campanha     |
| Transparência         | Portal Transp. | 54       | Gastos, contratos, sanções, servidores públicos        |
| Legislativo (Câmara)  | Câmara         | 11       | Votações, gastos cota, projetos de lei                 |
| Legislativo (Senado)  | Senado         | 26       | Matérias, votações, comissões                          |
| Auditoria             | TCU/TCE        | 9+       | Processos, dívidas, entidades punidas                  |
| Publicidade política  | Meta           | 6        | Anúncios pagos, gastos em redes sociais                |
| Jurídico              | CNJ/DataJud    | 7+       | Processos judiciais                                    |

---

## 3. Avaliação do Lovable

**O que é:** Plataforma de geração de código via IA (tipo "descreva seu app e
ele constrói"). Gera React + Tailwind + Vite com qualidade.

### Prós
- Prototipagem de UI extremamente rápida
- Interface visual intuitiva, sem precisar codificar do zero
- Integração nativa com GitHub (exporta o código)
- Deploy com um clique para domínio próprio

### Contras
- **Plano gratuito muito limitado**: apenas 5 créditos/dia (30/mês)
  — cada mensagem/alteração consome créditos
- Plano pago: $25/mês (Pro) ou $50/mês (Business)
- **Sem backend próprio**: para conectar APIs externas e MCP, precisa de
  backend separado (conecta via OpenAPI)
- Projetos públicos apenas no plano free
- Controle limitado sobre lógica de backend e variáveis de ambiente

### Veredicto
**Útil apenas para prototipagem inicial da interface.** Para o projeto em
produção (com chamadas reais ao MCP Brasil e à API do Claude), o Lovable
sozinho não é suficiente — precisaria de backend externo de qualquer forma.

**Recomendação:** Usar como inspiração visual ou para gerar a estrutura inicial
do frontend, mas desenvolver e manter o código no próprio repositório.

---

## 4. Opções de Hospedagem Gratuita

### Comparativo

| Plataforma           | Tipo        | Plano Free                           | Restrição comercial | Ideal para              |
|----------------------|-------------|--------------------------------------|---------------------|-------------------------|
| **Vercel**           | Frontend    | 1M req/mês, 100GB transfer           | ⚠️ Apenas pessoal   | Next.js frontend        |
| **Cloudflare Pages** | Frontend    | Requests ilimitados, 500 builds/mês  | ✅ Sem restrição     | Frontend estático/SSR   |
| **Render**           | Backend     | 512MB RAM, 0.1 CPU, dorme inativo    | ✅ Sem restrição     | API Node.js ou Python   |
| **Railway**          | Backend     | $5 crédito inicial, depois $1/mês    | ✅ Sem restrição     | Backend com mais RAM    |
| **Supabase**         | Banco/Auth  | 500MB DB, 2GB storage, auth grátis   | ✅ Sem restrição     | Banco de dados e auth   |

### Problema crítico identificado

A Vercel proíbe uso **não-comercial** no plano gratuito (Hobby). Como esta
aplicação será pública e cívica (mesmo sem fins lucrativos), o Cloudflare Pages
é a opção mais segura e sem restrições.

---

## 5. Stack Tecnológica Recomendada

Considerando: conhecimento em JavaScript/TypeScript, hospedagem gratuita,
integração com MCP Brasil e Gemini API (gratuita).

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND + BACKEND (mesmo repositório, mesmo deploy)       │
│  Next.js 14+ com App Router                                 │
│  TypeScript                                                 │
│  Tailwind CSS + shadcn/ui (componentes prontos)             │
│  Deploy: Cloudflare Pages + Workers                         │
├─────────────────────────────────────────────────────────────┤
│  INTELIGÊNCIA ARTIFICIAL                                     │
│  Google Gemini API — modelo gemini-2.5-flash (GRATUITO)     │
│  SDK: @google/generative-ai (npm)                           │
│  Function Calling: Gemini chama as ferramentas do MCP Brasil│
├─────────────────────────────────────────────────────────────┤
│  MCP BRASIL                                                  │
│  mcp-brasil rodando como servidor HTTP                      │
│  Hospedado no Render (plano gratuito)                       │
│  Comunicação via REST entre Next.js e o servidor MCP        │
└─────────────────────────────────────────────────────────────┘
```

### Por que Gemini 2.5 Flash?
- **Completamente gratuito** — sem depósito, sem cartão
- Suporta function calling (equivalente ao tool use do Claude)
- Modelo muito capaz, ideal para análise de dados e linguagem natural
- SDK oficial para JavaScript/TypeScript no npm
- Obtido em: aistudio.google.com → "Get API key" (1 minuto)

### Por que Next.js?
- JavaScript/TypeScript = linguagem que o usuário já conhece
- Frontend e backend em um único projeto (API Routes)
- Suporte nativo no Cloudflare Pages via adapter
- Ecossistema enorme, fácil de encontrar ajuda

### Por que não usar Python no backend?
- O usuário tem mais familiaridade com JS/TS
- Com Next.js API Routes, o backend fica no mesmo projeto
- Menos complexidade de deploy (1 repositório, 1 plataforma)

> **Nota:** O mcp-brasil foi escrito em Python, mas pode ser instalado e
> executado como servidor HTTP independente. O Next.js se comunica com ele
> via chamadas HTTP normais — sem precisar escrever Python.

---

## 6. Chaves de API Necessárias

### Obrigatórias

| Variável            | Onde obter                          | Custo       | Para que serve                    |
|---------------------|-------------------------------------|-------------|-----------------------------------|
| `GEMINI_API_KEY`    | aistudio.google.com → "Get API key" | **Gratuito**| Motor de IA da aplicação inteira  |

### Opcionais mas recomendadas (cadastro gratuito ~1 min cada)

| Variável                   | Onde obter                                            | Para que serve                                      |
|----------------------------|-------------------------------------------------------|-----------------------------------------------------|
| `TRANSPARENCIA_API_KEY`    | portaldatransparencia.gov.br/api-de-dados             | Gastos, contratos, sanções, servidores              |
| `DATAJUD_API_KEY`          | datajud.cnj.jus.br (cadastro no portal CNJ)           | Processos judiciais de candidatos                   |
| `META_ACCESS_TOKEN`        | developers.facebook.com → Ad Library API              | Anúncios políticos pagos no Facebook/Instagram      |

> Sem essas chaves opcionais a aplicação ainda funciona — apenas as ferramentas
> que dependem delas ficam indisponíveis. As outras 38+ APIs do MCP Brasil são
> abertas e não precisam de autenticação.

---

## 7. O Que Precisa Ser Criado

### Repositório
```
voto-transparente/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Página inicial (home)
│   ├── candidato/
│   │   └── page.tsx            # Raio-X do candidato
│   ├── match/
│   │   └── page.tsx            # Match de valores
│   └── api/
│       ├── pesquisar/
│       │   └── route.ts        # API: consulta candidato via Claude+MCP
│       └── match/
│           └── route.ts        # API: match de valores via Claude+MCP
├── components/
│   ├── BuscaCandidato.tsx      # Campo de busca + resultados
│   ├── QuestionarioValores.tsx # Formulário de match
│   ├── RelatorioCandidato.tsx  # Card com dados do candidato
│   └── LoadingState.tsx        # Animação de carregamento
├── lib/
│   ├── gemini.ts               # Cliente da API do Gemini
│   └── mcp-tools.ts            # Definição das tools do MCP para o Gemini
├── .env.local                  # Variáveis locais (não vai pro git)
├── .env.example                # Template das variáveis necessárias
└── README.md
```

### Fluxo técnico

```
Usuário digita nome
       ↓
Next.js API Route (/api/pesquisar)
       ↓
Gemini API (gemini-2.5-flash)
  → recebe nome + lista de tools do MCP
  → decide quais tools chamar
  → chama: buscar_candidatos_tse, consultar_financiamento, etc.
       ↓
mcp-brasil (servidor HTTP no Render)
  → consulta APIs oficiais (TSE, TCU, Transparência, Meta...)
  → retorna dados reais
       ↓
Gemini processa e monta resposta em linguagem natural
       ↓
Frontend exibe relatório formatado para o usuário
```

---

## 8. Próximos Passos (Ordem de Execução)

- [ ] **1.** Obter chave da Gemini API (aistudio.google.com) — gratuito
- [ ] **2.** Criar conta no Cloudflare (cloudflare.com) — gratuito
- [ ] **3.** Criar conta no Render (render.com) — gratuito
- [ ] **4.** Criar conta no GitHub (github.com) — gratuito
- [ ] **5.** Cadastrar-se no Portal da Transparência para obter API key
- [ ] **6.** Cadastrar-se no CNJ/DataJud para obter API key
- [ ] **7.** Criar app no Meta Developers para obter token da Ad Library
- [ ] **8.** Iniciar repositório Next.js com TypeScript e Tailwind
- [ ] **9.** Configurar e subir o mcp-brasil como servidor HTTP no Render
- [ ] **10.** Implementar integração Gemini + MCP no backend
- [ ] **11.** Construir frontend (home, busca, questionário, resultados)
- [ ] **12.** Deploy no Cloudflare Pages

---

## 9. Estimativa de Custo

| Item                        | Custo mensal estimado           |
|-----------------------------|---------------------------------|
| Cloudflare Pages (frontend) | Gratuito                        |
| Render (mcp-brasil backend) | Gratuito (com limitações)       |
| Gemini API                  | **Gratuito** (plano free)       |
| GitHub (repositório)        | Gratuito                        |
| Domínio (opcional)          | ~$10/ano (~R$5/mês)             |

**Custo total do projeto: R$ 0,00** (sem domínio personalizado)

---

*Documentação criada em: 2026-04-09*
*Repositório do MCP Brasil: https://github.com/jxnxts/mcp-brasil*
