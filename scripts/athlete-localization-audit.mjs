// Match exact English identities, never approximate spelling or numeric generated IDs.
export function auditAthleteLocalization(registry, rawAthletes, localizedAthletes) {
  const issues = []
  if (!registry || typeof registry !== 'object' || Array.isArray(registry)) {
    return ['LOCALIZATION REGISTRY INVALID: expected an object']
  }
  for (const [nameEn, entry] of Object.entries(registry)) {
    const nameRu = typeof entry === 'string' ? entry : entry?.nameRu
    if (typeof entry !== 'string' && entry?.provenance !== 'generated-reviewed') {
      issues.push(`LOCALIZATION PROVENANCE INVALID: ${nameEn}`)
    }
    if (!nameEn.trim() || nameEn !== nameEn.trim() || typeof nameRu !== 'string' ||
        nameRu !== nameRu.trim() || !/[А-Яа-яЁё]/.test(nameRu)) {
      issues.push(`LOCALIZATION ENTRY INVALID: ${nameEn}`)
      continue
    }
    const matches = rawAthletes.filter(a => (a.nameEn ?? a.name) === nameEn)
    if (matches.length !== 1) {
      issues.push(`LOCALIZATION IDENTITY ${matches.length ? 'AMBIGUOUS' : 'MISSING'}: ${nameEn}`)
      continue
    }
    const raw = matches[0]
    // A manually curated display name always wins over the registry.
    const expected = raw.name !== nameEn ? raw.name : nameRu
    if (raw.name !== nameEn && raw.name !== nameRu) {
      issues.push(`LOCALIZATION CONFLICT: ${nameEn} — ${raw.name} / ${nameRu}`)
    }
    const actual = localizedAthletes.find(a => a.id === raw.id)
    if (actual?.name !== expected || actual?.nameEn !== raw.nameEn) {
      issues.push(`LOCALIZATION NOT APPLIED: ${nameEn}`)
    }
  }
  return issues
}
