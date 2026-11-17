
import { Router } from 'express';

import {
  getAllGeneratedIdeas,
  getGeneratedIdeaById,
  createGeneratedIdea,
  deleteGeneratedIdea
} from '../controllers/generatedIdeaController.js';

import { createGeneratedIdeaValidator } from '../validators/generatedIdeaValidator.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// GET /api/generated-ideas
router.get(
  '/',
  authenticate,
  getAllGeneratedIdeas
);

// GET /api/generated-ideas/:id
router.get(
  '/:id',
  authenticate,
  getGeneratedIdeaById
);

// POST /api/generated-ideas
router.post(
  '/',
  authenticate,
  createGeneratedIdeaValidator,
  validateRequest,
  createGeneratedIdea
);

// DELETE /api/generated-ideas/:id
router.delete(
  '/:id',
  authenticate,
  deleteGeneratedIdea
);

export default router;
