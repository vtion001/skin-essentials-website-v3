import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import crypto from 'crypto'

export function getEncryptionKey() {
  const raw = process.env.DATA_ENCRYPTION_KEY || ''
  if (!raw || raw.length < 32) {
    return null
  }
  if (/^[A-Za-z0-9+/=]+$/.test(raw)) {
    try {
      const buf = Buffer.from(raw, 'base64')
      if (buf.length === 32) return buf
    } catch { }
  }
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
  if (!blob || !blob.iv || !blob.tag || !blob.data) return null

  const decryptWithKey = (keyBuf: Buffer) => {
    try {
      const secret = crypto.createSecretKey(keyBuf as any)
      const ivArr = new Uint8Array(Buffer.from(blob.iv, 'base64'))
      const tagBuf = Buffer.from(blob.tag, 'base64')
      const dataArr = new Uint8Array(Buffer.from(blob.data, 'base64'))
      const decipher = crypto.createDecipheriv('aes-256-gcm', secret, ivArr)
      decipher.setAuthTag(tagBuf as any)
      const dec = Buffer.concat([decipher.update(dataArr as any), decipher.final() as any])
      return JSON.parse(dec.toString('utf-8'))
    } catch {
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
  try {
    const obj = typeof str === 'string' ? JSON.parse(str) : str
    return aesDecrypt(obj)
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
