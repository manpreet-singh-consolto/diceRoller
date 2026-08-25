# Dice Roller Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page React app where clicking "Roll" displays a random number between 1 and 6.

**Architecture:** Vite + React + TypeScript scaffold. One presentational/stateful component (`DiceRoller`) owns the rolled value and re-rolls on click; `App` just renders it.

**Tech Stack:** Vite, React 18, TypeScript, Vitest + @testing-library/react for testing.

## Global Constraints

- No backend, no routing, no persistence (per spec: `docs/superpowers/specs/2026-08-25-dice-roller-design.md`).
- Die value must always be an integer in the closed range [1, 6].
- App must build cleanly with `npm run build` (static output, deployable as-is).

---

### Task 1: Scaffold the Vite + React + TypeScript project

**Files:**
- Create: entire project scaffold under `/data/workspaces/fd16dd43-1250-4670-99cd-573d79ee11b8/R1/` via `npm create vite@latest`
- Create: `package.json`, `vite.config.ts`, `index.html`, `tsconfig.json`, `src/main.tsx`, `src/App.tsx`, `src/App.css`, `src/index.css`

**Interfaces:**
- Produces: a working Vite dev server (`npm run dev`) and build (`npm run build`) that later tasks add to.

- [ ] **Step 1: Scaffold the project**

```bash
cd /data/workspaces/fd16dd43-1250-4670-99cd-573d79ee11b8/R1
npm create vite@latest . -- --template react-ts
```

If prompted about the directory not being empty (it contains `.git` and `docs/`), confirm to proceed — it will only add/overwrite Vite template files.

- [ ] **Step 2: Install dependencies**

```bash
cd /data/workspaces/fd16dd43-1250-4670-99cd-573d79ee11b8/R1
npm install
```

- [ ] **Step 3: Verify the default template builds**

```bash
npm run build
```

Expected: exits 0, prints a `dist/` output summary.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: scaffold vite react-ts project"
```

---

### Task 2: Add Vitest + Testing Library and write DiceRoller with tests

**Files:**
- Modify: `package.json` (add devDependencies + `test` script)
- Create: `vite.config.ts` (add `test` block) — modify existing file from Task 1
- Create: `src/setupTests.ts`
- Create: `src/components/DiceRoller.tsx`
- Create: `src/components/DiceRoller.test.tsx`

**Interfaces:**
- Produces: `DiceRoller` — a React component with no props, exported as a named export `export function DiceRoller()`. Renders the current value inside an element with `data-testid="die-face"`, and a `<button>` with accessible name `Roll`.

- [ ] **Step 1: Install test dependencies**

```bash
cd /data/workspaces/fd16dd43-1250-4670-99cd-573d79ee11b8/R1
npm install -D vitest @testing-library/react @testing-library/dom jsdom
```

- [ ] **Step 2: Add the test script to `package.json`**

Add this entry to the `"scripts"` object:

```json
"test": "vitest run"
```

- [ ] **Step 3: Add the test environment to `vite.config.ts`**

Read the current file first, then update it to match:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
})
```

- [ ] **Step 4: Create `src/setupTests.ts`**

```ts
import '@testing-library/dom'
```

- [ ] **Step 5: Write the failing tests**

Create `src/components/DiceRoller.test.tsx`:

```tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DiceRoller } from './DiceRoller'

describe('DiceRoller', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders an initial value between 1 and 6', () => {
    render(<DiceRoller />)
    const value = Number(screen.getByTestId('die-face').textContent)
    expect(value).toBeGreaterThanOrEqual(1)
    expect(value).toBeLessThanOrEqual(6)
  })

  it('shows 6 when Math.random is just under 1 and Roll is clicked', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999999)
    render(<DiceRoller />)
    fireEvent.click(screen.getByRole('button', { name: /roll/i }))
    expect(screen.getByTestId('die-face').textContent).toBe('6')
  })

  it('shows 1 when Math.random is 0 and Roll is clicked', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    render(<DiceRoller />)
    fireEvent.click(screen.getByRole('button', { name: /roll/i }))
    expect(screen.getByTestId('die-face').textContent).toBe('1')
  })
})
```

- [ ] **Step 6: Run the tests to verify they fail**

```bash
npm run test
```

Expected: FAIL — `Cannot find module './DiceRoller'` (or similar), since `DiceRoller.tsx` doesn't exist yet.

- [ ] **Step 7: Implement `DiceRoller`**

Create `src/components/DiceRoller.tsx`:

```tsx
import { useState } from 'react'

function rollDie(): number {
  return Math.floor(Math.random() * 6) + 1
}

export function DiceRoller() {
  const [value, setValue] = useState<number>(() => rollDie())

  return (
    <div className="dice-roller">
      <div className="die-face" data-testid="die-face">
        {value}
      </div>
      <button onClick={() => setValue(rollDie())}>Roll</button>
    </div>
  )
}
```

- [ ] **Step 8: Run the tests to verify they pass**

```bash
npm run test
```

Expected: PASS — 3 tests passing.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add DiceRoller component with tests"
```

---

### Task 3: Wire DiceRoller into App and clean up template boilerplate

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.css`
- Modify: `src/index.css`
- Delete: `src/assets/react.svg` (if present, unused after cleanup)

**Interfaces:**
- Consumes: `DiceRoller` from `./components/DiceRoller` (named export, no props), as produced by Task 2.

- [ ] **Step 1: Replace `src/App.tsx` with the wired-up version**

```tsx
import { DiceRoller } from './components/DiceRoller'
import './App.css'

function App() {
  return (
    <div className="app">
      <h1>Dice Roller</h1>
      <DiceRoller />
    </div>
  )
}

export default App
```

- [ ] **Step 2: Replace `src/App.css` with minimal styling**

```css
.app {
  max-width: 24rem;
  margin: 4rem auto;
  text-align: center;
  font-family: system-ui, sans-serif;
}

.dice-roller {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.die-face {
  width: 6rem;
  height: 6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 700;
  border: 2px solid #333;
  border-radius: 0.75rem;
}

.dice-roller button {
  font-size: 1.1rem;
  padding: 0.6rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  background: #333;
  color: #fff;
  cursor: pointer;
}

.dice-roller button:hover {
  background: #555;
}
```

- [ ] **Step 3: Simplify `src/index.css` to remove unused Vite template defaults**

```css
:root {
  color-scheme: light dark;
}

body {
  margin: 0;
}
```

- [ ] **Step 4: Remove the unused template asset**

```bash
cd /data/workspaces/fd16dd43-1250-4670-99cd-573d79ee11b8/R1
rm -f src/assets/react.svg public/vite.svg
```

- [ ] **Step 5: Run the full test suite**

```bash
npm run test
```

Expected: PASS — 3 tests passing (unchanged from Task 2).

- [ ] **Step 6: Verify production build**

```bash
npm run build
```

Expected: exits 0, `dist/` produced with no TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: wire DiceRoller into App and clean up template assets"
```
