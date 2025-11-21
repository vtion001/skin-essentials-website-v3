import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import crypto from 'crypto'

export function getEncryptionKey() {
  const raw = process.env.DATA_ENCRYPTION_KEY || ''
  if (!raw || raw.length < 32) {
    return crypto.createHash('sha256').update('fallback_key').digest()
  }
  if (/^[A-Za-z0-9+/=]+$/.test(raw)) {
    try {
      const buf = Buffer.from(raw, 'base64')
      if (buf.length === 32) return buf
    } catch {}
  }
  return crypto.createHash('sha256').update(raw).digest()
}

export function aesEncrypt(payload: any) {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const json = Buffer.from(JSON.stringify(payload))
  const enc = Buffer.concat([cipher.update(json), cipher.final()])
  const tag = cipher.getAuthTag()
  return {
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    data: enc.toString('base64'),
  }
}

export function aesDecrypt(blob: { iv: string; tag: string; data: string } | null) {
  if (!blob || !blob.iv || !blob.tag || !blob.data) return null
  const key = getEncryptionKey()
  const iv = Buffer.from(blob.iv, 'base64')
  const tag = Buffer.from(blob.tag, 'base64')
  const data = Buffer.from(blob.data, 'base64')
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  const dec = Buffer.concat([decipher.update(data), decipher.final()])
  try {
    return JSON.parse(dec.toString('utf-8'))
  } catch {
    return null
  }
}

export function aesEncryptToString(payload: any) {
  const blob = aesEncrypt(payload)
  return JSON.stringify(blob)
}

export function aesDecryptFromString(str: string | null) {
  if (!str) return null
  try {
    const obj = JSON.parse(str)
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
