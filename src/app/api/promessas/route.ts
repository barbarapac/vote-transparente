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
    const tema = sanitizeInput(body.tema, INPUT_LIMITS.tema)

    if (!nome) {
      return NextResponse.json({ error: 'Informe o nome do candidato' }, { status: 400 })
    }

    const contexto = [cargo, estado].filter(Boolean).join(' - ')
    const filtroTema = tema ? ` com foco em "${tema}"` : ''

    const pergunta = `
Analise o histórico de "${nome}"${contexto ? ` (${contexto})` : ''}${filtroTema} cruzando promessas de campanha com votações e ações reais.

INSTRUÇÕES:
1. Busque o perfil eleitoral e parlamentar do candidato no TSE e Câmara/Senado
2. Identifique propostas e pautas defendidas (projetos de lei, discursos registrados, anúncios)
3. Cruze com o histórico real de votações, projetos aprovados/rejeitados e participação em comissões
4. Busque eventuais contradições entre discurso e voto

FORMATO DA RESPOSTA:
- **Quem é**: cargo atual e trajetória política resumida
- **O que prometeu / defende**: propostas e bandeiras identificadas nas fontes oficiais
- **O que fez de fato**: votações, projetos apresentados, participação em comissões — com exemplos concretos
- **Convergências**: onde discurso e ação se alinham
- **Divergências**: onde há contradição entre promessa e voto (se houver dados)
- **Fontes consultadas**

Se não houver dados suficientes para uma seção, informe claramente.
Nunca invente dados — use apenas o que as ferramentas retornarem.
    `.trim()

    const resposta = await consultarComIA(pergunta)
    return NextResponse.json({ resposta })
  } catch (error) {
    console.error('Erro no rastreador de promessas:', error)
    const { message, status } = parseApiError(error)
    return NextResponse.json({ error: message }, { status })
  }
}
