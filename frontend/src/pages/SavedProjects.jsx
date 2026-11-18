import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, LogIn } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/AuthContext';
import SavedProjectCard from '@/components/projects/SavedProjectCard';

export default function SavedProjects() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['saved-projects', user?.id],
    queryFn: () => base44.entities.SavedProject.list('-updated_date', 50),
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SavedProject.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-projects'] });
      toast({ title: 'Project removed' });
    },
    onError: (error) => {
      toast({ title: 'Could not remove project', description: error.message || 'Please try again.', variant: 'destructive' });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <img src="/favicon.svg" alt="ForgeFlow" className="w-14 h-14 mx-auto mb-4" />
        <p className="text-lg font-semibold">Sign up to keep your projects</p>
        <p className="text-sm text-muted-foreground mt-1 mb-5">
          Saved projects are linked to your account, so they are waiting for you when you come back.
        </p>
        <Button
          className="gap-2 bg-primary hover:bg-primary/90"
          onClick={() => base44.auth.redirectToLogin(window.location.href)}
        >
          <LogIn className="w-4 h-4" /> Create an account / Sign in
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-3">
          <img src="/favicon.svg" alt="" aria-hidden="true" className="w-9 h-9 shrink-0" />
          My Projects
        </h1>
        <p className="text-muted-foreground text-base mt-1">
          {projects.length} project{projects.length !== 1 ? 's' : ''} saved — your ideas, versions and features in one place.
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-24">
          <img src="/favicon.svg" alt="" aria-hidden="true" className="w-14 h-14 mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No saved projects yet</p>
          <p className="text-sm text-muted-foreground mt-1">Go explore ideas and save ones you like!</p>
          <Button onClick={() => navigate('/')} className="mt-4 bg-primary hover:bg-primary/90">
            Explore Ideas
          </Button>
        </div>
      ) : (
        <div className="grid gap-3" style={{ gridTemplateColumns: '1fr' }}>
          {projects.map((project, i) => (
            <SavedProjectCard
              key={project.id}
              project={project}
              index={i}
              onDelete={(p) => deleteMutation.mutate(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
