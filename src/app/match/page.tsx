'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Markdown } from '@/components/Markdown'
import Link from 'next/link'

const CARGOS = [
  'Presidente', 'Governador', 'Senador', 'Deputado Federal',
  'Deputado Estadual', 'Prefeito', 'Vereador'
]

const ESTADOS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
]

const TEMAS = [
  'Segurança pública',
  'Saúde',
  'Educação',
  'Meio ambiente',
  'Economia e emprego',
  'Combate à corrupção',
  'Habitação',
  'Transporte público',
  'Direitos humanos',
  'Tecnologia e inovação',
]

export default function MatchPage() {
  const [cargo, setCargo] = useState('')
  const [estado, setEstado] = useState('')
  const [municipio, setMunicipio] = useState('')
  const [temasSelecionados, setTemasSelecionados] = useState<string[]>([])
  const [observacao, setObservacao] = useState('')
  const [loading, setLoading] = useState(false)
  const [resposta, setResposta] = useState('')
  const [erro, setErro] = useState('')

  function toggleTema(tema: string) {
    setTemasSelecionados(prev =>
      prev.includes(tema) ? prev.filter(t => t !== tema) : [...prev, tema]
    )
  }

  async function buscarMatch() {
    if (!cargo || !estado) return
    setLoading(true)
    setResposta('')
    setErro('')

    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cargo, estado, municipio, temas: temasSelecionados, observacao }),
      })
      const data = await res.json()
      if (data.error) setErro(data.error)
      else setResposta(data.resposta)
    } catch {
      setErro('Erro ao conectar com o servidor. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-700 text-white py-4 px-6 shadow">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">🗳️ Voto Transparente</Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/candidato" className="hover:underline">Raio-X</Link>
            <Link href="/match" className="underline">Match de Valores</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-green-900 mb-1">Match de Valores</h1>
        <p className="text-gray-500 mb-6 text-sm">
          Diga o que é importante para você e descubra qual candidato melhor representa seus valores.
        </p>

        <Card className="mb-6">
          <CardContent className="pt-6 space-y-5">
            {/* Cargo e Estado */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Cargo *</label>
                <select
                  value={cargo}
                  onChange={e => setCargo(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Selecione o cargo</option>
                  {CARGOS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Estado *</label>
                <select
                  value={estado}
                  onChange={e => setEstado(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Selecione o estado</option>
                  {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>

            {/* Município */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Município (opcional)
              </label>
              <input
                type="text"
                value={municipio}
                onChange={e => setMunicipio(e.target.value)}
                placeholder="Ex: São Paulo, Belo Horizonte..."
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Temas */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                O que mais importa para você? (selecione quantos quiser)
              </label>
              <div className="flex flex-wrap gap-2">
                {TEMAS.map(tema => (
                  <button
                    key={tema}
                    onClick={() => toggleTema(tema)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      temasSelecionados.includes(tema)
                        ? 'bg-green-700 text-white border-green-700'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {tema}
                  </button>
                ))}
              </div>
            </div>

            {/* Observação livre */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Algo mais que você considera importante? (opcional)
              </label>
              <textarea
                value={observacao}
                onChange={e => setObservacao(e.target.value)}
                placeholder="Ex: quero um candidato que apoie pequenas empresas e tenha histórico limpo..."
                rows={3}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>

            <button
              onClick={buscarMatch}
              disabled={loading || !cargo || !estado}
              className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              {loading ? '🔍 Analisando candidatos...' : 'Encontrar candidatos compatíveis'}
            </button>
          </CardContent>
        </Card>

        {loading && (
          <Card>
            <CardContent className="py-10 text-center">
              <div className="text-4xl mb-3 animate-pulse">⚖️</div>
              <p className="text-gray-500 text-sm">
                Buscando candidatos e cruzando com suas prioridades...
              </p>
              <p className="text-gray-400 text-xs mt-1">Isso pode levar até 30 segundos</p>
            </CardContent>
          </Card>
        )}

        {erro && (
          <Card className="border-red-200">
            <CardContent className="py-6">
              <p className="text-red-600 text-sm">⚠️ {erro}</p>
            </CardContent>
          </Card>
        )}

        {resposta && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-green-900">Candidatos compatíveis</CardTitle>
                <Badge variant="outline" className="text-xs text-gray-500">
                  Dados de fontes oficiais
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Markdown content={resposta} />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
