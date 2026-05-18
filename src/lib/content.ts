// Ko-fi tip jar + shop. This is the main place products are sold.
export const kofiUrl = 'https://ko-fi.com/rachelnocode';
export const kofiShopUrl = 'https://ko-fi.com/rachelnocode/shop';

// Contact email for hire/work inquiries.
export const contactEmail = 'rachel@nocodehuman.ai';

// Social links. Update these handles/URLs as needed.
export const socialLinks = [
  { icon: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/@rachelnocode' },
  { icon: 'x', label: 'X', href: 'https://x.com/rachelnocode' },
] as const;

export const heroBadges = [
  { key: 'badgeEducator', label: 'AI Educator' },
  { key: 'badgeBuilder', label: 'No-Code Builder' },
  { key: 'badgeTemplateMaker', label: 'YouTube Creator' },
] as const;

// Work showcase categories. "All" is the default filter.
export const workCategories = [
  'All',
  'Templates',
  'Websites',
  'Apps',
  'Skill Packs',
  'Prompt Packs',
  'Workflows',
] as const;

// PRODUCTS — placeholder data. Ko-fi blocks automated scraping, so swap these
// for your real products. Each `href` should point to its Ko-fi shop item.
// `price` accepts a string ("$19") or use free: true for free items.
export const products = [
  {
    category: 'Templates',
    title: 'AI Content Calendar',
    blurb: '90-day calendar that drafts, schedules, and repurposes your content.',
    price: '$19',
    free: false,
    href: 'https://ko-fi.com/rachelnocode/shop',
  },
  {
    category: 'Templates',
    title: 'Client Onboarding System',
    blurb: 'Inquiry to kickoff: forms, contracts, automations, welcome kit.',
    price: '$29',
    free: false,
    href: 'https://ko-fi.com/rachelnocode/shop',
  },
  {
    category: 'Websites',
    title: 'Creator Landing Page Kit',
    blurb: 'No-code landing page setup for creators. Branded and ready to ship.',
    price: '$24',
    free: false,
    href: 'https://ko-fi.com/rachelnocode/shop',
  },
  {
    category: 'Apps',
    title: 'Token Usage Tracker',
    blurb: 'Free desktop app to track the AI tokens you already pay for.',
    price: 'Free',
    free: true,
    href: 'https://ko-fi.com/rachelnocode/shop',
  },
  {
    category: 'Apps',
    title: 'Prompt Runner',
    blurb: 'Lightweight app to save, organize, and run your favorite prompts.',
    price: 'Free',
    free: true,
    href: 'https://ko-fi.com/rachelnocode/shop',
  },
  {
    category: 'Skill Packs',
    title: 'Claude Skill Pack: Marketing',
    blurb: 'Drop-in skills that turn Claude into a marketing co-pilot.',
    price: '$15',
    free: false,
    href: 'https://ko-fi.com/rachelnocode/shop',
  },
  {
    category: 'Prompt Packs',
    title: '120+ AI Prompt Library',
    blurb: 'Tested prompts for marketing, ops, research, and creative work.',
    price: 'Free',
    free: true,
    href: 'https://ko-fi.com/rachelnocode/shop',
  },
  {
    category: 'Prompt Packs',
    title: 'Creator Prompt Pack',
    blurb: 'Prompts for scripts, hooks, captions, and content repurposing.',
    price: '$9',
    free: false,
    href: 'https://ko-fi.com/rachelnocode/shop',
  },
  {
    category: 'Workflows',
    title: 'Content Repurposing Workflow',
    blurb: 'Turn one video into a week of posts — automated end to end.',
    price: '$19',
    free: false,
    href: 'https://ko-fi.com/rachelnocode/shop',
  },
  {
    category: 'Workflows',
    title: 'Lead Gen Automation',
    blurb: 'Capture, enrich, and route leads without touching code.',
    price: '$19',
    free: false,
    href: 'https://ko-fi.com/rachelnocode/shop',
  },
] as const;

export const services = [
  {
    icon: 'workflow',
    title: 'AI Workflow Setup',
    titleEs: 'Setup de Workflow IA',
    desc: 'Audit + build a repeatable AI workflow you actually use every week.',
    descEs: 'Auditoría + construcción de un workflow de IA que uses cada semana.',
  },
  {
    icon: 'systems',
    title: 'No-Code Systems',
    titleEs: 'Sistemas No-Code',
    desc: 'Notion, Airtable, Zapier, Make. End-to-end systems wired together.',
    descEs: 'Notion, Airtable, Zapier, Make. Sistemas conectados de inicio a fin.',
  },
  {
    icon: 'template',
    title: 'Custom Builds',
    titleEs: 'Builds a Medida',
    desc: 'Templates, apps, and sites built and branded for your business.',
    descEs: 'Plantillas, apps y sitios creados y personalizados para tu negocio.',
  },
  {
    icon: 'zap',
    title: 'Creator Automation',
    titleEs: 'Automatización para Creadores',
    desc: 'Content repurposing, scheduling, and AI assistants that ship for you.',
    descEs: 'Repurposing de contenido, scheduling y asistentes IA que entregan por ti.',
  },
] as const;
