import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  register,
  login,
  getCurrentUser,
  logout
} from '../controllers/authController.js';
import { registerValidator, loginValidator } from '../validators/authValidator.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();
const authAttemptLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.'
  }
});

router.post('/register', authAttemptLimit, registerValidator, validateRequest, register);
router.post('/login', authAttemptLimit, loginValidator, validateRequest, login);
router.get('/me', authenticate, getCurrentUser);
router.post('/logout', authenticate, logout);

export default router;
