#!/usr/bin/env node
/**
 * Generate the Save my Audio OG image (1200x630) from a self-contained HTML
 * layout that matches the landing page (cream paper + Patrick Hand headline).
 * No dev server needed — renders the HTML directly in a headless browser.
 *
 * Usage: node scripts/generate-savemyaudio-og.mjs
 */

import { readFile, mkdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const ICON = path.join(ROOT, 'public', 'savemyaudio', 'icon.png')
const OUT = path.join(ROOT, 'public', 'savemyaudio', 'og.png')

function buildHtml(iconDataUri) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Patrick+Hand&display=swap" rel="stylesheet" />
<style>
  :root {
    --bg: #f1ebdf;
    --paper-2: #fbf8f0;
    --line: rgba(32, 30, 26, 0.18);
    --ink: #211f1a;
    --text: #211f1a;
    --muted: #847c6f;
    --green-2: #4f8a5d;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; }
  body {
    font-family: Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    color: var(--text);
    background:
      radial-gradient(60% 60% at 0% 0%, rgba(95, 158, 110, 0.12), transparent 70%),
      radial-gradient(60% 60% at 100% 100%, rgba(217, 154, 78, 0.12), transparent 70%),
      var(--bg);
    -webkit-font-smoothing: antialiased;
    overflow: hidden;
    position: relative;
  }
  .frame {
    position: absolute;
    inset: 0;
    padding: 72px 80px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .brand .mark {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    overflow: hidden;
  }
  .brand .mark img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .brand .name {
    font-family: "Patrick Hand", cursive;
    font-size: 32px;
    color: var(--ink);
  }
  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    align-self: flex-start;
    padding: 9px 18px;
    border: 1.5px solid var(--line);
    border-radius: 999px;
    background: var(--paper-2);
    font-size: 17px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
  }
  h1 {
    font-family: "Patrick Hand", cursive;
    font-weight: 400;
    font-size: 148px;
    line-height: 0.96;
    margin: 26px 0 0;
    color: var(--ink);
  }
  h1 .hl { color: var(--green-2); }
  .sub {
    margin-top: 26px;
    font-size: 30px;
    line-height: 1.4;
    color: var(--muted);
    max-width: 880px;
  }
  .pills {
    display: flex;
    gap: 14px;
  }
  .pills span {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    padding: 12px 22px;
    border: 1.5px solid var(--line);
    border-radius: 999px;
    background: var(--paper-2);
    font-size: 21px;
    font-weight: 600;
    color: var(--ink);
  }
  .dot { width: 11px; height: 11px; border-radius: 50%; background: var(--green-2); }
  .mid { display: flex; flex-direction: column; }
</style>
</head>
<body>
  <div class="frame">
    <div class="brand">
      <span class="mark"><img src="${iconDataUri}" alt="" /></span>
      <span class="name">Save my Audio</span>
    </div>
    <div class="mid">
      <span class="eyebrow">macOS · video audio fixer</span>
      <h1>Bad audio. <span class="hl">Fixed.</span></h1>
      <p class="sub">Drop any video. Lift the levels, kill the rumble, clean the noise, and export a ready-to-post file — all on your Mac.</p>
    </div>
    <div class="pills">
      <span><i class="dot"></i> Apple Silicon</span>
      <span><i class="dot"></i> 100% local</span>
      <span><i class="dot"></i> Pay what you want</span>
    </div>
  </div>
</body>
</html>`
}

async function main() {
  const { chromium } = await import('playwright')

  const iconBuf = await readFile(ICON)
  const iconDataUri = `data:image/png;base64,${iconBuf.toString('base64')}`
  const html = buildHtml(iconDataUri)

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 2,
  })

  await page.setContent(html, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => document.fonts.ready)
  await page.waitForTimeout(400)

  await mkdir(path.dirname(OUT), { recursive: true })
  await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: 1200, height: 630 }, type: 'png' })

  await browser.close()

  const size = (await stat(OUT)).size
  console.log(`Wrote ${OUT} (${Math.round(size / 1024)} KB)`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
