import { body } from 'express-validator';

export const generateWithAIValidator = [
  body('prompt')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 12000 })
    .withMessage('Prompt must be between 1 and 12,000 characters.'),
  body('response_json_schema')
    .optional()
    .isObject()
    .withMessage('response_json_schema must be a JSON object.')
];
