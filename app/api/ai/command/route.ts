import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextRequest } from 'next/server';
import { deAnonymizeText } from '@/lib/ai/context-builder';

const defaultSystemPrompt = `You are an AI writing assistant helping to create and edit legal documents, specifically wills.
You should:
- Provide clear, concise, and legally appropriate language
- Maintain a formal but accessible tone
- Follow standard will document formatting conventions
- Be helpful while ensuring the content is appropriate for legal documents
- Never provide actual legal advice, only assist with document formatting and wording`;

export async function POST(req: NextRequest) {
  try {
    const { prompt, system, messages, testatorContext, tokenMap } = await req.json();

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

    // If tokenMap provided, de-anonymize the stream before returning
    if (tokenMap && Object.keys(tokenMap).length > 0) {
      return deAnonymizeStream(result.toTextStreamResponse(), tokenMap);
    }

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

/**
 * De-anonymize a streaming response by replacing tokens with actual values
 * Handles partial tokens across chunk boundaries
 */
async function deAnonymizeStream(
  response: Response,
  tokenMap: Record<string, string>
): Promise<Response> {
  const reader = response.body?.getReader();
  if (!reader) return response;

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      let buffer = ''; // Buffer for partial tokens

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            // Process remaining buffer
            if (buffer) {
              const deAnonymized = deAnonymizeText(buffer, tokenMap);
              controller.enqueue(encoder.encode(deAnonymized));
            }
            controller.close();
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          // Extract and process complete tokens
          const { processed, remainder } = extractCompleteTokens(buffer, tokenMap);

          if (processed) {
            controller.enqueue(encoder.encode(processed));
          }

          buffer = remainder;
        }
      } catch (error) {
        console.error('Stream de-anonymization error:', error);
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: response.headers,
  });
}

/**
 * Extract complete tokens from buffer and de-anonymize them
 * Returns processed text and remainder for next iteration
 */
function extractCompleteTokens(
  buffer: string,
  tokenMap: Record<string, string>
): { processed: string; remainder: string } {
  // Check if buffer contains a potential incomplete token at the end
  const tokenPattern = /\[[A-Z_-]+(?:-\d+)?\]?$/;
  const potentialIncompleteToken = buffer.match(tokenPattern);

  if (potentialIncompleteToken) {
    // Check if it's actually complete by seeing if it ends with ]
    if (potentialIncompleteToken[0].endsWith(']')) {
      // Complete token, process everything
      const processed = deAnonymizeText(buffer, tokenMap);
      return { processed, remainder: '' };
    } else {
      // Incomplete token, hold back for next chunk
      const splitPoint = potentialIncompleteToken.index || buffer.length - 10;
      const toProcess = buffer.substring(0, splitPoint);
      const remainder = buffer.substring(splitPoint);

      const processed = toProcess ? deAnonymizeText(toProcess, tokenMap) : '';
      return { processed, remainder };
    }
  }

  // No tokens detected, process everything
  const processed = deAnonymizeText(buffer, tokenMap);
  return { processed, remainder: '' };
}
