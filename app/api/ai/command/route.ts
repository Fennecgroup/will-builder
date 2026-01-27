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

const agentSystemPrompt = `You are an AI agent helping to edit legal will documents directly.

CAPABILITIES:
- You can add new content to the document
- You can modify existing sections
- You can delete sections (with user confirmation for destructive changes)
- You have full access to the current document state and testator information

RESPONSE FORMAT:
You MUST respond with ONLY a valid JSON object (no markdown, no code blocks, just raw JSON):
{
  "explanation": "Brief explanation of what changes you made and why",
  "changes": [
    {
      "type": "insert" | "replace" | "delete",
      "location": "Human-readable description of where the change was made (e.g., 'Added executor clause after Article 2', 'Replaced beneficiary section in Article 4')",
      "content": "The new/modified content (omit for delete)",
      "confirmationRequired": true | false  // Set to true for destructive deletions
    }
  ],
  "modifiedDocument": [/* Full updated Plate editor value array */]
}

RULES:
1. Make precise, targeted changes based on user intent
2. Preserve existing document structure and formatting
3. Maintain legal document formality and accuracy
4. For deletions that remove substantial content, set confirmationRequired: true
5. Explain your reasoning in the "explanation" field
6. Ensure "modifiedDocument" is valid Plate editor format (array of paragraph/heading blocks)
7. Use tokens like [TESTATOR], [SPOUSE], [CHILD-1] when referencing people from context

IMPORTANT: Return ONLY the JSON object. Do NOT wrap it in markdown code blocks.`;

export async function POST(req: NextRequest) {
  try {
    const { prompt, system, messages, testatorContext, mode, editorContent } = await req.json();

    // Choose behavior based on mode
    if (mode === 'agent') {
      // AGENT MODE: Return structured JSON
      const enhancedSystem = testatorContext
        ? `${agentSystemPrompt}

TESTATOR CONTEXT:
${testatorContext}

CURRENT DOCUMENT STATE:
${JSON.stringify(editorContent, null, 2)}`
        : agentSystemPrompt;

      const result = await streamText({
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

      // Collect full response
      let fullResponse = '';
      for await (const chunk of result.textStream) {
        fullResponse += chunk;
      }

      // Parse JSON (strip markdown code blocks if present)
      let cleanedResponse = fullResponse.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\n/, '').replace(/\n```$/, '');
      }

      console.log('Agent mode raw response:', fullResponse);
      console.log('Agent mode cleaned response:', cleanedResponse);

      let agentResponse;
      try {
        agentResponse = JSON.parse(cleanedResponse);

        // Validate required fields
        if (!agentResponse.explanation || !agentResponse.changes || !agentResponse.modifiedDocument) {
          throw new Error('Missing required fields in AI response');
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Failed response:', cleanedResponse);
        throw new Error(`Failed to parse AI response: ${(parseError as Error).message}`);
      }

      // Return JSON response
      return new Response(JSON.stringify(agentResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    } else {
      // ASK MODE: Current streaming behavior
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

      return result.toTextStreamResponse();
    }
  } catch (error) {
    console.error('AI command error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process AI command', details: (error as Error).message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
