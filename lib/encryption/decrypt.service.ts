import crypto from 'crypto'

export interface EncryptedBlob {
    iv: string
    tag: string
    data: string
}

export class DecryptionService {
    private static getEncryptionKeys(): Buffer[] {
        const keys: Buffer[] = []
        const rawKeys = [
            process.env.ENCRYPTION_KEY,
            process.env.DATA_ENCRYPTION_KEY,
            process.env.ENCRYPTION_KEY_LEGACY,
            process.env.ENCRYPTION_KEY_BACKUP
        ].filter(Boolean) as string[]

        for (const raw of rawKeys) {
            let key: Buffer | null = null

            // 1. 32-byte hex string
            if (/^[0-9a-f]{64}$/i.test(raw)) {
                key = Buffer.from(raw, 'hex')
            }
            // 2. Base64
            else if (/^[A-Za-z0-9+/=]+$/.test(raw)) {
                try {
                    const buf = Buffer.from(raw, 'base64')
                    if (buf.length === 32) key = buf
                } catch { }
            }

            // 3. Fallback: SHA-256
            if (!key) {
                key = crypto.createHash('sha256').update(raw).digest()
            }

            if (key) keys.push(key)
        }

        return keys
    }

    /**
     * Decrypts a single encrypted blob or string representation.
     * Returns the original value if it's plain text (not encrypted).
     * Returns "[Unavailable]" only when decryption of encrypted data fails.
     */
    public static decrypt(input: string | any): any {
        if (!input) return null

        // If it's not a string, check if it's an encrypted object
        if (typeof input !== 'string') {
            if (!this.isEncryptedObject(input)) {
                return input // Return non-encrypted objects as-is
            }
        }

        // Try to parse as encrypted format
        const blob = this.parseEncryptedInput(input)

        // If parsing fails, the input is likely plain text - return it as-is
        if (!blob) {
            return input
        }

        const keys = this.getEncryptionKeys()
        if (keys.length === 0) {
            console.error('CRITICAL: Encryption keys missing for decryption.')
            return "[Unavailable]"
        }

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            try {
                const secret = crypto.createSecretKey(key)
                const iv = Buffer.from(blob.iv, 'base64')
                const tag = Buffer.from(blob.tag, 'base64')
                const data = Buffer.from(blob.data, 'base64')

                const decipher = crypto.createDecipheriv('aes-256-gcm', secret, iv)
                decipher.setAuthTag(tag)

                const decrypted = Buffer.concat([decipher.update(data), decipher.final()])
                const result = decrypted.toString('utf-8')

                try {
                    return JSON.parse(result)
                } catch {
                    return result
                }
            } catch (error: any) {
                // If it's the last key and it still fails, log it and return unavailable
                if (i === keys.length - 1) {
                    console.error('All decryption keys failed:', error.message)
                    return "[Unavailable]"
                }
                // Otherwise, continue to the next key (fallback)
            }
        }

        return "[Unavailable]"
    }


    /**
     * Batch decrypts an array of objects.
     */
    public static decryptArray<T>(items: T[], fields: (keyof T)[]): T[] {
        if (!items || !Array.isArray(items)) return []
        return items.map(item => this.decryptObject(item, fields))
    }

    /**
     * Decrypts specified fields in a single object.
     */
    public static decryptObject<T>(item: T, fields: (keyof T)[]): T {
        if (!item) return item
        const decrypted = { ...item }

        for (const field of fields) {
            if (decrypted[field]) {
                decrypted[field] = this.decrypt(decrypted[field])
            }
        }

        return decrypted
    }

    private static isEncryptedObject(obj: any): boolean {
        if (!obj || typeof obj !== 'object') return false
        const iv = obj.iv || obj.IV
        const tag = obj.tag || obj.TAG
        const data = obj.data || obj.DATA
        return !!(iv && tag && data)
    }

    private static parseEncryptedInput(input: string | any): EncryptedBlob | null {
        if (typeof input !== 'string') {
            if (this.isEncryptedObject(input)) {
                return {
                    iv: input.iv || input.IV,
                    tag: input.tag || input.TAG,
                    data: input.data || input.DATA
                }
            }
            return null
        }

        const trimmedInput = input.trim()

        try {
            // 1. standard JSON format: {"iv":"...","tag":"...","data":"..."}
            if (trimmedInput.startsWith('{')) {
                const parsed = JSON.parse(trimmedInput)
                if (this.isEncryptedObject(parsed)) {
                    return {
                        iv: parsed.iv || parsed.IV,
                        tag: parsed.tag || parsed.TAG,
                        data: parsed.data || parsed.DATA
                    }
                }
            }

            // 2. Legacy format: ("IV^:"xxx","TAG^:"yyy","DATA^:"zzz")
            if (trimmedInput.startsWith('(')) {
                const matches = trimmedInput.matchAll(/"([^"^]+)\^:"([^"]+)"/g)
                const obj: any = {}
                for (const m of matches) {
                    obj[m[1].toLowerCase()] = m[2]
                }
                if (obj.iv && obj.tag && obj.data) {
                    return obj as EncryptedBlob
                }
            }

            // 3. Colon format: IV:TAG:DATA
            if (trimmedInput.includes(':')) {
                const parts = trimmedInput.split(':')
                if (parts.length === 3) {
                    return { iv: parts[0], tag: parts[1], data: parts[2] }
                }
            }
        } catch (e) {
            return null
        }

        return null
    }
}
