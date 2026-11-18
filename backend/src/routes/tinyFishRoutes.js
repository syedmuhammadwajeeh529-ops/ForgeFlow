import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { optionalAuth } from '../middleware/optionalAuth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  searchWebValidator,
  fetchUrlsValidator,
  runBrowserAgentValidator
} from '../validators/tinyFishValidator.js';
import {
  searchWeb,
  fetchUrls,
  runBrowserAgent
} from '../controllers/tinyFishController.js';

const router = Router();
const tinyFishRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Web research request limit reached. Please try again later.'
  }
});

router.use(optionalAuth, tinyFishRateLimit);
router.post('/search', searchWebValidator, validateRequest, searchWeb);
router.post('/fetch', fetchUrlsValidator, validateRequest, fetchUrls);
router.post('/agent', runBrowserAgentValidator, validateRequest, runBrowserAgent);

export default router;
