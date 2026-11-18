import { AppError } from '../../utils/AppError.js';
import { ProviderError } from './ProviderError.js';
import { createProviders } from './ProviderRegistry.js';

export const SYSTEM_PROMPT = 'You are ForgeFlow, a practical software project ideation assistant. Follow the user request and return useful, concrete output as valid JSON. Return one JSON object only.';

export const parseJsonObject = (content) => {
  if (typeof content !== 'string') throw new Error('AI response was not text.');
  const fence = String.fromCharCode(96);
  const cleaned = content.trim()
    .replace(new RegExp('^' + fence + '{3}(?:json)?\\s*', 'i'), '')
    .replace(new RegExp('\\s*' + fence + '{3}$', 'i'), '');
  const parsed = JSON.parse(cleaned);
  if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
    throw new Error('AI response must be a JSON object.');
  }
  return parsed;
};

export default class AIOrchestrator {
  constructor({ config, providers, now = () => Date.now() }) {
    this.providers = providers || createProviders(config);
    this.cooldownMs = config?.cooldownMs ?? 60000;
    this.now = now;
    this.cooldowns = new Map();
  }

  async generate({ prompt, responseJsonSchema }) {
    if (this.providers.length === 0) {
      throw new AppError('AI generation is not configured. Add at least one provider API key and model to backend/.env.', 503);
    }

    const schemaInstruction = responseJsonSchema
      ? `\n\nReturn a JSON object that conforms to this schema:\n${JSON.stringify(responseJsonSchema)}`
      : '';
    const attempted = [];
    let lastError;

    for (const provider of this.providers) {
      if ((this.cooldowns.get(provider.id) || 0) > this.now()) continue;
      attempted.push(provider.id);

      try {
        const content = await provider.generate({
          systemPrompt: SYSTEM_PROMPT,
          prompt,
          schemaInstruction
        });
        const result = parseJsonObject(content);
        this.cooldowns.delete(provider.id);
        return { result, provider: provider.id };
      } catch (error) {
        const failure = error instanceof ProviderError
          ? error
          : new ProviderError(provider.id, 'Provider returned an unusable response.', {
              status: 502, retryable: true, cause: error
            });
        lastError = failure;
        this.cooldowns.set(provider.id, this.now() + this.cooldownMs);
        console.warn(`AI provider "${provider.id}" failed (HTTP ${failure.status}). Trying the next configured provider.`);
        if (!failure.retryable) {
          throw new AppError('The AI request could not be processed. Please check your prompt and try again.', 502);
        }
      }
    }

    if (attempted.length === 0) {
      throw new AppError('All configured AI providers are temporarily cooling down. Please try again shortly.', 503);
    }
    throw new AppError(
      lastError?.status === 429
        ? 'All available AI providers are currently rate-limited. Please try again shortly.'
        : 'All configured AI providers are currently unavailable. Please try again shortly.',
      503
    );
  }
}
