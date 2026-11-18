import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, MousePointerClick, GitBranch, Pencil, ListTree } from 'lucide-react';
import PrototypeModal from '@/components/ideas/PrototypeModal';
import FeatureHistoryModal from '@/components/versions/FeatureHistoryModal';
import ProjectVersionsModal from '@/components/versions/ProjectVersionsModal';

export default function ProjectActions({ idea, project = null }) {
  const { isAuthenticated } = useAuth();
  const [tryMode, setTryMode] = useState(null);
  const [versionsMode, setVersionsMode] = useState(null);

  const withAccount = (action) => () => {
    if (!isAuthenticated) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    action();
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="text-xs gap-1.5 h-8 border-primary/30 text-primary hover:bg-primary/10"
            >
              <MousePointerClick className="w-3.5 h-3.5" /> Try it
              <ChevronDown className="w-3 h-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuItem className="text-xs gap-2" onClick={withAccount(() => setTryMode('prototype'))}>
              <MousePointerClick className="w-3.5 h-3.5 text-primary" /> Try it
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs gap-1.5 h-8 text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <GitBranch className="w-3.5 h-3.5" /> Versions
              <ChevronDown className="w-3 h-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            {project ? (
              <>
                <DropdownMenuItem className="text-xs gap-2" onClick={() => setVersionsMode('features')}>
                  <Pencil className="w-3.5 h-3.5 text-primary" /> Edit versions
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs gap-2" onClick={() => setVersionsMode('snapshots')}>
                  <ListTree className="w-3.5 h-3.5 text-primary" /> Project versions
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                Save the project first
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <PrototypeModal idea={idea} open={tryMode === 'prototype'} onClose={() => setTryMode(null)} />

      {project && (
        <>
          <FeatureHistoryModal
            project={project}
            open={versionsMode === 'features'}
            onClose={() => setVersionsMode(null)}
          />
          <ProjectVersionsModal
            project={project}
            open={versionsMode === 'snapshots'}
            onClose={() => setVersionsMode(null)}
          />
        </>
      )}
    </>
  );
}