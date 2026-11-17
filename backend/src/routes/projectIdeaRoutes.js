
import { Router } from 'express';

import {
  getAllIdeas,
  getIdeaById,
  createIdea,
  updateIdea,
  deleteIdea
} from '../controllers/projectIdeaController.js';

import {
  createProjectIdeaValidator,
  updateProjectIdeaValidator
} from '../validators/projectIdeaValidator.js';

import { validateRequest } from '../middleware/validateRequest.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = Router();

// GET /api/project-ideas
router.get('/', getAllIdeas);

// GET /api/project-ideas/:id
router.get('/:id', getIdeaById);

// POST /api/project-ideas
router.post(
  '/',
  authenticate,
  authorizeRole('admin'),
  createProjectIdeaValidator,
  validateRequest,
  createIdea
);

// PATCH /api/project-ideas/:id
router.patch(
  '/:id',
  authenticate,
  authorizeRole('admin'),
  updateProjectIdeaValidator,
  validateRequest,
  updateIdea
);

// DELETE /api/project-ideas/:id
router.delete(
  '/:id',
  authenticate,
  authorizeRole('admin'),
  deleteIdea
);

export default router;
