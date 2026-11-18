import dotenv from 'dotenv';

dotenv.config();

const requiredVariables = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET'];
const missingVariables = requiredVariables.filter((variable) => !process.env[variable]);

if (missingVariables.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVariables.join(', ')}`);
}
if (process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long.');
}

const providerOrder = (process.env.AI_PROVIDER_ORDER || 'openrouter,groq')
  .split(',')
  .map((provider) => provider.trim().toLowerCase())
  .filter(Boolean);

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  database: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
  ai: {
    providerOrder,
    timeoutMs: Number(process.env.AI_PROVIDER_TIMEOUT_MS) || 30000,
    cooldownMs: Number(process.env.AI_PROVIDER_COOLDOWN_MS) || 60000,
    providers: {
      openrouter: {
        apiKey: process.env.OPENROUTER_API_KEY || '',
        baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
        model: process.env.OPENROUTER_MODEL || 'openrouter/free',
        siteUrl: process.env.OPENROUTER_SITE_URL || '',
        appName: process.env.OPENROUTER_APP_NAME || 'ForgeFlow'
      },
      groq: {
        apiKey: process.env.GROQ_API_KEY || '',
        baseUrl: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
        model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b'
      }
    }
  }
};
