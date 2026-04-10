import { NextRequest, NextResponse } from 'next/server'
import { consultarComIA } from '@/lib/llm'

export async function POST(req: NextRequest) {
  try {
    const { nome, cargo, estado } = await req.json()

    if (!nome?.trim()) {
      return NextResponse.json({ error: 'Nome do candidato não informado' }, { status: 400 })
    }

    const contexto = [
      cargo ? `Cargo: ${cargo}` : '',
      estado ? `Estado: ${estado}` : '',
    ].filter(Boolean).join(', ')

    const pergunta = `
Pesquise o candidato "${nome}"${contexto ? ` (${contexto})` : ''} e monte um relatório.

INSTRUÇÕES DE PESQUISA:
1. Primeiro use search_tools para encontrar ferramentas do TSE (busque por "candidato TSE eleição")
2. Use call_tool para buscar candidatos pelo nome "${nome}" — experimente anos como 2024, 2022, 2020
3. Com os dados retornados, extraia as informações disponíveis
4. Se uma busca falhar, tente com parâmetros diferentes ou ano diferente
5. Não exija campos opcionais — tente com o mínimo necessário primeiro

RELATÓRIO FINAL — apresente o que encontrar em cada seção:
- **Dados Eleitorais**: candidaturas, partidos, cargos, resultado das eleições
- **Financiamento**: doadores, valores arrecadados e gastos (se disponível)
- **Histórico Parlamentar**: votações, projetos, gastos (somente se for parlamentar)
- **Transparência**: sanções, irregularidades, contratos públicos
- **Anúncios em redes sociais**: gastos com publicidade política (se disponível)

Se alguma seção não tiver dados disponíveis, escreva "Dados não encontrados" nessa seção.
    `.trim()

    const resposta = await consultarComIA(pergunta)
    return NextResponse.json({ resposta })
  } catch (error) {
    console.error('Erro no raio-x:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    )
  }
}
