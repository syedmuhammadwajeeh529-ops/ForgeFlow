import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import FeatureBullets from '@/components/projects/FeatureBullets';
import ProjectActions from '@/components/cards/ProjectActions';
import { categoryColors, difficultyColors } from '@/lib/projectStyles';

export default function SavedProjectCard({ project, onDelete, onOpen, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group relative bg-card border border-border rounded-xl p-4 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 w-full"
    >
      {/* Square remove control — top right */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(project); }}
        title="Remove project"
        aria-label="Remove project"
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-lg flex items-center justify-center bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive border border-border transition-all"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Top row */}
      <div className="flex items-start gap-3 mb-3 pr-11">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${categoryColors[project.category] || 'bg-purple-100 text-purple-700'}`}>
          {project.category?.slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold text-sm text-foreground leading-snug mb-1 group-hover:text-primary transition-colors cursor-pointer"
            onClick={() => onOpen?.(project)}
          >
            {project.title}
          </h3>
          <div className="flex items-center gap-1.5 flex-wrap">
            {project.difficulty && (
              <Badge variant="outline" className={`text-xs border ${difficultyColors[project.difficulty]}`}>
                {project.difficulty}
              </Badge>
            )}
            {project.category && (
              <Badge variant="outline" className={`text-xs ${categoryColors[project.category] || 'bg-purple-100 text-purple-700'}`}>
                {project.category}
              </Badge>
            )}
            {project.current_version && (
              <span className="text-[11px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                {project.current_version}
              </span>
            )}
            {project.tech_stack?.map((tech) => (
              <span key={tech} className="text-[11px] font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded-md">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">{project.description}</p>

      {/* Features you will build */}
      <FeatureBullets projectId={project.id} category={project.category} />

      {/* Actions */}
      <ProjectActions idea={project} project={project} />
    </motion.div>
  );
}