import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

// Set safe test configuration before importing modules that validate env at startup.
process.env.NODE_ENV = 'test';
process.env.PORT = '5000';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.DB_HOST = '127.0.0.1';
process.env.DB_PORT = '3306';
process.env.DB_USER = 'forgeflow_test';
process.env.DB_PASSWORD = '';
process.env.DB_NAME = 'forgeflow_test';
process.env.JWT_SECRET = 'test-only-secret-that-is-at-least-32-characters-long';

const { default: app } = await import('../src/app.js');

test('GET /api/health returns API health without requiring a database connection', async () => {
  const response = await request(app).get('/api/health');
  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.status, 'ok');
  assert.equal(response.body.service, 'forgeflow-api');
});

test('unknown API routes return a consistent JSON 404 response', async () => {
  const response = await request(app).get('/api/route-that-does-not-exist');
  assert.equal(response.status, 404);
  assert.equal(response.body.success, false);
  assert.match(response.body.message, /Route not found/);
});

test('protected saved-project routes reject requests without a bearer token', async () => {
  const response = await request(app).get('/api/saved-projects');
  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test('login validates required credentials before accessing the database', async () => {
  const response = await request(app).post('/api/auth/login').send({});
  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.equal(response.body.message, 'Validation failed. Please check your input.');
});
