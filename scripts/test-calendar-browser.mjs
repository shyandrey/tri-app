import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
const targets = await (await fetch((process.env.TRI_CDP_URL ?? 'http://127.0.0.1:9232') + '/json/list')).json()
const socket = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl)
await new Promise(resolve => { socket.onopen = resolve })
let sequence = 0
const pending = new Map()
socket.onmessage = event => {
  const data = JSON.parse(event.data)
  if (!data.id) return
  const p = pending.get(data.id); pending.delete(data.id)
  if (data.error) p.reject(Error(JSON.stringify(data.error))); else p.resolve(data.result)
}
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++sequence; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params }))
})
const js = async expression => {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description)
  return result.result.value
}
const click = async selector => { await js(`document.querySelector(${JSON.stringify(selector)}).click()`); await wait(120) }
const query = async value => {
  await js(`(()=>{const i=document.querySelector('.calendar-search');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(i,${JSON.stringify(value)});i.dispatchEvent(new Event('input',{bubbles:true}))})()`)
  await wait(120)
}
const cards = () => js(`[...document.querySelectorAll('.race-card')].map(e=>[e.querySelector('.race-card__title').textContent,e.querySelector('.race-card__info-item span').textContent])`)
const count = async n => assert.equal((await cards()).length, n)
const snapshot = async (width, name, fullPage = false) => {
  await js('window.scrollTo({top:0,behavior:"instant"})'); await wait(80)
  const params = { format: 'png', captureBeyondViewport: fullPage }
  if (fullPage) {
    const metrics = await send('Page.getLayoutMetrics')
    params.clip = { x: 0, y: 0, width: metrics.cssContentSize.width, height: metrics.cssContentSize.height, scale: 1 }
  }
  const image = await send('Page.captureScreenshot', params)
  await fs.writeFile(`/tmp/tri-calendar-fix-${width}-${name}.png`, Buffer.from(image.data, 'base64'))
}
await send('Page.enable'); await send('Runtime.enable')
const clock = await send('Page.addScriptToEvaluateOnNewDocument', { source: `(()=>{const RealDate=Date;globalThis.Date=class extends RealDate{constructor(...args){super(...(args.length?args:['2026-10-02T09:00:00Z']))}static now(){return RealDate.parse('2026-10-02T09:00:00Z')}}})()` })
try {
  for (const [width, height] of [[390, 844], [844, 390], [1440, 900]]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 1000 })
    await send('Page.navigate', { url: (process.env.TRI_APP_URL ?? 'http://127.0.0.1:5197') + '/?calendarTest=' + Date.now() + '#/calendar' })
    await wait(900); await count(4)
    assert.deepEqual((await cards()).map(c => c[0]), ['IRONMAN World Championship', 'Dubai T100', 'Saudi Arabia T100', 'Qatar T100 Final'])
    await snapshot(width, 'default')
    const filters = ['Все', 'IRONMAN Pro Series', 'Triathlon World Tour']
    for (const [index, counts] of [[1, [4, 1, 3]], [2, [21, 15, 6]], [3, [25, 16, 9]]]) {
      await click(`.calendar-time-filters button:nth-child(${index})`)
      for (const [i, series] of filters.entries()) {
        await click(`.calendar-filters button[aria-label="${series}"]`); await count(counts[i])
      }
    }
    await click('.calendar-filters button[aria-label="Все"]')
    await click('.calendar-time-filters button:nth-child(2)'); await count(21); await snapshot(width, 'finished')
    const before = await cards()
    // Use separate interactions, as a user would when opening the two archives.
    for (let i = 0; i < 2; i++) {
      if (await js(`document.querySelectorAll('.calendar-archive__toggle')[${i}].getAttribute('aria-expanded')==='false'`)) {
        await js(`document.querySelectorAll('.calendar-archive__toggle')[${i}].click()`); await wait(120)
      }
    }
    await count(73)
    assert.deepEqual(await js(`[...document.querySelectorAll('.calendar-archive__races')].map(e=>e.querySelectorAll('.race-card').length)`), [26, 26])
    await snapshot(width, 'archives', true)
    const saved = await js('history.state.triNavigation.ui.calendar')
    await js('window.scrollTo({top:650,behavior:"instant"})'); await wait(200)
    await click('.race-card'); assert.ok((await js('location.hash')).startsWith('#/race/'))
    await click('.page-back-button'); await wait(200)
    assert.deepEqual(await js('history.state.triNavigation.ui.calendar'), saved)
    assert.ok(Math.abs(await js('scrollY') - 650) < 3); await count(73)
    await click('.calendar-time-filters button:nth-child(1)')
    await click('.calendar-filters button[aria-label="IRONMAN Pro Series"]'); await count(1)
    await query('T100'); await count(25)
    assert.equal(await js(`document.querySelector('.calendar-search-notice').textContent`), 'Поиск по всем гонкам — фильтры временно не применяются')
    assert.ok((await cards()).some(c => c[1].endsWith('2024')))
    await snapshot(width, 'search')
    await query('zzznorace'); await count(0)
    assert.equal(await js(`document.querySelector('[role="status"]').textContent`), 'Гонки не найдены')
    await snapshot(width, 'empty')
    await query('2025'); await count(0)
    await click('.calendar-search-clear'); await count(1)
    assert.equal(await js(`document.querySelector('.calendar-search-notice')===null`), true)
    await click('.calendar-filters button[aria-label="Все"]')
    await click('.calendar-time-filters button:nth-child(2)'); await count(73)
    // Main cards are identical after a different filter/search click sequence.
    assert.deepEqual((await cards()).slice(0, 21), before)
    assert.equal(await js('document.documentElement.scrollWidth>innerWidth'), false)
    console.log(`PASS ${width}×${height}: filters, archives, search/clear/empty, deterministic order, Back/scroll, no overflow`)
  }
} finally {
  await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: clock.identifier })
  socket.close()
}
