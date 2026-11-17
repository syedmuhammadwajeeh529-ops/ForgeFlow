
import { errorResponse } from '../utils/apiResponse.js';

export function authorizeRole(...allowedRoles) {
  return function (req, res, next) {
    if (!req.user) {
      return errorResponse(
        res,
        'Authentication required.',
        401
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        'You do not have permission to access this resource.',
        403
      );
    }

    next();
  };
}
