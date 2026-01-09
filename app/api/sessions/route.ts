import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

// GET - List user's study sessions
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sessionType = searchParams.get('type'); // reading, study, memory, prayer

    // Build query
    let query = supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('session_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (sessionType) {
      query = query.eq('session_type', sessionType);
    }

    const { data: sessions, error } = await query;

    if (error) throw error;

    // Format sessions with relative dates
    const formattedSessions = sessions?.map(session => ({
      id: session.id,
      date: formatRelativeDate(session.session_date),
      session_date: session.session_date,
      duration_minutes: session.duration_minutes,
      passage: session.passage,
      notes: session.notes,
      type: session.session_type,
      created_at: session.created_at,
    })) || [];

    return NextResponse.json({
      sessions: formattedSessions,
      total: formattedSessions.length,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch sessions';
    console.error('Fetch sessions error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST - Create a new study session
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { duration_minutes, passage, notes, session_type = 'reading', session_date } = body;

    if (!duration_minutes || duration_minutes < 1) {
      return NextResponse.json(
        { error: 'Duration must be at least 1 minute' },
        { status: 400 }
      );
    }

    const validTypes = ['reading', 'study', 'memory', 'prayer'];
    if (!validTypes.includes(session_type)) {
      return NextResponse.json(
        { error: `Invalid session type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const { data: session, error } = await supabase
      .from('study_sessions')
      .insert({
        user_id: user.id,
        duration_minutes,
        passage: passage || null,
        notes: notes || null,
        session_type,
        session_date: session_date || new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        date: formatRelativeDate(session.session_date),
        session_date: session.session_date,
        duration_minutes: session.duration_minutes,
        passage: session.passage,
        notes: session.notes,
        type: session.session_type,
        created_at: session.created_at,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create session';
    console.error('Create session error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE - Delete a study session
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      );
    }

    // Verify ownership and delete
    const { error } = await supabase
      .from('study_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Session deleted',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete session';
    console.error('Delete session error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Helper function to format relative dates
function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
