import { useEffect, useMemo, useState } from 'react'
import { Check, Copy, Layers, Zap } from 'lucide-react'
import {
  SAMPLE_PROMPT,
  estimateSavingsPercent,
  estimateTokens,
  optimizePrompt,
  type BlockKind,
  type PromptBlock,
} from './prompt-cache-optimizer'
import './pcache-freebie.css'

const kindLabel: Record<BlockKind, string> = {
  static: 'Static prefix',
  dynamic: 'Variable tail',
  unknown: 'Likely static',
}

function BlockPreview({ block }: { block: PromptBlock }) {
  return (
    <article className={`pcache-block pcache-block--${block.kind}`}>
      <header className="pcache-block-head">
        <span className="pcache-block-kind">{kindLabel[block.kind]}</span>
        <span className="pcache-block-reason">{block.reason}</span>
        <span className="pcache-block-tokens">~{estimateTokens(block.text)} tok</span>
      </header>
      <pre className="pcache-block-text">{block.text}</pre>
    </article>
  )
}

export function PromptCacheFreebie() {
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState<'prompt' | 'snippet' | null>(null)
  const [monthlyRequests, setMonthlyRequests] = useState(500)

  useEffect(() => {
    if (copied === null) return
    const id = window.setTimeout(() => setCopied(null), 2000)
    return () => window.clearTimeout(id)
  }, [copied])

  const result = useMemo(() => optimizePrompt(input), [input])
  const savings = useMemo(
    () => estimateSavingsPercent(result.staticPrefixTokens, result.totalTokens, monthlyRequests),
    [result.staticPrefixTokens, result.totalTokens, monthlyRequests],
  )

  const copyText = async (text: string, kind: 'prompt' | 'snippet') => {
    await navigator.clipboard.writeText(text)
    setCopied(kind)
  }

  return (
    <div className="pcache">
      <p className="pcache-intro">
        OpenAI caches exact prompt prefixes (1024+ tokens) and can cut cached input cost by up to 90%. Paste a long
        prompt — we reorder static instructions ahead of variable content and estimate what you could save.{' '}
        <a
          href="https://developers.openai.com/api/docs/guides/prompt-caching"
          target="_blank"
          rel="noopener noreferrer"
        >
          OpenAI docs →
        </a>
      </p>

      <div className="pcache-stats" aria-label="Token estimates">
        <div className="pcache-stat">
          <span>Total (est.)</span>
          <strong>{result.totalTokens.toLocaleString()}</strong>
        </div>
        <div className="pcache-stat pcache-stat--green">
          <span>Cacheable prefix</span>
          <strong>{result.staticPrefixTokens.toLocaleString()}</strong>
          <em>{result.cacheEligible ? 'eligible' : 'under 1024'}</em>
        </div>
        <div className="pcache-stat pcache-stat--warn">
          <span>Variable tail</span>
          <strong>{result.dynamicTokens.toLocaleString()}</strong>
        </div>
        <div className="pcache-stat pcache-stat--save">
          <span>Est. cost cut</span>
          <strong>{result.cacheEligible ? `~${savings.savingsPct}%` : '—'}</strong>
        </div>
      </div>

      <div className="pcache-grid">
        <div className="freebies-panel pcache-panel">
          <div className="pcache-panel-head">
            <p className="freebies-label">Your prompt</p>
            <button type="button" className="pcache-ghost" onClick={() => setInput(SAMPLE_PROMPT)}>
              Load example
            </button>
          </div>
          <textarea
            className="pcache-textarea"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Paste system prompt, instructions, or message content…"
            spellCheck={false}
          />
        </div>

        <div className="freebies-panel pcache-panel">
          <div className="pcache-panel-head">
            <p className="freebies-label">Cache-friendly layout</p>
            <button
              type="button"
              className="pcache-ghost"
              disabled={!result.optimized}
              onClick={() => copyText(result.optimized, 'prompt')}
            >
              {copied === 'prompt' ? <Check size={14} /> : <Copy size={14} />}
              {copied === 'prompt' ? 'Copied' : 'Copy'}
            </button>
          </div>

          {result.optimized ? (
            <div className="pcache-blocks">
              {result.blocks.map((block, index) => (
                <BlockPreview key={`${block.kind}-${index}`} block={block} />
              ))}
            </div>
          ) : (
            <div className="pcache-empty">
              <Layers size={24} strokeWidth={1.5} aria-hidden="true" />
              <p>Optimized output shows up here.</p>
            </div>
          )}
        </div>
      </div>

      <div className="pcache-savings">
        <p className="freebies-label">
          <Zap size={14} aria-hidden="true" />
          Savings calculator
        </p>
        <label className="freebies-slider-label" htmlFor="pcache-requests">
          API calls per month
          <strong>{monthlyRequests.toLocaleString()}</strong>
        </label>
        <input
          id="pcache-requests"
          className="freebies-slider"
          type="range"
          min={50}
          max={50000}
          step={50}
          value={monthlyRequests}
          onChange={(event) => setMonthlyRequests(Number(event.target.value))}
        />
        <p className="pcache-note">{savings.note}</p>
      </div>

      <div className="pcache-meta">
        <div className="pcache-meta-card">
          <p className="freebies-label">prompt_cache_key</p>
          <code className="pcache-key">{result.cacheKeyHint}</code>
        </div>
        <div className="pcache-meta-card">
          <div className="pcache-panel-head">
            <p className="freebies-label">API shape</p>
            <button
              type="button"
              className="pcache-ghost"
              disabled={!result.apiSnippet}
              onClick={() => copyText(result.apiSnippet, 'snippet')}
            >
              {copied === 'snippet' ? 'Copied' : 'Copy snippet'}
            </button>
          </div>
          <pre className="pcache-snippet">{result.apiSnippet}</pre>
        </div>
      </div>

      <ul className="pcache-tips">
        {result.tips.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
    </div>
  )
}
