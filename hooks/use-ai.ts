'use client';

import * as React from 'react';
import { useEditorRef } from '@udecode/plate/react';

interface UseAIOptions {
  onComplete?: (text: string) => void;
  onError?: (error: Error) => void;
}

export function useAI(options: UseAIOptions = {}) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [streamingText, setStreamingText] = React.useState('');
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const executeCommand = React.useCallback(
    async (action: string, selectedText: string) => {
      setIsLoading(true);
      setStreamingText('');
      abortControllerRef.current = new AbortController();

      const prompts: Record<string, string> = {
        generate: `Generate appropriate content for a legal will document. Be formal and clear.`,
        improve: `Improve the following text to be more clear and professional while maintaining its legal accuracy:\n\n${selectedText}`,
        fix: `Fix any grammar, spelling, or punctuation errors in the following text:\n\n${selectedText}`,
        simplify: `Simplify the following text while maintaining its legal meaning:\n\n${selectedText}`,
        formal: `Make the following text more formal and appropriate for a legal document:\n\n${selectedText}`,
        expand: `Expand on the following text with more detail while maintaining a legal tone:\n\n${selectedText}`,
        summarize: `Summarize the following text concisely:\n\n${selectedText}`,
        continue: `Continue writing from the following text, maintaining the same style and tone:\n\n${selectedText}`,
        explain: `Explain the following text in simpler terms:\n\n${selectedText}`,
      };

      const prompt = prompts[action] || selectedText;

      try {
        const response = await fetch('/api/ai/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) throw new Error('Failed to get AI response');

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let result = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            result += chunk;
            setStreamingText(result);
          }
        }

        options.onComplete?.(result);
        return result;
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return '';
        }
        const err = error instanceof Error ? error : new Error('Unknown error');
        options.onError?.(err);
        throw err;
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [options]
  );

  const getCopilotSuggestion = React.useCallback(async (text: string) => {
    if (!text.trim()) return '';

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error('Failed to get copilot suggestion');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += decoder.decode(value);
        }
      }

      return result;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return '';
      }
      console.error('Copilot error:', error);
      return '';
    } finally {
      abortControllerRef.current = null;
    }
  }, []);

  const abort = React.useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return {
    isLoading,
    streamingText,
    executeCommand,
    getCopilotSuggestion,
    abort,
  };
}

export function useAIEditor() {
  const editor = useEditorRef();
  const { isLoading, streamingText, executeCommand, getCopilotSuggestion, abort } = useAI();

  const replaceSelection = React.useCallback(
    async (action: string, selectedText: string) => {
      const result = await executeCommand(action, selectedText);
      if (result && editor.selection) {
        editor.tf.delete();
        editor.tf.insertText(result);
      }
      return result;
    },
    [editor, executeCommand]
  );

  const insertAtCursor = React.useCallback(
    (text: string) => {
      editor.tf.insertText(text);
    },
    [editor]
  );

  return {
    isLoading,
    streamingText,
    executeCommand,
    replaceSelection,
    insertAtCursor,
    getCopilotSuggestion,
    abort,
  };
}
