import ProjectIdea from '../models/ProjectIdea.js';
import { AppError } from '../utils/AppError.js';

class ProjectIdeaService {
  async getAllIdeas({ category, difficulty, search, page = 1, limit = 50 } = {}) {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 50));
    const items = await ProjectIdea.findAll({ category, difficulty, search, limit: safeLimit, offset: (safePage - 1) * safeLimit });
    return { items, page: safePage, limit: safeLimit };
  }
  async getIdeaById(id) {
    const idea = await ProjectIdea.findById(id);
    if (!idea) throw new AppError('Project idea not found.', 404);
    return idea;
  }
  async createIdea(data, userId) {
    return ProjectIdea.create({ title: data.title, description: data.description, difficulty: data.difficulty, category: data.category, techStack: data.tech_stack || data.techStack || [], isCurated: data.is_curated ?? data.isCurated ?? false, tags: data.tags || [], createdById: userId });
  }
  async updateIdea(id, data) {
    const patch = {};
    if (Object.hasOwn(data, 'title')) patch.title = data.title;
    if (Object.hasOwn(data, 'description')) patch.description = data.description;
    if (Object.hasOwn(data, 'difficulty')) patch.difficulty = data.difficulty;
    if (Object.hasOwn(data, 'category')) patch.category = data.category;
    if (Object.hasOwn(data, 'tech_stack')) patch.techStack = data.tech_stack;
    if (Object.hasOwn(data, 'is_curated')) patch.isCurated = data.is_curated;
    if (Object.hasOwn(data, 'tags')) patch.tags = data.tags;
    const idea = await ProjectIdea.update(id, patch);
    if (!idea) throw new AppError('Project idea not found.', 404);
    return idea;
  }
  async deleteIdea(id) {
    const deleted = await ProjectIdea.delete(id);
    if (!deleted) throw new AppError('Project idea not found.', 404);
    return { id, deleted: true };
  }
}
export default new ProjectIdeaService();
