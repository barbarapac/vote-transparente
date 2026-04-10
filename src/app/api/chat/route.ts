import { NextRequest, NextResponse } from 'next/server'
import { consultarComIA } from '@/lib/llm'

export async function POST(req: NextRequest) {
  try {
    const { pergunta } = await req.json()

    if (!pergunta?.trim()) {
      return NextResponse.json({ error: 'Pergunta não informada' }, { status: 400 })
    }

    const resposta = await consultarComIA(pergunta)
    return NextResponse.json({ resposta })
  } catch (error) {
    console.error('Erro no chat:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    )
  }
}
