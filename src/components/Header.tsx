'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

function NavLink({ href, label }: { href: string; label: string }) {
  const path = usePathname()
  const active = path === href

  return (
    <Link
      href={href}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
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
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white hover:text-emerald-400 transition-colors">
          <Image src="/logo-sem-fundo.png" alt="Vote Transparente" width={80} height={80} className="object-contain" />
          <span>Vote Transparente</span>
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink href="/eleicoes" label="Eleições 2026" />
          <NavLink href="/candidato" label="Raio-X" />
          <NavLink href="/candidatos" label="Campo Eleitoral" />
          <NavLink href="/match" label="Match de Valores" />
        </nav>
      </div>
    </header>
  )
}
