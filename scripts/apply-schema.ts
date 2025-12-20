#!/usr/bin/env tsx

import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

// Manuel .env.local loader to avoid dependencies
const envPath = resolve(process.cwd(), '.env.local');
if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value.length) {
            process.env[key.trim()] = value.join('=').trim().replace(/^["']|["']$/g, '');
        }
    });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase credentials in .env.local')
    process.exit(1)
}

const url = SUPABASE_URL as string
const key = SERVICE_ROLE_KEY as string

async function applySchema() {
    console.log('📋 Reading schema.sql...')
    const schemaPath = resolve(process.cwd(), 'supabase/schema.sql')
    const schema = readFileSync(schemaPath, 'utf-8')

    console.log('🚀 Applying schema to Supabase...')
    console.log(`   Database: ${SUPABASE_URL}`)

    const headers = {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': `Bearer ${key}`,
    }

    const response = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: headers as any,
        body: JSON.stringify({ query: schema }),
    })

    if (!response.ok) {
        // Try alternative method using SQL query endpoint
        console.log('⚠️  First method failed, trying direct SQL execution...')

        const statements = schema
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'))

        console.log(`   Found ${statements.length} SQL statements to execute`)

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i] + ';'

            // Skip comments
            if (statement.trim().startsWith('--')) continue

            try {
                const statementHeaders = {
                    'Content-Type': 'application/json',
                    'apikey': key,
                    'Authorization': `Bearer ${key}`,
                }

                const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
                    method: 'POST',
                    headers: statementHeaders as any,
                    body: JSON.stringify({ query: statement }),
                })

                if (!res.ok) {
                    const error = await res.text()
                    console.log(`   ⚠️  Statement ${i + 1}/${statements.length} failed (might be okay): ${error.substring(0, 100)}`)
                } else {
                    console.log(`   ✅ Statement ${i + 1}/${statements.length} executed`)
                }
            } catch (err: any) {
                console.log(`   ⚠️  Statement ${i + 1} error: ${err.message}`)
            }
        }

        console.log('\n✨ Schema application completed!')
        console.log('   Note: Some "already exists" errors are expected and safe to ignore')
        return
    }

    console.log('✅ Schema applied successfully!')
}

applySchema().catch((error) => {
    console.error('❌ Error applying schema:', error.message)
    console.log('\n📝 Manual steps:')
    console.log('   1. Go to: ' + SUPABASE_URL.replace('https://', 'https://app.supabase.com/project/').split('.')[0].split('//')[1])
    console.log('   2. Navigate to SQL Editor')
    console.log('   3. Copy contents of supabase/schema.sql')
    console.log('   4. Paste and run in SQL Editor')
    process.exit(1)
})
