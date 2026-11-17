import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import { env } from '../config/env.js';
import { errorResponse } from '../utils/apiResponse.js';

export async function authenticate(req, res, next) {
  try {
    const authorization = req.headers.authorization;
    if (typeof authorization !== 'string' || !authorization.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication required. Please log in.', 401);
    }

    const token = authorization.slice(7).trim();
    if (!token || token.includes(' ')) {
      return errorResponse(res, 'Invalid authentication token.', 401);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.jwt.secret, {
        issuer: 'forgeflow-api',
        algorithms: ['HS256']
      });
    } catch (error) {
      const message = error.name === 'TokenExpiredError'
        ? 'Your session has expired. Please log in again.'
        : 'Invalid authentication token.';
      return errorResponse(res, message, 401);
    }

    if (!decoded.userId || typeof decoded.userId !== 'string') {
      return errorResponse(res, 'Invalid authentication token.', 401);
    }

    const [users] = await pool.execute(
      'SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1',
      [decoded.userId]
    );

    if (users.length === 0) {
      return errorResponse(res, 'User account not found. Please log in again.', 401);
    }

    req.user = users[0];
    return next();
  } catch (error) {
    return next(error);
  }
}
