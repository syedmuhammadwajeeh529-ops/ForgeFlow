import 'dotenv/config';
import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import request from 'supertest';

// CI supplies a real MySQL service. Defaults also allow the API-only tests to run locally.
process.env.NODE_ENV ||= 'test';
process.env.PORT ||= '5000';
process.env.FRONTEND_URL ||= 'http://localhost:5173';
process.env.DB_HOST ||= '127.0.0.1';
process.env.DB_PORT ||= '3306';
process.env.DB_USER ||= 'root';
process.env.DB_PASSWORD ||= '';
process.env.DB_NAME ||= 'forgeflow';
process.env.JWT_SECRET ||= 'test-only-secret-that-is-at-least-32-characters-long';

const { default: app } = await import('../src/app.js');
const { default: pool } = await import('../src/config/database.js');

after(async () => {
  await pool.end();
});

const email = `forgeflow-test-${randomUUID()}@example.test`;
const password = 'ForgeFlow-test-password-2026';
let token;
let userId;
let savedProjectId;
let projectVersionId;
let featureVersionId;
let generatedIdeaId;

test('GET /api/health returns API health', async () => {
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

test('CORS rejects an origin that is not on the allowlist', async () => {
  const response = await request(app)
    .get('/api/health')
    .set('Origin', 'https://untrusted.example');
  assert.equal(response.status, 403);
  assert.equal(response.body.success, false);
});

test('public project idea catalogue returns seeded ideas', async () => {
  const response = await request(app).get('/api/project-ideas');
  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.ok(response.body.data.items.length > 0);
});

test('registration hashes credentials and returns a usable JWT', async () => {
  const response = await request(app).post('/api/auth/register').send({
    name: 'ForgeFlow Test',
    email,
    password
  });
  assert.equal(response.status, 201);
  assert.equal(response.body.success, true);
  assert.ok(response.body.data.token);
  assert.equal(response.body.data.user.email, email);
  assert.equal(response.body.data.user.role, 'user');
  token = response.body.data.token;
  userId = response.body.data.user.id;

  const [rows] = await pool.execute('SELECT password_hash FROM users WHERE id = ?', [userId]);
  assert.equal(rows.length, 1);
  assert.notEqual(rows[0].password_hash, password);
});

test('regular users cannot create curated catalogue entries', async () => {
  const response = await request(app)
    .post('/api/project-ideas')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Forbidden curated idea',
      description: 'This should be rejected because regular users are not administrators.',
      difficulty: 'Beginner',
      category: 'Web'
    });
  assert.equal(response.status, 403);
});

test('AI endpoint reports a clear configuration error when no provider key exists', async () => {
  process.env.AI_API_KEY = '';
  process.env.OPENROUTER_API_KEY = '';
  process.env.GEMINI_API_KEY = '';
  process.env.GROQ_API_KEY = '';
  process.env.MISTRAL_API_KEY = '';
  process.env.DEEPSEEK_API_KEY = '';
  process.env.OPENAI_API_KEY = '';
  const response = await request(app)
    .post('/api/ai/generate')
    .send({ prompt: 'Generate a small web app idea.' });
  assert.equal(response.status, 503);
  assert.match(response.body.message, /AI generation is not configured/);
});

test('authenticated profile endpoint reloads the current user', async () => {
  const response = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(response.status, 200);
  assert.equal(response.body.data.id, userId);
});

test('login accepts the registered credentials', async () => {
  const response = await request(app).post('/api/auth/login').send({ email, password });
  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.ok(response.body.data.token);
});

test('saved projects support create, list, update and delete with owner scoping', async () => {
  const created = await request(app)
    .post('/api/saved-projects')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Backend integration test project',
      description: 'A project used to verify ForgeFlow backend persistence.',
      category: 'Web',
      tech_stack: ['Node.js', 'MySQL'],
      code: 'console.log("ForgeFlow");',
      language: 'javascript'
    });
  assert.equal(created.status, 201);
  savedProjectId = created.body.data.id;

  const listed = await request(app)
    .get('/api/saved-projects')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(listed.status, 200);
  assert.ok(listed.body.data.items.some((item) => item.id === savedProjectId));

  const updated = await request(app)
    .patch(`/api/saved-projects/${savedProjectId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ status: 'in_progress', notes: 'Persisted update' });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.data.status, 'in_progress');
});

test('project snapshots can be created, listed, restored and deleted', async () => {
  const created = await request(app)
    .post('/api/project-versions')
    .set('Authorization', `Bearer ${token}`)
    .send({
      project_id: savedProjectId,
      label: 'v1-test',
      code: 'console.log("snapshot");',
      language: 'javascript',
      features: ['snapshot test']
    });
  assert.equal(created.status, 201);
  projectVersionId = created.body.data.id;

  const listed = await request(app)
    .get('/api/project-versions')
    .query({ project_id: savedProjectId })
    .set('Authorization', `Bearer ${token}`);
  assert.equal(listed.status, 200);
  assert.ok(listed.body.data.some((version) => version.id === projectVersionId));

  const restored = await request(app)
    .patch(`/api/project-versions/${savedProjectId}/current`)
    .set('Authorization', `Bearer ${token}`)
    .send({ version_id: projectVersionId });
  assert.equal(restored.status, 200);
  assert.equal(restored.body.data.current_version, 'v1-test');

  const deleted = await request(app)
    .delete(`/api/project-versions/${projectVersionId}`)
    .set('Authorization', `Bearer ${token}`);
  assert.equal(deleted.status, 200);
});

test('feature history supports create, list, update and delete', async () => {
  const created = await request(app)
    .post('/api/feature-versions')
    .set('Authorization', `Bearer ${token}`)
    .send({
      project_id: savedProjectId,
      label: 'feature-plan-v1',
      features: ['Login', 'Dashboard'],
      notes: 'Initial feature plan'
    });
  assert.equal(created.status, 201);
  featureVersionId = created.body.data.id;

  const listed = await request(app)
    .get('/api/feature-versions')
    .query({ project_id: savedProjectId })
    .set('Authorization', `Bearer ${token}`);
  assert.equal(listed.status, 200);
  assert.ok(listed.body.data.some((version) => version.id === featureVersionId));

  const updated = await request(app)
    .patch(`/api/feature-versions/${featureVersionId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ label: 'feature-plan-v2', features: ['Login', 'Dashboard', 'Settings'] });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.data.label, 'feature-plan-v2');

  const deleted = await request(app)
    .delete(`/api/feature-versions/${featureVersionId}`)
    .set('Authorization', `Bearer ${token}`);
  assert.equal(deleted.status, 200);
});

test('generated ideas are persisted and scoped to the authenticated user', async () => {
  const created = await request(app)
    .post('/api/generated-ideas')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Test generated idea',
      description: 'A generated idea for testing persistent user-owned records.',
      category: 'Web',
      difficulty: 'Beginner',
      tech_stack: ['React']
    });
  assert.equal(created.status, 201);
  generatedIdeaId = created.body.data.id;

  const fetched = await request(app)
    .get(`/api/generated-ideas/${generatedIdeaId}`)
    .set('Authorization', `Bearer ${token}`);
  assert.equal(fetched.status, 200);
  assert.equal(fetched.body.data.id, generatedIdeaId);

  const deleted = await request(app)
    .delete(`/api/generated-ideas/${generatedIdeaId}`)
    .set('Authorization', `Bearer ${token}`);
  assert.equal(deleted.status, 200);
});

test('a different account cannot read another user’s saved project', async () => {
  const second = await request(app).post('/api/auth/register').send({
    name: 'Second Test',
    email: `other-${randomUUID()}@example.test`,
    password
  });
  assert.equal(second.status, 201);

  const response = await request(app)
    .get(`/api/saved-projects/${savedProjectId}`)
    .set('Authorization', `Bearer ${second.body.data.token}`);
  assert.equal(response.status, 404);
});

test('saved project can be deleted by its owner', async () => {
  const response = await request(app)
    .delete(`/api/saved-projects/${savedProjectId}`)
    .set('Authorization', `Bearer ${token}`);
  assert.equal(response.status, 200);
  assert.equal(response.body.data.deleted, true);
});

test('logout revokes the JWT so it cannot be reused', async () => {
  const loggedOut = await request(app)
    .post('/api/auth/logout')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(loggedOut.status, 200);
  assert.match(loggedOut.body.message, /Session revoked/);

  const reused = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(reused.status, 401);
  assert.match(reused.body.message, /logged out/);
});
