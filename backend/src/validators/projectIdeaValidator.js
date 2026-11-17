import { body } from 'express-validator';
const categories = ['Web','Mobile','AI','ML','CLI','Game','API','Data','DevOps','Other'];
const difficulties = ['Beginner','Intermediate','Advanced'];
export const createProjectIdeaValidator = [
 body('title').trim().isLength({min:2,max:180}).withMessage('Title must be 2–180 characters.'),
 body('description').trim().isLength({min:10,max:10000}).withMessage('Description must be 10–10,000 characters.'),
 body('difficulty').isIn(difficulties).withMessage('Choose a valid difficulty.'),
 body('category').isIn(categories).withMessage('Choose a valid category.'),
 body('tech_stack').optional().isArray(),
 body('tags').optional().isArray()
];
export const updateProjectIdeaValidator = [
 body('title').optional().trim().isLength({min:2,max:180}),
 body('description').optional().trim().isLength({min:10,max:10000}),
 body('difficulty').optional().isIn(difficulties),
 body('category').optional().isIn(categories),
 body('tech_stack').optional().isArray(),
 body('tags').optional().isArray()
];
