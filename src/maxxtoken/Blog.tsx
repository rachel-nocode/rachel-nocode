import { useState } from 'react'
import type { JSX, MouseEvent } from 'react'
import { POLAR_CHECKOUT_URL } from './PolarDownloadButton'
import './Blog.css'

interface BlogProps {
  // Same Polar checkout handler the landing-page download buttons use.
  onDownload: (event: MouseEvent) => void
}

export type { BlogProps }

// Article registry — add new entries here as the blog grows. Each card on the
// index links to its `body` component.
interface ArticleMeta {
  slug: string
  kicker: string
  title: string
  excerpt: string
  readTime: string
  tags: string
  body: (props: { onDownload: (event: MouseEvent) => void }) => JSX.Element
}

const ARTICLES: ArticleMeta[] = [
  {
    slug: 'cut-ai-agent-context',
    kicker: 'Short guide',
    title: 'Cut AI agent context without making it weird',
    excerpt:
      'Claude Code, Codex, and Cursor waste tokens in predictable places. The biggest wins come from compressing command output, tool schemas, file reads, and old session history.',
    readTime: '~4 min read',
    tags: 'Claude Code · Codex · Cursor',
    body: ContextCuttingArticle,
  },
]

// Blog tab: card index of articles. Clicking a card opens that article; a back
// link returns to the index. Built to scale to many articles.
export function Blog({ onDownload }: BlogProps) {
  const [openSlug, setOpenSlug] = useState<string | null>(null)
  const active = ARTICLES.find((a) => a.slug === openSlug) ?? null

  if (active) {
    const Body = active.body
    return (
      <div className="mt-blog">
        <main className="wrap">
          <button type="button" className="blog-back" onClick={() => setOpenSlug(null)}>
            ← All articles
          </button>
        </main>
        <Body onDownload={onDownload} />
      </div>
    )
  }

  return (
    <div className="mt-blog">
      <main className="wrap">
        <div className="kicker">Blog</div>
        <h1 className="blog-index-title">Token-maxxing notes</h1>
        <p className="lede">Practical guides on cutting AI agent costs without the cargo cult.</p>
        <div className="blog-cards">
          {ARTICLES.map((a) => (
            <button
              key={a.slug}
              type="button"
              className="blog-card"
              onClick={() => setOpenSlug(a.slug)}
            >
              <span className="blog-card-kicker">{a.kicker}</span>
              <span className="blog-card-title">{a.title}</span>
              <span className="blog-card-excerpt">{a.excerpt}</span>
              <span className="blog-card-meta">
                {a.readTime} · {a.tags}
              </span>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}

// Long-form article — content mirrors blog-cut-agent-context.html.
function ContextCuttingArticle({ onDownload }: BlogProps) {
  return (
    <>
      <main className="wrap">
        <div className="kicker">Short guide</div>
        <h1>Cut AI agent context without making it weird</h1>
        <p className="lede">
          Claude Code, Codex, and Cursor waste tokens in predictable places. The biggest wins come
          from compressing command output, tool schemas, file reads, and old session history.
        </p>
        <div className="byline">
          <span>maxxToken team</span>
          <span>·</span>
          <span>~4 min read</span>
          <span>·</span>
          <span>Claude Code · Codex · Cursor</span>
        </div>

        <p>
          Most context waste is not the assistant's wording. It is <strong>tool output</strong>,{' '}
          <strong>tool schemas</strong>, <strong>full files read when only a few lines matter</strong>,
          and <strong>setup text sent again every turn</strong>.
        </p>

        <p>Here are the useful levers, in plain English.</p>

        <div className="callout warn">
          <div className="label">Keep expectations sane</div>
          <p>
            Shorter assistant replies help, but only a little. They may cut prose a lot, yet total
            session savings are often around <strong>4–5%</strong>. Tool output, schemas, and file
            reads matter more.
          </p>
        </div>

        <h2>
          <span className="num">—</span>What saves tokens
        </h2>
        <table>
          <thead>
            <tr>
              <th>Mechanism</th>
              <th>Lead tool</th>
              <th>Realistic win</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Tool-output compression</td>
              <td>RTK</td>
              <td className="win">60–90%</td>
            </tr>
            <tr>
              <td>MCP schema compression</td>
              <td>mcp-compressor</td>
              <td className="win">70–97%*</td>
            </tr>
            <tr>
              <td>Retrieval instead of full files</td>
              <td>claude-context, Aider repo-map</td>
              <td className="win">40–80%</td>
            </tr>
            <tr>
              <td>Session memory / compaction</td>
              <td>claude-mem, /compact</td>
              <td className="win">60–80%</td>
            </tr>
            <tr>
              <td>Prompt compression</td>
              <td>LLMLingua</td>
              <td className="win">up to 20×</td>
            </tr>
            <tr>
              <td>Repo packing</td>
              <td>Repomix</td>
              <td className="win">~70%</td>
            </tr>
            <tr>
              <td>Data-format swap</td>
              <td>TOON</td>
              <td className="win">30–60%</td>
            </tr>
            <tr>
              <td>Shorter replies</td>
              <td>caveman</td>
              <td className="win">~4–5%†</td>
            </tr>
          </tbody>
        </table>
        <p className="muted" style={{ fontSize: '13.5px' }}>
          *on tool-schema tokens specifically. †session-wide; ~60% on prose alone.
        </p>

        <h2>
          <span className="num">1</span>Compress noisy command output{' '}
          <span className="tier hi">highest leverage</span>
        </h2>
        <p>
          Builds, installs, tests, and git commands can dump hundreds of lines into context. Most of
          that text is not useful.
        </p>

        <div className="tool">
          <h3>
            RTK — Rust Token Killer <span className="stars">github.com/rtk-ai/rtk</span>
          </h3>
          <p className="tooltype">CLI proxy + agent hook · works with any repo</p>
          <p>
            A small CLI that compresses shell output before it reaches the model. It keeps errors and
            useful summaries, then drops repeated or low-value noise.
          </p>
          <pre>
            <span className="c"># 1. install once</span>
            {'\n'}brew install rtk{'\n'}
            <span className="c">
              # or: curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
            </span>
            {'\n\n'}
            <span className="c"># 2. wire it into your agent</span>
            {'\n'}rtk init -g{'                          '}
            <span className="c"># Claude Code (restart after)</span>
            {'\n'}rtk init --global --agent cursor{'     '}
            <span className="c"># Cursor (restart after)</span>
            {'\n'}rtk init --global --codex{'            '}
            <span className="c"># Codex (rules file)</span>
          </pre>
          <p className="muted" style={{ fontSize: '14.5px' }}>
            <strong>Good to know:</strong> this works best for shell commands. Native Read/Grep/Glob
            style tools may bypass it.
          </p>
        </div>

        <h2>
          <span className="num">2</span>Compress MCP tool schemas{' '}
          <span className="tier hi">highest leverage</span>
        </h2>
        <p>
          MCP servers send tool definitions into the conversation. If you have several servers on,
          those schemas can become a large hidden cost.
        </p>
        <div className="tool">
          <h3>
            mcp-compressor <span className="stars">Atlassian Labs</span>
          </h3>
          <p className="tooltype">MCP proxy</p>
          <p>
            Wraps MCP servers and shrinks their tool definitions. If you use several MCP servers, this
            can be one of the biggest wins.
          </p>
        </div>
        <p>
          Also useful: lazy tool loading. The agent loads only the tools it needs instead of every
          schema at startup.
        </p>

        <h2>
          <span className="num">3</span>Retrieve snippets instead of dumping files{' '}
          <span className="tier hi">highest leverage</span>
        </h2>
        <p>
          Reading whole files is expensive. A repo map or search index lets the agent pull only the
          relevant lines.
        </p>
        <div className="tool">
          <h3>
            claude-context <span className="stars">Zilliz · github.com/zilliztech/claude-context</span>
          </h3>
          <p className="tooltype">MCP server</p>
          <p>
            Adds keyword and semantic search for your codebase. The agent can ask for relevant
            snippets instead of loading full files.
          </p>
        </div>
        <div className="tool">
          <h3>
            Aider repo-map <span className="stars">built into Aider</span>
          </h3>
          <p className="tooltype">technique / built-in</p>
          <p>
            Builds a compact map of the repo, then spends a fixed token budget on the most relevant
            parts. <a href="https://github.com/pdavis68/RepoMapper">RepoMapper</a> offers a similar
            idea as an MCP server.
          </p>
        </div>

        <h2>
          <span className="num">4</span>Compact and remember across sessions{' '}
          <span className="tier mid">situational</span>
        </h2>
        <p>Long sessions get messy. Compaction keeps the useful parts and removes old noise.</p>
        <p>
          <strong>
            <a href="https://github.com/thedotmack/claude-mem">claude-mem</a>
          </strong>{' '}
          stores compressed session memory.{' '}
          <strong>
            <a href="https://github.com/exploreborders/claude-dcp">Claude DCP</a>
          </strong>{' '}
          prunes context during a session. Claude Code's built-in <code>/compact</code> is also worth
          using before the window gets full.
        </p>
        <p>
          Subagents help too: they can read files and run tests, then return only the short answer to
          the main thread.
        </p>

        <h2>
          <span className="num">5</span>The rest of the toolbox{' '}
          <span className="tier mid">pick by task</span>
        </h2>
        <div className="tool">
          <h3>
            Repomix <span className="stars">~22k★ · github.com/yamadashy/repomix</span>
          </h3>
          <p className="tooltype">CLI + MCP server</p>
          <p>
            Packs a repo into one AI-friendly file. Useful when you need to hand a whole project to a
            long-context model.
          </p>
        </div>
        <div className="tool">
          <h3>
            LLMLingua <span className="stars">Microsoft · github.com/microsoft/LLMLingua</span>
          </h3>
          <p className="tooltype">library</p>
          <p>
            Uses a smaller model to remove low-value tokens. Best for RAG pipelines and custom agents.
          </p>
        </div>
        <div className="tool">
          <h3>
            TOON — Token-Oriented Object Notation{' '}
            <span className="stars">github.com/toon-format/toon</span>
          </h3>
          <p className="tooltype">data format</p>
          <p>
            A compact JSON-like format. Good for repeated arrays of objects, especially tool output
            and RAG payloads.
          </p>
        </div>
        <div className="tool">
          <h3>
            caveman <span className="stars">~41k★ · github.com/juliusbrussee/caveman</span>
          </h3>
          <p className="tooltype">output-style skill</p>
          <p>
            A terse output style. It cuts reply prose, but it does not replace the bigger fixes above.
          </p>
        </div>

        <hr />

        <h2>
          <span className="num">★</span>Where to start
        </h2>
        <p>If you do nothing else, start here:</p>
        <ol className="muted">
          <li>
            <strong>Turn off MCP servers you are not using.</strong> Compress the rest.
          </li>
          <li>
            <strong>Install RTK</strong> if your agent runs lots of commands.
          </li>
          <li>
            <strong>Add repo search or a repo map</strong> so the agent reads fewer full files.
          </li>
        </ol>
        <p>
          Then add compaction and shorter replies. Skip prompt compression unless you are building
          your own pipeline.
        </p>

        <div className="cta">
          <h2>See where your tokens go</h2>
          <p>
            maxxToken tracks Claude Code, Codex, Cursor, Gemini, and more from your Mac menubar. Usage
            stays local. The Optimize page shows where you can save tokens and money.
          </p>
          <a className="btn" href={POLAR_CHECKOUT_URL} onClick={onDownload}>
            Get maxxToken
          </a>
        </div>

        <p className="blog-footnote">
          Tool details change. Verify before relying on exact numbers. maxxToken is independent and
          not affiliated with the projects above.
        </p>
      </main>
    </>
  )
}
