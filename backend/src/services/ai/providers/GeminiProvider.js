import { ProviderError } from '../ProviderError.js';

export default class GeminiProvider {
  constructor({ apiKey, model, timeoutMs = 30000 }) {
    Object.assign(this, { id: 'gemini', apiKey, model, timeoutMs });
  }

  async generate({ systemPrompt, prompt, schemaInstruction }) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent`;
    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': this.apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: `${prompt}${schemaInstruction}` }] }],
          generationConfig: { responseMimeType: 'application/json' }
        }),
        signal: AbortSignal.timeout(this.timeoutMs)
      });
    } catch (error) {
      const timedOut = error?.name === 'TimeoutError' || error?.name === 'AbortError';
      throw new ProviderError(this.id, timedOut ? 'Gemini request timed out.' : 'Could not connect to Gemini.', {
        status: timedOut ? 504 : 502, retryable: true, cause: error
      });
    }

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message = payload?.error?.message || 'Gemini rejected the request.';
      throw new ProviderError(this.id, String(message).slice(0, 300), {
        status: response.status,
        retryable: response.status !== 400 && response.status !== 422
      });
    }

    const content = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('');
    if (typeof content !== 'string' || !content.trim()) {
      throw new ProviderError(this.id, 'Gemini returned an empty response.', { status: 502, retryable: true });
    }
    return content;
  }
}
