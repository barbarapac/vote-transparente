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

COMO USAR AS FERRAMENTAS:
- Você tem acesso a ferramentas das APIs do governo brasileiro. Use-as diretamente.
- Comece com buscas por nome para obter IDs antes de consultas detalhadas.
- Ferramentas do TSE geralmente precisam de ano_eleicao (ex: 2022, 2024).
- Se uma ferramenta falhar, tente parâmetros diferentes ou outra ferramenta similar.
- Não desista na primeira falha — tente abordagens alternativas.`

// Queries usadas para descobrir tools concretas no MCP
const DISCOVERY_QUERIES = [
  'candidato TSE eleição buscar por nome',
  'bens declarados patrimônio candidato',
  'financiamento campanha doações receitas',
  'sanções improbidade irregularidades CEIS',
  'deputado senador parlamentar votações projetos',
  'contratos públicos licitações fornecedor',
  'gastos despesas governo federal',
]

interface DiscoveredTool {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

// Cache de sessão e tools concretas descobertas
let cachedSession: string | null = null
let cachedTools: ChatCompletionTool[] | null = null
let cachedToolNames: Set<string> | null = null
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

function extractToolArray(result: unknown): unknown[] {
  if (!result || typeof result !== 'object') return []
  const r = result as Record<string, unknown>

  // Formato MCP: { structuredContent: { result: [...] } }
  const structured = r.structuredContent as Record<string, unknown> | undefined
  if (Array.isArray(structured?.result)) return structured!.result as unknown[]

  // Fallback: { content: [{ type: 'text', text: '[...]' }] }
  const content = r.content as Array<{ type: string; text: string }> | undefined
  if (Array.isArray(content)) {
    const textItem = content.find(c => c.type === 'text')
    if (textItem?.text) {
      try {
        const parsed = JSON.parse(textItem.text)
        if (Array.isArray(parsed)) return parsed
        if (Array.isArray(parsed?.result)) return parsed.result
      } catch { /* ignora */ }
    }
  }

  // Já é array direto
  if (Array.isArray(result)) return result

  return []
}

function parseDiscoveredTools(result: unknown): DiscoveredTool[] {
  return extractToolArray(result)
    .filter((item): item is Record<string, unknown> =>
      typeof item === 'object' && item !== null && typeof (item as Record<string, unknown>).name === 'string'
    )
    .map(item => ({
      name: item.name as string,
      description: (item.description as string) || '',
      inputSchema: (item.inputSchema as Record<string, unknown>) || { type: 'object', properties: {} },
    }))
}

function extractMcpResultText(result: unknown): string {
  if (!result || typeof result !== 'object') return JSON.stringify(result) ?? 'null'
  const r = result as Record<string, unknown>

  // Formato MCP: { content: [{ type: 'text', text: '...' }] }
  const content = r.content as Array<{ type: string; text: string }> | undefined
  if (Array.isArray(content)) {
    const texts = content.filter(c => c.type === 'text').map(c => c.text).join('\n')
    if (texts) return texts
  }

  // Formato MCP: { structuredContent: { result: '...' } }
  const structured = r.structuredContent as Record<string, unknown> | undefined
  if (structured?.result) return JSON.stringify(structured.result)

  return JSON.stringify(result)
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout após ${ms}ms`)), ms)
  )
  return Promise.race([promise, timeout])
}

async function discoverConcreteTools(sessionId: string): Promise<{ tools: ChatCompletionTool[]; toolNames: Set<string> }> {
  const discovered = new Map<string, ChatCompletionTool>()
  const toolNames = new Set<string>()

  await Promise.allSettled(
    DISCOVERY_QUERIES.map(async query => {
      try {
        const result = await withTimeout(callMcpTool(sessionId, 'search_tools', { query }), 60000)
        const tools = parseDiscoveredTools(result)
        for (const tool of tools) {
          if (!discovered.has(tool.name)) {
            discovered.set(tool.name, {
              type: 'function' as const,
              function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.inputSchema,
              },
            })
            toolNames.add(tool.name)
          }
        }
      } catch {
        // query falhou — ignora e segue
      }
    })
  )

  return { tools: Array.from(discovered.values()), toolNames }
}

async function getSession(): Promise<string> {
  const now = Date.now()
  if (cachedSession && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedSession
  }
  cachedSession = await createMcpSession()
  cachedTools = null
  cachedToolNames = null
  cacheTimestamp = now
  return cachedSession
}

async function getCachedTools(sessionId: string): Promise<{ tools: ChatCompletionTool[]; toolNames: Set<string> }> {
  if (cachedTools && cachedToolNames) {
    return { tools: cachedTools, toolNames: cachedToolNames }
  }
  const { tools, toolNames } = await discoverConcreteTools(sessionId)
  cachedTools = tools
  cachedToolNames = toolNames
  return { tools, toolNames }
}

function truncarResposta(resultado: unknown, maxChars = 8000): string {
  const texto = JSON.stringify(resultado) ?? 'null'
  if (texto.length <= maxChars) return texto
  return texto.slice(0, maxChars) + `\n...[truncado — ${texto.length} chars totais]`
}

export async function consultarComIA(pergunta: string): Promise<string> {
  const sessionId = await getSession()
  const { tools, toolNames } = await getCachedTools(sessionId)

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: pergunta },
  ]

  // Sem tools descobertas: responde sem function calling
  if (tools.length === 0) {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.2,
      max_tokens: 4096,
    })
    return response.choices[0].message.content ?? 'Sem resposta disponível.'
  }

  // Loop de tool calling com tools concretas — Groq nunca vê meta-tools
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
          result = { error: `Ferramenta "${toolName}" não encontrada.` }
        } else {
          // Executa a tool concreta via call_tool no backend — transparente para o Groq
          result = await callMcpTool(sessionId, 'call_tool', { name: toolName, arguments: args })
        }
      } catch (err) {
        result = { error: err instanceof Error ? err.message : 'Erro ao executar ferramenta' }
      }

      const resultText = extractMcpResultText(result)
      const resultTruncado = resultText.length > 8000
        ? resultText.slice(0, 8000) + `\n...[truncado — ${resultText.length} chars totais]`
        : resultText

      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: resultTruncado,
      })
    }
  }

  return 'Não foi possível concluir a consulta. Tente novamente com uma pergunta mais específica.'
}
