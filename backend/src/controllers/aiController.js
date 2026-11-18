import { successResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../config/env.js';
import AIOrchestrator from '../services/ai/AIOrchestrator.js';

const aiOrchestrator = new AIOrchestrator({ config: env.ai });

export const generateWithAI = asyncHandler(async (req, res) => {
  const prompt = req.body.prompt?.trim() || 'Generate a useful software project idea.';
  const { result } = await aiOrchestrator.generate({
    prompt,
    responseJsonSchema: req.body.response_json_schema
  });

  // Keep the existing response shape so the frontend does not need changes.
  return successResponse(res, result, 'AI response generated.');
});
