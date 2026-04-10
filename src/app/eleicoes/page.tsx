'use client'

import { useState, useRef, useEffect } from 'react'
import {
  ClipboardList,
  Users,
  FileText,
  Megaphone,
  Vote,
  Flag,
  Building2,
  Scale,
  Landmark,
  Building,
  MessageCircle,
  X,
  Send,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react'
import { Header } from '@/components/Header'
import { Markdown } from '@/components/Markdown'

// ─── Dados ────────────────────────────────────────────────────────────────────

const TIMELINE = [
  {
    data: '5 abr 2026',
    titulo: 'Prazo de filiação partidária',
    descricao: 'Último dia para se filiar a um partido e poder concorrer como candidato nas eleições de 2026.',
    Icone: ClipboardList,
    concluido: true,
  },
  {
    data: '20 jul – 5 ago',
    titulo: 'Convenções partidárias',
    descricao: 'Partidos realizam convenções para escolher e homologar oficialmente seus candidatos para cada cargo.',
    Icone: Users,
    concluido: false,
  },
  {
    data: 'até 15 ago',
    titulo: 'Registro de candidaturas',
    descricao: 'Candidatos submetem pedido de registro ao TSE (cargos federais) e TREs (cargos estaduais).',
    Icone: FileText,
    concluido: false,
  },
  {
    data: '16 ago 2026',
    titulo: 'Início da campanha',
    descricao: 'Propaganda eleitoral é autorizada. Candidatos podem pedir votos, fazer comícios e veicular anúncios.',
    Icone: Megaphone,
    concluido: false,
  },
  {
    data: '4 out 2026',
    titulo: '1º Turno',
    descricao: 'Votação simultânea para todos os cargos em todo o Brasil. Urnas abertas das 8h às 17h (horário de Brasília).',
    Icone: Vote,
    concluido: false,
    destaque: true,
  },
  {
    data: '25 out 2026',
    titulo: '2º Turno',
    descricao: 'Realizado quando nenhum candidato a Presidente ou Governador obtém mais de 50% dos votos válidos no 1º turno.',
    Icone: Flag,
    concluido: false,
    destaque: true,
  },
]

const CARGOS = [
  {
    cargo: 'Presidente da República',
    Icone: Flag,
    vagas: 1,
    sistema: 'Majoritário — maioria absoluta',
    mandato: '4 anos',
    idadeMinima: 35,
    abrangencia: 'Nacional',
    descricao:
      'Chefe do Poder Executivo Federal. Eleito em dois turnos caso nenhum candidato obtenha mais de 50% dos votos válidos no primeiro turno. Eleito junto com o Vice-Presidente.',
    detalhe: '1 chapa · Presidente + Vice-Presidente',
    cor: 'emerald',
    responsabilidades: [
      'Chefe de Estado e Chefe de Governo — representa o Brasil perante outros países e organismos internacionais',
      'Comanda as Forças Armadas (Exército, Marinha e Aeronáutica)',
      'Sanciona ou veta leis aprovadas pelo Congresso Nacional',
      'Nomeia ministros de Estado, magistrados do STF e embaixadores',
      'Elabora e encaminha ao Congresso o Plano Plurianual (PPA), a LDO e a LOA (orçamento federal)',
      'Celebra tratados e convenções internacionais, sujeitos à aprovação do Congresso',
      'Decreta estado de defesa, estado de sítio e intervenção federal em estados',
      'Concede indulto e comuta penas',
    ],
  },
  {
    cargo: 'Governadores de Estado',
    Icone: Landmark,
    vagas: 27,
    sistema: 'Majoritário — maioria absoluta',
    mandato: '4 anos',
    idadeMinima: 30,
    abrangencia: '26 estados + Distrito Federal',
    descricao:
      'Chefes do Poder Executivo Estadual e Distrital. Seguem a mesma regra de dois turnos do Presidente. Eleitos junto com os Vice-Governadores.',
    detalhe: '27 chapas · Governador + Vice-Governador',
    cor: 'blue',
    responsabilidades: [
      'Administra os recursos, bens e patrimônio do estado',
      'Elabora e executa o orçamento estadual (Lei Orçamentária Anual)',
      'Coordena a segurança pública estadual — supervisiona a Polícia Civil e a Polícia Militar',
      'Nomeia secretários de Estado e demais cargos do Poder Executivo estadual',
      'Sanciona ou veta leis aprovadas pela Assembleia Legislativa',
      'Representa o estado nas relações institucionais com outros estados e com a União',
      'Supervisiona a arrecadação dos tributos estaduais (ICMS, IPVA, ITCMD)',
      'Coordena políticas públicas estaduais de saúde, educação e infraestrutura',
    ],
  },
  {
    cargo: 'Senadores Federais',
    Icone: Scale,
    vagas: 54,
    sistema: 'Majoritário — maioria simples',
    mandato: '8 anos',
    idadeMinima: 35,
    abrangencia: '27 estados (2 por estado)',
    descricao:
      'Em 2026 são renovados 2/3 do Senado Federal — 54 das 81 cadeiras. Cada estado elege 2 senadores. Vence quem tiver mais votos, sem segundo turno.',
    detalhe: '81 vagas total · 54 em disputa em 2026',
    cor: 'purple',
    responsabilidades: [
      'Representam os estados no Congresso Nacional, garantindo equilíbrio federativo',
      'Votam projetos de lei de interesse nacional, incluindo emendas constitucionais',
      'Aprovam indicações do Presidente da República para o STF, STJ, AGU, TCU e embaixadores',
      'Autorizam operações de crédito e endividamento externo de estados e municípios',
      'Julgam o Presidente, Vice-Presidente e ministros de Estado por crimes de responsabilidade',
      'Aprovam tratados e acordos internacionais celebrados pelo Executivo',
      'Fiscalizam atos do Poder Executivo Federal e podem criar CPIs',
    ],
  },
  {
    cargo: 'Deputados Federais',
    Icone: Vote,
    vagas: 513,
    sistema: 'Proporcional — quociente eleitoral',
    mandato: '4 anos',
    idadeMinima: 21,
    abrangencia: 'Nacional (por estado)',
    descricao:
      'Compõem a Câmara dos Deputados. Eleitos pelo sistema proporcional: os votos nos candidatos e nos partidos determinam quantas cadeiras cada partido ocupa em cada estado.',
    detalhe: 'Distribuição proporcional à população estadual',
    cor: 'orange',
    responsabilidades: [
      'Representam o povo brasileiro na Câmara dos Deputados',
      'Propõem, debatem e votam projetos de lei de abrangência nacional',
      'Aprovam o orçamento da União (LOA) e suas alterações',
      'Fiscalizam o Poder Executivo Federal e a aplicação de recursos públicos',
      'Autorizam a abertura de processo de impeachment do Presidente e do Vice-Presidente',
      'Criam Comissões Parlamentares de Inquérito (CPIs) para investigar irregularidades',
      'Aprovam emendas à Constituição Federal (com maioria qualificada)',
    ],
  },
  {
    cargo: 'Deputados Estaduais',
    Icone: Building2,
    vagas: 1058,
    sistema: 'Proporcional — quociente eleitoral',
    mandato: '4 anos',
    idadeMinima: 21,
    abrangencia: 'Assembleias Legislativas estaduais',
    descricao:
      'Compõem as 26 Assembleias Legislativas. O número de vagas varia por estado: mínimo de 24 (estados menores) até 94 vagas em São Paulo — sempre o triplo da bancada federal.',
    detalhe: 'Número de vagas proporcional ao tamanho da bancada federal',
    cor: 'cyan',
    responsabilidades: [
      'Representam o povo nas Assembleias Legislativas de cada estado',
      'Criam e aprovam leis de interesse exclusivo do estado',
      'Aprovam o orçamento estadual (LOA) e o Plano Plurianual do estado',
      'Fiscalizam o Poder Executivo Estadual e as contas do governador',
      'Podem criar CPIs estaduais para investigar irregularidades no âmbito do estado',
      'Deliberam sobre criação, fusão e desmembramento de municípios',
      'Aprovam emendas à Constituição Estadual',
    ],
  },
  {
    cargo: 'Deputados Distritais',
    Icone: Building,
    vagas: 24,
    sistema: 'Proporcional — quociente eleitoral',
    mandato: '4 anos',
    idadeMinima: 21,
    abrangencia: 'Câmara Legislativa do DF',
    descricao:
      'Compõem a Câmara Legislativa do Distrito Federal, que acumula as funções de Assembleia Legislativa e Câmara Municipal — já que o DF não tem municípios próprios.',
    detalhe: 'Exclusivo para o Distrito Federal',
    cor: 'pink',
    responsabilidades: [
      'Exercem simultaneamente as funções de deputados estaduais e vereadores no âmbito do DF',
      'Criam e aprovam leis distritais de interesse local e regional',
      'Aprovam o orçamento do Distrito Federal e o Plano Plurianual distrital',
      'Fiscalizam o Poder Executivo Distrital e as contas do Governador do DF',
      'Deliberam sobre políticas públicas distritais de mobilidade, saúde, educação e segurança',
      'Podem criar CPIs distritais para investigar irregularidades no DF',
    ],
  },
]

// ─── Estilos por cor ───────────────────────────────────────────────────────────

const COR_ICONE: Record<string, string> = {
  emerald: 'bg-emerald-500/20 text-emerald-400',
  blue:    'bg-blue-500/20 text-blue-400',
  purple:  'bg-purple-500/20 text-purple-400',
  orange:  'bg-orange-500/20 text-orange-400',
  cyan:    'bg-cyan-500/20 text-cyan-400',
  pink:    'bg-pink-500/20 text-pink-400',
}

const COR_BADGE: Record<string, string> = {
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  blue:    'bg-blue-500/15 text-blue-300 border-blue-500/30',
  purple:  'bg-purple-500/15 text-purple-300 border-purple-500/30',
  orange:  'bg-orange-500/15 text-orange-300 border-orange-500/30',
  cyan:    'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  pink:    'bg-pink-500/15 text-pink-300 border-pink-500/30',
}

const COR_BORDER: Record<string, string> = {
  emerald: 'hover:border-emerald-500/40',
  blue:    'hover:border-blue-500/40',
  purple:  'hover:border-purple-500/40',
  orange:  'hover:border-orange-500/40',
  cyan:    'hover:border-cyan-500/40',
  pink:    'hover:border-pink-500/40',
}

// Precisa ser explícito para o Tailwind não purgar as classes
const COR_BULLET: Record<string, string> = {
  emerald: 'bg-emerald-400',
  blue:    'bg-blue-400',
  purple:  'bg-purple-400',
  orange:  'bg-orange-400',
  cyan:    'bg-cyan-400',
  pink:    'bg-pink-400',
}

// ─── Chat Flutuante ───────────────────────────────────────────────────────────

type Mensagem = { role: 'user' | 'assistant'; content: string; erro?: boolean }

function ChatFlutuante() {
  const [aberto, setAberto] = useState(false)
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      role: 'assistant',
      content:
        'Olá! Posso te ajudar com dúvidas sobre as eleições de 2026, as responsabilidades de cada cargo eletivo (Presidente, Governadores, Senadores, Deputados) ou sobre as funcionalidades da plataforma Vote Transparente. Por onde quer começar?',
    },
  ])
  const [pergunta, setPergunta] = useState('')
  const [carregando, setCarregando] = useState(false)
  const fimRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (aberto) fimRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens, carregando, aberto])

  async function enviar() {
    const texto = pergunta.trim()
    if (!texto || carregando) return

    setMensagens(m => [...m, { role: 'user', content: texto }])
    setPergunta('')
    setCarregando(true)

    try {
      const res = await fetch('/api/eleicoes-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pergunta: texto }),
      })
      const data = await res.json()
      setMensagens(m => [
        ...m,
        {
          role: 'assistant',
          content: data.resposta ?? data.error ?? 'Não consegui processar sua pergunta.',
          erro: !data.resposta,
        },
      ])
    } catch {
      setMensagens(m => [
        ...m,
        { role: 'assistant', content: 'Erro de conexão. Tente novamente.' },
      ])
    } finally {
      setCarregando(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviar()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Painel do chat */}
      {aberto && (
        <div className="w-[360px] rounded-2xl bg-slate-900 border border-white/15 shadow-2xl shadow-black/60 overflow-hidden flex flex-col">
          {/* Cabeçalho */}
          <div className="px-4 py-3 bg-blue-600/20 border-b border-white/10 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center flex-shrink-0">
              <Vote size={16} className="text-blue-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white leading-tight">Dúvidas sobre as Eleições</p>
              <p className="text-xs text-blue-300/70">Processo eleitoral 2026</p>
            </div>
            <span className="flex items-center gap-1 text-xs text-emerald-400 mr-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              online
            </span>
            <button
              onClick={() => setAberto(false)}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Fechar chat"
            >
              <X size={16} />
            </button>
          </div>

          {/* Mensagens */}
          <div className="h-96 overflow-y-auto px-4 py-3 flex flex-col gap-3">
            {mensagens.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : m.erro
                      ? 'bg-red-500/10 border border-red-500/30 rounded-bl-sm text-red-300'
                      : 'bg-white/8 rounded-bl-sm border border-white/10'
                  }`}
                >
                  {m.role === 'user'
                    ? m.content
                    : <Markdown content={m.content} />
                  }
                </div>
              </div>
            ))}
            {carregando && (
              <div className="flex justify-start">
                <div className="bg-white/8 border border-white/10 rounded-2xl rounded-bl-sm px-3.5 py-2.5">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={fimRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={pergunta}
              onChange={e => setPergunta(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ex: O que faz um deputado federal?"
              disabled={carregando}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500/50 transition-all disabled:opacity-50"
            />
            <button
              onClick={enviar}
              disabled={!pergunta.trim() || carregando}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all"
              aria-label="Enviar"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Botão flutuante */}
      <button
        onClick={() => setAberto(v => !v)}
        className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/40 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        aria-label="Abrir chat de eleições"
      >
        {aberto ? <X size={22} className="text-white" /> : <MessageCircle size={22} className="text-white" />}
      </button>
    </div>
  )
}

// ─── Página principal ──────────────────────────────────────────────────────────

export default function EleicoesPage() {
  const totalVagas = CARGOS.reduce((acc, c) => acc + c.vagas, 0)
  const [expandido, setExpandido] = useState<string | null>(null)

  function toggleExpandido(cargo: string) {
    setExpandido(v => (v === cargo ? null : cargo))
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />

      <Header />

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-16 pb-10 select-none">
        <span className="inline-block px-3 py-1 mb-5 text-xs font-semibold tracking-widest uppercase rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
          Eleições Gerais
        </span>
        <h1 className="text-5xl font-bold mb-4 leading-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
          Eleições 2026
        </h1>
        <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-2xl">
          Conheça os cargos em disputa, o calendário eleitoral e o funcionamento
          do processo democrático brasileiro.
        </p>

        {/* Stats rápidas */}
        <div className="flex flex-wrap justify-center gap-6">
          {[
            { label: 'Vagas em disputa', valor: totalVagas.toLocaleString('pt-BR') },
            { label: 'Cargos diferentes', valor: '6' },
            { label: '1º Turno', valor: '4 out' },
            { label: '2º Turno', valor: '25 out' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-white">{s.valor}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pb-20 w-full space-y-16">

        {/* ── Timeline ──────────────────────────────────────────────────────── */}
        <section>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">Calendário Eleitoral</h2>
            <p className="text-slate-400 text-sm">As datas que marcam o processo eleitoral de 2026</p>
          </div>

          {/* Desktop: linha horizontal */}
          <div className="hidden md:block relative">
            {/* Linha conectora */}
            <div className="absolute top-7 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="grid grid-cols-6 gap-2">
              {TIMELINE.map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-3">
                  {/* Ícone / bolinha */}
                  <div
                    className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all ${
                      item.concluido
                        ? 'bg-slate-700 border-slate-600 opacity-50'
                        : item.destaque
                        ? 'bg-blue-500/30 border-blue-400 shadow-lg shadow-blue-500/20'
                        : 'bg-slate-800 border-slate-600'
                    }`}
                  >
                    {item.concluido
                      ? <CheckCircle2 size={20} className="text-slate-400" />
                      : <item.Icone size={20} className={item.destaque ? 'text-blue-400' : 'text-slate-400'} />
                    }
                  </div>

                  {/* Data */}
                  <span
                    className={`text-xs font-semibold ${
                      item.concluido ? 'text-slate-600' : item.destaque ? 'text-blue-400' : 'text-slate-400'
                    }`}
                  >
                    {item.data}
                  </span>

                  {/* Título */}
                  <p
                    className={`text-xs font-medium leading-snug ${
                      item.concluido ? 'text-slate-600' : 'text-white'
                    }`}
                  >
                    {item.titulo}
                  </p>

                  {/* Descrição (oculta para não poluir) */}
                  <p className={`text-xs leading-relaxed hidden lg:block ${item.concluido ? 'text-slate-700' : 'text-slate-500'}`}>
                    {item.descricao}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: linha vertical */}
          <div className="md:hidden flex flex-col gap-0">
            {TIMELINE.map((item, i) => (
              <div key={i} className="flex gap-4">
                {/* Coluna da linha */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                      item.concluido
                        ? 'bg-slate-700 border-slate-600 opacity-50'
                        : item.destaque
                        ? 'bg-blue-500/30 border-blue-400'
                        : 'bg-slate-800 border-slate-600'
                    }`}
                  >
                    {item.concluido
                      ? <CheckCircle2 size={16} className="text-slate-400" />
                      : <item.Icone size={16} className={item.destaque ? 'text-blue-400' : 'text-slate-400'} />
                    }
                  </div>
                  {i < TIMELINE.length - 1 && (
                    <div className="w-px flex-1 bg-white/10 my-1" />
                  )}
                </div>

                {/* Conteúdo */}
                <div className="pb-6">
                  <span
                    className={`text-xs font-semibold ${
                      item.concluido ? 'text-slate-600' : item.destaque ? 'text-blue-400' : 'text-slate-400'
                    }`}
                  >
                    {item.data}
                  </span>
                  <p className={`font-medium mt-0.5 ${item.concluido ? 'text-slate-600' : 'text-white'}`}>
                    {item.titulo}
                  </p>
                  <p className={`text-sm mt-1 leading-relaxed ${item.concluido ? 'text-slate-700' : 'text-slate-400'}`}>
                    {item.descricao}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Cargos em disputa ─────────────────────────────────────────────── */}
        <section>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">Cargos em Disputa</h2>
            <p className="text-slate-400 text-sm">
              {totalVagas.toLocaleString('pt-BR')} vagas distribuídas em 6 categorias de cargo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CARGOS.map(c => {
              const aberto = expandido === c.cargo
              return (
                <div
                  key={c.cargo}
                  className={`rounded-2xl bg-white/5 border border-white/10 transition-all ${COR_BORDER[c.cor]} hover:bg-white/7`}
                >
                  {/* Cabeçalho + conteúdo fixo */}
                  <div className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${COR_ICONE[c.cor]}`}>
                        <c.Icone size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-base leading-tight">{c.cargo}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{c.abrangencia}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex-shrink-0 ${COR_BADGE[c.cor]}`}>
                        {c.vagas.toLocaleString('pt-BR')} {c.vagas === 1 ? 'vaga' : 'vagas'}
                      </span>
                    </div>

                    <p className="text-slate-400 text-sm leading-relaxed mb-4">{c.descricao}</p>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Sistema', valor: c.sistema.split('—')[0].trim() },
                        { label: 'Mandato', valor: c.mandato },
                        { label: 'Idade mín.', valor: `${c.idadeMinima} anos` },
                      ].map(d => (
                        <div key={d.label} className="rounded-lg bg-white/5 px-2.5 py-2 text-center">
                          <p className="text-xs text-slate-500 mb-0.5">{d.label}</p>
                          <p className="text-xs font-semibold text-white leading-tight">{d.valor}</p>
                        </div>
                      ))}
                    </div>

                    <p className="mt-3 text-xs text-slate-600 border-t border-white/5 pt-3">
                      {c.detalhe}
                    </p>
                  </div>

                  {/* Botão acordeão */}
                  <button
                    onClick={() => toggleExpandido(c.cargo)}
                    className={`w-full flex items-center justify-between px-5 py-3 text-xs font-medium border-t border-white/8 transition-colors ${
                      aberto ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <span>{aberto ? 'Ocultar responsabilidades' : 'Ver responsabilidades e atribuições'}</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${aberto ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Painel de responsabilidades */}
                  {aberto && (
                    <div className="px-5 pb-5 border-t border-white/8">
                      <ul className="mt-4 flex flex-col gap-2.5">
                        {c.responsabilidades.map((r, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300 leading-relaxed">
                            <span className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${COR_BULLET[c.cor]}`} />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Nota de rodapé ────────────────────────────────────────────────── */}
        <p className="text-center text-xs text-slate-600">
          Informações baseadas na legislação eleitoral brasileira e resoluções do TSE.
          Esta página não emite opiniões políticas nem recomenda candidatos.
        </p>
      </div>

      {/* Chat flutuante */}
      <ChatFlutuante />
    </div>
  )
}
