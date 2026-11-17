import SavedProjectService from '../services/savedProjectService.js';
import {successResponse} from '../utils/apiResponse.js';
import {asyncHandler} from '../utils/asyncHandler.js';
export const listSavedProjects=asyncHandler(async(req,res)=>successResponse(res,await SavedProjectService.getAllSavedProjects(req.user.id,req.query),'Saved projects retrieved.'));
export const createSavedProject=asyncHandler(async(req,res)=>successResponse(res,await SavedProjectService.createSavedProject(req.body,req.user.id),'Project saved.',201));
export const getSavedProject=asyncHandler(async(req,res)=>successResponse(res,await SavedProjectService.getSavedProjectById(req.params.id,req.user.id),'Saved project retrieved.'));
export const updateSavedProject=asyncHandler(async(req,res)=>successResponse(res,await SavedProjectService.updateSavedProject(req.params.id,req.body,req.user.id),'Saved project updated.'));
export const deleteSavedProject=asyncHandler(async(req,res)=>successResponse(res,await SavedProjectService.deleteSavedProject(req.params.id,req.user.id),'Saved project deleted.'));
