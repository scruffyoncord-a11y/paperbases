import React from 'react';
import { 
  Highlighter 
} from 'lucide-react';
import {
  PdfLoader,
  PdfHighlighter,
  Highlight,
  Popup,
  AreaHighlight,
} from "react-pdf-highlighter";
import "react-pdf-highlighter/dist/style.css";

export const PdfViewer = React.memo(({ url, title, highlights = [], onHighlight }) => {
  const [isLoading, setIsLoading] = React.useState(true);

  // Format existing Highlights properly
  const formattedHighlights = React.useMemo(() => {
     return highlights.map(h => {
         // Gracefully handle older text-only highlights
         const position = h.position ? (typeof h.position === 'string' ? JSON.parse(h.position) : h.position) : {
            boundingRect: { x1: 0, y1: 0, x2: 0, y2: 0, width: 0, height: 0, pageNumber: h.pageIndex + 1 },
            rects: []
         };
         const content = h.content ? (typeof h.content === 'string' ? JSON.parse(h.content) : h.content) : { text: h.text || "Older highlight" };
         
         return {
             id: String(h.id),
             content,
             position,
             comment: { text: "", color: h.color || 'yellow' }
         };
     });
  }, [highlights]);

  // Colors mapping for Tip
  const COLORS = [
    { id: 'yellow', bg: 'bg-yellow-400', glow: 'shadow-[0_0_12px_rgba(250,204,21,0.5)]' },
    { id: 'green', bg: 'bg-emerald-400', glow: 'shadow-[0_0_12px_rgba(52,211,153,0.5)]' },
    { id: 'blue', bg: 'bg-sky-400', glow: 'shadow-[0_0_12px_rgba(56,189,248,0.5)]' },
    { id: 'pink', bg: 'bg-rose-400', glow: 'shadow-[0_0_12px_rgba(251,113,133,0.5)]' },
  ];

  return (
    <div className="w-full h-full relative bg-[#1c1f26] overflow-hidden">
       {isLoading && <div className="absolute top-0 inset-x-0 h-1 bg-blue-600 animate-pulse z-50"></div>}
       <PdfLoader 
           url={url} 
           beforeLoad={<div className="p-20 flex flex-col items-center justify-center text-slate-400 font-bold h-full"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>Loading Document...</div>}
           workerSrc="/pdf.worker.min.mjs"
           onError={(err) => { setIsLoading(false); console.error(err); }}
       >
          {(pdfDocument) => {
              if (isLoading) setIsLoading(false);
              return (
                  <PdfHighlighter
                      pdfDocument={pdfDocument}
                      enableAreaSelection={(event) => event.altKey}
                      onScrollChange={() => {}}
                      scrollRef={() => {}}
                      onSelectionFinished={(position, content, hideTipAndSelection, transformSelection) => (
                          <div className="bg-white dark:bg-[#161923] p-1.5 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] flex items-center gap-1 animate-in zoom-in-95 fade-in duration-200 z-[1001] border border-slate-200 dark:border-white/10 m-2 cursor-pointer">
                            {COLORS.map((color) => (
                              <button
                                key={color.id}
                                onClick={() => {
                                    onHighlight(content, position, color.id);
                                    hideTipAndSelection();
                                }}
                                className={`w-8 h-8 rounded-xl ${color.bg} ${color.glow} hover:scale-110 active:scale-90 transition-all flex items-center justify-center text-slate-900 shadow-sm`}
                                title={`Highlight in ${color.id}`}
                              >
                                <Highlighter size={14} />
                              </button>
                            ))}
                          </div>
                      )}
                      highlightTransform={(highlight, index, setTip, hideTip, viewportToScaled, screenshot, isScrolledTo) => {
                          const isTextHighlight = !Boolean(highlight.content?.image);
                          const colorClass = highlight.comment?.color === 'green' ? 'hl-green' : 
                                             highlight.comment?.color === 'blue' ? 'hl-blue' :
                                             highlight.comment?.color === 'pink' ? 'hl-pink' : 'hl-yellow';

                          // Numbering logic: find the index in original highlights to match sidebar
                          const highlightId = formattedHighlights.findIndex(h => h.id === highlight.id) + 1;

                          const commonBadge = (
                             <div className="absolute -top-3 -left-1 z-10 w-5 h-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-md flex items-center justify-center text-[10px] font-black shadow-lg border border-white/20">
                               #{highlightId}
                             </div>
                          );

                          const component = isTextHighlight ? (
                              <div className={`${colorClass} relative`}>
                                  {commonBadge}
                                  <Highlight isScrolledTo={isScrolledTo} position={highlight.position} comment={highlight.comment} />
                              </div>
                          ) : (
                              <div className={`${colorClass} relative`}>
                                  {commonBadge}
                                  <AreaHighlight isScrolledTo={isScrolledTo} highlight={highlight} onChange={() => {}} />
                              </div>
                          );

                          return (
                              <Popup popupContent={<></>} onMouseOver={() => {}} onMouseOut={hideTip} key={index} children={component} />
                          );
                      }}
                      highlights={formattedHighlights}
                  />
              );
          }}
       </PdfLoader>
       <style dangerouslySetInnerHTML={{ __html: `
            .PdfHighlighter { background-color: #1c1f26; }
            .Highlight__part { 
                opacity: 0.8 !important; 
                border-bottom: 2px solid rgba(0,0,0,0.2);
                box-shadow: 0 0 8px rgba(255,255,255,0.1);
            }
            .hl-yellow .Highlight__part { background-color: rgba(250, 204, 21, 1); }
            .hl-green .Highlight__part { background-color: rgba(52, 211, 153, 1); }
            .hl-blue .Highlight__part { background-color: rgba(56, 189, 248, 1); }
            .hl-pink .Highlight__part { background-color: rgba(251, 113, 133, 1); }
            
            .hl-yellow .AreaHighlight { border: 3px solid rgba(250, 204, 21, 1); background-color: rgba(250, 204, 21, 0.5); box-shadow: 0 0 15px rgba(250,204,21,0.3); }
            .hl-green .AreaHighlight { border: 3px solid rgba(52, 211, 153, 1); background-color: rgba(52, 211, 153, 0.5); box-shadow: 0 0 15px rgba(52,211,153,0.3); }
            .hl-blue .AreaHighlight { border: 3px solid rgba(56, 189, 248, 1); background-color: rgba(56, 189, 248, 0.5); box-shadow: 0 0 15px rgba(56,189,248,0.3); }
            .hl-pink .AreaHighlight { border: 3px solid rgba(251, 113, 133, 1); background-color: rgba(251, 113, 133, 0.5); box-shadow: 0 0 15px rgba(251,113,133,0.3); }
       `}} />
    </div>
  );
});
