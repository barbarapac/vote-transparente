import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { sanitizeInput } from '@/lib/sanitize'
import { parseApiError } from '@/lib/errors'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const SYSTEM_PROMPT = `
Você é um assistente do Vote Transparente, uma plataforma cívica brasileira de transparência eleitoral.

ESCOPO:
Responda apenas sobre:
- Eleições de 2026 e processo eleitoral brasileiro
- Responsabilidades dos cargos eletivos (Presidente, Governadores, Senadores, Deputados)
- Funcionalidades e funcionamento da plataforma Vote Transparente

REGRAS:
- Nunca recomende candidatos, partidos ou ideologias
- Nunca opine sobre em quem votar
- Não faça julgamentos políticos
- Se não tiver certeza, diga: "Não tenho essa informação com certeza"
- Use linguagem simples, clara e objetiva
- Seja breve (máximo 3 parágrafos)

CONDUTA:
- Priorize respostas úteis e diretas
- Quando possível, explique de forma didática
- Se a pergunta fugir do escopo, responda de forma educada redirecionando para temas relacionados ao sistema eleitoral ou à plataforma

CONTEXTO DA PLATAFORMA:
O Vote Transparente é uma plataforma que utiliza dados públicos oficiais (como TSE e Portal da Transparência) para ajudar eleitores a entender candidatos e o processo eleitoral com base em dados.

IMPORTANTE:
Você não possui acesso em tempo real a bases externas, a menos que a informação seja fornecida na conversa.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const pergunta = sanitizeInput(body.pergunta, 500)

    if (!pergunta) {
      return NextResponse.json({ error: 'Pergunta não informada' }, { status: 400 })
    }

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: pergunta },
      ],
      temperature: 0.3,
      max_tokens: 512,
    })

    const resposta = response.choices[0].message.content ?? 'Não consegui processar sua pergunta.'
    return NextResponse.json({ resposta })
  } catch (error) {
    console.error('Erro no chat de eleições:', error)
    const { message, status } = parseApiError(error)
    return NextResponse.json({ error: message }, { status })
  }
}
