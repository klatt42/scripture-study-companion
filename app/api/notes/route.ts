import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Development mode: use admin client to bypass RLS
const isDevelopment = process.env.NODE_ENV === 'development';
const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001';

export async function POST(request: Request) {
  try {
    const supabase = isDevelopment ? createAdminClient() : await createClient();

    let userId = MOCK_USER_ID;
    if (!isDevelopment) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = user.id;
    }

    const body = await request.json();
    const { title, content, category } = body;

    const { error } = await supabase
      .from('notes')
      .insert({
        user_id: userId,
        title,
        content,
        tags: category ? [category] : ['sermon-prep'],
      });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Save note error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save note' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = isDevelopment ? createAdminClient() : await createClient();

    let userId = MOCK_USER_ID;
    if (!isDevelopment) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = user.id;
    }

    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false});

    if (error) {
      throw error;
    }

    return NextResponse.json({ notes: notes || [] });
  } catch (error: any) {
    console.error('Fetch notes error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = isDevelopment ? createAdminClient() : await createClient();

    let userId = MOCK_USER_ID;
    if (!isDevelopment) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = user.id;
    }

    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get('id');

    if (!noteId) {
      return NextResponse.json({ error: 'Note ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete note error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete note' },
      { status: 500 }
    );
  }
}
