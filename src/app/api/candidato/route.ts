import { NextRequest, NextResponse } from 'next/server'
import { consultarComIA } from '@/lib/llm'
import { parseApiError } from '@/lib/errors'
import { sanitizeInput, INPUT_LIMITS } from '@/lib/sanitize'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const nome = sanitizeInput(body.nome, INPUT_LIMITS.nome)
    const cargo = sanitizeInput(body.cargo, INPUT_LIMITS.cargo)
    const estado = sanitizeInput(body.estado, INPUT_LIMITS.estado)

    if (!nome) {
      return NextResponse.json({ error: 'Nome do candidato não informado' }, { status: 400 })
    }

    const contexto = [
      cargo ? `Cargo: ${cargo}` : '',
      estado ? `Estado: ${estado}` : '',
    ].filter(Boolean).join(', ')

    const pergunta = `
Monte um relatório sobre o candidato "${nome}"${contexto ? ` (${contexto})` : ''} usando dados oficiais do governo brasileiro.

INSTRUÇÕES:
- Busque o candidato pelo nome — tente as eleições mais recentes primeiro (2024, 2022) e vá recuando se necessário
- Se não encontrar por "${nome}", tente o nome completo (ex: "Lula" = "Luiz Inácio Lula da Silva", "Bolsonaro" = "Jair Messias Bolsonaro")
- Com o ID encontrado, busque bens declarados, financiamento e histórico
- Tente também sanções, irregularidades e contratos com o nome ou CPF encontrado

RELATÓRIO FINAL:
- **Dados Eleitorais**: candidaturas, partidos, cargos, resultados
- **Financiamento**: doadores, valores arrecadados e gastos
- **Histórico Parlamentar**: votações e projetos (se parlamentar)
- **Transparência**: sanções, irregularidades, contratos públicos
- **Anúncios**: gastos com publicidade política

Seções sem dados: escreva "Dados não encontrados".
    `.trim()

    const resposta = await consultarComIA(pergunta)
    return NextResponse.json({ resposta })
  } catch (error) {
    console.error('Erro no raio-x:', error)
    const { message, status } = parseApiError(error)
    return NextResponse.json({ error: message }, { status })
  }
}
