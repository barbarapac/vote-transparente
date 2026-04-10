/**
 * Sanitiza um input de texto do usuário antes de interpolar em prompts LLM.
 * Remove caracteres de controle e trunca ao limite especificado.
 */
export function sanitizeInput(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return ''
  return value
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // remove caracteres de controle (exceto \n, \r, \t)
    .trim()
    .slice(0, maxLength)
}

/** Limites por campo */
export const INPUT_LIMITS = {
  nome: 120,
  cargo: 60,
  estado: 2,
  municipio: 100,
  pergunta: 500,
  observacao: 500,
  ano: 4,
  tema: 100,
} as const
