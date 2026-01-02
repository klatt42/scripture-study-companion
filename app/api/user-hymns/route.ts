import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Development mode: use admin client to bypass RLS
const isDevelopment = process.env.NODE_ENV === 'development';
const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001';

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

    // Get user's saved hymns
    const { data: userHymns, error } = await supabase
      .from('user_hymns')
      .select('*, hymns(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Transform to include hymn details
    const hymns = (userHymns || []).map(uh => ({
      id: uh.hymn_id,
      title: uh.hymns?.title || 'Unknown',
      author: uh.hymns?.copyright_info || 'Traditional',
      theme: uh.hymns?.themes?.[0] || 'worship',
      first_line: uh.hymns?.lyrics?.split('\n')[0] || '',
      lyrics_preview: uh.hymns?.lyrics?.substring(0, 150) || '',
      saved_at: uh.created_at,
    }));

    return NextResponse.json({ hymns });
  } catch (error: any) {
    console.error('Fetch saved hymns error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch saved hymns' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log('[user-hymns] NODE_ENV:', process.env.NODE_ENV);
    console.log('[user-hymns] isDevelopment:', isDevelopment);

    const supabase = isDevelopment ? createAdminClient() : await createClient();
    console.log('[user-hymns] Using admin client:', isDevelopment);

    let userId = MOCK_USER_ID;
    if (!isDevelopment) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = user.id;
    }
    console.log('[user-hymns] User ID:', userId);

    const body = await request.json();
    const { hymn_id, title, author, first_line, lyrics } = body;

    // Check if hymn_id is a valid UUID (from our database)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isValidUuid = hymn_id && uuidRegex.test(hymn_id);

    // If hymn_id is a valid UUID, it's from database - try to link it
    if (isValidUuid) {
      const { error } = await supabase
        .from('user_hymns')
        .insert({ user_id: userId, hymn_id });

      if (error) {
        // If linking fails, fall through to save as note
        console.error('Failed to link hymn:', error);
      } else {
        return NextResponse.json({ success: true });
      }
    }

    // Otherwise (or if linking failed), save the hymn details to notes
    const hymnContent = `# ${title}
${author ? `**Author:** ${author}\n` : ''}
${first_line ? `**First Line:** ${first_line}\n` : ''}

${lyrics || 'Visit Hymnary.org for full lyrics'}
`;

    const { error: noteError } = await supabase.from('notes').insert({
      user_id: userId,
      title: `Hymn: ${title}`,
      content: hymnContent,
      tags: ['hymn'],
    });

    if (noteError) {
      throw noteError;
    }

    return NextResponse.json({ success: true, saved_to: 'notes' });
  } catch (error: any) {
    console.error('Save hymn error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save hymn' },
      { status: 500 }
    );
  }
}
