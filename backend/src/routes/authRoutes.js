
import { Router } from 'express';

import {
  register,
  login,
  getCurrentUser,
  logout
} from '../controllers/authController.js';

import {
  registerValidator,
  loginValidator
} from '../validators/authValidator.js';

import { validateRequest } from '../middleware/validateRequest.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  registerValidator,
  validateRequest,
  register
);

// POST /api/auth/login
router.post(
  '/login',
  loginValidator,
  validateRequest,
  login
);

// GET /api/auth/me
router.get(
  '/me',
  authenticate,
  getCurrentUser
);

// POST /api/auth/logout
router.post(
  '/logout',
  authenticate,
  logout
);

export default router;
