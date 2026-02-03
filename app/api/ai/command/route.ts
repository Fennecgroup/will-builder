import { streamText, streamObject } from 'ai';
import { NextRequest } from 'next/server';
import { getModel } from '@/lib/ai/llm-provider';
import { agentResponseSchema } from '@/lib/ai/types';

const defaultSystemPrompt = `You are an AI writing assistant helping to create and edit legal documents, specifically wills.
You should:
- Provide clear, concise, and legally appropriate language
- Maintain a formal but accessible tone
- Follow standard will document formatting conventions
- Be helpful while ensuring the content is appropriate for legal documents
- Never provide actual legal advice, only assist with document formatting and wording`;

const agentSystemPrompt = `You are an AI agent helping to edit legal will documents directly.

CRITICAL: You will ALWAYS receive the FULL document in the system prompt.
Your job is to make TARGETED changes while PRESERVING all existing content.

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

DOCUMENT MODIFICATION RULES:
1. You will receive the FULL current document state
2. You MUST return the FULL modified document with ALL original content preserved
3. Only modify the specific parts relevant to the user's request
4. Do NOT remove or omit any existing content unless explicitly asked to delete it
5. When making changes like "make headers bold", apply the change to headers but keep ALL other content intact
6. Make precise, targeted changes based on user intent
7. Preserve existing document structure and formatting
8. Maintain legal document formality and accuracy
9. For deletions that remove substantial content, set confirmationRequired: true
10. Explain your reasoning in the "explanation" field
11. Ensure "modifiedDocument" is valid Plate editor format (array of paragraph/heading blocks)
12. Use tokens like [TESTATOR], [SPOUSE], [CHILD-1] when referencing people from context
13. All JSON must be properly formatted with matching braces, brackets, and commas
14. Ensure all strings are properly escaped and quoted
15. NEVER include explanatory text outside the JSON object

CRITICAL: Your response must be PURE JSON. Start with { and end with }. Nothing else.`;

export async function POST(req: NextRequest) {
  try {
    const { prompt, system, messages, testatorContext, mode, editorContent, documentContext, fullEditorValue } = await req.json();

    console.log('[API] Received request - mode:', mode, 'prompt length:', prompt?.length);
    console.log('[API] Has fullEditorValue:', !!fullEditorValue);
    console.log('[API] Has editorContent:', !!editorContent);
    console.log('[API] Has documentContext:', !!documentContext);

    // Choose behavior based on mode
    if (mode === 'agent') {
      // AGENT MODE: Return structured JSON
      // Always send full document for agent mode to prevent content loss
      const documentToUse = fullEditorValue || editorContent;

      if (!documentToUse) {
        console.error('[API] No document provided!');
      } else {
        console.log('[API] Document structure:', {
          isArray: Array.isArray(documentToUse),
          length: Array.isArray(documentToUse) ? documentToUse.length : 'N/A',
          firstItem: Array.isArray(documentToUse) && documentToUse[0] ? documentToUse[0].type : 'N/A'
        });
      }

      const fullDocumentSection = documentToUse
        ? `\n\nFULL CURRENT DOCUMENT (you MUST preserve all of this content):\n${JSON.stringify(documentToUse, null, 2)}`
        : '';

      // Optimized context is provided as GUIDANCE, not as the source of truth
      const documentContextSection = documentContext
        ? `\n\nRELEVANT SECTIONS (for context, to help you understand what to change):\n${documentContext}`
        : '';

      const enhancedSystem = testatorContext
        ? `${agentSystemPrompt}
${fullDocumentSection}

CRITICAL INSTRUCTIONS - READ CAREFULLY:
1. The FULL CURRENT DOCUMENT above is the COMPLETE document - return ALL of it with your changes
2. Your "modifiedDocument" field must contain EVERY element from the document above
3. Only modify the specific parts the user requests - keep everything else EXACTLY as-is
4. DO NOT omit paragraphs, headers, or any other content
5. Count: if the input has 10 blocks, output should have ~10 blocks (or more if adding content)

TESTATOR CONTEXT:
${testatorContext}${documentContextSection}

NOTE: The "RELEVANT SECTIONS" above (if present) are just HINTS about where to focus your attention.
They are NOT the full document. Use them to understand context, but make your changes to the FULL DOCUMENT.`
        : agentSystemPrompt + fullDocumentSection + `

CRITICAL: The FULL CURRENT DOCUMENT above is the COMPLETE document.
Your "modifiedDocument" response must include ALL elements from that document.`;

      console.log('[Agent Mode] Starting streamText with JSON output (workaround)');
      console.log('[Agent Mode] System prompt length:', enhancedSystem.length);
      console.log('[Agent Mode] User prompt:', prompt);

      try {
        // TEMPORARY: Use streamText instead of streamObject as a workaround
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

        console.log('[Agent Mode] streamText created, returning response');

        return result.toTextStreamResponse();
      } catch (streamError) {
        console.error('[Agent Mode] Error during streamText:', streamError);
        throw streamError;
      }

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
