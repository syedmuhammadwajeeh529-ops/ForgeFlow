import GeneratedIdea from '../models/GeneratedIdea.js';
import { AppError } from '../utils/AppError.js';

class GeneratedIdeaService {
  async getAllGeneratedIdeas({ userId, category, difficulty, search, page = 1, limit = 20 }) {
    const parsedPage = Math.max(1, Number.parseInt(page, 10) || 1);
    const parsedLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 20));
    const ideas = await GeneratedIdea.findAll({
      createdById: userId,
      category,
      difficulty,
      search: typeof search === 'string' ? search.trim() : undefined,
      limit: parsedLimit,
      offset: (parsedPage - 1) * parsedLimit
    });
    return {
      ideas,
      pagination: { page: parsedPage, limit: parsedLimit, returned: ideas.length }
    };
  }

  async getGeneratedIdeaById(id, userId) {
    const idea = await GeneratedIdea.findById(id, userId);
    if (!idea) throw new AppError('Generated idea not found.', 404);
    return idea;
  }

  async createGeneratedIdea(data, userId) {
    return GeneratedIdea.create({
      title: data.title,
      description: data.description,
      difficulty: data.difficulty ?? null,
      category: data.category,
      techStack: data.tech_stack ?? data.techStack ?? [],
      tags: data.tags ?? [],
      prompt: data.prompt ?? null,
      createdById: userId
    });
  }

  async createGeneratedIdeas(ideas, userId) {
    return GeneratedIdea.createMany(ideas.map((idea) => ({
      title: idea.title,
      description: idea.description,
      difficulty: idea.difficulty ?? null,
      category: idea.category,
      techStack: idea.tech_stack ?? idea.techStack ?? [],
      tags: idea.tags ?? [],
      prompt: idea.prompt ?? null,
      createdById: userId
    })));
  }

  async deleteGeneratedIdea(id, userId) {
    const deleted = await GeneratedIdea.delete(id, userId);
    if (!deleted) throw new AppError('Generated idea not found.', 404);
    return { id, deleted: true };
  }
}

export default new GeneratedIdeaService();
