
import { errorResponse } from '../utils/apiResponse.js';

export function errorHandler(err, req, res, next) {
  console.error('API Error:', {
    message: err.message,
    method: req.method,
    url: req.originalUrl,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || err.status || 500;

  const message =
    statusCode >= 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error.'
      : err.message || 'Something went wrong.';

  return errorResponse(
    res,
    message,
    statusCode,
    err.errors || null
  );
}
