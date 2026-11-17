import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    // Tests always run against the in-browser mock API.
    env: { NEXT_PUBLIC_USE_MOCK: 'true' },
  },
})
