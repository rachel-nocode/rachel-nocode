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
  Aperture,
  ArrowRight,
  ArrowUpRight,
  Asterisk,
  Box,
  ChevronDown,
  CircleSlash,
  Code2,
  Flame,
  Gauge,
  Moon,
  RefreshCw,
  Search,
  Settings,
  Sun,
  Sparkles,
  Star,
  TrendingUp,
  Wifi,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import './App.css'

import { Blog } from './Blog'
import { POLAR_CHECKOUT_URL, PolarDownloadButton } from './PolarDownloadButton'

type ModelBurn = {
  name: string
  tok: string
  cost: string
  pct: number
}

type Provider = {
  id: string
  name: string
  plan: string
  icon: LucideIcon
  // Animation seeds — bars fill from base and creep up as the demo ticks.
  base5h: number
  base7d: number
  drain: number
  reset: string
  detail: {
    sessionReset: string
    weeklyReset: string
    cost: { label: string; tokens: string; dollars: string }[]
    burn: ModelBurn[]
  }
}

const providers: Provider[] = [
  {
    id: 'claude',
    name: 'Claude',
    plan: 'CLAUDE',
    icon: Asterisk,
    base5h: 3,
    base7d: 7,
    drain: 0.12,
    reset: '00H 00M',
    detail: {
      sessionReset: '00H 00M',
      weeklyReset: '2D 00H',
      cost: [
        { label: 'Today', tokens: '0K tokens', dollars: '$0.09' },
        { label: 'Yesterday', tokens: '0K tokens', dollars: '$2.49' },
        { label: 'Last 30d', tokens: '0K tokens', dollars: '$51.84' },
      ],
      burn: [
        { name: 'claude-opus-4-7', tok: '33M tok', cost: '$33.04', pct: 49 },
        { name: 'claude-sonnet-4-6', tok: '26.3M tok', cost: '$11.79', pct: 39 },
        { name: 'claude-sonnet-4-5-20250929', tok: '5.3M tok', cost: '$5.50', pct: 8 },
        { name: 'claude-haiku-4-5-20251001', tok: '3M tok', cost: '$0.73', pct: 4 },
        { name: 'claude-opus-4-1-20250805', tok: '42K tok', cost: '$0.79', pct: 0 },
      ],
    },
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    plan: 'PRO 20X',
    icon: Aperture,
    base5h: 0,
    base7d: 25,
    drain: 0.18,
    reset: '04H 34M',
    detail: {
      sessionReset: '04H 34M',
      weeklyReset: '4D 12H',
      cost: [
        { label: 'Today', tokens: '0K tokens', dollars: '$1.20' },
        { label: 'Yesterday', tokens: '0K tokens', dollars: '$4.80' },
        { label: 'Last 30d', tokens: '0K tokens', dollars: '$88.10' },
      ],
      burn: [
        { name: 'gpt-5-pro', tok: '61M tok', cost: '$52.10', pct: 58 },
        { name: 'gpt-5-mini', tok: '24M tok', cost: '$18.40', pct: 26 },
        { name: 'gpt-5-nano', tok: '8.2M tok', cost: '$9.90', pct: 12 },
        { name: 'o4-mini', tok: '2.1M tok', cost: '$3.20', pct: 4 },
      ],
    },
  },
  {
    id: 'cursor',
    name: 'Cursor',
    plan: 'PRO+',
    icon: Box,
    base5h: 0,
    base7d: 17,
    drain: 0.1,
    reset: '24D 17H',
    detail: {
      sessionReset: '02H 10M',
      weeklyReset: '24D 17H',
      cost: [
        { label: 'Today', tokens: '0K tokens', dollars: '$0.40' },
        { label: 'Yesterday', tokens: '0K tokens', dollars: '$1.10' },
        { label: 'Last 30d', tokens: '0K tokens', dollars: '$22.30' },
      ],
      burn: [
        { name: 'auto', tok: '18M tok', cost: '$12.40', pct: 56 },
        { name: 'claude-sonnet-4-6', tok: '7M tok', cost: '$6.10', pct: 28 },
        { name: 'gpt-5-pro', tok: '3M tok', cost: '$3.80', pct: 16 },
      ],
    },
  },
  {
    id: 'kimi',
    name: 'Kimi',
    plan: 'BASIC',
    icon: Box,
    base5h: 0,
    base7d: 1,
    drain: 0.05,
    reset: '00H 00M',
    detail: {
      sessionReset: '00H 00M',
      weeklyReset: '6D 02H',
      cost: [
        { label: 'Today', tokens: '0K tokens', dollars: '$0.00' },
        { label: 'Yesterday', tokens: '0K tokens', dollars: '$0.20' },
        { label: 'Last 30d', tokens: '0K tokens', dollars: '$3.40' },
      ],
      burn: [
        { name: 'kimi-k2', tok: '1.2M tok', cost: '$0.90', pct: 70 },
        { name: 'kimi-k1.5', tok: '0.4M tok', cost: '$0.30', pct: 30 },
      ],
    },
  },
  {
    id: 'grok',
    name: 'Grok',
    plan: 'BUILD',
    icon: CircleSlash,
    base5h: 0,
    base7d: 11,
    drain: 0.09,
    reset: '—',
    detail: {
      sessionReset: '—',
      weeklyReset: '—',
      cost: [
        { label: 'Today', tokens: '0K tokens', dollars: '$0.30' },
        { label: 'Yesterday', tokens: '0K tokens', dollars: '$0.90' },
        { label: 'Last 30d', tokens: '0K tokens', dollars: '$14.60' },
      ],
      burn: [
        { name: 'grok-4', tok: '12M tok', cost: '$9.80', pct: 62 },
        { name: 'grok-4-mini', tok: '5M tok', cost: '$4.80', pct: 38 },
      ],
    },
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

function clampPct(value: number) {
  return Math.max(0, Math.min(98, value))
}

// Segmented "tick" bar — empty dashes under a green fill clipped to pct%.
// The fill width transitions, so the bar animates as the demo ticks.
function SegBar({ pct }: { pct: number }) {
  return (
    <span className="nx-bar" aria-hidden="true">
      <span className="nx-bar-fill" style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </span>
  )
}

function App() {
  const [expandedId, setExpandedId] = useState<string | null>('claude')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [spendTick, setSpendTick] = useState(0)
  const [demoOpen, setDemoOpen] = useState(true)
  const [now, setNow] = useState(() => new Date())
  const [demoRight, setDemoRight] = useState<number | null>(null)
  const [showThankYou, setShowThankYou] = useState(false)
  const [pageView, setPageView] = useState<'landing' | 'blog'>(() => {
    if (typeof window === 'undefined') return 'landing'
    if (window.location.hash === '#blog') return 'blog'
    return 'landing'
  })

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

  const goBlog = useCallback(() => {
    setPageView('blog')
    window.history.replaceState(null, '', '#blog')
    window.scrollTo({ top: 0 })
  }, [])

  useEffect(() => {
    const syncView = () => {
      const { hash } = window.location
      setPageView(hash === '#blog' ? 'blog' : 'landing')
    }
    window.addEventListener('hashchange', syncView)
    return () => window.removeEventListener('hashchange', syncView)
  }, [])

  // Theme lives on <html> so body bg + every var-driven surface flips at once.
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    return () => {
      delete document.documentElement.dataset.theme
    }
  }, [theme])

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
        // Bars creep up as the demo ticks. 7-day window is the headline number;
        // the 5-hour session fills a touch faster.
        const pct7d = clampPct(provider.base7d + spendStep * provider.drain)
        const pct5h = clampPct(provider.base5h + spendStep * provider.drain * 1.4)

        return {
          ...provider,
          expanded: provider.id === expandedId,
          pct5h,
          pct7d,
          leftPct: Math.round(100 - pct7d),
          streamDelay: `${index * 90}ms`,
        }
      }),
    [expandedId, spendStep],
  )

  // Footer numbers are fixed for the marketing demo (match the design mock).
  const totals = { spent: 163, left: 439 }

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
              Optimize
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
              className={`osm-menu osm-menu-btn ${pageView === 'blog' ? 'is-active' : ''}`}
              onClick={goBlog}
            >
              Blog
            </button>
            <a className="osm-menu" href="https://x.com/rachelnocode">
              Contact
            </a>
          </div>
          <div className="osm-right">
            <button
              type="button"
              className="osm-theme-toggle"
              onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
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

      {pageView === 'blog' ? (
        <Blog onDownload={startDownload} />
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
            MaxxToken tracks every AI plan from your menu bar — dollars spent, dollars left, and which limits reset next, so nothing you paid for expires unused.
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
                <strong>Finds wasted money</strong>
                <span>Cache leaks, dormant plans, expiring caps</span>
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
                <div className="popover-demo usage-popover nx">
                  {/* Header */}
                  <div className="nx-head">
                    <div className="nx-brand">
                      <img className="nx-brand-mark" src="/maxxtoken/icon-1.png" alt="" />
                      <span className="nx-brand-name">
                        Maxx<strong>Token</strong>
                      </span>
                    </div>
                    <div className="nx-head-actions">
                      <button className="nx-icon-btn" type="button" aria-label="Settings">
                        <Settings size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Status bar */}
                  <div className="nx-status">
                    <span className="nx-status-dot" aria-hidden="true" />
                    LIVE · {animatedProviders.length} STREAMS
                  </div>

                  {/* Provider list */}
                  <div className="nx-list">
                    {animatedProviders.map((provider) => {
                      const Icon = provider.icon
                      const headline = Math.round(provider.pct7d)

                      return (
                        <div
                          className={`nx-row ${provider.expanded ? 'is-open' : ''}`}
                          key={provider.id}
                          style={{ '--stream-delay': provider.streamDelay } as CSSProperties}
                        >
                          <div className="nx-row-top">
                            <span className="nx-row-icon">
                              {provider.id === 'kimi' ? (
                                <span className="nx-row-glyph" aria-hidden="true">
                                  K
                                </span>
                              ) : (
                                <Icon size={16} aria-hidden="true" />
                              )}
                            </span>
                            <span className="nx-row-name">{provider.name}</span>
                            <span className="nx-row-plan">{provider.plan}</span>
                            <span className="nx-row-spark" aria-hidden="true" />
                            <span className="nx-row-pct">{headline}%</span>
                            <button
                              type="button"
                              className="nx-chevron"
                              aria-label={provider.expanded ? 'Collapse' : 'Expand'}
                              aria-expanded={provider.expanded}
                              aria-controls={`nx-detail-${provider.id}`}
                              onClick={() =>
                                setExpandedId((id) => (id === provider.id ? null : provider.id))
                              }
                            >
                              <ChevronDown size={15} aria-hidden="true" />
                            </button>
                          </div>

                          <SegBar pct={provider.pct7d} />

                          <div className="nx-row-foot">
                            <span>
                              5H {Math.round(provider.pct5h)}% · 7D {headline}%
                            </span>
                            <span>RESET {provider.reset}</span>
                          </div>

                          {provider.expanded ? (
                            <div className="nx-detail" id={`nx-detail-${provider.id}`}>
                              {/* Sub-windows */}
                              <div className="nx-window">
                                <div className="nx-window-head">
                                  <span>SESSION · 5H</span>
                                  <span className="nx-window-pct">
                                    {Math.round(provider.pct5h)}
                                    <small>%</small>
                                  </span>
                                </div>
                                <SegBar pct={provider.pct5h} />
                                <div className="nx-window-foot">
                                  RESETS IN {provider.detail.sessionReset}
                                </div>
                              </div>
                              <div className="nx-window">
                                <div className="nx-window-head">
                                  <span>WEEKLY · 7D</span>
                                  <span className="nx-window-pct">
                                    {headline}
                                    <small>%</small>
                                  </span>
                                </div>
                                <SegBar pct={provider.pct7d} />
                                <div className="nx-window-foot">
                                  RESETS IN {provider.detail.weeklyReset}
                                </div>
                              </div>

                              {/* Cost */}
                              <div className="nx-section-head">
                                <span className="nx-section-title">COST</span>
                                <span>estimated</span>
                              </div>
                              <div className="nx-cost">
                                {provider.detail.cost.map((row) => (
                                  <div className="nx-cost-row" key={row.label}>
                                    <span className="nx-cost-label">{row.label}</span>
                                    <span className="nx-cost-tok">{row.tokens}</span>
                                    <span className="nx-cost-amt">{row.dollars}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Model burn */}
                              <div className="nx-section-head">
                                <span className="nx-section-title">MODEL BURN</span>
                                <span>{provider.detail.burn.length} ACTIVE</span>
                              </div>
                              <div className="nx-burn">
                                {provider.detail.burn.map((model) => (
                                  <div className="nx-burn-row" key={model.name}>
                                    <div className="nx-burn-top">
                                      <span className="nx-burn-name">{model.name}</span>
                                      <span className="nx-burn-tok">{model.tok}</span>
                                      <span className="nx-burn-amt">{model.cost}</span>
                                      <span className="nx-burn-pct">{model.pct}%</span>
                                    </div>
                                    <SegBar pct={model.pct} />
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>

                  {/* Footer */}
                  <footer className="nx-foot">
                    <div className="nx-foot-box">
                      <span className="nx-foot-label">SPENT</span>
                      <span className="nx-foot-val green">{money(totals.spent)}</span>
                    </div>
                    <div className="nx-foot-box">
                      <span className="nx-foot-label">LEFT</span>
                      <span className="nx-foot-val red">{money(totals.left)}</span>
                    </div>
                    <button type="button" className="nx-sync" onClick={() => setSpendTick(0)}>
                      SYNC
                      <RefreshCw size={14} aria-hidden="true" />
                    </button>
                  </footer>
                </div>
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
          <h3>Optimizes and alerts</h3>
          <p>Flags cache leaks and dormant plans, and pings you before tokens expire.</p>
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
            Optimize
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
