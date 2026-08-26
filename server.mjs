/**
 * Production static server for the dice roller.
 *
 * The deployment engine runs the repo as-is: it executes no build step, its
 * `npm ci` omits devDependencies, and the release directory is mounted
 * read-only — so nothing can build at start. This server therefore uses only
 * Node built-ins and serves the pre-built `www/` directory committed to the
 * repo (`www`, not `dist`: the engine strips "dist"/"build" when packing the
 * source tarball). It also answers the `/health` probe the engine polls before
 * marking a release live.
 */
import { createReadStream, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { join, normalize, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
}

function contentTypeFor(path) {
  const dot = path.lastIndexOf('.')
  return (dot === -1 ? undefined : MIME_TYPES[path.slice(dot).toLowerCase()]) ?? 'application/octet-stream'
}

function statFile(path) {
  try {
    const stats = statSync(path)
    return stats.isFile() ? stats : null
  } catch {
    return null
  }
}

function sendFile(res, path, stats, { immutable = false } = {}) {
  res.writeHead(200, {
    'Content-Type': contentTypeFor(path),
    'Content-Length': stats.size,
    'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
  })
  createReadStream(path).pipe(res)
}

function sendText(res, status, message) {
  const body = Buffer.from(message)
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', 'Content-Length': body.length })
  res.end(body)
}

/**
 * Build the HTTP server that serves a Vite build output directory.
 *
 * @param {string} root Absolute path to the build output (usually `www`).
 * @returns {import('node:http').Server}
 */
export function createDiceServer(root) {
  const rootDir = resolve(root)

  return createServer((req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      sendText(res, 405, 'Method not allowed')
      return
    }

    let pathname
    try {
      pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    } catch {
      sendText(res, 400, 'Bad request')
      return
    }

    if (pathname === '/health') {
      const body = Buffer.from(JSON.stringify({ status: 'ok' }))
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': body.length })
      res.end(body)
      return
    }

    // Resolve inside rootDir only; anything escaping it is treated as missing.
    const candidate = resolve(rootDir, `.${normalize(pathname)}`)
    if (candidate !== rootDir && !candidate.startsWith(rootDir + sep)) {
      sendText(res, 404, 'Not found')
      return
    }

    const stats = statFile(candidate)
    if (stats) {
      sendFile(res, candidate, stats, { immutable: pathname.startsWith('/assets/') })
      return
    }

    // Asset-looking requests must 404 rather than silently return the HTML shell.
    if (/\.[a-z0-9]+$/i.test(pathname)) {
      sendText(res, 404, 'Not found')
      return
    }

    const indexPath = join(rootDir, 'index.html')
    const indexStats = statFile(indexPath)
    if (!indexStats) {
      sendText(res, 404, 'Build output missing. Run `npm run build`.')
      return
    }
    sendFile(res, indexPath, indexStats)
  })
}

// Start only when executed directly (`node server.mjs`), not when imported by tests.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(process.env.STATIC_DIR ?? join(fileURLToPath(new URL('.', import.meta.url)), 'www'))
  const port = Number(process.env.PORT ?? 5173)

  if (!statFile(join(root, 'index.html'))) {
    console.error(`[server] No build output at ${root}. Run \`npm run build\` and commit www/.`)
    process.exit(1)
  }

  createDiceServer(root).listen(port, '0.0.0.0', () => {
    console.log(`[server] dice roller listening on http://0.0.0.0:${port} (serving ${root})`)
  })
}
