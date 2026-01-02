import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Allow up to 5 minutes for AI generation
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, theme, scripture, description, key_points } = body;

    if (!title || !theme) {
      return NextResponse.json(
        { error: 'Title and theme are required' },
        { status: 400 }
      );
    }

    // Check if Anthropic API key is configured
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your-anthropic-key-here') {
      // Return mock sermon outline for testing
      const mockOutline = {
        title: title,
        scripture: scripture,
        introduction: `Welcome, brothers and sisters in Christ. Today we gather to explore "${title}".

${description}

As we dive into ${scripture}, we'll discover profound truths that speak directly to our lives today. This message is designed to not only inform our minds but transform our hearts and inspire us to action.

Let's approach God's Word with open hearts, ready to receive what He has for us.`,
        points: key_points.map((point: string, idx: number) => ({
          title: point,
          content: `${point} - A Deep Dive

Scripture Foundation:
${scripture} provides us with clear teaching on this principle. When we examine the context and original meaning, we discover layers of truth that apply directly to our situation.

Theological Understanding:
From a biblical perspective, ${point.toLowerCase()} is not merely a suggestion but a fundamental aspect of living out our faith. The early church understood this, and we see evidence throughout the New Testament of believers wrestling with and applying this truth.

Practical Application:
So what does this look like in our daily lives?

1. In our personal walk: We must consistently ${point.toLowerCase()} through prayer, study, and reflection
2. In our relationships: This principle transforms how we interact with family, friends, and even strangers
3. In our community: The church becomes a beacon of hope when we collectively embody this truth

Real-Life Example:
Consider the story of [biblical figure/modern example] who exemplified ${point.toLowerCase()}. Their journey shows us that while the path may be challenging, the rewards of faithfulness are beyond measure.

Challenge:
This week, I challenge you to take one concrete step toward ${point.toLowerCase()} in your own life. Don't wait for perfect conditions - start where you are, with what you have.`,
        })),
        conclusion: `As we conclude, let's remember the heart of today's message: ${title}.

We've explored how ${scripture} calls us to:
${key_points.map((p: string, i: number) => `\n${i + 1}. ${p}`).join('')}

These aren't just ideas to consider - they're invitations to transformation. God is calling each of us to respond, to take what we've learned today and live it out courageously.

Closing Prayer:
Heavenly Father, thank you for your Word and for the truth about ${theme}. Give us wisdom to understand, courage to apply, and perseverance to continue growing. May our lives be testimonies to your grace and power. Transform us from the inside out. In Jesus' name, Amen.

Go in peace, knowing that the same Spirit who raised Christ from the dead lives in you and empowers you for every good work.`,
        applicationQuestions: [
          `How does understanding ${theme} change your perspective on current challenges?`,
          `What specific action can you take this week to apply one of the key points?`,
          `Who in your life needs to hear about ${theme}, and how can you share it?`,
          `What obstacles might prevent you from living out this truth, and how can you overcome them?`,
          `How can you encourage others in your church community to embrace ${theme}?`,
        ],
      };

      return NextResponse.json({
        outline: mockOutline,
        mock: true,
        message: 'Using mock data. Add ANTHROPIC_API_KEY to .env.local for AI generation.',
      });
    }

    // Real AI generation with Anthropic Claude
    const prompt = `You are a pastoral assistant helping to create a detailed sermon outline. Based on this sermon idea, create a comprehensive outline that a pastor can use as a foundation for writing their full sermon:

Title: ${title}
Theme: ${theme}
Scripture: ${scripture}
Description: ${description}
Key Points to Cover: ${key_points.join(', ')}

Create a detailed sermon outline with:
1. Introduction (3-4 paragraphs that hook the audience and introduce the topic)
2. For EACH of the ${key_points.length} key points, provide:
   - The point title
   - Detailed content including:
     * Scripture foundation and exegesis
     * Theological explanation
     * Practical application with specific examples
     * A challenge or call to action related to this point
3. Conclusion (powerful closing with summary, final challenge, and prayer)
4. 5 application questions for personal reflection or small group discussion

IMPORTANT: Return ONLY valid JSON, no markdown formatting or code blocks. Use \\n for line breaks within strings.

Format the response as JSON with this structure:
{
  "outline": {
    "title": "${title}",
    "scripture": "${scripture}",
    "introduction": "introduction text (3-4 paragraphs with \\n\\n between them)",
    "points": [
      {
        "title": "point title",
        "content": "detailed content with \\n\\n separating sections"
      }
    ],
    "conclusion": "conclusion with \\n\\n for paragraphs",
    "applicationQuestions": ["question 1", "question 2", "question 3", "question 4", "question 5"]
  }
}

Make it theologically sound, pastorally sensitive, and rich with practical wisdom. Return valid JSON only.`;

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
      throw new Error('Failed to generate sermon outline with AI');
    }

    const data = await response.json();
    const responseText = data.content[0].text;

    console.log('[SERMON-OUTLINE] AI Response (first 500 chars):', responseText.substring(0, 500));

    // Remove markdown code blocks if present (Claude sometimes wraps JSON)
    const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    // Extract JSON from the response (matching sermon-ideas pattern)
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[SERMON-OUTLINE] No JSON found in response');
      // Fallback to mock data
      const mockOutline = {
        title: title,
        scripture: scripture,
        introduction: `Welcome, brothers and sisters in Christ. Today we gather to explore "${title}".\n\n${description}\n\nAs we dive into ${scripture}, we'll discover profound truths that speak directly to our lives today. This message is designed to not only inform our minds but transform our hearts and inspire us to action.\n\nLet's approach God's Word with open hearts, ready to receive what He has for us.`,
        points: key_points.map((point: string, idx: number) => ({
          title: point,
          content: `${point} - A Deep Dive\n\nScripture Foundation:\n${scripture} provides us with clear teaching on this principle. When we examine the context and original meaning, we discover layers of truth that apply directly to our situation.\n\nTheological Understanding:\nFrom a biblical perspective, ${point.toLowerCase()} is not merely a suggestion but a fundamental aspect of living out our faith. The early church understood this, and we see evidence throughout the New Testament of believers wrestling with and applying this truth.\n\nPractical Application:\nSo what does this look like in our daily lives?\n\n1. In our personal walk: We must consistently ${point.toLowerCase()} through prayer, study, and reflection\n2. In our relationships: This principle transforms how we interact with family, friends, and even strangers\n3. In our community: The church becomes a beacon of hope when we collectively embody this truth\n\nReal-Life Example:\nConsider the story of [biblical figure/modern example] who exemplified ${point.toLowerCase()}. Their journey shows us that while the path may be challenging, the rewards of faithfulness are beyond measure.\n\nChallenge:\nThis week, I challenge you to take one concrete step toward ${point.toLowerCase()} in your own life. Don't wait for perfect conditions - start where you are, with what you have.`,
        })),
        conclusion: `As we conclude, let's remember the heart of today's message: ${title}.\n\nWe've explored how ${scripture} calls us to:\n${key_points.map((p: string, i: number) => `\n${i + 1}. ${p}`).join('')}\n\nThese aren't just ideas to consider - they're invitations to transformation. God is calling each of us to respond, to take what we've learned today and live it out courageously.\n\nClosing Prayer:\nHeavenly Father, thank you for your Word and for the truth about ${theme}. Give us wisdom to understand, courage to apply, and perseverance to continue growing. May our lives be testimonies to your grace and power. Transform us from the inside out. In Jesus' name, Amen.\n\nGo in peace, knowing that the same Spirit who raised Christ from the dead lives in you and empowers you for every good work.`,
        applicationQuestions: [
          `How does understanding ${theme} change your perspective on current challenges?`,
          `What specific action can you take this week to apply one of the key points?`,
          `Who in your life needs to hear about ${theme}, and how can you share it?`,
          `What obstacles might prevent you from living out this truth, and how can you overcome them?`,
          `How can you encourage others in your church community to embrace ${theme}?`,
        ],
      };
      return NextResponse.json({
        outline: mockOutline,
        fallback: true,
        reason: 'No JSON found in AI response',
      });
    }

    console.log('[SERMON-OUTLINE] Extracted JSON (first 500 chars):', jsonMatch[0].substring(0, 500));

    try {
      const result = JSON.parse(jsonMatch[0]);
      return NextResponse.json(result);
    } catch (parseError: any) {
      console.error('[SERMON-OUTLINE] JSON parse error:', parseError.message);
      console.error('[SERMON-OUTLINE] Failed JSON (first 500 chars):', jsonMatch[0].substring(0, 500));

      // Fallback to mock data
      const mockOutline = {
        title: title,
        scripture: scripture,
        introduction: `Welcome, brothers and sisters in Christ. Today we gather to explore "${title}".\n\n${description}\n\nAs we dive into ${scripture}, we'll discover profound truths that speak directly to our lives today. This message is designed to not only inform our minds but transform our hearts and inspire us to action.\n\nLet's approach God's Word with open hearts, ready to receive what He has for us.`,
        points: key_points.map((point: string, idx: number) => ({
          title: point,
          content: `${point} - A Deep Dive\n\nScripture Foundation:\n${scripture} provides us with clear teaching on this principle. When we examine the context and original meaning, we discover layers of truth that apply directly to our situation.\n\nTheological Understanding:\nFrom a biblical perspective, ${point.toLowerCase()} is not merely a suggestion but a fundamental aspect of living out our faith. The early church understood this, and we see evidence throughout the New Testament of believers wrestling with and applying this truth.\n\nPractical Application:\nSo what does this look like in our daily lives?\n\n1. In our personal walk: We must consistently ${point.toLowerCase()} through prayer, study, and reflection\n2. In our relationships: This principle transforms how we interact with family, friends, and even strangers\n3. In our community: The church becomes a beacon of hope when we collectively embody this truth\n\nReal-Life Example:\nConsider the story of [biblical figure/modern example] who exemplified ${point.toLowerCase()}. Their journey shows us that while the path may be challenging, the rewards of faithfulness are beyond measure.\n\nChallenge:\nThis week, I challenge you to take one concrete step toward ${point.toLowerCase()} in your own life. Don't wait for perfect conditions - start where you are, with what you have.`,
        })),
        conclusion: `As we conclude, let's remember the heart of today's message: ${title}.\n\nWe've explored how ${scripture} calls us to:\n${key_points.map((p: string, i: number) => `\n${i + 1}. ${p}`).join('')}\n\nThese aren't just ideas to consider - they're invitations to transformation. God is calling each of us to respond, to take what we've learned today and live it out courageously.\n\nClosing Prayer:\nHeavenly Father, thank you for your Word and for the truth about ${theme}. Give us wisdom to understand, courage to apply, and perseverance to continue growing. May our lives be testimonies to your grace and power. Transform us from the inside out. In Jesus' name, Amen.\n\nGo in peace, knowing that the same Spirit who raised Christ from the dead lives in you and empowers you for every good work.`,
        applicationQuestions: [
          `How does understanding ${theme} change your perspective on current challenges?`,
          `What specific action can you take this week to apply one of the key points?`,
          `Who in your life needs to hear about ${theme}, and how can you share it?`,
          `What obstacles might prevent you from living out this truth, and how can you overcome them?`,
          `How can you encourage others in your church community to embrace ${theme}?`,
        ],
      };
      return NextResponse.json({
        outline: mockOutline,
        fallback: true,
        reason: parseError.message,
      });
    }
  } catch (error: any) {
    console.error('Sermon outline generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
