
import { body } from 'express-validator';

const validateStringArray = (field, label) =>
  body(field)
    .optional()
    .isArray({ max: 50 })
    .withMessage(`${label} must be an array containing no more than 50 items.`)
    .custom((items) =>
      items.every(
        (item) =>
          typeof item === 'string' &&
          item.trim().length > 0 &&
          item.length <= 100
      )
    )
    .withMessage(`${label} must contain non-empty text values of 100 characters or fewer.`);

export const createGeneratedIdeaValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required.')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters.'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required.')
    .isLength({ max: 10000 })
    .withMessage('Description cannot exceed 10,000 characters.'),

  body('difficulty')
    .optional({ nullable: true })
    .isString()
    .withMessage('Difficulty must be text.')
    .isLength({ max: 50 })
    .withMessage('Difficulty cannot exceed 50 characters.'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required.')
    .isLength({ max: 100 })
    .withMessage('Category cannot exceed 100 characters.'),

  validateStringArray('techStack', 'Tech stack'),

  validateStringArray('tags', 'Tags'),

  body('prompt')
    .optional({ nullable: true })
    .isString()
    .withMessage('Prompt must be text.')
    .isLength({ max: 10000 })
    .withMessage('Prompt cannot exceed 10,000 characters.')
];
