import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt, system } = await req.json();

    const result = streamText({
      model: openai('gpt-4o-mini'),
      maxOutputTokens: 50,
      system: system || `You are an AI autocomplete assistant for legal document writing.
Your task is to complete the user's sentence or thought with appropriate legal language.
Rules:
- Complete only the current sentence or thought
- Keep completions brief (1-2 sentences max)
- Use formal legal language appropriate for wills
- Do not add explanations or questions
- Start your response with the completion text directly
- Never provide actual legal advice`,
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
