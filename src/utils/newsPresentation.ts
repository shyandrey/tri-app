/** Presentation only: never used to decide eligibility or mutate stored titles. */
export type NewsVisualType = 'video' | 'results' | 'preview' | 'interview' | 'news'
export function newsPresentation(title: string): { type: NewsVisualType; title: string } {
  const leading = title.trimStart().match(/^(📺|🎥|▶\uFE0F?|🏆|🥇|👀|🎙\uFE0F?|🎤)\s*/u)
  if (leading) {
    const marker = leading[1].replace('\uFE0F', '')
    const type: NewsVisualType = ['📺', '🎥', '▶'].includes(marker) ? 'video'
      : ['🏆', '🥇'].includes(marker) ? 'results' : marker === '👀' ? 'preview' : 'interview'
    return { type, title: title.trimStart().slice(leading[0].length) || title }
  }
  const lower = title.toLocaleLowerCase('ru')
  const type = /результаты|итоги/u.test(lower) ? 'results'
    : /видео|highlights|трансляция/u.test(lower) ? 'video'
    : /анонс|превью/u.test(lower) ? 'preview' : 'news'
  return { type, title }
}
