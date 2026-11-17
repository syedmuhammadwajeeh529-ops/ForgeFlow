import { Router } from 'express';
import {
  getAllGeneratedIdeas,
  getGeneratedIdeaById,
  createGeneratedIdea,
  createGeneratedIdeas,
  deleteGeneratedIdea
} from '../controllers/generatedIdeaController.js';
import {
  createGeneratedIdeaValidator,
  createGeneratedIdeasValidator
} from '../validators/generatedIdeaValidator.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();
router.use(authenticate);
router.get('/', getAllGeneratedIdeas);
router.post('/bulk', createGeneratedIdeasValidator, validateRequest, createGeneratedIdeas);
router.get('/:id', getGeneratedIdeaById);
router.post('/', createGeneratedIdeaValidator, validateRequest, createGeneratedIdea);
router.delete('/:id', deleteGeneratedIdea);

export default router;
