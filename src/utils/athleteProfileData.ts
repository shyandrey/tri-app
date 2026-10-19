export type SocialPlatform = 'instagram' | 'twitter' | 'youtube' | 'facebook' | 'tiktok' | 'website'
export type VerifiedField<T> = { value: T; sourceUrl: string; verifiedAt: string; observedAt?: string; snapshotSha256: string; raw: string }
export type PtoProfileData = {
  reportedAge?: VerifiedField<number>
  birthYear?: VerifiedField<number>
  socials?: Partial<Record<SocialPlatform, VerifiedField<string>>>
}
export function competitionAge(data: PtoProfileData | undefined, now = new Date()): number | undefined {
  const year = Number(new Intl.DateTimeFormat('en', { timeZone: 'Europe/Moscow', year: 'numeric' }).format(now))
  const born = data?.birthYear?.value
  if (born !== undefined && Number.isInteger(born) && born >= 1900 && born <= year) return year - born
  const age = data?.reportedAge
  const observedAt = age?.observedAt ?? age?.verifiedAt
  if (age && observedAt && Number.isInteger(age.value) && age.value >= 0 && age.value <= 120 && Number.isFinite(Date.parse(observedAt)) && Date.parse(observedAt) <= now.getTime() && Number(new Intl.DateTimeFormat('en', { timeZone: 'Europe/Moscow', year: 'numeric' }).format(new Date(observedAt))) === year) return age.value
}
export function validSocialUrl(platform: SocialPlatform, value: string): string | undefined {
  try {
    const u = new URL(value)
    if (u.protocol !== 'https:' || u.username || u.password || u.port || (/\s/.test(value) || [...value].some(char => char.charCodeAt(0) < 32)) || u.search || u.hash) return
    const host = u.hostname.toLowerCase().replace(/^www\./, '')
    const p = u.pathname.replace(/\/$/, '')
    const handle = /^\/[\w.-]+$/
    const blocked = /^\/(?:share|intent|watch|shorts|reel|reels|p|explore|login|home|posts|videos)(?:\/|$)/i.test(p)
    if (blocked) return
    const ok = platform === 'instagram' ? host === 'instagram.com' && handle.test(p)
      : platform === 'twitter' ? ['twitter.com', 'x.com'].includes(host) && /^\/\w+$/.test(p)
      : platform === 'youtube' ? host === 'youtube.com' && /^\/(?:@[\w.-]+|channel\/[\w-]+|c\/[\w.-]+|user\/[\w.-]+)$/.test(p)
      : platform === 'facebook' ? host === 'facebook.com' && handle.test(p)
      : platform === 'tiktok' ? host === 'tiktok.com' && /^\/@[\w.-]+$/.test(p)
      : platform === 'website' && /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(host) && !/(?:^|\.)(?:localhost|local|internal)$/.test(host) && !['instagram.com','twitter.com','x.com','youtube.com','facebook.com','tiktok.com','linkedin.com','t.me','telegram.me'].some(domain => host === domain || host.endsWith('.' + domain))
    if (ok) { u.hostname = host; u.pathname = p || '/'; return u.href }
  } catch { /* Invalid URLs are omitted, never repaired. */ }
}
export function profileSocials(athlete: { socialLinks?: { instagram?: string; youtube?: string }; ptoProfile?: PtoProfileData }) {
  const links: Partial<Record<SocialPlatform, string>> = {}
  for (const platform of ['instagram', 'youtube'] as const) {
    const old = athlete.socialLinks?.[platform]
    if (old) links[platform] = validSocialUrl(platform, old.startsWith('https://') ? old : platform === 'instagram' ? `https://www.instagram.com/${old}/` : `https://www.youtube.com/@${old}`)
  }
  for (const [platform, field] of Object.entries(athlete.ptoProfile?.socials ?? {})) {
    const key = platform as SocialPlatform
    if (!links[key] && field) links[key] = validSocialUrl(key, field.value)
  }
  return Object.entries(links).filter((entry): entry is [SocialPlatform, string] => !!entry[1])
}
