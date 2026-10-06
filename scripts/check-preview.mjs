import { checkDeployment } from './check-deployment.mjs'
import { pathToFileURL } from 'node:url'

const preview = 'https://preview.300w.app'

export async function checkPreview(fetcher = fetch) {
  return checkDeployment(preview, fetcher)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const { health, newsCount } = await checkPreview()
    console.log(`PREVIEW PASS ${preview}/api/health: version=${health.version} commit=${health.commit}`)
    console.log(`PREVIEW PASS ${preview}/api/news: ${newsCount} items`)
  } catch (error) {
    console.error(`PREVIEW check failed: ${error.message}`)
    process.exitCode = 1
  }
}
