interface GroqError {
  error?: {
    code?: string
    type?: string
    message?: string
  }
}

export function parseApiError(error: unknown): { message: string; status: number } {
  if (!(error instanceof Error)) {
    return { message: 'Erro interno inesperado. Tente novamente.', status: 500 }
  }

  const msg = error.message

  // Tenta extrair JSON da mensagem de erro do Groq
  const jsonMatch = msg.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      const parsed: GroqError = JSON.parse(jsonMatch[0])
      const code = parsed.error?.code
      const type = parsed.error?.type

      if (code === 'rate_limit_exceeded' || type === 'tokens') {
        const waitMatch = msg.match(/try again in (\d+h\d+m[\d.]+s|\d+m[\d.]+s)/)
        const wait = waitMatch ? ` Tente novamente em ${formatWait(waitMatch[1])}.` : ''
        return {
          message: `Limite de consultas atingido.${wait} Se precisar continuar agora, atualize o plano no console do Groq.`,
          status: 429,
        }
      }

      if (code === 'tool_use_failed') {
        return {
          message: 'Houve um problema ao consultar as fontes de dados. Tente reformular sua pesquisa.',
          status: 400,
        }
      }

      if (code === 'model_not_active' || code === 'model_decommissioned') {
        return {
          message: 'O modelo de IA está temporariamente indisponível. Tente novamente em alguns minutos.',
          status: 503,
        }
      }

      if (type === 'invalid_request_error') {
        return {
          message: 'Não foi possível processar a consulta. Tente novamente com termos diferentes.',
          status: 400,
        }
      }
    } catch { /* não era JSON válido */ }
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
  // "4h8m26.591s" → "4h 8min" | "8m26s" → "8min"
  const hours = raw.match(/(\d+)h/)
  const mins = raw.match(/(\d+)m/)
  if (hours && mins) return `${hours[1]}h ${mins[1]}min`
  if (hours) return `${hours[1]}h`
  if (mins) return `${mins[1]}min`
  return raw
}
