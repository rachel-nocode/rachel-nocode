import {
  ArrowRight,
  Captions,
  CheckCircle2,
  Crop,
  Cpu,
  Download,
  Mail,
  Sparkles,
  Star,
  TerminalSquare,
  TrendingUp,
  Type,
} from 'lucide-react'
import { PolarEmbedCheckout } from '@polar-sh/checkout/embed'
import { useCallback, useEffect, useState, type MouseEvent } from 'react'
import './App.css'

// Clip4X download routes through Polar checkout — the .dmg is delivered by email
// after purchase. Source stays open on GitHub (menubar link); the notarized
// build is the paid convenience.
// Success URL: https://www.rachelnocode.com/clip4x?checkout=success&checkout_id={CHECKOUT_ID}
// Return URL:  https://www.rachelnocode.com/clip4x?checkout=success
const DOWNLOAD_URL = 'https://buy.polar.sh/polar_cl_uKBK9CrUr7PJyvbnHBWyLSghgEqIRcXBGlQEl08NInG'
const REPO_URL = 'https://github.com/rachel-nocode/clip4x'

// lucide-react v1 dropped brand icons — inline the GitHub mark.
function GitHubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.05-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.12-.31-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.18.77.84 1.24 1.91 1.24 3.23 0 4.63-2.81 5.65-5.49 5.95.43.37.81 1.1.81 2.22 0 1.61-.01 2.9-.01 3.29 0 .32.21.7.82.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />
    </svg>
  )
}

export default function App() {
  const [showThankYou, setShowThankYou] = useState(false)

  // Open the Polar checkout in an embedded iframe. On success, stop Polar's
  // built-in redirect so the buyer lands on our modal instead of bouncing away,
  // then close the iframe ourselves (it sits at max z-index).
  const startCheckout = useCallback(async (event: MouseEvent) => {
    event.preventDefault()
    try {
      const checkout = await PolarEmbedCheckout.create(DOWNLOAD_URL, { theme: 'dark' })
      checkout.addEventListener('success', (successEvent) => {
        successEvent.preventDefault()
        checkout.close()
        setShowThankYou(true)
      })
    } catch {
      window.open(DOWNLOAD_URL, '_blank', 'noopener')
    }
  }, [])

  // Fallback: if the buyer returns via Polar's redirect, the URL carries
  // ?checkout=success. Show the modal and strip the query so a reload won't
  // re-trigger it.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('checkout') === 'success') {
      setShowThankYou(true)
      params.delete('checkout')
      params.delete('checkout_id')
      const next = params.toString()
      const url = window.location.pathname + (next ? `?${next}` : '') + window.location.hash
      window.history.replaceState({}, '', url)
    }
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

  return (
    <div className="c4-root">
      <div className="c4-glow" aria-hidden="true" />

      <header className="c4-menubar">
        <div className="c4-mb-inner">
          <a className="c4-back" href="/">← rachelnocode</a>
          <a className="c4-brand" href="/clip4x">
            <span className="c4-mark"><img src="/clip4x/icon.png" alt="" /></span>
            <span>Clip4X</span>
          </a>
          <a className="c4-mb-cta" href={REPO_URL} target="_blank" rel="noopener noreferrer">
            <GitHubIcon size={13} /> GitHub
          </a>
        </div>
      </header>

      <main className="c4-main">
        <section className="c4-hero">
          <span className="c4-eyebrow">runs 100% local · open source</span>
          <h1><span className="hl">Scroll-stopping clips</span> in seconds.</h1>
          <p className="c4-sub">
            Clip4X finds your best moments, cuts them to <code>9:16</code> and <code>1:1</code>,
            and adds hook titles and captions — export-ready, all on your own machine via the
            Codex CLI.
          </p>
          <div className="c4-cta">
            <a className="c4-btn c4-btn--primary" href={DOWNLOAD_URL} onClick={startCheckout}>
              <Download size={16} /> Download for Mac
            </a>
            <a className="c4-btn c4-btn--ghost" href="#how">
              How it works <ArrowRight size={14} />
            </a>
          </div>
          <div className="c4-pills">
            <span><Cpu size={13} /> Fully local</span>
            <span><TerminalSquare size={13} /> Codex CLI</span>
            <span><Sparkles size={13} /> Open source</span>
          </div>
        </section>

        <section className="c4-demo" aria-label="Clip4X app">
          <img src="/clip4x/demo.png" alt="Clip4X reviewing clip candidates with a 9:16 preview open" />
        </section>

        <section className="c4-features" id="how">
          <span className="c4-eyebrow">what it does</span>
          <h2>Everything a clip needs, done locally.</h2>
          <div className="c4-features-grid">
            <Feature icon={<TrendingUp size={20} />} title="Finds the moments"
              desc="Whisper transcribes, Codex ranks every segment and scores the moments most likely to pop." />
            <Feature icon={<Crop size={20} />} title="9:16 + 1:1"
              desc="Reframes to vertical and square with a blurred background. Reels, Shorts, TikTok, feed." />
            <Feature icon={<Type size={20} />} title="Hook titles"
              desc="Writes a punchy hook for each clip and burns it on top so the first second earns the watch." />
            <Feature icon={<Captions size={20} />} title="Auto captions"
              desc="Word-by-word captions transcribed locally — accurate even on messy audio." />
            <Feature icon={<Cpu size={20} />} title="Private by default"
              desc="No upload, no cloud render, no subscription. Footage and transcripts never leave your disk." />
            <Feature icon={<Download size={20} />} title="Export ready"
              desc="Drops finished MP4s straight to a folder — or uploads them to YouTube as Shorts." />
          </div>
        </section>

        <section className="c4-final">
          <h2>Stop editing clips by hand.</h2>
          <p>The Mac app, notarized and ready to run.</p>
          <div className="c4-cta center">
            <a className="c4-btn c4-btn--primary lg" href={DOWNLOAD_URL} onClick={startCheckout}>
              <Download size={16} /> Download for Mac
            </a>
          </div>
        </section>

        {showThankYou ? (
          <div
            className="c4-ty-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="c4-ty-title"
            onClick={() => setShowThankYou(false)}
          >
            <div className="c4-ty-modal" onClick={(event) => event.stopPropagation()}>
              <button
                type="button"
                className="c4-ty-close"
                aria-label="Close"
                onClick={() => setShowThankYou(false)}
              >
                ✕
              </button>
              <span className="c4-ty-receipt">
                <CheckCircle2 size={13} aria-hidden="true" />
                payment received
              </span>
              <span className="c4-ty-icon">
                <img src="/clip4x/icon.png" alt="" />
              </span>
              <h2 id="c4-ty-title">Clip4X is on its way.</h2>
              <p>
                Thank you. Your download link is sprinting to your inbox right now —
                go check your email (peek in spam too, links love to hide there).
              </p>
              <p className="c4-ty-sub">
                <Mail size={14} aria-hidden="true" />
                Install Clip4X and start cutting scroll-stopping clips.
              </p>
              <span className="c4-ty-stars" aria-hidden="true">
                <Star size={16} className="filled" />
                <Star size={16} className="filled" />
                <Star size={16} className="filled" />
                <Star size={16} className="filled" />
                <Star size={16} className="filled" />
              </span>
              <button
                type="button"
                className="c4-btn c4-btn--primary lg c4-ty-btn"
                onClick={() => setShowThankYou(false)}
              >
                Off to my inbox
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : null}

        <footer className="c4-footer">
          <a className="c4-brand sm" href="/clip4x">
            <span className="c4-mark sm"><img src="/clip4x/icon.png" alt="" /></span>
            <span>Clip4X</span>
          </a>
          <span>© 2026 Rachel noCode</span>
        </footer>
      </main>
    </div>
  )
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <article className="c4-feature">
      <span className="c4-feature-ic">{icon}</span>
      <h3>{title}</h3>
      <p>{desc}</p>
    </article>
  )
}
