import test from 'node:test'
import assert from 'node:assert/strict'
import { createAsyncResource } from '../src/sports/resource.ts'
import { createServer } from 'vite'

test('concurrent callers share initialization and resolved data; rejection allows a fresh attempt', async () => {
  let calls = 0, resolve, reject
  const resource = createAsyncResource(() => { calls++; return new Promise((yes,no)=>{resolve=yes;reject=no}) })
  assert.equal(resource.peek(), undefined)
  const first=resource.load(),second=resource.load()
  assert.equal(first,second);assert.equal(calls,1)
  reject(Error('temporary failure'));await assert.rejects(first);await assert.rejects(second)
  const retry=resource.load();assert.equal(calls,2)
  const data={athletes:[1,2,3]};resolve(data)
  assert.equal(await retry,data);assert.equal(resource.peek(),data)
  assert.equal(await resource.load(),data);assert.equal(calls,2)
})
test('async sports data retains all catalog/results and exact original ranking order/scores', async () => {
  const server=await createServer({server:{middlewareMode:true,watch:null},appType:'custom',logLevel:'silent'})
  try {
    const data=await server.ssrLoadModule('/src/sports/data.ts')
    const again=await server.ssrLoadModule('/src/sports/data.ts')
    assert.equal(data.rankedAthletes,again.rankedAthletes)
    assert.equal(data.athletes.length,1167);assert.equal(data.linkedRaceResults.length,4493)
    const {allRaceEditionViews}=await server.ssrLoadModule('/src/data/raceEditions.ts')
    const {getRankingDatasetClock}=await server.ssrLoadModule('/src/utils/rankingDatasetClock.ts')
    const {calculateAthleteRanking,sortAthletesByRanking}=await server.ssrLoadModule('/src/utils/athleteRanking.ts')
    const clock=getRankingDatasetClock(data.athletes,data.linkedRaceResults,allRaceEditionViews)
    assert.deepEqual(data.athleteRanking,calculateAthleteRanking(data.athletes,data.linkedRaceResults,allRaceEditionViews,clock))
    assert.deepEqual(data.rankedAthletes,sortAthletesByRanking(data.athletes,data.linkedRaceResults,allRaceEditionViews,clock))
  } finally { await server.close() }
})
