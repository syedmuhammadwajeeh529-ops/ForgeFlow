
import { errorResponse } from '../utils/apiResponse.js';

export function notFound(req, res) {
  return errorResponse(
    res,
    `Route not found: ${req.method} ${req.originalUrl}`,
    404
  );
}
