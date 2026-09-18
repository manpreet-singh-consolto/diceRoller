# Dice Roller

A single-page React app that rolls a die: click **Roll** and it shows a random integer from 1 to 6.

Stack: Vite + React + TypeScript. No backend, no routing, no persistence — the value lives in component state.

## Local development

```bash
npm install
npm run dev        # Vite dev server with HMR on :5173
npm test           # vitest
npm run lint       # oxlint
```

## Production / deployment

Three constraints of the deployment engine shape how this app is deployed:

1. It runs **no build step** — it unpacks the source, installs deps, and runs the runner command.
2. Its dependency install omits **devDependencies**, so `vite` does not exist in the release
   (`npm run dev` there dies with `vite: not found`, exit 127).
3. It **strips `dist/` and `build/`** when packing the source tarball, and mounts the release
   **read-only** — so a build output under those names can neither be shipped nor produced in place.

So the build output goes to **`www/`** (see `vite.config.ts`), is committed, and is served by
`server.mjs`:

- `server.mjs` uses **only Node built-ins** — no `node_modules` required at runtime.
- It answers `GET /health` with `{"status":"ok"}` — the probe the deployment engine polls.
- It listens on `0.0.0.0` and `PORT` (default `5173`), and ignores extra CLI args such as
  `--host 0.0.0.0`, which the engine appends for `react-vite` runners.
- Unknown paths fall back to `index.html` (SPA); missing asset paths return `404`.
- `STATIC_DIR` overrides the served directory.

**Production start command:** `npm start` (set as the runner command in the Local Runners panel).

### Before publishing a change

`www/` is a committed artifact, so rebuild and commit it whenever `src/` or `index.html` changes:

```bash
npm run build
git add www && git commit -m "chore: rebuild www"
```

If the engine later installs devDependencies and gains a build step, `outDir` can go back to `dist`,
`www/` can be deleted, and `dist/` returned to `.gitignore`.
