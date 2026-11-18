import { body } from 'express-validator';

const validHttpUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
};

export const searchWebValidator = [
  body('query').isString().trim().isLength({ min: 2, max: 500 })
    .withMessage('Search query must be between 2 and 500 characters.'),
];

export const fetchUrlsValidator = [
  body('urls').isArray({ min: 1, max: 10 })
    .withMessage('Provide between 1 and 10 URLs.'),
  body('urls.*').isString().custom(validHttpUrl)
    .withMessage('Each URL must be a valid HTTP or HTTPS URL.'),
  body('purpose').optional().isString().trim().isLength({ max: 2000 }),
  body('format').optional().isIn(['markdown', 'html', 'json'])
    .withMessage('Format must be markdown, html or json.')
];

export const runBrowserAgentValidator = [
  body('url').isString().custom(validHttpUrl)
    .withMessage('A valid HTTP or HTTPS URL is required.'),
  body('goal').isString().trim().isLength({ min: 1, max: 12000 })
    .withMessage('Goal must be between 1 and 12,000 characters.'),
  body('output_schema').optional().isObject()
    .withMessage('output_schema must be a JSON object.')
];
