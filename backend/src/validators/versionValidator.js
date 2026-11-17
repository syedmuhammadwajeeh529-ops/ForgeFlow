import { body, query } from 'express-validator';

const featureValue = (field) => body(field).optional().custom((value) => {
  if (Array.isArray(value)) {
    if (value.length > 200 || value.some((item) => typeof item !== 'string' || item.length > 500)) {
      throw new Error('Features must be an array of up to 200 strings, each no longer than 500 characters.');
    }
    return true;
  }
  if (typeof value === 'string' && value.length <= 20000) return true;
  throw new Error('Features must be a string or an array of strings.');
});

export const listVersionsValidator = [
  query('project_id').isUUID().withMessage('A valid project_id is required.')
];

export const createProjectVersionValidator = [
  body('project_id').isUUID().withMessage('A valid project_id is required.'),
  body('label').trim().isLength({ min: 1, max: 100 }).withMessage('Label must be 1–100 characters.'),
  body('code').optional().isString().isLength({ max: 1000000 }),
  body('language').optional().isString().isLength({ max: 100 }),
  body('notes').optional().isString().isLength({ max: 20000 }),
  featureValue('features')
];

export const createFeatureVersionValidator = [
  body('project_id').isUUID().withMessage('A valid project_id is required.'),
  body('label').trim().isLength({ min: 1, max: 100 }).withMessage('Label must be 1–100 characters.'),
  featureValue('features'),
  body('notes').optional().isString().isLength({ max: 20000 })
];

export const updateFeatureVersionValidator = [
  body('label').optional().trim().isLength({ min: 1, max: 100 }),
  featureValue('features'),
  body('notes').optional().isString().isLength({ max: 20000 }),
  body().custom((value) => {
    if (!['label', 'features', 'notes'].some((key) => Object.hasOwn(value || {}, key))) {
      throw new Error('Provide at least one field to update.');
    }
    return true;
  })
];

export const switchProjectVersionValidator = [
  body('version_id').isUUID().withMessage('A valid version_id is required.')
];
