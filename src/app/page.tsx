import Link from 'next/link'
import { Vote, Search, Landmark, Scale, DollarSign, ArrowRight, ExternalLink } from 'lucide-react'
import { Header } from '@/components/Header'

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <Header />

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-16 select-none">
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
        </div>
      </section>

      {/* Cards de funcionalidades */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 pb-16 w-full select-none">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">

          <Link href="/eleicoes" className="group">
            <div className="h-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 hover:border-blue-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                <Vote size={22} className="text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Eleições 2026</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Conheça todos os cargos em disputa, o calendário eleitoral e
                tire dúvidas sobre o processo democrático brasileiro.
              </p>
              <span className="inline-flex items-center gap-1 mt-4 text-blue-400 text-sm font-medium group-hover:gap-2 transition-all">
                Explorar eleições <ArrowRight size={14} />
              </span>
            </div>
          </Link>

          <Link href="/candidato" className="group">
            <div className="h-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 hover:border-emerald-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                <Search size={22} className="text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Raio-X do Candidato</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Digite o nome de qualquer candidato e receba um relatório completo:
                histórico eleitoral, financiadores, processos, gastos públicos
                e anúncios pagos em redes sociais.
              </p>
              <span className="inline-flex items-center gap-1 mt-4 text-emerald-400 text-sm font-medium group-hover:gap-2 transition-all">
                Pesquisar agora <ArrowRight size={14} />
              </span>
            </div>
          </Link>

          <Link href="/candidatos" className="group">
            <div className="h-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 hover:border-emerald-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                <Landmark size={22} className="text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Campo Eleitoral</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Veja todos os candidatos a um cargo com um resumo rápido de cada um —
                envolvimento em escândalos, projetos e histórico eleitoral.
              </p>
              <span className="inline-flex items-center gap-1 mt-4 text-emerald-400 text-sm font-medium group-hover:gap-2 transition-all">
                Ver candidatos <ArrowRight size={14} />
              </span>
            </div>
          </Link>

          <Link href="/match" className="group">
            <div className="h-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 hover:border-emerald-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                <Scale size={22} className="text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Match de Valores</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Diga o que mais importa para você — saúde, educação, segurança,
                meio ambiente — e descubra qual candidato tem histórico mais
                alinhado com suas prioridades.
              </p>
              <span className="inline-flex items-center gap-1 mt-4 text-emerald-400 text-sm font-medium group-hover:gap-2 transition-all">
                Descobrir candidatos <ArrowRight size={14} />
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
              { Icon: Vote,       nome: 'TSE',                  desc: 'Eleições & candidatos',   href: 'https://www.tse.jus.br' },
              { Icon: DollarSign, nome: 'Portal Transparência', desc: 'Gastos & contratos',       href: 'https://portaldatransparencia.gov.br' },
              { Icon: Scale,      nome: 'TCU / CNJ',            desc: 'Processos & sanções',      href: 'https://www.tcu.gov.br' },
              { Icon: Landmark,   nome: 'Câmara / Senado',      desc: 'Histórico parlamentar',    href: 'https://www.camara.leg.br' },
            ].map(f => (
              <a
                key={f.nome}
                href={f.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center text-center p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all"
              >
                <f.Icon size={22} className="text-slate-400 group-hover:text-white mb-2 transition-colors" />
                <span className="text-xs font-semibold text-white flex items-center gap-1">
                  {f.nome}
                  <ExternalLink size={10} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                </span>
                <span className="text-xs text-slate-500">{f.desc}</span>
              </a>
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
