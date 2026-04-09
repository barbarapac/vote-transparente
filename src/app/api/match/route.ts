import { NextRequest, NextResponse } from 'next/server'
import { consultarComIA } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const { cargo, estado, municipio, temas, observacao } = await req.json()

    if (!cargo || !estado) {
      return NextResponse.json({ error: 'Cargo e estado são obrigatórios' }, { status: 400 })
    }

    const pergunta = `
Um eleitor quer saber em quem votar para o cargo de ${cargo} em ${municipio ? `${municipio}/` : ''}${estado}.

Os temas que mais importam para este eleitor são:
${temas?.length ? temas.map((t: string) => `- ${t}`).join('\n') : '- Não especificado'}

${observacao ? `Observação adicional do eleitor: "${observacao}"` : ''}

Por favor:
1. Use as ferramentas disponíveis para buscar candidatos ao cargo de ${cargo} em ${estado}
2. Para cada candidato encontrado, busque dados sobre histórico, votações e posicionamentos nos temas relevantes
3. Apresente os candidatos ordenados por aderência aos temas do eleitor
4. Para cada candidato, explique com dados concretos por que ele se alinha (ou não) com as prioridades informadas
5. Seja imparcial — não tome partido, apenas apresente os fatos e dados encontrados
6. Cite as fontes de cada informação

Use linguagem clara e acessível. O objetivo é informar, não influenciar.
    `.trim()

    const resposta = await consultarComIA(pergunta)
    return NextResponse.json({ resposta })
  } catch (error) {
    console.error('Erro no match:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    )
  }
}
