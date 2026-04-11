import { NextRequest, NextResponse } from 'next/server'
import { consultarComIA } from '@/lib/llm'
import { parseApiError } from '@/lib/errors'
import { sanitizeInput, INPUT_LIMITS } from '@/lib/sanitize'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const nome = sanitizeInput(body.nome, INPUT_LIMITS.nome)
    const estado = sanitizeInput(body.estado, INPUT_LIMITS.estado)

    if (!nome) {
      return NextResponse.json({ error: 'Informe o nome do candidato' }, { status: 400 })
    }

    const contexto = estado ? ` (${estado})` : ''

    const pergunta = `
Monte uma linha do tempo completa da carreira política de "${nome}"${contexto} usando dados oficiais do governo brasileiro.

INSTRUÇÕES:
1. Busque todas as candidaturas do TSE (do mais antigo ao mais recente)
2. Identifique mudanças de partido, cargo e estado
3. Inclua mandatos exercidos, eleições ganhas e perdidas
4. Inclua fatos relevantes: processos abertos, sanções, projetos marcantes, cargos no executivo

FORMATO DA RESPOSTA:
Apresente em ordem cronológica, com marcadores por ano/período. Para cada evento:

**[ANO]** — Descrição do evento (partido, cargo, resultado se eleição, estado)

Seções a incluir:
- **Início na política**: filiação partidária, primeiras candidaturas
- **Trajetória eleitoral**: cada eleição disputada com resultado (eleito/não eleito) e % de votos
- **Cargos exercidos**: mandatos cumpridos com início e fim
- **Mudanças partidárias**: quando e para qual partido migrou
- **Fatos marcantes**: processos relevantes, projetos de destaque, posições em comissões importantes
- **Situação atual**: cargo e mandato atual, se houver

Seja objetivo e cronológico. Cite fontes. Não emita opiniões.
    `.trim()

    const resposta = await consultarComIA(pergunta)
    return NextResponse.json({ resposta })
  } catch (error) {
    console.error('Erro na timeline:', error)
    const { message, status } = parseApiError(error)
    return NextResponse.json({ error: message }, { status })
  }
}
