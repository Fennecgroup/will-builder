# AI Library

This directory contains AI-related utilities for the Fennec Will Builder application.

## Requirements

- **Vercel AI SDK v6.0+** - This project uses AI SDK v6 which supports the latest model specifications from all providers.
- The `ai` package and provider packages (`@ai-sdk/anthropic`, `@ai-sdk/openai`) must be on compatible versions.

## LLM Provider Module

The `llm-provider.ts` module provides a flexible abstraction layer for switching between different AI providers (OpenAI, Anthropic/Claude, etc.) via environment configuration.

### Features

- **Multiple Provider Support**: Easily switch between OpenAI and Anthropic (Claude)
- **Auto-Detection**: Automatically detect which provider to use based on available API keys
- **Centralized Configuration**: All provider logic in one place
- **Type-Safe**: Full TypeScript support with proper type definitions
- **Error Handling**: Clear error messages for missing API keys or invalid configurations
- **Per-Route Overrides**: Optional ability to use different providers for different routes

### Configuration

Add the following environment variables to your `.env` or `.env.local` file:

```env
# LLM Provider Configuration
# Options: 'openai', 'anthropic', or 'auto'
LLM_PROVIDER=anthropic

# OpenAI Configuration (if using OpenAI)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# Anthropic Configuration (if using Claude)
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ANTHROPIC_MODEL=claude-sonnet-4-5-20250929
```

### Usage

#### Basic Usage (Default Provider)

```typescript
import { getModel } from '@/lib/ai/llm-provider';
import { streamText } from 'ai';

const result = await streamText({
  model: getModel(),
  system: 'You are a helpful assistant',
  messages: [
    { role: 'user', content: 'Hello!' }
  ]
});
```

#### Explicit Provider Selection

Use a specific provider regardless of the default configuration:

```typescript
import { getModelForProvider } from '@/lib/ai/llm-provider';

// Use Claude Opus for complex legal reasoning
const model = getModelForProvider('anthropic', 'claude-opus-4-5-20251101');

const result = await streamText({
  model,
  system: 'You are a legal document expert',
  messages: [...]
});
```

#### Check Provider Availability

```typescript
import { isProviderAvailable, getActiveProvider } from '@/lib/ai/llm-provider';

if (isProviderAvailable('anthropic')) {
  console.log('Anthropic is configured');
}

console.log('Currently using:', getActiveProvider());
```

### Recommended Models

#### Claude (Anthropic)
- **claude-sonnet-4-5-20250929** - Balanced performance and cost (recommended default)
- **claude-opus-4-5-20251101** - Highest quality for complex legal document generation
- **claude-haiku-4-5-20250429** - Fastest and most cost-effective for autocomplete

#### OpenAI
- **gpt-4o** - Latest GPT-4 optimized (high quality)
- **gpt-4o-mini** - Cost-effective (current default)
- **gpt-4-turbo** - Previous generation GPT-4

### How It Works

1. **Provider Resolution**: When `getModel()` is called, the module:
   - Reads `LLM_PROVIDER` from environment variables
   - If set to `'auto'`, detects available providers based on API keys (prioritizes Anthropic)
   - Validates the required API key is present
   - Returns the appropriate Vercel AI SDK model instance

2. **Model Selection**:
   - Uses the model specified in `OPENAI_MODEL` or `ANTHROPIC_MODEL`
   - Falls back to sensible defaults if not specified

3. **Error Handling**:
   - Throws clear errors if API keys are missing
   - Provides helpful messages to guide developers

### Migration from Direct OpenAI Usage

Before:
```typescript
import { openai } from '@ai-sdk/openai';

const result = streamText({
  model: openai(process.env.OPENAI_MODEL || 'gpt-4o-mini'),
  // ...
});
```

After:
```typescript
import { getModel } from '@/lib/ai/llm-provider';

const result = streamText({
  model: getModel(),
  // ...
});
```

### Testing Different Providers

1. **Test with Claude (Anthropic)**:
   ```bash
   LLM_PROVIDER=anthropic npm run dev
   ```

2. **Test with OpenAI**:
   ```bash
   LLM_PROVIDER=openai npm run dev
   ```

3. **Test Auto-Detection**:
   ```bash
   LLM_PROVIDER=auto npm run dev
   ```

### Benefits

- **Flexibility**: Easy to switch providers without code changes
- **Future-Proof**: Can add new providers (Google Gemini, Meta Llama) by extending the module
- **Cost Optimization**: Use cheaper models where appropriate
- **Performance Optimization**: Use faster models for real-time features
- **Testing**: Easy to test with different providers for comparison
- **Vendor Lock-in Prevention**: Not tied to a single AI provider

## Other Modules

- **anonymizer.ts**: Anonymizes sensitive data before sending to AI
- **context-builder.ts**: Builds context for AI requests
- **document-context-builder.ts**: Specialized context building for will documents
- **relevance-scorer.ts**: Scores content relevance for context optimization
- **token-budget.ts**: Manages token budgets for AI interactions
- **types.ts**: TypeScript type definitions for AI functionality
