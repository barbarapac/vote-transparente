import Groq from 'groq-sdk'
import type { ChatCompletionTool, ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions'
import { createMcpSession, listMcpTools, callMcpTool } from './mcp-client'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const SYSTEM_PROMPT = `Você é um assistente cívico especializado em transparência eleitoral brasileira.
Seu papel é ajudar eleitores com dados oficiais do governo brasileiro.

REGRAS:
1. Nunca emita opiniões políticas próprias
2. Baseie afirmações em dados das ferramentas — nunca invente
3. Cite a fonte (ex: "Segundo o TSE...")
4. Se não encontrar dados, informe claramente
5. Use linguagem simples e acessível

COMO USAR AS FERRAMENTAS:
- Você tem acesso direto às ferramentas do governo brasileiro. Chame-as pelo nome.
- Comece sempre com buscas por nome/texto para obter IDs antes de consultas detalhadas.
- As ferramentas do TSE geralmente precisam de ano_eleicao (ex: 2022, 2024).
- Se uma ferramenta falhar, tente parâmetros diferentes ou outra ferramenta similar.
- Não desista na primeira falha — tente abordagens alternativas.`

// Cache de sessão e ferramentas MCP
let cachedSession: string | null = null
let cachedTools: ChatCompletionTool[] | null = null
let cachedToolNames: Set<string> | null = null
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

async function getMcpToolsAsGroqTools(): Promise<{ sessionId: string; tools: ChatCompletionTool[]; toolNames: Set<string> }> {
  const now = Date.now()
  if (cachedSession && cachedTools && cachedToolNames && (now - cacheTimestamp) < CACHE_TTL) {
    return { sessionId: cachedSession, tools: cachedTools, toolNames: cachedToolNames }
  }

  const sessionId = await createMcpSession()
  const mcpTools = await listMcpTools(sessionId)

  const toolNames = new Set<string>()
  const tools: ChatCompletionTool[] = mcpTools.map(tool => {
    toolNames.add(tool.name)
    return {
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: (tool.inputSchema as Record<string, unknown>) || { type: 'object', properties: {} },
      },
    }
  })

  cachedSession = sessionId
  cachedTools = tools
  cachedToolNames = toolNames
  cacheTimestamp = now

  return { sessionId, tools, toolNames }
}

function truncarResposta(resultado: unknown, maxChars = 8000): string {
  const texto = JSON.stringify(resultado) ?? 'null'
  if (texto.length <= maxChars) return texto
  return texto.slice(0, maxChars) + `\n...[truncado — ${texto.length} chars totais]`
}

export async function consultarComIA(pergunta: string): Promise<string> {
  const { sessionId, tools, toolNames } = await getMcpToolsAsGroqTools()

  // Se não encontrou ferramentas, responde sem tools
  if (tools.length === 0) {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: pergunta },
      ],
      temperature: 0.2,
      max_tokens: 4096,
    })
    return response.choices[0].message.content ?? 'Sem resposta disponível.'
  }

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: pergunta },
  ]

  // Loop de tool calling — agora cada rodada é uma consulta real, não discovery
  for (let rodada = 0; rodada < 10; rodada++) {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      tools,
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
      const toolName = toolCall.function.name
      const args = JSON.parse(toolCall.function.arguments || '{}')
      let result: unknown

      try {
        if (!toolNames.has(toolName)) {
          result = { error: `Ferramenta "${toolName}" não existe. Use uma das ferramentas disponíveis.` }
        } else {
          result = await callMcpTool(sessionId, toolName, args)
        }
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
