'use client'

import { useState } from 'react'
import { ClipboardCheck, AlertTriangle } from 'lucide-react'
import { Header } from '@/components/Header'
import { Markdown } from '@/components/Markdown'
import { LoadingConsulta } from '@/components/LoadingConsulta'
import { ESTADOS, CARGOS, CARGOS_COM_ESTADO } from '@/lib/constants'
import { inputClass, labelClass } from '@/lib/styles'

const TEMAS = [
  'Saúde', 'Educação', 'Segurança pública', 'Meio ambiente',
  'Economia', 'Habitação', 'Direitos humanos', 'Combate à corrupção',
]

export default function PromessasPage() {
  const [nome, setNome] = useState('')
  const [cargo, setCargo] = useState('')
  const [estado, setEstado] = useState('')
  const [tema, setTema] = useState('')
  const [loading, setLoading] = useState(false)
  const [resposta, setResposta] = useState('')
  const [erro, setErro] = useState('')

  const precisaEstado = CARGOS_COM_ESTADO.has(cargo)

  function handleCargo(novoCargo: string) {
    setCargo(novoCargo)
    if (!CARGOS_COM_ESTADO.has(novoCargo)) setEstado('')
  }

  async function rastrear() {
    if (!nome.trim()) return
    setLoading(true)
    setResposta('')
    setErro('')
    try {
      const res = await fetch('/api/promessas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, cargo, estado, tema }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao rastrear promessas')
      setResposta(data.resposta)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/25 via-slate-950 to-slate-950 pointer-events-none" />
      <Header />

      <main className="relative z-10 max-w-3xl mx-auto px-4 py-10 w-full flex-1">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <ClipboardCheck size={20} className="text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Rastreador de Promessas</h1>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
            Cruze as promessas e bandeiras de campanha de um candidato com o que ele de
            fato votou e fez durante o mandato — tudo via dados oficiais.
          </p>
        </div>

        {/* Formulário */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-5 mb-6">
          <div>
            <label className={labelClass}>Nome do candidato / político *</label>
            <input
              className={inputClass}
              placeholder="Ex: Lula, Marina Silva, Tabata Amaral..."
              value={nome}
              onChange={e => setNome(e.target.value)}
              maxLength={120}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Cargo (opcional)</label>
              <select className={inputClass + ' appearance-none cursor-pointer'} value={cargo} onChange={e => handleCargo(e.target.value)}>
                <option value="" className="bg-slate-900">Qualquer cargo</option>
                {CARGOS.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
              </select>
            </div>
            {precisaEstado && (
              <div>
                <label className={labelClass}>Estado</label>
                <select className={inputClass + ' appearance-none cursor-pointer'} value={estado} onChange={e => setEstado(e.target.value)}>
                  <option value="" className="bg-slate-900">Selecione</option>
                  {ESTADOS.map(uf => <option key={uf} value={uf} className="bg-slate-900">{uf}</option>)}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className={labelClass}>Filtrar por tema (opcional)</label>
            <div className="flex flex-wrap gap-2">
              {TEMAS.map(t => (
                <button
                  key={t}
                  onClick={() => setTema(prev => prev === t ? '' : t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    tema === t
                      ? 'bg-amber-500 text-white'
                      : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={rastrear}
            disabled={nome.trim().length < 2 || loading}
            className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-colors"
          >
            Rastrear promessas
          </button>
        </div>

        {/* Resultado */}
        {loading && (
          <LoadingConsulta mensagem="Cruzando promessas com votações reais — pode levar até 1 minuto" />
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
