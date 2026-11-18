import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { BookmarkPlus, BookmarkCheck, Zap, Loader2 } from 'lucide-react';
import FeatureBullets from '@/components/projects/FeatureBullets';
import ProjectActions from '@/components/cards/ProjectActions';
import { categoryColors, difficultyColors } from '@/lib/projectStyles';

export default function IdeaCard({ idea, savedProject = null, onSave, onOpen, index = 0, isSaving = false }) {
  const isSaved = !!savedProject;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group relative bg-card border border-border rounded-xl p-4 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 w-full"
    >
      {/* Square save control — top right */}
      <button
        onClick={async (e) => { e.stopPropagation(); if (!isSaved) { try { await onSave(idea); } catch {} } }}
        disabled={isSaving || isSaved}
        title={isSaved ? 'Saved in My Projects' : 'Save project'}
        aria-label="Save project"
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
          isSaved
            ? 'bg-blue-50 text-blue-600 border border-blue-200'
            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-600/25'
        }`}
      >
        {isSaving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isSaved ? (
          <BookmarkCheck className="w-4 h-4" />
        ) : (
          <BookmarkPlus className="w-4 h-4" />
        )}
      </button>

      {/* Top row: title + badges + curated */}
      <div className="flex items-start gap-3 mb-3 pr-11">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${categoryColors[idea.category] || 'bg-purple-100 text-purple-700'}`}>
          {idea.category?.slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3
              className="font-semibold text-sm text-foreground leading-snug group-hover:text-primary transition-colors cursor-pointer"
              onClick={() => onOpen(idea)}
            >
              {idea.title}
            </h3>
            {idea.is_curated && (
              <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20 font-semibold px-1.5 py-0.5">
                <Zap className="w-2.5 h-2.5 mr-1" /> Curated
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="outline" className={`text-xs border ${difficultyColors[idea.difficulty]}`}>
              {idea.difficulty}
            </Badge>
            <Badge variant="outline" className={`text-xs ${categoryColors[idea.category] || 'bg-purple-100 text-purple-700'}`}>
              {idea.category}
            </Badge>
            {idea.tech_stack?.slice(0, 3).map((tech) => (
              <span key={tech} className="text-[11px] font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded-md">
                {tech}
              </span>
            ))}
            {idea.tech_stack?.length > 3 && (
              <span className="text-[11px] text-muted-foreground">+{idea.tech_stack.length - 3}</span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">{idea.description}</p>

      {/* Features you will build */}
      <FeatureBullets projectId={savedProject?.id || null} category={idea.category} />

      {/* Actions */}
      <ProjectActions idea={idea} project={savedProject} />
    </motion.div>
  );
}