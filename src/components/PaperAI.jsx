import React from 'react';
import { 
  X, MessageSquare, List, Send, Sparkles, BookOpen, Clock, Heart, Trash2 
} from 'lucide-react';
import { PdfViewer } from './PDF';
import { Latex } from './SharedComponents';

// Simple Markdown renderer for PaperAI chat messages
export function renderMarkdown(text) {
  if (!text) return '';
  let html = text
    // Escape HTML first
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Code blocks (```)
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-200 dark:bg-white/10 rounded-lg p-3 my-2 overflow-x-auto text-[11px] font-mono"><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-slate-200 dark:bg-white/10 px-1.5 py-0.5 rounded text-[11px] font-mono">$1</code>')
    // Headers
    .replace(/^### (.+)$/gm, '<h4 class="font-black text-sm text-slate-900 dark:text-white mt-3 mb-1">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="font-black text-[15px] text-slate-900 dark:text-white mt-4 mb-1.5">$1</h3>')
    .replace(/^# (.+)$/gm, '<h3 class="font-black text-[15px] text-slate-900 dark:text-white mt-4 mb-1.5">$1</h3>')
    // Bold + Italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-slate-900 dark:text-white">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Unordered lists
    .replace(/^[\-\*] (.+)$/gm, '<li class="ml-4 mb-0.5 list-disc">$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 mb-0.5 list-decimal">$1</li>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr class="border-slate-200 dark:border-white/10 my-3" />')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-violet-500 hover:underline">$1</a>')
    // LaTeX display math \[...\]
    .replace(/\\\[([\s\S]*?)\\\]/g, '<div class="latex-content my-2">\\\\[$1\\\\]</div>')
    // LaTeX inline math \(...\)
    .replace(/\\\((.+?)\\\)/g, '<span class="latex-content">\\\\($1\\\\)</span>')
    // Double newline -> paragraph break
    .replace(/\n\n/g, '</p><p class="mb-2">')
    // Single newline -> line break
    .replace(/\n/g, '<br/>');

  html = '<p class="mb-2">' + html + '</p>';
  html = html.replace(/<p class="mb-2"><\/p>/g, '');
  return html;
}

// Wrapper for AI messages to ensure MathJax runs
export const ChatMessageContent = ({ content }) => {
  const nodeRef = React.useRef(null);
  
  // Assuming the user of this component handles the MathJax script loading
  // or use the global one if it's already in the parent.
  
  React.useEffect(() => {
    if (window.MathJax?.typesetPromise && nodeRef.current) {
      window.MathJax.typesetPromise([nodeRef.current]).catch(err => console.error("MathJax Chat Error:", err));
    }
  }, [content]);

  return (
    <div 
      ref={nodeRef}
      className="prose-sm prose-slate dark:prose-invert max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:pl-4 [&_ol]:pl-4 [&_li]:mb-1 [&_code]:bg-slate-200 [&_code]:dark:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[11px] [&_strong]:text-slate-900 [&_strong]:dark:text-white"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
};

export function ResourceViewerModal({ 
  resource: initialResource, user, onClose, onLike, 
  highlights, setHighlights, chatMessages, setChatMessages, 
  chatInput, setChatInput, isChatLoading, setIsChatLoading, 
  activeChatId, setActiveChatId, sidebarTab, setSidebarTab,
  isDataLoading, setIsDataLoading
}) {
  const [resource, setResource] = React.useState(initialResource);
  const [pendingSelection, setPendingSelection] = React.useState(null);
  const hasLiked = resource.likes?.some(l => l.userId === user?.id);
  const likeCount = resource._count?.likes || 0;

  // Effects for fetching highlights and chat history would be here
  // But for now we assume they are passed as props or handled by the parent
  // to avoid duplication of state logic. 
  // In a real modular app, some of this state would be local to this modal.

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = { role: 'user', content: chatInput };
    setChatMessages([...chatMessages, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          chatId: activeChatId,
          message: chatInput,
          resourceId: resource.id,
          contextHighlights: highlights.map(h => h.text)
        })
      });
      const data = await res.json();
      if (data.success) {
        setChatMessages(prev => [...prev, data.reply]);
        if (!activeChatId) setActiveChatId(data.chatId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsChatLoading(false);
    }
  };

  const addHighlight = async (content, position, color) => {
    try {
      const res = await fetch('/api/resources/highlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          resourceId: resource.id,
          text: content.text,
          pageIndex: position.boundingRect.pageNumber - 1,
          color,
          position: JSON.stringify(position),
          content: JSON.stringify(content)
        })
      });
      const data = await res.json();
      if (data.success) {
        setHighlights([...highlights, data.highlight]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const internalOnLike = async () => {
    await onLike(resource.id);
    // Simple toggle for UI
    setResource(prev => ({
       ...prev,
       likes: hasLiked ? prev.likes.filter(l => l.userId !== user.id) : [...(prev.likes || []), { userId: user.id }],
       _count: { ...prev._count, likes: hasLiked ? (prev._count.likes - 1) : (prev._count.likes + 1) }
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0b0e14] flex flex-col md:flex-row overflow-hidden animate-in fade-in duration-300">
      {/* PDF Side */}
      <div className="flex-1 relative flex flex-col min-h-0">
        <div className="h-16 bg-[#161923] border-b border-white/5 flex items-center justify-between px-6 shrink-0">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-600/20"><BookOpen size={20} /></div>
              <div>
                 <h3 className="text-white font-black text-sm max-w-xs md:max-w-md truncate">{resource.title}</h3>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{resource.subject} • PDF Document</p>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <button 
                onClick={internalOnLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${hasLiked ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-white/5 text-slate-400 hover:text-white'}`}
              >
                 <Heart size={16} className={hasLiked ? 'fill-current' : ''} />
                 <span className="text-xs font-black">{likeCount}</span>
              </button>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors hover:rotate-90"><X size={24} /></button>
           </div>
        </div>

        <div className="flex-1 bg-[#1c1f26]">
           {resource.fileUrl ? (
             <PdfViewer 
                url={resource.fileUrl} 
                highlights={highlights} 
                onHighlight={addHighlight} 
             />
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-500">
                <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="font-bold uppercase tracking-widest text-[10px]">Preparing Document...</p>
             </div>
           )}
        </div>
      </div>

      {/* Sidebar Side */}
      <div className="w-full md:w-[400px] lg:w-[450px] bg-[#0b0e14] border-l border-white/5 flex flex-col shrink-0 relative z-10">
         <div className="flex border-b border-white/5">
            <button 
              onClick={() => setSidebarTab('chat')}
              className={`flex-1 flex items-center justify-center gap-2 py-5 text-xs font-black uppercase tracking-widest transition-all ${sidebarTab === 'chat' ? 'text-white border-b-2 border-violet-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
               <MessageSquare size={16} /> PaperAI Chat
            </button>
            <button 
              onClick={() => setSidebarTab('highlights')}
              className={`flex-1 flex items-center justify-center gap-2 py-5 text-xs font-black uppercase tracking-widest transition-all ${sidebarTab === 'highlights' ? 'text-white border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
               <List size={16} /> Highlights ({highlights.length})
            </button>
         </div>

         <div className="flex-1 overflow-y-auto custom-scrollbar-dark p-6">
            {sidebarTab === 'chat' ? (
               <div className="flex flex-col h-full">
                  <div className="flex-1 space-y-6 mb-20">
                     <div className="p-4 rounded-2xl bg-violet-600/10 border border-violet-500/20">
                        <div className="flex items-center gap-3 mb-2">
                           <Sparkles size={16} className="text-violet-500" />
                           <h4 className="text-xs font-black text-white uppercase tracking-widest">PaperAI Activated</h4>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">I've analyzed this document. Ask me anything about the concepts, formulas, or diagrams mentioned here.</p>
                     </div>

                     {chatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                           <div className={`max-w-[90%] rounded-[1.5rem] p-4 ${msg.role === 'user' ? 'bg-violet-600 text-white rounded-br-none' : 'bg-white/5 text-slate-300 rounded-bl-none border border-white/5'}`}>
                              <ChatMessageContent content={msg.content} />
                           </div>
                        </div>
                     ))}
                     {isChatLoading && (
                        <div className="flex justify-start">
                           <div className="bg-white/5 rounded-[1.5rem] rounded-bl-none p-4 flex gap-2 items-center border border-white/5">
                              <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" />
                              <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                              <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            ) : (
               <div className="space-y-4">
                  {highlights.length === 0 ? (
                     <div className="py-20 flex flex-col items-center justify-center text-slate-500">
                        <Highlighter size={40} className="opacity-10 mb-4" />
                        <p className="text-xs font-bold uppercase tracking-widest text-center">No highlights yet.<br/>Select text with mice or Alt + Drag to highlight.</p>
                     </div>
                  ) : (
                     highlights.map((h, i) => (
                        <div key={i} className="group p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-emerald-500/30 transition-all">
                           <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                 <span className="w-5 h-5 rounded bg-white text-slate-900 flex items-center justify-center text-[10px] font-black italic">#{i+1}</span>
                                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Page {h.pageIndex + 1}</span>
                              </div>
                              <button className="text-slate-500 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                           </div>
                           <p className="text-sm font-bold text-slate-200 leading-relaxed italic">"{h.text}"</p>
                           {h.comment?.text && <div className="mt-3 text-xs text-emerald-400 font-medium">AI Note: {h.comment.text}</div>}
                        </div>
                     ))
                  )}
               </div>
            )}
         </div>

         {sidebarTab === 'chat' && (
            <div className="p-4 bg-[#161923] border-t border-white/5">
               <form onSubmit={handleSendMessage} className="relative flex items-center bg-white/5 rounded-2xl border border-white/10 p-1 focus-within:border-violet-500/50 transition-all">
                  <input 
                     type="text" 
                     placeholder="Ask PaperAI..." 
                     value={chatInput}
                     onChange={(e) => setChatInput(e.target.value)}
                     className="flex-1 bg-transparent border-none outline-none text-white text-sm px-4 py-3 placeholder:text-slate-600"
                  />
                  <button type="submit" disabled={isChatLoading} className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-violet-600/20 disabled:opacity-50">
                     <Send size={18} />
                  </button>
               </form>
            </div>
         )}
      </div>
    </div>
  );
}
