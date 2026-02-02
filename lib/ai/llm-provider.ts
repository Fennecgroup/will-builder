/**
 * LLM Provider Module
 *
 * Centralized abstraction layer for different AI providers (OpenAI, Anthropic/Claude, etc.)
 * Allows easy switching between providers via environment configuration.
 */

import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import type { LanguageModel } from 'ai';

/**
 * Supported LLM providers
 */
export type LLMProvider = 'openai' | 'anthropic' | 'auto';

/**
 * Provider configuration interface
 */
interface ProviderConfig {
  provider: LLMProvider;
  apiKey?: string;
  model?: string;
}

/**
 * Default models for each provider
 */
const DEFAULT_MODELS: Record<Exclude<LLMProvider, 'auto'>, string> = {
  openai: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  anthropic: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929',
};

/**
 * Validate that the required API key is present for a provider
 */
function validateApiKey(provider: Exclude<LLMProvider, 'auto'>): void {
  const apiKeyMap: Record<Exclude<LLMProvider, 'auto'>, string | undefined> = {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
  };

  const apiKey = apiKeyMap[provider];

  if (!apiKey) {
    throw new Error(
      `Missing API key for provider "${provider}". ` +
      `Please set ${provider.toUpperCase()}_API_KEY in your environment variables.`
    );
  }
}

/**
 * Detect which provider to use based on available API keys
 * Priority: Anthropic > OpenAI
 */
function detectProvider(): Exclude<LLMProvider, 'auto'> {
  if (process.env.ANTHROPIC_API_KEY) {
    return 'anthropic';
  }

  if (process.env.OPENAI_API_KEY) {
    return 'openai';
  }

  throw new Error(
    'No LLM provider API keys found. ' +
    'Please set either ANTHROPIC_API_KEY or OPENAI_API_KEY in your environment variables.'
  );
}

/**
 * Resolve the provider to use based on configuration
 */
function resolveProvider(): Exclude<LLMProvider, 'auto'> {
  const configuredProvider = (process.env.LLM_PROVIDER || 'auto') as LLMProvider;

  if (configuredProvider === 'auto') {
    const detected = detectProvider();
    console.log(`[LLM Provider] Auto-detected provider: ${detected}`);
    return detected;
  }

  // Validate the explicitly configured provider
  validateApiKey(configuredProvider);
  console.log(`[LLM Provider] Using configured provider: ${configuredProvider}`);
  return configuredProvider;
}

/**
 * Get the model name for a provider
 */
function getModelName(provider: Exclude<LLMProvider, 'auto'>): string {
  const envModelMap: Record<Exclude<LLMProvider, 'auto'>, string | undefined> = {
    openai: process.env.OPENAI_MODEL,
    anthropic: process.env.ANTHROPIC_MODEL,
  };

  const envModel = envModelMap[provider];
  const modelName = envModel || DEFAULT_MODELS[provider];

  console.log(`[LLM Provider] Using model: ${modelName} (provider: ${provider})`);
  return modelName;
}

/**
 * Create a model instance for a specific provider
 */
function createModelInstance(
  provider: Exclude<LLMProvider, 'auto'>,
  modelName: string
) {
  switch (provider) {
    case 'openai':
      return openai(modelName);

    case 'anthropic':
      return anthropic(modelName);

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Get the default LLM model based on environment configuration
 *
 * This function:
 * 1. Reads LLM_PROVIDER from environment (defaults to 'auto')
 * 2. If 'auto', detects provider based on available API keys
 * 3. Validates the required API key is present
 * 4. Returns the appropriate Vercel AI SDK model instance
 *
 * @returns Model instance ready for use with streamText/generateText
 * @throws Error if no valid provider configuration is found
 *
 * @example
 * ```ts
 * const result = await streamText({
 *   model: getModel(),
 *   system: 'You are a helpful assistant',
 *   messages: [{ role: 'user', content: 'Hello!' }]
 * });
 * ```
 */
export function getModel(): LanguageModel {
  const provider = resolveProvider();
  const modelName = getModelName(provider);
  return createModelInstance(provider, modelName) as LanguageModel;
}

/**
 * Get an LLM model for a specific provider
 *
 * Useful when you want to explicitly use a specific provider
 * regardless of the default configuration.
 *
 * @param provider - The provider to use ('openai' or 'anthropic')
 * @param modelName - Optional model name (uses default if not provided)
 * @returns Model instance for the specified provider
 * @throws Error if the provider's API key is not configured
 *
 * @example
 * ```ts
 * // Use Claude Opus for complex legal reasoning
 * const model = getModelForProvider('anthropic', 'claude-opus-4-5-20251101');
 *
 * const result = await streamText({
 *   model,
 *   system: 'You are a legal document expert',
 *   messages: [...]
 * });
 * ```
 */
export function getModelForProvider(
  provider: Exclude<LLMProvider, 'auto'>,
  modelName?: string
): LanguageModel {
  validateApiKey(provider);
  const model = modelName || getModelName(provider);
  console.log(`[LLM Provider] Explicitly using provider: ${provider}, model: ${model}`);
  return createModelInstance(provider, model) as LanguageModel;
}

/**
 * Get the currently active provider name
 * Useful for logging and debugging
 */
export function getActiveProvider(): Exclude<LLMProvider, 'auto'> {
  return resolveProvider();
}

/**
 * Check if a specific provider is available (has API key configured)
 */
export function isProviderAvailable(provider: Exclude<LLMProvider, 'auto'>): boolean {
  try {
    validateApiKey(provider);
    return true;
  } catch {
    return false;
  }
}
