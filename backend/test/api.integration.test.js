import 'dotenv/config';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import request from 'supertest';

const enabled = process.env.RUN_DB_INTEGRATION_TESTS === '1';

test('ForgeFlow API integration: authentication, ownership, projects, versions and AI guardrails', {
  skip: !enabled && 'Set RUN_DB_INTEGRATION_TESTS=1 and provide a disposable MySQL database to run integration tests.'
}, async () => {
  process.env.NODE_ENV = 'test';
  process.env.DB_HOST ||= '127.0.0.1';
  process.env.DB_PORT ||= '3306';
  process.env.DB_USER ||= 'root';
  process.env.DB_PASSWORD ||= '';
  // Integration tests must never touch the developer's normal ForgeFlow database.
  process.env.DB_NAME = 'forgeflow_test';
  process.env.JWT_SECRET ||= 'forgeflow-integration-test-secret-at-least-32-characters';
  process.env.FRONTEND_URL ||= 'http://localhost:5173';
  delete process.env.AI_API_KEY;
  process.env.OPENROUTER_API_KEY = '';
  process.env.GEMINI_API_KEY = '';
  process.env.GROQ_API_KEY = '';
  process.env.MISTRAL_API_KEY = '';
  process.env.DEEPSEEK_API_KEY = '';
  process.env.OPENAI_API_KEY = '';

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true
  });

  let pool;
  try {
    const schemaPath = fileURLToPath(new URL('../database/schema.sql', import.meta.url));
    const schema = (await readFile(schemaPath, 'utf8')).replaceAll('forgeflow', 'forgeflow_test');
    await connection.query(schema);
    await connection.query('USE forgeflow_test');
    await connection.query(`
      SET FOREIGN_KEY_CHECKS = 0;
      TRUNCATE TABLE feature_versions;
      TRUNCATE TABLE project_versions;
      TRUNCATE TABLE saved_projects;
      TRUNCATE TABLE generated_ideas;
      TRUNCATE TABLE project_ideas;
      TRUNCATE TABLE users;
      SET FOREIGN_KEY_CHECKS = 1;
    `);

    const { default: app } = await import('../src/app.js');
    const { default: dbPool } = await import('../src/config/database.js');
    pool = dbPool;

    const health = await request(app).get('/api/health').expect(200);
    assert.equal(health.body.success, true);
    assert.equal(health.body.status, 'ok');

    const firstRegistration = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test-user@forgeflow.test', password: 'test-password-123' })
      .expect(201);
    const token = firstRegistration.body.data.token;
    const userId = firstRegistration.body.data.user.id;
    assert.ok(token);
    assert.ok(userId);

    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Duplicate User', email: 'test-user@forgeflow.test', password: 'test-password-123' })
      .expect(409);

    await request(app)
      .post('/api/auth/login')
      .send({ email: 'test-user@forgeflow.test', password: 'incorrect-password' })
      .expect(401);

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test-user@forgeflow.test', password: 'test-password-123' })
      .expect(200);
    const authenticatedToken = login.body.data.token;

    const currentUser = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authenticatedToken}`)
      .expect(200);
    assert.equal(currentUser.body.data.email, 'test-user@forgeflow.test');

    await request(app).get('/api/auth/me').expect(401);

    await request(app)
      .post('/api/saved-projects')
      .set('Authorization', `Bearer ${authenticatedToken}`)
      .send({ description: 'A project created for the integration test.' })
      .expect(400);

    const savedResponse = await request(app)
      .post('/api/saved-projects')
      .set('Authorization', `Bearer ${authenticatedToken}`)
      .send({
        title: 'Integration Test Project',
        description: 'A project created for the integration test.',
        category: 'Web',
        tech_stack: ['Node.js'],
        code: 'console.log("version one");',
        language: 'javascript',
        notes: 'Initial snapshot'
      })
      .expect(201);
    const project = savedResponse.body.data;
    assert.ok(project.id);

    const savedList = await request(app)
      .get('/api/saved-projects?page=1&limit=10')
      .set('Authorization', `Bearer ${authenticatedToken}`)
      .expect(200);
    assert.equal(savedList.body.data.items.length, 1);

    const snapshotResponse = await request(app)
      .post('/api/project-versions')
      .set('Authorization', `Bearer ${authenticatedToken}`)
      .send({
        project_id: project.id,
        label: 'v1',
        code: 'console.log("version one");',
        language: 'javascript',
        features: ['Authentication']
      })
      .expect(201);
    const snapshot = snapshotResponse.body.data;

    const versionList = await request(app)
      .get(`/api/project-versions?project_id=${project.id}&sort=-created_date&limit=50`)
      .set('Authorization', `Bearer ${authenticatedToken}`)
      .expect(200);
    assert.equal(versionList.body.data.length, 1);

    await request(app)
      .patch(`/api/project-versions/${project.id}/current`)
      .set('Authorization', `Bearer ${authenticatedToken}`)
      .send({ version_id: snapshot.id })
      .expect(200);

    const featureResponse = await request(app)
      .post('/api/feature-versions')
      .set('Authorization', `Bearer ${authenticatedToken}`)
      .send({ project_id: project.id, label: 'Feature plan 1', features: ['Login', 'Saved projects'] })
      .expect(201);
    const featureVersion = featureResponse.body.data;

    await request(app)
      .patch(`/api/feature-versions/${featureVersion.id}`)
      .set('Authorization', `Bearer ${authenticatedToken}`)
      .send({ label: 'Feature plan 2', features: ['Login', 'Saved projects', 'Version history'] })
      .expect(200);

    const ascendingFeatures = await request(app)
      .get(`/api/feature-versions?project_id=${project.id}&sort=created_date&limit=50`)
      .set('Authorization', `Bearer ${authenticatedToken}`)
      .expect(200);
    assert.equal(ascendingFeatures.body.data.length, 1);

    const generatedIdea = await request(app)
      .post('/api/generated-ideas')
      .set('Authorization', `Bearer ${authenticatedToken}`)
      .send({
        title: 'Test generated idea',
        description: 'An idea created by an authenticated test user.',
        category: 'Web',
        tech_stack: ['JavaScript']
      })
      .expect(201);

    const bulkGenerated = await request(app)
      .post('/api/generated-ideas/bulk')
      .set('Authorization', `Bearer ${authenticatedToken}`)
      .send({
        ideas: [
          { title: 'Bulk idea one', description: 'First idea in a transactional bulk insert.', category: 'Web' },
          { title: 'Bulk idea two', description: 'Second idea in a transactional bulk insert.', category: 'Game' }
        ]
      })
      .expect(201);
    assert.equal(bulkGenerated.body.data.length, 2);

    const generatedList = await request(app)
      .get('/api/generated-ideas')
      .set('Authorization', `Bearer ${authenticatedToken}`)
      .expect(200);
    assert.equal(generatedList.body.data.ideas.length, 3);

    const secondRegistration = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Other User', email: 'other-user@forgeflow.test', password: 'test-password-456' })
      .expect(201);
    const otherToken = secondRegistration.body.data.token;

    await request(app)
      .get(`/api/saved-projects/${project.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404);

    await request(app)
      .get(`/api/generated-ideas/${generatedIdea.body.data.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404);

    await request(app).post('/api/ai/generate').send({ prompt: 'Generate an idea' }).expect(503);
    await request(app)
      .post('/api/ai/generate')
      .set('Authorization', `Bearer ${authenticatedToken}`)
      .send({ prompt: 'Generate an idea' })
      .expect(503);

    const logout = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${authenticatedToken}`)
      .expect(200);
    assert.equal(logout.body.success, true);
  } finally {
    if (pool) await pool.end();
    await connection.end();
  }
});
