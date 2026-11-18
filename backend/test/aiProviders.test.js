import test from 'node:test';
import assert from 'node:assert/strict';
import AIOrchestrator, { parseJsonObject } from '../src/services/ai/AIOrchestrator.js';
import { ProviderError } from '../src/services/ai/ProviderError.js';
import { createProviders } from '../src/services/ai/ProviderRegistry.js';

test('AI response parser accepts plain JSON and fenced JSON objects', () => {
  assert.deepEqual(parseJsonObject('{"name":"ForgeFlow"}'), { name: 'ForgeFlow' });
  const fence = String.fromCharCode(96).repeat(3);
  assert.deepEqual(parseJsonObject(fence + 'json\n{"name":"ForgeFlow"}\n' + fence), { name: 'ForgeFlow' });
});

test('AI response parser rejects arrays and malformed JSON', () => {
  assert.throws(() => parseJsonObject('[]'));
  assert.throws(() => parseJsonObject('{not json}'));
});

test('AI orchestrator falls through to the next provider after a rate limit', async () => {
  const attempts = [];
  const providers = [
    {
      id: 'openrouter',
      async generate() {
        attempts.push('openrouter');
        throw new ProviderError('openrouter', 'Rate limited', { status: 429, retryable: true });
      }
    },
    {
      id: 'gemini',
      async generate() {
        attempts.push('gemini');
        return '{"title":"Fallback succeeded"}';
      }
    }
  ];

  const orchestrator = new AIOrchestrator({ providers, config: { cooldownMs: 1000 } });
  const response = await orchestrator.generate({ prompt: 'Create an app idea' });

  assert.deepEqual(attempts, ['openrouter', 'gemini']);
  assert.equal(response.provider, 'gemini');
  assert.deepEqual(response.result, { title: 'Fallback succeeded' });
});

test('AI orchestrator cools down a provider that has just failed', async () => {
  let now = 1000;
  let primaryCalls = 0;
  const providers = [
    {
      id: 'primary',
      async generate() {
        primaryCalls += 1;
        throw new ProviderError('primary', 'Unavailable', { status: 503, retryable: true });
      }
    },
    {
      id: 'secondary',
      async generate() {
        return '{"ok":true}';
      }
    }
  ];
  const orchestrator = new AIOrchestrator({
    providers,
    config: { cooldownMs: 5000 },
    now: () => now
  });

  await orchestrator.generate({ prompt: 'first request' });
  await orchestrator.generate({ prompt: 'second request' });
  assert.equal(primaryCalls, 1);

  now += 6000;
  await orchestrator.generate({ prompt: 'third request' });
  assert.equal(primaryCalls, 2);
});


test('provider registry accepts provider order as an array or comma-separated string', () => {
  const providers = {
    openrouter: { apiKey: 'test-key', model: 'test-model', baseUrl: 'https://example.com/v1' },
    gemini: { apiKey: '', model: 'test-model' },
    groq: { apiKey: '', model: 'test-model' },
    deepseek: { apiKey: '', model: 'test-model' },
    openai: { apiKey: '', model: 'test-model' }
  };

  const fromArray = createProviders({
    providerOrder: ['openrouter'],
    timeoutMs: 1000,
    providers
  });
  const fromString = createProviders({
    providerOrder: 'openrouter',
    timeoutMs: 1000,
    providers
  });

  assert.deepEqual(fromArray.map((provider) => provider.id), ['openrouter']);
  assert.deepEqual(fromString.map((provider) => provider.id), ['openrouter']);
});
