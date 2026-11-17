
import AuthService from '../services/authService.js';
import { successResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const result = await AuthService.register({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  });

  return successResponse(
    res,
    result,
    'Account created successfully.',
    201
  );
});

export const login = asyncHandler(async (req, res) => {
  const result = await AuthService.login({
    email: req.body.email,
    password: req.body.password
  });

  return successResponse(
    res,
    result,
    'Logged in successfully.'
  );
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await AuthService.getCurrentUser(req.user.id);

  return successResponse(
    res,
    user,
    'User profile retrieved successfully.'
  );
});

export const logout = asyncHandler(async (req, res) => {
  return successResponse(
    res,
    null,
    'Logged out successfully.'
  );
});
