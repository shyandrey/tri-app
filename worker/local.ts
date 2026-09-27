// Explicit local-only entry point. Remote hostnames fail closed; named deploy
// environments use worker/index.ts. No real Telegram request is made here.
import { createWorker } from './index.ts'
export default createWorker(true, async () => {})
