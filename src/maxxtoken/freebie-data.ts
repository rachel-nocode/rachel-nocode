export type BuildingGoal = 'app' | 'content' | 'client' | 'learning'

export type FreebieProvider = {
  id: string
  name: string
  monthly: number
  accent: string
}

export const freebieProviders: FreebieProvider[] = [
  { id: 'claude', name: 'Claude', monthly: 200, accent: '#ff7d4d' },
  { id: 'chatgpt', name: 'ChatGPT', monthly: 200, accent: '#19c37d' },
  { id: 'cursor', name: 'Cursor', monthly: 60, accent: '#cfd2d6' },
  { id: 'gemini', name: 'Gemini', monthly: 20, accent: '#4f8cff' },
  { id: 'kimi', name: 'Kimi', monthly: 15, accent: '#a78bfa' },
  { id: 'grok', name: 'Grok', monthly: 99, accent: '#f4f5f2' },
  { id: 'copilot', name: 'Copilot', monthly: 10, accent: '#4cc3c9' },
  { id: 'perplexity', name: 'Perplexity', monthly: 20, accent: '#4cc3c9' },
]

export type StackLine = {
  provider: FreebieProvider
  usedPct: number
  spent: number
  left: number
}

export function buildStackLines(selectedIds: string[], usedPct: number): StackLine[] {
  return freebieProviders
    .filter((provider) => selectedIds.includes(provider.id))
    .map((provider) => {
      const clamped = Math.max(0, Math.min(98, usedPct))
      const spent = provider.monthly * (clamped / 100)
      return {
        provider,
        usedPct: clamped,
        spent,
        left: provider.monthly - spent,
      }
    })
}

export function stackTotals(lines: StackLine[]) {
  const monthly = lines.reduce((sum, line) => sum + line.provider.monthly, 0)
  const spent = lines.reduce((sum, line) => sum + line.spent, 0)
  const left = monthly - spent
  return { monthly, spent, left }
}

export function receiptVerdict(usedPct: number) {
  if (usedPct >= 70) return { stars: 4, text: 'Solid maxx. Keep forging.' }
  if (usedPct >= 45) return { stars: 2, text: 'Donating to Big AI. Fix it.' }
  return { stars: 1, text: 'Emergency. You are feeding the reset.' }
}

const missions: Record<BuildingGoal, string[]> = {
  app: [
    'Scope one half-baked feature into a 3-step build plan you can ship tonight.',
    'Ask for 3 edge-case tests before your reset window closes.',
    'Turn a bug list into a ranked fix queue with copy-paste prompts.',
  ],
  content: [
    'Turn a messy voice note into a launch thread + 5 landing-page bullets.',
    'Draft 3 hook variants for the post you keep postponing.',
    'Repurpose one doc into a carousel outline + CTA.',
  ],
  client: [
    'Draft a SOW + timeline from a rough client brief.',
    'Write 5 status-update lines that make the project feel in motion.',
    'Turn meeting notes into next-step emails you can send today.',
  ],
  learning: [
    'Build a 10-prompt practice pack for the skill you are stalling on.',
    'Summarize one long doc into a cheat sheet + quiz questions.',
    'Create a weekend learning sprint with 3 concrete outputs.',
  ],
}

export function pickMission(goal: BuildingGoal, seed: number) {
  const options = missions[goal]
  return options[seed % options.length]
}

export function pickFullestLine(lines: StackLine[]) {
  if (lines.length === 0) return null
  return lines.reduce((fullest, line) => (line.left > fullest.left ? line : fullest))
}

export function buildReceiptShareText(leftTotal: number, usedPct: number) {
  const amount = moneyRound(leftTotal)
  const seed = Math.round(leftTotal) + usedPct

  if (usedPct >= 70) {
    const lines = [
      `Rare W: I'm actually using my subs. Still flexing the ${amount} receipt because tokenmaxxing is a lifestyle 🧾`,
      `Not donating to the reset for once. ${amount} left and we're cooking. maxxtoken receipt attached ⚡`,
    ]
    return `${lines[seed % lines.length]}\n\nrachelnocode.com/maxxtoken`
  }

  if (usedPct >= 45) {
    const lines = [
      `Big AI got ${amount} from me this cycle. Not great, not terrible. Next reset I'm tokenmaxxing harder 🧾`,
      `Half my stack resets soon and I still left ${amount} on the table. Mid maxx at best. Receipt:`,
    ]
    return `${lines[seed % lines.length]}\n\nrachelnocode.com/maxxtoken`
  }

  const lines = [
    `I gave Big AI ${amount} in unused tokens this cycle like it was a tip jar 💀 MaxxToken receipt attached. Next reset I'm tokenmaxxing or I'm cooked.`,
    `POV: 5 AI subs and my usage bar looks like a loading screen. Donated ${amount} to the reset. Receipt attached — no more free lunches for Big AI 🧾`,
    `Not me funding Big AI's GPU budget at ${usedPct}% usage while ${amount} expires in 48h. Embarrassing. Tokenmaxxing arc starts now ⚡`,
    `I didn't "forget to use Claude." I straight up wired ${amount} to Big AI this cycle. Here's the receipt. Next time I maxx before reset.`,
  ]
  return `${lines[seed % lines.length]}\n\nrachelnocode.com/maxxtoken`
}

export function buildMissionShareText(
  providerName: string,
  left: number,
  mission: string,
  seed: number,
) {
  const amount = moneyRound(left)
  const openers = [
    `${providerName} still had ${amount} rotting before reset and my brain said "rest." MaxxToken said absolutely not:`,
    `Reset window closing. ${amount} left on ${providerName}. One mission routed before Big AI gets it for free:`,
    `POV: about to let ${amount} on ${providerName} evaporate at reset. MaxxToken handed me one job instead:`,
  ]

  return `${openers[seed % openers.length]} ${mission}\n\nrachelnocode.com/maxxtoken`
}

function moneyRound(value: number) {
  return `$${Math.round(value)}`
}
