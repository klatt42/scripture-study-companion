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
    const { topic } = body;

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Use AI to research theological topics
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your-anthropic-key-here') {
      // Mock research result
      const mockResult = {
        topic: topic,
        summary: `${topic} is a foundational concept in Christian theology that has been studied and debated throughout church history. This doctrine addresses core questions about God's nature, humanity's relationship with the divine, and the practical outworking of faith in daily life. Understanding ${topic} helps believers develop a more robust and biblically-grounded faith.`,
        keyScriptures: [
          'Romans 3:23-24 - Foundation of the doctrine',
          'Ephesians 2:8-9 - Grace through faith',
          'John 14:6 - The way, truth, and life',
          'Matthew 22:37-40 - The greatest commandments',
        ],
        theologicalPerspectives: [
          'Reformed perspective emphasizes sovereignty and grace',
          'Arminian view highlights human free will and cooperation with God',
          'Catholic tradition incorporates sacramental theology',
          'Orthodox Christianity focuses on theosis and mystical union',
        ],
        practicalApplications: [
          'Develop a consistent prayer life rooted in this understanding',
          'Apply this doctrine to ethical decision-making',
          'Share this truth with others in evangelism and discipleship',
          'Allow this theology to shape church community life',
        ],
        furtherReading: [
          'Systematic Theology by Wayne Grudem',
          'Christian Theology by Millard Erickson',
          'The Knowledge of the Holy by A.W. Tozer',
          'Mere Christianity by C.S. Lewis',
        ],
      };

      return NextResponse.json({
        result: mockResult,
        mock: true,
        message: 'Using mock data. Real AI will provide deeper research.',
      });
    }

    // Real AI research
    const prompt = `You are a theological researcher helping a pastor understand a theological topic. Provide a comprehensive but accessible overview of:

Topic: ${topic}

Please provide:
1. A clear summary (2-3 paragraphs) of what this doctrine/concept means
2. 4-5 key scripture references that are foundational to this topic
3. 4-5 major theological perspectives or traditions on this topic
4. 4-5 practical applications for church life and personal faith
5. 4-5 recommended resources for further study

Format as JSON:
{
  "result": {
    "topic": "${topic}",
    "summary": "clear explanation",
    "keyScriptures": ["scripture with brief note", ...],
    "theologicalPerspectives": ["perspective description", ...],
    "practicalApplications": ["application", ...],
    "furtherReading": ["resource", ...]
  }
}

Be theologically balanced, cite orthodox Christian tradition, and make it pastorally helpful.`;

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
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to research topic with AI');
    }

    const data = await response.json();
    const responseText = data.content[0].text;

    console.log('[THEOLOGY-RESEARCH] AI Response (first 500 chars):', responseText.substring(0, 500));

    // Remove markdown code blocks if present (Claude sometimes wraps JSON)
    const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    // Extract JSON from the response (matching sermon-ideas pattern)
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[THEOLOGY-RESEARCH] No JSON found in response');
      // Fallback to mock data
      const mockResult = {
        topic: topic,
        summary: `${topic} is a foundational concept in Christian theology that has been studied and debated throughout church history. This doctrine addresses core questions about God's nature, humanity's relationship with the divine, and the practical outworking of faith in daily life. Understanding ${topic} helps believers develop a more robust and biblically-grounded faith.`,
        keyScriptures: [
          'Romans 3:23-24 - Foundation of the doctrine',
          'Ephesians 2:8-9 - Grace through faith',
          'John 14:6 - The way, truth, and life',
          'Matthew 22:37-40 - The greatest commandments',
        ],
        theologicalPerspectives: [
          'Reformed perspective emphasizes sovereignty and grace',
          'Arminian view highlights human free will and cooperation with God',
          'Catholic tradition incorporates sacramental theology',
          'Orthodox Christianity focuses on theosis and mystical union',
        ],
        practicalApplications: [
          'Develop a consistent prayer life rooted in this understanding',
          'Apply this doctrine to ethical decision-making',
          'Share this truth with others in evangelism and discipleship',
          'Allow this theology to shape church community life',
        ],
        furtherReading: [
          'Systematic Theology by Wayne Grudem',
          'Christian Theology by Millard Erickson',
          'The Knowledge of the Holy by A.W. Tozer',
          'Mere Christianity by C.S. Lewis',
        ],
      };
      return NextResponse.json({
        result: mockResult,
        fallback: true,
        reason: 'No JSON found in AI response',
      });
    }

    console.log('[THEOLOGY-RESEARCH] Extracted JSON (first 500 chars):', jsonMatch[0].substring(0, 500));

    try {
      const result = JSON.parse(jsonMatch[0]);
      return NextResponse.json(result);
    } catch (parseError: any) {
      console.error('[THEOLOGY-RESEARCH] JSON parse error:', parseError.message);
      console.error('[THEOLOGY-RESEARCH] Failed JSON (first 500 chars):', jsonMatch[0].substring(0, 500));

      // Fallback to mock data
      const mockResult = {
        topic: topic,
        summary: `${topic} is a foundational concept in Christian theology that has been studied and debated throughout church history. This doctrine addresses core questions about God's nature, humanity's relationship with the divine, and the practical outworking of faith in daily life. Understanding ${topic} helps believers develop a more robust and biblically-grounded faith.`,
        keyScriptures: [
          'Romans 3:23-24 - Foundation of the doctrine',
          'Ephesians 2:8-9 - Grace through faith',
          'John 14:6 - The way, truth, and life',
          'Matthew 22:37-40 - The greatest commandments',
        ],
        theologicalPerspectives: [
          'Reformed perspective emphasizes sovereignty and grace',
          'Arminian view highlights human free will and cooperation with God',
          'Catholic tradition incorporates sacramental theology',
          'Orthodox Christianity focuses on theosis and mystical union',
        ],
        practicalApplications: [
          'Develop a consistent prayer life rooted in this understanding',
          'Apply this doctrine to ethical decision-making',
          'Share this truth with others in evangelism and discipleship',
          'Allow this theology to shape church community life',
        ],
        furtherReading: [
          'Systematic Theology by Wayne Grudem',
          'Christian Theology by Millard Erickson',
          'The Knowledge of the Holy by A.W. Tozer',
          'Mere Christianity by C.S. Lewis',
        ],
      };
      return NextResponse.json({
        result: mockResult,
        fallback: true,
        reason: parseError.message,
      });
    }
  } catch (error: any) {
    console.error('Theology research error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
