'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Markdown } from '@/components/Markdown'
import Link from 'next/link'

const ESTADOS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
]

const CARGOS = [
  'Presidente', 'Governador', 'Senador', 'Deputado Federal',
  'Deputado Estadual', 'Prefeito', 'Vereador'
]

export default function CandidatoPage() {
  const [nome, setNome] = useState('')
  const [cargo, setCargo] = useState('')
  const [estado, setEstado] = useState('')
  const [loading, setLoading] = useState(false)
  const [resposta, setResposta] = useState('')
  const [erro, setErro] = useState('')

  async function pesquisar() {
    if (!nome.trim()) return
    setLoading(true)
    setResposta('')
    setErro('')

    try {
      const res = await fetch('/api/candidato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, cargo, estado }),
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
            <Link href="/candidato" className="underline">Raio-X</Link>
            <Link href="/match" className="hover:underline">Match de Valores</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-green-900 mb-1">Raio-X do Candidato</h1>
        <p className="text-gray-500 mb-6 text-sm">
          Pesquise um candidato e veja dados oficiais sobre histórico, financiamento e transparência.
        </p>

        <Card className="mb-6">
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Nome do candidato *
              </label>
              <input
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && pesquisar()}
                placeholder="Ex: Lula, Bolsonaro, Tarcísio..."
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Cargo (opcional)</label>
                <select
                  value={cargo}
                  onChange={e => setCargo(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Todos os cargos</option>
                  {CARGOS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Estado (opcional)</label>
                <select
                  value={estado}
                  onChange={e => setEstado(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Todos os estados</option>
                  {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>

            <button
              onClick={pesquisar}
              disabled={loading || !nome.trim()}
              className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              {loading ? '🔍 Pesquisando dados oficiais...' : 'Pesquisar'}
            </button>
          </CardContent>
        </Card>

        {loading && (
          <Card>
            <CardContent className="py-10 text-center">
              <div className="text-4xl mb-3 animate-pulse">🏛️</div>
              <p className="text-gray-500 text-sm">
                Consultando TSE, Portal da Transparência, TCU e outras fontes oficiais...
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
                <CardTitle className="text-lg text-green-900">Resultado</CardTitle>
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
