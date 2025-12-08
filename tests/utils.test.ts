import { describe, it, expect, afterEach } from 'vitest'
import { getEncryptionKey } from '@/lib/utils'

describe('getEncryptionKey', () => {
  const original = process.env.DATA_ENCRYPTION_KEY

  afterEach(() => {
    process.env.DATA_ENCRYPTION_KEY = original
  })

  it('returns 32-byte buffer from base64', () => {
    const key = Buffer.alloc(32, 1)
    process.env.DATA_ENCRYPTION_KEY = key.toString('base64')
    const buf = getEncryptionKey()
    expect(buf).toBeInstanceOf(Buffer)
    expect(buf.length).toBe(32)
    expect(Buffer.compare(buf, key)).toBe(0)
  })

  it('derives key from string if not base64', () => {
    process.env.DATA_ENCRYPTION_KEY = 'not-base64-key'
    const buf = getEncryptionKey()
    expect(buf.length).toBe(32)
  })

  it('uses fallback when env missing/short', () => {
    process.env.DATA_ENCRYPTION_KEY = ''
    const buf = getEncryptionKey()
    expect(buf.length).toBe(32)
  })
})
