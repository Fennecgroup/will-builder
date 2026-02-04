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

**CRITICAL OUTPUT REQUIREMENT - READ CAREFULLY:**

You MUST output your response as NEWLINE-DELIMITED JSON (NDJSON).
This means: ONE JSON object per line, separated by newline characters.

DO NOT output a single large JSON object.
DO NOT use markdown code blocks (no \`\`\`json).
DO NOT add any explanatory text outside the JSON objects.

**OUTPUT FORMAT:**

For each document block, output ONE line:
{"type":"block","index":0,"node":{"type":"p","children":[{"text":"content"}]}}

After ALL blocks, output ONE final line:
{"type":"complete","explanation":"Brief explanation","changes":[{"type":"insert","location":"Added clause","confirmationRequired":false}],"totalBlocks":10}

**CONCRETE EXAMPLE - YOUR OUTPUT SHOULD LOOK EXACTLY LIKE THIS:**

{"type":"block","index":0,"node":{"type":"h1","children":[{"text":"LAST WILL AND TESTAMENT"}]}}
{"type":"block","index":1,"node":{"type":"p","children":[{"text":"I, [TESTATOR], declare this to be my last will."}]}}
{"type":"block","index":2,"node":{"type":"h2","children":[{"text":"Article 1: Executors"}]}}
{"type":"complete","explanation":"Made all headers bold as requested","changes":[{"type":"replace","location":"Updated document headers","confirmationRequired":false}],"totalBlocks":3}

**RULES:**
- Output blocks in order (index 0, 1, 2, ...)
- Each line must be a complete, valid JSON object
- NO text before the first {
- NO text after the last }
- Each line ends with a newline character (\n)

CAPABILITIES:
- You can add new content to the document
- You can modify existing sections
- You can delete sections (with user confirmation for destructive changes)
- You have full access to the current document state and testator information

DOCUMENT MODIFICATION RULES:
1. You will receive the FULL current document state
2. You MUST return the FULL modified document with ALL original content preserved
3. Only modify the specific parts relevant to the user's request
4. Do NOT remove or omit any existing content unless explicitly asked to delete it
5. When making changes like "make headers bold", apply the change to headers but keep ALL other content intact
6. Make precise, targeted changes based on user intent
7. Preserve existing document structure and formatting
8. Maintain legal document formality and accuracy
9. For deletions that remove substantial content, set confirmationRequired: true in the changes array
10. Explain your reasoning in the "explanation" field of the complete message
11. Use tokens like [TESTATOR], [SPOUSE], [CHILD-1] when referencing people from context
12. All JSON must be properly formatted with matching braces, brackets, and commas
13. Ensure all strings are properly escaped and quoted

CRITICAL: Your response must be PURE NDJSON. One JSON object per line. Nothing else.`;

export async function POST(req: NextRequest) {
  try {
    const { prompt, system, messages, testatorContext, mode, editorContent, documentContext, fullEditorValue } = await req.json();

    console.log('[API] Received request - mode:', mode, 'prompt length:', prompt?.length);
    console.log('[API] Has fullEditorValue:', !!fullEditorValue);
    console.log('[API] Has editorContent:', !!editorContent);
    console.log('[API] Has documentContext:', !!documentContext);

    // Log LLM provider info for debugging
    try {
      const model = getModel();
      console.log('[API] Using LLM provider:', process.env.LLM_PROVIDER || 'auto');
      console.log('[API] Model initialized successfully');
    } catch (modelError) {
      console.error('[API] Error getting model:', modelError);
      throw new Error(`Failed to initialize LLM model: ${(modelError as Error).message}`);
    }

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
        const model = getModel();

        const result = streamText({
          model,
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
        console.error('[Agent Mode] Error details:', {
          name: (streamError as Error).name,
          message: (streamError as Error).message,
          stack: (streamError as Error).stack
        });
        throw streamError;
      }

    } else {
      // ASK MODE: Current streaming behavior
      console.log('[Ask Mode] Starting streamText');

      const enhancedSystem = testatorContext
        ? `${system || defaultSystemPrompt}

TESTATOR CONTEXT:
${testatorContext}

IMPORTANT: When referencing people or details from the context, use the exact tokens provided (e.g., [TESTATOR], [SPOUSE], [CHILD-1]). These tokens will be automatically replaced with actual names in the output.`
        : (system || defaultSystemPrompt);

      try {
        const model = getModel();

        const result = streamText({
          model,
          system: enhancedSystem,
          messages: [
            ...(messages || []),
            {
              role: 'user',
              content: prompt,
            },
          ],
        });

        console.log('[Ask Mode] streamText created, returning response');

        return result.toTextStreamResponse();
      } catch (streamError) {
        console.error('[Ask Mode] Error during streamText:', streamError);
        console.error('[Ask Mode] Error details:', {
          name: (streamError as Error).name,
          message: (streamError as Error).message,
          stack: (streamError as Error).stack
        });
        throw streamError;
      }
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
