// Maps package names (npm, pip, gem, go, composer) to API slugs we monitor
const PACKAGE_SLUG_MAP: Record<string, string> = {
  // AI
  openai: 'openai',
  '@openai/openai': 'openai',
  anthropic: 'anthropic',
  '@anthropic-ai/sdk': 'anthropic',
  '@anthropic-ai/claude-code': 'anthropic',
  '@huggingface/inference': 'huggingface',
  huggingface_hub: 'huggingface',
  transformers: 'huggingface',
  replicate: 'replicate',
  openrouter: 'openrouter',
  '@openrouter/ai-sdk-provider': 'openrouter',
  groq: 'groq',
  'groq-sdk': 'groq',
  '@mistralai/mistralai': 'mistral',
  mistralai: 'mistral',
  elevenlabs: 'elevenlabs',
  '@elevenlabs/elevenlabs-js': 'elevenlabs',
  'cohere-ai': 'cohere',
  cohere: 'cohere',
  'together-ai': 'together',
  '@together-ai/sdk': 'together',
  '@deepgram/sdk': 'deepgram',
  assemblyai: 'assemblyai',
  '@fal-ai/client': 'falai',
  '@fal-ai/serverless-client': 'falai',

  // Payments
  stripe: 'stripe',
  braintree: 'braintree',
  'paypal-rest-sdk': 'paypal',
  '@paypal/checkout-server-sdk': 'paypal',
  paypalrestsdk: 'paypal',
  'react-native-purchases': 'revenuecat',
  '@revenuecat/purchases-capacitor': 'revenuecat',
  '@paddle/paddle-js': 'paddle',
  'paddle-js': 'paddle',
  '@lemonsqueezy/lemonsqueezy.js': 'lemonsqueezy',
  plaid: 'plaid',
  '@mollie/api-client': 'mollie',

  // DevTools
  '@octokit/rest': 'github',
  '@octokit/core': 'github',
  '@octokit/app': 'github',
  octokit: 'github',
  PyGithub: 'github',
  pygithub: 'github',

  // Cloud
  vercel: 'vercel',

  // Database
  '@supabase/supabase-js': 'supabase',
  '@supabase/ssr': 'supabase',
  supabase: 'supabase',
  firebase: 'firebase',
  'firebase-admin': 'firebase',
  firebase_admin: 'firebase',
  '@planetscale/database': 'planetscale',
  '@neondatabase/serverless': 'neon',
  mongodb: 'mongodb',
  mongoose: 'mongodb',
  '@libsql/client': 'turso',
  convex: 'convex',
  '@upstash/redis': 'upstash',
  '@upstash/ratelimit': 'upstash',
  '@upstash/vector': 'upstash',

  // Auth
  '@auth0/nextjs-auth0': 'auth0',
  '@auth0/auth0-react': 'auth0',
  '@auth0/auth0-spa-js': 'auth0',
  auth0: 'auth0',
  'auth0-python': 'auth0',
  'python-jose': 'auth0',
  '@clerk/nextjs': 'clerk',
  '@clerk/clerk-react': 'clerk',
  '@clerk/backend': 'clerk',
  '@clerk/express': 'clerk',
  '@okta/okta-auth-js': 'okta',
  '@okta/oidc-middleware': 'okta',
  stytch: 'stytch',
  '@stytch/vanilla-js': 'stytch',

  // Communication
  resend: 'resend',
  '@sendgrid/mail': 'sendgrid',
  '@sendgrid/client': 'sendgrid',
  sendgrid: 'sendgrid',
  twilio: 'twilio',
  postmark: 'postmark',
  '@postmark/postmark': 'postmark',
  'mailgun.js': 'mailgun',
  'mailgun-js': 'mailgun',
  pusher: 'pusher',
  'pusher-js': 'pusher',
  ably: 'ably',
  '@slack/web-api': 'slack',
  '@slack/bolt': 'slack',
  'slack-sdk': 'slack',
  'discord.js': 'discord',
  'discord-api-types': 'discord',
  'discord.py': 'discord',
  'discord-py': 'discord',

  // Search
  algoliasearch: 'algolia',
  '@algolia/client-search': 'algolia',
  '@pinecone-database/pinecone': 'pinecone',

  // Monitoring
  '@sentry/node': 'sentry',
  '@sentry/react': 'sentry',
  '@sentry/nextjs': 'sentry',
  '@sentry/browser': 'sentry',
  'dd-trace': 'datadog',
  'datadog-metrics': 'datadog',

  // Analytics
  'posthog-js': 'posthog',
  'posthog-node': 'posthog',
  mixpanel: 'mixpanel',
  'mixpanel-browser': 'mixpanel',
  '@amplitude/analytics-browser': 'amplitude',
  '@amplitude/node': 'amplitude',
  '@segment/analytics-node': 'segment',
  'analytics-node': 'segment',
  '@segment/analytics-next': 'segment',

  // Media & Storage
  '@mux/mux-node': 'mux',
  '@mux/mux-player-react': 'mux',
  cloudinary: 'cloudinary',
  '@cloudinary/url-gen': 'cloudinary',
  'mapbox-gl': 'mapbox',
  '@mapbox/mapbox-sdk': 'mapbox',

  // Cloud
  'aws-sdk': 'aws',
  '@aws-sdk/client-s3': 'aws',
  '@aws-sdk/client-lambda': 'aws',
  '@google-cloud/storage': 'gcp',
  '@google-cloud/firestore': 'gcp',
  '@azure/storage-blob': 'azure',
  '@azure/identity': 'azure',
  netlify: 'netlify',
  '@netlify/functions': 'netlify',

  // Productivity
  '@notionhq/client': 'notion',
  'notion-client': 'notion',
  '@linear/sdk': 'linear',

  // Commerce
  '@shopify/shopify-api': 'shopify',
  '@shopify/app-bridge': 'shopify',
  'shopify-api-node': 'shopify',
  shopify: 'shopify',
}

// Normalise a package name for lookup (lowercase, strip version suffixes)
function normalise(name: string): string {
  return name.trim().toLowerCase().replace(/[>=<~^!].*$/, '').trim()
}

function matchPackage(name: string): string | null {
  return PACKAGE_SLUG_MAP[name] ?? PACKAGE_SLUG_MAP[normalise(name)] ?? null
}

export interface DetectionResult {
  slugs: string[]
  sources: Record<string, string[]> // slug → package names that triggered it
  repoName?: string
}

// --- Parsers ---

function parsePackageJson(content: string): string[] {
  try {
    const pkg = JSON.parse(content)
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.peerDependencies,
    }
    return Object.keys(allDeps)
  } catch {
    return []
  }
}

function parseRequirementsTxt(content: string): string[] {
  return content
    .split('\n')
    .map((line) => line.split(/[>=<!\[;#]/)[0].trim())
    .filter(Boolean)
}

function parsePipfile(content: string): string[] {
  const packages: string[] = []
  let inSection = false
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (trimmed === '[packages]' || trimmed === '[dev-packages]') {
      inSection = true
      continue
    }
    if (trimmed.startsWith('[') && inSection) {
      inSection = false
    }
    if (inSection && trimmed && !trimmed.startsWith('#')) {
      packages.push(trimmed.split('=')[0].trim().replace(/['"]/g, ''))
    }
  }
  return packages
}

function parseGemfile(content: string): string[] {
  const packages: string[] = []
  for (const line of content.split('\n')) {
    const match = line.match(/^\s*gem\s+['"]([^'"]+)['"]/)
    if (match) packages.push(match[1])
  }
  return packages
}

function parseGoMod(content: string): string[] {
  const packages: string[] = []
  for (const line of content.split('\n')) {
    const match = line.trim().match(/^([^\s]+)\s+v/)
    if (match && !match[1].startsWith('//')) {
      packages.push(match[1].split('/').pop() ?? match[1])
    }
  }
  return packages
}

function parseComposerJson(content: string): string[] {
  try {
    const pkg = JSON.parse(content)
    return Object.keys({ ...pkg.require, ...pkg['require-dev'] })
  } catch {
    return []
  }
}

const FILE_PARSERS: Array<{
  path: string
  parser: (content: string) => string[]
}> = [
  { path: 'package.json', parser: parsePackageJson },
  { path: 'requirements.txt', parser: parseRequirementsTxt },
  { path: 'Pipfile', parser: parsePipfile },
  { path: 'Gemfile', parser: parseGemfile },
  { path: 'go.mod', parser: parseGoMod },
  { path: 'composer.json', parser: parseComposerJson },
]

// Fetch a raw file from GitHub — supports public (raw.githubusercontent.com) and
// private repos (GitHub Contents API with token)
async function fetchGitHubFile(
  owner: string,
  repo: string,
  filePath: string,
  token?: string | null
): Promise<string | null> {
  for (const branch of ['main', 'master']) {
    try {
      let url: string
      let headers: Record<string, string> = {
        'User-Agent': 'Travo-StackDetector/1.0',
      }

      if (token) {
        // GitHub Contents API — works for both public and private repos
        url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`
        headers['Authorization'] = `Bearer ${token}`
        headers['Accept'] = 'application/vnd.github.v3+json'

        const res = await fetch(url, {
          headers,
          signal: AbortSignal.timeout(5000),
        })
        if (!res.ok) continue
        const data = await res.json()
        if (data.content) {
          return Buffer.from(data.content, 'base64').toString('utf-8')
        }
      } else {
        // Public repos via raw URL
        url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`
        const res = await fetch(url, {
          headers,
          signal: AbortSignal.timeout(5000),
        })
        if (res.ok) return res.text()
      }
    } catch {
      // try next branch
    }
  }
  return null
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.trim().match(/github\.com\/([^/]+)\/([^/\s?#]+)/)
  if (!match) return null
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') }
}

export async function detectStackFromGitHub(
  repoUrl: string,
  token?: string | null
): Promise<DetectionResult> {
  const parsed = parseGitHubUrl(repoUrl)
  if (!parsed) return { slugs: [], sources: {} }

  const { owner, repo } = parsed
  const sources: Record<string, string[]> = {}

  await Promise.all(
    FILE_PARSERS.map(async ({ path, parser }) => {
      const content = await fetchGitHubFile(owner, repo, path, token)
      if (!content) return

      const packages = parser(content)
      for (const pkg of packages) {
        const slug = matchPackage(pkg)
        if (slug) {
          if (!sources[slug]) sources[slug] = []
          if (!sources[slug].includes(pkg)) sources[slug].push(pkg)
        }
      }
    })
  )

  return { slugs: Object.keys(sources), sources, repoName: repo }
}

export interface GitHubRepo {
  name: string
  fullName: string
  isPrivate: boolean
  updatedAt: string
}

export async function listGitHubRepos(token: string): Promise<GitHubRepo[]> {
  try {
    const res = await fetch(
      'https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': 'Travo-StackDetector/1.0',
          Accept: 'application/vnd.github.v3+json',
        },
        signal: AbortSignal.timeout(8000),
      }
    )
    if (!res.ok) return []
    const repos = await res.json()
    return repos.map((r: { name: string; full_name: string; private: boolean; updated_at: string }) => ({
      name: r.name,
      fullName: r.full_name,
      isPrivate: r.private,
      updatedAt: r.updated_at,
    }))
  } catch {
    return []
  }
}
