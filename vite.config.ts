import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // NOT `dist`: the deployment engine strips "dist"/"build" from the source
    // tarball it packs, so a build output under those names never reaches the
    // release. See the deployment notes in README.md.
    outDir: 'www',
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
})
