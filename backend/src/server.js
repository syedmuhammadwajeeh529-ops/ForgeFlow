import app from './app.js';
import { env } from './config/env.js';
import { testDatabaseConnection, closeDatabaseConnection } from './config/database.js';

let server;
try {
  await testDatabaseConnection();
  server = app.listen(env.port, '0.0.0.0', () => console.log('ForgeFlow API listening on port ' + env.port));
} catch (error) {
  console.error('Unable to start ForgeFlow API:', error.message);
  process.exit(1);
}
async function shutdown(signal) {
  console.log(signal + ' received. Closing ForgeFlow API...');
  if (server) await new Promise((resolve) => server.close(resolve));
  await closeDatabaseConnection();
  process.exit(0);
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
