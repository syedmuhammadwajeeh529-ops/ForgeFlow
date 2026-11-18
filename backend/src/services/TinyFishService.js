import { AppError } from '../utils/AppError.js';

const SEARCH_URL = 'https://api.search.tinyfish.ai/';
const FETCH_URL = 'https://api.fetch.tinyfish.ai/';
const AGENT_URL = 'https://agent.tinyfish.ai/v1/automation/run';

const getApiKey = () => {
  const key = process.env.TINYFISH_API_KEY;
  if (!key) throw new AppError('TinyFish is not configured. Add TINYFISH_API_KEY to backend/.env.', 503);
  return key;
};

const tinyFishRequest = async (url, options = {}, timeoutMs = 90000) => {
  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        'X-API-Key': getApiKey(),
        'Content-Type': 'application/json',
        ...options.headers
      },
      signal: AbortSignal.timeout(timeoutMs)
    });
  } catch (error) {
    const timedOut = error?.name === 'TimeoutError' || error?.name === 'AbortError';
    throw new AppError(timedOut ? 'TinyFish took too long to respond.' : 'Could not connect to TinyFish.', timedOut ? 504 : 502);
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.error?.message || payload?.message;
    throw new AppError(typeof message === 'string' ? message.slice(0, 300) : 'TinyFish request failed.', response.status === 429 || response.status >= 500 ? 503 : 502);
  }
  return payload;
};

export const searchWeb = async ({ query }) => {
  const url = new URL(SEARCH_URL);
  url.searchParams.set('query', query);
  return tinyFishRequest(url, { method: 'GET' });
};

export const fetchUrls = async ({ urls, purpose, format = 'markdown' }) =>
  tinyFishRequest(FETCH_URL, {
    method: 'POST',
    body: JSON.stringify({ urls, purpose, format })
  });

export const runBrowserAgent = async ({ url, goal, outputSchema }) =>
  tinyFishRequest(AGENT_URL, {
    method: 'POST',
    body: JSON.stringify({
      url,
      goal,
      ...(outputSchema ? { output_schema: outputSchema } : {})
    })
  }, 120000);

export default { searchWeb, fetchUrls, runBrowserAgent };
