
import GeneratedIdea from '../models/GeneratedIdea.js';

class GeneratedIdeaService {
  async getAllGeneratedIdeas({
    userId,
    category,
    difficulty,
    search,
    page = 1,
    limit = 20
  }) {
    const parsedPage = Math.max(1, Number.parseInt(page, 10) || 1);
    const parsedLimit = Math.min(
      100,
      Math.max(1, Number.parseInt(limit, 10) || 20)
    );

    const offset = (parsedPage - 1) * parsedLimit;

    const ideas = await GeneratedIdea.findAll({
      createdById: userId,
      category,
      difficulty,
      search,
      limit: parsedLimit,
      offset
    });

    return {
      ideas,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        returned: ideas.length
      }
    };
  }

  async getGeneratedIdeaById(id, userId) {
    const idea = await GeneratedIdea.findById(id, userId);

    if (!idea) {
      const error = new Error('Generated idea not found.');
      error.statusCode = 404;
      throw error;
    }

    return idea;
  }

  async createGeneratedIdea(data, userId) {
    if (!userId) {
      const error = new Error('Authentication is required.');
      error.statusCode = 401;
      throw error;
    }

    return GeneratedIdea.create({
      title: data.title,
      description: data.description,
      difficulty: data.difficulty ?? null,
      category: data.category,
      techStack: data.techStack ?? [],
      tags: data.tags ?? [],
      prompt: data.prompt ?? null,
      createdById: userId
    });
  }

  async deleteGeneratedIdea(id, userId) {
    const idea = await GeneratedIdea.findById(id, userId);

    if (!idea) {
      const error = new Error('Generated idea not found.');
      error.statusCode = 404;
      throw error;
    }

    await GeneratedIdea.delete(id, userId);

    return {
      id,
      deleted: true
    };
  }
}

export default new GeneratedIdeaService();
