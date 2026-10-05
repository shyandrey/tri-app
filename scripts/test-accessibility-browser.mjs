import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const base = process.env.TRI_APP_URL ?? 'http://127.0.0.1:5390'
assert.ok(['localhost', '127.0.0.1'].includes(new URL(base).hostname))
const targets = await (await fetch((process.env.TRI_CDP_URL ?? 'http://127.0.0.1:9361') + '/json/list')).json()
const socket = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl)
await new Promise(resolve => { socket.onopen = resolve })
let sequence = 0
const pending = new Map()
socket.onmessage = event => { const d = JSON.parse(event.data); if (!d.id) return; const p = pending.get(d.id); pending.delete(d.id); d.error ? p.reject(Error(JSON.stringify(d.error))) : p.resolve(d.result) }
const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++sequence; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })) })
const js = async expression => { const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description); return r.result.value }
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
const start = async route => { await send('Page.navigate', { url: base + '/?a11y=' + Date.now() + '#/' + route }); await wait(850) }
const key = async (key, code, windowsVirtualKeyCode, text) => {
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode, ...(text ? { text } : {}) })
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode })
  await wait(40)
}
const tabTo = async selector => {
  for (let i = 0; i < 180; i++) { await key('Tab', 'Tab', 9); if (await js(`document.activeElement.matches(${JSON.stringify(selector)})`)) return }
  throw Error('Tab did not reach ' + selector)
}
const shot = async name => { const r = await send('Page.captureScreenshot', { format: 'png' }); await fs.writeFile(`/tmp/tri-a11y-${name}.png`, Buffer.from(r.data, 'base64')) }
const focus = async () => {
  const value = await js('({visible:document.activeElement.matches(":focus-visible"),width:getComputedStyle(document.activeElement).outlineWidth,style:getComputedStyle(document.activeElement).outlineStyle,name:document.activeElement.getAttribute("aria-label")||document.activeElement.textContent})')
  assert.equal(value.visible, true); assert.equal(value.width, '2px'); assert.equal(value.style, 'solid'); assert.ok(value.name.trim())
}
const activate = async (expected, space = false) => {
  const before = await js('window.navigationPushes')
  await key(space ? ' ' : 'Enter', space ? 'Space' : 'Enter', space ? 32 : 13, space ? ' ' : '\r'); await wait(400)
  assert.equal(await js('history.state.triNavigation.route.page'), expected)
  assert.equal(await js('window.navigationPushes'), before + 1, 'exactly one navigation per activation')
}
await send('Page.enable'); await send('Runtime.enable')
const instrumentation = await send('Page.addScriptToEvaluateOnNewDocument', { source: 'window.navigationPushes=0;const push=history.pushState.bind(history);history.pushState=(...args)=>{window.navigationPushes++;return push(...args)}' })
try {
  for (const [width, height] of [[390, 844], [440, 844], [844, 390], [1440, 900]]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 1000 })
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: width === 440 ? 'light' : 'dark' }, { name: 'prefers-reduced-motion', value: 'reduce' }] })
    await start('calendar'); assert.equal(await js('document.documentElement.lang'), 'ru')
    await tabTo('.race-card .card-navigation-target'); await focus(); await shot(`race-${width}`); await activate('race')
    await js('history.back()'); await wait(350); assert.equal(await js('location.hash'), '#/calendar')
    const point = await js('(()=>{const e=document.querySelector(".race-card .card-navigation-target");e.scrollIntoView({block:"center",behavior:"instant"});const r=e.getBoundingClientRect();return {x:r.right-10,y:r.top+10}})()')
    const pointerBefore = await js('window.navigationPushes')
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 })
    assert.equal(await js('document.querySelector(".race-card .card-navigation-target").matches(":focus-visible")'), false)
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 }); await wait(350)
    assert.equal(await js('history.state.triNavigation.route.page'), 'race')
    assert.equal(await js('window.navigationPushes'), pointerBefore + 1)
    await start('athletes'); await tabTo('.athlete-card .card-navigation-target'); await focus(); await shot(`athlete-${width}`)
    const cardHeight = await js('document.activeElement.closest("article").getBoundingClientRect().height')
    if (width < 641) assert.equal(cardHeight, 80)
    await activate('athlete')
    await js('history.back()'); await wait(350); assert.equal(await js('location.hash'), '#/athletes')
    await tabTo('.athlete-card .card-navigation-target'); await activate('athlete', true)
    await start('race/ironman-70-3-world-championship-2026-men')
    if (width >= 701) {
      await tabTo('.results-table__profile'); await focus()
      assert.equal(await js('getComputedStyle(document.activeElement).letterSpacing'), await js('getComputedStyle(document.activeElement.closest("td")).letterSpacing'))
      await shot(`desktop-result-${width}`); await activate('athlete')
    }
    assert.equal(await js('document.documentElement.scrollWidth'), width)
    console.log(`PASS ${width}: Tab/Enter/native Space, visible focus/name, single navigation, lang, geometry`)
  }
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  await start('home')
  const slide = () => js('({x:document.querySelector(".home-showcase__track").scrollLeft,index:[...document.querySelectorAll(".home-showcase__hint span")].findIndex(e=>e.classList.contains("is-active"))})')
  const initial = await slide(); await wait(4400); assert.deepEqual(await slide(), initial, 'real autoplay interval must not move under reduce')
  await js('(()=>{const track=document.querySelector(".home-showcase__track"),card=track.children[1];track.scrollTo({left:card.offsetLeft-(track.clientWidth-card.clientWidth)/2,behavior:"instant"})})()'); await wait(350)
  const manual = await slide(); assert.equal(manual.index, 1); await wait(4400); assert.deepEqual(await slide(), manual, 'manual slide remains stable under reduce')
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] })
  await wait(4600); assert.notEqual((await slide()).index, manual.index, 'normal autoplay resumes on preference change')
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await wait(350); const stopped = await slide(); await wait(4400); assert.deepEqual(await slide(), stopped, 'live reduce preference clears running timer')
  await start('calendar'); await wait(4300); assert.equal(await js('location.hash'), '#/calendar')
  console.log('PASS real timer: reduced autoplay disabled, manual scroll works, preference changes stop/resume, unmount cleanup')
} finally { await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: instrumentation.identifier }); socket.close() }
