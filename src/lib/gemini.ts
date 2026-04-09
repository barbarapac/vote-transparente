import { GoogleGenerativeAI, SchemaType, Tool, FunctionDeclaration } from '@google/generative-ai'
import { createMcpSession, listMcpTools, callMcpTool } from './mcp-client'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const SYSTEM_PROMPT = `Você é um assistente cívico especializado em transparência eleitoral brasileira.

Seu papel é ajudar eleitores a conhecer candidatos e tomar decisões de voto informadas, usando
exclusivamente dados oficiais do governo brasileiro.

REGRAS IMPORTANTES:
1. Nunca emita opiniões políticas próprias
2. Baseie TODAS as afirmações em dados das ferramentas — nunca invente informações
3. Sempre cite a fonte dos dados (ex: "Segundo o TSE...", "De acordo com o Portal da Transparência...")
4. Se não encontrar dados suficientes, informe claramente ao usuário
5. Use linguagem acessível — o usuário pode ser qualquer eleitor brasileiro
6. Quando buscar ferramentas, use termos em português relacionados ao que precisa

Para pesquisar candidatos, use a ferramenta search_tools para descobrir quais ferramentas usar,
depois use call_tool para executar as consultas necessárias.`

// Definição das 6 meta-ferramentas do MCP Brasil para o Gemini
const MCP_FUNCTION_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: 'search_tools',
    description: 'Busca ferramentas disponíveis no MCP Brasil por linguagem natural. Use para descobrir quais ferramentas usar antes de chamar call_tool.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        query: { type: SchemaType.STRING, description: 'Busca em linguagem natural, ex: "candidatos TSE eleições cargo"' },
      },
      required: ['query'],
    },
  },
  {
    name: 'call_tool',
    description: 'Executa uma ferramenta do MCP Brasil pelo nome com os argumentos necessários.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        name: { type: SchemaType.STRING, description: 'Nome exato da ferramenta (obtido via search_tools)' },
        arguments: { type: SchemaType.OBJECT, description: 'Argumentos da ferramenta conforme sua definição', properties: {} },
      },
      required: ['name'],
    },
  },
  {
    name: 'planejar_consulta',
    description: 'Cria um plano de execução para consultas complexas que precisam de múltiplas ferramentas.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        query: { type: SchemaType.STRING, description: 'Pergunta em linguagem natural' },
      },
      required: ['query'],
    },
  },
  {
    name: 'executar_lote',
    description: 'Executa múltiplas ferramentas em paralelo de uma só vez.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        consultas: {
          type: SchemaType.ARRAY,
          description: 'Lista de ferramentas para executar',
          items: {
            type: SchemaType.OBJECT,
            properties: {
              tool: { type: SchemaType.STRING },
              args: { type: SchemaType.OBJECT, properties: {} },
            },
          },
        },
      },
      required: ['consultas'],
    },
  },
  {
    name: 'recomendar_tools',
    description: 'Recomenda ferramentas relevantes para uma pergunta, com explicação de quando usar cada uma.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        query: { type: SchemaType.STRING, description: 'Pergunta ou descrição do que precisa' },
      },
      required: ['query'],
    },
  },
  {
    name: 'listar_features',
    description: 'Lista todas as APIs governamentais disponíveis no MCP Brasil e seus status.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {},
      required: [],
    },
  },
]

const mcpTools: Tool[] = [{ functionDeclarations: MCP_FUNCTION_DECLARATIONS }]

export async function consultarComIA(pergunta: string): Promise<string> {
  const sessionId = await createMcpSession()

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: SYSTEM_PROMPT,
    tools: mcpTools,
  })

  const chat = model.startChat()
  let response = await chat.sendMessage(pergunta)

  // Loop de function calling
  while (response.response.functionCalls()?.length) {
    const calls = response.response.functionCalls()!
    const results = []

    for (const call of calls) {
      try {
        const result = await callMcpTool(sessionId, call.name, (call.args ?? {}) as Record<string, unknown>)
        results.push({ functionResponse: { name: call.name, response: { result } } })
      } catch (err) {
        results.push({
          functionResponse: {
            name: call.name,
            response: { error: err instanceof Error ? err.message : 'Erro ao executar ferramenta' },
          },
        })
      }
    }

    response = await chat.sendMessage(results)
  }

  return response.response.text()
}
