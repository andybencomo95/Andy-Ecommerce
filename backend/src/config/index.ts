import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  frontendUrl: string;
  databaseUrl: string;
  stripeSecretKey: string;
  redisUrl: string;
}

const requiredVars: string[] = ['DATABASE_URL'];
const missingVars = requiredVars.filter((v) => !process.env[v]);

if (missingVars.length > 0 && process.env.NODE_ENV !== 'production') {
  console.warn(`Missing environment variables (using defaults): ${missingVars.join(', ')}`);
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret !== undefined && secret !== '') {
    return secret;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: JWT_SECRET is required in production. Set it in .env');
  }
  console.warn('WARNING: JWT_SECRET not set in development. Use .env to configure.');
  return 'dev-secret-for-local-testing-only';
}

const config: Config = {
  port: (() => {
    const p = process.env.PORT;
    return p !== undefined && p !== '' ? parseInt(p, 10) : 5000;
  })(),

  nodeEnv: (() => {
    const env = process.env.NODE_ENV;
    return env !== undefined && env !== '' ? env : 'development';
  })(),

  jwtSecret: getSecret(),

  jwtExpiresIn: (() => {
    const exp = process.env.JWT_EXPIRES_IN;
    return exp !== undefined && exp !== '' ? exp : '7d';
  })(),

  frontendUrl: (() => {
    const url = process.env.FRONTEND_URL;
    return url !== undefined && url !== '' ? url : 'http://localhost:5173';
  })(),

  databaseUrl: (() => {
    const db = process.env.DATABASE_URL;
    return db !== undefined && db !== '' ? db : 'file:./dev.db';
  })(),

  stripeSecretKey: (() => {
    const key = process.env.STRIPE_SECRET_KEY;
    return key !== undefined && key !== '' ? key : '';
  })(),

  redisUrl: (() => {
    const url = process.env.REDIS_URL;
    return url !== undefined && url !== '' ? url : '';
  })(),
};

export default config;
