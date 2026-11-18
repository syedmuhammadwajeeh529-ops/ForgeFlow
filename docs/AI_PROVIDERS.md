# AI provider and TinyFish setup

## 1. AI provider failover

The frontend continues to call the existing endpoint:

`POST /api/ai/generate`

Example request:

```json
{
  "prompt": "Generate a beginner-friendly project idea",
  "response_json_schema": {
    "type": "object",
    "properties": {
      "title": { "type": "string" },
      "description": { "type": "string" }
    },
    "required": ["title", "description"]
  }
}
```

The response data remains the generated JSON object, so the frontend does not need to know which provider handled the request.

### Supported AI providers

| Provider ID | Environment key | Default model |
| --- | --- | --- |
| OpenRouter | `OPENROUTER_API_KEY` | `openrouter/free` |
| Gemini | `GEMINI_API_KEY` | `gemini-2.5-flash` |
| Groq | `GROQ_API_KEY` | `openai/gpt-oss-20b` |
| Mistral | `MISTRAL_API_KEY` | `mistral-small-latest` |
| DeepSeek | `DEEPSEEK_API_KEY` | `deepseek-chat` |
| OpenAI / compatible | `OPENAI_API_KEY` | `gpt-4o-mini` |

A provider is enabled when its API key is present. Model names and base URLs can be overridden in `backend/.env`. OpenRouter's free model availability and provider quotas can change; choose a currently available model if the `openrouter/free` alias is unavailable for your account.

### Provider order and fallback

Set the order in `AI_PROVIDER_ORDER`, for example:

```env
AI_PROVIDER_ORDER=openrouter,gemini,groq
AI_PROVIDER_TIMEOUT_MS=30000
AI_PROVIDER_COOLDOWN_MS=60000
```

Unconfigured providers are skipped. The default order contains OpenRouter, Gemini and Groq. Mistral, DeepSeek and OpenAI are supported but deliberately excluded from the default order because API usage may require paid credits. Add any of them to the order only if you want to enable it. The orchestrator tries providers sequentially. It moves to the next provider for rate limits, authentication failures, temporary server errors, connection failures, timeouts, and invalid/empty JSON responses. Invalid request errors (400 and 422) are not retried across providers.

A failed provider is temporarily cooled down. Once its cooldown expires, it is eligible again automatically. Cooldown state is in memory and resets when the backend process restarts. In a multi-instance production deployment, use a shared cache such as Redis for cross-instance circuit-breaker state.

### Legacy configuration

The previous `AI_API_KEY`, `AI_BASE_URL`, and `AI_MODEL` variables remain supported as aliases for the OpenAI-compatible provider. Existing deployments can migrate gradually.

## 2. TinyFish web tools

TinyFish has a separate service because web search, page extraction, and browser automation are not interchangeable with LLM chat generation.

All TinyFish endpoints require `TINYFISH_API_KEY` in the backend environment.

### Search

`POST /api/web/search`

```json
{
  "query": "current JavaScript framework releases"
}
```

### Fetch pages

`POST /api/web/fetch`

```json
{
  "urls": ["https://example.com"],
  "purpose": "Extract the page content for research",
  "format": "markdown"
}
```

TinyFish Fetch accepts 1 to 10 URLs per request. Supported formats are `markdown`, `html`, and `json`.

### Run a browser agent

`POST /api/web/agent`

```json
{
  "url": "https://example.com",
  "goal": "Find the pricing page and extract plan names and prices",
  "output_schema": {
    "type": "object",
    "properties": {
      "plans": { "type": "array" }
    }
  }
}
```

Search and Fetch are currently offered free by TinyFish subject to its published rate limits. Browser-agent automation has separate usage limits and may require paid credits. Browser automation can take longer than an ordinary AI completion, so the backend gives this operation a longer request timeout.

## 3. Local key setup

1. Copy `backend/.env.example` to `backend/.env` if you have not already done so.
2. Open `backend/.env` and paste each provider key into its matching variable.
3. Keep the model defaults initially. Change a model only if the provider dashboard says that model is unavailable to your account.
4. Keep keys private. Never put them in frontend environment variables, source files, screenshots, or Git commits.
5. Restart the backend after editing `.env`.

You can configure only one provider to begin with. Add more keys later and the backend will automatically include those providers in the configured order.

## 4. Operational notes

- Free-tier quotas, model availability, and rate limits are controlled by each provider and can change.
- Failover cannot guarantee uninterrupted generation if every configured provider is unavailable or all accounts have exhausted their quotas.
- Providers must return a JSON object because the existing ForgeFlow AI endpoint has a JSON response contract.
- The backend logs provider IDs and HTTP status codes on failure, never API keys.
- TinyFish is intentionally not part of the LLM failover chain.
