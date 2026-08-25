# Dice Roller App — Design

## What & Why
A minimal single-page React app that simulates rolling a six-sided die. User clicks "Roll", the app shows a random number between 1 and 6. Purpose is a simple demo app to be deployed via the deployment engine.

## Stack
- Vite + React + TypeScript
- No backend, no routing, no persistence

## Architecture
- `App.tsx`: renders the `DiceRoller` component
- `DiceRoller.tsx`: owns local state (`value: number`), renders the current die value and a "Roll" button. On click, sets `value` to `Math.floor(Math.random() * 6) + 1`.

## Data Flow
Button click → `onClick` handler → `Math.random()` → `setValue` → re-render displaying new number.

## Error Handling
None needed — no I/O, no external calls, no invalid states possible.

## Testing
Manual verification in browser: initial render shows a value, clicking Roll repeatedly produces values in range [1,6].
