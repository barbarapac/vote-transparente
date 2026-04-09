import Groq from 'groq-sdk'
import type { ChatCompletionTool, ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions'
import { createMcpSession, callMcpTool } from './mcp-client'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const SYSTEM_PROMPT = `Você é um assistente cívico especializado em transparência eleitoral brasileira.
Seu papel é ajudar eleitores com dados oficiais do governo brasileiro.

REGRAS:
1. Nunca emita opiniões políticas próprias
2. Baseie afirmações em dados das ferramentas — nunca invente
3. Cite a fonte (ex: "Segundo o TSE...")
4. Se não encontrar dados, informe claramente
5. Use linguagem simples e acessível

COMO USAR AS FERRAMENTAS — SIGA ESTA ORDEM:

PASSO 1 — Descubra quais ferramentas existem:
  Use search_tools com termos como "candidato nome eleição" para encontrar as ferramentas certas.

PASSO 2 — Faça buscas amplas para obter IDs:
  Nunca invente IDs. Comece sempre com buscas por nome/texto.
  Exemplo: call_tool("tse_buscar_candidatos", {"nome": "João Silva", "ano_eleicao": 2024})
  Isso retorna IDs que você pode usar nos próximos passos.

PASSO 3 — Use os IDs retornados para buscas detalhadas:
  Com os IDs obtidos no passo 2, faça consultas específicas.

PASSO 4 — Se uma ferramenta falhar por parâmetro inválido:
  Tente outra ferramenta similar ou uma busca mais ampla.
  Nunca desista na primeira falha — tente abordagens alternativas.

IMPORTANTE: As ferramentas do TSE geralmente precisam de ano_eleicao (ex: 2022, 2024, 2026).
Use os anos mais recentes disponíveis.`

const MCP_TOOLS: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'search_tools',
      description: 'Busca ferramentas disponíveis no MCP Brasil por linguagem natural. Use antes de call_tool.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Busca em português, ex: "candidatos TSE eleições"' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'call_tool',
      description: 'Executa uma ferramenta do MCP Brasil pelo nome exato.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Nome exato da ferramenta (obtido via search_tools)' },
          arguments: { type: 'object', description: 'Argumentos da ferramenta' },
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'planejar_consulta',
      description: 'Cria um plano de execução para consultas complexas com múltiplas ferramentas.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Pergunta em linguagem natural' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'executar_lote',
      description: 'Executa múltiplas ferramentas em paralelo de uma só vez.',
      parameters: {
        type: 'object',
        properties: {
          consultas: {
            type: 'array',
            description: 'Lista de ferramentas para executar',
            items: {
              type: 'object',
              properties: {
                tool: { type: 'string' },
                args: { type: 'object' },
              },
            },
          },
        },
        required: ['consultas'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'listar_features',
      description: 'Lista todas as APIs governamentais disponíveis no MCP Brasil.',
      parameters: { type: 'object', properties: {} },
    },
  },
]

// Limita o tamanho das respostas das ferramentas para não estourar o contexto
function truncarResposta(resultado: unknown, maxChars = 3000): string {
  const texto = JSON.stringify(resultado) ?? 'null'
  if (texto.length <= maxChars) return texto
  return texto.slice(0, maxChars) + `\n...[resposta truncada — ${texto.length} chars totais]`
}

export async function consultarComIA(pergunta: string): Promise<string> {
  const sessionId = await createMcpSession()

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: pergunta },
  ]

  // Loop de tool calling (máx 8 rodadas para evitar loop infinito)
  for (let rodada = 0; rodada < 8; rodada++) {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      tools: MCP_TOOLS,
      tool_choice: 'auto',
      temperature: 0.2,
      max_tokens: 4096,
    })

    const message = response.choices[0].message
    messages.push(message)

    if (!message.tool_calls?.length) {
      return message.content ?? 'Sem resposta disponível.'
    }

    for (const toolCall of message.tool_calls) {
      const args = JSON.parse(toolCall.function.arguments || '{}')
      let result: unknown

      try {
        result = await callMcpTool(sessionId, toolCall.function.name, args)
      } catch (err) {
        result = { error: err instanceof Error ? err.message : 'Erro ao executar ferramenta' }
      }

      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: truncarResposta(result),
      })
    }
  }

  return 'Não foi possível concluir a consulta. Tente novamente com uma pergunta mais específica.'
}
