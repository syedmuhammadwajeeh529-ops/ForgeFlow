import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2, Check, X, Pencil, Save, GitBranch, Loader2 } from 'lucide-react';
import { splitFeatures, defaultFeatures } from '@/lib/projectStyles';

export default function FeatureHistoryModal({ project, open, onClose }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [editing, setEditing] = useState(false);
  const [localLabel, setLocalLabel] = useState('');
  const [localFeatures, setLocalFeatures] = useState([]);
  const [localNotes, setLocalNotes] = useState('');
  const [localStack, setLocalStack] = useState([]);
  const [localDescription, setLocalDescription] = useState('');
  const [newFeatureText, setNewFeatureText] = useState('');

  const projectId = project?.id;
  const queryKey = ['feature-versions-all', projectId];

  const { data: versions = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => base44.entities.FeatureVersion.filter({ project_id: projectId }, 'created_date', 50),
    enabled: !!projectId && open,
  });

  const selected = versions[selectedIdx] || null;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey });
    queryClient.invalidateQueries({ queryKey: ['feature-versions', projectId] });
  };

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FeatureVersion.create(data),
    onSuccess: () => {
      invalidate();
      setEditing(false);
      toast({ title: 'Feature version created' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FeatureVersion.update(id, data),
    onSuccess: () => {
      invalidate();
      setEditing(false);
      toast({ title: 'Feature version saved' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FeatureVersion.delete(id),
    onSuccess: () => {
      invalidate();
      setEditing(false);
      setSelectedIdx((i) => Math.max(0, i - 1));
      toast({ title: 'Version deleted' });
    },
  });

  const startEdit = () => {
    if (!selected) return;
    setLocalLabel(selected.label || '');
    setLocalFeatures(splitFeatures(selected.features));
    setLocalNotes(selected.notes || '');
    setLocalDescription(selected.description || project?.description || '');
    setLocalStack(Array.isArray(selected.tech_stack) ? selected.tech_stack : []);
    setEditing(true);
  };

  const generateVersionDetails = async (features, existingStack = selected?.tech_stack) => {
    const cleanFeatures = features.map((item) => item.replace(/^✓ /, '').trim()).filter(Boolean);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Update the project description and technology stack for this exact version.
Write a polished, specific description of 1–2 sentences (about 30–55 words) explaining what the product does and how its listed features work together. Describe only capabilities represented by the features. Do not mention planned or missing capabilities, and do not simply repeat the feature list.
Then calculate the minimum technology stack required by these features. Keep shared frameworks, runtimes, databases, and libraries only when at least one feature needs them. Remove unnecessary technologies and do not add speculative tools.
Project: ${project?.title || 'Untitled'}
Current description for context only: ${project?.description || ''}
Category: ${project?.category || ''}
Existing stack for context: ${(Array.isArray(existingStack) ? existingStack : (Array.isArray(project?.tech_stack) ? project.tech_stack : [])).join(', ')}
Features in this version:
${cleanFeatures.map((item) => `- ${item}`).join('\n')}
Return JSON with description (string) and tech_stack (array of technology-name strings).`,
      response_json_schema: {
        type: 'object',
        properties: {
          description: { type: 'string' },
          tech_stack: { type: 'array', items: { type: 'string' } },
        },
        required: ['description', 'tech_stack'],
      },
    });
    if (typeof result?.description !== 'string' || !result.description.trim() || !Array.isArray(result?.tech_stack)) {
      throw new Error('AI did not return a valid version description and technology stack.');
    }
    return {
      description: result.description.trim(),
      tech_stack: [...new Set(result.tech_stack.map((item) => String(item).trim()).filter(Boolean))],
    };
  };

  const handleCreate = async () => {
    const features = defaultFeatures(project?.category);
    let details;
    try { details = await generateVersionDetails(features, project?.tech_stack); }
    catch (error) { toast({ title: 'Could not generate version details', description: error.message, variant: 'destructive' }); return; }
    createMutation.mutate({
      project_id: projectId,
      label: `v0.${versions.length + 1}`,
      features: features.join('\n'),
      description: details.description,
      notes: '',
      tech_stack: details.tech_stack,
    });
    setSelectedIdx(0);
  };

  const saveEdit = async () => {
    try {
      const details = await generateVersionDetails(localFeatures, localStack);
      updateMutation.mutate({ id: selected.id, data: { label: localLabel, description: details.description, features: localFeatures.join('\n'), notes: localNotes, tech_stack: details.tech_stack } });
    } catch (error) {
      toast({ title: 'Could not regenerate version details', description: error.message, variant: 'destructive' });
    }
  };

  const toggleFeature = async (feature) => {
    if (editing) {
      setLocalFeatures((prev) =>
        prev.map((f) => (f === feature ? (f.startsWith('✓ ') ? f.slice(2) : `✓ ${f}`) : f))
      );
      return;
    }
    const updated = splitFeatures(selected.features).map((f) =>
      f === feature ? (f.startsWith('✓ ') ? f.slice(2) : `✓ ${f}`) : f
    );
    try {
      const details = await generateVersionDetails(updated);
      updateMutation.mutate({ id: selected.id, data: { features: updated.join('\n'), description: details.description, tech_stack: details.tech_stack } });
    } catch (error) {
      toast({ title: 'Could not regenerate version details', description: error.message, variant: 'destructive' });
    }
  };

  const addFeature = () => {
    const trimmed = newFeatureText.trim();
    if (!trimmed) return;
    setLocalFeatures((prev) => [...prev, trimmed]);
    setNewFeatureText('');
  };

  const displayFeatures = editing ? localFeatures : splitFeatures(selected?.features);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Pencil className="w-4 h-4 text-primary" /> Edit versions
            <span className="text-sm font-normal text-muted-foreground truncate">
              {project?.title}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Feature history — what each version will build. The card follows the latest version.
          </p>
          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs bg-primary hover:bg-primary/90"
            onClick={handleCreate}
            disabled={createMutation.isPending}
          >
            <Plus className="w-3.5 h-3.5" /> New version
          </Button>
        </div>

        {isLoading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <GitBranch className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No feature versions yet</p>
            <p className="text-sm mt-1">Create v0.1 to start planning your features.</p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-5">
            {/* Timeline */}
            <div className="sm:w-44 shrink-0">
              <div className="relative">
                <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-1">
                  {versions.map((version, i) => {
                    const isActive = selected?.id === version.id;
                    const count = splitFeatures(version.features).length;
                    return (
                      <button
                        key={version.id}
                        onClick={() => {
                          setSelectedIdx(i);
                          setEditing(false);
                        }}
                        className={`w-full flex items-start gap-2.5 px-2 py-2 rounded-lg text-left relative z-10 transition-colors ${
                          isActive ? 'bg-primary/10' : 'hover:bg-muted/60'
                        }`}
                      >
                        <div
                          className={`mt-1 w-3 h-3 rounded-full border-2 shrink-0 ${
                            isActive ? 'bg-primary border-primary' : 'bg-card border-border'
                          }`}
                        />
                        <div className="min-w-0">
                          <p className={`text-xs font-semibold font-mono truncate ${isActive ? 'text-primary' : ''}`}>
                            {version.label}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {count} feature{count !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Detail */}
            <div className="flex-1 min-w-0">
              {selected && (
                <div className="border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Badge className="font-mono text-xs bg-primary/10 text-primary border-primary/20 px-2.5 py-0.5">
                        {editing ? (
                          <input
                            value={localLabel}
                            onChange={(e) => setLocalLabel(e.target.value)}
                            className="bg-transparent font-mono text-xs outline-none w-20"
                          />
                        ) : (
                          selected.label
                        )}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(selected.created_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {editing ? (
                        <>
                          <Button
                            size="sm"
                            onClick={saveEdit}
                            disabled={updateMutation.isPending}
                            className="h-7 gap-1 text-xs bg-primary hover:bg-primary/90 px-3"
                          >
                            <Save className="w-3 h-3" /> Save
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditing(false)}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                            onClick={startEdit}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteMutation.mutate(selected.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Version description
                  </p>
                  <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 leading-relaxed mb-4">
                    {selected.description || project?.description || 'This version does not have a description yet. Save a feature change to generate one.'}
                  </p>

                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Features · {displayFeatures.filter((f) => f.startsWith('✓ ')).length}/{displayFeatures.length} done
                  </p>
                  <div className="space-y-1.5 mb-3">
                    {displayFeatures.length === 0 && (
                      <p className="text-sm text-muted-foreground/60 italic">No features yet.</p>
                    )}
                    {displayFeatures.map((feature, i) => {
                      const done = feature.startsWith('✓ ');
                      return (
                        <div
                          key={`${feature}-${i}`}
                          className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 group ${
                            done ? 'bg-primary/5' : 'bg-muted/40'
                          }`}
                        >
                          <button
                            onClick={() => toggleFeature(feature)}
                            className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${
                              done ? 'bg-primary border-primary' : 'border-border hover:border-primary'
                            }`}
                          >
                            {done && <Check className="w-2.5 h-2.5 text-white" />}
                          </button>
                          <span className={`text-sm flex-1 ${done ? 'line-through text-muted-foreground' : ''}`}>
                            {done ? feature.slice(2) : feature}
                          </span>
                          {editing && (
                            <button
                              onClick={() => setLocalFeatures((prev) => prev.filter((f) => f !== feature))}
                              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {editing && (
                    <div className="flex gap-2 mb-4">
                      <Input
                        value={newFeatureText}
                        onChange={(e) => setNewFeatureText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addFeature()}
                        placeholder="Add a feature..."
                        className="h-8 text-sm flex-1"
                      />
                      <Button size="sm" variant="outline" onClick={addFeature} className="h-8 gap-1 text-xs shrink-0">
                        <Plus className="w-3 h-3" /> Add
                      </Button>
                    </div>
                  )}

                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Technology stack · {editing ? localStack.length : (Array.isArray(selected.tech_stack) ? selected.tech_stack.length : 0)}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(editing ? localStack : (Array.isArray(selected.tech_stack) ? selected.tech_stack : [])).length
                      ? (editing ? localStack : selected.tech_stack).map((technology) => <Badge key={technology} variant="secondary">{technology}</Badge>)
                      : <span className="text-xs text-muted-foreground italic">The stack will be calculated from this version's features when saved.</span>}
                  </div>

                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Change summary
                  </p>
                  {editing ? (
                    <Textarea
                      value={localNotes}
                      onChange={(e) => setLocalNotes(e.target.value)}
                      placeholder="What changed in this version?"
                      className="text-sm min-h-[70px] resize-none"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 leading-relaxed">
                      {selected.notes || 'No summary yet.'}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}