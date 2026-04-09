'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Header() {
  const path = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white hover:text-emerald-400 transition-colors">
          <span className="text-2xl">🗳️</span>
          <span>Voto Transparente</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/candidato"
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              path === '/candidato'
                ? 'bg-emerald-500 text-white'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Raio-X
          </Link>
          <Link
            href="/match"
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              path === '/match'
                ? 'bg-emerald-500 text-white'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Match de Valores
          </Link>
        </nav>
      </div>
    </header>
  )
}
