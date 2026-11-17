import RevokedTokenRepository from '../repositories/RevokedTokenRepository.js';

export const isTokenRevoked = (token) => RevokedTokenRepository.isRevoked(token);
export const revokeToken = (token, expiresAt) => RevokedTokenRepository.revoke(token, expiresAt);
