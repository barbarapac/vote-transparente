'use client'

import { useState } from 'react'
import { Building2, AlertTriangle } from 'lucide-react'
import { Header } from '@/components/Header'
import { Markdown } from '@/components/Markdown'
import { LoadingConsulta } from '@/components/LoadingConsulta'
import { ANOS_ELEICAO } from '@/lib/constants'
import { inputClass, labelClass } from '@/lib/styles'

export default function FinanciadoresPage() {
  const [doador, setDoador] = useState('')
  const [ano, setAno] = useState('')
  const [loading, setLoading] = useState(false)
  const [resposta, setResposta] = useState('')
  const [erro, setErro] = useState('')

  async function buscar() {
    if (!doador.trim()) return
    setLoading(true)
    setResposta('')
    setErro('')
    try {
      const res = await fetch('/api/financiadores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doador, ano }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao buscar financiadores')
      setResposta(data.resposta)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-900/25 via-slate-950 to-slate-950 pointer-events-none" />
      <Header />

      <main className="relative z-10 max-w-3xl mx-auto px-4 py-10 w-full flex-1">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Building2 size={20} className="text-orange-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Quem Financia Quem</h1>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
            Digite o nome ou CNPJ de uma empresa ou pessoa e descubra quais candidatos
            e partidos receberam doações eleitorais desse doador.
          </p>
        </div>

        {/* Formulário */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-5 mb-6">
          <div>
            <label className={labelClass}>Nome ou CNPJ do doador *</label>
            <input
              className={inputClass}
              placeholder="Ex: Construtora ABC, 12.345.678/0001-99, João Silva..."
              value={doador}
              onChange={e => setDoador(e.target.value)}
              maxLength={120}
            />
            <p className="text-xs text-slate-600 mt-2">
              Pode ser pessoa física, empresa ou CNPJ
            </p>
          </div>

          <div>
            <label className={labelClass}>Eleição (opcional)</label>
            <select className={inputClass + ' appearance-none cursor-pointer'} value={ano} onChange={e => setAno(e.target.value)}>
              <option value="" className="bg-slate-900">Mais recente disponível</option>
              {ANOS_ELEICAO.map(a => <option key={a} value={String(a)} className="bg-slate-900">{a}</option>)}
            </select>
          </div>

          <button
            onClick={buscar}
            disabled={doador.trim().length < 3 || loading}
            className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-colors"
          >
            Rastrear doações
          </button>
        </div>

        {/* Resultado */}
        {loading && (
          <LoadingConsulta mensagem="Rastreando doações eleitorais nas bases do TSE..." />
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
