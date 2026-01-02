import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { topic, content } = body;

    const { error } = await supabase
      .from('research_notes')
      .insert({
        user_id: user.id,
        topic,
        content,
      });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Save research note error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save research note' },
      { status: 500 }
    );
  }
}
