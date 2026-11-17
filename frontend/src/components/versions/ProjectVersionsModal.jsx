import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Camera, ListTree, Loader2, Trash2, Check, GitBranch } from 'lucide-react';
import { splitFeatures } from '@/lib/projectStyles';

export default function ProjectVersionsModal({ project, open, onClose }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [label, setLabel] = useState('');

  const projectId = project?.id;
  const versionsKey = ['project-versions', projectId];

  const { data: versions = [], isLoading } = useQuery({
    queryKey: versionsKey,
    queryFn: () => base44.entities.ProjectVersion.filter({ project_id: projectId }, '-created_date', 50),
    enabled: !!projectId && open,
  });

  const { data: featureVersions = [] } = useQuery({
    queryKey: ['feature-versions', projectId],
    queryFn: () => base44.entities.FeatureVersion.filter({ project_id: projectId }, '-created_date', 1),
    enabled: !!projectId && open,
  });

  const latestFeatures = featureVersions[0]?.features || '';

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ProjectVersion.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: versionsKey });
      queryClient.invalidateQueries({ queryKey: ['saved-projects'] });
      setLabel('');
      toast({ title: 'Snapshot created' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ProjectVersion.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: versionsKey });
      toast({ title: 'Version deleted' });
    },
  });

  const switchMutation = useMutation({
    mutationFn: (version) => base44.entities.ProjectVersion.switch(projectId, version.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: versionsKey });
      queryClient.invalidateQueries({ queryKey: ['feature-versions', projectId] });
      queryClient.invalidateQueries({ queryKey: ['saved-projects'] });
      toast({ title: 'Project version restored' });
    },
  });

  const handleSnapshot = () => {
    if (!projectId) return;
    createMutation.mutate({
      project_id: projectId,
      label: label.trim() || `v0.${versions.length + 1}`,
      code: project?.code || '',
      language: project?.language || 'javascript',
      notes: `Snapshot of ${latestFeatures ? 'current feature plan' : 'project'}`,
      features: latestFeatures,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <ListTree className="w-4 h-4 text-primary" /> Project versions
            <span className="text-sm font-normal text-muted-foreground truncate">{project?.title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder={`v0.${versions.length + 1}`}
            className="h-8 text-sm flex-1"
            onKeyDown={(event) => event.key === 'Enter' && handleSnapshot()}
          />
          <Button size="sm" className="h-8 gap-1.5 text-xs bg-primary hover:bg-primary/90 shrink-0"
            onClick={handleSnapshot} disabled={createMutation.isPending}>
            <Camera className="w-3.5 h-3.5" /> New snapshot
          </Button>
        </div>

        {isLoading ? (
          <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : versions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <GitBranch className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No project versions yet</p>
            <p className="text-sm mt-1">Create a snapshot to keep a version you can switch back to.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {versions.map((version) => {
              const features = splitFeatures(version.features);
              const isCurrent = project?.current_version === version.label;
              return (
                <div key={version.id} className={`border rounded-xl p-3 flex items-start gap-3 ${isCurrent ? 'border-primary/40 bg-primary/5' : 'border-border'}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge className="font-mono text-[11px] bg-primary/10 text-primary border-primary/20 px-2 py-0">{version.label}</Badge>
                      {isCurrent && <Badge className="text-[10px] bg-green-100 text-green-700 border-green-200 px-1.5 py-0">Current</Badge>}
                      <span className="text-[10px] text-muted-foreground">{new Date(version.created_date).toLocaleDateString()}</span>
                    </div>
                    {version.notes && <p className="text-xs text-muted-foreground line-clamp-2 mb-1">{version.notes}</p>}
                    <p className="text-[11px] text-muted-foreground">{features.length} feature{features.length !== 1 ? 's' : ''} in this version</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="sm" variant={isCurrent ? 'ghost' : 'outline'} className="h-7 text-[11px] gap-1 px-2"
                      disabled={isCurrent || switchMutation.isPending} onClick={() => switchMutation.mutate(version)}>
                      <Check className="w-3 h-3" /> Switch
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(version.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
