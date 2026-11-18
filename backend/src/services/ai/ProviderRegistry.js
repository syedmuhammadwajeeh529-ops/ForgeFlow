import OpenAICompatibleProvider from './providers/OpenAICompatibleProvider.js';
import GeminiProvider from './providers/GeminiProvider.js';

export const createProviders = (config) => {
  const timeoutMs = config.timeoutMs;
  const p = config.providers;
  const definitions = {
    openrouter: p.openrouter.apiKey && p.openrouter.model
      ? new OpenAICompatibleProvider({
          id: 'openrouter', ...p.openrouter, timeoutMs,
          headers: {
            'HTTP-Referer': p.openrouter.siteUrl || 'http://localhost:5173',
            'X-Title': p.openrouter.appName || 'ForgeFlow'
          }
        }) : null,
    gemini: p.gemini.apiKey && p.gemini.model
      ? new GeminiProvider({ ...p.gemini, timeoutMs }) : null,
    groq: p.groq.apiKey && p.groq.model
      ? new OpenAICompatibleProvider({ id: 'groq', ...p.groq, timeoutMs }) : null,
    mistral: p.mistral.apiKey && p.mistral.model
      ? new OpenAICompatibleProvider({ id: 'mistral', ...p.mistral, timeoutMs }) : null,
    deepseek: p.deepseek.apiKey && p.deepseek.model
      ? new OpenAICompatibleProvider({ id: 'deepseek', ...p.deepseek, timeoutMs }) : null,
    openai: p.openai.apiKey && p.openai.model
      ? new OpenAICompatibleProvider({ id: 'openai', ...p.openai, timeoutMs }) : null
  };

  return config.providerOrder.split(',')
    .map((name) => definitions[name.trim().toLowerCase()])
    .filter(Boolean);
};
