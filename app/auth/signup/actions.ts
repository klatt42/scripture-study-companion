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

  // Check if user needs email confirmation - auto-confirm for development
  if (authData.user && !authData.session) {
    try {
      const adminSupabase = await createAdminClient();

      // Auto-confirm user email using admin client
      const { error: confirmError } = await adminSupabase.auth.admin.updateUserById(
        authData.user.id,
        { email_confirm: true }
      );

      if (confirmError) {
        console.error('Auto-confirm error:', confirmError);
        return {
          error: 'Please check your email to confirm your account, or contact support.'
        };
      }

      // Sign in the user after confirming
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        return { error: 'Account created. Please sign in.' };
      }
    } catch (err) {
      console.error('Auto-confirm failed:', err);
      return {
        error: 'Please check your email to confirm your account.'
      };
    }
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
