import ProjectVersion from '../models/ProjectVersion.js';
import FeatureVersion from '../models/FeatureVersion.js';
import SavedProject from '../models/SavedProject.js';
import { successResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
const toArray=(value)=>Array.isArray(value)?value:typeof value==='string'?value.split('\n').filter(Boolean):[];
async function assertOwnedProject(projectId,userId){if(!projectId)throw new AppError('project_id is required.',400);const project=await SavedProject.findById(projectId,userId);if(!project)throw new AppError('Saved project not found.',404);return project;}
export const listProjectVersions=asyncHandler(async(req,res)=>{await assertOwnedProject(req.query.project_id,req.user.id);return successResponse(res,await ProjectVersion.findAll(req.query.project_id,req.user.id));});
export const createProjectVersion=asyncHandler(async(req,res)=>{await assertOwnedProject(req.body.project_id,req.user.id);const version=await ProjectVersion.create({projectId:req.body.project_id,label:req.body.label,code:req.body.code||'',language:req.body.language||'javascript',notes:req.body.notes||'',features:toArray(req.body.features),createdById:req.user.id});return successResponse(res,version,'Snapshot created.',201);});
export const deleteProjectVersion=asyncHandler(async(req,res)=>{const ok=await ProjectVersion.delete(req.params.id,req.user.id);if(!ok)throw new AppError('Version not found.',404);return successResponse(res,{deleted:true});});
export const listFeatureVersions=asyncHandler(async(req,res)=>{await assertOwnedProject(req.query.project_id,req.user.id);return successResponse(res,await FeatureVersion.findAll(req.query.project_id,req.user.id));});
export const createFeatureVersion=asyncHandler(async(req,res)=>{await assertOwnedProject(req.body.project_id,req.user.id);const version=await FeatureVersion.create({projectId:req.body.project_id,label:req.body.label,features:toArray(req.body.features),notes:req.body.notes||'',createdById:req.user.id});return successResponse(res,version,'Feature version created.',201);});
export const updateFeatureVersion=asyncHandler(async(req,res)=>{const patch={};if(Object.hasOwn(req.body,'label'))patch.label=req.body.label;if(Object.hasOwn(req.body,'features'))patch.features=toArray(req.body.features);if(Object.hasOwn(req.body,'notes'))patch.notes=req.body.notes;const v=await FeatureVersion.update(req.params.id,req.user.id,patch);if(!v)throw new AppError('Feature version not found.',404);return successResponse(res,v,'Feature version updated.');});
export const deleteFeatureVersion=asyncHandler(async(req,res)=>{const ok=await FeatureVersion.delete(req.params.id,req.user.id);if(!ok)throw new AppError('Feature version not found.',404);return successResponse(res,{deleted:true});});
export const switchProjectVersion=asyncHandler(async(req,res)=>{const project=await SavedProject.update(req.params.projectId,req.user.id,{currentVersion:req.body.current_version});if(!project)throw new AppError('Saved project not found.',404);return successResponse(res,project,'Project version switched.');});
