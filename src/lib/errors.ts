interface ApiErrorWithStatus extends Error {
  status?: number
  headers?: { get?: (key: string) => string | null } & Record<string, string>
}

function getHeader(headers: ApiErrorWithStatus['headers'], key: string): string | null {
  if (!headers) return null
  return typeof headers.get === 'function' ? headers.get(key) : (headers[key] ?? null)
}

export function parseApiError(error: unknown): { message: string; status: number } {
  if (!(error instanceof Error)) {
    return { message: 'Erro interno inesperado. Tente novamente.', status: 500 }
  }

  const msg = error.message
  const apiErr = error as ApiErrorWithStatus
  const status = apiErr.status

  if (status === 429 || msg.includes('429')) {
    const headers = apiErr.headers

    // retry-after é a fonte mais confiável — cobre limites diários e por minuto
    const retryAfter = getHeader(headers, 'retry-after')
    if (retryAfter) {
      const secs = parseInt(retryAfter, 10)
      if (!isNaN(secs)) {
        return {
          message: `Limite de consultas atingido. Tente novamente em ${formatSeconds(secs)}.`,
          status: 429,
        }
      }
    }

    // Fallback: extrai tempo do texto da mensagem (ex: "try again in 58m1.92s")
    const waitMatch = msg.match(/try again in ([\d.]+h[\d.]+m[\d.]+s|[\d.]+h[\d.]+m|[\d.]+m[\d.]+s|[\d.]+m|[\d.]+s)/)
    if (waitMatch) {
      return {
        message: `Limite de consultas atingido. Tente novamente em ${formatWait(waitMatch[1])}.`,
        status: 429,
      }
    }

    return {
      message: 'Limite de consultas atingido. O limite diário pode ter sido atingido — tente novamente amanhã ou atualize o plano no console do Groq.',
      status: 429,
    }
  }

  if (status === 413 || msg.includes('413') || msg.toLowerCase().includes('request too large')) {
    return {
      message: 'A consulta é complexa demais para processar de uma vez. Tente ser mais específico (ex: informe o estado ou o cargo do candidato).',
      status: 413,
    }
  }

  if (status === 400 || msg.includes('tool_use_failed')) {
    return {
      message: 'Houve um problema ao consultar as fontes de dados. Tente reformular sua pesquisa.',
      status: 400,
    }
  }

  if (status === 503 || msg.includes('model_not_active') || msg.includes('model_decommissioned')) {
    return {
      message: 'O modelo de IA está temporariamente indisponível. Tente novamente em alguns minutos.',
      status: 503,
    }
  }

  if (msg.includes('invalid_request_error')) {
    return {
      message: 'Não foi possível processar a consulta. Tente novamente com termos diferentes.',
      status: 400,
    }
  }

  if (msg.includes('fetch failed') || msg.includes('ECONNREFUSED') || msg.includes('MCP')) {
    return {
      message: 'Não foi possível conectar às fontes de dados do governo. Verifique se o servidor MCP está ativo.',
      status: 503,
    }
  }

  if (msg.includes('timeout') || msg.includes('ETIMEDOUT')) {
    return {
      message: 'A consulta demorou mais do que o esperado. Tente novamente.',
      status: 504,
    }
  }

  return { message: 'Erro interno. Tente novamente em alguns instantes.', status: 500 }
}

/** Converte segundos inteiros em texto legível */
function formatSeconds(total: number): string {
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0 && m > 0) return `${h}h ${m}min`
  if (h > 0) return `${h}h`
  if (m > 0 && s > 0) return `${m}min ${s}s`
  if (m > 0) return `${m}min`
  return `${s}s`
}

/** Converte string de tempo do Groq (ex: "58m1.92s") em texto legível */
function formatWait(raw: string): string {
  const hours = raw.match(/^([\d.]+)h/)
  const mins = raw.match(/([\d.]+)m/)
  const secs = raw.match(/([\d.]+)s$/)
  if (hours && mins && secs) return `${hours[1]}h ${Math.round(parseFloat(mins[1]))}min`
  if (hours && mins) return `${hours[1]}h ${Math.round(parseFloat(mins[1]))}min`
  if (hours) return `${hours[1]}h`
  if (mins && secs) return `${Math.floor(parseFloat(mins[1]))}min ${Math.ceil(parseFloat(secs[1]))}s`
  if (mins) return `${Math.round(parseFloat(mins[1]))}min`
  if (secs) return `${Math.ceil(parseFloat(secs[1]))}s`
  return raw
}
