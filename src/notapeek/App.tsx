import { useCallback, useEffect, useState, type MouseEvent } from 'react'
import { PolarEmbedCheckout } from '@polar-sh/checkout/embed'
import {
  ArrowRight,
  CheckCircle2,
  Columns2,
  Download,
  ExternalLink,
  Eye,
  Layers,
  Mail,
  ScanEye,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react'
import './App.css'

// NotaPeek download routes through Polar checkout — the .dmg is never served
// directly. Polar delivers the notarized build by email after purchase.
// Success URL: https://www.rachelnocode.com/notapeek?checkout=success&checkout_id={CHECKOUT_ID}
// Return URL:  https://www.rachelnocode.com/notapeek
const DOWNLOAD_URL = 'https://buy.polar.sh/polar_cl_lXTv1ANALf2LTah4rMVpsdKKtNnWWvbeu49Pv2jEAhx'
const REPO_URL = 'https://github.com/rachel-nocode/notapeek'

export default function App() {
  const [showThankYou, setShowThankYou] = useState(false)

  // Open the Polar checkout in an embedded iframe. On success, stop Polar's
  // built-in redirect so the buyer lands on our modal instead of bouncing
  // away, then close the iframe ourselves (it sits at max z-index, so our
  // modal would otherwise hide behind it).
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

  // Fallback: if the buyer returns via Polar's success redirect (embed blocked
  // or completed in a new tab), the URL carries ?checkout=success. Show the
  // modal anyway and strip the query so a reload doesn't re-trigger it.
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
    <div className="np-root">
      <div className="np-glow" aria-hidden="true" />

      <header className="np-menubar">
        <div className="np-mb-inner">
          <a className="np-back" href="/">← rachelnocode</a>
          <a className="np-brand" href="/notapeek">
            <span className="np-mark"><img src="/notapeek/icon.png" alt="" /></span>
            <span>NotaPeek</span>
          </a>
          <a className="np-mb-cta" href={DOWNLOAD_URL} onClick={startCheckout}>
            <Download size={13} /> Download
          </a>
        </div>
      </header>

      <main className="np-main">
        <section className="np-hero">
          <span className="np-eyebrow">macOS · markdown previewer</span>
          <h1>Never look at ugly <span className="hl">markdown</span> again.</h1>
          <p className="np-sub">
            NotaPeek gives <code>.md</code> files a beautiful rendered preview — in the app and
            right inside Finder. Drop a file, hit space, read it the way it was meant to look.
          </p>
          <div className="np-cta">
            <a className="np-btn np-btn--primary" href={DOWNLOAD_URL} onClick={startCheckout}>
              <Download size={16} /> Download for Mac
            </a>
            <a className="np-btn np-btn--ghost" href="#features">
              See what it does <ArrowRight size={14} />
            </a>
          </div>
          <div className="np-pills">
            <span><Zap size={13} /> Native + fast</span>
            <span><ScanEye size={13} /> Quick Look in Finder</span>
            <span><Sparkles size={13} /> Free &amp; open source</span>
          </div>
        </section>

        <AppMock />

        <section className="np-steps" id="features">
          <span className="np-eyebrow">how it works</span>
          <h2>From file to gorgeous in one move.</h2>
          <div className="np-steps-grid">
            <Step n="01" title="Drop or open" desc="Drag a .md in, use the file picker, or press ⌘O. Opens instantly." />
            <Step n="02" title="Read it pretty" desc="See a clean rendered preview — code, tables, checkboxes, the lot." />
            <Step n="03" title="Edit + save" desc="Flip to split mode, tweak the source, save it straight back to disk." />
          </div>
        </section>

        <section className="np-row-2">
          <div className="np-card np-card--soft">
            <span className="np-eyebrow-2"><ScanEye size={13} /> Finder integration</span>
            <h3>Press Space. See markdown.</h3>
            <p>NotaPeek installs a Quick Look extension, so Finder renders your markdown the second you peek at it — no double-clicking, no waiting.</p>
          </div>
          <div className="np-card np-card--soft">
            <span className="np-eyebrow-2"><Sparkles size={13} /> Native &amp; local</span>
            <h3>Built with Tauri. Runs on-device.</h3>
            <p>A tiny native macOS app — React on the inside, Swift Quick Look on the outside. Your files never leave your Mac.</p>
          </div>
        </section>

        <section className="np-final">
          <h2>Stop reading raw markdown.</h2>
          <p>Free, open source, Apple Silicon native.</p>
          <div className="np-cta center">
            <a className="np-btn np-btn--primary lg" href={DOWNLOAD_URL} onClick={startCheckout}>
              <Download size={16} /> Download for Mac
            </a>
            <a className="np-btn np-btn--ghost lg" href={REPO_URL} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={15} /> View on GitHub
            </a>
          </div>
          <span className="np-final-note">macOS 12+ · Apple Silicon</span>
        </section>

        {showThankYou ? (
          <div
            className="np-ty-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="np-ty-title"
            onClick={() => setShowThankYou(false)}
          >
            <div className="np-ty-modal" onClick={(event) => event.stopPropagation()}>
              <button
                type="button"
                className="np-ty-close"
                aria-label="Close"
                onClick={() => setShowThankYou(false)}
              >
                ✕
              </button>
              <span className="np-ty-receipt">
                <CheckCircle2 size={13} aria-hidden="true" />
                payment received
              </span>
              <span className="np-ty-icon">
                <img src="/notapeek/icon.png" alt="" />
              </span>
              <h2 id="np-ty-title">NotaPeek is on its way.</h2>
              <p>
                Thank you. Your download link is sprinting to your inbox right now —
                go check your email (peek in spam too, links love to hide there).
              </p>
              <p className="np-ty-sub">
                <Mail size={14} aria-hidden="true" />
                Install NotaPeek and never look at ugly markdown again.
              </p>
              <span className="np-ty-stars" aria-hidden="true">
                <Star size={16} className="filled" />
                <Star size={16} className="filled" />
                <Star size={16} className="filled" />
                <Star size={16} className="filled" />
                <Star size={16} className="filled" />
              </span>
              <button
                type="button"
                className="np-btn np-btn--primary lg np-ty-btn"
                onClick={() => setShowThankYou(false)}
              >
                Off to my inbox
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : null}

        <footer className="np-footer">
          <a className="np-brand sm" href="/notapeek">
            <span className="np-mark sm"><img src="/notapeek/icon.png" alt="" /></span>
            <span>NotaPeek</span>
          </a>
          <span>© 2026 Rachel noCode</span>
        </footer>
      </main>
    </div>
  )
}

function AppMock() {
  return (
    <section className="np-mock-wrap" aria-label="App preview">
      <div className="np-mock">
        <div className="np-mock-bar">
          <div className="np-traffic"><span /><span /><span /></div>
          <div className="np-file">
            <span className="np-dot" aria-hidden="true" />
            sample.md
          </div>
          <div className="np-winbtns">
            <span className="np-wb">Open</span>
            <span className="np-wb on">Edit</span>
            <span className="np-wb muted">Save</span>
          </div>
        </div>

        <div className="np-mock-body">
          <div className="np-editor" aria-hidden="true">
            <span className="np-ln"><span className="md-h"># NotaPeek QA</span></span>
            <span className="np-ln" />
            <span className="np-ln"><span className="md-mk">- [ ]</span> unchecked task</span>
            <span className="np-ln"><span className="md-mk">- [x]</span> checked task</span>
            <span className="np-ln" />
            <span className="np-ln"><span className="md-h">## Code</span></span>
            <span className="np-ln" />
            <span className="np-ln"><span className="md-mk">```js</span></span>
            <span className="np-ln"><span className="md-code">console.log("hi")</span></span>
            <span className="np-ln"><span className="md-mk">```</span></span>
            <span className="np-ln" />
            <span className="np-ln"><span className="md-mk">[</span>OpenAI<span className="md-mk">](https://openai.com)</span></span>
          </div>

          <div className="np-preview">
            <h2 className="np-pv-h1">NotaPeek QA</h2>
            <ul className="np-tasks">
              <li><span className="np-cb on">✓</span> <s>unchecked task</s></li>
              <li><span className="np-cb on">✓</span> <s>checked task</s></li>
            </ul>
            <h3 className="np-pv-h2">Code</h3>
            <div className="np-codeblock">
              <span className="np-lang">JS</span>
              <code>
                <span className="t-fn">console</span>
                <span className="t-op">.</span>
                <span className="t-kw">log</span>
                <span className="t-op">(</span>
                <span className="t-str">"hi"</span>
                <span className="t-op">)</span>
              </code>
            </div>
            <a className="np-pv-link" href="#features" onClick={(e) => e.preventDefault()}>OpenAI</a>
          </div>
        </div>
      </div>
      <div className="np-mock-tags" aria-hidden="true">
        <span><Eye size={12} /> Live preview</span>
        <span><Columns2 size={12} /> Split mode</span>
        <span><Layers size={12} /> Quick Look</span>
      </div>
    </section>
  )
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <article className="np-step">
      <span className="np-step-n">{n}</span>
      <h3>{title}</h3>
      <p>{desc}</p>
    </article>
  )
}
