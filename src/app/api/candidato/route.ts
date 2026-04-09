import { NextRequest, NextResponse } from 'next/server'
import { consultarComIA } from '@/lib/gemini'

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
Faça um Raio-X completo do candidato "${nome}"${contexto ? ` (${contexto})` : ''}.

Busque e apresente as seguintes informações, usando as ferramentas disponíveis:

1. **Dados Eleitorais (TSE)**: candidaturas registradas, partidos, cargos disputados, situação
2. **Financiamento de Campanha**: principais doadores, total arrecadado, total gasto
3. **Histórico Parlamentar** (se for ou foi parlamentar): votações importantes, projetos de lei apresentados, gastos da cota parlamentar
4. **Transparência e Sanções**: contratos com o governo, sanções ou irregularidades no Portal da Transparência ou TCU
5. **Anúncios Políticos**: gastos com anúncios pagos em redes sociais (se disponível)

Para cada seção, indique claramente a fonte dos dados.
Se alguma informação não estiver disponível, informe isso explicitamente.
Use linguagem clara e acessível para qualquer eleitor brasileiro.
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
