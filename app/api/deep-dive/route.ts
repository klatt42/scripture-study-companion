import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { theme, scripture_reference, target_length, audience_type } = body;

    if (!theme) {
      return NextResponse.json(
        { error: 'Theme is required' },
        { status: 400 }
      );
    }

    // Check if Anthropic API key is configured
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your-anthropic-key-here') {
      // Return mock sermon for testing
      const mockSermon = {
        title: `Sermon: ${theme}`,
        scripture: scripture_reference || 'Various passages',
        introduction: `Dear brothers and sisters in Christ,

Today we gather to explore the profound theme of "${theme}". This topic touches the very heart of our faith and speaks to the challenges we face in our daily walk with God.

${scripture_reference ? `As we reflect on ${scripture_reference}, we are reminded of God's eternal truth and unwavering love.` : 'Throughout Scripture, we find guidance and wisdom for this very topic.'}

Let us open our hearts and minds to what the Lord would teach us today.`,
        points: [
          {
            title: 'Understanding God\'s Purpose',
            content: `The first thing we must understand about ${theme} is that it begins with recognizing God's sovereign plan in our lives.

Scripture tells us that God works all things together for good for those who love Him. This isn't just a comforting phrase - it's a fundamental truth that should shape how we approach ${theme}.

When we face difficulties related to this theme, we must remember:
- God is in control
- His timing is perfect
- His purposes are always good

Application: This week, when you encounter situations related to ${theme}, pause and ask yourself: "What might God be teaching me through this?"`,
          },
          {
            title: 'Living Out Our Faith',
            content: `Secondly, ${theme} calls us to action. Faith without works is dead, as James reminds us.

We cannot simply understand ${theme} intellectually - we must live it out daily. This means:

1. In our homes: ${theme} should transform how we interact with our families
2. In our workplaces: Our colleagues should see ${theme} reflected in our character
3. In our community: We must be witnesses of ${theme} to a watching world

The early church understood this principle. They didn't just believe - they lived their faith boldly and authentically.`,
          },
          {
            title: 'The Hope We Have',
            content: `Finally, ${theme} points us toward our eternal hope in Christ.

No matter what challenges we face in this area, we have a hope that cannot be shaken. This hope is not based on our circumstances, our efforts, or even our understanding.

Our hope is anchored in:
- Christ's finished work on the cross
- The promise of His return
- The assurance of eternal life

${scripture_reference ? `As ${scripture_reference} reminds us, our hope is secure in Him.` : 'Scripture assures us that this hope will not disappoint.'}`,
          },
        ],
        conclusion: `In conclusion, dear friends, ${theme} is not just a topic for theological discussion - it's a living reality that should transform every aspect of our lives.

As we leave this place today, I challenge each of you to:
1. Reflect deeply on what we've discussed
2. Pray for God's wisdom in applying these truths
3. Take one specific action this week related to ${theme}

Remember, you don't walk this journey alone. We are a community of believers, supporting and encouraging one another.

Let us pray: Heavenly Father, thank you for your word and for the truth about ${theme}. Give us wisdom, courage, and faith to live out these principles. May our lives be a testimony to your grace. In Jesus' name, Amen.`,
      };

      return NextResponse.json({
        sermon: mockSermon,
        mock: true,
        message: 'Using mock data. Add ANTHROPIC_API_KEY to .env.local for AI generation.',
      });
    }

    // Real AI generation with Anthropic Claude
    const prompt = `You are a pastoral assistant helping to write a sermon. Generate a complete sermon outline based on the following:

Theme: ${theme}
Scripture Reference: ${scripture_reference || 'Not specified - choose appropriate passages'}
Target Length: ${target_length}
Audience: ${audience_type}

Please create a complete sermon with:
1. A compelling title
2. Scripture reference (if not provided, suggest one)
3. Introduction (2-3 paragraphs)
4. Three main points, each with:
   - A clear title
   - Scripture support
   - Explanation
   - Practical application
5. Conclusion with call to action and closing prayer

Format the response as JSON with this structure:
{
  "title": "sermon title",
  "scripture": "scripture reference",
  "introduction": "introduction text",
  "points": [
    {"title": "point title", "content": "point content with scripture, explanation, and application"},
    {"title": "point title", "content": "point content"},
    {"title": "point title", "content": "point content"}
  ],
  "conclusion": "conclusion text with call to action and prayer"
}

Make it theologically sound, pastorally sensitive, and practically applicable for ${audience_type} audience.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate sermon with AI');
    }

    const data = await response.json();
    const sermonText = data.content[0].text;

    // Extract JSON from the response
    const jsonMatch = sermonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const sermon = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ sermon });
  } catch (error: any) {
    console.error('Sermon generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
