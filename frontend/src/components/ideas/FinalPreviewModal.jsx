import { useState, useEffect, useMemo, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Monitor, AlertCircle, RotateCcw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PreviewFrame from './PreviewFrame';

// Module-level cache so a preview is only generated once per idea
const cache = {};

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function buildDocument(data) {
  const pages = data.pages || [];
  const accent = data.accent || '#7c3aed';
  const siteName = esc(data.site_name || 'Preview');

  const links = pages
    .map((p, i) => `<button class="ff-link${i === 0 ? ' active' : ''}" data-page="${i}">${esc(p.name)}</button>`)
    .join('');

  const bodies = pages
    .map((p, i) => `<section class="ff-page${i === 0 ? ' active' : ''}" data-page="${i}">${p.body_html || ''}</section>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#fff;color:#0f172a;-webkit-font-smoothing:antialiased}
img{max-width:100%}
.ff-nav{position:fixed;top:0;left:0;right:0;height:60px;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:0 24px;background:rgba(255,255,255,.92);backdrop-filter:blur(12px);border-bottom:1px solid #ececf2;z-index:60}
.ff-brand{font-weight:800;letter-spacing:-.02em;font-size:16px;white-space:nowrap}
.ff-brand em{font-style:normal;color:${accent}}
.ff-links{display:flex;align-items:center;gap:2px;flex-wrap:wrap;justify-content:flex-end}
.ff-link{appearance:none;border:0;background:transparent;font:inherit;font-size:13px;font-weight:600;color:#6b7280;padding:8px 13px;border-radius:999px;cursor:pointer;white-space:nowrap}
.ff-link:hover{color:#0f172a;background:#f4f4f8}
.ff-link.active{color:#fff;background:${accent}}
.ff-main{padding-top:60px}
.ff-page{display:none}
.ff-page.active{display:block}
</style>
<style>${data.css || ''}</style>
</head>
<body>
<header class="ff-nav">
  <div class="ff-brand">${siteName}<em>.</em></div>
  <nav class="ff-links">${links}</nav>
</header>
<main class="ff-main">${bodies}</main>
<script>
(function(){
  var links = Array.prototype.slice.call(document.querySelectorAll('.ff-link'));
  var pages = Array.prototype.slice.call(document.querySelectorAll('.ff-page'));
  function show(i){
    links.forEach(function(l,j){ l.classList.toggle('active', j === i); });
    pages.forEach(function(p,j){ p.classList.toggle('active', j === i); });
    window.scrollTo(0,0);
  }
  links.forEach(function(l){ l.addEventListener('click', function(){ show(Number(l.dataset.page)); }); });
  window.addEventListener('message', function(e){
    if (e.data && typeof e.data.page === 'number') show(e.data.page);
  });
  ${data.script || ''}
})();
</script>
</body>
</html>`;
}

export default function FinalPreviewModal({ idea, open, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activePage, setActivePage] = useState(0);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!open || !idea) return;
    const key = idea.id || idea.title;
    if (cache[key]) {
      setData(cache[key]);
      setError(null);
      setActivePage(0);
      return;
    }
    generate();
  }, [open, idea?.id]);

  const generate = async () => {
    if (!idea) return;
    setLoading(true);
    setError(null);
    setData(null);
    setActivePage(0);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a senior product designer and front-end engineer. Design the FINISHED, shipped product for this project idea — exactly what the user will see when the project is built.

Title: ${idea.title}
Description: ${idea.description}
Category: ${idea.category}
Tech stack: ${idea.tech_stack?.join(', ') || 'unspecified'}

Return JSON with:
- site_name: short product name
- accent: one hex color used as the brand accent (e.g. "#7c3aed")
- css: CSS rules only (no <style> tags) styling the page markup you return. Modern, polished, generously spaced, responsive. Use gradients, borders, radii and shadows — never external images, fonts or URL() references.
- pages: 3-4 pages. Each page is { name, body_html }. body_html is ONLY the page's inner markup (sections, headings, cards, forms, grids). No <html>, <head>, <style>, <script> or site navigation — the app injects a navigation bar with links to every page. Prefix your class names with "p-" to avoid clashes.
Each page must look like a full, finished screen: a substantial hero or page header, then at least two more content sections (feature grids, pricing cards, tables, testimonials, dashboards, forms), and a footer band on the last page — roughly 40-70 lines of markup per page with real, specific copy for this exact product (never lorem ipsum). Represent imagery with CSS gradients/shapes, never <img>.
- script: optional short inline JavaScript (no <script> tags) for interactions like toggles or a playable game board, or "" if not needed.
- hint: one sentence telling the user what to look at on the finished site.

For Game projects use pages "Main Menu", "Play" and "Leaderboard", and make the Play page contain a small working playable board.`,
        response_json_schema: {
          type: 'object',
          properties: {
            site_name: { type: 'string' },
            accent: { type: 'string' },
            css: { type: 'string' },
            pages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  body_html: { type: 'string' },
                },
              },
            },
            script: { type: 'string' },
            hint: { type: 'string' },
          },
        },
      });
      cache[idea.id || idea.title] = result;
      setData(result);
    } catch (e) {
      setError('Could not generate the preview. Please try again.');
    }
    setLoading(false);
  };

  const srcDoc = useMemo(() => (data ? buildDocument(data) : ''), [data]);
  const pages = data?.pages || [];

  const goToPage = (i) => {
    setActivePage(i);
    iframeRef.current?.contentWindow?.postMessage({ page: i }, '*');
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-5xl w-[96vw] max-h-[94vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold pr-8">
            <Monitor className="w-5 h-5 text-primary" />
            Final look — {idea?.title}
          </DialogTitle>
        </DialogHeader>

        <p className="text-xs text-muted-foreground -mt-2">
          Exactly how this {idea?.category === 'Game' ? 'game' : 'site'} looks once it's built — every page is linked in the site's own navigation.
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
            {pages.length > 0 && (
              <div className="-mb-1 flex items-center gap-1.5 flex-wrap">
                {pages.map((p, i) => (
                  <button
                    key={p.name + i}
                    onClick={() => goToPage(i)}
                    className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                      activePage === i
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
                <span className="text-[11px] text-muted-foreground/70 ml-1">Links inside the site work too</span>
              </div>
            )}

            <PreviewFrame
              srcDoc={srcDoc}
              loading={loading}
              loadingText={`Designing the finished ${idea?.category === 'Game' ? 'game' : 'website'}…`}
              urlLabel={`${(data?.site_name || idea?.title || 'preview').toLowerCase().replace(/\s+/g, '-')}.app`}
              heightClass="h-[62vh] min-h-[400px]"
              iframeRef={iframeRef}
            />

            {data?.hint && (
              <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="text-primary shrink-0">✦</span> {data.hint}
              </p>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}