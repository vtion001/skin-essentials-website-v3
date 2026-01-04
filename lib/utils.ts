import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import crypto from 'crypto'

export function getEncryptionKey() {
  const raw = process.env.DATA_ENCRYPTION_KEY || ''
  if (!raw) return null

  // If it's already a 32-byte hex string
  if (/^[0-9a-f]{64}$/i.test(raw)) {
    return Buffer.from(raw, 'hex')
  }

  // If it's a base64 string
  if (/^[A-Za-z0-9+/=]+$/.test(raw)) {
    try {
      const buf = Buffer.from(raw, 'base64')
      if (buf.length === 32) return buf
    } catch { }
  }

  // Fallback: Hash the raw string to get a deterministic 32-byte key
  return crypto.createHash('sha256').update(raw).digest()
}

export function aesEncrypt(payload: any) {
  const keyBuf = getEncryptionKey()
  const secret = crypto.createSecretKey(keyBuf as any)
  const ivArr = new Uint8Array(crypto.randomBytes(12))
  const cipher = crypto.createCipheriv('aes-256-gcm', secret, ivArr)
  const jsonBytes = new TextEncoder().encode(JSON.stringify(payload))
  const encBuf = Buffer.concat([cipher.update(jsonBytes as any), cipher.final() as any])
  const tagBuf = cipher.getAuthTag()
  return {
    iv: Buffer.from(ivArr).toString('base64'),
    tag: tagBuf.toString('base64'),
    data: encBuf.toString('base64'),
  }
}

export function aesDecrypt(blob: { iv: string; tag: string; data: string } | null) {
  if (!blob) return null

  // Normalize keys (handle case-insensitivity)
  const b: any = blob
  const iv = b.iv || b.IV
  const tag = b.tag || b.TAG
  const data = b.data || b.DATA

  if (!iv || !tag || !data) return null

  const decryptWithKey = (keyBuf: Buffer) => {
    try {
      const secret = crypto.createSecretKey(keyBuf)
      const ivArr = Buffer.from(iv, 'base64')
      const tagBuf = Buffer.from(tag, 'base64')
      const dataArr = Buffer.from(data, 'base64')

      const decipher = crypto.createDecipheriv('aes-256-gcm', secret, ivArr)
      decipher.setAuthTag(tagBuf)

      const dec = Buffer.concat([decipher.update(dataArr), decipher.final()])
      const result = dec.toString('utf-8')

      try {
        return JSON.parse(result)
      } catch {
        return result // Return as string if not JSON
      }
    } catch (e) {
      return null
    }
  }

  // HIPAA: Only decrypt with configured system key. No hardcoded fallbacks allowed.
  const primaryKey = getEncryptionKey()
  if (!primaryKey) {
    console.error('CRITICAL: Data encryption key is not configured.')
    return null
  }

  return decryptWithKey(primaryKey)
}


export function aesEncryptToString(payload: any) {
  const blob = aesEncrypt(payload)
  return JSON.stringify(blob)
}

export function aesDecryptFromString(str: any) {
  if (!str) return null
  if (typeof str !== 'string') return aesDecrypt(str)

  try {
    // 1. Try standard JSON
    if (str.startsWith('{')) {
      return aesDecrypt(JSON.parse(str))
    }

    // 2. Try reported "Legacy" format: ("IV^:"..." , "TAG^:"..." , "DATA^:"...")
    // Example: ("IV^:"GCAA/DKUWXN7PIOG","TAG^:"W8/ISC...","DATA^:"...")
    if (str.startsWith('(')) {
      const matches = str.matchAll(/"([^"^]+)\^:"([^"]+)"/g)
      const obj: any = {}
      for (const m of matches) {
        obj[m[1].toLowerCase()] = m[2]
      }
      if (obj.iv && obj.tag && obj.data) {
        return aesDecrypt(obj)
      }
    }

    // 3. Try common colon format: (IV:TAG:DATA)
    if (str.includes(':')) {
      const parts = str.split(':')
      if (parts.length === 3) {
        return aesDecrypt({ iv: parts[0], tag: parts[1], data: parts[2] })
      }
    }

    // 4. Last fallback: try a direct JSON parse if the above failed
    return aesDecrypt(JSON.parse(str))
  } catch {
    return null
  }
}

export function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex')
}

export function verifyCsrfToken(headers: Headers, cookiesMap: Map<string, string>) {
  const header = headers.get('x-csrf-token') || ''
  const cookie = cookiesMap.get('csrf_token') || ''
  return Boolean(header && cookie && header === cookie)
}
