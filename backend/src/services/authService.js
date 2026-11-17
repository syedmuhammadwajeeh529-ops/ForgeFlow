
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { generateToken } from '../utils/generateToken.js';
import { formatUser } from '../utils/formatUser.js';
import { revokeToken } from './tokenService.js';

class AuthService {
  async register({ name, email, password }) {
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findByEmail(normalizedEmail);

    if (existingUser) {
      const error = new Error(
        'An account with this email address already exists.'
      );
      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await bcrypt.hash(
      password,
      env.bcryptSaltRounds
    );

    let user;

    try {
      user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: 'user'
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        const duplicateError = new Error(
          'An account with this email address already exists.'
        );
        duplicateError.statusCode = 409;
        throw duplicateError;
      }

      throw error;
    }

    const token = generateToken(user);

    return {
      user: formatUser(user),
      token
    };
  }

  async login({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findByEmail(normalizedEmail);

    if (!user) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const token = generateToken(user);

    return {
      user: formatUser(user),
      token
    };
  }

  async logout(token, expiresAt) {
    await revokeToken(token, expiresAt);
    return true;
  }

  async getCurrentUser(userId) {
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error('User account not found.');
      error.statusCode = 404;
      throw error;
    }

    return formatUser(user);
  }
}

export default new AuthService();
