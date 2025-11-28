import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextRequest } from 'next/server';

const defaultSystemPrompt = `You are an AI writing assistant helping to create and edit legal documents, specifically wills.
You should:
- Provide clear, concise, and legally appropriate language
- Maintain a formal but accessible tone
- Follow standard will document formatting conventions
- Be helpful while ensuring the content is appropriate for legal documents
- Never provide actual legal advice, only assist with document formatting and wording`;

export async function POST(req: NextRequest) {
  try {
    const { prompt, system, messages, testatorContext } = await req.json();

    // Enhanced system prompt with testator context if provided
    const enhancedSystem = testatorContext
      ? `${system || defaultSystemPrompt}

TESTATOR CONTEXT:
${testatorContext}

IMPORTANT: When referencing people or details from the context, use the exact tokens provided (e.g., [TESTATOR], [SPOUSE], [CHILD-1]). These tokens will be automatically replaced with actual names in the output.`
      : (system || defaultSystemPrompt);

    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: enhancedSystem,
      messages: [
        ...(messages || []),
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Return the raw stream - de-anonymization happens on client
    return result.toTextStreamResponse();
  } catch (error) {
    console.error('AI command error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process AI command' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
