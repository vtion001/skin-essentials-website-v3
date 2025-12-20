import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Helper to simulate API calls (since we can't easily run full Next.js routing in a standalone script without more setup)
// However, the user asked to "create a test connection". 
// The most reliable way to test connection *hooks* is to run the actual DB queries that the API routes would run.
// Alternatively, if we want to test the *endpoints*, we need the server running.
// Given the context is "hook to supabase", let's verify the SUPABASE connectivity for each table that the admin features use.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTable(tableName: string, label: string) {
    try {
        const { data, error, count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true }); // Head request to just check access/existence

        if (error) {
            console.error(`❌ [${label}] Connection Failed: ${error.message} (Table: ${tableName})`);
            return false;
        } else {
            console.log(`✅ [${label}] Connected. (Table: ${tableName}, Row Count: ${count})`);
            return true;
        }
    } catch (err: any) {
        console.error(`❌ [${label}] Unexpected Error: ${err.message}`);
        return false;
    }
}

async function verifyAdminIntegrations() {
    console.log('🔍 Starting Admin-Supabase Integration Verification...\n');

    console.log('--- Core Data ---');
    await testTable('appointments', 'Appointments');
    await testTable('clients', 'Clients');
    await testTable('staff', 'Staff');
    await testTable('treatments', 'Treatments (Medical/Staff Logs)');

    console.log('\n--- Financials ---');
    await testTable('payments', 'Payments');

    console.log('\n--- Content & CMS ---');
    await testTable('services', 'Services');
    // Assuming these tables exist based on "Portfolio Manager" and "Category Manager" features
    await testTable('portfolio', 'Portfolio');
    await testTable('categories', 'Categories');

    console.log('\n--- Marketing & Growth ---');
    await testTable('influencers', 'Influencers');
    await testTable('referrals', 'Referrals');

    console.log('\n--- Communication ---');
    // Check if there are tables for logs, otherwise we check the API configuration
    await testTable('email_logs', 'Email Logs'); // Hypothetical, checking existence

    console.log('\n--- Verification Complete ---');
}

verifyAdminIntegrations();
