import { useCallback, useEffect, useState, type MouseEvent, type ReactNode } from 'react'
import { PolarEmbedCheckout } from '@polar-sh/checkout/embed'
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Download,
  FileVideo,
  Gauge,
  Headphones,
  Layers,
  Mail,
  Mic,
  Play,
  Search,
  Sliders,
  Sparkles,
  Square,
  Star,
  Upload,
  Volume2,
  Waves,
  Wind,
} from 'lucide-react'
import './App.css'

// Polar pay-what-you-want checkout link. Swap with the real Save my Audio
// product link once it exists in the Polar dashboard.
const DOWNLOAD_URL = 'https://buy.polar.sh/polar_cl_a4EOE1XfYzPI6kk58u9PqkSTcIamKW85YxJkk1tHAYs'

export default function App() {
  const [showThankYou, setShowThankYou] = useState(false)

  // Every download button routes through Polar checkout — the .dmg is never
  // served directly. Polar delivers the notarized build after checkout. When
  // the purchase confirms, show the thank-you modal so buyers know to go check
  // their email for the download link instead of staring at the landing page.
  const startDownload = useCallback(async (event: MouseEvent) => {
    event.preventDefault()
    try {
      const checkout = await PolarEmbedCheckout.create(DOWNLOAD_URL, { theme: 'dark' })
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
      window.open(DOWNLOAD_URL, '_blank', 'noopener')
    }
  }, [])

  // Fallback: if the buyer lands back here via Polar's success redirect
  // (e.g. the embed flow was blocked, or they completed checkout in a new
  // tab), the URL will contain ?checkout=success. Show the modal anyway and
  // strip the query so a reload doesn't keep re-triggering it.
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
    <div className="sma-root">
      <header className="sma-menubar">
        <div className="sma-mb-inner">
          <a className="sma-back" href="/">← rachelnocode</a>
          <a className="sma-brand" href="/savemyaudio">
            <span className="sma-mark"><img src="/savemyaudio/icon.png" alt="" /></span>
            <span>Save my Audio</span>
          </a>
          <a className="sma-mb-cta" href={DOWNLOAD_URL} onClick={startDownload}>
            <Download size={13} /> Download
          </a>
        </div>
      </header>

      <main className="sma-main">
        <section className="sma-hero">
          <span className="sma-eyebrow">macOS · video audio fixer</span>
          <h1>Bad audio. <span className="hl">Fixed.</span></h1>
          <p className="sma-sub">
            Drop any video. Save my Audio lifts the levels, kills the rumble, cleans the noise,
            and exports a ready-to-post file, all on your Mac.
          </p>
          <div className="sma-cta">
            <a className="sma-btn sma-btn--primary" href={DOWNLOAD_URL} onClick={startDownload}>
              <Download size={16} /> Download for Mac
            </a>
            <a className="sma-btn sma-btn--ghost" href="#how">
              See how it works <ArrowRight size={14} />
            </a>
          </div>
          <div className="sma-pills">
            <span><CheckCircle2 size={13} /> Apple Silicon</span>
            <span><CheckCircle2 size={13} /> 100% local</span>
            <span><CheckCircle2 size={13} /> Pay what you want</span>
          </div>
        </section>

        <AppMock />

        <section className="sma-features" id="how">
          <span className="sma-eyebrow">the repair chain</span>
          <h2>Six processors. One click.</h2>
          <p className="sma-sub-2">Real audio engineering, minus the manual.</p>
          <div className="sma-features-grid">
            <Feature icon={<Volume2 size={18} />} title="Loudness lock" desc="Target −16 LUFS so every clip lands at the same volume. No more hand-tuning sliders." />
            <Feature icon={<Gauge size={18} />} title="Smart compression" desc="Tames spikes, lifts quiet talking. 3:1 default — dial it to whatever sounds right." />
            <Feature icon={<Activity size={18} />} title="Brick-wall limiter" desc="Stops clipping before it can ruin a take. Push loud without distortion." />
            <Feature icon={<Wind size={18} />} title="Rumble killer" desc="Removes low-end hum from fans, traffic, AC, and street noise under your voice." />
            <Feature icon={<Sparkles size={18} />} title="One-click cleanup" desc="Hiss, mouth noise, room tone — gone. No plugins, no after-the-fact editing." />
            <Feature icon={<Headphones size={18} />} title="Channels, fixed" desc="Keep stereo, fold to mono, or upmix mono → stereo. Pick what your platform wants." />
          </div>
        </section>

        <section className="sma-steps">
          <span className="sma-eyebrow">how it works</span>
          <h2>Three steps. Done in 30 seconds.</h2>
          <div className="sma-steps-grid">
            <Step n="01" title="Import" desc="Drop in any .mp4 or .mov. Audio is detected automatically." />
            <Step n="02" title="Preview" desc="A/B original vs fixed in the first 30 seconds — confirm it sounds right." />
            <Step n="03" title="Export" desc="Pick a bitrate, hit Fix. Video stream passes through untouched." />
          </div>
        </section>

        <section className="sma-row-2">
          <div className="sma-card sma-card--soft">
            <span className="sma-eyebrow-2"><Layers size={13} /> Batch fix</span>
            <h3>Drop a folder. Save the lot.</h3>
            <p>Got a backlog of videos with bad audio? Batch Fix runs the chain on every file in one go.</p>
          </div>
          <div className="sma-card sma-card--soft">
            <span className="sma-eyebrow-2"><CheckCircle2 size={13} /> 100% local</span>
            <h3>Your files never leave your Mac.</h3>
            <p>Every analysis, every fix, every export runs on-device. No upload. No account. No tracking.</p>
          </div>
        </section>

        <section className="sma-final">
          <h2>Stop hand-fixing audio.</h2>
          <p>Pay what you want. One-time. Free updates.</p>
          <a className="sma-btn sma-btn--primary lg" href={DOWNLOAD_URL} onClick={startDownload}>
            <Download size={16} /> Download for Mac
          </a>
          <span className="sma-final-note">macOS 13+ · Apple Silicon</span>
        </section>

        <footer className="sma-footer">
          <a className="sma-brand sm" href="/savemyaudio">
            <span className="sma-mark sm"><img src="/savemyaudio/icon.png" alt="" /></span>
            <span>Save my Audio</span>
          </a>
          <span>© 2026 Rachel noCode</span>
        </footer>
      </main>

      {showThankYou ? (
        <div
          className="sma-ty-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sma-ty-title"
          onClick={() => setShowThankYou(false)}
        >
          <div className="sma-ty-modal" onClick={(event) => event.stopPropagation()}>
            <div className="sma-ty-dot-grid" aria-hidden="true" />
            <button
              type="button"
              className="sma-ty-close"
              aria-label="Close"
              onClick={() => setShowThankYou(false)}
            >
              ✕
            </button>
            <span className="sma-ty-receipt">
              <CheckCircle2 size={13} aria-hidden="true" />
              audio saved
            </span>
            <span className="sma-ty-icon">
              <img src="/savemyaudio/icon.png" alt="" />
            </span>
            <h2 id="sma-ty-title">Your audio is on the way.</h2>
            <p>
              Thank you. Your download link is sprinting to your inbox right now —
              go check your email (peek in spam too, links love to hide there).
            </p>
            <p className="sma-ty-sub">
              <Mail size={14} aria-hidden="true" />
              Install Save my Audio and start fixing those videos.
            </p>
            <span className="sma-ty-stars" aria-hidden="true">
              <Star size={16} className="filled" />
              <Star size={16} className="filled" />
              <Star size={16} className="filled" />
              <Star size={16} className="filled" />
              <Star size={16} className="filled" />
            </span>
            <button
              type="button"
              className="sma-btn sma-btn--primary lg sma-ty-btn"
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

function AppMock() {
  // Centered waveform: each bar mirrors around the midline, like the app.
  const bars = Array.from({ length: 46 }).map((_, i) => {
    const env = Math.abs(Math.sin(i * 0.42)) * 0.7 + Math.abs(Math.sin(i * 1.7)) * 0.3
    const h = Math.round(14 + env * 80)
    const color = i < 4 ? 'o' : i % 11 === 0 ? 'o' : i % 5 === 0 ? 't' : 'g'
    return { h, c: color }
  })

  return (
    <section className="sma-mock-wrap" aria-label="App preview">
      <div className="sma-mock">
        <div className="sma-titlebar">
          <div className="sma-traffic"><span /><span /><span /></div>
          <span className="sma-win-title">Save my Audio</span>
          <div className="sma-win-tools" aria-hidden="true">
            <span className="sma-tool-btn"><Layers size={13} /></span>
            <span className="sma-tool-btn"><Sliders size={13} /></span>
          </div>
        </div>

        <div className="sma-mock-body">
          {/* ---- Library ---- */}
          <aside className="sma-side">
            <div className="sma-side-head">
              <span className="sma-side-h">Library</span>
              <span className="sma-collapse" aria-hidden="true">‹</span>
            </div>
            <div className="sma-search">
              <Search size={13} />
              <span>Search videos</span>
            </div>
            <div className="sma-side-item">
              <span className="i"><FileVideo size={14} /></span>
              <div>
                <strong>10 AI Tools to Save Mon…</strong>
                <span>Stereo · AAC · 44100 Hz</span>
              </div>
            </div>
            <div className="sma-side-item active">
              <span className="i"><FileVideo size={14} /></span>
              <div>
                <strong>First Impressions_ Clau…</strong>
                <span>Stereo · AAC · 44100 Hz</span>
              </div>
            </div>
            <div className="sma-dropzone">drag &amp; drop to add</div>
            <div className="sma-side-bottom">
              <button type="button" className="sma-btn sma-btn--primary sm">
                <Upload size={14} /> Import
              </button>
              <button type="button" className="sma-btn sma-btn--ghost sm">
                <Activity size={14} /> Batch Fix
              </button>
            </div>
          </aside>

          {/* ---- Player ---- */}
          <div className="sma-pane">
            <div className="sma-pane-head">
              <div>
                <h3>First Impressions_ Claude 4.8 Opus.mp4</h3>
                <span>Stereo · AAC · 44100 Hz</span>
              </div>
              <span className="sma-tag">Stereo</span>
            </div>

            <div className="sma-player">
              <div className="sma-wave" aria-hidden="true">
                <span className="sma-playhead" />
                <span className="sma-baseline" />
                {bars.map((b, i) => (
                  <span key={i} className={`b ${b.c}`} style={{ height: `${b.h}px` }} />
                ))}
              </div>
              <div className="sma-scrub" aria-hidden="true">
                <span className="sma-scrub-knob" />
              </div>
              <div className="sma-wave-foot">
                <span className="sma-time">00:18 / 07:05</span>
                <div className="sma-transport">
                  <button type="button" className="sma-pill on">
                    <Play size={12} /> Original
                  </button>
                  <button type="button" className="sma-pill">
                    <Sparkles size={12} /> Fixed Preview
                  </button>
                  <button type="button" className="sma-pill">
                    <Square size={11} /> Stop
                  </button>
                </div>
                <span className="sma-foot-note">preview · first 30s</span>
              </div>
            </div>
          </div>

          {/* ---- Inspector ---- */}
          <aside className="sma-inspector">
            <div className="sma-insp-head">
              <span className="sma-side-h">Inspector</span>
              <button type="button" className="sma-btn sma-btn--primary xs">
                <Sparkles size={13} /> Fix Audio
              </button>
            </div>

            <div className="sma-insp-title"><Sparkles size={14} /> Repair Chain</div>
            <div className="sma-seg">
              <span className="on">Keep</span>
              <span>M→S</span>
              <span>S→M</span>
            </div>

            <ChainItem icon={<Waves size={14} />} label="Rumble" on accent="orange" />
            <ChainItem icon={<Sparkles size={14} />} label="Noise Cleanup" on />
            <ChainItem icon={<Square size={14} />} label="Noise Gate" />
            <ChainItem icon={<Mic size={14} />} label="Voice Clarity" on />
            <ChainItem icon={<Gauge size={14} />} label="Compressor" value="3:1" pct={50} on accent="green" />
            <ChainItem icon={<Volume2 size={14} />} label="De-esser" />
            <ChainItem icon={<Volume2 size={14} />} label="Loudness" value="−14 LUFS" pct={70} on accent="green" />
            <ChainItem icon={<Wind size={14} />} label="Limiter" on accent="green" />

            <div className="sma-insp-divider" />

            <div className="sma-insp-title"><Upload size={14} /> Export</div>
            <div className="sma-export-state">
              <h2>Fixed</h2>
              <span>AAC 192k · MOV passthrough</span>
            </div>
            <div className="sma-bitrate">
              <span>160k</span>
              <span className="on">192k</span>
              <span>256k</span>
              <span>320k</span>
            </div>
            <button type="button" className="sma-btn sma-btn--dark full">
              <CheckCircle2 size={15} /> Done · re-export
            </button>
            <span className="sma-reveal">↗ Reveal Export</span>
          </aside>
        </div>
      </div>
    </section>
  )
}

function ChainItem({
  icon,
  label,
  value,
  pct,
  on,
  accent = 'green',
}: {
  icon: ReactNode
  label: string
  value?: string
  pct?: number
  on?: boolean
  accent?: 'green' | 'orange'
}) {
  return (
    <div className={`sma-chain ${on ? 'on' : ''}`}>
      <span className={`ic ${accent}`}>{icon}</span>
      <span className="lb">{label}</span>
      {pct != null ? (
        <span className="sma-slider" aria-hidden="true">
          <span className={`fill ${accent}`} style={{ width: `${pct}%` }} />
          <span className="knob" style={{ left: `calc(${pct}% - 7px)` }} />
        </span>
      ) : (
        <span className="sma-slider-spacer" />
      )}
      {value ? <span className="vl">{value}</span> : <span className="vl muted" />}
      <span className={`chk ${on ? 'on' : ''}`}>{on ? '✓' : ''}</span>
    </div>
  )
}

function Feature({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <article className="sma-feature">
      <span className="sma-feature-ic">{icon}</span>
      <h3>{title}</h3>
      <p>{desc}</p>
    </article>
  )
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <article className="sma-step">
      <span className="sma-step-n">{n}</span>
      <h3>{title}</h3>
      <p>{desc}</p>
    </article>
  )
}
