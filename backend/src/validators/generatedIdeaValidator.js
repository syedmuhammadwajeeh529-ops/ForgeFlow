import { body } from 'express-validator';
export const createGeneratedIdeaValidator = [
 body('title').trim().isLength({min:2,max:180}).withMessage('Title must be 2–180 characters.'),
 body('description').trim().isLength({min:10,max:10000}).withMessage('Description must be 10–10,000 characters.'),
 body('category').trim().notEmpty().withMessage('Category is required.'),
 body('difficulty').optional({nullable:true}).isIn(['Beginner','Intermediate','Advanced']),
 body('tech_stack').optional().isArray(),
 body('tags').optional().isArray(),
 body('prompt').optional().isString().isLength({max:5000})
];
