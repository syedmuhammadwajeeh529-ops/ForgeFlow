import ProjectIdea from '../models/ProjectIdea.js';
import { AppError } from '../utils/AppError.js';

class ProjectIdeaService {
  async getAllIdeas({ category, difficulty, search, page = 1, limit = 50 } = {}) {
    const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 50));
    const items = await ProjectIdea.findAll({
      category,
      difficulty,
      search: typeof search === 'string' ? search.trim() : undefined,
      limit: safeLimit,
      offset: (safePage - 1) * safeLimit
    });
    return { items, page: safePage, limit: safeLimit, returned: items.length };
  }

  async getIdeaById(id) {
    const idea = await ProjectIdea.findById(id);
    if (!idea) throw new AppError('Project idea not found.', 404);
    return idea;
  }

  async createIdea(data, userId) {
    return ProjectIdea.create({
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      category: data.category,
      techStack: data.tech_stack ?? data.techStack ?? [],
      isCurated: data.is_curated ?? data.isCurated ?? false,
      tags: data.tags ?? [],
      createdById: userId
    });
  }

  async updateIdea(id, data) {
    const patch = {};
    const aliases = {
      title: 'title',
      description: 'description',
      difficulty: 'difficulty',
      category: 'category',
      tech_stack: 'techStack',
      techStack: 'techStack',
      is_curated: 'isCurated',
      isCurated: 'isCurated',
      tags: 'tags'
    };
    for (const [key, target] of Object.entries(aliases)) {
      if (Object.hasOwn(data, key)) patch[target] = data[key];
    }
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
