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
      return NextResponse.json({ error: 'Informe o nome do parlamentar' }, { status: 400 })
    }

    const contexto = [cargo, estado].filter(Boolean).join(' - ')

    const pergunta = `
Monte um painel completo do mandato de "${nome}"${contexto ? ` (${contexto})` : ''} com dados do exercício do cargo atual.

INSTRUÇÕES:
1. Identifique o parlamentar e seu cargo atual (deputado federal, senador, etc.)
2. Busque dados de presença e frequência nas votações
3. Busque projetos de lei de autoria própria e em co-autoria
4. Busque gastos com a Cota Parlamentar (CEAP) — maiores despesas e fornecedores
5. Busque participação em comissões e relatoria de projetos
6. Busque eventuais sanções, investigações ou processos disciplinares

FORMATO DA RESPOSTA:
- **Perfil**: cargo, partido, estado, mandato atual (início e fim)
- **Presença**: frequência nas sessões e votações (%)
- **Produção Legislativa**: projetos apresentados, aprovados, arquivados — com exemplos
- **Comissões**: lista de comissões em que participa ou preside
- **Gastos da Cota Parlamentar**: total gasto, categorias e maiores despesas
- **Transparência**: processos, investigações, sanções — se houver
- **Fontes**: Câmara dos Deputados, Senado Federal, Portal da Transparência

Seções sem dados: escreva "Dados não encontrados".
    `.trim()

    const resposta = await consultarComIA(pergunta)
    return NextResponse.json({ resposta })
  } catch (error) {
    console.error('Erro no painel do mandato:', error)
    const { message, status } = parseApiError(error)
    return NextResponse.json({ error: message }, { status })
  }
}
