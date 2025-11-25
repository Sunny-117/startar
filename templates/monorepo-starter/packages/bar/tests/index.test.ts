import { assert, test } from 'vitest'
import { bar } from '../src'

test('simple', () => {
  assert.equal(bar, 'bar')
})
