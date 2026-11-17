import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MousePointerClick, AlertCircle, RotateCcw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PreviewFrame from './PreviewFrame';

const cache = {};

export default function PrototypeModal({ idea, open, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !idea) return;
    const key = idea.id || idea.title;
    if (cache[key]) {
      setData(cache[key]);
      setError(null);
      return;
    }
    generate();
  }, [open, idea?.id]);

  const generate = async () => {
    if (!idea) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Build a realistic, INTERACTIVE prototype of this project idea that a user can click around and try for a minute.

Title: ${idea.title}
Description: ${idea.description}
Category: ${idea.category}
Tech stack: ${idea.tech_stack?.join(', ') || 'unspecified'}

Return JSON with:
- title: short prototype title
- instructions: 3 short things the user can try (each 2-6 words, imperative, e.g. "Click a habit to check it off")
- html: a COMPLETE self-contained HTML document as one string, starting with <!DOCTYPE html>, with inline <style> and <script> only. No external fonts, images, scripts or network calls — use CSS shapes and gradients for visuals.

Make the prototype genuinely interactive: buttons, toggles, tabs, forms and lists must actually change state and respond. Tailor the shell to the category:
- Web / Game: the app screen itself; a game prototype responds to clicks or keys.
- Mobile: a phone-sized app frame (about 390px wide) centered on a soft backdrop, with tappable screens.
- CLI: a terminal window with a prompt, typed-out responses to commands the user can pick.
- API: an API console with endpoints, a send button and a formatted JSON response.
- Data: a dashboard with charts (CSS bars/lines), filters that change the numbers.
- AI: a prompt box that returns a simulated AI response.
- ML: a model playground — inputs, a predict button, a confidence score.
- DevOps: a live pipeline/status board with running steps.
Keep it lively, realistic and compact (under ~180 lines).`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            instructions: { type: 'array', items: { type: 'string' } },
            html: { type: 'string' },
          },
        },
      });
      cache[idea.id || idea.title] = result;
      setData(result);
    } catch (e) {
      setError('Could not generate the prototype. Please try again.');
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-5xl w-[96vw] max-h-[94vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold pr-8">
            <MousePointerClick className="w-5 h-5 text-primary" />
            Try it — {data?.title || idea?.title}
          </DialogTitle>
        </DialogHeader>

        <p className="text-xs text-muted-foreground -mt-2">
          A working prototype of this project. Click, type and play with it to see how people would use it.
        </p>

        {error ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <AlertCircle className="w-7 h-7 text-destructive" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button size="sm" variant="outline" className="gap-2" onClick={generate}>
              <RotateCcw className="w-3.5 h-3.5" /> Try again
            </Button>
          </div>
        ) : (
          <>
            {data?.instructions?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {data.instructions.map((tip, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium"
                  >
                    {i + 1}. {tip}
                  </span>
                ))}
              </div>
            )}

            <PreviewFrame
              srcDoc={data?.html || ''}
              loading={loading}
              loadingText="Building an interactive prototype…"
              urlLabel={`${idea?.category?.toLowerCase() || 'app'} prototype`}
              heightClass="h-[64vh] min-h-[420px]"
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}