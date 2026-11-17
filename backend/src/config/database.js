
import mysql from 'mysql2/promise';
import { env } from './env.js';

const pool = mysql.createPool({
  host: env.database.host,
  port: env.database.port,
  user: env.database.user,
  password: env.database.password,
  database: env.database.name,

  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,

  enableKeepAlive: true,
  keepAliveInitialDelay: 0,

  charset: 'utf8mb4'
});

export async function testDatabaseConnection() {
  let connection;

  try {
    connection = await pool.getConnection();

    await connection.ping();

    console.log('MySQL database connected successfully.');

    return true;
  } catch (error) {
    console.error('MySQL database connection failed:', error.message);
    throw error;
  } finally {
    connection?.release();
  }
}

export async function closeDatabaseConnection() {
  await pool.end();
  console.log('MySQL database connection pool closed.');
}

export default pool;
