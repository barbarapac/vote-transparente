'use client'

import { useEffect, useState } from 'react'

const ETAPAS = [
  'Conectando ao TSE...',
  'Buscando dados eleitorais...',
  'Consultando Portal da Transparência...',
  'Verificando declarações de bens...',
  'Cruzando financiamento de campanha...',
  'Checando sanções e irregularidades...',
  'Consultando TCU e CGU...',
  'Analisando histórico parlamentar...',
  'Compilando relatório...',
]

interface Props {
  mensagem?: string
}

export function LoadingConsulta({ mensagem }: Props) {
  const [etapaIndex, setEtapaIndex] = useState(0)
  const [visivel, setVisivel] = useState(true)

  useEffect(() => {
    const intervalo = setInterval(() => {
      setVisivel(false)
      setTimeout(() => {
        setEtapaIndex(i => (i + 1) % ETAPAS.length)
        setVisivel(true)
      }, 300)
    }, 2200)
    return () => clearInterval(intervalo)
  }, [])

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-10 flex flex-col items-center gap-6">
      {/* Spinner */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-white/10" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin" />
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-emerald-300/50 animate-spin [animation-duration:1.5s] [animation-direction:reverse]" />
      </div>

      {/* Etapa atual */}
      <div className="text-center space-y-2">
        <p
          className="text-slate-300 text-sm font-medium transition-opacity duration-300"
          style={{ opacity: visivel ? 1 : 0 }}
        >
          {ETAPAS[etapaIndex]}
        </p>
        <p className="text-slate-500 text-xs">
          {mensagem ?? 'Isso pode levar até 1 minuto'}
        </p>
      </div>

      {/* Barra de progresso infinita */}
      <div className="w-full max-w-xs h-1 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full animate-[loading_2s_ease-in-out_infinite]" />
      </div>
    </div>
  )
}
