import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import { env } from '../config/env.js';

export async function optionalAuth(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (typeof authorization !== 'string' || !authorization.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authorization.slice(7).trim();
    if (!token || token.includes(' ')) {
      req.user = null;
      return next();
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.jwt.secret, {
        issuer: 'forgeflow-api',
        algorithms: ['HS256']
      });
    } catch {
      req.user = null;
      return next();
    }

    if (typeof decoded.userId !== 'string' || !decoded.userId) {
      req.user = null;
      return next();
    }

    const [users] = await pool.execute(
      'SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1',
      [decoded.userId]
    );

    req.user = users[0] || null;
    return next();
  } catch (error) {
    return next(error);
  }
}
