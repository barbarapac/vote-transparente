import Groq from 'groq-sdk'
import type { ChatCompletionTool, ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions'
import { createMcpSession, callMcpTool } from './mcp-client'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const SYSTEM_PROMPT = `Você é um assistente cívico especializado em transparência eleitoral brasileira.

Seu papel é ajudar eleitores a conhecer candidatos e tomar decisões de voto informadas, usando
exclusivamente dados oficiais do governo brasileiro.

REGRAS IMPORTANTES:
1. Nunca emita opiniões políticas próprias
2. Baseie TODAS as afirmações em dados das ferramentas — nunca invente informações
3. Sempre cite a fonte dos dados (ex: "Segundo o TSE...", "De acordo com o Portal da Transparência...")
4. Se não encontrar dados suficientes, informe claramente ao usuário
5. Use linguagem acessível — o usuário pode ser qualquer eleitor brasileiro
6. Quando buscar ferramentas, use termos em português relacionados ao que precisa

Para pesquisar candidatos, use a ferramenta search_tools para descobrir quais ferramentas usar,
depois use call_tool para executar as consultas necessárias.`

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
  const texto = JSON.stringify(resultado)
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
