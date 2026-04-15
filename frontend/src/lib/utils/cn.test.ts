import { describe, expect, it } from 'vitest'

import { cn } from './cn'

describe('cn', () => {
  it('merges class names and drops falsy fragments', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c')
  })
})
