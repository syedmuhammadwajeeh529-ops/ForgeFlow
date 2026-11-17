import SavedProject from '../models/SavedProject.js';
import { AppError } from '../utils/AppError.js';

const aliases = {
  idea_id: 'ideaId',
  ideaId: 'ideaId',
  title: 'title',
  description: 'description',
  difficulty: 'difficulty',
  category: 'category',
  tech_stack: 'techStack',
  techStack: 'techStack',
  code: 'code',
  language: 'language',
  notes: 'notes',
  current_version: 'currentVersion',
  currentVersion: 'currentVersion',
  status: 'status'
};

const mapInput = (body = {}) => {
  const mapped = {};
  for (const [key, value] of Object.entries(body)) {
    const target = aliases[key];
    if (target) mapped[target] = value;
  }
  return mapped;
};

class SavedProjectService {
  async getAllSavedProjects(userId, filters = {}) {
    const page = Math.max(1, Number.parseInt(filters.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(filters.limit, 10) || 50));
    const items = await SavedProject.findAll({
      createdById: userId,
      status: filters.status,
      category: filters.category,
      search: typeof filters.search === 'string' ? filters.search.trim() : undefined,
      limit,
      offset: (page - 1) * limit
    });
    return { items, page, limit, returned: items.length };
  }

  async getSavedProjectById(id, userId) {
    const project = await SavedProject.findById(id, userId);
    if (!project) throw new AppError('Saved project not found.', 404);
    return project;
  }

  async createSavedProject(data, userId) {
    return SavedProject.create({ ...mapInput(data), createdById: userId });
  }

  async updateSavedProject(id, data, userId) {
    const project = await SavedProject.update(id, userId, mapInput(data));
    if (!project) throw new AppError('Saved project not found.', 404);
    return project;
  }

  async deleteSavedProject(id, userId) {
    const deleted = await SavedProject.delete(id, userId);
    if (!deleted) throw new AppError('Saved project not found.', 404);
    return { id, deleted: true };
  }
}

export default new SavedProjectService();
