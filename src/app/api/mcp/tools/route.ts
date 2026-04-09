import { NextResponse } from 'next/server'
import { createMcpSession, listMcpTools } from '@/lib/mcp-client'

export async function GET() {
  try {
    const sessionId = await createMcpSession()
    const tools = await listMcpTools(sessionId)
    return NextResponse.json({ total: tools.length, tools })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao conectar com MCP Brasil' },
      { status: 500 }
    )
  }
}
