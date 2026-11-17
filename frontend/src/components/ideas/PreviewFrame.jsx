import { useState } from 'react';
import { Loader2, RotateCw } from 'lucide-react';

export default function PreviewFrame({
  srcDoc,
  loading,
  loadingText = 'Building the preview…',
  urlLabel = 'preview',
  heightClass = 'h-[58vh] min-h-[360px]',
  iframeRef,
}) {
  const [key, setKey] = useState(0);

  return (
    <div className="rounded-xl overflow-hidden border border-border bg-card shadow-sm">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/60 border-b border-border">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
        </div>
        <div className="flex-1 mx-2 bg-background rounded-md px-3 py-1 text-[11px] font-mono text-muted-foreground truncate text-center">
          {urlLabel}
        </div>
        <button
          onClick={() => setKey((k) => k + 1)}
          className="text-muted-foreground hover:text-foreground shrink-0"
          title="Reload preview"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className={`relative bg-white ${heightClass}`}>
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground px-6 text-center">{loadingText}</p>
          </div>
        ) : (
          <iframe
            key={key}
            ref={iframeRef}
            title={urlLabel}
            srcDoc={srcDoc}
            sandbox="allow-scripts"
            className="w-full h-full border-0 bg-white"
          />
        )}
      </div>
    </div>
  );
}