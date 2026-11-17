import { body } from 'express-validator';

const categories = ['Web', 'Mobile', 'AI', 'ML', 'CLI', 'Game', 'API', 'Data', 'DevOps', 'Other'];
const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

const techStackValidator = (field) => body(field).optional().isArray({ max: 100 });
const tagsValidator = body('tags').optional().isArray({ max: 100 });

export const createProjectIdeaValidator = [
  body('title').trim().isLength({ min: 2, max: 180 }).withMessage('Title must be 2–180 characters.'),
  body('description').trim().isLength({ min: 10, max: 10000 }).withMessage('Description must be 10–10,000 characters.'),
  body('difficulty').isIn(difficulties).withMessage('Choose a valid difficulty.'),
  body('category').isIn(categories).withMessage('Choose a valid category.'),
  techStackValidator('tech_stack'),
  techStackValidator('techStack'),
  tagsValidator
];

export const updateProjectIdeaValidator = [
  body('title').optional().trim().isLength({ min: 2, max: 180 }),
  body('description').optional().trim().isLength({ min: 10, max: 10000 }),
  body('difficulty').optional().isIn(difficulties),
  body('category').optional().isIn(categories),
  techStackValidator('tech_stack'),
  techStackValidator('techStack'),
  body('is_curated').optional().isBoolean(),
  body('isCurated').optional().isBoolean(),
  tagsValidator,
  body().custom((value) => {
    const fields = ['title', 'description', 'difficulty', 'category', 'tech_stack', 'techStack', 'is_curated', 'isCurated', 'tags'];
    if (!fields.some((field) => Object.hasOwn(value || {}, field))) {
      throw new Error('Provide at least one field to update.');
    }
    return true;
  })
];
