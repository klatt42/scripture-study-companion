// Run with: npx tsx scripts/reset-user.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fntcasdassvplgcabdty.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_fBCIeHiQyg0eGQ7EAe5Hgg_zIhrlqlZ';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetUser() {
  const email = 'klatt42@gmail.com';
  const newPassword = 'Scripture2025!';

  console.log('Looking up user:', email);

  // List users to find the one we need
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }

  const user = users.users.find(u => u.email === email);

  if (!user) {
    console.log('User not found. You can sign up fresh.');
    return;
  }

  console.log('Found user:', user.id);
  console.log('Email confirmed:', user.email_confirmed_at ? 'Yes' : 'No');

  // Update password and confirm email
  const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword,
    email_confirm: true
  });

  if (error) {
    console.error('Error updating user:', error);
    return;
  }

  console.log('\n✅ Password reset successful!');
  console.log('Email:', email);
  console.log('New Password:', newPassword);
  console.log('\nYou can now login at http://localhost:3318/login');
}

resetUser();
