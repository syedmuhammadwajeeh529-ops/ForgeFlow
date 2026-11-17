import { body } from 'express-validator';

const ideaFields = (prefix = '') => [
  body(`${prefix}title`).trim().isLength({ min: 2, max: 180 }).withMessage('Title must be 2–180 characters.'),
  body(`${prefix}description`).trim().isLength({ min: 10, max: 10000 }).withMessage('Description must be 10–10,000 characters.'),
  body(`${prefix}category`).trim().notEmpty().isLength({ max: 100 }).withMessage('Category is required.'),
  body(`${prefix}difficulty`).optional({ nullable: true }).isIn(['Beginner', 'Intermediate', 'Advanced']),
  body(`${prefix}tech_stack`).optional().isArray({ max: 100 }),
  body(`${prefix}tags`).optional().isArray({ max: 100 }),
  body(`${prefix}prompt`).optional().isString().isLength({ max: 5000 })
];

export const createGeneratedIdeaValidator = ideaFields();

export const createGeneratedIdeasValidator = [
  body('ideas').isArray({ min: 1, max: 20 }).withMessage('Provide between 1 and 20 ideas.'),
  ...ideaFields('ideas.*.')
];
