import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn utility function', () => {
  it('merges class names correctly', () => {
    const result = cn('px-2 py-1', 'px-4')
    expect(result).toBe('py-1 px-4')
  })

  it('handles conditional classes', () => {
    const result = cn('base-class', {
      'active-class': true,
      'inactive-class': false,
    })
    expect(result).toBe('base-class active-class')
  })

  it('handles arrays of classes', () => {
    const result = cn(['class1', 'class2'], 'class3')
    expect(result).toBe('class1 class2 class3')
  })

  it('removes duplicate classes', () => {
    const result = cn('text-red-500', 'text-blue-500')
    expect(result).toBe('text-blue-500')
  })

  it('handles undefined and null values', () => {
    const result = cn('class1', undefined, null, 'class2')
    expect(result).toBe('class1 class2')
  })

  it('merges Tailwind classes intelligently', () => {
    const result = cn('p-4 text-sm', 'p-2 text-lg')
    expect(result).toBe('p-2 text-lg')
  })

  it('handles empty strings', () => {
    const result = cn('', 'class1', '', 'class2')
    expect(result).toBe('class1 class2')
  })

  it('returns empty string when no valid classes provided', () => {
    const result = cn(undefined, null, false, '')
    expect(result).toBe('')
  })

  it('preserves non-conflicting classes', () => {
    const result = cn('bg-red-500 text-white', 'border border-gray-200')
    expect(result).toBe('bg-red-500 text-white border border-gray-200')
  })

  it('handles complex Tailwind modifiers', () => {
    const result = cn(
      'hover:bg-blue-500 focus:outline-none',
      'hover:bg-green-500 focus:ring-2'
    )
    expect(result).toBe('focus:outline-none hover:bg-green-500 focus:ring-2')
  })
})