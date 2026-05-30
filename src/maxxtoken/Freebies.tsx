import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { Check, Download, Share2, Sparkles, Target } from 'lucide-react'
import {
  buildReceiptShareText,
  buildMissionShareText,
  buildStackLines,
  freebieProviders,
  pickFullestLine,
  pickMission,
  receiptVerdict,
  stackTotals,
  type BuildingGoal,
} from './freebie-data'
import { exportReceiptPngFromElement } from './receipt-export'
import { PromptCacheFreebie } from './PromptCacheFreebie'

import { POLAR_CHECKOUT_URL } from './PolarDownloadButton'

const defaultSelected = ['claude', 'chatgpt', 'cursor', 'gemini']

const goalOptions: { id: BuildingGoal; label: string; hint: string }[] = [
  { id: 'app', label: 'Ship an app', hint: 'Features, bugs, scope' },
  { id: 'content', label: 'Make content', hint: 'Threads, hooks, posts' },
  { id: 'client', label: 'Client work', hint: 'SOWs, updates, emails' },
  { id: 'learning', label: 'Learn faster', hint: 'Cheatsheets, drills' },
]

type FreebiesProps = {
  onDownload: (event: MouseEvent) => void
}

function money(value: number) {
  return `$${Math.round(value)}`
}

export function Freebies({ onDownload }: FreebiesProps) {
  const [tab, setTab] = useState<'receipt' | 'mission' | 'cache'>('receipt')
  const [selected, setSelected] = useState<string[]>(defaultSelected)
  const [usedPct, setUsedPct] = useState(28)
  const [goal, setGoal] = useState<BuildingGoal>('app')
  const [exporting, setExporting] = useState(false)
  const [copied, setCopied] = useState(false)
  const receiptRef = useRef<HTMLElement>(null)
  const copyTimeoutRef = useRef<number | null>(null)

  const lines = useMemo(() => buildStackLines(selected, usedPct), [selected, usedPct])
  const totals = useMemo(() => stackTotals(lines), [lines])
  const verdict = receiptVerdict(usedPct)
  const fullest = pickFullestLine(lines)
  const mission = fullest
    ? pickMission(goal, selected.length * 7 + usedPct + goal.length)
    : 'Pick at least one sub to route a mission.'

  const toggleProvider = (id: string) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  const downloadReceipt = async () => {
    const node = receiptRef.current
    if (!node || lines.length === 0) return
    setExporting(true)
    try {
      const dataUrl = await exportReceiptPngFromElement(node)
      const link = document.createElement('a')
      link.download = 'maxxtoken-receipt.png'
      link.href = dataUrl
      link.click()
    } finally {
      setExporting(false)
    }
  }

  const shareText = useMemo(() => {
    if (lines.length === 0) return ''
    const seed = selected.length * 7 + usedPct + goal.length
    if (tab === 'mission' && fullest) {
      return buildMissionShareText(fullest.provider.name, fullest.left, mission, seed)
    }
    return buildReceiptShareText(totals.left, usedPct)
  }, [tab, lines.length, fullest, mission, totals.left, usedPct, selected.length, goal.length])

  useEffect(() => {
    setCopied(false)
  }, [shareText, tab])

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) window.clearTimeout(copyTimeoutRef.current)
    }
  }, [])

  const copyShare = async () => {
    if (!shareText) return
    await navigator.clipboard.writeText(shareText)
    setCopied(true)
    if (copyTimeoutRef.current) window.clearTimeout(copyTimeoutRef.current)
    copyTimeoutRef.current = window.setTimeout(() => setCopied(false), 2000)
  }

  const copyButtonLabel = tab === 'receipt' ? 'Copy post text' : 'Copy flex text'

  return (
    <section className="freebies">
      <div className="freebies-head">
        <span className="badge">
          <Sparkles size={14} aria-hidden="true" />
          free tools
        </span>
        <h1>
          Flex the stack. <span className="accent">Maxx the reset.</span>
        </h1>
        <p>Three quick tools — no login, no bloat. Receipt, mission router, and OpenAI prompt cache optimizer.</p>
      </div>

      <div className="freebies-tabs" role="tablist" aria-label="Freebie tools">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'receipt'}
          className={`freebies-tab ${tab === 'receipt' ? 'is-active' : ''}`}
          onClick={() => setTab('receipt')}
        >
          Token flex receipt
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'mission'}
          className={`freebies-tab ${tab === 'mission' ? 'is-active' : ''}`}
          onClick={() => setTab('mission')}
        >
          One free maxx mission
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'cache'}
          className={`freebies-tab ${tab === 'cache' ? 'is-active' : ''}`}
          onClick={() => setTab('cache')}
        >
          Prompt cache optimizer
        </button>
      </div>

      {tab === 'cache' ? (
        <PromptCacheFreebie />
      ) : (
      <div className="freebies-grid">
        <div className="freebies-panel">
          <p className="freebies-label">Your stack</p>
          <div className="freebies-chips">
            {freebieProviders.map((provider) => {
              const active = selected.includes(provider.id)
              return (
                <button
                  key={provider.id}
                  type="button"
                  className={`freebies-chip ${active ? 'is-on' : ''}`}
                  onClick={() => toggleProvider(provider.id)}
                  aria-pressed={active}
                >
                  {provider.name}
                  <span>{money(provider.monthly)}/mo</span>
                </button>
              )
            })}
          </div>

          <label className="freebies-slider-label" htmlFor="usage-slider">
            Roughly how much do you actually use?
            <strong>{usedPct}%</strong>
          </label>
          <input
            id="usage-slider"
            className="freebies-slider"
            type="range"
            min={8}
            max={92}
            value={usedPct}
            onChange={(event) => setUsedPct(Number(event.target.value))}
          />

          {tab === 'mission' ? (
            <>
              <p className="freebies-label">What are you building?</p>
              <div className="freebies-goals">
                {goalOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`freebies-goal ${goal === option.id ? 'is-active' : ''}`}
                    onClick={() => setGoal(option.id)}
                  >
                    <strong>{option.label}</strong>
                    <span>{option.hint}</span>
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>

        <div className={`freebies-output ${tab === 'receipt' ? 'is-receipt' : 'is-mission'}`}>
          {tab === 'receipt' ? (
            <div className="receipt-stage">
              <article className="receipt-ticket" ref={receiptRef} aria-label="Token flex receipt preview">
                <div className="receipt-fold" aria-hidden="true" />
                <div className="receipt-paper">
                  <header className="receipt-top">
                    <img src="/maxxtoken/icon-1.png" alt="" className="receipt-icon" />
                    <div>
                      <p className="receipt-brand">
                        Maxx<span>Token</span>
                      </p>
                      <p className="receipt-kicker">Token flex receipt</p>
                    </div>
                  </header>

                  <div className="receipt-dash" aria-hidden="true" />

                  <div className="receipt-stats">
                    <div>
                      <p className="receipt-stat-value spent">{money(totals.spent)}</p>
                      <p className="receipt-stat-label">spent value</p>
                    </div>
                    <div>
                      <p className="receipt-stat-value left">{money(totals.left)}</p>
                      <p className="receipt-stat-label">left to maxx</p>
                    </div>
                  </div>

                  <div className="receipt-meter" aria-hidden="true">
                    <span style={{ width: `${usedPct}%` }} />
                  </div>

                  <p className="receipt-stars" aria-label={`${verdict.stars} out of 5 stars`}>
                    {'★'.repeat(verdict.stars)}
                    {'☆'.repeat(5 - verdict.stars)}
                  </p>
                  <p className="receipt-verdict">{verdict.text}</p>

                  <div className="receipt-dash" aria-hidden="true" />

                  <ul className="receipt-lines">
                    {lines.map((line) => (
                      <li key={line.provider.id}>
                        <div className="receipt-line-head">
                          <span>{line.provider.name}</span>
                          <span>{line.usedPct}% used</span>
                        </div>
                        <div className="receipt-line-bar">
                          <span
                            style={{
                              width: `${line.usedPct}%`,
                              background: line.provider.accent,
                            }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="receipt-dash" aria-hidden="true" />

                  <footer className="receipt-foot">
                    <p>Stop donating to Big AI.</p>
                    <p className="receipt-cta">Maxx before reset → maxxtoken.app</p>
                  </footer>
                </div>
                <div className="receipt-tear" aria-hidden="true" />
              </article>
            </div>
          ) : (
            <article className="mission-card">
              <div className="mission-badge">
                <Target size={16} aria-hidden="true" />
                routed mission
              </div>
              {fullest ? (
                <>
                  <p className="mission-route">
                    Route to <strong>{fullest.provider.name}</strong> — {money(fullest.left)} left to maxx
                  </p>
                  <p className="mission-copy">{mission}</p>
                  <p className="mission-meta">
                    {usedPct}% stack usage · {lines.length} subs · reset window closing
                  </p>
                </>
              ) : (
                <p className="mission-copy">Select at least one subscription to generate a mission.</p>
              )}
            </article>
          )}

          <div className="freebies-actions">
            {tab === 'receipt' ? (
              <button
                type="button"
                className="btn-primary"
                onClick={downloadReceipt}
                disabled={lines.length === 0 || exporting}
              >
                <Download size={16} aria-hidden="true" />
                {exporting ? 'Rendering…' : 'Download PNG for X'}
              </button>
            ) : (
              <a className="btn-primary" href={POLAR_CHECKOUT_URL} onClick={onDownload}>
                Get missions
              </a>
            )}
            <button
              type="button"
              className={`btn-outline ${copied ? 'is-copied' : ''}`}
              onClick={copyShare}
              disabled={!shareText}
            >
              {copied ? <Check size={14} aria-hidden="true" /> : <Share2 size={14} aria-hidden="true" />}
              {copied ? 'Copied' : copyButtonLabel}
            </button>
          </div>
        </div>
      </div>
      )}
    </section>
  )
}

export default Freebies
