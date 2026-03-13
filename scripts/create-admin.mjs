import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ywejakvvmhhqgoedxmnd.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWpha3Z2bWhocWdvZWR4bW5kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzExNTc4MiwiZXhwIjoyMDg4NjkxNzgyfQ._ijuQkX6WbBXgOh9E253g96Qb9uaa37ZMAKvZVJmsP8';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ADMIN_EMAIL = 'admin@majesdesiver.com';
const ADMIN_PASSWORD = 'Admin2026!';

async function main() {
  console.log('Creating admin user...');

  // Create auth user (bypasses email confirmation with service_role)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { first_name: 'Admin', last_name: 'Majes' },
  });

  if (authError) {
    console.error('Error creating auth user:', authError.message);
    process.exit(1);
  }

  console.log('Auth user created:', authData.user.id);

  // Update profile role to admin
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'admin', first_name: 'Admin', last_name: 'Majes' })
    .eq('id', authData.user.id);

  if (profileError) {
    console.error('Error updating profile:', profileError.message);
    process.exit(1);
  }

  console.log('\n✅ Admin user created successfully!');
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log(`   Role:     admin`);
  console.log('\n   Login at: http://localhost:5173/admin/login');
}

main();
