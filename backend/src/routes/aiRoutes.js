import {Router} from 'express';
import {generateWithAI} from '../controllers/aiController.js';
const router=Router();
router.post('/generate',generateWithAI);
export default router;
