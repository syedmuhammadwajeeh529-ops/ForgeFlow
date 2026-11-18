import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookmarkPlus } from 'lucide-react';
import ProjectActions from '@/components/cards/ProjectActions';
import FeatureBullets from '@/components/projects/FeatureBullets';
import { difficultyColors } from '@/lib/projectStyles';

export default function IdeaDetailModal({ idea, open, onClose, onSave, isSaving }) {
  const handleSave = async () => {
    try {
      await onSave(idea);
      onClose();
    } catch {
      // The parent displays the save error; keep the dialog open for another attempt.
    }
  };

  if (!idea) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold pr-8">{idea.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={`border ${difficultyColors[idea.difficulty]}`}>
              {idea.difficulty}
            </Badge>
            <Badge variant="outline" className="text-primary border-primary/30">
              {idea.category}
            </Badge>
          </div>

          <p className="text-muted-foreground leading-relaxed text-sm">{idea.description}</p>

          {idea.tech_stack?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Tech Stack</p>
              <div className="flex flex-wrap gap-1.5">
                {idea.tech_stack.map((tech) => (
                  <span key={tech} className="text-xs font-mono bg-muted text-muted-foreground px-2.5 py-1 rounded-md">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          <FeatureBullets projectId={null} category={idea.category} />

          <ProjectActions idea={idea} />

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full gap-2 bg-primary hover:bg-primary/90"
          >
            <BookmarkPlus className="w-4 h-4" />
            Save project
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}