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
  const keyBuf = getEncryptionKey()
  const ivBuf = crypto.randomBytes(12)
  const key = new Uint8Array(keyBuf)
  const iv = new Uint8Array(ivBuf)
  const secret = crypto.createSecretKey(key)
  const cipher = crypto.createCipheriv('aes-256-gcm', secret, iv)
  const jsonBuf = Buffer.from(JSON.stringify(payload))
  const json = new Uint8Array(jsonBuf)
  const encBuf = Buffer.concat([cipher.update(json), cipher.final()])
  const tagBuf = cipher.getAuthTag()
  return {
    iv: Buffer.from(iv).toString('base64'),
    tag: Buffer.from(tagBuf).toString('base64'),
    data: encBuf.toString('base64'),
  }
}

export function aesDecrypt(blob: { iv: string; tag: string; data: string } | null) {
  if (!blob || !blob.iv || !blob.tag || !blob.data) return null
  const keyBuf = getEncryptionKey()
  const ivBuf = Buffer.from(blob.iv, 'base64')
  const tagBuf = Buffer.from(blob.tag, 'base64')
  const dataBuf = Buffer.from(blob.data, 'base64')
  const key = new Uint8Array(keyBuf)
  const iv = new Uint8Array(ivBuf)
  const tag = new Uint8Array(tagBuf)
  const data = new Uint8Array(dataBuf)
  const secret = crypto.createSecretKey(key)
  const decipher = crypto.createDecipheriv('aes-256-gcm', secret, iv)
  decipher.setAuthTag(Buffer.from(tag))
  const dec = Buffer.concat([decipher.update(Buffer.from(data)), decipher.final()])
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
