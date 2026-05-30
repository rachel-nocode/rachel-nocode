export type BlockKind = 'static' | 'dynamic' | 'unknown';

export type PromptBlock = {
  text: string;
  kind: BlockKind;
  reason: string;
};

export type OptimizerResult = {
  blocks: PromptBlock[];
  optimized: string;
  staticTokens: number;
  dynamicTokens: number;
  totalTokens: number;
  cacheEligible: boolean;
  staticPrefixTokens: number;
  needsReorder: boolean;
  tips: string[];
  cacheKeyHint: string;
  apiSnippet: string;
};

const DYNAMIC_PATTERNS: { pattern: RegExp; reason: string }[] = [
  { pattern: /\{\{[^}]+\}\}/, reason: 'template variable ({{…}})' },
  { pattern: /\$\{[^}]+\}/, reason: 'template literal (${…})' },
  { pattern: /\{user[_-]?(input|content|message|query|data)\}/i, reason: 'user input placeholder' },
  { pattern: /\[INSERT[^\]]*\]/i, reason: 'insert placeholder' },
  { pattern: /\[USER[^\]]*\]/i, reason: 'user placeholder' },
  { pattern: /<user[_-]?(input|message|content)?>/i, reason: 'user XML tag' },
  { pattern: /\b(?:today|now|current date|current time)\b/i, reason: 'time-sensitive reference' },
  { pattern: /\b20\d{2}-\d{2}-\d{2}\b/, reason: 'date stamp' },
  { pattern: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i, reason: 'UUID' },
  { pattern: /^User:\s/m, reason: 'user turn in conversation' },
  { pattern: /^Human:\s/m, reason: 'human turn in conversation' },
  { pattern: /^Question:\s/m, reason: 'question block (likely per-request)' },
  { pattern: /^Context:\s/m, reason: 'runtime context block' },
  { pattern: /^Input:\s/m, reason: 'runtime input block' },
  { pattern: /^Document:\s/m, reason: 'document payload (often variable)' },
  { pattern: /^##+\s*(?:User|Input|Query|Context|Request)\b/im, reason: 'dynamic section header' },
];

const STATIC_PATTERNS: { pattern: RegExp; reason: string }[] = [
  { pattern: /^You are (?:a|an)\b/im, reason: 'system persona instruction' },
  { pattern: /^Your (?:role|job|task) is\b/im, reason: 'role instruction' },
  { pattern: /^##+\s*(?:Instructions|Rules|Guidelines|System|Examples?|Tools?|Schema)\b/im, reason: 'static section header' },
  { pattern: /^Example(?:\s+\d+)?:\s/m, reason: 'few-shot example' },
  { pattern: /^Assistant:\s/m, reason: 'assistant example turn' },
  { pattern: /"type"\s*:\s*"function"/, reason: 'tool / function schema' },
  { pattern: /"name"\s*:\s*"[^"]+"/, reason: 'structured schema field' },
  { pattern: /^Always\b/im, reason: 'standing instruction' },
  { pattern: /^Never\b/im, reason: 'standing instruction' },
  { pattern: /^Do not\b/im, reason: 'standing instruction' },
];

/** Rough token estimate (~4 chars per token for English prose). */
export function estimateTokens(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return Math.ceil(trimmed.length / 4);
}

function classifyBlock(text: string): { kind: BlockKind; reason: string } {
  const trimmed = text.trim();
  if (!trimmed) return { kind: 'unknown', reason: 'empty block' };

  for (const { pattern, reason } of DYNAMIC_PATTERNS) {
    if (pattern.test(trimmed)) return { kind: 'dynamic', reason };
  }

  for (const { pattern, reason } of STATIC_PATTERNS) {
    if (pattern.test(trimmed)) return { kind: 'static', reason };
  }

  if (trimmed.length < 120 && /\?$/.test(trimmed.trim())) {
    return { kind: 'dynamic', reason: 'short question (likely user query)' };
  }

  return { kind: 'static', reason: 'reusable instructions or reference content' };
}

function splitIntoBlocks(raw: string): string[] {
  const normalized = raw.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  const byParagraph = normalized.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  if (byParagraph.length > 1) return byParagraph;

  const withHeaders = normalized.split(/(?=^#{1,3}\s)/m).map((part) => part.trim()).filter(Boolean);
  if (withHeaders.length > 1) return withHeaders;

  return [normalized];
}

function orderBlocks(blocks: PromptBlock[]): PromptBlock[] {
  const staticBlocks = blocks.filter((b) => b.kind === 'static');
  const dynamicBlocks = blocks.filter((b) => b.kind === 'dynamic');
  const unknownBlocks = blocks.filter((b) => b.kind === 'unknown');

  return [...staticBlocks, ...unknownBlocks, ...dynamicBlocks];
}

function needsReorder(blocks: PromptBlock[]): boolean {
  let seenDynamic = false;
  for (const block of blocks) {
    if (block.kind === 'dynamic') seenDynamic = true;
    if (seenDynamic && block.kind === 'static') return true;
  }
  return false;
}

function suggestCacheKey(blocks: PromptBlock[]): string {
  const staticText = blocks
    .filter((b) => b.kind === 'static')
    .map((b) => b.text)
    .join('\n')
    .slice(0, 80);

  const slug = staticText
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32);

  return slug || 'my-prompt-prefix';
}

function buildApiSnippet(cacheKey: string, staticTokens: number): string {
  return `// OpenAI Prompt Caching — static prefix first, variable tail last.
// Cache hits need an exact prefix match (1024+ tokens on most models).
{
  "model": "gpt-4.1",
  "messages": [
    { "role": "system", "content": "<STATIC_PREFIX — instructions, tools, examples>" },
    { "role": "user", "content": "<VARIABLE_TAIL — user query, docs, session data>" }
  ],
  "prompt_cache_key": "${cacheKey}"${staticTokens >= 1024 ? '' : '\n  // ⚠ Prefix is under ~1024 tokens — caching may not activate'}
}`;
}

function buildTips(result: {
  cacheEligible: boolean;
  needsReorder: boolean;
  staticPrefixTokens: number;
  dynamicTokens: number;
}): string[] {
  const tips: string[] = [];

  if (result.needsReorder) {
    tips.push('Move all reusable instructions, tool schemas, and few-shot examples to the top. Put user-specific text at the bottom.');
  }

  if (!result.cacheEligible) {
    tips.push('OpenAI activates caching at ~1024 tokens. Pad static instructions with more examples or move bulky tool definitions into the prefix.');
  } else {
    tips.push(`Your static prefix is ~${result.staticPrefixTokens.toLocaleString()} tokens — above the ~1024 token caching threshold.`);
  }

  if (result.dynamicTokens > 0) {
    tips.push('Only the static prefix is cached. Variable tail tokens are billed at full input price every request.');
  }

  tips.push('Use the same prompt_cache_key across requests that share this prefix (stay under ~15 req/min per key to avoid cache overflow).');
  tips.push('Check usage.prompt_tokens_details.cached_tokens in API responses to confirm cache hits.');

  return tips;
}

export function optimizePrompt(raw: string): OptimizerResult {
  const chunks = splitIntoBlocks(raw);
  const blocks: PromptBlock[] = chunks.map((text) => {
    const { kind, reason } = classifyBlock(text);
    return { text, kind, reason };
  });

  const ordered = orderBlocks(blocks);
  const optimized = ordered.map((b) => b.text).join('\n\n');

  const staticTokens = estimateTokens(
    ordered.filter((b) => b.kind === 'static' || b.kind === 'unknown').map((b) => b.text).join('\n\n'),
  );
  const dynamicTokens = estimateTokens(ordered.filter((b) => b.kind === 'dynamic').map((b) => b.text).join('\n\n'));
  const totalTokens = estimateTokens(optimized);
  const staticPrefixTokens = estimateTokens(
    ordered.filter((b) => b.kind !== 'dynamic').map((b) => b.text).join('\n\n'),
  );

  const cacheKeyHint = suggestCacheKey(ordered);

  return {
    blocks: ordered,
    optimized,
    staticTokens,
    dynamicTokens,
    totalTokens,
    cacheEligible: staticPrefixTokens >= 1024,
    staticPrefixTokens,
    needsReorder: needsReorder(blocks),
    tips: buildTips({
      cacheEligible: staticPrefixTokens >= 1024,
      needsReorder: needsReorder(blocks),
      staticPrefixTokens,
      dynamicTokens,
    }),
    cacheKeyHint,
    apiSnippet: buildApiSnippet(cacheKeyHint, staticPrefixTokens),
  };
}

export function estimateSavingsPercent(cachedTokens: number, totalInputTokens: number, requestsPerMonth = 1000): {
  cachedPct: number;
  savingsPct: number;
  note: string;
} {
  if (totalInputTokens === 0) {
    return { cachedPct: 0, savingsPct: 0, note: 'Paste a prompt to estimate savings.' };
  }

  const cachedPct = Math.round((cachedTokens / totalInputTokens) * 100);
  const savingsPct = Math.round(cachedPct * 0.9);

  const note =
    cachedTokens >= 1024
      ? `If this prefix hits cache on every request, you could cut input cost by ~${savingsPct}% on ${requestsPerMonth.toLocaleString()} monthly calls (cached tokens billed at ~10% of input price).`
      : 'Caching kicks in at ~1024 tokens in the prefix — grow static content or split into system + user messages.';

  return { cachedPct, savingsPct, note };
}

export const SAMPLE_PROMPT = `What is the user's question?

You are a senior TypeScript reviewer. Be concise and actionable.

## Rules
- Flag security issues first
- Prefer minimal diffs
- Match existing project style

## Examples
User: Review this fetch wrapper
Assistant: 1) Add timeout + abort. 2) Validate response.ok before json().

{{user_message}}

Context:
{{retrieved_docs}}`;
