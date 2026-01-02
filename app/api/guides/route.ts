import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure profile exists (for users who logged in without signup flow)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!existingProfile) {
      // Create profile using the RPC function
      const { error: profileError } = await supabase.rpc('create_profile', {
        user_id: user.id,
        user_username: user.email?.split('@')[0] || 'user',
        user_full_name: user.email?.split('@')[0] || 'User',
      });

      if (profileError) {
        console.error('Auto-create profile error:', profileError);
        // Continue anyway - profile might already exist
      }
    }

    const body = await request.json();
    const {
      title,
      theme,
      scripture_reference,
      content,
      target_length,
      audience_type,
      status,
    } = body;

    const { data: sermon, error } = await supabase
      .from('sermons')
      .insert({
        user_id: user.id,
        title,
        theme,
        scripture_reference,
        content,
        target_length,
        audience_type,
        status: status || 'draft',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ sermon });
  } catch (error: any) {
    console.error('Save sermon error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save sermon' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: sermons, error } = await supabase
      .from('sermons')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ sermons });
  } catch (error: any) {
    console.error('Fetch sermons error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch sermons' },
      { status: 500 }
    );
  }
}
