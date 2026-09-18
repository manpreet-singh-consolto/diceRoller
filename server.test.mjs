// @vitest-environment node
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { createDiceServer } from './server.mjs'

/** Minimal stand-in for a `vite build` output tree. */
function makeBuildOutput() {
  const root = mkdtempSync(join(tmpdir(), 'dice-www-'))
  mkdirSync(join(root, 'assets'))
  writeFileSync(join(root, 'index.html'), '<!doctype html><title>Dice</title>')
  writeFileSync(join(root, 'assets', 'index-abc.js'), 'console.log(1)')
  return root
}

describe('production static server', () => {
  let server
  let origin

  beforeAll(async () => {
    server = createDiceServer(makeBuildOutput())
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
    origin = `http://127.0.0.1:${server.address().port}`
  })

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve))
  })

  it('answers the deployment health probe', async () => {
    const res = await fetch(`${origin}/health`)
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({ status: 'ok' })
  })

  it('serves index.html at the root', async () => {
    const res = await fetch(`${origin}/`)
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/html')
    await expect(res.text()).resolves.toContain('<title>Dice</title>')
  })

  it('serves hashed assets with the right content type', async () => {
    const res = await fetch(`${origin}/assets/index-abc.js`)
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('javascript')
  })

  it('falls back to index.html for unknown routes (SPA)', async () => {
    const res = await fetch(`${origin}/some/deep/route`)
    expect(res.status).toBe(200)
    await expect(res.text()).resolves.toContain('<title>Dice</title>')
  })

  it('404s a missing asset instead of returning HTML', async () => {
    const res = await fetch(`${origin}/assets/missing.js`)
    expect(res.status).toBe(404)
  })

  it('never serves files outside the build directory', async () => {
    // Encoded traversal survives client-side URL normalisation, so it reaches the server raw.
    const res = await fetch(`${origin}/..%2f..%2f..%2fetc%2fpasswd`)
    await expect(res.text()).resolves.not.toContain('root:')
  })
})
