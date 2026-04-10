interface ApiErrorWithStatus extends Error {
  status?: number
  headers?: { get?: (key: string) => string | null } & Record<string, string>
}

export function parseApiError(error: unknown): { message: string; status: number } {
  if (!(error instanceof Error)) {
    return { message: 'Erro interno inesperado. Tente novamente.', status: 500 }
  }

  const msg = error.message
  const apiErr = error as ApiErrorWithStatus
  const status = apiErr.status

  // Rate limit — usa headers HTTP do Groq (mais confiável que parsear texto)
  if (status === 429 || msg.includes('429')) {
    const headers = apiErr.headers
    const resetTokens = typeof headers?.get === 'function'
      ? headers.get('x-ratelimit-reset-tokens')
      : headers?.['x-ratelimit-reset-tokens']
    const resetRequests = typeof headers?.get === 'function'
      ? headers.get('x-ratelimit-reset-requests')
      : headers?.['x-ratelimit-reset-requests']

    const resetRaw = resetTokens || resetRequests

    // Fallback: tenta extrair do texto da mensagem
    const waitMatch = !resetRaw
      ? msg.match(/try again in ([^\s.]+(?:\.[^\s.]+)?s|[^\s]+m[^\s]*s?)/)
      : null

    const waitRaw = resetRaw ?? waitMatch?.[1]
    const wait = waitRaw
      ? ` Tente novamente em ${formatWait(waitRaw)}.`
      : ' O limite diário pode ter sido atingido — tente novamente amanhã ou atualize o plano no console do Groq.'

    return { message: `Limite de consultas atingido.${wait}`, status: 429 }
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

  // Erros de conexão com o MCP
  if (msg.includes('fetch failed') || msg.includes('ECONNREFUSED') || msg.includes('MCP')) {
    return {
      message: 'Não foi possível conectar às fontes de dados do governo. Verifique se o servidor MCP está ativo.',
      status: 503,
    }
  }

  // Timeout
  if (msg.includes('timeout') || msg.includes('ETIMEDOUT')) {
    return {
      message: 'A consulta demorou mais do que o esperado. Tente novamente.',
      status: 504,
    }
  }

  return { message: 'Erro interno. Tente novamente em alguns instantes.', status: 500 }
}

function formatWait(raw: string): string {
  // "14.123s" → "15s" | "1m30s" → "1min 30s" | "4h8m" → "4h 8min"
  const hours = raw.match(/(\d+)h/)
  const mins = raw.match(/(\d+)m/)
  const secs = raw.match(/([\d.]+)s/)
  if (hours && mins && secs) return `${hours[1]}h ${mins[1]}min ${Math.ceil(parseFloat(secs[1]))}s`
  if (hours && mins) return `${hours[1]}h ${mins[1]}min`
  if (hours) return `${hours[1]}h`
  if (mins && secs) return `${mins[1]}min ${Math.ceil(parseFloat(secs[1]))}s`
  if (mins) return `${mins[1]}min`
  if (secs) return `${Math.ceil(parseFloat(secs[1]))}s`
  return raw
}
