
import { validationResult } from 'express-validator';
import { errorResponse } from '../utils/apiResponse.js';

export function validateRequest(req, res, next) {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const errors = result.array().map((error) => ({
      field: error.path,
      message: error.msg,
      location: error.location
    }));

    return errorResponse(
      res,
      'Validation failed. Please check your input.',
      400,
      errors
    );
  }

  next();
}
