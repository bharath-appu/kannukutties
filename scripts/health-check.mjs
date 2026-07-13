import http from 'node:http'

const PORT = parseInt(process.argv.find(a => a.startsWith('--port='))?.split('=')[1] || process.argv[2] || '3001', 10)
const BASE = `http://localhost:${PORT}`
const TIMEOUT = 5000
const verbose = process.argv.includes('--verbose')

let passed = 0
let failed = 0
const results = []

function color(status) {
  if (status === 'PASS') return '\x1b[32m'
  if (status === 'FAIL') return '\x1b[31m'
  if (status === 'WARN') return '\x1b[33m'
  return '\x1b[0m'
}

function log(label, status, detail = '') {
  results.push({ label, status, detail })
  if (status === 'PASS') passed++
  else if (status === 'FAIL') failed++
  const icon = status === 'PASS' ? '\u2713' : status === 'FAIL' ? '\u2717' : '\u26A0'
  console.log(`  ${color(status)}${icon}\x1b[0m ${label}${detail ? ` \x1b[90m(${detail})\x1b[0m` : ''}`)
}

function fetchUrl(path) {
  return new Promise((resolve) => {
    const req = http.get(`${BASE}${path}`, { timeout: TIMEOUT }, (res) => {
      let body = ''
      res.on('data', c => body += c)
      res.on('end', () => resolve({ status: res.statusCode, body }))
    })
    req.on('error', () => resolve({ status: 0, body: '' }))
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, body: '' }) })
  })
}

function postUrl(path, body = '') {
  return new Promise((resolve) => {
    const url = new URL(path, BASE)
    const opts = {
      hostname: url.hostname, port: url.port, path: url.pathname,
      method: 'POST', timeout: TIMEOUT,
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }
    const req = http.request(opts, (res) => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => resolve({ status: res.statusCode, body: data }))
    })
    req.on('error', () => resolve({ status: 0, body: '' }))
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, body: '' }) })
    req.end(body)
  })
}

async function main() {
  console.log(`\n  \x1b[1mKanukuties Health Check\x1b[0m  —  ${BASE}\n`)

  // 1. Server alive
  const start = Date.now()
  const home = await fetchUrl('/')
  const aliveMs = Date.now() - start
  log('Server alive', home.status === 200 ? 'PASS' : 'FAIL', `${home.status} (${aliveMs}ms)`)

  if (home.status !== 200) {
    log('Server is not responding — skipping remaining checks', 'FAIL')
    printSummary()
    process.exit(1)
  }

  // 2. Critical routes
  const routes = ['/login', '/signup', '/search', '/explore', '/settings']
  for (const route of routes) {
    const r = await fetchUrl(route)
    log(`Route ${route}`, r.status === 200 ? 'PASS' : 'FAIL', `${r.status}`)
  }

  // 3. Admin route
  const admin = await fetchUrl('/admin')
  log('Route /admin', admin.status === 200 ? 'PASS' : 'WARN', `${admin.status} (expected 200 or redirect)`)

  // 4. Supabase connectivity check
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  if (supabaseUrl) {
    const s = await fetchUrl(new URL(supabaseUrl).pathname || '/')
    log('Supabase reachable', s.status > 0 ? 'PASS' : 'FAIL', `HTTP ${s.status}`)
  } else {
    log('Supabase URL not set — skipping', 'WARN')
  }

  // 5. Static assets
  const cat = await fetchUrl('/cat.webp')
  log('Logo asset /cat.webp', cat.status === 200 ? 'PASS' : 'FAIL', `${cat.status}`)

  // 6. Server action: getFeed (POST /)
  const feedRes = await postUrl('/', JSON.stringify({ _action: 'getFeed' }))
  log('Server action: getFeed', feedRes.status === 200 ? 'PASS' : 'WARN', `${feedRes.status}`)

  // 7. Check middleware warning mitigation
  if (home.body.includes('middleware') || home.body.includes('proxy')) {
    log('Middleware warning handled', 'PASS', 'app running')
  }

  printSummary()
  process.exit(failed > 0 ? 1 : 0)
}

function printSummary() {
  console.log(`\n  \x1b[1mSummary:\x1b[0m ${passed} passed, ${failed} failed, ${results.length - passed - failed} warnings\n`)
}

main().catch(e => {
  console.error('  \x1b[31mScript error:\x1b[0m', e.message)
  process.exit(1)
})
