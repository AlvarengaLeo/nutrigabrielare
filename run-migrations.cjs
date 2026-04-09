/**
 * Run migrations using Supabase pooler connection (Transaction mode)
 * Uses the pg package to connect directly to Supabase Postgres
 */
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Supabase direct connection - ask user for password
const DATABASE_URL = process.env.DATABASE_URL || 
  `postgresql://postgres.kofhsmlywrmpaymqxjgl:${process.argv[2] || 'YOUR_PASSWORD'}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

const migrations = [
  '001_initial_schema.sql',
  '003_fix_rls_recursion.sql',
  '004_admin_roles.sql',
  '005_get_my_profile_rpc.sql',
  '006_pending_payment_status.sql',
];

async function main() {
  console.log('🚀 Nutrigabrielare — Running SQL Migrations\n');

  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    for (const filename of migrations) {
      const filePath = path.join(__dirname, 'supabase', 'migrations', filename);
      const sql = fs.readFileSync(filePath, 'utf-8');
      console.log(`⏳ Running ${filename}...`);
      try {
        await client.query(sql);
        console.log(`✅ ${filename} — OK`);
      } catch (err) {
        console.log(`❌ ${filename} — ${err.message}`);
      }
    }

    // Set admin role
    console.log('\n🔑 Setting admin role...');
    const userId = '5984d68c-97bd-4a7d-8358-67da77760993';
    await client.query(`UPDATE public.profiles SET role = 'admin' WHERE id = $1`, [userId]);
    console.log('✅ Admin role set!');

    // Verify
    const result = await client.query(`SELECT id, email, role, first_name FROM public.profiles WHERE id = $1`, [userId]);
    console.log('👤 Profile:', result.rows[0]);

  } catch (err) {
    console.error('Connection error:', err.message);
  } finally {
    await client.end();
  }

  console.log('\n📋 Credenciales Admin:');
  console.log('   Email:    admin@nutrigabrielare.com');
  console.log('   Password: NutriGabi2026!');
}

main();
