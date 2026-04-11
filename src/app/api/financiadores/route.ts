import { NextRequest, NextResponse } from 'next/server'
import { consultarComIA } from '@/lib/llm'
import { parseApiError } from '@/lib/errors'
import { sanitizeInput, INPUT_LIMITS } from '@/lib/sanitize'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const doador = sanitizeInput(body.doador, INPUT_LIMITS.nome)
    const ano = sanitizeInput(body.ano, INPUT_LIMITS.ano)

    if (!doador) {
      return NextResponse.json({ error: 'Informe o nome ou CNPJ do doador' }, { status: 400 })
    }

    const filtroAno = ano ? ` nas eleições de ${ano}` : ' (busque nas eleições mais recentes disponíveis)'

    const pergunta = `
Faça uma busca reversa de financiamento eleitoral: quem o doador "${doador}" financiou${filtroAno}?

INSTRUÇÕES:
1. Busque doações eleitorais usando o nome ou CNPJ "${doador}" como doador
2. Liste todos os candidatos e partidos que receberam recursos desse doador
3. Agrupe por partido e por cargo disputado
4. Tente identificar o setor econômico do doador (se for empresa)
5. Se possível, busque também nas eleições anteriores para identificar padrão histórico

FORMATO DA RESPOSTA:
- **Quem é o doador**: nome completo, CNPJ (se empresa), setor econômico
- **Candidatos financiados**: lista com nome, partido, cargo, estado e valor doado
- **Partidos mais beneficiados**: ranking por valor total recebido
- **Padrão histórico**: se houve doações em anos anteriores, quem recebeu
- **Total doado**: soma dos valores identificados
- **Fontes**: TSE e Portal da Transparência

Se não encontrar dados, informe claramente quais fontes foram consultadas.
Nunca emita opinião — apenas apresente os dados com fontes.
    `.trim()

    const resposta = await consultarComIA(pergunta)
    return NextResponse.json({ resposta })
  } catch (error) {
    console.error('Erro em financiadores:', error)
    const { message, status } = parseApiError(error)
    return NextResponse.json({ error: message }, { status })
  }
}
