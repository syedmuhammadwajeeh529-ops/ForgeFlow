import ProjectVersion from '../models/ProjectVersion.js';
import FeatureVersion from '../models/FeatureVersion.js';
import SavedProject from '../models/SavedProject.js';
import { successResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

const toArray = (value) => {
  if (Array.isArray(value)) return value.map((item) => item.trim()).filter(Boolean);
  if (typeof value === 'string') return value.split('\n').map((item) => item.trim()).filter(Boolean);
  return [];
};

async function assertOwnedProject(projectId, userId) {
  if (!projectId) throw new AppError('project_id is required.', 400);
  const project = await SavedProject.findById(projectId, userId);
  if (!project) throw new AppError('Saved project not found.', 404);
  return project;
}

export const listProjectVersions = asyncHandler(async (req, res) => {
  await assertOwnedProject(req.query.project_id, req.user.id);
  const versions = await ProjectVersion.findAll(req.query.project_id, req.user.id);
  return successResponse(res, versions, 'Project versions retrieved.');
});

export const createProjectVersion = asyncHandler(async (req, res) => {
  const project = await assertOwnedProject(req.body.project_id, req.user.id);
  const version = await ProjectVersion.create({
    projectId: project.id,
    label: req.body.label,
    code: req.body.code ?? project.code ?? '',
    language: req.body.language ?? project.language ?? 'javascript',
    notes: req.body.notes ?? project.notes ?? '',
    features: toArray(req.body.features),
    createdById: req.user.id
  });
  await SavedProject.update(project.id, req.user.id, { currentVersion: version.label });
  return successResponse(res, version, 'Snapshot created.', 201);
});

export const deleteProjectVersion = asyncHandler(async (req, res) => {
  const deleted = await ProjectVersion.delete(req.params.id, req.user.id);
  if (!deleted) throw new AppError('Version not found.', 404);
  return successResponse(res, { deleted: true }, 'Project version deleted.');
});

export const listFeatureVersions = asyncHandler(async (req, res) => {
  await assertOwnedProject(req.query.project_id, req.user.id);
  const versions = await FeatureVersion.findAll(req.query.project_id, req.user.id);
  return successResponse(res, versions, 'Feature versions retrieved.');
});

export const createFeatureVersion = asyncHandler(async (req, res) => {
  const project = await assertOwnedProject(req.body.project_id, req.user.id);
  const version = await FeatureVersion.create({
    projectId: project.id,
    label: req.body.label,
    features: toArray(req.body.features),
    notes: req.body.notes ?? '',
    createdById: req.user.id
  });
  return successResponse(res, version, 'Feature version created.', 201);
});

export const updateFeatureVersion = asyncHandler(async (req, res) => {
  const patch = {};
  if (Object.hasOwn(req.body, 'label')) patch.label = req.body.label;
  if (Object.hasOwn(req.body, 'features')) patch.features = toArray(req.body.features);
  if (Object.hasOwn(req.body, 'notes')) patch.notes = req.body.notes;
  const version = await FeatureVersion.update(req.params.id, req.user.id, patch);
  if (!version) throw new AppError('Feature version not found.', 404);
  return successResponse(res, version, 'Feature version updated.');
});

export const deleteFeatureVersion = asyncHandler(async (req, res) => {
  const deleted = await FeatureVersion.delete(req.params.id, req.user.id);
  if (!deleted) throw new AppError('Feature version not found.', 404);
  return successResponse(res, { deleted: true }, 'Feature version deleted.');
});

export const switchProjectVersion = asyncHandler(async (req, res) => {
  const project = await assertOwnedProject(req.params.projectId, req.user.id);
  const version = await ProjectVersion.findById(req.body.version_id, req.user.id);
  if (!version || version.project_id !== project.id) {
    throw new AppError('Project version not found.', 404);
  }
  const updated = await SavedProject.update(project.id, req.user.id, {
    code: version.code ?? '',
    language: version.language ?? 'javascript',
    notes: version.notes ?? '',
    currentVersion: version.label
  });
  return successResponse(res, updated, 'Project version restored.');
});
