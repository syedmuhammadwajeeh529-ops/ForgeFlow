import test from 'node:test';
import assert from 'node:assert/strict';
import { AppError } from '../src/utils/AppError.js';

test('AppError preserves message and HTTP status', () => {
  const error = new AppError('Not found', 404);
  assert.equal(error.message, 'Not found');
  assert.equal(error.statusCode, 404);
  assert.equal(error.isOperational, true);
});

test('AppError accepts optional details', () => {
  const details = [{ field: 'email', message: 'Invalid email' }];
  const error = new AppError('Validation failed', 422, details);
  assert.equal(error.statusCode, 422);
  assert.deepEqual(error.details, details);
});
