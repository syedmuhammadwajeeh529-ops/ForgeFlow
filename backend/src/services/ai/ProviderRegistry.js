import OpenAICompatibleProvider from './providers/OpenAICompatibleProvider.js';

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
    groq: p.groq.apiKey && p.groq.model
      ? new OpenAICompatibleProvider({ id: 'groq', ...p.groq, timeoutMs }) : null
  };

  const providerOrder = Array.isArray(config.providerOrder)
    ? config.providerOrder
    : String(config.providerOrder || 'openrouter,groq').split(',');

  return providerOrder
    .map((name) => String(name).trim().toLowerCase())
    .filter(Boolean)
    .map((name) => definitions[name])
    .filter(Boolean);
};
