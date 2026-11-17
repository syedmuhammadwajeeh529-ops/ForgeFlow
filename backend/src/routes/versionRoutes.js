import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { listProjectVersions,createProjectVersion,deleteProjectVersion,listFeatureVersions,createFeatureVersion,updateFeatureVersion,deleteFeatureVersion,switchProjectVersion } from '../controllers/versionController.js';
const projectVersions=Router();projectVersions.use(authenticate);projectVersions.get('/',listProjectVersions);projectVersions.post('/',createProjectVersion);projectVersions.delete('/:id',deleteProjectVersion);
const featureVersions=Router();featureVersions.use(authenticate);featureVersions.get('/',listFeatureVersions);featureVersions.post('/',createFeatureVersion);featureVersions.patch('/:id',updateFeatureVersion);featureVersions.delete('/:id',deleteFeatureVersion);
export default {projectVersions,featureVersions};
