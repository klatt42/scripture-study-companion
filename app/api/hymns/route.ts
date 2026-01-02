import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const theme = searchParams.get('theme');
    const scripture = searchParams.get('scripture');

    // If searching by scripture, use Hymnary.org API
    if (scripture) {
      try {
        const hymnaryResponse = await fetch(
          `https://hymnary.org/api/scripture?reference=${encodeURIComponent(scripture)}`,
          {
            headers: {
              'Accept': 'application/json',
            },
          }
        );

        if (hymnaryResponse.ok) {
          const data = await hymnaryResponse.json();

          // Hymnary API returns an object where each key is a hymn title
          // and the value is an object with hymn details
          const hymns = Object.entries(data).map(([hymnTitle, item]: [string, any]) => ({
            id: item['text link'] || `hymnary-${Math.random()}`,
            title: item.title || hymnTitle,
            author: item.author || item.translator || 'Unknown',
            theme: 'scripture',
            first_line: item['first line'] || '',
            lyrics_preview: item['first line'] || hymnTitle || '',
            source: 'hymnary',
            hymnary_link: item['text link'],
            scripture_refs: item['scripture references'] || scripture,
          }));

          return NextResponse.json({ hymns, source: 'hymnary', scripture, count: hymns.length });
        }
      } catch (err) {
        console.error('Hymnary API error:', err);
        // Fall through to database search
      }
    }

    // Search by query or theme in our database
    let dbQuery = supabase.from('hymns').select('*');

    if (theme && theme !== 'all') {
      dbQuery = dbQuery.contains('themes', [theme]);
    }

    if (query) {
      dbQuery = dbQuery.or(`title.ilike.%${query}%,lyrics.ilike.%${query}%`);
    }

    const { data: hymns, error } = await dbQuery.order('title').limit(50);

    if (error) {
      throw error;
    }

    // Transform database hymns to match our interface
    const transformedHymns = (hymns || []).map(h => ({
      id: h.id,
      title: h.title,
      author: h.copyright_info || 'Traditional',
      theme: h.themes?.[0] || 'worship',
      first_line: h.lyrics?.split('\n')[0] || '',
      lyrics_preview: h.lyrics?.substring(0, 100) || '',
      source: 'database'
    }));

    // If query search returned no results, use AI to suggest hymns
    if (query && transformedHymns.length === 0 && process.env.ANTHROPIC_API_KEY) {
      try {
        const aiPrompt = `Find 5-8 well-known Christian hymns matching this search: "${query}"

Return ONLY valid JSON, no markdown:
{
  "hymns": [
    {
      "title": "hymn title",
      "author": "composer/author name",
      "first_line": "first line of hymn",
      "theme": "worship/praise/christmas/etc",
      "hymnary_link": "https://hymnary.org/text/[slug]"
    }
  ]
}

Include traditional hymns from hymnals (Lutheran, Methodist, Baptist, Catholic, etc).`;

        const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY!,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 1024,
            messages: [{ role: 'user', content: aiPrompt }],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const responseText = aiData.content[0].text;

          const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
          const jsonMatch = jsonText.match(/\{[\s\S]*\}/);

          if (jsonMatch) {
            const cleanJson = jsonMatch[0].replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
            const parsed = JSON.parse(cleanJson);

            const aiHymns = (parsed.hymns || []).map((h: any) => ({
              id: h.hymnary_link || `ai-${Math.random()}`,
              title: h.title,
              author: h.author || 'Traditional',
              theme: h.theme || 'worship',
              first_line: h.first_line || '',
              lyrics_preview: h.first_line || '',
              source: 'ai',
              hymnary_link: h.hymnary_link,
            }));

            return NextResponse.json({ hymns: aiHymns, source: 'ai', query });
          }
        }
      } catch (aiError) {
        console.error('AI hymn search error:', aiError);
      }
    }

    return NextResponse.json({ hymns: transformedHymns, source: 'database' });
  } catch (error: any) {
    console.error('Fetch hymns error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch hymns' },
      { status: 500 }
    );
  }
}
