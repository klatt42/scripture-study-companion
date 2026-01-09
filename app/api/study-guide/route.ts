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
    const { passage, studyType = 'personal' } = body;

    if (!passage) {
      return NextResponse.json(
        { error: 'Bible passage is required' },
        { status: 400 }
      );
    }

    // Check if Anthropic API key is configured
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your-anthropic-key-here') {
      // Return mock study guide for testing
      const mockGuide = {
        title: `Study Guide: ${passage}`,
        passage: passage,
        context: {
          historical: `This passage was written in a specific historical context that shaped its meaning. Understanding the circumstances of the original audience helps us better grasp the message being conveyed. The cultural, political, and religious environment of the time provides important background for interpretation.`,
          literary: `This passage fits within the larger narrative and literary structure of the book. The genre, literary devices, and relationship to surrounding passages all inform our understanding of the text.`,
        },
        observation: {
          keyVerses: [
            `Key verse 1 from ${passage} - This verse captures the central message of the passage.`,
            `Key verse 2 from ${passage} - This verse provides important supporting truth.`,
            `Key verse 3 from ${passage} - This verse offers practical application.`,
          ],
          importantWords: [
            'Grace',
            'Faith',
            'Love',
            'Redemption',
            'Covenant',
          ],
          mainThemes: [
            `God's faithfulness to His people`,
            `The call to trust and obey`,
            `Living in community with other believers`,
          ],
        },
        interpretation: {
          meaning: `This passage teaches us about God's character and His relationship with His people. The original audience would have understood this message in light of their covenant relationship with God. For us today, the timeless truths remain: God is faithful, His Word is trustworthy, and He calls us to respond in faith and obedience. The principles found here apply across all times and cultures because they reflect the unchanging nature of God.`,
          crossReferences: [
            `Cross reference 1 - Related passage that illuminates the theme`,
            `Cross reference 2 - Old Testament background or prophecy`,
            `Cross reference 3 - New Testament fulfillment or application`,
          ],
        },
        application: {
          personalQuestions: [
            `What does this passage reveal about God's character?`,
            `How does this truth challenge your current thinking or behavior?`,
            `What specific area of your life needs to change in response?`,
          ],
          groupDiscussion: [
            `Share a time when you experienced the truth of this passage in your own life.`,
            `What obstacles might prevent us from living out these truths?`,
            `How can we encourage one another to apply what we've learned?`,
          ],
          actionSteps: [
            `Spend time this week meditating on the key verses from this passage.`,
            `Identify one specific way to apply this truth in your daily life.`,
            `Share what you've learned with someone else this week.`,
          ],
        },
      };

      return NextResponse.json({
        guide: mockGuide,
        mock: true,
        message: 'Using mock data. Add ANTHROPIC_API_KEY to .env.local for AI generation.',
      });
    }

    // Real AI generation with Anthropic Claude
    const prompt = `You are a Bible study assistant helping to create a comprehensive inductive study guide. Based on this Bible passage, create a detailed study guide using the Observation-Interpretation-Application method:

Bible Passage: ${passage}
Study Type: ${studyType === 'group' ? 'Group Study (include discussion questions)' : 'Personal Study'}

Create a detailed study guide with:

1. CONTEXT - Provide historical and literary context
   - Historical: When was this written? To whom? What were the circumstances?
   - Literary: What genre is this? Where does it fit in the book's structure?

2. OBSERVATION (What does it say?)
   - Key Verses: 3-4 significant verses from the passage with brief explanation
   - Important Words: 5-7 key words or phrases that deserve deeper study
   - Main Themes: 2-4 major themes in this passage

3. INTERPRETATION (What does it mean?)
   - Meaning: A thorough explanation of the passage's meaning (2-3 paragraphs)
   - Cross References: 3-4 related passages with brief explanation of connection

4. APPLICATION (How should I respond?)
   - Personal Questions: 3-4 reflection questions for individual study
   - Group Discussion: 3-4 questions for group discussion (if group study)
   - Action Steps: 3 specific, practical ways to apply this truth

IMPORTANT: Return ONLY valid JSON, no markdown formatting or code blocks. Use \\n for line breaks within strings.

Format the response as JSON with this exact structure:
{
  "guide": {
    "title": "Study Guide: ${passage}",
    "passage": "${passage}",
    "context": {
      "historical": "historical context text",
      "literary": "literary context text"
    },
    "observation": {
      "keyVerses": ["verse 1 with explanation", "verse 2 with explanation", "verse 3 with explanation"],
      "importantWords": ["word1", "word2", "word3", "word4", "word5"],
      "mainThemes": ["theme 1", "theme 2", "theme 3"]
    },
    "interpretation": {
      "meaning": "detailed explanation with \\n\\n for paragraphs",
      "crossReferences": ["Reference 1 - explanation", "Reference 2 - explanation", "Reference 3 - explanation"]
    },
    "application": {
      "personalQuestions": ["question 1?", "question 2?", "question 3?"],
      "groupDiscussion": ["discussion question 1?", "discussion question 2?", "discussion question 3?"],
      "actionSteps": ["action 1", "action 2", "action 3"]
    }
  }
}

Make it biblically accurate, theologically sound, and practically applicable. Return valid JSON only.`;

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
      const errorData = await response.json().catch(() => ({}));
      console.error('[STUDY-GUIDE] API error:', errorData);
      throw new Error('Failed to generate study guide with AI');
    }

    const data = await response.json();
    const responseText = data.content[0].text;

    console.log('[STUDY-GUIDE] AI Response (first 500 chars):', responseText.substring(0, 500));

    // Remove markdown code blocks if present
    const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    // Extract JSON from the response
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[STUDY-GUIDE] No JSON found in response');
      throw new Error('Invalid response from AI');
    }

    console.log('[STUDY-GUIDE] Extracted JSON (first 500 chars):', jsonMatch[0].substring(0, 500));

    try {
      const result = JSON.parse(jsonMatch[0]);
      return NextResponse.json(result);
    } catch (parseError: any) {
      console.error('[STUDY-GUIDE] JSON parse error:', parseError.message);
      throw new Error('Failed to parse AI response');
    }
  } catch (error: any) {
    console.error('Study guide generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
