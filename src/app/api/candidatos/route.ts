import { NextRequest, NextResponse } from 'next/server'
import { consultarComIA } from '@/lib/llm'
import { parseApiError } from '@/lib/errors'
import { sanitizeInput, INPUT_LIMITS } from '@/lib/sanitize'
import { CARGOS_COM_MUNICIPIO } from '@/lib/constants'

const CARGOS_NACIONAIS = new Set(['Presidente'])

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const cargo = sanitizeInput(body.cargo, INPUT_LIMITS.cargo)
    const estado = sanitizeInput(body.estado, INPUT_LIMITS.estado)
    const municipio = sanitizeInput(body.municipio, INPUT_LIMITS.municipio)
    const ano = sanitizeInput(body.ano, INPUT_LIMITS.ano)

    if (!cargo) {
      return NextResponse.json({ error: 'Cargo é obrigatório' }, { status: 400 })
    }

    const precisaEstado = !CARGOS_NACIONAIS.has(cargo)
    if (precisaEstado && !estado) {
      return NextResponse.json({ error: 'Estado é obrigatório para este cargo' }, { status: 400 })
    }

    const precisaMunicipio = CARGOS_COM_MUNICIPIO.has(cargo)
    if (precisaMunicipio && !municipio) {
      return NextResponse.json({ error: 'Município é obrigatório para este cargo' }, { status: 400 })
    }

    const localidade = municipio ? `${municipio}/${estado}` : estado ? estado : 'âmbito nacional'

    const anoTexto = ano ? `eleição de ${ano}` : 'eleição mais recente disponível'

    const pergunta = `
Liste todos os candidatos ao cargo de ${cargo}${estado ? ` em ${localidade}` : ' (eleição nacional)'} na ${anoTexto} e apresente um resumo rápido de cada um.

INSTRUÇÕES:
- Busque a lista de candidatos ao cargo de ${cargo}${ano ? ` no ano ${ano}` : ' nas eleições mais recentes'}
- Para cada candidato encontrado, verifique brevemente: sanções, processos, histórico parlamentar e projetos relevantes
- Use executar_lote para buscar dados de múltiplos candidatos em paralelo quando possível
- Seja objetivo — um parágrafo curto por candidato é suficiente

FORMATO DE SAÍDA — para cada candidato use este padrão:

## [Nome do candidato] — [Partido]

**Situação:** 🟢 Sem registros negativos / 🟡 Pendências / 🔴 Sanções ou condenações

**Resumo:** (2-3 linhas sobre histórico, projetos relevantes e qualquer envolvimento em irregularidades)

---

Se não encontrar candidatos, explique o motivo e sugira como o eleitor pode buscar essa informação diretamente no TSE.
    `.trim()

    const resposta = await consultarComIA(pergunta)
    return NextResponse.json({ resposta })
  } catch (error) {
    console.error('Erro ao listar candidatos:', error)
    const { message, status } = parseApiError(error)
    return NextResponse.json({ error: message }, { status })
  }
}
