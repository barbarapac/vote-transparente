import { NextRequest, NextResponse } from 'next/server'
import { consultarComIA } from '@/lib/llm'
import { parseApiError } from '@/lib/errors'

export async function POST(req: NextRequest) {
  try {
    const { cargo, estado, municipio, temas, observacao } = await req.json()

    const cargosNacionais = ['Presidente']
    const precisaEstado = !cargosNacionais.includes(cargo)

    if (!cargo || (precisaEstado && !estado)) {
      return NextResponse.json({ error: 'Cargo é obrigatório' + (precisaEstado ? ' e estado é obrigatório para este cargo' : '') }, { status: 400 })
    }

    const localidade = estado ? (municipio ? `${municipio}/${estado}` : estado) : 'todo o Brasil'

    const pergunta = `
Um eleitor quer saber em quem votar para o cargo de ${cargo}${estado ? ` em ${localidade}` : ' (eleição nacional)'}.

Os temas que mais importam para este eleitor são:
${temas?.length ? temas.map((t: string) => `- ${t}`).join('\n') : '- Não especificado'}

${observacao ? `Observação adicional do eleitor: "${observacao}"` : ''}

Por favor:
1. Use as ferramentas disponíveis para buscar candidatos ao cargo de ${cargo}${estado ? ` em ${localidade}` : ' (âmbito nacional)'}
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
    const { message, status } = parseApiError(error)
    return NextResponse.json({ error: message }, { status })
  }
}
