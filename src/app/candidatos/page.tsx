'use client'

import { useState } from 'react'
import { Header } from '@/components/Header'
import { Markdown } from '@/components/Markdown'
import { LoadingConsulta } from '@/components/LoadingConsulta'

const ESTADOS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
]

const CARGOS = [
  'Presidente', 'Governador', 'Senador', 'Deputado Federal',
  'Deputado Estadual', 'Prefeito', 'Vereador'
]

const CARGOS_COM_ESTADO = new Set(['Governador', 'Senador', 'Deputado Federal', 'Deputado Estadual', 'Prefeito', 'Vereador'])
const CARGOS_COM_MUNICIPIO = new Set(['Prefeito', 'Vereador'])

const ANOS = [2024, 2022, 2020, 2018, 2016, 2014, 2012, 2010]

export default function CandidatosPage() {
  const [cargo, setCargo] = useState('')
  const [estado, setEstado] = useState('')
  const [municipio, setMunicipio] = useState('')
  const [ano, setAno] = useState('')
  const [loading, setLoading] = useState(false)
  const [resposta, setResposta] = useState('')
  const [erro, setErro] = useState('')

  const precisaEstado = CARGOS_COM_ESTADO.has(cargo)
  const precisaMunicipio = CARGOS_COM_MUNICIPIO.has(cargo)

  function handleCargo(novoCargo: string) {
    setCargo(novoCargo)
    if (!CARGOS_COM_ESTADO.has(novoCargo)) setEstado('')
    if (!CARGOS_COM_MUNICIPIO.has(novoCargo)) setMunicipio('')
  }

  async function listar() {
    if (!cargo) return
    if (precisaEstado && !estado) return
    if (precisaMunicipio && !municipio) return

    setLoading(true)
    setResposta('')
    setErro('')

    try {
      const res = await fetch('/api/candidatos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cargo, estado, municipio, ano }),
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Campo Eleitoral</h1>
          <p className="text-slate-400 text-sm">
            Veja todos os candidatos a um cargo e um resumo rápido sobre cada um —
            envolvimento em escândalos, projetos e histórico.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 space-y-4">
          {/* Cargo */}
          <div className={precisaEstado ? 'grid grid-cols-2 gap-4' : 'grid grid-cols-1 gap-4'}>
            <div>
              <label className={labelClass}>Cargo *</label>
              <select
                value={cargo}
                onChange={e => handleCargo(e.target.value)}
                className={inputClass + ' appearance-none cursor-pointer'}
              >
                <option value="" className="bg-slate-900">Selecione o cargo</option>
                {CARGOS.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
              </select>
            </div>

            {precisaEstado && (
              <div>
                <label className={labelClass}>Estado *</label>
                <select
                  value={estado}
                  onChange={e => setEstado(e.target.value)}
                  className={inputClass + ' appearance-none cursor-pointer'}
                >
                  <option value="" className="bg-slate-900">Selecione</option>
                  {ESTADOS.map(e => <option key={e} value={e} className="bg-slate-900">{e}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Município */}
          {precisaMunicipio && (
            <div>
              <label className={labelClass}>Município *</label>
              <input
                type="text"
                value={municipio}
                onChange={e => setMunicipio(e.target.value)}
                placeholder="Ex: São Paulo, Belo Horizonte..."
                className={inputClass}
              />
            </div>
          )}

          {/* Ano */}
          <div>
            <label className={labelClass}>
              Ano da eleição{' '}
              <span className="normal-case text-slate-600 font-normal">(opcional — padrão: mais recente)</span>
            </label>
            <select
              value={ano}
              onChange={e => setAno(e.target.value)}
              className={inputClass + ' appearance-none cursor-pointer'}
            >
              <option value="" className="bg-slate-900">Mais recente disponível</option>
              {ANOS.map(a => <option key={a} value={a} className="bg-slate-900">{a}</option>)}
            </select>
          </div>

          <button
            onClick={listar}
            disabled={loading || !cargo || (precisaEstado && !estado) || (precisaMunicipio && !municipio)}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
          >
            {loading ? 'Buscando candidatos...' : 'Ver todos os candidatos'}
          </button>
        </div>

        {loading && (
          <LoadingConsulta mensagem="Consultando TSE e cruzando com dados de transparência..." />
        )}

        {erro && (
          <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-5">
            <p className="text-red-400 text-sm">⚠️ {erro}</p>
          </div>
        )}

        {resposta && (
          <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="font-semibold text-white">Candidatos encontrados</h2>
              <span className="text-xs text-slate-500 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                Fontes oficiais
              </span>
            </div>
            <div className="p-6 select-text">
              <Markdown content={resposta} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
