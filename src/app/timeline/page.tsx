'use client'

import { useState } from 'react'
import { History, AlertTriangle } from 'lucide-react'
import { Header } from '@/components/Header'
import { Markdown } from '@/components/Markdown'
import { LoadingConsulta } from '@/components/LoadingConsulta'
import { ESTADOS } from '@/lib/constants'
import { inputClass, labelClass } from '@/lib/styles'

export default function TimelinePage() {
  const [nome, setNome] = useState('')
  const [estado, setEstado] = useState('')
  const [loading, setLoading] = useState(false)
  const [resposta, setResposta] = useState('')
  const [erro, setErro] = useState('')

  async function buscar() {
    if (!nome.trim()) return
    setLoading(true)
    setResposta('')
    setErro('')
    try {
      const res = await fetch('/api/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, estado }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao buscar linha do tempo')
      setResposta(data.resposta)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/25 via-slate-950 to-slate-950 pointer-events-none" />
      <Header />

      <main className="relative z-10 max-w-3xl mx-auto px-4 py-10 w-full flex-1">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <History size={20} className="text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Linha do Tempo</h1>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
            Veja toda a carreira política de um candidato em ordem cronológica —
            partidos, eleições, mandatos, mudanças de lado e fatos marcantes.
          </p>
        </div>

        {/* Formulário */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-5 mb-6">
          <div>
            <label className={labelClass}>Nome do candidato / político *</label>
            <input
              className={inputClass}
              placeholder="Ex: Ciro Gomes, Romário, Benedita da Silva..."
              value={nome}
              onChange={e => setNome(e.target.value)}
              maxLength={120}
            />
          </div>

          <div>
            <label className={labelClass}>Estado (opcional — ajuda a filtrar homônimos)</label>
            <select className={inputClass + ' appearance-none cursor-pointer'} value={estado} onChange={e => setEstado(e.target.value)}>
              <option value="" className="bg-slate-900">Qualquer estado</option>
              {ESTADOS.map(uf => <option key={uf} value={uf} className="bg-slate-900">{uf}</option>)}
            </select>
          </div>

          <button
            onClick={buscar}
            disabled={nome.trim().length < 2 || loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-colors"
          >
            Montar linha do tempo
          </button>
        </div>

        {/* Resultado */}
        {loading && (
          <LoadingConsulta mensagem="Levantando histórico eleitoral completo nas bases do TSE..." />
        )}

        {erro && !loading && (
          <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-5 flex gap-3">
            <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{erro}</p>
          </div>
        )}

        {resposta && !loading && (
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <Markdown content={resposta} />
          </div>
        )}
      </main>
    </div>
  )
}
