
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    env.jwt.secret,
    {
      expiresIn: env.jwt.expiresIn,
      issuer: 'forgeflow-api'
    }
  );
}
