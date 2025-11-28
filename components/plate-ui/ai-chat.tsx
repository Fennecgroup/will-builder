'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Sparkles, Loader2, User, Bot, X } from 'lucide-react';
import type { WillContent } from '@/lib/types/will';
import { buildTestatorContext, deAnonymizeText } from '@/lib/ai/context-builder';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatProps {
  onInsert: (text: string) => void;
  willContent?: WillContent;
  className?: string;
}

export function AIChat({ onInsert, willContent, className }: AIChatProps) {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hello! I'm your AI writing assistant. I can help you draft, edit, and improve your will document. How can I assist you today?",
    },
  ]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input.trim();
    setInput('');
    setIsLoading(true);

    // Build testator context for chat
    const context = willContent
      ? buildTestatorContext({
          action: 'chat',
          selectedText: userInput,
          willContent,
          interactionType: 'chat',
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        })
      : null;

    try {
      const response = await fetch('/api/ai/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userInput,
          system: `You are an AI assistant helping with legal document writing, specifically wills.
You should:
- Provide helpful suggestions for will content
- Answer questions about will structure and language
- Suggest improvements to existing text
- Help draft specific clauses or sections
- Always be clear that you're providing assistance, not legal advice
Format your responses in a clear, readable way.`,
          testatorContext: context?.contextData,
          // No tokenMap in API call
        }),
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          assistantContent += chunk;

          // De-anonymize before displaying
          const displayContent = context
            ? deAnonymizeText(assistantContent, Object.fromEntries(context.tokenMap))
            : assistantContent;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessage.id
                ? { ...msg, content: displayContent }
                : msg
            )
          );
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsertMessage = (content: string) => {
    onInsert(content);
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full",
        "border-l border-neutral-200 dark:border-neutral-800",
        "bg-white dark:bg-neutral-950",
        className
      )}
    >
      {/* Header - Fixed */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 px-4 py-3 flex-shrink-0">
        <Sparkles className="h-5 w-5 text-purple-500" />
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          AI Writing Assistant
        </h2>
      </div>

      {/* Messages - Scrollable */}
      <ScrollArea className="flex-1 min-h-0 px-4" ref={scrollRef}>
        <div className="space-y-4 py-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3 text-sm',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              )}
              <div
                className={cn(
                  'rounded-lg px-4 py-2 max-w-[80%]',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.role === 'assistant' && message.content && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-7 text-xs"
                    onClick={() => handleInsertMessage(message.content)}
                  >
                    Insert into editor
                  </Button>
                )}
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Loader2 className="h-4 w-4 text-purple-600 dark:text-purple-400 animate-spin" />
              </div>
              <div className="rounded-lg px-4 py-2 bg-muted">
                <p className="text-sm text-muted-foreground">Thinking...</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Form - Fixed at Bottom */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 px-4 py-3 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your will..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
