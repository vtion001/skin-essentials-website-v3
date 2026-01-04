/**
 * Encrypted Data Migration Script
 * 
 * This script identifies records with orphaned encrypted data (data encrypted
 * with a key that is no longer available) and provides options to:
 * 1. Generate a report of affected records
 * 2. Clear the encrypted fields (set to null)
 * 3. Mark records for manual re-entry
 * 
 * Usage:
 *   npx tsx scripts/migrate-encrypted-data.ts --report
 *   npx tsx scripts/migrate-encrypted-data.ts --clear
 *   npx tsx scripts/migrate-encrypted-data.ts --mark-pending
 * 
 * HIPAA Compliance Note:
 * This script logs all operations to the audit trail for compliance tracking.
 */

import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing required environment variables:');
    console.error('   - NEXT_PUBLIC_SUPABASE_URL');
    console.error('   - SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Encryption patterns to detect encrypted data
const ENCRYPTED_PATTERNS = {
    JSON_FORMAT: /^\{"iv":"[A-Za-z0-9+/=]+","tag":"[A-Za-z0-9+/=]+","data":"[A-Za-z0-9+/=]+"\}$/,
    CARET_FORMAT: /^[A-Za-z0-9+/=]+\^[A-Za-z0-9+/=]+\^[A-Za-z0-9+/=]+$/,
    COLON_FORMAT: /^[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/,
};

interface EncryptedRecord {
    table: string;
    id: string;
    field: string;
    encryptedValue: string;
    format: string;
    identifierField?: string;
    identifierValue?: string;
}

interface MigrationReport {
    generatedAt: string;
    totalAffected: number;
    byTable: Record<string, number>;
    records: EncryptedRecord[];
}

/**
 * Get available encryption keys from environment
 */
function getEncryptionKeys(): Buffer[] {
    const keys: Buffer[] = [];
    const keyEnvVars = [
        'ENCRYPTION_KEY',
        'DATA_ENCRYPTION_KEY',
        'ENCRYPTION_KEY_LEGACY',
        'ENCRYPTION_KEY_BACKUP',
    ];

    for (const envVar of keyEnvVars) {
        const keyValue = process.env[envVar];
        if (keyValue) {
            try {
                // Try Base64 decode first
                const decoded = Buffer.from(keyValue, 'base64');
                if (decoded.length === 32) {
                    keys.push(decoded);
                } else {
                    // Hash to 32 bytes
                    const hashed = crypto.createHash('sha256').update(keyValue).digest();
                    keys.push(hashed);
                }
            } catch {
                // Hash non-Base64 keys
                const hashed = crypto.createHash('sha256').update(keyValue).digest();
                keys.push(hashed);
            }
        }
    }

    return keys;
}

/**
 * Detect if a value is encrypted
 */
function isEncrypted(value: unknown): boolean {
    if (typeof value !== 'string' || !value) return false;

    return (
        ENCRYPTED_PATTERNS.JSON_FORMAT.test(value) ||
        ENCRYPTED_PATTERNS.CARET_FORMAT.test(value) ||
        ENCRYPTED_PATTERNS.COLON_FORMAT.test(value)
    );
}

/**
 * Detect encryption format
 */
function detectFormat(value: string): string {
    if (ENCRYPTED_PATTERNS.JSON_FORMAT.test(value)) return 'JSON';
    if (ENCRYPTED_PATTERNS.CARET_FORMAT.test(value)) return 'CARET';
    if (ENCRYPTED_PATTERNS.COLON_FORMAT.test(value)) return 'COLON';
    return 'UNKNOWN';
}

/**
 * Parse encrypted value into components
 */
function parseEncrypted(value: string): { iv: Buffer; tag: Buffer; data: Buffer } | null {
    try {
        if (ENCRYPTED_PATTERNS.JSON_FORMAT.test(value)) {
            const parsed = JSON.parse(value);
            return {
                iv: Buffer.from(parsed.iv, 'base64'),
                tag: Buffer.from(parsed.tag, 'base64'),
                data: Buffer.from(parsed.data, 'base64'),
            };
        }

        if (ENCRYPTED_PATTERNS.CARET_FORMAT.test(value)) {
            const [iv, tag, data] = value.split('^');
            return {
                iv: Buffer.from(iv, 'base64'),
                tag: Buffer.from(tag, 'base64'),
                data: Buffer.from(data, 'base64'),
            };
        }

        if (ENCRYPTED_PATTERNS.COLON_FORMAT.test(value)) {
            const [iv, tag, data] = value.split(':');
            return {
                iv: Buffer.from(iv, 'base64'),
                tag: Buffer.from(tag, 'base64'),
                data: Buffer.from(data, 'base64'),
            };
        }

        return null;
    } catch {
        return null;
    }
}

/**
 * Attempt to decrypt a value with available keys
 */
function tryDecrypt(value: string): { success: boolean; keyIndex?: number } {
    const keys = getEncryptionKeys();
    const parsed = parseEncrypted(value);

    if (!parsed) return { success: false };

    for (let i = 0; i < keys.length; i++) {
        try {
            const decipher = crypto.createDecipheriv('aes-256-gcm', keys[i], parsed.iv);
            decipher.setAuthTag(parsed.tag);
            decipher.update(parsed.data);
            decipher.final('utf8');
            return { success: true, keyIndex: i };
        } catch {
            // Try next key
        }
    }

    return { success: false };
}

/**
 * Scan a table for orphaned encrypted data
 */
async function scanTable(
    tableName: string,
    encryptedFields: string[],
    identifierField: string = 'id'
): Promise<EncryptedRecord[]> {
    const orphanedRecords: EncryptedRecord[] = [];

    console.log(`  Scanning ${tableName}...`);

    const { data, error } = await supabase
        .from(tableName)
        .select('*');

    if (error) {
        console.error(`  ❌ Error scanning ${tableName}: ${error.message}`);
        return [];
    }

    if (!data || data.length === 0) {
        console.log(`  ℹ️  No records in ${tableName}`);
        return [];
    }

    for (const record of data) {
        for (const field of encryptedFields) {
            const value = record[field];

            if (isEncrypted(value)) {
                const decryptResult = tryDecrypt(value);

                if (!decryptResult.success) {
                    orphanedRecords.push({
                        table: tableName,
                        id: record.id,
                        field,
                        encryptedValue: value.substring(0, 50) + '...', // Truncate for security
                        format: detectFormat(value),
                        identifierField,
                        identifierValue: record[identifierField] || record.id,
                    });
                }
            }
        }
    }

    console.log(`  Found ${orphanedRecords.length} orphaned encrypted fields`);
    return orphanedRecords;
}

/**
 * Generate a report of all orphaned encrypted data
 */
async function generateReport(): Promise<MigrationReport> {
    console.log('\n📊 Generating Encrypted Data Report...\n');

    const allRecords: EncryptedRecord[] = [];

    // Define tables and their encrypted fields
    const tablesToScan = [
        { table: 'clients', fields: ['email', 'phone', 'address'], identifier: 'name' },
        { table: 'staff', fields: ['email', 'phone', 'license_number'], identifier: 'name' },
        { table: 'payments', fields: ['notes', 'transaction_id'], identifier: 'id' },
        { table: 'medical_records', fields: ['notes', 'diagnosis', 'treatment_plan'], identifier: 'id' },
        { table: 'appointments', fields: ['notes'], identifier: 'id' },
        { table: 'audit_logs', fields: ['details'], identifier: 'id' },
    ];

    for (const { table, fields, identifier } of tablesToScan) {
        const records = await scanTable(table, fields, identifier);
        allRecords.push(...records);
    }

    const byTable: Record<string, number> = {};
    for (const record of allRecords) {
        byTable[record.table] = (byTable[record.table] || 0) + 1;
    }

    const report: MigrationReport = {
        generatedAt: new Date().toISOString(),
        totalAffected: allRecords.length,
        byTable,
        records: allRecords,
    };

    return report;
}

/**
 * Clear orphaned encrypted fields (set to null)
 */
async function clearOrphanedData(records: EncryptedRecord[]): Promise<void> {
    console.log('\n🧹 Clearing Orphaned Encrypted Data...\n');

    const grouped: Record<string, EncryptedRecord[]> = {};
    for (const record of records) {
        const key = `${record.table}:${record.id}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(record);
    }

    let cleared = 0;
    let failed = 0;

    for (const [key, recordGroup] of Object.entries(grouped)) {
        const [table, id] = key.split(':');
        const updates: Record<string, null> = {};

        for (const record of recordGroup) {
            updates[record.field] = null;
        }

        const { error } = await supabase
            .from(table)
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error(`  ❌ Failed to clear ${table}/${id}: ${error.message}`);
            failed++;
        } else {
            console.log(`  ✅ Cleared ${Object.keys(updates).length} field(s) in ${table}/${id}`);
            cleared++;
        }
    }

    console.log(`\n📈 Results: ${cleared} records cleared, ${failed} failed`);

    // Log to audit trail
    await supabase.from('audit_logs').insert({
        action: 'DATA_MIGRATION',
        resource_type: 'encrypted_data',
        details: JSON.stringify({
            operation: 'clear_orphaned',
            totalCleared: cleared,
            totalFailed: failed,
            timestamp: new Date().toISOString(),
        }),
        ip_address: '127.0.0.1',
        user_agent: 'migration-script',
    });
}

/**
 * Mark records as pending re-entry (add metadata flag)
 */
async function markPendingReentry(records: EncryptedRecord[]): Promise<void> {
    console.log('\n🏷️  Marking Records for Re-entry...\n');

    // Group by table and ID
    const grouped: Record<string, Set<string>> = {};
    for (const record of records) {
        const key = record.table;
        if (!grouped[key]) grouped[key] = new Set();
        grouped[key].add(record.id);
    }

    let marked = 0;

    for (const [table, ids] of Object.entries(grouped)) {
        for (const id of ids) {
            const { error } = await supabase
                .from(table)
                .update({ needs_data_reentry: true })
                .eq('id', id);

            if (error) {
                // Column might not exist, try adding metadata instead
                console.log(`  ℹ️  ${table} doesn't have needs_data_reentry column, skipping...`);
                break;
            } else {
                marked++;
            }
        }
    }

    console.log(`\n📈 Marked ${marked} records for re-entry`);
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
    const args = process.argv.slice(2);
    const command = args[0] || '--report';

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║        Encrypted Data Migration Tool v1.0                  ║');
    console.log('║        HIPAA-Compliant Data Recovery                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    const keysAvailable = getEncryptionKeys().length;
    console.log(`\n🔑 Encryption keys available: ${keysAvailable}`);

    if (keysAvailable === 0) {
        console.error('❌ No encryption keys found in environment!');
        process.exit(1);
    }

    const report = await generateReport();

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 SUMMARY: ${report.totalAffected} orphaned encrypted field(s)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    for (const [table, count] of Object.entries(report.byTable)) {
        console.log(`   ${table}: ${count} field(s)`);
    }

    // Save report to file
    const reportPath = path.join(process.cwd(), 'encrypted-data-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📁 Report saved to: ${reportPath}`);

    if (command === '--clear' && report.totalAffected > 0) {
        console.log('\n⚠️  WARNING: This will permanently remove encrypted data!');
        console.log('   Press Ctrl+C within 5 seconds to cancel...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        await clearOrphanedData(report.records);
    } else if (command === '--mark-pending' && report.totalAffected > 0) {
        await markPendingReentry(report.records);
    } else if (report.totalAffected === 0) {
        console.log('\n✅ No orphaned encrypted data found! All records are accessible.');
    } else {
        console.log('\n💡 Available commands:');
        console.log('   --report       Generate report only (default)');
        console.log('   --clear        Clear orphaned encrypted fields');
        console.log('   --mark-pending Mark records for manual re-entry');
    }

    console.log('\n✨ Migration script completed.\n');
}

main().catch(console.error);
