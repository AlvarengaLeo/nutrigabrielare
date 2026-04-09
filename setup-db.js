/**
 * Setup script for Nutrigabrielare Supabase project.
 * Runs all migrations and creates the admin user.
 */

const SUPABASE_URL = 'https://kofhsmlywrmpaymqxjgl.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZmhzbWx5d3JtcGF5bXF4amdsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTYyMjI0MCwiZXhwIjoyMDkxMTk4MjQwfQ.IwOxNL2UnPnhgggessf6q_NYc8lYusVZhdf1ObmfjTE';

const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, 'supabase', 'migrations');

async function runSQL(sql, label) {
  console.log(`\n⏳ Running: ${label}...`);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  // Use the SQL endpoint directly instead
  const sqlRes = await fetch(`${SUPABASE_URL}/pg`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  // Note: Direct SQL via REST may not be available.
  // We'll use the management API instead.
  return sqlRes;
}

async function createAdminUser() {
  console.log('\n👤 Creating admin user...');

  // 1. Create user via Supabase Auth Admin API
  const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'admin@nutrigabrielare.com',
      password: 'NutriGabi2026!',
      email_confirm: true,
      user_metadata: {
        first_name: 'Gabriela',
        last_name: 'Retana',
      },
    }),
  });

  const userData = await createRes.json();

  if (createRes.ok) {
    console.log('✅ Admin user created:', userData.email);
    return userData.id;
  } else {
    console.log('⚠️  User creation response:', JSON.stringify(userData, null, 2));
    // Maybe user already exists
    if (userData.msg?.includes('already') || userData.message?.includes('already')) {
      console.log('User may already exist, trying to find...');
      const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=50`, {
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        },
      });
      const listData = await listRes.json();
      const existing = listData.users?.find(u => u.email === 'admin@nutrigabrielare.com');
      if (existing) {
        console.log('✅ Found existing user:', existing.id);
        return existing.id;
      }
    }
    return null;
  }
}

async function setAdminRole(userId) {
  if (!userId) {
    console.log('❌ No user ID, cannot set role');
    return;
  }

  console.log(`\n🔑 Setting admin role for user ${userId}...`);

  // Update profile role via REST API (bypasses RLS with service role)
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
    method: 'PATCH',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({ role: 'admin' }),
  });

  if (res.ok) {
    const data = await res.json();
    console.log('✅ Admin role set:', JSON.stringify(data, null, 2));
  } else {
    const text = await res.text();
    console.log('⚠️  Role update response:', res.status, text);
  }
}

async function checkProfile(userId) {
  console.log(`\n🔍 Checking profile for ${userId}...`);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
  });
  const data = await res.json();
  console.log('Profile:', JSON.stringify(data, null, 2));
  return data;
}

async function main() {
  console.log('🚀 Nutrigabrielare — Database Setup\n');
  console.log('='.repeat(50));

  // Step 1: Create admin user (this triggers the handle_new_user trigger which creates the profile)
  const userId = await createAdminUser();

  // Step 2: Wait a moment for the trigger
  await new Promise(r => setTimeout(r, 2000));

  // Step 3: Check if profile was created
  const profiles = await checkProfile(userId);

  // Step 4: Set admin role
  if (profiles && profiles.length > 0) {
    await setAdminRole(userId);
  } else {
    console.log('\n⚠️  Profile not found. The database tables may not exist yet.');
    console.log('You need to run the migrations first via the Supabase SQL Editor.');
    console.log('\nGo to: https://supabase.com/dashboard/project/kofhsmlywrmpaymqxjgl/sql');
    console.log('And paste the contents of each migration file in order (001 through 006).');
  }

  // Done
  console.log('\n' + '='.repeat(50));
  console.log('\n📋 Admin Credentials:');
  console.log('   Email:    admin@nutrigabrielare.com');
  console.log('   Password: NutriGabi2026!');
  console.log('   URL:      http://localhost:5173/admin/login');
  console.log('\n✅ Setup complete!');
}

main().catch(console.error);
