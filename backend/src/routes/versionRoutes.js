import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  listVersionsValidator,
  createProjectVersionValidator,
  createFeatureVersionValidator,
  updateFeatureVersionValidator,
  switchProjectVersionValidator
} from '../validators/versionValidator.js';
import {
  listProjectVersions,
  createProjectVersion,
  deleteProjectVersion,
  listFeatureVersions,
  createFeatureVersion,
  updateFeatureVersion,
  deleteFeatureVersion,
  switchProjectVersion
} from '../controllers/versionController.js';

const projectVersions = Router();
projectVersions.use(authenticate);
projectVersions.get('/', listVersionsValidator, validateRequest, listProjectVersions);
projectVersions.post('/', createProjectVersionValidator, validateRequest, createProjectVersion);
projectVersions.patch('/:projectId/current', switchProjectVersionValidator, validateRequest, switchProjectVersion);
projectVersions.delete('/:id', deleteProjectVersion);

const featureVersions = Router();
featureVersions.use(authenticate);
featureVersions.get('/', listVersionsValidator, validateRequest, listFeatureVersions);
featureVersions.post('/', createFeatureVersionValidator, validateRequest, createFeatureVersion);
featureVersions.patch('/:id', updateFeatureVersionValidator, validateRequest, updateFeatureVersion);
featureVersions.delete('/:id', deleteFeatureVersion);

export default { projectVersions, featureVersions };
