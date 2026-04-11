import { NextRequest, NextResponse } from 'next/server'
import { consultarComIA } from '@/lib/llm'
import { parseApiError } from '@/lib/errors'
import { sanitizeInput, INPUT_LIMITS } from '@/lib/sanitize'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const nome1 = sanitizeInput(body.nome1, INPUT_LIMITS.nome)
    const cargo1 = sanitizeInput(body.cargo1, INPUT_LIMITS.cargo)
    const estado1 = sanitizeInput(body.estado1, INPUT_LIMITS.estado)
    const nome2 = sanitizeInput(body.nome2, INPUT_LIMITS.nome)
    const cargo2 = sanitizeInput(body.cargo2, INPUT_LIMITS.cargo)
    const estado2 = sanitizeInput(body.estado2, INPUT_LIMITS.estado)

    if (!nome1 || !nome2) {
      return NextResponse.json({ error: 'Informe os nomes dos dois candidatos' }, { status: 400 })
    }

    const ctx1 = [cargo1, estado1].filter(Boolean).join(' - ')
    const ctx2 = [cargo2, estado2].filter(Boolean).join(' - ')

    const pergunta = `
Compare os candidatos "${nome1}"${ctx1 ? ` (${ctx1})` : ''} e "${nome2}"${ctx2 ? ` (${ctx2})` : ''} usando dados oficiais do governo brasileiro.

Para cada candidato, busque:
- Histórico eleitoral: partidos, cargos disputados e resultados
- Financiamento de campanha: principais doadores e valores
- Bens declarados e patrimônio
- Sanções, irregularidades e processos (CEIS, TCU, CNJ)
- Histórico parlamentar se aplicável (votações, projetos de lei, presença)
- Gastos públicos e contratos

FORMATO DA RESPOSTA:
Apresente os dados em formato comparativo claro, usando tabelas markdown quando possível.
Organize por seção: Perfil Eleitoral, Financiamento, Patrimônio, Transparência, Histórico Parlamentar.
Em cada seção, coloque os dados de "${nome1}" e "${nome2}" lado a lado.
Seções sem dados: escreva "Dados não encontrados".
Nunca emita opinião — apenas apresente os dados com fontes.
    `.trim()

    const resposta = await consultarComIA(pergunta)
    return NextResponse.json({ resposta })
  } catch (error) {
    console.error('Erro no comparador:', error)
    const { message, status } = parseApiError(error)
    return NextResponse.json({ error: message }, { status })
  }
}
