import SavedProject from '../models/SavedProject.js';
import { AppError } from '../utils/AppError.js';
const fields={idea_id:'ideaId',title:'title',description:'description',difficulty:'difficulty',category:'category',tech_stack:'techStack',code:'code',language:'language',notes:'notes',current_version:'currentVersion',status:'status'};
const mapInput=(body)=>Object.fromEntries(Object.entries(fields).filter(([key])=>Object.hasOwn(body,key)).map(([key,value])=>[value,body[key]]));
class SavedProjectService{
 async getAllSavedProjects(userId,filters={}){return SavedProject.findAll({createdById:userId,status:filters.status,category:filters.category,search:filters.search,limit:filters.limit})}
 async getSavedProjectById(id,userId){const project=await SavedProject.findById(id,userId);if(!project)throw new AppError('Saved project not found.',404);return project}
 async createSavedProject(data,userId){return SavedProject.create({...mapInput(data),createdById:userId})}
 async updateSavedProject(id,data,userId){const project=await SavedProject.update(id,userId,mapInput(data));if(!project)throw new AppError('Saved project not found.',404);return project}
 async deleteSavedProject(id,userId){const deleted=await SavedProject.delete(id,userId);if(!deleted)throw new AppError('Saved project not found.',404);return{id,deleted:true}}
}
export default new SavedProjectService();
