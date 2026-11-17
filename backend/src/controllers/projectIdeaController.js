
import ProjectIdeaService from '../services/projectIdeaService.js';
import { successResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAllIdeas = asyncHandler(async (req, res) => {
  const result = await ProjectIdeaService.getAllIdeas({
    category: req.query.category,
    difficulty: req.query.difficulty,
    search: req.query.search,
    page: req.query.page,
    limit: req.query.limit
  });

  return successResponse(
    res,
    result,
    'Project ideas retrieved successfully.'
  );
});

export const getIdeaById = asyncHandler(async (req, res) => {
  const idea = await ProjectIdeaService.getIdeaById(req.params.id);

  return successResponse(
    res,
    idea,
    'Project idea retrieved successfully.'
  );
});

export const createIdea = asyncHandler(async (req, res) => {
  const idea = await ProjectIdeaService.createIdea(
    req.body,
    req.user.id
  );

  return successResponse(
    res,
    idea,
    'Project idea created successfully.',
    201
  );
});

export const updateIdea = asyncHandler(async (req, res) => {
  const idea = await ProjectIdeaService.updateIdea(
    req.params.id,
    req.body
  );

  return successResponse(
    res,
    idea,
    'Project idea updated successfully.'
  );
});

export const deleteIdea = asyncHandler(async (req, res) => {
  const result = await ProjectIdeaService.deleteIdea(req.params.id);

  return successResponse(
    res,
    result,
    'Project idea deleted successfully.'
  );
});
