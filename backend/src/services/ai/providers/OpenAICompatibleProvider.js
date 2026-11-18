import { ProviderError } from '../ProviderError.js';

export default class OpenAICompatibleProvider {
  constructor({ id, apiKey, baseUrl, model, headers = {}, timeoutMs = 30000 }) {
    Object.assign(this, { id, apiKey, model, headers, timeoutMs });
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  async generate({ systemPrompt, prompt, schemaInstruction }) {
    let response;
    try {
      response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...this.headers
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `${prompt}${schemaInstruction}` }
          ],
          response_format: { type: 'json_object' }
        }),
        signal: AbortSignal.timeout(this.timeoutMs)
      });
    } catch (error) {
      const timedOut = error?.name === 'TimeoutError' || error?.name === 'AbortError';
      throw new ProviderError(this.id, timedOut ? 'Provider request timed out.' : 'Could not connect to provider.', {
        status: timedOut ? 504 : 502, retryable: true, cause: error
      });
    }

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message = payload?.error?.message || payload?.message || 'Provider rejected the request.';
      throw new ProviderError(this.id, String(message).slice(0, 300), {
        status: response.status,
        retryable: response.status !== 400 && response.status !== 404 && response.status !== 422
      });
    }

    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      throw new ProviderError(this.id, 'Provider returned an empty response.', { status: 502, retryable: true });
    }
    return content;
  }
}
