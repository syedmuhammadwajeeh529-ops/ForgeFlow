import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createSavedProjectValidator, updateSavedProjectValidator } from '../validators/savedProjectValidator.js';
import {
  listSavedProjects,
  createSavedProject,
  getSavedProject,
  updateSavedProject,
  deleteSavedProject
} from '../controllers/savedProjectController.js';

const router = Router();
router.use(authenticate);
router.get('/', listSavedProjects);
router.post('/', createSavedProjectValidator, validateRequest, createSavedProject);
router.get('/:id', getSavedProject);
router.patch('/:id', updateSavedProjectValidator, validateRequest, updateSavedProject);
router.delete('/:id', deleteSavedProject);

export default router;
