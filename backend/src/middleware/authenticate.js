import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { isTokenRevoked } from '../services/tokenService.js';
import UserRepository from '../repositories/UserRepository.js';
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

    if (typeof decoded.userId !== 'string' || !decoded.userId || !Number.isInteger(decoded.exp)) {
      return errorResponse(res, 'Invalid authentication token.', 401);
    }

    if (await isTokenRevoked(token)) {
      return errorResponse(res, 'Your session has been logged out. Please log in again.', 401);
    }

    const user = await UserRepository.findById(decoded.userId);

    if (!user) {
      return errorResponse(res, 'User account not found. Please log in again.', 401);
    }

    req.user = user;
    req.authToken = token;
    req.authTokenExpiresAt = new Date(decoded.exp * 1000);
    return next();
  } catch (error) {
    return next(error);
  }
}
