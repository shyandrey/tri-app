import test from 'node:test'
import assert from 'node:assert/strict'
import { extractEligibleNews, decideNewsEligibility, evaluateNews } from '../worker/news/eligibility.ts'
const bold = (offset, length) => ({ type: 'bold', offset, length })
const heading = 'IRONMAN 70.3 Worlds — результаты'
const post = (text = heading + '\nТекст новости') => ({ text, entities: [bold(0, heading.length)] })

test('fully bold first line is eligible, including heading-only posts', () => {
  assert.deepEqual(extractEligibleNews(post(heading)), { title: heading, excerpt: '', headingRange: { start: 0, end: heading.length } })
})
test('bold title + body is eligible; excerpt excludes title and retains plain body', () => {
  assert.equal(extractEligibleNews(post()).title, heading)
  assert.equal(extractEligibleNews(post()).excerpt, 'Текст новости')
  assert.equal(extractEligibleNews(post(heading + '\n\n  Текст\nВторая строка  ')).excerpt, 'Текст\nВторая строка')
})
test('bold athlete name inside ordinary first line is not news', () => {
  const text = 'Сегодня победил Hayden Wilde'
  assert.equal(extractEligibleNews({ text, entities: [bold(text.indexOf('Hayden'), 'Hayden Wilde'.length)] }), null)
})
test('bold fragment only, or a bold second line, does not qualify', () => {
  assert.equal(extractEligibleNews({ text: heading, entities: [bold(0, 7)] }), null)
  const text = 'Обычное сообщение\n' + heading
  assert.equal(extractEligibleNews({ text, entities: [bold(text.indexOf(heading), heading.length)] }), null)
})
test('leading empty lines/whitespace skipped; offsets remain relative to original text', () => {
  const prefix = '\r\n \t\r\n  ', text = prefix + heading + '  \r\n\r\nBody'
  assert.deepEqual(extractEligibleNews({ text, entities: [bold(prefix.length, heading.length)] }), {
    title: heading, excerpt: 'Body', headingRange: { start: prefix.length, end: prefix.length + heading.length },
  })
})
test('media caption + caption_entities works without images/video processing', () => {
  const result = extractEligibleNews({ caption: heading + '\nHighlights', caption_entities: [bold(0, heading.length)] })
  assert.equal(result.title, heading); assert.equal(result.excerpt, 'Highlights')
  assert.equal(extractEligibleNews({ caption: heading, entities: [bold(0, heading.length)] }), null)
  assert.equal(extractEligibleNews({ text: heading, caption_entities: [bold(0, heading.length)] }), null)
})
test('no bold, literal Markdown, italics, empty/media-only posts are normally ignored', () => {
  for (const message of [{ text: heading }, { text: '**' + heading + '**\nBody' },
    { text: heading, entities: [{ type: 'italic', offset: 0, length: heading.length }] }, {}, { text: '\n \t' }]) {
    assert.equal(extractEligibleNews(message), null)
    assert.deepEqual(decideNewsEligibility(message, null), { action: 'ignore' })
  }
})
test('semantic coverage: whitespace gaps and decorative punctuation', () => {
  assert.ok(extractEligibleNews({ text: 'Race results', entities: [bold(0, 4), bold(5, 7)] }))
  assert.ok(extractEligibleNews({ text: heading + '!', entities: [bold(0, heading.length)] }))
  assert.equal(extractEligibleNews({ text: 'A ' + heading, entities: [bold(2, heading.length)] }), null)
  assert.equal(extractEligibleNews({ text: heading + ' X', entities: [bold(0, heading.length)] }), null)
  assert.ok(extractEligibleNews({ text: 'Race!!', entities: [bold(0, 4)] })) // Decorative suffix no longer needs 90% coverage.
})
test('UTF-16 offsets include emoji; split surrogate/invalid entity ranges cannot qualify', () => {
  const title = '🏆 Итоги гонки', prefix = '\n ', text = prefix + title + '\nBody'
  assert.equal(extractEligibleNews({ text, entities: [bold(prefix.length, title.length)] }).title, title)
  for (const entity of [bold(-1, 100), bold(0.5, 10), bold(0, 9999), bold(0, 0), bold(1, title.length - 1)]) {
    assert.equal(extractEligibleNews({ text: title, entities: [entity] }), null)
  }
})
test('overlapping entities do not inflate coverage; bold spanning newline uses first line only', () => {
  assert.equal(extractEligibleNews({ text: 'Short fragment and ordinary body', entities: [bold(0, 5), bold(0, 5)] }), null)
  const text = heading + '\nBody'
  assert.equal(extractEligibleNews({ text, entities: [bold(0, text.length)] }).excerpt, 'Body')
})
test('edit adds heading: ignored post becomes visible; later edits replace title/excerpt', () => {
  assert.deepEqual(decideNewsEligibility({ text: heading }, null), { action: 'ignore' })
  const added = decideNewsEligibility(post(), null)
  assert.equal(added.action, 'upsert'); assert.equal(added.content.hidden, 0)
  const title = 'Обновлённый заголовок'
  const edited = decideNewsEligibility({ text: title + '\nНовый текст', entities: [bold(0, title.length)] }, added.content)
  assert.deepEqual(edited, { action: 'upsert', content: { title, excerpt: 'Новый текст', hidden: 0 } })
})
test('edit removes heading: hide preserves previous qualifying text; adding it again unhides', () => {
  const original = decideNewsEligibility(post(), null).content
  const hidden = decideNewsEligibility({ text: 'Сегодня победил Hayden Wilde', entities: [bold(16, 12)] }, original)
  assert.deepEqual(hidden, { action: 'hide', content: { ...original, hidden: 1 } })
  assert.equal([hidden.content].filter(row => !row.hidden).length, 0)
  assert.deepEqual(decideNewsEligibility({ caption: heading, caption_entities: [bold(0, heading.length)] }, hidden.content), {
    action: 'upsert', content: { title: heading, excerpt: '', hidden: 0 },
  })
  assert.equal(decideNewsEligibility({}, original).action, 'hide')
})


test('997 heading UTF-16 boundaries and Unicode decorative suffixes', () => {
  const words = 'Каспер Сторнс мимо Коны', title = words + ' 🚑'
  assert.equal(words.length, 23); assert.equal(title.length, 26); assert.equal([...title].length, 25)
  assert.equal(title.charCodeAt(24), 0xd83d); assert.equal(title.charCodeAt(25), 0xde91)
  for (const content of [
    { text:title, entities:[bold(0,26)] },
    { text:title, entities:[bold(0,23),bold(24,2)] },
    ...[' 🚑',' 🚑🏆🔥',' ☀️',' 👩🏽‍⚕️',' 🇳🇴',' 1️⃣','!!!',' — «»'].map(suffix=>({text:words+suffix,entities:[bold(0,23)]})),
    {text:'Да 👩‍⚕️',entities:[bold(0,2)]},
    {text:'Да 🚑🏆',entities:[bold(0,2),bold(5,2)]},
  ]) {
    for (const source of ['text','caption']) {
      const message = source==='text'?content:{caption:content.text,caption_entities:content.entities}
      assert.equal(extractEligibleNews(message)?.title,content.text)
    }
  }
  assert.equal(evaluateNews({text:title,entities:[bold(0,25)]}).reason,'INVALID_ENTITY_BOUNDARY')
  assert.equal(evaluateNews({text:title,entities:[bold(0,23),bold(25,1)]}).reason,'INVALID_ENTITY_BOUNDARY')
  assert.equal(evaluateNews({text:title,entities:[bold(0,26),bold(25,1)]}).reason,'INVALID_ENTITY_BOUNDARY')
  for(const [text,entities,reason] of [
    [words+' слово',[bold(0,23)],'UNFORMATTED_TEXT_AFTER_HEADING'],
    [words,[bold(7,16)],'UNFORMATTED_TEXT_BEFORE_HEADING'],
    [words,[],'NO_BOLD'],
    ['Да +',[bold(0,2)],'UNSUPPORTED_DECORATION'],
    ['Да \u200d',[bold(0,2)],'UNSUPPORTED_DECORATION'],
  ]) assert.equal(evaluateNews({text,entities}).reason,reason)
  assert.equal(evaluateNews({text:words,caption:words,entities:[bold(0,23)]}).reason,'UNSUPPORTED_CONTENT')
})


test('decorative prefixes, suffixes and internal emoji never replace the bold-text requirement', () => {
  const accepted = [
    ['🔥🔥🔥 ', 'Чемпионат мира превзошел все ожидания', ''],
    ['', 'Чемпионат мира превзошел все ожидания', ' 🔥🔥🔥'],
    ['🔥 ', 'Чемпионат мира превзошел все ожидания', ' 🏆'],
    ['🇳🇴 ', 'Блюмменфельт снова побеждает', ''],
    ['🏊‍♂️🚴‍♂️🏃‍♂️ ', 'IRONMAN Kona — уже завтра', ' 🌴'],
    ['🔥🔥🔥🔥🔥 ', 'Кона завтра', ' 🔥🔥🔥🔥🔥'],
    ['«', 'Кона завтра', '»!!!'],
    ['☀️ 👩🏽‍⚕️ ', 'Кона завтра', ' 🏆'],
    ['', 'Кона 🔥 завтра', ''],
  ]
  for (const [prefix, words, suffix] of accepted) {
    const title = prefix + words + suffix, text = '\n  ' + title + '  \nBody\nNext'
    for (const entities of [[bold(3 + prefix.length, words.length)], [bold(3, title.length)]]) {
      for (const source of ['text', 'caption']) {
        const input = source === 'text' ? {text, entities} : {caption:text, caption_entities:entities}
        assert.equal(extractEligibleNews(input)?.title, title)
        assert.equal(extractEligibleNews(input)?.excerpt, 'Body\nNext')
      }
    }
  }
  assert.ok(extractEligibleNews({text:'Кона 🔥 завтра', entities:[bold(0,4),bold(8,6)]}))
  assert.ok(extractEligibleNews({text:'Кона', entities:[bold(0,2),bold(2,2)]}))
  for (const [prefix, words, suffix, reason] of [
    ['Сегодня ', 'Чемпионат мира превзошел все ожидания', '', 'UNFORMATTED_TEXT_BEFORE_HEADING'],
    ['🔥 Сегодня ', 'Чемпионат мира', '', 'UNFORMATTED_TEXT_BEFORE_HEADING'],
    ['🔥 ', 'Чемпионат мира', ' превзошел все ожидания', 'UNFORMATTED_TEXT_AFTER_HEADING'],
    ['', 'Каспер Сторнс', ' мимо Коны 🚑', 'UNFORMATTED_TEXT_AFTER_HEADING'],
    ['', 'Кона завтра', ' important update', 'UNFORMATTED_TEXT_AFTER_HEADING'],
  ]) assert.equal(evaluateNews({text:prefix+words+suffix, entities:[bold(prefix.length,words.length)]}).reason,reason)
  assert.equal(evaluateNews({text:'Кона уже завтра',entities:[bold(0,4),bold(9,6)]}).reason,'PARTIALLY_FORMATTED_HEADING')
  assert.equal(evaluateNews({text:'🔥 Кона 🏆',entities:[bold(0,2)]}).reason,'NO_BOLD')
  assert.equal(evaluateNews({text:'🔥 Кона',entities:[bold(1,6)]}).reason,'INVALID_ENTITY_BOUNDARY')
})
