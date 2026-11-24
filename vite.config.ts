import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import seasons from './season.config.json' with { type: 'json' }

export default defineConfig(({ mode }) => {
  // Explicit opt-in profile; no clock, hostname or Cloudflare environment inference.
  const profile = mode === 'season2027-preview' ? 'preview2027' : 'production'
  const primarySeason = seasons[profile]
  if (![2026, 2027].includes(primarySeason)) throw new Error('Unsupported primary season')
  return {
    define: { __PRIMARY_SEASON__: JSON.stringify(primarySeason) },
    plugins: [react(), {
      name: 'season-build-evidence',
      generateBundle() {
        this.emitFile({ type: 'asset', fileName: 'season.json', source: JSON.stringify({ profile, primarySeason }) })
      },
    }],
  }
})
