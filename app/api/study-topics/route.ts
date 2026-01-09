import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Allow up to 2 minutes for AI generation
export const maxDuration = 120;

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
    const { general_theme, scriptures, study_type } = body;

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
      // Return mock study topics for testing
      const mockTopics = [
        {
          title: `Understanding ${general_theme} in Scripture`,
          theme: general_theme,
          scripture: scriptureList || 'Psalm 119:105-112',
          description: `A foundational exploration of what the Bible teaches about ${general_theme}. This study traces key passages and helps you build a solid biblical understanding of this important topic.`,
          keyQuestions: [
            `What does Scripture reveal about ${general_theme}?`,
            'How did biblical characters experience this truth?',
            'What practical wisdom can we apply today?',
          ],
        },
        {
          title: `${general_theme}: A Personal Journey`,
          theme: general_theme,
          scripture: scriptureList || 'James 1:2-8',
          description: `A reflective study examining how ${general_theme} relates to your personal spiritual growth. This study encourages self-examination and practical application in daily life.`,
          keyQuestions: [
            `How has ${general_theme} shaped your faith journey?`,
            'What obstacles hinder growth in this area?',
            'What steps can you take this week to grow?',
          ],
        },
        {
          title: `Living Out ${general_theme} Today`,
          theme: general_theme,
          scripture: scriptureList || 'Romans 12:1-2',
          description: `A practical study focused on applying ${general_theme} in modern life. This study bridges ancient wisdom with contemporary challenges and opportunities.`,
          keyQuestions: [
            `How does ${general_theme} apply to work and relationships?`,
            'What cultural challenges do we face in this area?',
            'How can we encourage others in this truth?',
          ],
        },
      ];

      return NextResponse.json({
        topics: mockTopics,
        mock: true,
        message: 'Using mock data. Add ANTHROPIC_API_KEY to .env.local for AI generation.',
      });
    }

    // Real AI generation with Anthropic Claude
    const scripturePromptSection = scriptureList
      ? `Scripture References: ${scriptureList}

IMPORTANT: These are specific scripture passages the user wants to study. Each topic should incorporate and reference these passages. Help the user understand how these readings connect to the theme.`
      : 'No specific scriptures provided - suggest appropriate passages that support the theme.';

    const studyTypeDescriptions: Record<string, string> = {
      'individual': 'someone doing personal devotional study at home',
      'small-group': 'a small group Bible study with discussion',
      'family': 'a family with children doing devotions together',
      'academic': 'someone seeking deep theological and historical study',
    };

    const audience = studyTypeDescriptions[study_type] || 'individual Bible study';

    const prompt = `You are a Bible study assistant helping to generate study topic suggestions. Based on the following input, generate 3 distinct study topic ideas:

General Theme: ${general_theme}
${scripturePromptSection}
Study Context: ${audience}

For each study topic, provide:
1. A compelling, specific title
2. The main theme
3. The scripture reference(s) - ${scriptureList ? 'use the provided scriptures' : 'suggest appropriate passages'}
4. A 2-3 sentence description of what the study would cover
5. Three key questions to explore during the study

Make each topic unique and approach the theme from different angles (foundational understanding, personal application, community/practical living, etc.).

Format the response as JSON with this structure:
{
  "topics": [
    {
      "title": "study title",
      "theme": "${general_theme}",
      "scripture": "scripture reference(s)",
      "description": "description text",
      "keyQuestions": ["question 1", "question 2", "question 3"]
    }
  ]
}

Make them biblically grounded, spiritually enriching, and appropriate for ${audience}.`;

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
      const errorData = await response.json().catch(() => ({}));
      console.error('[STUDY-TOPICS] API error:', response.status, errorData);

      // Fallback to mock data on API errors (including auth errors)
      const mockTopics = [
        {
          title: `Understanding ${general_theme} in Scripture`,
          theme: general_theme,
          scripture: scriptureList || 'Psalm 119:105-112',
          description: `A foundational exploration of what the Bible teaches about ${general_theme}. This study traces key passages and helps you build a solid biblical understanding of this important topic.`,
          keyQuestions: [
            `What does Scripture reveal about ${general_theme}?`,
            'How did biblical characters experience this truth?',
            'What practical wisdom can we apply today?',
          ],
        },
        {
          title: `${general_theme}: A Personal Journey`,
          theme: general_theme,
          scripture: scriptureList || 'James 1:2-8',
          description: `A reflective study examining how ${general_theme} relates to your personal spiritual growth. This study encourages self-examination and practical application in daily life.`,
          keyQuestions: [
            `How has ${general_theme} shaped your faith journey?`,
            'What obstacles hinder growth in this area?',
            'What steps can you take this week to grow?',
          ],
        },
        {
          title: `Living Out ${general_theme} Today`,
          theme: general_theme,
          scripture: scriptureList || 'Romans 12:1-2',
          description: `A practical study focused on applying ${general_theme} in modern life. This study bridges ancient wisdom with contemporary challenges and opportunities.`,
          keyQuestions: [
            `How does ${general_theme} apply to work and relationships?`,
            'What cultural challenges do we face in this area?',
            'How can we encourage others in this truth?',
          ],
        },
      ];

      return NextResponse.json({
        topics: mockTopics,
        mock: true,
        message: `AI unavailable (${errorData.error?.message || 'API error'}). Using mock data.`,
      });
    }

    const data = await response.json();
    const responseText = data.content[0].text;

    // Extract JSON from the response
    const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[STUDY-TOPICS] No JSON found in response');
      throw new Error('Failed to parse AI response');
    }

    const result = JSON.parse(jsonMatch[0]);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Study topics generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
