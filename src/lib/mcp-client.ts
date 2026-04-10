const MCP_URL = process.env.MCP_BRASIL_URL || 'http://localhost:8000'

// Valida que a URL do MCP não aponta para endereços internos (proteção SSRF)
function validateMcpUrl(url: string): void {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname

    // Bloqueia IPs privados, loopback e link-local
    const blocked = [
      /^127\./,               // loopback
      /^10\./,                // classe A privado
      /^172\.(1[6-9]|2\d|3[01])\./, // classe B privado
      /^192\.168\./,          // classe C privado
      /^169\.254\./,          // link-local (metadata AWS/GCP)
      /^0\./,                 // rede zero
      /^::1$/,                // loopback IPv6
      /^fc00:/i,              // unique local IPv6
      /^fe80:/i,              // link-local IPv6
    ]

    // Permitir localhost explicitamente apenas em dev
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'
    if (isLocalhost && process.env.NODE_ENV === 'production') {
      throw new Error(`MCP_BRASIL_URL não pode apontar para localhost em produção`)
    }

    if (!isLocalhost) {
      for (const pattern of blocked) {
        if (pattern.test(hostname)) {
          throw new Error(`MCP_BRASIL_URL bloqueada: hostname "${hostname}" é um endereço interno`)
        }
      }
    }
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('MCP_BRASIL_URL')) throw err
    throw new Error(`MCP_BRASIL_URL inválida: ${url}`)
  }
}

let mcpUrlValidated = false

function ensureMcpUrlValidated(): void {
  if (mcpUrlValidated) return
  validateMcpUrl(MCP_URL)
  mcpUrlValidated = true
}

interface McpTool {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

interface McpResponse {
  jsonrpc: string
  id: string | number
  result?: unknown
  error?: { code: number; message: string }
}

async function mcpRequest(sessionId: string, method: string, params: unknown, timeoutMs = 60000): Promise<unknown> {
  ensureMcpUrlValidated()
  const requestId = Date.now()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  let res: Response
  try {
    res = await fetch(`${MCP_URL}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'mcp-session-id': sessionId,
      },
      body: JSON.stringify({ jsonrpc: '2.0', method, params, id: requestId }),
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timer)
  }

  const text = await res.text()

  // SSE: extrair linha com "data: {...}" — regex ancorado no início
  const dataLine = text.split('\n').find(l => l.startsWith('data:'))
  if (!dataLine) throw new Error('Resposta MCP inválida')

  const jsonStr = dataLine.replace(/^data:\s*/, '')
  const json: McpResponse = JSON.parse(jsonStr)

  // Validações JSON-RPC
  if (json.jsonrpc !== '2.0') throw new Error('Resposta MCP com versão JSON-RPC inválida')
  if (json.id !== requestId) throw new Error('Resposta MCP com id incompatível')
  if (json.error) throw new Error(`MCP erro: ${json.error.message}`)
  return json.result ?? null
}

export async function createMcpSession(): Promise<string> {
  ensureMcpUrlValidated()
  const res = await fetch(`${MCP_URL}/mcp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
    },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'initialize', params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'voto-transparente', version: '1.0.0' },
    }, id: 1 }),
  })

  const sessionId = res.headers.get('mcp-session-id')
  if (!sessionId) throw new Error('Sessão MCP não iniciada')
  return sessionId
}

export async function listMcpTools(sessionId: string): Promise<McpTool[]> {
  const result = await mcpRequest(sessionId, 'tools/list', {}) as { tools: McpTool[] }
  return result.tools
}

export async function callMcpTool(
  sessionId: string,
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const result = await mcpRequest(sessionId, 'tools/call', { name: toolName, arguments: args })
  return result
}
