import { NextRequest, NextResponse } from 'next/server'
import { consultarComIA } from '@/lib/llm'
import { parseApiError } from '@/lib/errors'
import { sanitizeInput, INPUT_LIMITS } from '@/lib/sanitize'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const pergunta = sanitizeInput(body.pergunta, INPUT_LIMITS.pergunta)

    if (!pergunta) {
      return NextResponse.json({ error: 'Pergunta não informada' }, { status: 400 })
    }

    const resposta = await consultarComIA(pergunta)
    return NextResponse.json({ resposta })
  } catch (error) {
    console.error('Erro no chat:', error)
    const { message, status } = parseApiError(error)
    return NextResponse.json({ error: message }, { status })
  }
}
