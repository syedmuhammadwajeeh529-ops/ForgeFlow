import SavedProject from '../models/SavedProject.js';
import { successResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
const mapInput = (body) => ({ ideaId: body.idea_id, title: body.title, description: body.description, difficulty: body.difficulty, category: body.category, techStack: body.tech_stack || [], code: body.code, language: body.language, notes: body.notes, currentVersion: body.current_version, status: body.status });
export const listSavedProjects = asyncHandler(async (req,res) => successResponse(res, await SavedProject.findAll({createdById:req.user.id,status:req.query.status,category:req.query.category,search:req.query.search,limit:req.query.limit}), 'Saved projects retrieved.'));
export const createSavedProject = asyncHandler(async (req,res) => {
 const project=await SavedProject.create({...mapInput(req.body),createdById:req.user.id});
 return successResponse(res,project,'Project saved.',201);
});
export const getSavedProject = asyncHandler(async(req,res)=>{
 const project=await SavedProject.findById(req.params.id,req.user.id);
 if(!project) throw new AppError('Saved project not found.',404);
 return successResponse(res,project,'Saved project retrieved.');
});
export const updateSavedProject = asyncHandler(async(req,res)=>{
 const project=await SavedProject.update(req.params.id,req.user.id,mapInput(req.body));
 if(!project) throw new AppError('Saved project not found.',404);
 return successResponse(res,project,'Saved project updated.');
});
export const deleteSavedProject = asyncHandler(async(req,res)=>{
 const deleted=await SavedProject.delete(req.params.id,req.user.id);
 if(!deleted) throw new AppError('Saved project not found.',404);
 return successResponse(res,{id:req.params.id,deleted:true},'Saved project deleted.');
});
