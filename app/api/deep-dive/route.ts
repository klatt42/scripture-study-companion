import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Allow up to 5 minutes for AI generation
export const maxDuration = 300;

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
    const { passage, focusAreas = ['wordStudy', 'historical', 'crossRef'] } = body;

    if (!passage) {
      return NextResponse.json(
        { error: 'Bible passage is required' },
        { status: 400 }
      );
    }

    // Check if Anthropic API key is configured
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your-anthropic-key-here') {
      // Return mock analysis for testing
      const mockAnalysis = {
        passage: passage,
        passageText: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
        wordStudies: [
          {
            word: 'loved',
            original: 'ἠγάπησεν (ēgapēsen)',
            language: 'Greek',
            definition: 'Agape love - unconditional, sacrificial love that seeks the highest good of the beloved',
            usage: 'This verb form indicates a decisive action of love, pointing to God\'s deliberate choice to love humanity',
          },
          {
            word: 'world',
            original: 'κόσμον (kosmon)',
            language: 'Greek',
            definition: 'The ordered universe; in this context, humanity as a whole',
            usage: 'Emphasizes the universal scope of God\'s love - not just Israel but all people',
          },
          {
            word: 'believes',
            original: 'πιστεύων (pisteuōn)',
            language: 'Greek',
            definition: 'To trust, have faith in, rely upon completely',
            usage: 'Present participle indicating ongoing, continuous faith - not just mental assent but life commitment',
          },
        ],
        historicalContext: {
          setting: 'Jesus is speaking with Nicodemus, a Pharisee and member of the Jewish ruling council (Sanhedrin), who came to Jesus at night. This conversation takes place early in Jesus\' ministry in Jerusalem.',
          audience: 'Originally addressed to Nicodemus, a learned religious leader seeking to understand Jesus\' teaching. John\'s Gospel was written for a broader audience of both Jewish and Gentile believers.',
          culturalBackground: 'Nicodemus represents the religious establishment of first-century Judaism. The reference to Moses lifting up the serpent (v.14) connects to Numbers 21, which any Jewish teacher would recognize. The concept of "eternal life" (zōē aiōnios) was understood as life in the age to come.',
        },
        literaryContext: {
          genre: 'Gospel narrative with discourse/dialogue',
          structure: 'Part of Jesus\' teaching discourse with Nicodemus (John 3:1-21). Verse 16 serves as a summary statement of the Gospel\'s central message.',
          literaryDevices: ['Parallelism', 'Contrast (perish/eternal life)', 'Universal language', 'Purpose clause'],
        },
        crossReferences: [
          {
            reference: 'Romans 5:8',
            connection: 'God demonstrates His own love toward us, in that while we were still sinners, Christ died for us - emphasizes the undeserved nature of God\'s love',
          },
          {
            reference: '1 John 4:9-10',
            connection: 'God\'s love was revealed through sending His Son - John expands on the same theme in his epistle',
          },
          {
            reference: 'Genesis 22:2',
            connection: 'Abraham\'s offering of Isaac foreshadows God giving His only Son - the "beloved son" typology',
          },
          {
            reference: 'Isaiah 53:5-6',
            connection: 'The suffering servant passage prophesies the substitutionary nature of Christ\'s sacrifice',
          },
        ],
        theologicalThemes: [
          {
            theme: 'God\'s Universal Love',
            explanation: 'God\'s love extends to all humanity ("the world"), not based on merit or ethnicity. This was revolutionary in a context where many Jews expected God\'s salvation to be limited to Israel.',
          },
          {
            theme: 'Substitutionary Atonement',
            explanation: 'God "gave" His Son - the language of sacrifice and substitution. Christ takes the place of sinners, bearing the penalty we deserved.',
          },
          {
            theme: 'Faith as the Means of Salvation',
            explanation: 'Eternal life is received through believing, not through works, ritual, or ancestry. This emphasizes grace appropriated through faith.',
          },
          {
            theme: 'Eternal Life vs. Perishing',
            explanation: 'Two destinies are presented: eternal life (relationship with God forever) or perishing (eternal separation from God). The stakes of faith are ultimate.',
          },
        ],
        applicationInsights: [
          'God\'s love is not earned but freely given. Rest in His unconditional acceptance rather than trying to earn His favor.',
          'Believing in Christ is not mere intellectual assent but ongoing trust and reliance. Examine whether your faith is living and active.',
          'Share the good news of God\'s love with others. If God loves the whole world, we should have the same heart for all people.',
          'Eternal life begins now, not just after death. Live today in the reality of your relationship with God through Christ.',
        ],
      };

      return NextResponse.json({
        analysis: mockAnalysis,
        mock: true,
        message: 'Using mock data. Add ANTHROPIC_API_KEY to .env.local for AI generation.',
      });
    }

    // Build focus areas string
    const focusAreasMap: Record<string, string> = {
      wordStudy: 'Word Studies (Greek/Hebrew analysis with definitions and usage)',
      historical: 'Historical Context (setting, audience, cultural background)',
      literary: 'Literary Context (genre, structure, literary devices)',
      crossRef: 'Cross References (related passages with connections)',
      theological: 'Theological Themes (major doctrines and themes)',
      application: 'Application Insights (practical ways to apply this truth)',
    };

    const selectedFocusAreas = focusAreas
      .filter((f: string) => focusAreasMap[f])
      .map((f: string) => focusAreasMap[f])
      .join('\n- ');

    // Real AI generation with Anthropic Claude
    const prompt = `You are a Bible study assistant helping with deep passage analysis. Analyze the following Bible passage with scholarly depth while remaining accessible:

Bible Passage: ${passage}

Focus Areas to include:
- ${selectedFocusAreas}

Create a comprehensive analysis with:

1. PASSAGE TEXT - The actual text of the passage

2. WORD STUDIES (if requested) - 3-5 key words with:
   - English word
   - Original Hebrew/Greek with transliteration
   - Language (Hebrew/Greek)
   - Definition with theological nuance
   - Usage notes for this context

3. HISTORICAL CONTEXT (if requested):
   - Setting: When, where, circumstances
   - Audience: Who originally received this
   - Cultural Background: Relevant customs, practices, worldview

4. LITERARY CONTEXT (if requested):
   - Genre: Type of biblical literature
   - Structure: How passage fits in book
   - Literary Devices: Parallelism, chiasm, metaphor, etc.

5. CROSS REFERENCES (if requested) - 4-6 related passages with:
   - Scripture reference
   - Connection to the main passage

6. THEOLOGICAL THEMES (if requested) - 3-5 major themes with:
   - Theme name
   - Explanation of how it appears in this passage

7. APPLICATION INSIGHTS (if requested) - 3-5 practical applications

IMPORTANT: Return ONLY valid JSON, no markdown. Use \\n for line breaks.

Format:
{
  "analysis": {
    "passage": "${passage}",
    "passageText": "the actual verse text",
    "wordStudies": [
      {
        "word": "English word",
        "original": "Greek/Hebrew with transliteration",
        "language": "Greek or Hebrew",
        "definition": "meaning and theological significance",
        "usage": "how it functions in this context"
      }
    ],
    "historicalContext": {
      "setting": "historical setting",
      "audience": "original recipients",
      "culturalBackground": "relevant background"
    },
    "literaryContext": {
      "genre": "genre type",
      "structure": "structural analysis",
      "literaryDevices": ["device1", "device2"]
    },
    "crossReferences": [
      {
        "reference": "Book Chapter:Verse",
        "connection": "how it relates"
      }
    ],
    "theologicalThemes": [
      {
        "theme": "Theme Name",
        "explanation": "detailed explanation"
      }
    ],
    "applicationInsights": ["insight 1", "insight 2", "insight 3"]
  }
}

Only include the sections that were requested in the focus areas. Return valid JSON only.`;

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
      console.error('[DEEP-DIVE] API error:', errorData);
      throw new Error('Failed to analyze passage with AI');
    }

    const data = await response.json();
    const responseText = data.content[0].text;

    console.log('[DEEP-DIVE] AI Response (first 500 chars):', responseText.substring(0, 500));

    // Remove markdown code blocks if present
    const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    // Extract JSON from the response
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[DEEP-DIVE] No JSON found in response');
      throw new Error('Invalid response from AI');
    }

    try {
      const result = JSON.parse(jsonMatch[0]);
      return NextResponse.json(result);
    } catch (parseError: any) {
      console.error('[DEEP-DIVE] JSON parse error:', parseError.message);
      throw new Error('Failed to parse AI response');
    }
  } catch (error: any) {
    console.error('Deep dive analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
