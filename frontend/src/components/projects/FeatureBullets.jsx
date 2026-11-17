import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { splitFeatures, defaultFeatures } from '@/lib/projectStyles';

export default function FeatureBullets({ projectId, category }) {
  const { data: versions = [] } = useQuery({
    queryKey: ['feature-versions', projectId],
    queryFn: () => base44.entities.FeatureVersion.filter({ project_id: projectId }, '-created_date', 1),
    enabled: !!projectId,
  });

  const latest = versions[0];
  const lines = latest?.features ? splitFeatures(latest.features) : defaultFeatures(category);
  const items = lines.map((line) => ({
    text: line.startsWith('✓ ') ? line.slice(2) : line,
    done: line.startsWith('✓ '),
  }));
  const doneCount = items.filter((f) => f.done).length;

  return (
    <div className="bg-accent/40 rounded-lg px-3 py-2.5 mb-3 border border-primary/10">
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-[10px] font-semibold text-primary uppercase tracking-wide">
          Features you will build
        </p>
        {latest && (
          <span className="text-[10px] font-mono text-muted-foreground shrink-0">
            {latest.label} · {doneCount}/{items.length} done
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
        {items.map((feature, i) => (
          <div key={`${feature.text}-${i}`} className="flex items-start gap-1.5 text-xs">
            <span className={feature.done ? 'text-green-500 shrink-0 mt-0.5' : 'text-primary shrink-0 mt-0.5'}>
              {feature.done ? '✓' : '✦'}
            </span>
            <span className={feature.done ? 'text-muted-foreground line-through' : 'text-foreground/80'}>
              {feature.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}