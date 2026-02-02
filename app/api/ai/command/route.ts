import { streamText } from 'ai';
import { NextRequest } from 'next/server';
import { getModel } from '@/lib/ai/llm-provider';

const defaultSystemPrompt = `You are an AI writing assistant helping to create and edit legal documents, specifically wills.
You should:
- Provide clear, concise, and legally appropriate language
- Maintain a formal but accessible tone
- Follow standard will document formatting conventions
- Be helpful while ensuring the content is appropriate for legal documents
- Never provide actual legal advice, only assist with document formatting and wording`;

const agentSystemPrompt = `You are an AI agent helping to edit legal will documents directly.

CRITICAL OUTPUT REQUIREMENT:
You MUST respond with ONLY a valid JSON object. NO explanatory text, NO markdown formatting, NO code blocks.
DO NOT start with phrases like "Here's the", "I've made", or any other natural language.
Your ENTIRE response must be parseable JSON starting with { and ending with }.

CAPABILITIES:
- You can add new content to the document
- You can modify existing sections
- You can delete sections (with user confirmation for destructive changes)
- You have full access to the current document state and testator information

RESPONSE FORMAT:
Return ONLY this JSON structure:
{
  "explanation": "Brief explanation of what changes you made and why",
  "changes": [
    {
      "type": "insert" | "replace" | "delete",
      "location": "Human-readable description of where the change was made (e.g., 'Added executor clause after Article 2', 'Replaced beneficiary section in Article 4')",
      "content": "The new/modified content (omit for delete)",
      "confirmationRequired": true | false
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
8. All JSON must be properly formatted with matching braces, brackets, and commas
9. Ensure all strings are properly escaped and quoted
10. NEVER include explanatory text outside the JSON object

CRITICAL: Your response must be PURE JSON. Start with { and end with }. Nothing else.`;

export async function POST(req: NextRequest) {
  try {
    const { prompt, system, messages, testatorContext, mode, editorContent, documentContext, fullEditorValue } = await req.json();

    // Choose behavior based on mode
    if (mode === 'agent') {
      // AGENT MODE: Return structured JSON
      // Use optimized document context if provided, otherwise fall back to full document
      const documentContextSection = documentContext
        ? `\n${documentContext}`
        : (editorContent ? `\nCURRENT DOCUMENT STATE:\n${JSON.stringify(editorContent, null, 2)}` : '');

      const enhancedSystem = testatorContext
        ? `${agentSystemPrompt}

TESTATOR CONTEXT:
${testatorContext}${documentContextSection}

IMPORTANT: You have access to:
- Active section (full detail) where the user is editing
- Related sections (summaries) for context
- Document outline showing all articles
${fullEditorValue ? '- Full document provided as reference when needed' : ''}

Use the context provided to make precise, informed edits.${fullEditorValue ? '\n\nFULL DOCUMENT (reference):\n' + JSON.stringify(fullEditorValue, null, 2) : ''}`
        : agentSystemPrompt;

      const result = await streamText({
        model: getModel(),
        system: enhancedSystem,
        messages: [
          ...(messages || []),
          {
            role: 'user',
            content: prompt,
          },
        ]
      });

      // Collect full response
      let fullResponse = '';
      for await (const chunk of result.textStream) {
        fullResponse += chunk;
      }

      // Parse JSON (strip markdown code blocks and any preamble text)
      let cleanedResponse = fullResponse.trim();

      // Remove markdown code blocks
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\n/, '').replace(/\n```$/, '');
      }

      // Find the first { and last } to extract just the JSON object
      const firstBrace = cleanedResponse.indexOf('{');
      const lastBrace = cleanedResponse.lastIndexOf('}');

      if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
        cleanedResponse = cleanedResponse.substring(firstBrace, lastBrace + 1);
      }

      console.log('Agent mode response length:', fullResponse.length);
      console.log('Agent mode cleaned response preview:', cleanedResponse.substring(0, 500) + '...');

      let agentResponse;
      try {
        agentResponse = JSON.parse(cleanedResponse);

        // Validate required fields
        if (!agentResponse.explanation || !agentResponse.changes || !agentResponse.modifiedDocument) {
          throw new Error('Missing required fields in AI response');
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response length:', cleanedResponse.length);
        console.error('First 1000 chars:', cleanedResponse.substring(0, 1000));
        console.error('Last 1000 chars:', cleanedResponse.substring(Math.max(0, cleanedResponse.length - 1000)));

        // Try to identify the error location
        const errorMatch = (parseError as Error).message.match(/position (\d+)/);
        if (errorMatch) {
          const position = parseInt(errorMatch[1]);
          const contextStart = Math.max(0, position - 200);
          const contextEnd = Math.min(cleanedResponse.length, position + 200);
          console.error('Error context:', cleanedResponse.substring(contextStart, contextEnd));
          console.error('Error position marker:', ' '.repeat(Math.min(200, position - contextStart)) + '^');
        }

        throw new Error(`Failed to parse AI response: ${(parseError as Error).message}. Response may be truncated or malformed.`);
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
        model: getModel(),
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
