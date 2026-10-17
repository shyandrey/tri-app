// Deliberately small plain-text changelog grammar; never render arbitrary Markdown as HTML.
export function parseChangelog(text, version) {
  const semver = '(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)'
  if (!new RegExp(`^${semver}$`).test(version)) throw Error('Expected stable SemVer')
  const chunks = text.split(/^## /m).slice(1)
  const seen = new Set(), releases = []
  let previousDate = '9999-12-31'
  for (const chunk of chunks) {
    const [heading, ...lines] = chunk.trim().split('\n')
    const match = heading.match(new RegExp(`^\\[(Unreleased|${semver})\\](?: — (\\d{4}-\\d{2}-\\d{2}))?$`))
    if (!match || seen.has(match[1])) throw Error('Invalid or duplicate release heading')
    const [, id, date] = match
    seen.add(id)
    if (id === 'Unreleased') {
      if (date || releases.length) throw Error('Unreleased must be first and undated')
    } else {
      if (!date || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0,10) !== date || date > previousDate) throw Error('Invalid release date/order')
      previousDate = date
    }
    const titleLines = lines.filter(line => line.startsWith('Title: '))
    if (titleLines.length !== 1 || !titleLines[0].slice(7).trim()) throw Error('Release needs one title')
    const sections = []
    let section
    for (const line of lines) {
      if (line.startsWith('### ')) {
        const heading = line.slice(4)
        if (!['Added','Changed','Fixed','Technical'].includes(heading) || sections.some(s => s.heading === heading)) throw Error('Invalid release section')
        section = { heading, items: [] }; sections.push(section)
      } else if (line.startsWith('- ')) {
        if (!section || !line.slice(2).trim()) throw Error('Invalid release item')
        section.items.push(line.slice(2))
      } else if (line.trim() && !/^(Title|SHA|Tag): .+$/.test(line)) throw Error('Unsupported changelog content')
    }
    if (!sections.length || sections.some(s => !s.items.length)) throw Error('Empty release notes')
    const sha = lines.filter(l => l.startsWith('SHA: ')), tag = lines.filter(l => l.startsWith('Tag: '))
    if (id !== 'Unreleased' && (sha.length !== 1 || (!/^SHA: [a-f0-9]{40}$/.test(sha[0]) && sha[0] !== `SHA: tag:v${id}`) || tag.length !== 1 || tag[0] !== `Tag: v${id}`)) throw Error('Release needs SHA and matching tag')
    if (id === 'Unreleased' && (sha.length || tag.length)) throw Error('Unreleased cannot claim publication')
    releases.push({version:id, title:titleLines[0].slice(7), sections})
  }
  if (releases[0]?.version !== 'Unreleased') throw Error('Missing Unreleased')
  const current = releases.find(r => r.version === (version === '0.0.0' ? 'Unreleased' : version))
  if (!current) throw Error('No notes for package version')
  return {...current, version, unpublished:version === '0.0.0'}
}
