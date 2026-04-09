import Link from 'next/link'
import { Header } from '@/components/Header'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 py-28 overflow-hidden select-none">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-slate-950 to-slate-950 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <span className="inline-block px-3 py-1 mb-6 text-xs font-semibold tracking-widest uppercase rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Transparência Eleitoral
          </span>
          <h1 className="text-5xl font-bold mb-5 leading-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
            Pesquise antes de votar
          </h1>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed">
            Use dados oficiais do governo brasileiro para conhecer candidatos,
            entender seus históricos e descobrir quem realmente representa seus valores.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/candidato"
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
            >
              🔍 Pesquisar candidato
            </Link>
            <Link
              href="/match"
              className="px-8 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl border border-white/20 transition-all"
            >
              ⚖️ Match de valores
            </Link>
          </div>
        </div>
      </section>

      {/* Cards de funcionalidades */}
      <section className="max-w-4xl mx-auto px-4 pb-16 w-full select-none">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
          <Link href="/candidato" className="group">
            <div className="h-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 hover:border-emerald-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-2xl mb-4">🔍</div>
              <h2 className="text-xl font-bold text-white mb-2">Raio-X do Candidato</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Digite o nome de qualquer candidato e receba um relatório completo:
                histórico eleitoral, financiadores, processos, gastos públicos
                e anúncios pagos em redes sociais.
              </p>
              <span className="inline-flex items-center gap-1 mt-4 text-emerald-400 text-sm font-medium group-hover:gap-2 transition-all">
                Pesquisar agora <span>→</span>
              </span>
            </div>
          </Link>

          <Link href="/match" className="group">
            <div className="h-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 hover:border-emerald-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-2xl mb-4">⚖️</div>
              <h2 className="text-xl font-bold text-white mb-2">Match de Valores</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Diga o que mais importa para você — saúde, educação, segurança,
                meio ambiente — e descubra qual candidato tem histórico mais
                alinhado com suas prioridades.
              </p>
              <span className="inline-flex items-center gap-1 mt-4 text-emerald-400 text-sm font-medium group-hover:gap-2 transition-all">
                Descobrir candidatos <span>→</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Fontes */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-5">
            Dados de fontes oficiais
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: '🗳️', nome: 'TSE', desc: 'Eleições & candidatos' },
              { icon: '💰', nome: 'Portal Transparência', desc: 'Gastos & contratos' },
              { icon: '⚖️', nome: 'TCU / CNJ', desc: 'Processos & sanções' },
              { icon: '🏛️', nome: 'Câmara / Senado', desc: 'Histórico parlamentar' },
            ].map(f => (
              <div key={f.nome} className="flex flex-col items-center text-center p-3 rounded-xl bg-white/5">
                <span className="text-2xl mb-1">{f.icon}</span>
                <span className="text-xs font-semibold text-white">{f.nome}</span>
                <span className="text-xs text-slate-500">{f.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-8">
          Esta aplicação não emite opiniões políticas. Todas as informações são provenientes de fontes oficiais do governo brasileiro.
        </p>
      </section>
    </div>
  )
}
