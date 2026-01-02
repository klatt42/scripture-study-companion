'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function loginAction(formData: {
  email: string;
  password: string;
}) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      return { error: error.message };
    }

    // Success - redirect to dashboard
    redirect('/dashboard');
  } catch (err: unknown) {
    // Handle redirect (Next.js throws NEXT_REDIRECT)
    if (err && typeof err === 'object' && 'digest' in err) {
      throw err; // Re-throw redirect
    }
    console.error('Login error:', err);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}
