import { NextRequest, NextResponse } from 'next/server'
import { consultarComIA } from '@/lib/llm'
import { parseApiError } from '@/lib/errors'
import { sanitizeInput } from '@/lib/sanitize'

const AFIRMACAO_LIMIT = 800

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const afirmacao = sanitizeInput(body.afirmacao, AFIRMACAO_LIMIT)

    if (!afirmacao) {
      return NextResponse.json({ error: 'Informe a afirmação a ser verificada' }, { status: 400 })
    }

    const pergunta = `
Verifique a seguinte afirmação política usando dados oficiais do governo brasileiro:

"${afirmacao}"

INSTRUÇÕES:
1. Identifique os fatos verificáveis contidos na afirmação (nomes, cargos, datas, valores, votações)
2. Busque cada fato nas fontes oficiais disponíveis (TSE, Câmara, Senado, Portal da Transparência, TCU, CNJ)
3. Compare o que as fontes dizem com o que a afirmação declara
4. Seja preciso: diferencie o que você encontrou do que não encontrou

FORMATO DA RESPOSTA:
- **Veredicto**: escolha exatamente um: VERDADEIRO / FALSO / PARCIALMENTE VERDADEIRO / SEM DADOS SUFICIENTES
- **Resumo**: explique o veredicto em 1-2 frases diretas
- **Análise detalhada**: fato por fato, o que as fontes oficiais dizem
- **O que as fontes confirmam**: dados encontrados que sustentam ou contradizem a afirmação
- **Limitações**: o que não foi possível verificar e por quê
- **Fontes consultadas**: liste as APIs e bases de dados usadas

IMPORTANTE:
- Nunca emita opinião política própria
- Se não encontrar dados suficientes, diga claramente "SEM DADOS SUFICIENTES" — não invente
- Cite as fontes de cada dado verificado
    `.trim()

    const resposta = await consultarComIA(pergunta)
    return NextResponse.json({ resposta })
  } catch (error) {
    console.error('Erro no verificador:', error)
    const { message, status } = parseApiError(error)
    return NextResponse.json({ error: message }, { status })
  }
}
