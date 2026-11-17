
import GeneratedIdeaService from '../services/generatedIdeaService.js';
import { successResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAllGeneratedIdeas = asyncHandler(async (req, res) => {
  const result = await GeneratedIdeaService.getAllGeneratedIdeas({
    userId: req.user.id,
    category: req.query.category,
    difficulty: req.query.difficulty,
    search: req.query.search,
    page: req.query.page,
    limit: req.query.limit
  });

  return successResponse(
    res,
    result,
    'Generated ideas retrieved successfully.'
  );
});

export const getGeneratedIdeaById = asyncHandler(async (req, res) => {
  const idea = await GeneratedIdeaService.getGeneratedIdeaById(
    req.params.id,
    req.user.id
  );

  return successResponse(
    res,
    idea,
    'Generated idea retrieved successfully.'
  );
});

export const createGeneratedIdea = asyncHandler(async (req, res) => {
  const idea = await GeneratedIdeaService.createGeneratedIdea(
    { ...req.body, techStack: req.body.tech_stack || req.body.techStack || [] },
    req.user.id
  );

  return successResponse(
    res,
    idea,
    'Generated idea created successfully.',
    201
  );
});

export const deleteGeneratedIdea = asyncHandler(async (req, res) => {
  const result = await GeneratedIdeaService.deleteGeneratedIdea(
    req.params.id,
    req.user.id
  );

  return successResponse(
    res,
    result,
    'Generated idea deleted successfully.'
  );
});
