
import { body } from 'express-validator';

const validateTitle = (field) =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage('Title is required.')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters.');

const validateDescription = (field) =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage('Description is required.')
    .isLength({ max: 10000 })
    .withMessage('Description cannot exceed 10,000 characters.');

const validateDifficulty = (field) =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage('Difficulty is required.')
    .isLength({ max: 50 })
    .withMessage('Difficulty cannot exceed 50 characters.');

const validateCategory = (field) =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage('Category is required.')
    .isLength({ max: 100 })
    .withMessage('Category cannot exceed 100 characters.');

const validateStringArray = (field, label) =>
  body(field)
    .optional()
    .isArray({ max: 50 })
    .withMessage(`${label} must be an array containing no more than 50 items.`)
    .custom((items) =>
      items.every(
        (item) => typeof item === 'string' && item.trim().length > 0
      )
    )
    .withMessage(`${label} must contain non-empty text values.`);

export const createProjectIdeaValidator = [
  validateTitle('title'),
  validateDescription('description'),
  validateDifficulty('difficulty'),
  validateCategory('category'),

  validateStringArray('techStack', 'Tech stack'),
  validateStringArray('tags', 'Tags'),

  body('isCurated')
    .optional()
    .isBoolean()
    .withMessage('isCurated must be true or false.')
];

export const updateProjectIdeaValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty.')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters.'),

  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty.')
    .isLength({ max: 10000 })
    .withMessage('Description cannot exceed 10,000 characters.'),

  body('difficulty')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Difficulty cannot be empty.')
    .isLength({ max: 50 })
    .withMessage('Difficulty cannot exceed 50 characters.'),

  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty.')
    .isLength({ max: 100 })
    .withMessage('Category cannot exceed 100 characters.'),

  validateStringArray('techStack', 'Tech stack'),
  validateStringArray('tags', 'Tags'),

  body('isCurated')
    .optional()
    .isBoolean()
    .withMessage('isCurated must be true or false.')
];
