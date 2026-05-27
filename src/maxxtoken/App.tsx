import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from 'react'
import { PolarEmbedCheckout } from '@polar-sh/checkout/embed'
import {
  ArrowRight,
  ArrowUpRight,
  Box,
  Code2,
  FileText,
  Flame,
  Gauge,
  MessageCircle,
  RefreshCw,
  Search,
  Settings,
  Share2,
  Sparkles,
  Star,
  Target,
  TerminalSquare,
  TrendingUp,
  Wifi,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import './App.css'
import { Freebies } from './Freebies'
import { POLAR_CHECKOUT_URL, PolarDownloadButton } from './PolarDownloadButton'

type Provider = {
  id: string
  name: string
  plan: string
  monthly: number
  baseUsedPct: number
  drain: number
  countdown: string
  accent: string
  icon: LucideIcon
  windows: {
    label: string
    kind: string
    usedPct: number
    reset: string
  }[]
}

const providers: Provider[] = [
  {
    id: 'claude',
    name: 'Claude',
    plan: 'Max 20x',
    monthly: 200,
    baseUsedPct: 24,
    drain: 0.12,
    countdown: '08h 57m 36s',
    accent: '#ff7d4d',
    icon: Sparkles,
    windows: [
      { label: 'Session', kind: '5-hour window', usedPct: 11, reset: '03h 17m 35s' },
      { label: 'Weekly', kind: '7-day window', usedPct: 24, reset: '08h 57m 36s' },
      { label: 'Sonnet', kind: '7-day window', usedPct: 0, reset: 'resets —' },
    ],
  },
  {
    id: 'codex',
    name: 'Codex',
    plan: 'Pro Plan',
    monthly: 30,
    baseUsedPct: 1,
    drain: 0.08,
    countdown: '02h 56m 13s',
    accent: '#e6e6e6',
    icon: Box,
    windows: [
      { label: 'Session', kind: '5-hour window', usedPct: 1, reset: '02h 56m 13s' },
      { label: 'Weekly', kind: '7-day window', usedPct: 1, reset: '2d 05h 37m' },
    ],
  },
  {
    id: 'kimi',
    name: 'Kimi',
    plan: 'Ultra',
    monthly: 200,
    baseUsedPct: 3,
    drain: 0.1,
    countdown: '1d 09h 37m',
    accent: '#cfd2d6',
    icon: Box,
    windows: [
      { label: 'Session', kind: '5-hour window', usedPct: 2, reset: '01h 14m 08s' },
      { label: 'Weekly', kind: '7-day window', usedPct: 3, reset: '1d 09h 37m' },
    ],
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    plan: 'Plus Plan',
    monthly: 20,
    baseUsedPct: 0,
    drain: 0.05,
    countdown: '2d 05h 37m',
    accent: '#19c37d',
    icon: MessageCircle,
    windows: [
      { label: 'Session', kind: '5-hour window', usedPct: 0, reset: '02h 56m 13s' },
      { label: 'Weekly', kind: '7-day window', usedPct: 0, reset: '2d 05h 37m' },
    ],
  },
  {
    id: 'gemini',
    name: 'Gemini',
    plan: 'Advanced',
    monthly: 84,
    baseUsedPct: 36,
    drain: 0.15,
    countdown: '16d left',
    accent: '#4f8cff',
    icon: Sparkles,
    windows: [
      { label: 'Cycle', kind: 'month window', usedPct: 36, reset: '16d 02h' },
    ],
  },
]

type Idea = {
  icon: LucideIcon
  title: string
  meta: string
  value: string
  status: string
}

const ideas: Idea[] = [
  {
    icon: FileText,
    title: 'Turn a messy note into a launch post',
    meta: 'Claude · 20-30 min',
    value: '$3.60',
    status: 'streaming',
  },
  {
    icon: TerminalSquare,
    title: 'Ask Codex to write 3 tests before reset',
    meta: 'Codex · 15-25 min',
    value: '$2.80',
    status: 'queued',
  },
  {
    icon: Target,
    title: 'Scope one half-baked app idea into a build plan',
    meta: 'Kimi · 25 min',
    value: '$4.20',
    status: 'next',
  },
  {
    icon: MessageCircle,
    title: 'Brainstorm 5 product experiments you can run this week',
    meta: 'ChatGPT · 15 min',
    value: '$2.10',
    status: 'ready',
  },
]

const stackProviders = [
  'Claude',
  'ChatGPT',
  'OpenAI API',
  'Azure OpenAI',
  'Cursor',
  'Copilot',
  'Windsurf',
  'Kiro',
  'OpenCode',
  'OpenCode Go',
  'Alibaba',
  'Alibaba Token Plan',
  'Augment',
  'JetBrains AI',
  'Warp',
  'ElevenLabs',
  'Kilo',
  'Kimi',
  'Moonshot / Kimi API',
  'Kimi K2',
  'Doubao',
  'Grok',
  'Groq',
  'Gemini',
  'OpenRouter',
  'Perplexity',
  'Mistral',
  'Codebuff',
  'Command Code',
  'Crof',
  'Venice',
  'DeepSeek',
  'Deepgram',
  'StepFun',
  'LLM Proxy',
  'Ollama',
  'Abacus AI',
  'Amp',
  'Droid / Factory',
  'Antigravity',
  'MiniMax',
  'Manus',
  'Vertex AI',
  'Synthetic',
  'Xiaomi MiMo',
  'AWS Bedrock',
  'z.ai',
  'T3 Chat',
] as const

const stackAccents = [
  '#ff7d4d',
  '#19c37d',
  '#4f8cff',
  '#4cc3c9',
  '#b6f24a',
  '#f0a030',
  '#e6e6e6',
  '#cfd2d6',
  '#a78bfa',
  '#f472b6',
]

function StackMarquee() {
  const track = [...stackProviders, ...stackProviders]

  return (
    <div className="stack-marquee" aria-label="Supported AI providers">
      <div className="stack-marquee-fade stack-marquee-fade-left" aria-hidden="true" />
      <div className="stack-marquee-fade stack-marquee-fade-right" aria-hidden="true" />
      <div className="stack-marquee-track">
        {track.map((name, index) => (
          <span
            className="stack-chip"
            key={`${name}-${index}`}
            style={{ '--accent': stackAccents[index % stackAccents.length] } as CSSProperties}
          >
            <span className="stack-chip-dot" aria-hidden="true" />
            {name}
          </span>
        ))}
      </div>
    </div>
  )
}

function money(value: number) {
  return `$${Math.round(value).toLocaleString('en-US')}`
}

function moneyExact(value: number) {
  return `$${value.toFixed(2)}`
}

function clampPct(value: number) {
  return Math.max(0, Math.min(98, value))
}

function App() {
  const [activeProvider, setActiveProvider] = useState('Claude')
  const [spendTick, setSpendTick] = useState(0)
  const [demoOpen, setDemoOpen] = useState(true)
  const [demoView, setDemoView] = useState<'usage' | 'stream'>('usage')
  const [now, setNow] = useState(() => new Date())
  const [demoRight, setDemoRight] = useState<number | null>(null)
  const [showThankYou, setShowThankYou] = useState(false)
  const [pageView, setPageView] = useState<'landing' | 'freebies'>(() =>
    typeof window !== 'undefined' && window.location.hash === '#freebies' ? 'freebies' : 'landing',
  )

  const heroRef = useRef<HTMLElement>(null)
  const pillRef = useRef<HTMLButtonElement>(null)

  // Every download button routes through Polar checkout — the .dmg is never
  // served directly. Polar delivers the notarized build after checkout. When
  // the purchase confirms, show the thank-you modal so buyers know to go check
  // their email for the download link instead of staring at the landing page.
  const startDownload = useCallback(async (event: MouseEvent) => {
    event.preventDefault()
    try {
      const checkout = await PolarEmbedCheckout.create(POLAR_CHECKOUT_URL, { theme: 'dark' })
      checkout.addEventListener('success', (successEvent) => {
        // Stop Polar's built-in redirect (fires when the checkout link has a
        // success URL set) so the buyer lands on our modal instead of being
        // bounced away. Then close the Polar iframe ourselves — it sits at
        // max z-index, so our modal would otherwise be hidden behind it.
        successEvent.preventDefault()
        checkout.close()
        setShowThankYou(true)
      })
    } catch {
      window.open(POLAR_CHECKOUT_URL, '_blank', 'noopener')
    }
  }, [])

  const goLanding = useCallback((hash?: string) => {
    setPageView('landing')
    if (hash) {
      window.history.replaceState(null, '', hash)
      window.requestAnimationFrame(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
      })
      return
    }
    window.history.replaceState(null, '', '#top')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const goFreebies = useCallback(() => {
    setPageView('freebies')
    window.history.replaceState(null, '', '#freebies')
    window.scrollTo({ top: 0 })
  }, [])

  useEffect(() => {
    const syncView = () => {
      setPageView(window.location.hash === '#freebies' ? 'freebies' : 'landing')
    }
    window.addEventListener('hashchange', syncView)
    return () => window.removeEventListener('hashchange', syncView)
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => setSpendTick((tick) => tick + 1), 1200)
    return () => window.clearInterval(timer)
  }, [])

  // Live menu-bar clock.
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 10000)
    return () => window.clearInterval(timer)
  }, [])

  // Close the thank-you modal on Escape.
  useEffect(() => {
    if (!showThankYou) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowThankYou(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showThankYou])

  // Anchor the demo popover so its right edge lines up under the tray pill.
  // Re-runs on resize and whenever the clock changes (which shifts the pill).
  useLayoutEffect(() => {
    const align = () => {
      const hero = heroRef.current
      const pill = pillRef.current
      if (!hero || !pill) return
      const offset = hero.getBoundingClientRect().right - pill.getBoundingClientRect().right
      setDemoRight(Math.max(0, offset))
    }
    align()
    const raf = window.requestAnimationFrame(align)
    const settle = window.setTimeout(align, 250)
    window.addEventListener('resize', align)
    return () => {
      window.cancelAnimationFrame(raf)
      window.clearTimeout(settle)
      window.removeEventListener('resize', align)
    }
  }, [now])

  const clockLabel = `${now.toLocaleDateString('en-US', { weekday: 'short' })} ${now
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    .replace(/\s/g, ' ')}`

  const spendStep = spendTick % 18
  const animatedProviders = useMemo(
    () =>
      providers.map((provider, index) => {
        const usedPct = clampPct(provider.baseUsedPct + spendStep * provider.drain)
        const spent = provider.monthly * (usedPct / 100)
        const left = provider.monthly - spent

        return {
          ...provider,
          active: provider.name === activeProvider,
          usedPct,
          leftPct: Math.round(100 - usedPct),
          spent,
          left,
          windows: provider.windows.map((window, windowIndex) => {
            const windowUsed = clampPct(
              window.usedPct + spendStep * provider.drain * (windowIndex === 0 ? 1.4 : 1),
            )

            return {
              ...window,
              usedPct: windowUsed,
              leftPct: Math.round(100 - windowUsed),
            }
          }),
          streamDelay: `${index * 140}ms`,
        }
      }),
    [activeProvider, spendStep],
  )

  const totals = useMemo(() => {
    const monthly = animatedProviders.reduce((sum, provider) => sum + provider.monthly, 0)
    const spent = animatedProviders.reduce((sum, provider) => sum + provider.spent, 0)
    const left = monthly - spent

    return {
      monthly,
      spent,
      left,
      leftPct: Math.round((left / monthly) * 100),
      spentPct: Math.round((spent / monthly) * 100),
    }
  }, [animatedProviders])

  const fullestProvider = animatedProviders.reduce((fullest, provider) =>
    provider.leftPct > fullest.leftPct ? provider : fullest,
  )

  return (
    <div className="page" id="top">
      <nav className="os-menubar" aria-label="Main">
        <div className="osm-inner">
          <div className="osm-left">
            <a
              className="osm-brand"
              href="#top"
              onClick={(event) => {
                event.preventDefault()
                goLanding()
              }}
            >
              <img src="/maxxtoken/icon-1.png" alt="" />
              <span>MaxxToken</span>
            </a>
            <a
              className="osm-menu"
              href="#product"
              onClick={(event) => {
                event.preventDefault()
                goLanding('#product')
              }}
            >
              Demo
            </a>
            <a
              className="osm-menu"
              href="#nudges"
              onClick={(event) => {
                event.preventDefault()
                goLanding('#nudges')
              }}
            >
              Missions
            </a>
            <a
              className="osm-menu"
              href="#what-is-tokenmaxxing"
              onClick={(event) => {
                event.preventDefault()
                goLanding('#what-is-tokenmaxxing')
              }}
            >
              Tokenmaxxing
            </a>
            <button
              type="button"
              className={`osm-menu osm-menu-btn ${pageView === 'freebies' ? 'is-active' : ''}`}
              onClick={goFreebies}
            >
              Freebies
            </button>
            <a className="osm-menu" href="https://x.com/rachelnocode">
              Contact
            </a>
          </div>
          <div className="osm-right">
            <Wifi className="osm-glyph" size={15} aria-hidden="true" />
            <Search className="osm-glyph" size={15} aria-hidden="true" />
            <span className="osm-clock">{clockLabel}</span>
            <PolarDownloadButton onClick={startDownload} className="osm-download" showIcons={false} />
            <button
              type="button"
              ref={pillRef}
              className={`osm-tray maxx ${demoOpen ? 'is-open' : ''}`}
              onClick={() => setDemoOpen((open) => !open)}
              aria-expanded={demoOpen}
            >
              ⚡ {money(totals.left)} left
            </button>
          </div>
        </div>
      </nav>

      {pageView === 'freebies' ? (
        <Freebies onDownload={startDownload} />
      ) : (
        <>
      <section className="hero" ref={heroRef}>
        <div className="hero-copy">
          <span className="badge">
            <TrendingUp size={14} aria-hidden="true" />
            tokenmaxxing menu bar
          </span>
          <h1>
            You paid for the tokens. <span className="accent">Go spend them.</span>
          </h1>
          <p>
            MaxxToken shows the dollars you have left and turns them into work before the timer runs out.
          </p>
          <div className="hero-actions">
            <PolarDownloadButton onClick={startDownload} className="btn-primary lg" iconSize={16} />
            <a className="btn-outline lg" href="#nudges">
              See how it works
            </a>
          </div>
          <div className="hero-features">
            <div className="hero-feature">
              <Zap size={16} aria-hidden="true" />
              <div>
                <strong>Pay what you want</strong>
                <span>One-time, name your price</span>
              </div>
            </div>
            <div className="hero-feature">
              <Gauge size={16} aria-hidden="true" />
              <div>
                <strong>Private by design</strong>
                <span>We never see your prompts</span>
              </div>
            </div>
            <div className="hero-feature">
              <Code2 size={16} aria-hidden="true" />
              <div>
                <strong>Built for people who ship</strong>
                <span>Missions that hit</span>
              </div>
            </div>
          </div>
        </div>

        <div
          className="hero-demo"
          id="product"
          style={demoRight != null ? ({ right: `${demoRight}px` } as CSSProperties) : undefined}
        >
          <div className="dot-grid" aria-hidden="true" />
          {demoOpen ? (
            <div className="demo-pop-wrap">
              <span className="demo-caret" aria-hidden="true" />
              {demoView === 'usage' ? (
                <div className="popover-demo usage-popover">
                  <div className="pd-dot-grid" aria-hidden="true" />
                  <div className="pd-head">
                    <div className="pd-brand">
                      <img className="pd-logo" src="/maxxtoken/icon-1.png" alt="" />
                      <span>
                        Maxx<strong>Token</strong>
                      </span>
                    </div>
                    <span className="pd-cycle">May cycle · 16d left</span>
                    <div className="pd-actions">
                      <button
                        className="pd-icon-btn live"
                        type="button"
                        aria-label="Open Idea Stream"
                        onClick={() => setDemoView('stream')}
                      >
                        ◆
                      </button>
                      <button className="pd-icon-btn" type="button" aria-label="Settings">
                        <Settings size={14} />
                      </button>
                    </div>
                  </div>

                  <section className="pd-receipt">
                    <div className="pd-stats">
                      <div className="pd-stat">
                        <div className="pd-num green">{money(totals.spent)}</div>
                        <div className="pd-label">spent value</div>
                      </div>
                      <div className="pd-divider" />
                      <div className="pd-stat">
                        <div className="pd-num amber">{money(totals.left)}</div>
                        <div className="pd-label">left to maxx</div>
                      </div>
                      <div className="pd-divider" />
                      <div className="pd-stat">
                        <div className="pd-num mono">38d 20h</div>
                        <div className="pd-label">used</div>
                      </div>
                    </div>
                    <div className="pd-meter">
                      <span className="pd-meter-fill" style={{ width: `${totals.spentPct}%` }} />
                    </div>
                    <div className="pd-foot">
                      <span className="pd-stars" aria-hidden="true">
                        <Star size={17} className="filled" />
                        <Star size={17} />
                        <Star size={17} />
                        <Star size={17} />
                        <Star size={17} />
                      </span>
                      <span className="pd-verdict">Donating to Big AI. Fix it.</span>
                      <span className="pd-spend-pulse">
                        <Flame size={12} aria-hidden="true" />
                        spending
                      </span>
                    </div>
                  </section>

                  <div className="pd-list">
                    {animatedProviders.map((provider) => {
                      const Icon = provider.icon

                      return (
                        <button
                          key={provider.id}
                          type="button"
                          className={`pd-prov ${provider.active ? 'active' : ''}`}
                          onClick={() => setActiveProvider(provider.name)}
                          style={
                            {
                              '--accent': provider.accent,
                              '--stream-delay': provider.streamDelay,
                            } as CSSProperties
                          }
                        >
                          <div className="pd-prov-top">
                            <span className="pd-prov-icon">
                              <Icon size={15} aria-hidden="true" />
                            </span>
                            <span className="pd-prov-info">
                              <span className="pd-prov-name">{provider.name}</span>
                              <span className="pd-prov-sub">
                                <span className="pd-dot live" />
                                {provider.plan} · {money(provider.monthly)}/mo
                              </span>
                            </span>
                            <span className="pd-prov-pct">
                              <span className="pd-pct-num">{Math.round(provider.usedPct)}%</span>
                              <span className="pd-pct-label">used</span>
                            </span>
                          </div>
                          <span className="pd-prov-meter" aria-hidden="true">
                            <span
                              className="pd-prov-meter-fill"
                              style={{ width: `${provider.usedPct}%` }}
                            />
                          </span>
                          <div className="pd-window-list">
                            {provider.windows.slice(0, provider.active ? 3 : 2).map((window) => (
                              <div className="pd-window" key={`${provider.id}-${window.label}`}>
                                <div className="pd-window-head">
                                  <span>{window.label}</span>
                                  <small>{window.kind}</small>
                                </div>
                                <span className="pd-window-bar" aria-hidden="true">
                                  <span style={{ width: `${window.usedPct}%` }} />
                                </span>
                                <div className="pd-window-foot">
                                  <span>
                                    <strong>{Math.round(window.usedPct)}%</strong> used
                                  </span>
                                  <span>{window.reset}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="pd-prov-bottom">
                            <span>
                              <strong>{moneyExact(provider.spent)}</strong> spent
                            </span>
                            <span>
                              <strong>{moneyExact(provider.left)}</strong> left to maxx
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  <footer className="pd-pop-foot">
                    <span className="pd-pop-totals">
                      <strong>LEFT {money(totals.left)}</strong>
                      <strong>SPENT {money(totals.spent)}</strong>
                      <span>
                        PLANS {animatedProviders.length} · 1e
                      </span>
                    </span>
                    <button type="button" onClick={() => setDemoOpen(false)}>
                      Done
                    </button>
                  </footer>
                </div>
              ) : (
                <div className="popover-demo stream-popover">
                  <div className="pd-dot-grid" aria-hidden="true" />
                  <div className="stream-head">
                    <button
                      className="stream-back"
                      type="button"
                      onClick={() => setDemoView('usage')}
                    >
                      ‹ Back
                    </button>
                    <span>Idea Stream</span>
                    <span className="stream-live">
                      <RefreshCw size={13} aria-hidden="true" />
                      live
                    </span>
                  </div>
                  <div className="forge-target">
                    Routed to <strong>{fullestProvider.name}</strong> · {fullestProvider.leftPct}%
                    full
                  </div>
                  <div className="stream-stage">
                    <article className="stream-card">
                      <div className="stream-card-top">
                        <span className="stream-title">Launch-post machine</span>
                        <span className="stream-source">CLAUDE</span>
                      </div>
                      <p>
                        Drop in a rough voice note. It returns a launch thread, landing-page
                        bullets, and a next-build prompt.
                      </p>
                      <div className="stream-meter">
                        <span style={{ width: `${Math.min(100, spendStep * 3)}%` }} />
                      </div>
                      <div className="stream-meta">
                        <span>Complexity ●●○</span>
                        <span>Build ~20m</span>
                        <span>{moneyExact(spendStep * 0.42 + 1.8)} spent</span>
                      </div>
                    </article>
                    <div className="idea-list">
                      {ideas.map((idea, index) => {
                        const Icon = idea.icon

                        return (
                          <div
                            className="idea-row"
                            key={idea.title}
                            style={{ '--stream-delay': `${index * 170}ms` } as CSSProperties}
                          >
                            <span className="idea-icon">
                              <Icon size={15} aria-hidden="true" />
                            </span>
                            <span className="idea-body">
                              <strong>{idea.title}</strong>
                              <small>{idea.meta}</small>
                            </span>
                            <span className="idea-value">
                              <strong>+ {idea.value}</strong>
                              <small>{idea.status}</small>
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div className="stream-actions">
                    <button type="button" className="stream-skip">
                      Skip
                    </button>
                    <button type="button" className="stream-start">
                      <Share2 size={14} aria-hidden="true" />
                      Start build
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              className="demo-closed"
              type="button"
              onClick={() => setDemoOpen(true)}
            >
              <img src="/maxxtoken/icon-1.png" alt="" />
              <span>
                Click <strong>⚡ {money(totals.left)} left</strong> in the menu bar above to open
                the live demo
              </span>
            </button>
          )}
        </div>
      </section>

      <section className="steps" id="nudges">
        <article className="step">
          <span className="step-icon">
            <Gauge size={20} aria-hidden="true" />
          </span>
          <h3>Counts your usage</h3>
          <p>Every AI plan, its limits and reset windows — tracked live.</p>
        </article>
        <article className="step">
          <span className="step-icon">
            <Flame size={20} aria-hidden="true" />
          </span>
          <h3>Shows what you waste</h3>
          <p>One number: the dollars about to vanish at reset.</p>
        </article>
        <article className="step" id="what-is-tokenmaxxing">
          <span className="step-icon">
            <Sparkles size={20} aria-hidden="true" />
          </span>
          <h3>Ideas to tokenmaxx</h3>
          <p>Build missions routed to the plan you underuse most.</p>
        </article>
      </section>

      <section className="stack" id="pricing">
        <h2>Your stack</h2>
        <p className="stack-lede">48 providers tracked — and counting.</p>
        <StackMarquee />
      </section>

      <section className="viral-loop" id="start">
        <div className="viral-loop-stack">
          <div className="viral-card">
            <img src="/maxxtoken/icon-1.png" alt="MaxxToken receipt icon" />
            <div className="viral-card-copy">
              <strong>Download MaxxToken</strong>
              <span>Pay what you want. One-time. Private by design.</span>
            </div>
            <div className="viral-downloads">
              <PolarDownloadButton onClick={startDownload} className="btn-primary" iconSize={16} />
            </div>
          </div>
          <p className="footer-icon-credits viral-footnote">Windows installer still in Beta</p>
        </div>
      </section>

      <footer className="footer" id="docs">
        <div className="footer-brand">
          <a className="brand" href="#top">
            <img className="brand-mark" src="/maxxtoken/icon-1.png" alt="" />
            <span>
              Maxx<strong>Token</strong>
            </span>
          </a>
          <p>The menu bar app for tokenmaxxing your AI subscriptions.</p>
        </div>
        <nav className="footer-nav">
          <a
            href="#product"
            onClick={(event) => {
              event.preventDefault()
              goLanding('#product')
            }}
          >
            Demo
          </a>
          <a
            href="#nudges"
            onClick={(event) => {
              event.preventDefault()
              goLanding('#nudges')
            }}
          >
            Missions
          </a>
          <a
            href="#what-is-tokenmaxxing"
            onClick={(event) => {
              event.preventDefault()
              goLanding('#what-is-tokenmaxxing')
            }}
          >
            Tokenmaxxing
          </a>
          <button type="button" className="footer-link-btn" onClick={goFreebies}>
            Freebies
          </button>
          <PolarDownloadButton onClick={startDownload} className="footer-dl" showIcons={false} />
        </nav>
        <div className="footer-social">
          <a href="https://x.com/rachelnocode" aria-label="Rachel on X">
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>
        <p className="footer-icon-credits">
          <a href="https://www.flaticon.com/free-icons/mac" title="mac icons">
            Mac icons created by Freepik - Flaticon
          </a>
          {' · '}
          <a href="https://www.flaticon.com/free-icons/logos" title="logos icons">
            Logos icons created by Pixel perfect - Flaticon
          </a>
        </p>
      </footer>
        </>
      )}

      {showThankYou ? (
        <div
          className="ty-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ty-title"
          onClick={() => setShowThankYou(false)}
        >
          <div className="ty-modal" onClick={(event) => event.stopPropagation()}>
            <div className="ty-dot-grid" aria-hidden="true" />
            <button
              type="button"
              className="ty-close"
              aria-label="Close"
              onClick={() => setShowThankYou(false)}
            >
              ✕
            </button>
            <span className="ty-receipt">
              <Flame size={13} aria-hidden="true" />
              receipt printed
            </span>
            <span className="ty-icon">
              <img src="/maxxtoken/icon-1.png" alt="" />
            </span>
            <h2 id="ty-title">You absolute tokenmaxxer.</h2>
            <p>
              Thank you. Your download link is sprinting to your inbox right now —
              go check your email (peek in spam too, links love to hide there).
            </p>
            <p className="ty-sub">
              Install MaxxToken and go spend the tokens you already paid for.
              Big AI is not getting this one for free.
            </p>
            <span className="ty-stars" aria-hidden="true">
              <Star size={16} className="filled" />
              <Star size={16} className="filled" />
              <Star size={16} className="filled" />
              <Star size={16} className="filled" />
              <Star size={16} className="filled" />
            </span>
            <button
              type="button"
              className="btn-primary lg ty-btn"
              onClick={() => setShowThankYou(false)}
            >
              Off to my inbox
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App
