import { successResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import TinyFishService from '../services/TinyFishService.js';

export const searchWeb = asyncHandler(async (req, res) =>
  successResponse(res, await TinyFishService.searchWeb(req.body), 'Web search completed.')
);

export const fetchUrls = asyncHandler(async (req, res) =>
  successResponse(res, await TinyFishService.fetchUrls(req.body), 'Web pages fetched.')
);

export const runBrowserAgent = asyncHandler(async (req, res) =>
  successResponse(res, await TinyFishService.runBrowserAgent(req.body), 'Browser automation completed.')
);
