import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../middleware/authenticate.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { generateWithAIValidator } from '../validators/aiValidator.js';
import { generateWithAI } from '../controllers/aiController.js';

const router = Router();
const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 12,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'AI generation limit reached. Please try again later.'
  }
});

router.post('/generate', authenticate, aiRateLimit, generateWithAIValidator, validateRequest, generateWithAI);
export default router;
