import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { approvedBiographies } from './approved-biography-contract.mjs'
const targets = await (await fetch(`${process.env.TRI_CDP_URL ?? 'http://127.0.0.1:9231'}/json/list`)).json()
const socket = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl)
await new Promise(resolve => { socket.onopen = resolve })
let sequence = 0
const pending = new Map(), errors = []
socket.onmessage = event => {
  const message = JSON.parse(event.data)
  if (message.id) {
    const entry = pending.get(message.id); pending.delete(message.id)
    if (message.error) entry.reject(Error(JSON.stringify(message.error)))
    else entry.resolve(message.result)
  } else if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails)
}
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++sequence; pending.set(id, {resolve, reject}); socket.send(JSON.stringify({id, method, params}))
})
const evaluate = async expression => {
  const result = await send('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true})
  if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description)
  return result.result.value
}
const until = async expression => {
  const end = Date.now() + 10000
  do { if (await evaluate(expression)) return; await new Promise(r => setTimeout(r, 50)) } while (Date.now() < end)
  throw Error(`Timed out: ${expression}`)
}
const output = process.env.TRI_ARTIFACT_DIR ?? '/tmp/300w-approved-biographies-browser'
await fs.mkdir(output, {recursive: true})
try {
  await send('Runtime.enable'); await send('Page.enable')
  for (const [width, height] of [[390,844], [1440,900]]) {
    await send('Emulation.setDeviceMetricsOverride', {width, height, deviceScaleFactor:1, mobile:width<600})
    const rows = width === 390 ? approvedBiographies : approvedBiographies.filter(row=>[1,10,28,104,10521,10736].includes(row.id))
    for (const row of rows) {
      await send('Page.navigate', {url:`${process.env.TRI_APP_URL ?? 'http://127.0.0.1:5480'}/#/athlete/${row.id}`})
      await until(`!!document.querySelector('.athlete-detail__bio-list') && document.querySelector('.athlete-detail__meta')?.textContent === ${JSON.stringify(row.nameEn)}`)
      await evaluate(`(()=>{const button=document.querySelector('.athlete-detail__about .athlete-detail__section-toggle');if(button.getAttribute('aria-expanded')!=='true')button.click()})()`)
      await until("document.querySelector('.athlete-detail__about .athlete-detail__section-toggle')?.getAttribute('aria-expanded') === 'true'")
      const paragraphs = await evaluate(`[...document.querySelectorAll('.athlete-detail__bio-list li')].map(p=>p.textContent)`)
      assert.deepEqual(paragraphs, row.bio.split('\n\n'), `${width}px exact paragraphs, ID ${row.id}`)
      assert.ok(await evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth'), `overflow ID ${row.id}`)
      if ([1,10,28,104,10521,10736].includes(row.id)) {
        await until(`[...document.querySelectorAll('.athlete-detail__image')].every(i=>i.complete && i.naturalWidth>0)`)
        const image = await send('Page.captureScreenshot', {format:'png', captureBeyondViewport:false})
        await fs.writeFile(`${output}/${width}-${row.id}.png`, Buffer.from(image.data,'base64'))
      }
    }
    console.log(`PASS ${rows.length} biographies at ${width}×${height}: exact rendered paragraphs, no horizontal overflow`)
  }
  assert.deepEqual(errors, [])
} finally { socket.close() }
