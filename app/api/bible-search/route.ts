import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { query, version, compareVersion } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Check if query is a verse reference (e.g., "Luke 18:1-8" or "John 3:16")
    const referencePattern = /^([1-3]?\s*[A-Za-z]+)\s+(\d+):(\d+)(?:-(\d+))?$/;
    const match = query.trim().match(referencePattern);
    const isReference = match !== null;

    // Use AI to find relevant Bible verses for the search query
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your-anthropic-key-here') {
      // Fallback to mock data if no API key
      const mockResults = [
        {
          book: 'John',
          chapter: 3,
          verse: 16,
          text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
          version: version,
          reference: 'John 3:16',
        },
        {
          book: 'Romans',
          chapter: 8,
          verse: 28,
          text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
          version: version,
          reference: 'Romans 8:28',
        },
        {
          book: 'Philippians',
          chapter: 4,
          verse: 13,
          text: 'I can do all this through him who gives me strength.',
          version: version,
          reference: 'Philippians 4:13',
        },
      ];

      return NextResponse.json({
        results: mockResults,
        query,
        version,
        mock: true,
        message: 'Using mock data. Configure Anthropic API key for AI-powered search.',
      });
    }

    // Build prompt based on whether it's a reference or keyword search
    let prompt: string;

    if (isReference && match) {
      const [, book, chapter, startVerse, endVerse] = match;
      const verseRange = endVerse ? `verses ${startVerse}-${endVerse}` : `verse ${startVerse}`;

      if (compareVersion) {
        // Comparison mode: get verses in both translations
        prompt = `Return the Bible text for ${book} ${chapter}:${startVerse}${endVerse ? `-${endVerse}` : ''} in both ${version} and ${compareVersion} translations.

CRITICAL: Return ONLY valid JSON. Escape all quotes and special characters properly.

Format:
{
  "results": [
    {
      "book": "${book}",
      "chapter": ${chapter},
      "verse": 1,
      "text": "verse text in ${version}",
      "compareText": "same verse text in ${compareVersion}",
      "version": "${version}",
      "compareVersion": "${compareVersion}",
      "reference": "${book} ${chapter}:1"
    }
  ]
}

Requirements:
- Include ALL verses from ${startVerse} to ${endVerse || startVerse}
- Use exact ${version} and ${compareVersion} Bible text
- Each verse = separate object in results array
- Properly escape quotes (\\" for quotes inside strings)
- No newlines in verse text - use spaces instead
- Valid JSON only, no markdown`;
      } else {
        // Single version reference lookup
        prompt = `Return the Bible text for ${book} ${chapter}:${startVerse}${endVerse ? `-${endVerse}` : ''} in ${version} translation.

CRITICAL: Return ONLY valid JSON. Escape all quotes and special characters properly.

Format:
{
  "results": [
    {
      "book": "${book}",
      "chapter": ${chapter},
      "verse": 1,
      "text": "verse text in ${version}",
      "reference": "${book} ${chapter}:1"
    }
  ]
}

Requirements:
- Include ALL verses from ${startVerse} to ${endVerse || startVerse}
- Use exact ${version} Bible text
- Each verse = separate object in results array
- Properly escape quotes (\\" for quotes inside strings)
- No newlines in verse text - use spaces instead
- Valid JSON only, no markdown`;
      }
    } else {
      // Keyword search
      prompt = `Find 8-12 Bible verses (${version} translation) most relevant to this search query: "${query}"

Return ONLY valid JSON in this exact format, no markdown:
{
  "results": [
    {
      "book": "book name",
      "chapter": chapter_number,
      "verse": verse_number,
      "text": "verse text in ${version}",
      "reference": "Book Chapter:Verse"
    }
  ]
}

Important:
- Use actual ${version} Bible verse text
- Include diverse books (Old & New Testament)
- Focus on verses most relevant to "${query}"
- Return valid JSON only`;
    }

    try {
      const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 2048,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!aiResponse.ok) {
        throw new Error('AI Bible search failed');
      }

      const aiData = await aiResponse.json();
      const responseText = aiData.content[0].text;

      console.log('[BIBLE-SEARCH] AI Response (first 500 chars):', responseText.substring(0, 500));

      // Parse JSON response - use simple pattern like sermon-ideas
      const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        console.error('[BIBLE-SEARCH] No JSON found in response');
        throw new Error('Failed to parse AI response');
      }

      console.log('[BIBLE-SEARCH] Extracted JSON (first 500 chars):', jsonMatch[0].substring(0, 500));

      try {
        const parsed = JSON.parse(jsonMatch[0]);

        // Add version to each result
        const results = (parsed.results || []).map((r: any) => ({
          ...r,
          version: r.version || version,
          compareVersion: r.compareVersion || compareVersion,
        }));

        return NextResponse.json({
          results,
          query,
          version,
          compareVersion,
          count: results.length,
          ai_powered: true,
          isReference,
        });
      } catch (parseError: any) {
        console.error('[BIBLE-SEARCH] JSON parse error:', parseError.message);
        console.error('[BIBLE-SEARCH] Failed JSON (first 1000 chars):', jsonMatch[0].substring(0, 1000));
        throw parseError;
      }
    } catch (aiError) {
      console.error('[BIBLE-SEARCH] AI Bible search error:', aiError);

      // Fallback to mock data
      const mockResults = [
        {
          book: 'John',
          chapter: 3,
          verse: 16,
          text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
          version: version,
          reference: 'John 3:16',
        },
        {
          book: 'Romans',
          chapter: 8,
          verse: 28,
          text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
          version: version,
          reference: 'Romans 8:28',
        },
        {
          book: 'Philippians',
          chapter: 4,
          verse: 13,
          text: 'I can do all this through him who gives me strength.',
          version: version,
          reference: 'Philippians 4:13',
        },
      ];

      return NextResponse.json({
        results: mockResults,
        query,
        version,
        mock: true,
        message: 'Using mock data. AI search failed.',
      });
    }
  } catch (error: any) {
    console.error('Bible search error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
