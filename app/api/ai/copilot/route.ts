import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextRequest } from 'next/server';

const defaultSystemPrompt = `You are an AI autocomplete assistant for legal document writing.
Your task is to complete the user's sentence or thought with appropriate legal language.
Rules:
- Complete only the current sentence or thought
- Keep completions brief (1-2 sentences max)
- Use formal legal language appropriate for wills
- Do not add explanations or questions
- Start your response with the completion text directly
- Never provide actual legal advice`;

export async function POST(req: NextRequest) {
  try {
    const { prompt, system, minimalContext } = await req.json();

    // Enhanced system prompt with minimal context if provided
    // This includes only basic non-sensitive information for better completions
    const enhancedSystem = minimalContext
      ? `${system || defaultSystemPrompt}

CONTEXT (use for natural completions):
${minimalContext}`
      : (system || defaultSystemPrompt);

    const result = streamText({
      model: openai(process.env.OPENAI_MODEL || 'gpt-4o-mini'),
      maxOutputTokens: 50,
      system: enhancedSystem,
      messages: [
        {
          role: 'user',
          content: `Complete this text naturally: "${prompt}"`,
        },
      ],
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('AI copilot error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process copilot request' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
