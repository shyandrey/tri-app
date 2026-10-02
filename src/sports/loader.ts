import { createAsyncResource } from './resource'

// No eager imports (including identity helpers) across this boundary.
export const sportsArea = createAsyncResource(() => import('./sports-entry'))
