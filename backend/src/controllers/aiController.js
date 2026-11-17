import { successResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

const REQUEST_TIMEOUT_MS = 30000;

export const generateWithAI = asyncHandler(async (req, res) => {
  const key = process.env.AI_API_KEY;
  if (!key) {
    throw new AppError('AI generation is not configured. Add AI_API_KEY to backend/.env.', 503);
  }

  const baseUrl = (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
  const model = process.env.AI_MODEL || 'gpt-4o-mini';
  const prompt = req.body.prompt?.trim() || 'Generate a useful software project idea.';
  const schemaInstruction = req.body.response_json_schema
    ? `\n\nReturn a JSON object that conforms to this schema:\n${JSON.stringify(req.body.response_json_schema)}`
    : '';

  let response;
  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are ForgeFlow, a practical software project ideation assistant. Follow the user request and return useful, concrete output as valid JSON.'
          },
          { role: 'user', content: `${prompt}${schemaInstruction}` }
        ],
        response_format: { type: 'json_object' }
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      throw new AppError('The AI provider took too long to respond. Please try again.', 504);
    }
    throw new AppError('Could not connect to the AI provider. Please try again later.', 502);
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const providerMessage = payload?.error?.message;
    const safeMessage = typeof providerMessage === 'string' && response.status < 500
      ? providerMessage.slice(0, 300)
      : 'The AI provider request failed. Please try again later.';
    throw new AppError(safeMessage, 502);
  }

  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new AppError('The AI provider returned an empty response.', 502);
  }

  let result;
  try {
    result = JSON.parse(content);
  } catch {
    throw new AppError('The AI provider returned invalid JSON. Please try again.', 502);
  }

  if (!result || Array.isArray(result) || typeof result !== 'object') {
    throw new AppError('The AI provider response must be a JSON object.', 502);
  }

  return successResponse(res, result, 'AI response generated.');
});
