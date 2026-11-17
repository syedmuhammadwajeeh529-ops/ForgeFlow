export const difficultyColors = {
  Beginner: 'bg-green-100 text-green-700 border-green-200',
  Intermediate: 'bg-orange-100 text-orange-700 border-orange-200',
  Advanced: 'bg-red-100 text-red-700 border-red-200',
};

export const categoryColors = {
  Web: 'bg-blue-100 text-blue-700',
  Mobile: 'bg-purple-100 text-purple-700',
  AI: 'bg-pink-100 text-pink-700',
  ML: 'bg-indigo-100 text-indigo-700',
  CLI: 'bg-cyan-100 text-cyan-700',
  Game: 'bg-yellow-100 text-yellow-700',
  API: 'bg-orange-100 text-orange-700',
  Data: 'bg-green-100 text-green-700',
  DevOps: 'bg-red-100 text-red-700',
  Other: 'bg-purple-100 text-purple-700',
};

// Categories that get a faithful "finished product" visual preview
export const FINAL_PREVIEW_CATEGORIES = ['Web', 'Game'];

export const DEFAULT_FEATURES_BY_CATEGORY = {
  Web: ['User authentication & profiles', 'Responsive UI with Tailwind CSS', 'REST API integration', 'Data persistence with a database', 'Deployment to Vercel/Netlify'],
  Mobile: ['Cross-platform iOS & Android support', 'Push notifications', 'Offline mode with local storage', 'User auth with social login', 'App store deployment'],
  AI: ['LLM API integration (OpenAI/Gemini)', 'Prompt engineering & tuning', 'Structured JSON output parsing', 'Streaming responses & loading states', 'Result history & caching'],
  ML: ['Dataset cleaning & feature engineering', 'Model training & evaluation', 'Accuracy & loss metrics', 'Prediction endpoint or interface', 'Model versioning & retraining'],
  CLI: ['Argument parsing & help text', 'Config file support', 'Colorized terminal output', 'Error handling & exit codes', 'npm package publishing'],
  Game: ['Game loop & state machine', 'Keyboard/touch controls', 'Score tracking & leaderboard', 'Multiple levels or modes', 'Sound effects & animations'],
  API: ['RESTful endpoint design', 'Request validation & error handling', 'API key auth & rate limiting', 'Auto-generated docs (Swagger)', 'Deployment & CI/CD'],
  Data: ['File upload & parsing (CSV/JSON)', 'Interactive charts with Recharts', 'Filtering, sorting & search', 'Export to CSV/PDF', 'Summary statistics'],
  DevOps: ['Automated monitoring & alerts', 'CLI tooling & scripts', 'Docker containerization', 'CI/CD pipeline integration', 'Logging & observability'],
  Other: ['Core feature implementation', 'User-friendly UI', 'Data persistence', 'Error handling', 'Documentation'],
};

export function defaultFeatures(category) {
  return DEFAULT_FEATURES_BY_CATEGORY[category] || DEFAULT_FEATURES_BY_CATEGORY.Other;
}

export function splitFeatures(value) {
  return value ? value.split('\n').filter(Boolean) : [];
}