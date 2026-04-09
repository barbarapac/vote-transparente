import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-700 text-white py-4 px-6 shadow">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold">🗳️ Voto Transparente</span>
          <nav className="flex gap-4 text-sm">
            <Link href="/candidato" className="hover:underline">Raio-X</Link>
            <Link href="/match" className="hover:underline">Match de Valores</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-14">
          <div className="text-6xl mb-4">🏛️</div>
          <h1 className="text-3xl font-bold text-green-900 mb-3">Voto Transparente</h1>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            Pesquise candidatos e tome uma decisão de voto informada,
            com base em dados oficiais do governo brasileiro.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
          <Link href="/candidato" className="group">
            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-green-400 hover:shadow-md transition-all h-full">
              <div className="text-4xl mb-3">🔍</div>
              <h2 className="text-xl font-bold text-green-900 mb-2">Raio-X do Candidato</h2>
              <p className="text-gray-500 text-sm">
                Digite o nome de qualquer candidato e veja um relatório completo:
                histórico eleitoral, financiadores de campanha, processos,
                gastos públicos e anúncios pagos.
              </p>
              <span className="inline-block mt-4 text-green-700 text-sm font-medium group-hover:underline">
                Pesquisar candidato →
              </span>
            </div>
          </Link>

          <Link href="/match" className="group">
            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-green-400 hover:shadow-md transition-all h-full">
              <div className="text-4xl mb-3">⚖️</div>
              <h2 className="text-xl font-bold text-green-900 mb-2">Match de Valores</h2>
              <p className="text-gray-500 text-sm">
                Diga o que é importante para você — saúde, educação, segurança,
                meio ambiente — e descubra qual candidato melhor representa
                suas prioridades com base em dados reais.
              </p>
              <span className="inline-block mt-4 text-green-700 text-sm font-medium group-hover:underline">
                Encontrar candidatos →
              </span>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Fontes de dados oficiais
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: '🗳️', nome: 'TSE', desc: 'Dados eleitorais' },
              { icon: '💰', nome: 'Portal da Transparência', desc: 'Gastos e contratos' },
              { icon: '⚖️', nome: 'TCU / CNJ', desc: 'Processos e sanções' },
              { icon: '🏛️', nome: 'Câmara / Senado', desc: 'Histórico parlamentar' },
            ].map(f => (
              <div key={f.nome} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-1">{f.icon}</div>
                <div className="text-xs font-semibold text-gray-700">{f.nome}</div>
                <div className="text-xs text-gray-400">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Esta aplicação não emite opiniões políticas. Todas as informações
          apresentadas são provenientes de fontes oficiais do governo brasileiro.
        </p>
      </main>
    </div>
  )
}
