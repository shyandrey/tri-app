import assert from 'node:assert/strict'

const base = process.env.TRI_APP_URL ?? 'http://127.0.0.1:5440'
const cdp = process.env.TRI_CDP_URL ?? 'http://127.0.0.1:9438'
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(base).hostname))
const target = (await (await fetch(`${cdp}/json/list`)).json()).find(t => t.type === 'page')
const socket = new WebSocket(target.webSocketDebuggerUrl)
await new Promise(resolve => { socket.onopen = resolve })
let sequence = 0
let failImport = false
let failedRequests = 0
const pending = new Map(), held = [], requests = []
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++sequence
  const timer = setTimeout(() => { pending.delete(id); reject(Error(`CDP timeout: ${method}`)) }, 10000)
  pending.set(id, { resolve, reject, timer })
  socket.send(JSON.stringify({ id, method, params }))
})
socket.onmessage = event => {
  const d = JSON.parse(event.data)
  if (d.id) {
    const p = pending.get(d.id)
    if (!p) return
    pending.delete(d.id); clearTimeout(p.timer)
    if (d.error) p.reject(Error(JSON.stringify(d.error))); else p.resolve(d.result)
  } else if (d.method === 'Fetch.requestPaused') {
    if (failImport) { failedRequests++; void send('Fetch.failRequest', { requestId: d.params.requestId, errorReason: 'Failed' }) }
    else held.push(d.params.requestId)
  }
  else if (d.method === 'Network.requestWillBeSent') requests.push(d.params)
}
const js = async expression => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true })
  if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description)
  return r.result.value
}
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
const until = async expression => {
  for (let n = 0; n < 100; n++) { if (await js(expression)) return; await wait(50) }
  throw Error(`Condition not reached: ${expression}`)
}
const reload = async () => {
  const previousOrigin = await js('performance.timeOrigin')
  await send('Page.reload', { ignoreCache: true })
  await until(`performance.timeOrigin !== ${previousOrigin}`)
}
await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable')
const fixture = await send('Page.addScriptToEvaluateOnNewDocument', { source: 'Math.random=()=>0.99' })
try {
  for (const [width, height] of [[390, 844], [1440, 900]]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 1000 })
    await send('Page.navigate', { url: 'about:blank' })
    await send('Network.clearBrowserCache')
    await send('Fetch.enable', { patterns: [{ urlPattern: '*rankings-entry-*.js' }] })
    requests.length = 0
    const nav = await send('Page.navigate', { url: `${base}/?startup-test=${width}#/rankings` })
    await until('!!document.querySelector("[data-route-pending]")')
    const pendingWidth = await js('document.getElementById("root").getBoundingClientRect().width')
    assert.equal(pendingWidth, await js('document.documentElement.clientWidth'))
    assert.ok(held.length, 'Rankings module must still be held while shell geometry is measured')
    for (const requestId of held.splice(0)) await send('Fetch.continueRequest', { requestId })
    await send('Fetch.disable')
    await until('!!document.querySelector(".standings-name") && [...document.querySelectorAll(".standings-showcase__art")].every(i=>i.complete&&i.naturalWidth>0)')
    assert.equal(await js('document.getElementById("root").getBoundingClientRect().width'), pendingWidth)
    const artworkRequests = requests.filter(r => r.loaderId === nav.loaderId && r.request.url.includes('/images/showcase/'))
    assert.equal(artworkRequests.length, 2, 'active plus adjacent artwork; no duplicate request')
    assert.equal(new Set(artworkRequests.map(r => r.request.url)).size, 2)
    assert.equal(requests.filter(r => r.loaderId === nav.loaderId && /\/sports-entry-.*\.js/.test(r.request.url)).length, 0, 'Rankings must not load the results/internal-ranking entry')
    assert.equal(await js('document.documentElement.scrollWidth>document.documentElement.clientWidth'), false)
    // Use persisted state directly to isolate restoration from gesture behavior (covered separately).
    await js(`history.replaceState({triNavigation:{...history.state.triNavigation,ui:{officialStandings:{series:'T100',season:2024,gender:'W'}}}},'')`)
    requests.length = 0
    await reload()
    await until(`!!document.querySelector('.official-standings[data-season="2024"][data-gender="W"]')`)
    assert.equal(await js('document.querySelector(".app--official-rankings").dataset.series'), 'T100')
    assert.equal(await js('document.getElementById("root").getBoundingClientRect().width'), pendingWidth)
    await js(`document.querySelector('.rankings-table-panel:not([inert]) tbody a').click()`)
    await until('!!document.querySelector(".athlete-detail-page")')
    assert.ok(requests.some(r => /\/sports-entry-.*\.js/.test(r.request.url)), 'profile loads its own sports entry on demand')
    await js('document.querySelector(".page-back-button").click()')
    await until(`document.querySelector('.app--official-rankings')?.dataset.series==='T100' && document.querySelector('.rankings-table-panel:not([inert]) table')?.dataset.gender==='W'`)
    failedRequests = 0
    failImport = true
    await send('Network.clearBrowserCache')
    await send('Fetch.enable', { patterns: [{ urlPattern: '*rankings-entry-*.js' }] })
    await reload()
    await until('!!document.querySelector(".sports-loading__retry")')
    assert.ok(failedRequests > 0, 'fixture must actually reject the Rankings module request')
    assert.equal(await js('document.getElementById("root").getBoundingClientRect().width'), pendingWidth)
    failImport = false
    await send('Fetch.disable')
    await js('document.querySelector(".sports-loading__retry").click()')
    await until('!!document.querySelector(".standings-name")')
    assert.equal(await js('document.querySelector(".standings-season span").textContent'), '2024')
    console.log(`PASS ${width}×${height}: lazy Rankings only, stable shell, two artworks, restored selection, profile/Back, failed import/retry`)
  }
} finally {
  for (const requestId of held.splice(0)) await send('Fetch.continueRequest', { requestId })
  await send('Fetch.disable')
  await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: fixture.identifier })
  socket.close()
}
