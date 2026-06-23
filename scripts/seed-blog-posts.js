const fs = require('fs')
const path = require('path')
const vm = require('vm')
const crypto = require('crypto')
const ts = require('typescript')

const rootDir = path.resolve(__dirname, '..')
const hardTimeout = setTimeout(() => {
  console.error('Seed script hard timeout reached.')
  process.exit(2)
}, 60000)

function loadEnvFile(fileName) {
  const filePath = path.join(rootDir, fileName)
  if (!fs.existsSync(filePath)) return

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const separator = trimmed.indexOf('=')
    if (separator === -1) continue

    const key = trimmed.slice(0, separator).trim()
    let value = trimmed.slice(separator + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (!process.env[key]) process.env[key] = value
  }
}

function loadBlogDetails() {
  const sourcePath = path.join(rootDir, 'lib', 'blog-data.ts')
  const source = fs.readFileSync(sourcePath, 'utf8')
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText

  const sandbox = {
    exports: {},
    module: { exports: {} },
    require,
  }
  sandbox.exports = sandbox.module.exports
  vm.runInNewContext(output, sandbox, { filename: sourcePath })

  return sandbox.module.exports.BLOG_DETAILS
}

loadEnvFile('.env.local')
loadEnvFile('.env')
console.log('Loaded environment files.')

const requiredEnv = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_DATABASE_URL',
]

const missing = requiredEnv.filter((key) => !process.env[key])
if (missing.length > 0) {
  throw new Error(`Missing Firebase env vars: ${missing.join(', ')}`)
}

function base64Url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function signJwt() {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const claimSet = {
    iss: process.env.FIREBASE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }
  const unsignedToken = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(claimSet))}`
  const signature = crypto
    .createSign('RSA-SHA256')
    .update(unsignedToken)
    .sign(process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'))

  return `${unsignedToken}.${base64Url(signature)}`
}

async function fetchWithTimeout(url, options, timeoutMs = 45000) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

async function getAccessToken() {
  console.log('Requesting Google OAuth access token...')
  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: signJwt(),
  })

  const response = await fetchWithTimeout('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  const payload = await response.json()

  if (!response.ok) {
    throw new Error(`OAuth token request failed: ${response.status} ${JSON.stringify(payload)}`)
  }

  return payload.access_token
}

async function main() {
  console.log('Loading blog details...')
  const blogDetails = loadBlogDetails()
  console.log(`Preparing ${blogDetails.length} blog posts...`)
  const updates = Object.fromEntries(
    blogDetails.map((post) => [
      post.slug,
      {
        ...post,
        seededAt: Date.now(),
      },
    ]),
  )

  const accessToken = await getAccessToken()
  const databaseUrl = process.env.FIREBASE_DATABASE_URL.replace(/\/$/, '')
  console.log('Writing blogPosts to Realtime Database...')
  const response = await fetchWithTimeout(`${databaseUrl}/blogPosts.json`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Realtime Database write failed: ${response.status} ${errorBody}`)
  }

  console.log(`Seeded ${blogDetails.length} blog posts to Realtime Database.`)
  clearTimeout(hardTimeout)
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
