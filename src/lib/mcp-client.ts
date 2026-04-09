const MCP_URL = process.env.MCP_BRASIL_URL || 'http://localhost:8000'

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

async function mcpRequest(sessionId: string, method: string, params: unknown): Promise<unknown> {
  const res = await fetch(`${MCP_URL}/mcp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'mcp-session-id': sessionId,
    },
    body: JSON.stringify({ jsonrpc: '2.0', method, params, id: Date.now() }),
  })

  const text = await res.text()

  // SSE: extrair linha com "data: {...}"
  const dataLine = text.split('\n').find(l => l.startsWith('data:'))
  if (!dataLine) throw new Error('Resposta MCP inválida')

  const json: McpResponse = JSON.parse(dataLine.replace('data: ', ''))
  if (json.error) throw new Error(`MCP erro: ${json.error.message}`)
  return json.result ?? null
}

export async function createMcpSession(): Promise<string> {
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
