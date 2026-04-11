'use client'

import { useState } from 'react'
import { GitCompare, AlertTriangle } from 'lucide-react'
import { Header } from '@/components/Header'
import { Markdown } from '@/components/Markdown'
import { LoadingConsulta } from '@/components/LoadingConsulta'
import { ESTADOS, CARGOS, CARGOS_COM_ESTADO } from '@/lib/constants'
import { inputClass, labelClass } from '@/lib/styles'

function CandidatoForm({
  titulo,
  cor,
  nome,
  cargo,
  estado,
  onNome,
  onCargo,
  onEstado,
}: {
  titulo: string
  cor: string
  nome: string
  cargo: string
  estado: string
  onNome: (v: string) => void
  onCargo: (v: string) => void
  onEstado: (v: string) => void
}) {
  const precisaEstado = CARGOS_COM_ESTADO.has(cargo)

  function handleCargo(novoCargo: string) {
    onCargo(novoCargo)
    if (!CARGOS_COM_ESTADO.has(novoCargo)) onEstado('')
  }

  return (
    <div className={`flex-1 p-5 rounded-2xl bg-white/5 border ${cor} space-y-4`}>
      <p className="text-sm font-semibold text-slate-300">{titulo}</p>

      <div>
        <label className={labelClass}>Nome do candidato *</label>
        <input
          className={inputClass}
          placeholder="Ex: Lula, Bolsonaro, Marina Silva..."
          value={nome}
          onChange={e => onNome(e.target.value)}
          maxLength={120}
        />
      </div>

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
          <select className={inputClass + ' appearance-none cursor-pointer'} value={estado} onChange={e => onEstado(e.target.value)}>
            <option value="" className="bg-slate-900">Selecione o estado</option>
            {ESTADOS.map(uf => <option key={uf} value={uf} className="bg-slate-900">{uf}</option>)}
          </select>
        </div>
      )}
    </div>
  )
}

export default function ComparadorPage() {
  const [nome1, setNome1] = useState('')
  const [cargo1, setCargo1] = useState('')
  const [estado1, setEstado1] = useState('')
  const [nome2, setNome2] = useState('')
  const [cargo2, setCargo2] = useState('')
  const [estado2, setEstado2] = useState('')
  const [loading, setLoading] = useState(false)
  const [resposta, setResposta] = useState('')
  const [erro, setErro] = useState('')

  async function comparar() {
    if (!nome1.trim() || !nome2.trim()) return
    setLoading(true)
    setResposta('')
    setErro('')
    try {
      const res = await fetch('/api/comparador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome1, cargo1, estado1, nome2, cargo2, estado2 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao comparar candidatos')
      setResposta(data.resposta)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const podeComparar = nome1.trim().length >= 2 && nome2.trim().length >= 2

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 via-slate-950 to-slate-950 pointer-events-none" />
      <Header />

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-10 w-full flex-1">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <GitCompare size={20} className="text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Comparador de Candidatos</h1>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
            Coloque dois candidatos lado a lado e compare financiamento, patrimônio,
            histórico parlamentar e transparência — tudo com dados oficiais.
          </p>
        </div>

        {/* Formulário */}
        <div className="space-y-5 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <CandidatoForm
              titulo="Candidato A"
              cor="border-violet-500/30"
              nome={nome1} cargo={cargo1} estado={estado1}
              onNome={setNome1} onCargo={setCargo1} onEstado={setEstado1}
            />
            <div className="hidden md:flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <span className="text-slate-500 text-xs font-bold">VS</span>
              </div>
            </div>
            <CandidatoForm
              titulo="Candidato B"
              cor="border-blue-500/30"
              nome={nome2} cargo={cargo2} estado={estado2}
              onNome={setNome2} onCargo={setCargo2} onEstado={setEstado2}
            />
          </div>

          <button
            onClick={comparar}
            disabled={!podeComparar || loading}
            className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-colors"
          >
            Comparar candidatos
          </button>
        </div>

        {/* Resultado */}
        {loading && (
          <LoadingConsulta mensagem="Buscando dados de ambos os candidatos — pode levar até 2 minutos" />
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
