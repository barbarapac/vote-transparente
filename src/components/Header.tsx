'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Menu, X, Vote, Search, GitCompare, Scale, ShieldCheck,
  ClipboardCheck, Building2, BarChart2, History, Landmark,
} from 'lucide-react'

const LINKS = [
  { href: '/eleicoes',     label: 'Eleições 2026',           Icon: Vote },
  { href: '/candidato',    label: 'Raio-X do Candidato',     Icon: Search },
  { href: '/comparador',   label: 'Comparador',              Icon: GitCompare },
  { href: '/match',        label: 'Match de Valores',        Icon: Scale },
  { href: '/verificador',  label: 'Verificador de Afirmações', Icon: ShieldCheck },
  { href: '/promessas',    label: 'Rastreador de Promessas', Icon: ClipboardCheck },
  { href: '/financiadores',label: 'Quem Financia Quem',      Icon: Building2 },
  { href: '/mandato',      label: 'Painel do Mandato',       Icon: BarChart2 },
  { href: '/timeline',     label: 'Linha do Tempo',          Icon: History },
  { href: '/candidatos',   label: 'Campo Eleitoral',         Icon: Landmark },
]

function NavLink({ href, label }: { href: string; label: string }) {
  const path = usePathname()
  const active = path === href

  return (
    <Link
      href={href}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
        active
          ? 'bg-emerald-500 text-white'
          : 'text-slate-300 hover:text-white hover:bg-white/10'
      }`}
    >
      {label}
    </Link>
  )
}

export function Header() {
  const [aberto, setAberto] = useState(false)
  const pathname = usePathname()

  // Fecha o menu ao navegar
  useEffect(() => {
    setAberto(false)
  }, [pathname])

  // Fecha ao pressionar Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setAberto(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg text-white hover:text-emerald-400 transition-colors shrink-0"
          >
            <Image src="/logo-sem-fundo.png" alt="Vote Transparente" width={80} height={80} className="object-contain" />
            <span>Vote Transparente</span>
          </Link>

          {/* Nav desktop — esconde quando não couber */}
          <nav className="hidden lg:flex items-center gap-1">
            <NavLink href="/eleicoes" label="Eleições 2026" />
            <NavLink href="/candidato" label="Raio-X" />
            <NavLink href="/comparador" label="Comparador" />
            <NavLink href="/verificador" label="Verificador" />
            <NavLink href="/match" label="Match" />
          </nav>

          {/* Botão hamburguer */}
          <button
            onClick={() => setAberto(v => !v)}
            aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
            className="flex items-center justify-center w-10 h-10 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all"
          >
            {aberto ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Overlay */}
      {aberto && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setAberto(false)}
        />
      )}

      {/* Drawer lateral direito */}
      <div
        className={`fixed top-0 right-0 h-full w-72 z-50 bg-slate-900 border-l border-white/10 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          aberto ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Cabeçalho do drawer */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/10 shrink-0">
          <span className="text-sm font-semibold text-slate-300">Ferramentas</span>
          <button
            onClick={() => setAberto(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {LINKS.map(({ href, label, Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-sm font-medium transition-all ${
                  active
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/8 border border-transparent'
                }`}
              >
                <Icon size={17} className={active ? 'text-emerald-400' : 'text-slate-500'} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Rodapé do drawer */}
        <div className="px-5 py-4 border-t border-white/10 shrink-0">
          <p className="text-xs text-slate-600 leading-relaxed">
            Dados de fontes oficiais do governo brasileiro. Sem opiniões políticas.
          </p>
        </div>
      </div>
    </>
  )
}
