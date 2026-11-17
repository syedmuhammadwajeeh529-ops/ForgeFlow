import { createHash } from 'node:crypto';
import pool from '../config/database.js';

const hashToken = (token) => createHash('sha256').update(token).digest('hex');

class RevokedTokenRepository {
  async isRevoked(token) {
    const tokenHash = hashToken(token);
    const [rows] = await pool.execute(
      'SELECT token_hash FROM revoked_tokens WHERE token_hash = ? AND expires_at > CURRENT_TIMESTAMP LIMIT 1',
      [tokenHash]
    );
    return rows.length > 0;
  }

  async revoke(token, expiresAt) {
    if (!token || !(expiresAt instanceof Date) || Number.isNaN(expiresAt.getTime())) {
      throw new TypeError('A valid token and expiry date are required to revoke a session.');
    }

    const tokenHash = hashToken(token);
    await pool.execute(
      'INSERT INTO revoked_tokens (token_hash, expires_at) VALUES (?, ?) ON DUPLICATE KEY UPDATE expires_at = VALUES(expires_at)',
      [tokenHash, expiresAt]
    );

    // Opportunistically remove expired hashes so the table stays compact.
    await pool.execute('DELETE FROM revoked_tokens WHERE expires_at <= CURRENT_TIMESTAMP');
  }
}

export default new RevokedTokenRepository();
