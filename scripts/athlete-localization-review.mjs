// Editorial coverage only. Call with approved/localized catalog values, never
// use this predicate to approve a spelling or match an identity.
export function needsRussianNameReview(athlete) {
  return !athlete?.name?.trim() || !/[А-Яа-яЁё]/u.test(athlete.name)
}
export function localizationReviewQueue(athletes) {
  return athletes.filter(needsRussianNameReview).map(a => ({
    athleteId: a.id ?? null, nameEn: a.nameEn ?? a.athleteName ?? a.name ?? '',
    status: 'LOCALIZATION_REVIEW_REQUIRED', blocking: false,
  }))
}
