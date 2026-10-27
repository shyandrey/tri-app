import assert from 'node:assert/strict'

// Document content excludes a classic scrollbar; device viewport still drives CSS vw.
export function assertDocumentWidth({clientWidth, scrollWidth}) {
  assert.ok(clientWidth > 0, 'Positive available content width')
  assert.equal(scrollWidth, clientWidth, 'Document must not overflow horizontally')
}
export function assertEdgeToEdge({left, width}, contentWidth) {
  assert.equal(left, 0, 'Showcase starts at content edge')
  assert.equal(width, contentWidth, 'Showcase fills available content width')
}
export function assertResponsiveHeight(actual, viewportWidth, viewportHeight) {
  const expected = viewportWidth > viewportHeight ? viewportWidth / 5.5 : viewportWidth >= 1024 ? 320 : viewportWidth / 2.35
  assert.ok(Math.abs(actual - expected) < 1, 'Approved viewport-based showcase height')
}
export function isSnapAt(left, index, trackWidth) {
  return trackWidth > 0 && Math.abs(left - index * trackWidth) < 1
}
export function verifyGeometryFixtures() {
  for (const width of [1440, 1425, 390]) {
    assertDocumentWidth({clientWidth: width, scrollWidth: width})
    assertEdgeToEdge({left: 0, width}, width)
    assert.ok(isSnapAt(width, 1, width))
  }
  assertResponsiveHeight(1440 / 5.5, 1440, 900)
  assertResponsiveHeight(390 / 2.35, 390, 844)
  assert.throws(() => assertDocumentWidth({clientWidth: 1425, scrollWidth: 1426}))
  assert.throws(() => assertEdgeToEdge({left: 0, width: 1424}, 1425))
  assert.throws(() => assertEdgeToEdge({left: 1, width: 1425}, 1425))
  assert.equal(isSnapAt(1424, 1, 1425), false)
  assert.equal(isSnapAt(1440, 1, 1425), false)
  assert.throws(() => assertResponsiveHeight(1425 / 5.5, 1440, 900))
  assert.throws(() => assertResponsiveHeight(390 / 5.5, 390, 844))
  console.log('PASS geometry fixtures: valid overlay/classic/mobile widths; reject overflow, undersizing, inset, wrong snap and wrong responsive heights')
}
