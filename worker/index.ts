import { buildMetadata } from '../.generated/build-metadata.ts'
import type { Env } from './env.ts'

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  Response.json(body, {status, headers: {'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff', ...headers}})

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const pathname = new URL(request.url).pathname
    if (pathname !== '/api' && !pathname.startsWith('/api/')) return env.ASSETS.fetch(request)
    // Same-origin API: no permissive CORS headers. Future write endpoints must
    // validate Origin as well as input/anti-spam; health has no side effects.
    if (pathname !== '/api/health') return json({error:{code:'NOT_FOUND',message:'API route not found'}}, 404)
    if (request.method !== 'GET') return json({error:{code:'METHOD_NOT_ALLOWED',message:'Use GET'}}, 405, {Allow:'GET'})
    return json({ok:true, service:'tri-app', version:buildMetadata.version, commit:buildMetadata.commit})
  },
} satisfies ExportedHandler<Env>
