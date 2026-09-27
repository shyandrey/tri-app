export const feedbackCategories = {
  results: 'Ошибка в результатах', athlete: 'Ошибка в данных атлета',
  app: 'Ошибка приложения', suggestion: 'Предложение', other: 'Другое',
} as const
export type FeedbackCategory = keyof typeof feedbackCategories
export type FeedbackContext = {
  screen: 'more' | 'athlete' | 'race'
  route: string
  athleteId: number | null
  athleteName: string | null
  raceEditionId: string | null
  raceName: string | null
  gender: 'M' | 'W' | null
}
export const genericFeedbackContext: FeedbackContext = {
  screen: 'more', route: '#/more', athleteId: null, athleteName: null,
  raceEditionId: null, raceName: null, gender: null,
}
export type FeedbackPayload = {
  requestId: string
  category: FeedbackCategory
  description: string
  contactEmail: string | null
  context: FeedbackContext
  build: { version: string; commit: string }
  viewport: { width: number; height: number }
  clientInfo: string | null
  turnstileToken: string
  website: string
}
export function formErrors(category: string, description: string, email: string): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!Object.hasOwn(feedbackCategories, category)) errors.category = 'Выберите категорию.'
  if (description.trim().length < 10 || description.trim().length > 4000) errors.description = 'Описание должно содержать от 10 до 4000 символов.'
  if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) errors.email = 'Проверьте адрес email.'
  return errors
}
