/** Telegram entities use UTF-16 code units, matching JS string indexes. */
export type TelegramEntity = { type: string; offset: number; length: number }
export type TelegramNewsContent = {
  text?: string
  entities?: readonly TelegramEntity[]
  caption?: string
  caption_entities?: readonly TelegramEntity[]
}
export type EligibleNews = {
  title: string
  excerpt: string
  headingRange: { start: number; end: number }
}

const splitsSurrogate = (text: string, index: number) => index > 0 && index < text.length
  && /[\uD800-\uDBFF]/.test(text[index - 1]) && /[\uDC00-\uDFFF]/.test(text[index])

/** Formatting is the editorial signal; never infer importance or parse Markdown. */
export function extractEligibleNews(message: TelegramNewsContent): EligibleNews | null {
  // Do not pair text with caption entities (or vice versa).
  const text = message.text ?? message.caption ?? ''
  const entities = message.text !== undefined ? message.entities : message.caption_entities
  const line = [...text.matchAll(/[^\r\n\u2028\u2029]+/g)].find(match => match[0].trim().length > 0)
  if (!line) return null
  const title = line[0].trim()
  const start = line.index + line[0].length - line[0].trimStart().length
  const end = start + title.length
  const bold = (entities ?? []).filter(entity => entity.type === 'bold'
    && Number.isSafeInteger(entity.offset) && Number.isSafeInteger(entity.length)
    && entity.offset >= 0 && entity.length > 0 && entity.offset + entity.length <= text.length
    && !splitsSurrogate(text, entity.offset) && !splitsSurrogate(text, entity.offset + entity.length))
  const covered = (index: number, width: number) => bold.some(entity => entity.offset <= index && entity.offset + entity.length >= index + width)
  let offset = start, visible = 0, boldCount = 0
  const uncovered: { char: string; index: number }[] = []
  // Count code points for the coverage ratio, while using UTF-16 offsets for entities.
  for (const char of title) {
    if (!/\s/u.test(char)) {
      visible++
      if (covered(offset, char.length)) boldCount++
      else uncovered.push({ char, index: offset })
    }
    offset += char.length
  }
  if (!boldCount) return null
  if (uncovered.length) {
    // Only whitespace and a tiny trailing punctuation suffix may be unformatted.
    // An unbold word is never tolerated, even when a percentage would allow it.
    const suffix = text.slice(uncovered[0].index, end)
    if (uncovered.length > 3 || boldCount / visible < 0.9 || !/^[\s.!?…:;—–]+$/u.test(suffix)) return null
  }
  return { title, excerpt: text.slice(line.index + line[0].length).trim(), headingRange: { start, end } }
}

export type StoredNewsContent = { title: string; excerpt: string; hidden: 0 | 1 }
export type NewsEligibilityDecision =
  | { action: 'ignore' }
  | { action: 'upsert'; content: StoredNewsContent }
  | { action: 'hide'; content: StoredNewsContent }

/** For either channel_post or edited_channel_post, after identity/order validation.
 * The caller looks up the existing row by (channel_id, message_id).
 * Hide retains the last qualifying text for audit; requalification unhides it.
 * This is a persistence decision, not a webhook/authentication or database writer.
 */
export function decideNewsEligibility(message: TelegramNewsContent, existing: StoredNewsContent | null): NewsEligibilityDecision {
  const eligible = extractEligibleNews(message)
  if (eligible) return { action: 'upsert', content: { title: eligible.title, excerpt: eligible.excerpt, hidden: 0 } }
  return existing ? { action: 'hide', content: { ...existing, hidden: 1 } } : { action: 'ignore' }
}
