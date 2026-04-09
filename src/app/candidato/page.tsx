'use client'

import { useState } from 'react'
import { Header } from '@/components/Header'
import { Markdown } from '@/components/Markdown'

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

  const inputClass = "w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:bg-white/8 transition-all"

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Raio-X do Candidato</h1>
          <p className="text-slate-400 text-sm">
            Pesquise um candidato e receba um relatório com dados oficiais sobre histórico,
            financiamento e transparência.
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
              Nome do candidato *
            </label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && pesquisar()}
              placeholder="Ex: Lula, Tarcísio, Marçal..."
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                Cargo
              </label>
              <select
                value={cargo}
                onChange={e => setCargo(e.target.value)}
                className={inputClass + " appearance-none cursor-pointer"}
              >
                <option value="" className="bg-slate-900">Todos os cargos</option>
                {CARGOS.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                Estado
              </label>
              <select
                value={estado}
                onChange={e => setEstado(e.target.value)}
                className={inputClass + " appearance-none cursor-pointer"}
              >
                <option value="" className="bg-slate-900">Todos os estados</option>
                {ESTADOS.map(e => <option key={e} value={e} className="bg-slate-900">{e}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={pesquisar}
            disabled={loading || !nome.trim()}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
          >
            {loading ? 'Consultando fontes oficiais...' : 'Pesquisar'}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl bg-white/5 border border-white/10 p-10 text-center">
            <div className="text-4xl mb-4 animate-pulse">🏛️</div>
            <p className="text-slate-300 text-sm font-medium mb-1">
              Consultando TSE, Portal da Transparência, TCU e outras fontes...
            </p>
            <p className="text-slate-500 text-xs">Isso pode levar até 30 segundos</p>
          </div>
        )}

        {/* Erro */}
        {erro && (
          <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-5">
            <p className="text-red-400 text-sm">⚠️ {erro}</p>
          </div>
        )}

        {/* Resultado */}
        {resposta && (
          <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="font-semibold text-white">Relatório</h2>
              <span className="text-xs text-slate-500 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                Fontes oficiais
              </span>
            </div>
            <div className="p-6">
              <Markdown content={resposta} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
