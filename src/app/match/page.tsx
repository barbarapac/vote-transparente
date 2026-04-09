'use client'

import { useState } from 'react'
import { Header } from '@/components/Header'
import { Markdown } from '@/components/Markdown'

const CARGOS = [
  'Presidente', 'Governador', 'Senador', 'Deputado Federal',
  'Deputado Estadual', 'Prefeito', 'Vereador'
]

const ESTADOS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
]

const TEMAS = [
  { icon: '🛡️', label: 'Segurança pública' },
  { icon: '🏥', label: 'Saúde' },
  { icon: '📚', label: 'Educação' },
  { icon: '🌿', label: 'Meio ambiente' },
  { icon: '💼', label: 'Economia e emprego' },
  { icon: '🔍', label: 'Combate à corrupção' },
  { icon: '🏠', label: 'Habitação' },
  { icon: '🚌', label: 'Transporte público' },
  { icon: '🤝', label: 'Direitos humanos' },
  { icon: '💡', label: 'Tecnologia e inovação' },
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

  const inputClass = "w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:bg-white/8 transition-all"
  const labelClass = "text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block"

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Match de Valores</h1>
          <p className="text-slate-400 text-sm">
            Diga o que é importante para você e descubra qual candidato melhor
            representa suas prioridades com base em dados reais.
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 space-y-6">

          {/* Cargo e Estado */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Cargo *</label>
              <select value={cargo} onChange={e => setCargo(e.target.value)} className={inputClass + " appearance-none cursor-pointer"}>
                <option value="" className="bg-slate-900">Selecione o cargo</option>
                {CARGOS.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Estado *</label>
              <select value={estado} onChange={e => setEstado(e.target.value)} className={inputClass + " appearance-none cursor-pointer"}>
                <option value="" className="bg-slate-900">Selecione</option>
                {ESTADOS.map(e => <option key={e} value={e} className="bg-slate-900">{e}</option>)}
              </select>
            </div>
          </div>

          {/* Município */}
          <div>
            <label className={labelClass}>Município <span className="normal-case text-slate-600 font-normal">(opcional)</span></label>
            <input
              type="text"
              value={municipio}
              onChange={e => setMunicipio(e.target.value)}
              placeholder="Ex: São Paulo, Belo Horizonte..."
              className={inputClass}
            />
          </div>

          {/* Temas */}
          <div>
            <label className={labelClass}>
              O que mais importa para você?{' '}
              <span className="normal-case text-slate-600 font-normal">selecione quantos quiser</span>
            </label>
            <div className="flex flex-wrap gap-2 mt-1">
              {TEMAS.map(({ icon, label }) => (
                <button
                  key={label}
                  onClick={() => toggleTema(label)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all ${
                    temasSelecionados.includes(label)
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
                      : 'bg-white/5 text-slate-300 border-white/15 hover:border-emerald-500/40 hover:text-white'
                  }`}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Campo livre */}
          <div>
            <label className={labelClass}>
              Algo mais que você considera importante?{' '}
              <span className="normal-case text-slate-600 font-normal">(opcional)</span>
            </label>
            <textarea
              value={observacao}
              onChange={e => setObservacao(e.target.value)}
              placeholder="Ex: quero um candidato com histórico limpo que apoie pequenas empresas..."
              rows={3}
              className={inputClass + " resize-none"}
            />
          </div>

          <button
            onClick={buscarMatch}
            disabled={loading || !cargo || !estado}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
          >
            {loading ? 'Analisando candidatos...' : 'Encontrar candidatos compatíveis'}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl bg-white/5 border border-white/10 p-10 text-center">
            <div className="text-4xl mb-4 animate-pulse">⚖️</div>
            <p className="text-slate-300 text-sm font-medium mb-1">
              Buscando candidatos e cruzando com suas prioridades...
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
              <h2 className="font-semibold text-white">Candidatos compatíveis</h2>
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
