
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import { env } from '../config/env.js';
import { errorResponse } from '../utils/apiResponse.js';

export async function authenticate(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return errorResponse(
        res,
        'Authentication required. Please log in.',
        401
      );
    }

    const token = authorization.split(' ')[1];

    if (!token) {
      return errorResponse(
        res,
        'Invalid authentication token.',
        401
      );
    }

    let decoded;

    try {
      decoded = jwt.verify(token, env.jwt.secret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return errorResponse(
          res,
          'Your session has expired. Please log in again.',
          401
        );
      }

      return errorResponse(
        res,
        'Invalid authentication token.',
        401
      );
    }

    if (!decoded.userId) {
      return errorResponse(
        res,
        'Invalid authentication token.',
        401
      );
    }

    const [users] = await pool.execute(
      `SELECT id, name, email, role
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [decoded.userId]
    );

    if (users.length === 0) {
      return errorResponse(
        res,
        'User account not found. Please log in again.',
        401
      );
    }

    req.user = users[0];

    next();
  } catch (error) {
    next(error);
  }
}
