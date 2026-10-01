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

export type NewsRejectionReason = 'UNSUPPORTED_CONTENT' | 'INVALID_ENTITY_BOUNDARY' | 'NO_BOLD'
  | 'UNFORMATTED_TEXT_BEFORE_HEADING' | 'UNFORMATTED_TEXT_AFTER_HEADING' | 'PARTIALLY_FORMATTED_HEADING' | 'UNSUPPORTED_DECORATION'
export type NewsEvaluation = {
  contentSource: 'text' | 'caption' | 'none'
  firstLineUtf16Length: number
} & ({ eligible: EligibleNews; reason: null } | { eligible: null; reason: NewsRejectionReason })

const graphemes = new Intl.Segmenter('und', { granularity: 'grapheme' })
// Unicode's complete RGI emoji strings include VS16, modifiers, flags, keycaps and ZWJ sequences.
const emoji = new RegExp('^\\p{RGI_Emoji}$', 'v')
export const isNewsEmoji = (value: string) => emoji.test(value)
const decorative = (value: string) => /^[\s\p{P}]+$/u.test(value) || emoji.test(value)

/** One evaluation supplies both the editorial decision and safe rejection metadata. */
export function evaluateNews(message: TelegramNewsContent): NewsEvaluation {
  const contentSource = message.text !== undefined ? 'text' : message.caption !== undefined ? 'caption' : 'none'
  const text = message.text ?? message.caption ?? ''
  const entities = (contentSource === 'text' ? message.entities : message.caption_entities) ?? []
  const line = [...text.matchAll(/[^\r\n\u2028\u2029]+/g)].find(match => match[0].trim().length > 0)
  const title = line?.[0].trim() ?? ''
  const metadata = { contentSource, firstLineUtf16Length: title.length } as const
  const reject = (reason: NewsRejectionReason): NewsEvaluation => ({ ...metadata, eligible: null, reason })
  if (!line || (message.text !== undefined && message.caption !== undefined)
    || (message.text === undefined && message.entities !== undefined)
    || (message.caption === undefined && message.caption_entities !== undefined)) return reject('UNSUPPORTED_CONTENT')
  if (entities.some(entity => !Number.isSafeInteger(entity.offset) || !Number.isSafeInteger(entity.length)
    || entity.offset < 0 || entity.length <= 0 || entity.offset + entity.length > text.length
    || splitsSurrogate(text, entity.offset) || splitsSurrogate(text, entity.offset + entity.length))) return reject('INVALID_ENTITY_BOUNDARY')
  const start = line.index + line[0].length - line[0].trimStart().length
  const end = start + title.length
  const bold = entities.filter(entity => entity.type === 'bold')
  const covered = (index: number, width: number) => {
    // Union coverage allows adjacent entities, without splitting graphemes for classification.
    for (let i = index; i < index + width; i++) {
      if (!bold.some(entity => entity.offset <= i && entity.offset + entity.length > i)) return false
    }
    return true
  }
  const parts = [...graphemes.segment(title)].map(({ segment, index }) => ({
    segment, covered: covered(start + index, segment.length), decorative: decorative(segment),
  }))
  const meaningful = parts.filter(part => /[\p{L}\p{N}]/u.test(part.segment) && !emoji.test(part.segment))
  if (!meaningful.length) return reject('UNSUPPORTED_CONTENT')
  if (!meaningful.some(part => part.covered)) return reject('NO_BOLD')
  const boldText = (part: typeof parts[number]) => part.covered && /[\p{L}\p{N}]/u.test(part.segment) && !emoji.test(part.segment)
  const firstCovered = parts.findIndex(boldText), lastCovered = parts.findLastIndex(boldText)
  // Decorations never contribute to text coverage, regardless of their formatting or position.
  const firstUncovered = parts.findIndex(part => !part.covered && !part.decorative)
  if (firstUncovered >= 0) {
    if (!/[\p{L}\p{N}]/u.test(parts[firstUncovered].segment)) return reject('UNSUPPORTED_DECORATION')
    if (firstUncovered < firstCovered) return reject('UNFORMATTED_TEXT_BEFORE_HEADING')
    if (firstUncovered > lastCovered) return reject('UNFORMATTED_TEXT_AFTER_HEADING')
    return reject('PARTIALLY_FORMATTED_HEADING')
  }
  return { ...metadata, reason: null, eligible: { title, excerpt: text.slice(line.index + line[0].length).trim(), headingRange: { start, end } } }
}

export function extractEligibleNews(message: TelegramNewsContent): EligibleNews | null {
  return evaluateNews(message).eligible
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
