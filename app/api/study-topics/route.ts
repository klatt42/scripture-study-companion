import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Development mode bypass - allows testing without authentication
    const isDev = process.env.NODE_ENV === 'development';
    if (!user && !isDev) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { general_theme, scriptures, audience_type } = body;

    if (!general_theme) {
      return NextResponse.json(
        { error: 'General theme is required' },
        { status: 400 }
      );
    }

    // Format scriptures for display and prompt
    const scriptureList = scriptures && scriptures.length > 0
      ? scriptures.join('; ')
      : null;

    // Check if Anthropic API key is configured
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your-anthropic-key-here') {
      // Return mock sermon ideas for testing
      const mockIdeas = [
        {
          title: `Finding ${general_theme} in Daily Life`,
          theme: general_theme,
          scripture: scriptureList || 'Matthew 6:25-34',
          description: `A practical exploration of how ${general_theme} manifests in our everyday experiences and challenges. This sermon helps believers connect biblical principles with real-world applications.`,
          keyPoints: [
            `Understanding ${general_theme} from a biblical perspective`,
            'Practical steps to embody this principle daily',
            'Overcoming obstacles and maintaining consistency',
          ],
        },
        {
          title: `The Biblical Foundation of ${general_theme}`,
          theme: general_theme,
          scripture: scriptureList || 'Romans 12:1-2',
          description: `A deep dive into what Scripture teaches about ${general_theme}. This sermon traces the theme throughout the Bible, from Old Testament foundations to New Testament fulfillment.`,
          keyPoints: [
            `${general_theme} in the Old Testament`,
            `Jesus' teachings on ${general_theme}`,
            'Living out this truth in the modern church',
          ],
        },
        {
          title: `${general_theme}: A Call to Action`,
          theme: general_theme,
          scripture: scriptureList || 'James 2:14-26',
          description: `An inspiring message that moves beyond understanding to action. This sermon challenges the congregation to not just hear about ${general_theme}, but to actively live it out in their communities.`,
          keyPoints: [
            `Why ${general_theme} requires action, not just belief`,
            'Practical ways to serve and demonstrate this principle',
            'Stories of transformed lives through active faith',
          ],
        },
      ];

      return NextResponse.json({
        ideas: mockIdeas,
        mock: true,
        message: 'Using mock data. Add ANTHROPIC_API_KEY to .env.local for AI generation.',
      });
    }

    // Real AI generation with Anthropic Claude
    const scripturePromptSection = scriptureList
      ? `Lectionary/Assigned Scriptures: ${scriptureList}

IMPORTANT: These are the assigned scripture readings for the service. Each sermon idea should incorporate and reference these specific passages. The sermon should help the congregation understand how these readings connect to the theme and to each other.`
      : 'No specific scriptures assigned - suggest appropriate passages that support the theme.';

    const prompt = `You are a pastoral assistant helping to generate sermon ideas for a minister preparing their weekly sermon. Based on the following input, generate 3 distinct sermon ideas:

General Theme: ${general_theme}
${scripturePromptSection}
Audience: ${audience_type}

For each sermon idea, provide:
1. A compelling, specific title
2. The main theme
3. The scripture reference(s) - ${scriptureList ? 'use the assigned scriptures listed above' : 'suggest appropriate passages'}
4. A 2-3 sentence description of what the sermon would cover
5. Three key points that would be explored

Make each idea unique and approach the theme from different angles (theological, practical, inspirational, etc.).

Format the response as JSON with this structure:
{
  "ideas": [
    {
      "title": "sermon title",
      "theme": "${general_theme}",
      "scripture": "scripture reference(s)",
      "description": "description text",
      "keyPoints": ["point 1", "point 2", "point 3"]
    }
  ]
}

Make them theologically sound, pastorally sensitive, and relevant for ${audience_type} audience.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate sermon ideas with AI');
    }

    const data = await response.json();
    const responseText = data.content[0].text;

    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const result = JSON.parse(jsonMatch[0]);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Sermon ideas generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
