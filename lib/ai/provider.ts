// Unified AI Provider - supports both Anthropic Claude and Google Gemini

export type AIProvider = 'anthropic' | 'gemini';

interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  text: string;
  provider: AIProvider;
}

/**
 * Call Anthropic Claude API
 * Uses the latest Claude Sonnet 4.5 model
 */
async function callAnthropic(
  messages: AIMessage[],
  maxTokens: number = 2048
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929', // Latest Claude Sonnet 4.5
      max_tokens: maxTokens,
      messages,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Anthropic API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

/**
 * Call Google Gemini API
 * Tries multiple model versions for compatibility
 */
async function callGemini(
  messages: AIMessage[],
  maxTokens: number = 2048
): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY;

  // Convert messages to Gemini format
  const prompt = messages.map(m => m.content).join('\n\n');

  // Try different Gemini models in order of preference
  const models = [
    'gemini-1.5-pro-latest',
    'gemini-1.5-flash-latest',
    'gemini-pro',
    'gemini-1.5-pro',
  ];

  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              maxOutputTokens: maxTokens,
              temperature: 0.7,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return data.candidates[0].content.parts[0].text;
        }
      } else {
        lastError = await response.json();
      }
    } catch (error) {
      lastError = error;
      continue; // Try next model
    }
  }

  throw new Error(`Gemini API error: ${lastError?.error?.message || lastError?.message || 'All models failed'}`);
}

/**
 * Detect which AI provider is available
 */
export function getAvailableProvider(): AIProvider | null {
  if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY !== 'your-gemini-key-here') {
    return 'gemini';
  }
  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your-anthropic-key-here') {
    return 'anthropic';
  }
  return null;
}

/**
 * Call AI with automatic provider selection
 * Priority: Gemini > Anthropic > Error
 */
export async function callAI(
  prompt: string,
  maxTokens: number = 2048,
  preferredProvider?: AIProvider
): Promise<AIResponse> {
  const messages: AIMessage[] = [{ role: 'user', content: prompt }];

  // Use preferred provider if specified and available
  if (preferredProvider === 'gemini' && process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY !== 'your-gemini-key-here') {
    try {
      const text = await callGemini(messages, maxTokens);
      return { text, provider: 'gemini' };
    } catch (error: any) {
      console.error('Gemini API error, trying fallback...', error.message);
    }
  }

  if (preferredProvider === 'anthropic' && process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your-anthropic-key-here') {
    try {
      const text = await callAnthropic(messages, maxTokens);
      return { text, provider: 'anthropic' };
    } catch (error: any) {
      console.error('Anthropic API error, trying fallback...', error.message);
    }
  }

  // Auto-detect and try Gemini first (better pricing and performance)
  if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY !== 'your-gemini-key-here') {
    try {
      const text = await callGemini(messages, maxTokens);
      return { text, provider: 'gemini' };
    } catch (error: any) {
      console.error('Gemini API error:', error.message);
    }
  }

  // Fallback to Anthropic
  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your-anthropic-key-here') {
    try {
      const text = await callAnthropic(messages, maxTokens);
      return { text, provider: 'anthropic' };
    } catch (error: any) {
      console.error('Anthropic API error:', error.message);
    }
  }

  throw new Error('No AI provider available or all providers failed');
}

/**
 * Check if AI is configured
 */
export function isAIConfigured(): boolean {
  return getAvailableProvider() !== null;
}
