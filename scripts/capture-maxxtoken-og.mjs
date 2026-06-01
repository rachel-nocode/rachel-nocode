#!/usr/bin/env node
/**
 * Capture the MaxxToken landing hero as a 1200x630 OG image from the built site.
 * Usage: npm run build && node scripts/capture-maxxtoken-og.mjs
 */

import { spawn } from 'node:child_process'
import { createWriteStream } from 'node:fs'
import { mkdir, stat } from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT = path.join(ROOT, 'public', 'maxxtoken', 'og-v6.png')
const PORT = 4331
const URL = `http://127.0.0.1:${PORT}/maxxtoken`

async function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
          res.resume()
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 500) resolve()
          else reject(new Error(`status ${res.statusCode}`))
        })
        req.on('error', reject)
      })
      return
    } catch {
      await new Promise((r) => setTimeout(r, 400))
    }
  }
  throw new Error(`Timed out waiting for ${url}`)
}

function startPreview() {
  return spawn('npx', ['astro', 'preview', '--port', String(PORT), '--host', '127.0.0.1'], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
}

async function capture() {
  const { chromium } = await import('playwright')

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({
    viewport: { width: 1240, height: 760 },
    deviceScaleFactor: 2,
  })

  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForSelector('.hero')
  await page.waitForSelector('.popover-demo')
  await page.waitForFunction(() => document.fonts.ready)
  await page.waitForTimeout(600)

  await page.addStyleTag({
    content: `
      * { animation: none !important; transition: none !important; }
      html, body { margin: 0; background: #0a0b09 !important; overflow: hidden; }
      .os-menubar { display: none !important; }
      .page { max-width: 1240px; margin: 0 auto; padding: 0 24px; }
      .hero {
        min-height: 630px !important;
        height: 630px !important;
        padding: 28px 4px 24px !important;
        overflow: hidden !important;
        box-sizing: border-box;
      }
      .hero-copy { max-width: 560px; }
      .hero h1 { font-size: 58px !important; line-height: 0.98 !important; margin-top: 16px !important; }
      .hero-copy > p { font-size: 16px !important; margin-top: 18px !important; }
      .hero-actions { margin-top: 22px !important; }
      .hero-features { margin-top: 26px !important; gap: 28px !important; }
      .hero-demo {
        top: 18px !important;
        right: 4px !important;
        transform: scale(0.9);
        transform-origin: top right;
      }
      .demo-caret { display: none !important; }
    `,
  })

  await page.waitForTimeout(200)

  const clip = await page.evaluate(() => {
    const hero = document.querySelector('.hero')
    if (!hero) return { x: 0, y: 0, width: 1200, height: 630 }
    const rect = hero.getBoundingClientRect()
    return {
      x: Math.max(0, Math.round(rect.x)),
      y: Math.max(0, Math.round(rect.y)),
      width: 1200,
      height: 630,
    }
  })

  await mkdir(path.dirname(OUT), { recursive: true })
  await page.screenshot({ path: OUT, clip, type: 'png' })

  await browser.close()
}

async function main() {
  const preview = startPreview()
  preview.stdout?.on('data', () => {})
  preview.stderr?.on('data', () => {})

  try {
    await waitForServer(URL)
    await capture()
    const size = (await stat(OUT)).size
    console.log(`Wrote ${OUT} (${Math.round(size / 1024)} KB)`)
  } finally {
    preview.kill('SIGTERM')
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
