'use client'

import { useState } from 'react'
import { ShieldCheck, AlertTriangle } from 'lucide-react'
import { Header } from '@/components/Header'
import { Markdown } from '@/components/Markdown'
import { LoadingConsulta } from '@/components/LoadingConsulta'
import { labelClass } from '@/lib/styles'

const EXEMPLOS = [
  'O candidato X nunca foi condenado por corrupção',
  'O senador Y faltou mais de 50% das votações este ano',
  'A empresa Z doou R$ 1 milhão para a campanha do candidato W',
  'O deputado nunca votou a favor do meio ambiente',
]

export default function VerificadorPage() {
  const [afirmacao, setAfirmacao] = useState('')
  const [loading, setLoading] = useState(false)
  const [resposta, setResposta] = useState('')
  const [erro, setErro] = useState('')

  async function verificar() {
    if (!afirmacao.trim()) return
    setLoading(true)
    setResposta('')
    setErro('')
    try {
      const res = await fetch('/api/verificador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ afirmacao }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao verificar afirmação')
      setResposta(data.resposta)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-rose-900/25 via-slate-950 to-slate-950 pointer-events-none" />
      <Header />

      <main className="relative z-10 max-w-3xl mx-auto px-4 py-10 w-full flex-1">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
              <ShieldCheck size={20} className="text-rose-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Verificador de Afirmações</h1>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
            Cole uma afirmação política e a IA verifica nos dados oficiais do governo
            se ela é verdadeira, falsa ou sem dados suficientes — com fontes.
          </p>
        </div>

        {/* Formulário */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-5 mb-6">
          <div>
            <label className={labelClass}>Afirmação a verificar *</label>
            <textarea
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/60 focus:bg-white/8 transition-all resize-none"
              rows={4}
              placeholder='Ex: "O deputado João Silva votou contra o Fundeb em 2020"'
              value={afirmacao}
              onChange={e => setAfirmacao(e.target.value)}
              maxLength={800}
            />
            <p className="text-xs text-slate-600 mt-1 text-right">{afirmacao.length}/800</p>
          </div>

          {/* Exemplos */}
          <div>
            <p className="text-xs text-slate-500 mb-2">Exemplos de afirmações:</p>
            <div className="space-y-1.5">
              {EXEMPLOS.map(ex => (
                <button
                  key={ex}
                  onClick={() => setAfirmacao(ex)}
                  className="block w-full text-left text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all"
                >
                  &ldquo;{ex}&rdquo;
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={verificar}
            disabled={afirmacao.trim().length < 10 || loading}
            className="w-full py-3 rounded-xl bg-rose-700 hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-colors"
          >
            Verificar afirmação
          </button>
        </div>

        {/* Aviso */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 mb-6 flex gap-3">
          <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400 leading-relaxed">
            A verificação depende dos dados disponíveis nas APIs do governo. Afirmações muito
            genéricas ou sem nomes específicos podem retornar &ldquo;Sem dados suficientes&rdquo;.
          </p>
        </div>

        {/* Resultado */}
        {loading && (
          <LoadingConsulta mensagem="Consultando fontes oficiais para verificar a afirmação..." />
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
