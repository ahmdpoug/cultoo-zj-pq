import { NextResponse, type NextRequest } from 'next/server'
import { PrivyClient } from '@privy-io/server-auth'
import { mapXUser, type XApiUser } from '@/lib/x/map-profile'

const USER_FIELDS = 'created_at,description,profile_image_url,public_metrics,verified,verified_type'

class LookupError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

let privy: PrivyClient | null = null
function getPrivy() {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
  const secret = process.env.PRIVY_APP_SECRET
  if (!appId || !secret) return null
  privy ??= new PrivyClient(appId, secret)
  return privy
}

async function fromXApi(handle: string, bearer: string): Promise<XApiUser> {
  const res = await fetch(`https://api.x.com/2/users/by/username/${handle}?user.fields=${USER_FIELDS}`, {
    headers: { Authorization: `Bearer ${bearer}` },
    next: { revalidate: 3600 },
  })
  if (res.status === 429) throw new LookupError('X rate limit reached. Try again shortly.', 429)
  const body = (await res.json().catch(() => null)) as { data?: XApiUser; errors?: { title?: string }[] } | null
  if (res.ok && body?.data) return body.data
  const notFound = res.status === 404 || body?.errors?.some((e) => e.title === 'Not Found Error')
  throw new LookupError(notFound ? `@${handle} doesn't exist on X.` : 'X API request failed.', notFound ? 404 : 502)
}

interface FxUser {
  id: string
  screen_name: string
  name: string
  description?: string
  avatar_url?: string
  followers: number
  following: number
  tweets: number
  likes: number
  joined?: string
  protected?: boolean
  verification?: { verified?: boolean; type?: string | null }
}

/** Public, key-less mirror of X profile data (api.fxtwitter.com). */
async function fromFxTwitter(handle: string): Promise<XApiUser> {
  const res = await fetch(`https://api.fxtwitter.com/${handle}`, {
    redirect: 'manual',
    headers: { 'User-Agent': 'CultCards/1.0' },
    next: { revalidate: 900 },
  })
  const body = (await res.json().catch(() => null)) as { code?: number; user?: FxUser } | null
  if (!res.ok || body?.code !== 200 || !body.user) {
    const notFound = res.status === 404 || res.status === 302 || body?.code === 404
    throw new LookupError(notFound ? `@${handle} doesn't exist on X.` : 'Could not reach X right now.', notFound ? 404 : 502)
  }
  const u = body.user
  return {
    id: u.id,
    name: u.name,
    username: u.screen_name,
    created_at: u.joined ? new Date(u.joined).toISOString() : undefined,
    description: u.description,
    profile_image_url: u.avatar_url,
    verified: Boolean(u.verification?.verified),
    verified_type: u.verification?.type ?? undefined,
    public_metrics: {
      followers_count: u.followers,
      following_count: u.following,
      tweet_count: u.tweets,
      like_count: u.likes,
    },
  }
}

export async function GET(req: NextRequest) {
  const handle = req.nextUrl.searchParams.get('handle')?.trim().replace(/^@+/, '') ?? ''
  if (!/^[A-Za-z0-9_]{1,15}$/.test(handle)) {
    return NextResponse.json({ error: 'Invalid X username.' }, { status: 400 })
  }

  const client = getPrivy()
  if (!client) return NextResponse.json({ error: 'Login is not configured.' }, { status: 503 })

  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ error: 'Sign in to scan live X profiles.' }, { status: 401 })
  try {
    await client.verifyAuthToken(token)
  } catch {
    return NextResponse.json({ error: 'Session expired. Sign in again.' }, { status: 401 })
  }

  try {
    const bearer = process.env.X_BEARER_TOKEN
    const user = bearer ? await fromXApi(handle, bearer).catch(() => fromFxTwitter(handle)) : await fromFxTwitter(handle)
    return NextResponse.json({ profile: mapXUser(user) })
  } catch (err) {
    const status = err instanceof LookupError ? err.status : 502
    const message = err instanceof LookupError ? err.message : 'Could not reach X right now.'
    return NextResponse.json({ error: message }, { status })
  }
}
