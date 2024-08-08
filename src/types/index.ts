import type { Session } from 'next-auth'
export interface SessionData extends Session {
    user?: {
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string | null
    }
  
  }
  