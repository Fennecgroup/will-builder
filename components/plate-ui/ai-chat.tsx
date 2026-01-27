'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Sparkles, Loader2, User, Bot, X, Check } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { WillContent } from '@/lib/types/will';
import { buildTestatorContext, deAnonymizeText } from '@/lib/ai/context-builder';
import type { Value } from '@udecode/plate';

interface AgentChange {
  type: 'insert' | 'replace' | 'delete';
  location: string;
  content?: string;
  confirmationRequired?: boolean;
}

interface AgentResponse {
  explanation: string;
  changes: AgentChange[];
  modifiedDocument: Value;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode?: 'ask' | 'agent';
  changes?: AgentChange[];
}

interface AIChatProps {
  onInsert: (text: string) => void;
  onAgentEdit?: (editorValue: Value, changes: AgentChange[]) => void;
  willContent?: WillContent;
  editorValue?: Value;
  className?: string;
}

export function AIChat({ onInsert, onAgentEdit, willContent, editorValue, className }: AIChatProps) {
  const [mode, setMode] = React.useState<'ask' | 'agent'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('ai-chat-mode') as 'ask' | 'agent') || 'ask';
    }
    return 'ask';
  });
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
    localStorage.setItem('ai-chat-mode', mode);
  }, [mode]);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleAskMode = React.useCallback(async (userInput: string, context: any) => {
    console.log('Ask mode request:', { userInput, context: context?.contextData });

    const response = await fetch('/api/ai/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: userInput,
        mode: 'ask',
        system: `You are an AI assistant helping with legal document writing, specifically wills.
You should:
- Provide helpful suggestions for will content
- Answer questions about will structure and language
- Suggest improvements to existing text
- Help draft specific clauses or sections
- Always be clear that you're providing assistance, not legal advice
Format your responses in a clear, readable way.`,
        testatorContext: context?.contextData,
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
      mode: 'ask',
    };

    setMessages((prev) => [...prev, assistantMessage]);

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantContent += chunk;

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

    // Validate we received content
    if (!assistantContent.trim()) {
      console.error('Ask mode: No content received from AI');
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? { ...msg, content: 'Sorry, I received an empty response. Please try again.' }
            : msg
        )
      );
    }
  }, []);

  const handleAgentMode = React.useCallback(async (userInput: string, context: any) => {
    console.log('Agent mode request:', { userInput, context: context?.contextData });

    const response = await fetch('/api/ai/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: userInput,
        mode: 'agent',
        editorContent: editorValue,
        testatorContext: context?.contextData,
      }),
    });

    if (!response.ok) throw new Error('Failed to get AI response');

    const agentResponse: AgentResponse = await response.json();

    console.log('Agent response:', agentResponse);

    // Validate response structure
    if (!agentResponse.explanation || !agentResponse.changes || !agentResponse.modifiedDocument) {
      throw new Error('Invalid agent response structure');
    }

    if (!agentResponse.explanation.trim()) {
      agentResponse.explanation = 'Changes applied successfully.';
    }

    const displayExplanation = context
      ? deAnonymizeText(agentResponse.explanation, Object.fromEntries(context.tokenMap))
      : agentResponse.explanation;

    const destructiveChanges = agentResponse.changes.filter(c =>
      c.type === 'delete' && c.confirmationRequired
    );

    if (destructiveChanges.length > 0 && !confirm(
      `The AI wants to delete content:\n${destructiveChanges.map(c => `• ${c.location}`).join('\n')}\n\nAllow these changes?`
    )) {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Changes cancelled by user.',
        mode: 'agent',
      }]);
      return;
    }

    if (onAgentEdit) {
      onAgentEdit(agentResponse.modifiedDocument, agentResponse.changes);
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: displayExplanation,
      mode: 'agent',
      changes: agentResponse.changes,
    };

    setMessages((prev) => [...prev, assistantMessage]);
  }, [editorValue, onAgentEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      mode,
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input.trim();
    setInput('');
    setIsLoading(true);

    const context = willContent
      ? buildTestatorContext({
          action: 'chat',
          selectedText: userInput,
          willContent,
          interactionType: mode === 'agent' ? 'command' : 'chat',
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        })
      : null;

    try {
      if (mode === 'agent') {
        await handleAgentMode(userInput, context);
      } else {
        await handleAskMode(userInput, context);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        mode,
      }]);
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
                <div className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                  message.mode === 'agent'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30'
                    : 'bg-purple-100 dark:bg-purple-900/30'
                )}>
                  <Bot className={cn(
                    'h-4 w-4',
                    message.mode === 'agent'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-purple-600 dark:text-purple-400'
                  )} />
                </div>
              )}
              <div
                className={cn(
                  'rounded-lg px-4 py-2 max-w-[80%]',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>

                {message.mode === 'agent' && message.changes && message.changes.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      <Check className="h-3 w-3" />
                      Changes applied
                    </div>
                    <ul className="mt-1 text-xs text-muted-foreground space-y-0.5">
                      {message.changes.map((change, i) => (
                        <li key={i}>• {change.type}: {change.location}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {message.role === 'assistant' && message.mode === 'ask' && message.content && (
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
              <div className={cn(
                'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                mode === 'agent'
                  ? 'bg-emerald-100 dark:bg-emerald-900/30'
                  : 'bg-purple-100 dark:bg-purple-900/30'
              )}>
                <Loader2 className={cn(
                  'h-4 w-4 animate-spin',
                  mode === 'agent'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-purple-600 dark:text-purple-400'
                )} />
              </div>
              <div className="rounded-lg px-4 py-2 bg-muted">
                <p className="text-sm text-muted-foreground">
                  {mode === 'agent' ? 'Analyzing document...' : 'Thinking...'}
                </p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Mode Selector - Fixed above input */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 px-4 py-2 flex-shrink-0">
        <RadioGroup value={mode} onValueChange={(v) => setMode(v as 'ask' | 'agent')} className="flex gap-4">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="ask" id="mode-ask" />
            <Label htmlFor="mode-ask" className="text-sm font-medium cursor-pointer">Ask</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="agent" id="mode-agent" />
            <Label htmlFor="mode-agent" className="text-sm font-medium cursor-pointer">Agent</Label>
          </div>
        </RadioGroup>
        <p className="text-xs text-muted-foreground mt-1">
          {mode === 'ask'
            ? 'AI responds in chat, you manually insert text'
            : 'AI can directly modify your document'}
        </p>
      </div>

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
