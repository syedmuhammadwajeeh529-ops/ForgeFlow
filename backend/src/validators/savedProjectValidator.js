import { body } from 'express-validator';

const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
const statuses = ['saved', 'in_progress', 'completed'];

const sharedFields = [
  body('title').optional().trim().isLength({ min: 2, max: 255 }).withMessage('Title must be 2–255 characters.'),
  body('description').optional().trim().isLength({ min: 1, max: 20000 }).withMessage('Description must be 1–20,000 characters.'),
  body('difficulty').optional({ nullable: true }).isIn(difficulties).withMessage('Choose a valid difficulty.'),
  body('category').optional({ nullable: true }).isString().isLength({ max: 100 }),
  body('tech_stack').optional().isArray({ max: 100 }),
  body('techStack').optional().isArray({ max: 100 }),
  body('idea_id').optional({ nullable: true }).isString().isLength({ max: 36 }),
  body('ideaId').optional({ nullable: true }).isString().isLength({ max: 36 }),
  body('code').optional({ nullable: true }).isString().isLength({ max: 1000000 }),
  body('language').optional({ nullable: true }).isString().isLength({ max: 100 }),
  body('notes').optional({ nullable: true }).isString().isLength({ max: 20000 }),
  body('current_version').optional().isString().isLength({ max: 100 }),
  body('currentVersion').optional().isString().isLength({ max: 100 }),
  body('status').optional().isIn(statuses).withMessage('Choose a valid project status.')
];

export const createSavedProjectValidator = [
  body('title').trim().isLength({ min: 2, max: 255 }).withMessage('Title must be 2–255 characters.'),
  body('description').trim().isLength({ min: 1, max: 20000 }).withMessage('Description is required.'),
  ...sharedFields.slice(2)
];

export const updateSavedProjectValidator = [
  ...sharedFields,
  body().custom((value) => {
    const editable = ['idea_id', 'ideaId', 'title', 'description', 'difficulty', 'category', 'tech_stack', 'techStack', 'code', 'language', 'notes', 'current_version', 'currentVersion', 'status'];
    if (!editable.some((key) => Object.hasOwn(value || {}, key))) {
      throw new Error('Provide at least one field to update.');
    }
    return true;
  })
];
