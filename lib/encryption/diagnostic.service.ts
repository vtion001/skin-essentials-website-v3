import crypto from 'crypto'
import { logAudit } from '@/lib/audit-logger'

export interface DiagnosticResult {
    success: boolean
    issues: string[]
}

export interface KeyTestResult {
    keyValid: boolean
    keyPresent: boolean
    keyLength: number
    error?: string
}

export class EncryptionDiagnosticService {
    /**
     * Diagnose why specific records are failing decryption
     */
    public static async diagnoseDecryptionFailure(
        encryptedData: any,
        recordId: string,
        recordType: string,
        userId?: string
    ): Promise<DiagnosticResult> {
        const issues: string[] = []

        // Check 1: Is encryption key present?
        const key = process.env.ENCRYPTION_KEY || process.env.DATA_ENCRYPTION_KEY
        if (!key) {
            issues.push('ENCRYPTION_KEY environment variable not set')
        }

        // Check 2: Is data format valid?
        if (!this.isValidEncryptedFormat(encryptedData)) {
            issues.push('Invalid encrypted data format')
        }

        // Check 3: Are all components present (iv, tag, data)?
        if (!this.hasAllComponents(encryptedData)) {
            issues.push('Missing encryption components (iv, tag, or data)')
        }

        // Check 4: Is the key length correct?
        if (key && !this.isKeyLengthValid(key)) {
            issues.push(`Encryption key has incorrect length (${key.length}). Expected 64 chars (hex).`)
        }

        // Log diagnostic results for HIPAA audit
        if (userId) {
            await logAudit({
                userId,
                action: 'DECRYPTION_FAILED',
                resource: recordType,
                resourceId: recordId,
                status: 'FAILURE',
                details: {
                    diagnostic_issues: issues,
                    timestamp: new Date().toISOString(),
                    hasData: !!encryptedData
                }
            }).catch(() => { })
        }

        return { success: issues.length === 0, issues }
    }

    /**
     * Test decryption with current key
     */
    public static async testDecryptionKey(): Promise<KeyTestResult> {
        const keyStr = process.env.ENCRYPTION_KEY || process.env.DATA_ENCRYPTION_KEY
        try {
            if (!keyStr) {
                return {
                    keyValid: false,
                    keyPresent: false,
                    keyLength: 0,
                    error: 'Key missing'
                }
            }

            // Create test encrypted data
            const testText = 'HIPAA_TEST_DATA'
            const iv = crypto.randomBytes(12)
            const key = this.deriveKey(keyStr)
            const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)

            let encrypted = cipher.update(testText, 'utf8', 'base64')
            encrypted += cipher.final('base64')
            const tag = cipher.getAuthTag().toString('base64')

            // Attempt to decrypt
            const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
            decipher.setAuthTag(Buffer.from(tag, 'base64'))
            let decrypted = decipher.update(encrypted, 'base64', 'utf8')
            decrypted += decipher.final('utf8')

            return {
                keyValid: decrypted === testText,
                keyPresent: true,
                keyLength: keyStr.length
            }
        } catch (error: any) {
            return {
                keyValid: false,
                keyPresent: !!keyStr,
                keyLength: keyStr?.length || 0,
                error: error.message
            }
        }
    }

    private static isValidEncryptedFormat(data: any): boolean {
        if (!data) return false
        if (typeof data === 'object') {
            return !!((data.iv || data.IV) && (data.tag || data.TAG) && (data.data || data.DATA))
        }
        if (typeof data === 'string') {
            return data.includes('iv') || data.includes('IV^:') || data.includes(':')
        }
        return false
    }

    private static hasAllComponents(data: any): boolean {
        if (typeof data === 'object') {
            return !!((data.iv || data.IV) && (data.tag || data.TAG) && (data.data || data.DATA))
        }
        return true // String formats are checked in isValidEncryptedFormat
    }

    private static isKeyLengthValid(key: string): boolean {
        // Hex keys should be 64 characters
        if (/^[0-9a-f]{64}$/i.test(key)) return true
        // Base64 keys should be 44 characters (for 32 bytes)
        if (key.length === 44 && /^[A-Za-z0-9+/=]+$/.test(key)) return true
        return false
    }

    private static deriveKey(raw: string): Buffer {
        // 1. Hex key (64 chars = 32 bytes)
        if (/^[0-9a-f]{64}$/i.test(raw)) {
            return Buffer.from(raw, 'hex')
        }

        // 2. Base64 key (must decode to exactly 32 bytes)
        if (/^[A-Za-z0-9+/=]+$/.test(raw)) {
            try {
                const buf = Buffer.from(raw, 'base64')
                if (buf.length === 32) return buf
            } catch { }
        }

        // 3. Fallback: SHA-256 hash (deterministic 32-byte key from any input)
        return crypto.createHash('sha256').update(raw).digest()
    }
}
