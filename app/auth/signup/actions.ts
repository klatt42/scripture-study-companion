'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function signupAction(formData: {
  email: string;
  password: string;
  username: string;
  fullName: string;
}) {
  const supabase = await createClient();

  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/auth/callback`,
    },
  });

  if (authError) {
    console.error('Auth signup error:', authError);
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: 'Failed to create user' };
  }

  // Check if user needs email confirmation
  if (authData.user && !authData.session) {
    return {
      error: 'Please check your email to confirm your account. If you did not receive an email, check Supabase Auth settings to disable email confirmation.'
    };
  }

  // 2. Create profile using admin client (bypasses RLS)
  try {
    const adminSupabase = await createAdminClient();

    const { error: profileError } = await adminSupabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        username: formData.username,
        full_name: formData.fullName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Don't block signup if profile fails - user can update in settings
    }
  } catch (err) {
    console.error('Admin client error:', err);
    // Don't block signup if profile creation fails
  }

  // Success - redirect to dashboard
  redirect('/dashboard');
}
