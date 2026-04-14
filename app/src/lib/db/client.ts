import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

declare global {
  // eslint-disable-next-line no-var
  var __pgClient: ReturnType<typeof postgres> | undefined
}

function makeClient() {
  return postgres(process.env.DATABASE_URL!, {
    prepare: false,
    max: 3,            // max 3 simultaneous connections
    idle_timeout: 30,  // close idle connections after 30 s
    connect_timeout: 10,
  })
}

// Reuse across hot reloads in development so old connections are not leaked
if (!global.__pgClient) {
  global.__pgClient = makeClient()
}

const client = global.__pgClient!
export const db = drizzle(client, { schema })
export type DB = typeof db
