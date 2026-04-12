import React, { useState, useMemo, useEffect } from 'react';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import { 
  Home, 
  BookOpen, 
  ClipboardList, 
  User, 
  Chrome, 
  Sun, 
  Moon,
  ChevronRight, 
  Star, 
  Trophy, 
  Search, 
  Book, 
  FileText, 
  Layers, 
  Calculator, 
  Bookmark, 
  UploadCloud, 
  Sparkles, 
  Zap, 
  Target, 
  Activity, 
  ChevronDown, 
  Info,
  ListChecks,
  Upload,
  FolderSearch,
  ArrowRight,
  ArrowLeft,
  Settings,
  Mail,
  ShieldCheck,
  LogOut,
  Bell,
  CheckCircle2,
  Clock,
  Circle,
  Users,
  MessageSquare,
  ThumbsUp,
  MessageCircle,
  Share2,
  TrendingUp,
  TrendingDown,
  Calendar,
  Flame,
  Award,
  Plus,
  Flag,
  HelpCircle,
  Lock,
  X,
  Building,
  GraduationCap,
  Filter,
  BarChart3,
  Trash2,
  ExternalLink,
  Highlighter,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  Send,
  RotateCcw,
  ThumbsDown,
  AlertTriangle,
  Coffee,
  Play,
  PlayCircle,
  Tv,
  MonitorPlay
} from 'lucide-react';
import { GlobalWorkerOptions, getDocument as pdfjsGetDocument } from "pdfjs-dist";
import { PolicyAcceptanceModal } from './Policies';


GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

import {
  PdfLoader,
  PdfHighlighter,
  Highlight,
  Popup,
  AreaHighlight,
} from "react-pdf-highlighter";
import "react-pdf-highlighter/dist/style.css";


// Unified Syllabus Dataset
const UNIFIED_SYLLABUS = {
  "Maths": [
    "Sets, Relations and Functions", "Complex Numbers and Quadratic Equations", "Matrices and Determinants", 
    "Permutations and Combinations", "Binomial Theorem", "Sequence and Series", 
    "Limit, Continuity and Differentiability", "Integral Calculus", "Differential Equations", 
    "Coordinate Geometry", "Three Dimensional Geometry", "Vector Algebra", 
    "Statistics and Probability", "Trigonometry", "Mathematical Reasoning"
  ],
  "Physics": [
    "Units and Measurements", "Kinematics", "Laws of Motion", "Work, Energy and Power", 
    "Rotational Motion", "Gravitation", "Properties of Solids and Liquids", "Thermodynamics", 
    "Kinetic Theory of Gases", "Oscillations and Waves", "Electrostatics", "Current Electricity", 
    "Magnetism", "Electromagnetic Induction and AC", "Electromagnetic Waves", "Optics", 
    "Dual Nature of Matter and Radiation", "Atoms and Nuclei", "Electronic Devices", "Experimental Skills"
  ],
  "Chemistry": [
    "Some Basic Concepts of Chemistry", "Atomic Structure", "Chemical Bonding and Molecular Structure", 
    "Chemical Thermodynamics", "Solutions", "Equilibrium", "Redox Reactions and Electrochemistry", 
    "Chemical Kinetics", "Classification of Elements and Periodicity", "p-Block Elements", 
    "d- and f-Block Elements", "Coordination Compounds", "Purification and Characterisation of Organic Compounds", 
    "Some Basic Principles of Organic Chemistry", "Hydrocarbons", "Organic Compounds Containing Halogens", 
    "Organic Compounds Containing Oxygen", "Organic Compounds Containing Nitrogen", "Biomolecules", 
    "Principles Related to Practical Chemistry"
  ],
  "Biology": [
    "Diversity in Living World", "Structural Organisation in Animals and Plants", "Cell Structure and Function", 
    "Plant Physiology", "Reproduction", "Genetics and Evolution", "Ecology and Environment", 
    "Human Physiology", "Biology and Human Welfare", "Biotechnology and Its Applications", "Experimental Skills"
  ]
};

const timeAgo = (dateStr) => {
  const date = new Date(dateStr);
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return interval + " years ago";
  if (interval === 1) return "1 year ago";
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return interval + " months ago";
  if (interval === 1) return "1 month ago";
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return interval + " days ago";
  if (interval === 1) return "1 day ago";
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return interval + " hrs ago";
  if (interval === 1) return "1 hr ago";
  interval = Math.floor(seconds / 60);
  if (interval > 1) return interval + " mins ago";
  if (interval === 1) return "1 min ago";
  return "Just now";
};

const getSubjectColor = (subject) => {
  switch(subject?.toUpperCase()) {
    case 'PHYSICS': return 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 'CHEMISTRY': return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    case 'MATHS': return 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400';
    case 'BIOLOGY': return 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400';
    default: return 'bg-slate-50 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400';
  }
};


// Custom hook for reliable MathJax loading & configuration
function useMathJax() {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (window.MathJax?.typesetPromise) { setReady(true); return; }

    window.MathJax = {
      tex: { inlineMath: [["\\(", "\\)"]], displayMath: [["\\[", "\\]"]] },
      startup: { ready() { window.MathJax.startup.defaultReady(); setReady(true); } },
    };

    if (!document.querySelector('script[src*="mathjax"]')) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-chtml.min.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  return ready;
}

const getStatusColor = (status, repliesCount) => {
  if (status === 'Resolved') return 'border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400';
  if (repliesCount > 0) return 'border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400';
  return 'border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400';
};

const getStatusText = (status, repliesCount) => {
  if (status === 'Resolved') return 'Resolved';
  if (repliesCount > 0) return `${repliesCount} Answer${repliesCount > 1 ? 's' : ''}`;
  return 'Unanswered';
};

// LaTeX Renderer Component with surgical wrapping to preserve spaces
const Latex = ({ children, inline = true }) => {
  const nodeRef = React.useRef(null);
  const mjReady = useMathJax();

  React.useEffect(() => {
    if (mjReady && nodeRef.current && window.MathJax?.typesetPromise) {
      window.MathJax.typesetPromise([nodeRef.current]).catch(err => console.error("MathJax error:", err));
    }
  }, [children, mjReady]);

  const content = String(children || "");
  
  if (!content.includes(" ") && /[\\]|[\^]|[_]|[{]|[}]|[$]|[=]|[\≠]|[>]|[<]|[\+\-\*\/]/.test(content)) {
    const wrapped = inline ? `\\(${content}\\)` : `\\[${content}\\]`;
    return <span ref={nodeRef} className="latex-content">{wrapped}</span>;
  }

  const parts = content.split(/(\s+)/);
  const elements = parts.map((part, i) => {
    if (part.trim() === "") return part;
    const isMath = /[\\]|[\^]|[_]|[{]|[}]|[$]|[=]|[\≠]|[>]|[<]|[\+\-\*\/]/.test(part) || 
                   (/[a-zA-Z]/.test(part) && /\d/.test(part));
    if (isMath) return inline ? `\\(${part}\\)` : `\\[${part}\\]`;
    return part;
  });

  return (
    <span ref={nodeRef} className="latex-content">
      {elements.join("")}
    </span>
  );
};


// Pomodoro Timer Component for Study Room
const PomodoroTimer = ({ children }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('Focus');

  const modes = {
    Focus: 25 * 60,
    Short: 5 * 60,
    Long: 15 * 60
  };

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleMode = (newMode) => {
    setMode(newMode);
    setTimeLeft(modes[newMode]);
    setIsActive(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / modes[mode]) * 100;

  return (
    <div className="bg-white/80 dark:bg-[#161923]/80 backdrop-blur-2xl rounded-[2.5rem] border border-slate-200 dark:border-white/10 p-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
      <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] opacity-10 ${mode === 'Focus' ? 'bg-orange-500' : 'bg-emerald-500'}`}></div>
      
      <div className="flex flex-col items-center">
        <div className="flex gap-3 mb-10 bg-slate-100 dark:bg-black/30 p-2 rounded-2xl relative z-10 w-fit">
            {Object.keys(modes).map(m => (
            <button 
                key={m} 
                onClick={() => toggleMode(m)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === m ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-white/10' : 'text-slate-400 hover:text-slate-600'}`}
            >
                {m}
            </button>
            ))}
        </div>

        <div className="relative w-64 h-64 mb-10 group">
            <svg className="w-full h-full transform -rotate-90 text-slate-100 dark:text-white/5">
            <circle strokeWidth="6" fill="transparent" r="90" cx="128" cy="128" stroke="currentColor" />
            <circle 
                className={`${mode === 'Focus' ? 'text-orange-500' : 'text-emerald-500'} stroke-current transition-all duration-300 ease-linear`} 
                strokeWidth="8" 
                strokeDasharray={`${2 * Math.PI * 90}`} 
                strokeDashoffset={`${(2 * Math.PI * 90) * (progress / 100)}`} 
                strokeLinecap="round" 
                fill="transparent" 
                r="90" 
                cx="128" 
                cy="128" 
            />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter transition-all group-hover:scale-110">{formatTime(timeLeft)}</span>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-2">{isActive ? 'Session Active' : 'Ready?'}</span>
            </div>
        </div>

        <div className="flex gap-4 relative z-10">
            <button 
            onClick={() => setIsActive(!isActive)}
            className={`px-12 py-4 rounded-2xl font-black text-sm tracking-widest uppercase transition-all shadow-xl ${isActive ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 active:scale-95' : 'bg-orange-600 text-white hover:bg-orange-700 hover:scale-105 active:scale-95 shadow-orange-500/20'}`}
            >
            {isActive ? 'Pause' : 'Start Focus'}
            </button>
            <button 
            onClick={() => { setIsActive(false); setTimeLeft(modes[mode]); }}
            className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all hover:rotate-45"
            >
            <RotateCcw size={20} />
            </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6 w-full md:w-auto h-full justify-center">
         {children}
      </div>
    </div>
  );
};

// Flashcard Component
const Flashcard = ({ question, answer }) => {
  const [flipped, setFlipped] = useState(false);
  
  return (
    <div 
        onClick={() => setFlipped(!flipped)}
        className="relative h-64 w-full perspective-1000 cursor-pointer group"
    >
        <div className={`relative w-full h-full transition-all duration-500 preserve-3d ${flipped ? 'rotate-y-180' : ''}`}>
            {/* Front */}
            <div className="absolute inset-0 backface-hidden bg-white dark:bg-[#161923] border border-slate-200 dark:border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-lg group-hover:border-blue-500 transition-colors">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4">Question</span>
                <p className="text-sm md:text-base font-bold text-slate-900 dark:text-white leading-relaxed">{question}</p>
                <div className="absolute bottom-6 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase flex items-center gap-2">
                    <RotateCcw size={10} /> Click to flip
                </div>
            </div>
            
            {/* Back */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-900 dark:bg-white rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl">
                <span className="text-[10px] font-black text-blue-400 dark:text-blue-500 uppercase tracking-[0.2em] mb-4">Core Concept</span>
                <p className="text-sm md:text-base font-bold text-white dark:text-slate-900 leading-relaxed">{answer}</p>
            </div>
        </div>
    </div>
  );
};

// YouTube Resources Component
const ChapterResources = ({ chapter, syllabusMode, videoCache, setVideoCache }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!chapter) return;
    
    // Check Cache first
    const cacheKey = `${syllabusMode}-${chapter}`;
    if (videoCache[cacheKey]) {
      setVideos(videoCache[cacheKey]);
      return;
    }

    const fetchVideos = async () => {
      setLoading(true);
      try {
        const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
        if (!API_KEY) {
           console.warn("YouTube API Key is missing in .env");
           return;
        }
        
        // Refined query for better educational results
        const query = `${chapter} ${syllabusMode.toUpperCase()} one shot lecture`;
        
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=8&q=${encodeURIComponent(query)}&type=video&videoEmbeddable=true&key=${API_KEY}`);
        const data = await res.json();
        
        if (data.error) {
           console.error("YouTube API Error:", data.error.message);
           setVideos([]);
           return;
        }
        
        const resultItems = data.items || [];
        setVideos(resultItems);
        
        // Update Cache
        setVideoCache(prev => ({ ...prev, [cacheKey]: resultItems }));

      } catch (err) {
        console.error("Youtube fetch error:", err);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [chapter, syllabusMode, videoCache, setVideoCache]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
            <MonitorPlay size={24} className="text-rose-500" /> Lectures for {chapter}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Curated One-Shots for rapid chapter coverage.</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1,2,3,4].map(n => <div key={n} className="h-48 bg-slate-100 dark:bg-white/5 rounded-3xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
          {videos.map(v => (
            <a 
              key={v.id.videoId} 
              href={`https://youtube.com/watch?v=${v.id.videoId}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden hover:border-rose-500/50 transition-all hover:shadow-xl dark:hover:shadow-rose-900/10"
            >
              <div className="aspect-video relative overflow-hidden">
                <img src={v.snippet.thumbnails.high.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={v.snippet.title} />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <PlayCircle size={48} className="text-white drop-shadow-2xl" />
                </div>
              </div>
              <div className="p-5">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-rose-500 transition-colors" dangerouslySetInnerHTML={{ __html: v.snippet.title }} />
                <div className="flex items-center gap-2 mt-3 text-[10px] font-black text-slate-500 bg-slate-100 dark:bg-white/5 w-fit px-2 py-1 rounded-md">
                   {v.snippet.channelTitle}
                </div>
              </div>
            </a>
          ))}
          {videos.length === 0 && !loading && (
             <div className="col-span-full py-10 text-center text-slate-500">
                <p>No videos found. Check your API key or search query.</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

// Custom PDF Viewer
const PdfViewer = React.memo(({ url, title, highlights = [], onHighlight }) => {
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

// Simple Markdown renderer for PaperAI chat messages
function renderMarkdown(text) {
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
const ChatMessageContent = ({ content }) => {
  const nodeRef = React.useRef(null);
  const mjReady = useMathJax();

  React.useEffect(() => {
    if (mjReady && nodeRef.current && window.MathJax?.typesetPromise) {
      window.MathJax.typesetPromise([nodeRef.current]).catch(err => console.error("MathJax Chat Error:", err));
    }
  }, [content, mjReady]);

  return (
    <div 
      ref={nodeRef}
      className="prose-sm prose-slate dark:prose-invert max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:pl-4 [&_ol]:pl-4 [&_li]:mb-1 [&_code]:bg-slate-200 [&_code]:dark:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[11px] [&_strong]:text-slate-900 [&_strong]:dark:text-white"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
};

// ---- Isolated Resource Viewer Modal ----
// Kept outside App so likes/state changes don't remount PdfViewer
function ResourceViewerModal({ resource: initialResource, user, onClose, onLike }) {
  const [resource, setResource] = React.useState(initialResource);
  const [isDataLoading, setIsDataLoading] = React.useState(!initialResource.fileUrl);
  const [highlights, setHighlights] = React.useState([]);
  const [pendingSelection, setPendingSelection] = React.useState(null);
  const hasLiked = resource.likes?.some(l => l.userId === user?.id);
  const likeCount = resource._count?.likes || 0;

  // PaperAI Chat State
  const [sidebarTab, setSidebarTab] = React.useState('chat'); // 'chat' | 'highlights'
  const [chatMessages, setChatMessages] = React.useState([]);
  const [chatInput, setChatInput] = React.useState('');
  const [isChatLoading, setIsChatLoading] = React.useState(false);
  const [activeChatId, setActiveChatId] = React.useState(null);
  const [contextNotification, setContextNotification] = React.useState(null);
  const chatEndRef = React.useRef(null);
  const chatInputRef = React.useRef(null);

  // Auto-scroll chat to bottom
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  // Performance: Lazy-load full resource data only when opened
  React.useEffect(() => {
    if (!resource.fileUrl && resource.id) {
        setIsDataLoading(true);
        fetch(`/api/resources/${resource.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setResource(data.resource);
                    setIsDataLoading(false);
                }
            })
            .catch(err => {
                console.error(err);
                setIsDataLoading(false);
            });
    }
  }, [resource.id]);

  React.useEffect(() => {
    if (resource.id && user?.id) {
        fetch(`/api/highlights/${user.id}?resourceId=${resource.id}`)
            .then(res => res.json())
            .then(data => { if (data.success) setHighlights(data.highlights); })
            .catch(console.error);
    }
  }, [resource.id, user?.id]);

  // Load existing chat on mount
  React.useEffect(() => {
    if (resource.id && user?.id) {
      fetch(`/api/chats/${user.id}/${resource.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.chats.length > 0) {
            const latestChat = data.chats[0];
            setActiveChatId(latestChat.id);
            // Load messages
            fetch(`/api/chats/${latestChat.id}/messages`)
              .then(r => r.json())
              .then(msgData => {
                if (msgData.success) setChatMessages(msgData.messages);
              });
          }
        })
        .catch(console.error);
    }
  }, [resource.id, user?.id]);

  const handleHighlight = async (content, position, color = 'yellow') => {
    try {
        const textToSave = content.text || 'Area selection (Image/Diagram)';
        const pageIndex = position.boundingRect.pageNumber - 1;

        const res = await fetch('/api/highlights', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                userId: user.id, 
                resourceId: resource.id, 
                text: textToSave, 
                pageIndex, 
                color,
                content,
                position
            })
        });
        const data = await res.json();
        if (data.success) {
            setHighlights([data.highlight, ...highlights]);
            setPendingSelection(null);
            // Show context notification in chat tab
            setContextNotification(`New highlight added: "${textToSave.substring(0, 60)}${textToSave.length > 60 ? '...' : ''}"`);
            setTimeout(() => setContextNotification(null), 5000);
        }
    } catch(err) {
        console.error(err);
    }
  };

  const deleteHighlight = async (id) => {
    try {
        const res = await fetch(`/api/highlights/${id}`, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ userId: user.id })
        });
        if ((await res.json()).success) {
            setHighlights(highlights.filter(h => h.id !== id));
        }
    } catch(err) {
        console.error(err);
    }
  };

  // PaperAI: Send message
  const sendChatMessage = async () => {
    const msg = chatInput.trim();
    if (!msg || isChatLoading) return;

    // Optimistic UI: add user message immediately
    const tempUserMsg = { id: 'temp-' + Date.now(), role: 'user', content: msg, createdAt: new Date().toISOString() };
    setChatMessages(prev => [...prev, tempUserMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          resourceId: resource.id,
          message: msg,
          chatId: activeChatId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveChatId(data.chatId);
        // Replace temp message with real ones from DB & add AI response
        setChatMessages(prev => {
          const withoutTemp = prev.filter(m => m.id !== tempUserMsg.id);
          return [...withoutTemp, { ...tempUserMsg, id: 'user-' + Date.now() }, data.message];
        });
      } else {
        // Show error as AI message
        setChatMessages(prev => [...prev, { id: 'err-' + Date.now(), role: 'assistant', content: `⚠️ ${data.message || 'Something went wrong.'}`, createdAt: new Date().toISOString() }]);
      }
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { id: 'err-' + Date.now(), role: 'assistant', content: '⚠️ Network error. Please try again.', createdAt: new Date().toISOString() }]);
    } finally {
      setIsChatLoading(false);
      chatInputRef.current?.focus();
    }
  };

  // Start new chat
  const startNewChat = () => {
    setActiveChatId(null);
    setChatMessages([]);
    setChatInput('');
    chatInputRef.current?.focus();
  };

  const COLORS = [
    { id: 'yellow', bg: 'bg-yellow-400', glow: 'shadow-[0_0_12px_rgba(250,204,21,0.5)]' },
    { id: 'green', bg: 'bg-emerald-400', glow: 'shadow-[0_0_12px_rgba(52,211,153,0.5)]' },
    { id: 'blue', bg: 'bg-sky-400', glow: 'shadow-[0_0_12px_rgba(56,189,248,0.5)]' },
    { id: 'pink', bg: 'bg-rose-400', glow: 'shadow-[0_0_12px_rgba(251,113,133,0.5)]' },
  ];

  return (
    <div className="fixed inset-0 z-[999] bg-[#f8fafc] dark:bg-[#0f1219] flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-[#161923] border-b border-slate-200 dark:border-white/10 px-4 md:px-6 py-3 md:py-4 flex items-center gap-3 shrink-0 shadow-sm z-10">
        <button onClick={onClose} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-black text-sm transition-all border border-slate-200 dark:border-white/10 shrink-0"><ArrowLeft size={18} /> <span className="hidden sm:inline">Back</span></button>
        
        <h2 className="flex-1 text-sm md:text-base lg:text-lg font-black text-slate-900 dark:text-white truncate text-center mx-2">{resource.title}</h2>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => onLike(resource.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs md:text-sm font-black transition-all border ${hasLiked ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10 hover:border-rose-300 hover:text-rose-500'}`}>
            <ThumbsUp size={15} className={hasLiked ? 'fill-rose-500' : ''} /> <span>{likeCount}</span>
          </button>
          <a href={resource.fileUrl} download={resource.title} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 text-white text-xs md:text-sm font-black hover:bg-blue-500 transition-colors shadow-sm"><UploadCloud size={15} /> <span className="hidden sm:inline">Download</span></a>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Viewer */}
        <div className="flex-1 overflow-hidden relative">
            {isDataLoading ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#0B0E14] text-slate-400 gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="font-black animate-pulse">Loading Document High-Fidelity Data...</p>
                </div>
            ) : resource.fileType === 'pdf' ? (
                <PdfViewer 
                    url={resource.fileUrl} 
                    title={resource.title} 
                    highlights={highlights} 
                    onHighlight={(content, position, color) => {
                        handleHighlight(content, position, color || 'yellow');
                    }}
                />
            ) : (
                <div className="w-full h-full overflow-auto flex items-center justify-center p-4 bg-[#0f1219]">
                    <img src={resource.fileUrl} alt={resource.title} className="max-w-full h-auto rounded-lg shadow-xl" />
                </div>
            )}
        </div>

        {/* ===== PaperAI Sidebar ===== */}
        <div className="w-[480px] bg-white/60 dark:bg-[#161923]/60 backdrop-blur-2xl border-l border-slate-200 dark:border-white/10 flex flex-col shrink-0 overflow-hidden relative shadow-2xl">
            {/* Subtle Inner Glow */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-white/20 dark:bg-white/5 pointer-events-none" />
            
            {/* Sidebar Tab Switcher */}
            <div className="flex border-b border-slate-100 dark:border-white/10 shrink-0 bg-white/40 dark:bg-black/20 backdrop-blur-md">
              <button
                onClick={() => setSidebarTab('chat')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative group ${
                  sidebarTab === 'chat'
                    ? 'text-violet-600 dark:text-violet-400 bg-violet-500/[0.03]'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <div className={`absolute inset-0 bg-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity ${sidebarTab === 'chat' ? 'opacity-100' : ''}`} />
                <img src="/paper_ai_logo.png" className={`w-5 h-5 object-contain ${sidebarTab === 'chat' ? 'animate-bounce' : ''}`} alt="PaperAI Logo" />
                <span className="relative z-10">PaperAI</span>
                {sidebarTab === 'chat' && <div className="absolute bottom-0 inset-x-6 h-[2px] bg-gradient-to-r from-violet-500 to-blue-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)]" />}
              </button>
              <button
                onClick={() => setSidebarTab('highlights')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative group ${
                  sidebarTab === 'highlights'
                    ? 'text-amber-600 dark:text-amber-400 bg-amber-500/[0.03]'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <div className={`absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity ${sidebarTab === 'highlights' ? 'opacity-100' : ''}`} />
                <Highlighter size={14} />
                <span className="relative z-10">Highlights</span>
                {highlights.length > 0 && <span className="relative z-10 text-[9px] font-black bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full ml-1 border border-amber-500/20">{highlights.length}</span>}
                {sidebarTab === 'highlights' && <div className="absolute bottom-0 inset-x-6 h-[2px] bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />}
              </button>
            </div>

            {/* ===== Chat Tab ===== */}
            {sidebarTab === 'chat' && (
              <>
                {/* Context Notification Banner */}
                {contextNotification && (
                  <div className="px-4 py-3 bg-gradient-to-r from-violet-500/10 to-blue-500/10 border-b border-violet-500/10 flex items-center gap-2.5 animate-in slide-in-from-top duration-300">
                    <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
                      <Sparkles size={12} className="text-violet-500" />
                    </div>
                    <p className="text-[10px] text-violet-600 dark:text-violet-400 font-bold leading-tight flex-1">PaperAI context updated! {contextNotification}</p>
                    <button onClick={() => setContextNotification(null)} className="text-violet-400 hover:text-violet-600 transition-colors"><X size={14} /></button>
                  </div>
                )}

                {/* Chat Header */}
                <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-white/20 dark:bg-white/[0.01]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center shadow-xl border border-slate-200 dark:border-white/10 overflow-hidden">
                      <img src="/paper_ai_logo.png" className="w-7 h-7 object-contain" alt="PaperAI" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider leading-none">PaperAI Assistant</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        {highlights.length} highlight{highlights.length !== 1 ? 's' : ''} sync'd
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={startNewChat}
                    title="New conversation"
                    className="w-9 h-9 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-violet-500 hover:border-violet-500/30 hover:scale-105 active:scale-95 transition-all shadow-sm"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                  {chatMessages.length === 0 && !isChatLoading && (
                    <div className="flex flex-col items-center justify-center py-16 px-8 text-center bg-violet-500/[0.01] rounded-[3rem] m-2 border border-violet-500/5">
                      <div className="w-24 h-24 rounded-[2.5rem] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mb-6 shadow-2xl relative group overflow-hidden">
                        <div className="absolute inset-0 bg-violet-500/5 blur-2xl rounded-full opacity-30 group-hover:opacity-50 transition-opacity" />
                        <img src="/paper_ai_logo.png" className="w-16 h-16 object-contain relative z-10" alt="PaperAI Logo" />
                      </div>
                      <h4 className="text-base font-black text-slate-900 dark:text-white mb-3 tracking-tight">Meet PaperAI ✨</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8 max-w-[280px]">
                        Your personal study companion. Ask me to summarize sections, solve highlights, or generate practice questions based on the PDF.
                      </p>
                      <div className="space-y-3 w-full max-w-[300px]">
                        {[
                          'Summarize this document',
                          highlights.length > 0 ? `Explain highlight #1` : 'What are the key concepts?',
                          'Give me practice questions',
                        ].map(suggestion => (
                          <button
                            key={suggestion}
                            onClick={() => { setChatInput(suggestion); chatInputRef.current?.focus(); }}
                            className="w-full text-left px-5 py-3.5 rounded-2xl bg-white/50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:border-violet-500/40 hover:text-violet-600 dark:hover:text-violet-400 hover:scale-[1.02] active:scale-95 transition-all group flex items-center justify-between shadow-sm"
                          >
                            <span>{suggestion}</span>
                            <Zap size={12} className="text-violet-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {chatMessages.map((msg, idx) => (
                    <div
                      key={msg.id || idx}
                      className={`flex gap-3 animate-in fade-in slide-in-from-bottom-3 duration-500 ${
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                      style={{ animationDelay: `${idx * 40}ms` }}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center shrink-0 mt-1 shadow-md border border-slate-200 dark:border-white/10 overflow-hidden">
                          <img src="/paper_ai_logo.png" className="w-6 h-6 object-contain" alt="PaperAI" />
                        </div>
                      )}
                      <div
                        className={`max-w-[88%] rounded-3xl px-5 py-4 text-[13px] leading-relaxed relative overflow-hidden group/msg ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-br from-violet-600 to-blue-700 text-white rounded-br-md shadow-2xl shadow-violet-900/20'
                            : 'bg-white/60 dark:bg-white/[0.04] backdrop-blur-xl text-slate-800 dark:text-slate-200 rounded-bl-md border border-slate-200/50 dark:border-white/5 shadow-xl'
                        }`}
                      >
                        {msg.role === 'user' && <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/msg:opacity-100 transition-opacity pointer-events-none" />}
                        {msg.role === 'assistant' ? (
                          <ChatMessageContent content={msg.content} />
                        ) : (
                          <span className="font-bold tracking-tight">{msg.content}</span>
                        )}
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-2xl bg-white/50 dark:bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 mt-1 border border-slate-200 dark:border-white/10 shadow-sm">
                          <User size={16} className="text-slate-500 dark:text-slate-400" />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isChatLoading && (
                    <div className="flex gap-2.5 items-start animate-in fade-in duration-300">
                      <div className="w-7 h-7 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center shrink-0 shadow-lg border border-slate-200 dark:border-white/10 overflow-hidden">
                        <img src="/paper_ai_logo.png" className="w-5 h-5 object-contain" alt="PaperAI" />
                      </div>
                      <div className="bg-slate-100 dark:bg-white/[0.06] rounded-2xl rounded-bl-md px-5 py-4 border border-slate-200 dark:border-white/5">
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-4 bg-white/40 dark:bg-black/20 backdrop-blur-xl border-t border-slate-200/50 dark:border-white/5 relative">
                  <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
                  
                  <div className="flex items-end gap-3 bg-white/80 dark:bg-white/[0.02] rounded-[1.75rem] border border-slate-200 dark:border-white/10 p-2 focus-within:border-violet-500/50 focus-within:ring-4 focus-within:ring-violet-500/5 transition-all shadow-lg">
                    <textarea
                      ref={chatInputRef}
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } }}
                      placeholder="Ask PaperAI anything..."
                      rows={1}
                      className="flex-1 bg-transparent text-[14px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none resize-none px-4 py-3 max-h-32 no-scrollbar"
                    />
                    <button
                      onClick={sendChatMessage}
                      disabled={!chatInput.trim() || isChatLoading}
                      className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 text-white flex items-center justify-center hover:shadow-[0_8px_30px_rgba(124,58,237,0.4)] hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none shrink-0"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-3 font-bold uppercase tracking-widest opacity-60 flex items-center justify-center gap-2">
                    <Sparkles size={10} className="text-violet-500" />
                    Powered by DeepSeek-V3
                  </p>
                </div>
              </>
            )}

            {/* ===== Highlights Tab ===== */}
            {sidebarTab === 'highlights' && (
              <>
                {/* Selection Context & Color Picker (Conditional) */}
                {pendingSelection && (
                    <div className="p-5 border-b border-slate-100 dark:border-white/10 bg-blue-500/5 animate-in slide-in-from-top duration-300">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded-md">New Selection</span>
                            <button onClick={() => setPendingSelection(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><X size={16} /></button>
                        </div>
                        <div className="bg-white dark:bg-[#0B0E14] p-3 rounded-xl border border-blue-500/20 mb-4 max-h-32 overflow-y-auto no-scrollbar">
                            <p className="text-xs italic text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                <Latex>{pendingSelection.content.text || "Area selection"}</Latex>
                            </p>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Apply Color:</span>
                            <div className="flex gap-2">
                                {COLORS.map((color) => (
                                    <button
                                        key={color.id}
                                        onClick={() => handleHighlight(pendingSelection.content, pendingSelection.position, color.id)}
                                        className={`w-8 h-8 rounded-xl ${color.bg} ${color.glow} hover:scale-110 active:scale-90 transition-all flex items-center justify-center text-slate-900`}
                                    >
                                        <Highlighter size={14} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="p-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                    <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest">Saved Highlights</h4>
                    <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full">{highlights.length}</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-slate-50/30 dark:bg-transparent">
                    {highlights.length === 0 && !pendingSelection && (
                        <div className="text-center py-16 px-6">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-white/5">
                                <Highlighter size={28} className="text-slate-300 dark:text-slate-600" />
                            </div>
                            <p className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-tighter">No annotations found</p>
                            <p className="text-[10px] text-slate-400 leading-relaxed">Select text in the PDF to start your active study session.</p>
                        </div>
                    )}
                    {highlights.map((h, idx) => (
                        <div key={h.id} className="bg-white dark:bg-[#0B0E14] p-4 rounded-2xl border border-slate-200 dark:border-white/5 group shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white text-[10px] font-black shadow-sm">#{idx + 1}</span>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                        h.color === 'green' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' :
                                        h.color === 'blue' ? 'text-sky-600 dark:text-sky-400 bg-sky-500/10' :
                                        h.color === 'pink' ? 'text-rose-600 dark:text-rose-400 bg-rose-500/10' :
                                        'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10'
                                    }`}>Page {h.pageIndex + 1}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button 
                                        onClick={() => { setSidebarTab('chat'); setChatInput(`Explain highlight #${idx + 1}`); setTimeout(() => chatInputRef.current?.focus(), 100); }}
                                        className="text-[9px] font-black text-violet-500 bg-violet-500/10 px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-violet-500/20 uppercase tracking-wider"
                                    >
                                        Explain
                                    </button>
                                    <button onClick={() => deleteHighlight(h.id)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={12} /></button>
                                </div>
                            </div>
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-4">
                                <Latex>{h.text}</Latex>
                            </p>
                        </div>
                    ))}
                </div>
                
                <div className="p-5 bg-white dark:bg-black/20 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-start gap-3 bg-violet-500/10 p-3 rounded-xl border border-violet-500/10">
                        <img src="/paper_ai_logo.png" className="w-5 h-5 object-contain shrink-0 mt-0.5" alt="PaperAI" />
                        <div>
                            <p className="text-[10px] text-violet-600 dark:text-violet-400 font-bold leading-normal uppercase tracking-wider mb-1">PaperAI Enabled</p>
                            <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Your highlights are automatically used as context for AI conversations.</p>
                        </div>
                    </div>
                </div>
              </>
            )}
        </div>
      </div>
    </div>
  );
}

// ---- Isolated Upload Modal Component ----
function UploadResourceModal({ onClose, onUpload, user }) {
  const [localFile, setLocalFile] = React.useState(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [category, setCategory] = React.useState('Study Notes');
  const [description, setDescription] = React.useState('');

  const CATEGORIES = [
    { id: 'Study Notes', title: 'Study Notes', sub: 'Handwritten/Typed', icon: <Book size={22} />, color: 'text-blue-500', bg: 'bg-blue-500/5', border: 'border-blue-500/20' },
    { id: 'DPP / Paper', title: 'DPP / Paper', sub: 'Practice Questions', icon: <FileText size={22} />, color: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' },
    { id: 'Formula Sheet', title: 'Formula Sheet', sub: 'Quick Revision', icon: <ClipboardList size={22} />, color: 'text-violet-500', bg: 'bg-violet-500/5', border: 'border-violet-500/20' },
    { id: 'Other', title: 'Other', sub: 'Misc Documents', icon: <Layers size={22} />, color: 'text-slate-400', bg: 'bg-slate-400/5', border: 'border-slate-400/20' },
  ];

  const handleSubmit = async () => {
    if (!localFile) return alert('Please select a file.');
    setIsUploading(true);
    try {
      await onUpload({ 
        title: title || localFile.name.split('.')[0], 
        subject: 'General', // Simplified for this view as per image
        tag: category, 
        description, 
        file: localFile 
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-[#fcfdfe] dark:bg-[#0f1219] w-full max-w-5xl rounded-[3rem] shadow-2xl border border-white/40 dark:border-white/5 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Section */}
        <div className="px-10 py-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-600">
                <UploadCloud size={24} />
             </div>
             <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Upload</h2>
          </div>
          <div className="flex items-center gap-4">
             <button className="w-12 h-12 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
                <Bell size={20} />
             </button>
             <div className="flex items-center gap-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 rounded-full">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                   <User size={16} className="text-slate-500" />
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{user?.name || 'Alex'}</span>
                <ChevronDown size={14} className="text-slate-400" />
             </div>
             <button onClick={onClose} className="w-12 h-12 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center hover:scale-105 transition-transform ml-2">
                <X size={20} />
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-10 pb-12 custom-scrollbar">
          {/* Hero Section */}
          <div className="text-center mb-12 py-4">
             <div className="w-16 h-16 bg-violet-500/10 rounded-3xl flex items-center justify-center text-violet-600 mx-auto mb-6 shadow-sm">
                <UploadCloud size={32} />
             </div>
             <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Contribute Materials</h1>
             <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed font-medium">
                Upload PDFs, Handwritten Notes, or OCR JSON files. Help the community and keep your materials organized in one place.
             </p>
          </div>

          <div className="space-y-10">
            {/* Category Selection */}
            <div>
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 ml-1">What are you uploading?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`p-6 rounded-[2rem] border-2 text-left transition-all group ${
                      category === cat.id 
                        ? 'bg-white dark:bg-white/5 border-violet-500 shadow-xl shadow-violet-500/10' 
                        : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-violet-500/30'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl ${cat.bg} ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      {cat.icon}
                    </div>
                    <h4 className="font-black text-slate-900 dark:text-white text-sm mb-1">{cat.title}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{cat.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Area */}
            <div className={`relative rounded-[3rem] border-2 border-dashed transition-all p-12 text-center group ${
              localFile ? 'border-violet-500 bg-violet-500/[0.02]' : 'border-slate-200 dark:border-white/10 hover:border-violet-500/40 bg-slate-50/50 dark:bg-white/[0.01]'
            }`}>
              <input
                type="file"
                accept=".pdf,image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={e => setLocalFile(e.target.files[0])}
              />
              
              <div className="max-w-xs mx-auto flex flex-col items-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all ${
                  localFile ? 'bg-violet-500 text-white shadow-xl shadow-violet-500/20' : 'bg-white dark:bg-white/5 text-slate-300 group-hover:text-violet-500 shadow-sm'
                }`}>
                  <UploadCloud size={32} />
                </div>
                
                {localFile ? (
                  <div className="animate-in zoom-in-95 duration-300">
                    <p className="text-lg font-black text-slate-900 dark:text-white truncate max-w-full px-4 mb-2">{localFile.name}</p>
                    <p className="text-xs font-bold text-violet-500 uppercase tracking-widest">Click to change file</p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Drop & drop files here</h3>
                    <p className="text-sm text-slate-500 font-medium">Supports PDF, PNG, JPG, and Markdown</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Details */}
            {localFile && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-3">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Document Title</label>
                   <input 
                      type="text" 
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder={localFile.name.split('.')[0]}
                      className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-violet-500 transition-all font-bold text-slate-900 dark:text-white"
                   />
                </div>
                <div className="space-y-3">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Description (Optional)</label>
                   <input 
                      type="text" 
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Add a short summary..."
                      className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-violet-500 transition-all font-bold text-slate-900 dark:text-white"
                   />
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleSubmit}
                disabled={!localFile || isUploading}
                className="group relative px-12 py-5 rounded-3xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed overflow-hidden"
              >
                <div className="relative z-10 flex items-center gap-3">
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mb-1" />
                      <span className="text-[9px] font-black opacity-60 tracking-tighter">AI SCANNING...</span>
                    </div>
                  ) : <Zap size={20} className="text-violet-500" />}
                  {isUploading ? '' : 'CONFIRM UPLOAD'}
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Edit Resource Modal Component ----
function EditResourceModal({ resource, onClose, onUpdate, isUpdating }) {
  const [title, setTitle] = React.useState(resource?.title || '');
  const [description, setDescription] = React.useState(resource?.description || '');
  const [subject, setSubject] = React.useState(resource?.subject || 'Physics');
  const [tag, setTag] = React.useState(resource?.tag || 'Study Notes');

  const subjects = ['Maths', 'Physics', 'Chemistry', 'Biology'];
  const categories = ['Study Notes', 'DPP / Paper', 'Formula Sheet', 'Other'];

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(resource.id, { title, description, subject, tag });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#0f1219] w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-white/5">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20"><Settings size={18} /></div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Edit Resource</h2>
           </div>
           <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"><X size={20} className="text-slate-400" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Document Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 outline-none focus:border-emerald-500 transition-all font-bold text-slate-900 dark:text-white" />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows="3" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 outline-none focus:border-emerald-500 transition-all font-bold text-slate-900 dark:text-white resize-none" />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                 <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3.5 outline-none focus:border-emerald-500 transition-all font-bold text-slate-900 dark:text-white">
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                 <select value={tag} onChange={e => setTag(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3.5 outline-none focus:border-emerald-500 transition-all font-bold text-slate-900 dark:text-white">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
              </div>
           </div>
           
           <div className="pt-4">
              <button disabled={isUpdating} type="submit" className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                 {isUpdating ? <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin" /> : <Save size={18} />}
                 {isUpdating ? 'SAVING CHANGES...' : 'SAVE CHANGES'}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
}

function ReportResourceModal({ resource, onClose, onReport }) {
  const [reason, setReason] = React.useState('Inappropriate Content');
  const [details, setDetails] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const REASONS = [
    'Inappropriate Content',
    'Incorrect Information',
    'Copyright Violation',
    'Spam / Low Quality',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onReport(resource.id, reason, details);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#0f1219] w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/5 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-amber-500/5">
           <div className="flex items-center gap-3 text-amber-600 dark:text-amber-500">
              <AlertTriangle size={24} />
              <h2 className="text-xl font-black tracking-tight">Report Resource</h2>
           </div>
           <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"><X size={20} className="text-slate-400" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
           <div className="space-y-4">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Reporting: <span className="text-slate-900 dark:text-white font-bold">{resource?.title}</span></p>
              
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason</label>
                 <select value={reason} onChange={e => setReason(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3.5 outline-none focus:border-amber-500 transition-all font-bold text-slate-900 dark:text-white">
                    {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                 </select>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Additional Details</label>
                 <textarea value={details} onChange={e => setDetails(e.target.value)} placeholder="Tell us more about the issue..." rows="3" className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 outline-none focus:border-amber-500 transition-all font-bold text-slate-900 dark:text-white resize-none placeholder:text-slate-400" />
              </div>
           </div>
           
           <div className="flex gap-4 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-4 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-all">Cancel</button>
              <button disabled={isSubmitting} type="submit" className="flex-[2] py-4 rounded-2xl bg-amber-600 text-white font-black text-sm shadow-xl shadow-amber-600/20 hover:bg-amber-700 transition-all flex items-center justify-center gap-2">
                 {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Flag size={18} />}
                 {isSubmitting ? 'SUBMITTING...' : 'SUBMIT REPORT'}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
}

// ---- Sub-components moved outside to prevent remounting & focus loss ----

const PdfThumbnail = React.memo(({ fileUrl, fileType }) => {
  const canvasRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const renderingRef = React.useRef(false);
  const [status, setStatus] = React.useState('idle');

  // Trigger loading via IntersectionObserver or fallback timeout
  React.useEffect(() => {
    if (fileType !== 'pdf' || !fileUrl) return;
    let triggered = false;
    
    const trigger = () => {
      if (!triggered) {
        triggered = true;
        setStatus(prev => prev === 'idle' ? 'loading' : prev);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => { 
        if (entry.isIntersecting) { 
          trigger();
          observer.disconnect(); 
        } 
      },
      { threshold: 0, rootMargin: '200px' }
    );
    
    if (containerRef.current) observer.observe(containerRef.current);
    
    const timer = setTimeout(trigger, 500);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [fileUrl, fileType]);

  // Render the PDF page to canvas
  React.useEffect(() => {
    if (status !== 'loading' || fileType !== 'pdf' || renderingRef.current) return;
    renderingRef.current = true;
    let cancelled = false;
    
    const render = async () => {
      try {
        const docParams = {
          cMapUrl: 'https://unpkg.com/pdfjs-dist@4.4.168/cmaps/',
          cMapPacked: true,
        };

        if (fileUrl.startsWith('data:')) {
          const base64 = fileUrl.split(',')[1];
          const binaryStr = atob(base64);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          docParams.data = bytes;
        } else {
          docParams.url = fileUrl;
        }

        const loadingTask = pdfjsGetDocument(docParams);
        const pdf = await loadingTask.promise;
        if (cancelled) { pdf.destroy(); return; }
        
        const page = await pdf.getPage(1);
        if (cancelled) { pdf.destroy(); return; }
        
        const scale = 0.6;
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas || cancelled) { pdf.destroy(); return; }
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({ 
          canvasContext: canvas.getContext('2d'), 
          viewport 
        }).promise;
        
        if (!cancelled) setStatus('loaded');
        pdf.destroy();
      } catch (err) {
        console.error("PDF Preview Error:", err);
        if (!cancelled) setStatus('error');
      } finally {
        renderingRef.current = false;
      }
    };
    
    render();
    return () => { cancelled = true; };
  }, [status, fileUrl, fileType]);

  if (fileType !== 'pdf') {
    return <img src={fileUrl} alt="preview" className="w-full h-full object-cover" />;
  }

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-[#0B0E14]">
      <canvas ref={canvasRef} className={`w-full h-full object-cover ${status === 'loaded' ? 'block' : 'hidden'}`} />
      {status !== 'loaded' && (
        <div className="flex flex-col items-center gap-2">
          {status === 'loading' ? (
            <div className="w-5 h-5 border-2 border-slate-200 dark:border-slate-800 border-t-blue-500 rounded-full animate-spin" />
          ) : (
            <div className="flex flex-col items-center gap-1.5 opacity-20">
              <FileText size={28} className="text-slate-400" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">No Preview</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

const ResourceCard = ({ res, user, handleLikeResource, handleDislikeResource, setReportingResource, openResource }) => {
  const hasLiked = res.likes?.some(l => l.userId === user?.id);
  const hasDisliked = res.dislikes?.some(d => d.userId === user?.id);
  return (
    <div 
      onClick={(e) => { if(e.target.closest('button') || e.target.closest('a')) return; openResource(res); }} 
      className="bg-white/80 dark:bg-[#161923]/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm hover:border-blue-500 transition-all group cursor-pointer overflow-hidden flex flex-col"
    >
      <div className="aspect-[3/1] w-full bg-slate-100 dark:bg-[#0B0E14] relative overflow-hidden flex items-center justify-center border-b border-slate-100 dark:border-white/5">
        <PdfThumbnail fileUrl={res.fileUrl} fileType={res.fileType} />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-white shadow-lg ${res.fileType === 'pdf' ? 'bg-rose-500' : 'bg-blue-500'}`}>
            {res.fileType === 'pdf' ? 'PDF' : 'IMG'}
          </span>
        </div>
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className={`p-2 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 text-white`}>
            <ZoomIn size={16} />
          </div>
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${getSubjectColor(res.subject)}`}>
            {res.subject}
          </span>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{timeAgo(res.createdAt)}</span>
        </div>
        <h4 className="font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-500 transition-colors line-clamp-1">{res.title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-1">{res.description}</p>
        
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold border border-white/20">
              {res.user.picture ? <img src={res.user.picture} className="w-full h-full rounded-full" /> : res.user.name[0]}
            </div>
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{res.user.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-50 dark:bg-white/5 rounded-full px-2 py-1 border border-slate-200 dark:border-white/10">
              <button onClick={() => handleLikeResource(res.id)} className={`p-1 flex items-center gap-1 text-[11px] font-black transition-all ${hasLiked ? 'text-blue-500' : 'text-slate-400 hover:text-blue-500 hover:scale-110 active:scale-90'}`}>
                <ThumbsUp size={14} className={hasLiked ? 'fill-blue-500' : ''} /> {res._count?.likes || 0}
              </button>
              <div className="w-[1px] h-3 bg-slate-200 dark:bg-white/10 mx-1" />
              <button onClick={() => handleDislikeResource(res.id)} className={`p-1 flex items-center gap-1 text-[11px] font-black transition-all ${hasDisliked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500 hover:scale-110 active:scale-90'}`}>
                <ThumbsDown size={14} className={hasDisliked ? 'fill-rose-500' : ''} /> {res._count?.dislikes || 0}
              </button>
            </div>
            
            <button onClick={() => setReportingResource(res)} className="p-2 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 transition-colors" title="Report Resource">
               <AlertTriangle size={14} />
            </button>

            <a href={res.fileUrl} download={res.title} className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
              <UploadCloud size={16} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResourcesView = ({ 
    syllabusMode, modeSubjects, searchQuery, setSearchQuery, dbResources, resourceFilter, 
    setResourceFilter, resourceTab, setResourceTab, setShowUploadModal, openResource, 
    user, handleLikeResource, handleDislikeResource, setReportingResource, setActiveTab,
    setEditingResource, handleDeleteResource
}) => {
    const availableSubjects = ['All', ...modeSubjects[syllabusMode]];
    
    // Local state for smooth typing (fixes lag by avoiding full App re-renders on each key)
    const [localQuery, setLocalQuery] = React.useState(searchQuery);
    
    // Debounce syncing to the global searchQuery for filtering
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(localQuery);
        }, 150); // Fast enough for UX, slow enough to batch re-renders
        return () => clearTimeout(timer);
    }, [localQuery]);

    return (
      <section className="animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <h2 className="font-black text-2xl text-slate-900 dark:text-white tracking-tight">Study Resources</h2>
            <div className="px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 flex items-center gap-1.5">
                <Sparkles size={10} className="text-violet-500" />
                <span className="text-[9px] font-black text-violet-500 uppercase tracking-widest">AI Enhanced</span>
            </div>
          </div>
          <button className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest hover:text-blue-500 dark:hover:text-blue-400 transition bg-blue-500/5 px-3 py-1.5 rounded-lg border border-blue-500/10">View All</button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 font-medium">Search through {dbResources.length}+ precision-indexed educational materials.</p>
        
        <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="flex items-center flex-1 bg-white/40 dark:bg-[#161923]/40 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 shadow-xl shadow-black/5 focus-within:border-violet-500/50 focus-within:ring-4 focus-within:ring-violet-500/5 transition-all group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-blue-500/5 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                <Search size={20} className="text-slate-400 group-focus-within:text-violet-500 transition-colors relative z-10" />
                <input 
                    type="text" 
                    placeholder="Search resources or ask AI a question..." 
                    value={localQuery}
                    onChange={(e) => setLocalQuery(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400/60 ml-4 font-bold text-[15px] relative z-10" 
                />
                <div className="flex items-center gap-2 relative z-10">
                    {localQuery && (
                        <button 
                            onClick={() => setLocalQuery('')}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                    <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1" />
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white text-[10px] font-black uppercase tracking-wider hover:shadow-lg hover:shadow-violet-500/20 transition-all active:scale-95 group/btn">
                        <Sparkles size={12} className="group-hover/btn:animate-pulse" />
                        Smart Search
                    </button>
                </div>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 items-center">
                {availableSubjects.map(sub => (
                    <button 
                        key={sub} 
                        onClick={() => setResourceFilter(sub)}
                        className={`px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${resourceFilter === sub ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900 shadow-xl' : 'bg-white/40 dark:bg-[#161923]/40 backdrop-blur-md border-slate-200 dark:border-white/10 text-slate-400 hover:border-violet-500/30 hover:text-slate-600 dark:hover:text-slate-200'}`}
                    >
                        {sub}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex gap-6 border-b border-slate-200 dark:border-white/10 mb-6">
          <button onClick={() => setResourceTab('Quick Access')} className={`pb-2 text-sm font-bold transition-all ${resourceTab === 'Quick Access' ? 'border-b-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-500' : 'border-b-2 border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Quick Access</button>
          <button onClick={() => setResourceTab('Trending')} className={`pb-2 text-sm font-bold transition-all ${resourceTab === 'Trending' ? 'border-b-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-500' : 'border-b-2 border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Trending</button>
          <button onClick={() => setResourceTab('Browse')} className={`pb-2 text-sm font-bold transition-all ${resourceTab === 'Browse' ? 'border-b-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-500' : 'border-b-2 border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Browse Resources</button>
          <button onClick={() => setResourceTab('My Uploads')} className={`pb-2 text-sm font-bold transition-all ${resourceTab === 'My Uploads' ? 'border-b-2 border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-500' : 'border-b-2 border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>My Uploads</button>
          <button onClick={() => setResourceTab('Upload')} className={`pb-2 text-sm font-bold transition-all ${resourceTab === 'Upload' ? 'border-b-2 border-violet-600 dark:border-violet-500 text-violet-600 dark:text-violet-500' : 'border-b-2 border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Upload</button>
        </div>

        {resourceTab === 'Quick Access' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-500">
            <div 
              onClick={() => setShowUploadModal(true)}
              className="bg-violet-600/5 dark:bg-violet-600/10 border-2 border-dashed border-violet-500/30 rounded-[2rem] p-8 shadow-sm hover:bg-violet-600/10 transition-all cursor-pointer flex flex-col items-center justify-center text-center group min-h-[280px]"
            >
              <div className="w-16 h-16 rounded-3xl bg-violet-600 text-white shadow-xl shadow-violet-600/20 group-hover:scale-110 transition-transform flex items-center justify-center mb-5">
                <UploadCloud size={28} />
              </div>
              <h4 className="font-black text-slate-900 dark:text-white text-lg mb-2">Upload Resource</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[140px] leading-relaxed">Share your study materials with the community</p>
            </div>

            {[
              { id: 'dpp-paper', title: 'DPP / Paper', desc: 'Practice Questions', icon: <FileText size={80} />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { id: 'formula-sheet', title: 'Formula Sheet', desc: 'Quick Revision', icon: <ClipboardList size={80} />, color: 'text-violet-500', bg: 'bg-violet-50' },
              { id: 'other-misc', title: 'Other', desc: 'Misc Documents', icon: <Layers size={80} />, color: 'text-slate-400', bg: 'bg-slate-50' },
            ].map((item) => (
              <div 
                key={item.id}
                onClick={() => openResource(dbResources.find(r => r.title.includes(item.title)) || dbResources[0])}
                className="bg-white/80 dark:bg-[#161923]/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-sm hover:border-violet-500/40 transition-all group cursor-pointer overflow-hidden flex flex-col min-h-[280px]"
              >
                <div className="aspect-[4/5] w-full bg-slate-50 dark:bg-[#0B0E14] relative overflow-hidden flex items-center justify-center border-b border-slate-100 dark:border-white/5">
                   <div className={`absolute inset-0 flex items-center justify-center opacity-10 group-hover:scale-110 transition-transform ${item.color}`}>
                      {item.icon}
                   </div>
                   <div className="z-10 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.title.split(' ')[0]}</span>
                   </div>
                </div>
                <div className="p-6">
                  <h4 className="font-black text-slate-900 dark:text-white text-sm mb-1 group-hover:text-violet-500 transition-colors">{item.title}</h4>
                  <p className="text-[11px] text-slate-500/80 leading-relaxed line-clamp-2">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {resourceTab === 'My Uploads' && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center gap-3 mb-8 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl w-fit">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20"><Layers size={20} /></div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-sm">Managing Your Contributions</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Only you can see and edit these documents</p>
                </div>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {dbResources.filter(r => r.userId === user?.id).length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[3rem]">
                     <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center mb-4"><UploadCloud size={32} /></div>
                     <p className="font-bold text-slate-500 dark:text-slate-400">You haven't uploaded anything yet.</p>
                     <button onClick={() => setResourceTab('Upload')} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition">Start Sharing</button>
                  </div>
               ) : (
                  dbResources.filter(r => r.userId === user?.id).map(res => (
                    <div key={res.id} className="relative group">
                       <ResourceCard res={res} user={user} handleLikeResource={handleLikeResource} handleDislikeResource={handleDislikeResource} setReportingResource={setReportingResource} openResource={openResource} />
                       <div className="absolute top-3 left-3 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); setEditingResource(res); }} className="w-8 h-8 rounded-lg bg-emerald-500 text-white shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"><Settings size={14} /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteResource(res.id); }} className="w-8 h-8 rounded-lg bg-rose-500 text-white shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"><Trash2 size={14} /></button>
                       </div>
                    </div>
                  ))
               )}
             </div>
           </div>
        )}

        {resourceTab === 'Trending' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
            {dbResources
              .slice()
              .sort((a, b) => (b._count?.likes || 0) - (a._count?.likes || 0))
              .filter(r => 
                (resourceFilter === 'All' || r.subject === resourceFilter) &&
                (r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                 r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 r.subject.toLowerCase().includes(searchQuery.toLowerCase()))
              ).slice(0, 6).map((res) => (
                <ResourceCard key={res.id} res={res} user={user} handleLikeResource={handleLikeResource} handleDislikeResource={handleDislikeResource} setReportingResource={setReportingResource} openResource={openResource} />
              ))
            }
          </div>
        )}

        {resourceTab === 'Browse' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
            {dbResources.filter(r => 
                (resourceFilter === 'All' || r.subject === resourceFilter) &&
                (r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                 r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 r.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 (r.tag && r.tag.toLowerCase().includes(searchQuery.toLowerCase())))
            ).length === 0 ? (
                <div className="col-span-full py-20 text-center text-slate-500">
                    <FolderSearch size={48} className="mx-auto mb-6 text-violet-500 opacity-20" />
                    <p className="font-bold text-slate-900 dark:text-white mb-2 ml-4">No documents found matching "{searchQuery}"</p>
                    <p className="text-xs text-slate-500 mb-8 ml-4">Try searching for a specific subject or topic.</p>
                    <button 
                        onClick={() => setActiveTab('PaperAI')}
                        className="flex items-center gap-3 px-8 py-4 rounded-[2.5rem] bg-gradient-to-br from-violet-600 to-blue-600 text-white font-black text-[13px] uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all ml-4"
                    >
                        <img src="/paper_ai_logo.png" className="w-5 h-5 object-contain" alt="PaperAI Logo" />
                        Ask PaperAI instead
                    </button>
                </div>
            ) : (
                dbResources.filter(r => 
                    (resourceFilter === 'All' || r.subject === resourceFilter) &&
                    (r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                     r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                     r.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                     (r.tag && r.tag.toLowerCase().includes(searchQuery.toLowerCase())))
                ).map((res) => (
                    <ResourceCard key={res.id} res={res} user={user} handleLikeResource={handleLikeResource} handleDislikeResource={handleDislikeResource} setReportingResource={setReportingResource} openResource={openResource} />
                ))
            )}
          </div>
        )}

        {resourceTab === 'Upload' && (
          <div className="bg-white/80 dark:bg-[#161923]/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[3rem] p-10 animate-in slide-in-from-bottom-4 duration-500">
             <div className="text-center mb-12">
                <div className="w-16 h-16 bg-violet-500/10 rounded-3xl flex items-center justify-center text-violet-600 mx-auto mb-6 shadow-sm">
                   <UploadCloud size={32} />
                </div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Contribute Materials</h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed font-medium">
                   Upload PDFs, Handwritten Notes, or OCR JSON files. Help the community and keep your materials organized in one place.
                </p>
             </div>

             <div className="space-y-12">
                <div>
                   <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 ml-1">What are you uploading?</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { id: 'Study Notes', title: 'Study Notes', sub: 'Handwritten/Typed', icon: <Book size={22} />, color: 'text-blue-500', bg: 'bg-blue-500/5', border: 'border-blue-500/20' },
                        { id: 'DPP / Paper', title: 'DPP / Paper', sub: 'Practice Questions', icon: <FileText size={22} />, color: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' },
                        { id: 'Formula Sheet', title: 'Formula Sheet', sub: 'Quick Revision', icon: <ClipboardList size={22} />, color: 'text-violet-500', bg: 'bg-violet-500/5', border: 'border-violet-500/20' },
                        { id: 'Other', title: 'Other', sub: 'Misc Documents', icon: <Layers size={22} />, color: 'text-slate-400', bg: 'bg-slate-400/5', border: 'border-slate-400/20' },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          className="p-6 rounded-[2rem] border-2 bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-violet-500/30 text-left transition-all group"
                          onClick={() => { setShowUploadModal(true); }}
                        >
                          <div className={`w-12 h-12 rounded-2xl ${cat.bg} ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            {cat.icon}
                          </div>
                          <h4 className="font-black text-slate-900 dark:text-white text-sm mb-1">{cat.title}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{cat.sub}</p>
                        </button>
                      ))}
                   </div>
                </div>

                <div 
                   onClick={() => setShowUploadModal(true)}
                   className="relative rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-violet-500/40 bg-slate-50/50 dark:bg-white/[0.01] transition-all p-16 text-center group cursor-pointer"
                >
                   <div className="max-w-xs mx-auto flex flex-col items-center">
                      <div className="w-20 h-20 rounded-full bg-white dark:bg-white/5 text-slate-300 group-hover:text-violet-500 flex items-center justify-center mb-6 transition-all shadow-sm">
                         <UploadCloud size={32} />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Drop & drop files here</h3>
                      <p className="text-sm text-slate-500 font-medium">Supports PDF, PNG, JPG, and Markdown</p>
                   </div>
                </div>
             </div>
          </div>
        )}
      </section>
    );
};

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('paperbase_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return !!localStorage.getItem('paperbase_user');
    } catch {
      return false;
    }
  });
  const [authPage, setAuthPage] = useState('login');
  const [isExamActive, setIsExamActive] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(() => {
    // Check local storage first for speed, then sync from user object
    const local = localStorage.getItem('paperbase_policies_accepted') === 'true';
    if (local) return true;
    const savedUser = localStorage.getItem('paperbase_user');
    if (savedUser) {
        return JSON.parse(savedUser).policiesAccepted === true;
    }
    return false;
  });
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [pendingResource, setPendingResource] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('Home');
  const [homeTab, setHomeTab] = useState('All');
  const [resourceTab, setResourceTab] = useState('Quick Access');
  const [doubtTab, setDoubtTab] = useState('All');
  const [examTemplate, setExamTemplate] = useState('custom');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedExamForPYQ, setSelectedExamForPYQ] = useState(null);
  const [pyqSubject, setPyqSubject] = useState('Physics');
  const [selectedDay, setSelectedDay] = useState(new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date()));
  const [syllabusMode, setSyllabusMode] = useState('jee'); 
  const [activeSubject, setActiveSubject] = useState('Physics');
  const [syllabusData, setSyllabusData] = useState(null); // From DB
  const [syllabusProgress, setSyllabusProgress] = useState(() => {
    try {
      const savedProgress = localStorage.getItem('paperbase_progress');
      return savedProgress ? JSON.parse(savedProgress) : {};
    } catch {
      return {};
    }
  }); 

  useEffect(() => {
    localStorage.setItem('paperbase_progress', JSON.stringify(syllabusProgress));
  }, [syllabusProgress]);

  // Resource Sharing State
  const [dbResources, setDbResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [resourceFilter, setResourceFilter] = useState('All');
  const [isUploadingResource, setIsUploadingResource] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [resourceFile, setResourceFile] = useState(null);
  const [reportingResource, setReportingResource] = useState(null);
  const [editingResource, setEditingResource] = useState(null);
  const [isUpdatingResource, setIsUpdatingResource] = useState(false);

  // Compute current syllabus (DB version or default)
  // Simplified Syllabus
  const CURRENT_SYLLABUS = UNIFIED_SYLLABUS;

  const getChapterId = (subject, index) => {
    // Obsolete in simplified model
    return `${subject}-${index}`;
  };

  // Doubt Forum State
  const [doubts, setDoubts] = useState([]);
  const [showAskDoubtModal, setShowAskDoubtModal] = useState(false);
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [isSubmittingDoubt, setIsSubmittingDoubt] = useState(false); 
  const [doubtImage, setDoubtImage] = useState(null); 

  // Timetable & Goals State
  const [timetableTasks, setTimetableTasks] = useState([]);
  const [timetableSchedules, setTimetableSchedules] = useState([]);
  const [timetableStats, setTimetableStats] = useState({ streak: 0, focusTime: 0 });
  const [isGoalsLoading, setIsGoalsLoading] = useState(true);
  const [highlights, setHighlights] = useState([]);
  const [noteTab, setNoteTab] = useState('My Notes');
  const [studyChapter, setStudyChapter] = useState(UNIFIED_SYLLABUS['Maths'][0]);
  const [aiStudyPlan, setAiStudyPlan] = useState('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [videoCache, setVideoCache] = useState({});
  const [flashcards, setFlashcards] = useState({});
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);

  const modeSubjects = useMemo(() => ({
    jee: ['Maths', 'Physics', 'Chemistry'],
    neet: ['Physics', 'Chemistry', 'Biology'],
    bitsat: ['Maths', 'Physics', 'Chemistry'],
    viteee: ['Maths', 'Physics', 'Chemistry'],
    kcet: ['Maths', 'Physics', 'Chemistry'],
    comedk: ['Maths', 'Physics', 'Chemistry'],
    cuet: ['Maths', 'Physics', 'Chemistry'],
    keam: ['Maths', 'Physics', 'Chemistry']
  }), []);

  useEffect(() => {
    const available = modeSubjects[syllabusMode];
    if (!available.includes(activeSubject)) {
      if (syllabusMode === 'neet' && activeSubject === 'Maths') {
        setActiveSubject('Biology');
      } else if (syllabusMode === 'jee' && activeSubject === 'Biology') {
        setActiveSubject('Maths');
      } else {
        setActiveSubject(available[0]);
      }
    }
  }, [syllabusMode, activeSubject, modeSubjects]);

  // Section Gate: Policies must be accepted before entering Resources
  useEffect(() => {
    if (activeTab === 'Resources' && !hasAcceptedTerms) {
       setShowPolicyModal(true);
    }
  }, [activeTab, hasAcceptedTerms]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('paperbase_policies_accepted'); // Optional: reset on logout
    setHasAcceptedTerms(false);
  };

  const handleAcceptPolicies = async () => {
    setHasAcceptedTerms(true);
    setShowPolicyModal(false);
    localStorage.setItem('paperbase_policies_accepted', 'true');
    
    if (user?.id) {
       try {
         const res = await fetch('/api/user/accept-policies', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ userId: user.id })
         });
         const data = await res.json();
         if (data.success) {
           // Update local user object to sync state
           const updatedUser = { ...user, policiesAccepted: true };
           setUser(updatedUser);
           localStorage.setItem('paperbase_user', JSON.stringify(updatedUser));
         }
       } catch (err) {
         console.error("Failed to sync policy acceptance:", err);
       }
    }

    if (pendingResource) {
      setSelectedResource(pendingResource);
      setPendingResource(null);
    }
  };



  const handleDislikeResource = async (resourceId) => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/resources/${resourceId}/dislike`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      const data = await res.json();
      if (data.success) {
        setDbResources(prev => prev.map(r => r.id === resourceId ? data.resource : r));
        if (selectedResource?.id === resourceId) {
            setSelectedResource(prev => ({
                ...prev,
                likes: data.resource.likes,
                dislikes: data.resource.dislikes,
                _count: data.resource._count
            }));
        }
      }
    } catch (error) {
       console.error("Dislike error:", error);
    }
  };

  const handleReportResource = async (resourceId, reason, details) => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/resources/${resourceId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, reason, details })
      });
      const data = await res.json();
      if (data.success) {
        alert("Thank you for your report. Our team will review this content.");
        setReportingResource(null);
      }
    } catch (error) {
       console.error("Report error:", error);
    }
  };

  const handleUpdateResource = async (resourceId, formData) => {
    if (!user?.id) return;
    setIsUpdatingResource(true);
    try {
      const res = await fetch(`/api/resources/${resourceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId: user.id })
      });
      const data = await res.json();
      if (data.success) {
        setDbResources(prev => prev.map(r => r.id === resourceId ? data.resource : r));
        setEditingResource(null);
      }
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setIsUpdatingResource(false);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!user?.id || !window.confirm("Are you sure you want to delete this resource? This cannot be undone.")) return;
    
    try {
      const res = await fetch(`/api/resources/${resourceId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      const data = await res.json();
      if (data.success) {
        setDbResources(prev => prev.filter(r => r.id !== resourceId));
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const openResource = (res) => {
    if (!hasAcceptedTerms) {
      setPendingResource(res);
      setShowPolicyModal(true);
    } else {
      setSelectedResource(res);
    }
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem('paperbase_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('paperbase_user');
    }
  }, [user]);

  useEffect(() => {
    if (user && user.id) {
      // Validate user still exists in DB (handles database resets)
      fetch(`/api/auth/validate/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            // Sync policies state from DB on login/refresh
            if (data.user.policiesAccepted) {
               setHasAcceptedTerms(true);
               localStorage.setItem('paperbase_policies_accepted', 'true');
            }
            
            // User exists, now fetch their progress
            fetch(`/api/progress/${user.id}`)
              .then(r => r.json())
              .then(pData => {
                if (pData.success) {
                  setSyllabusProgress(pData.progress);
                }
              })
              .catch(console.error);
          } else {
            // User doesn't exist in DB anymore — force re-login
            console.warn('Stale session detected, user not found in DB. Logging out.');
            localStorage.removeItem('paperbase_user');
            localStorage.removeItem('paperbase_progress');
            setUser(null);
            setIsAuthenticated(false);
            setAuthPage('login');
          }
        })
        .catch(err => {
          console.error('Failed to validate user:', err);
        });
    }
  }, [user?.id]);

  // Prefetch resources and doubts on mount (caching logic)
  useEffect(() => {
    if (user?.id) {
      // Only prefetch if we don't have data yet
      if (dbResources.length === 0) {
        fetch('/api/resources')
            .then(res => res.json())
            .then(data => { if (data.success) setDbResources(data.resources); })
            .catch(console.error);
      }
      
      const prefetchDoubts = async () => {
        try {
          const res = await fetch('/api/doubts');
          const data = await res.json();
          if (data.success) setDoubts(data.doubts);
        } catch (err) {
          console.error('Failed to prefetch doubts:', err);
        }
      };
      
      if (doubts.length === 0) prefetchDoubts();

      if (highlights.length === 0) {
        fetch(`/api/highlights/${user.id}`)
            .then(res => res.json())
            .then(data => { if (data.success) setHighlights(data.highlights); })
            .catch(console.error);
      }
    }
  }, [user?.id]);

  // Refresh resources when filter changes (ignore tab changes for performance if already prefetched)
  useEffect(() => {
    if (activeTab === 'Resources' && dbResources.length > 0) {
        // If we are just opening the tab and already have data, don't re-fetch unless it's a specific filter
        if (resourceFilter === 'All') return; 

        const url = `/api/resources?subject=${resourceFilter}`;
        fetch(url)
            .then(res => res.json())
            .then(data => { if (data.success) setDbResources(data.resources); })
            .catch(console.error);
    }
  }, [activeTab, resourceFilter]);

  // Refresh doubts when tab changes (data already available from prefetch)
  useEffect(() => {
    if (activeTab === 'Community' || activeTab === 'Doubts') {
      fetch('/api/doubts')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
               setDoubts(data.doubts);
            }
        })
        .catch(console.error);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'Goals' && user?.id) {
      setIsGoalsLoading(true);
      fetch(`/api/timetable/${user.id}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
               setTimetableTasks(data.tasks);
               setTimetableSchedules(data.schedules);
               setTimetableStats(data.stats);
            }
        })
        .catch(console.error)
        .finally(() => setIsGoalsLoading(false));
    }
  }, [activeTab, user?.id]);

  const handleAskDoubt = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please login to ask a doubt.');
    setIsSubmittingDoubt(true);
    const formData = new FormData(e.target);
    const subject = formData.get('subject');
    const title = formData.get('title');
    const content = formData.get('content');
    
    try {
        const res = await fetch('/api/doubts', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ userId: user.id, subject, title, content, imageUrl: doubtImage })
        });
        const data = await res.json();
        if (data.success) {
            setDoubts([data.doubt, ...doubts]); // optimistic prepend
            setShowAskDoubtModal(false);
            setDoubtImage(null);
        } else {
            console.error(data.message);
        }
    } catch(err) {
        console.error(err);
    }
    setIsSubmittingDoubt(false);
  };

  const handleDeleteDoubt = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doubt?')) return;
    try {
        const res = await fetch(`/api/doubts/${id}`, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ userId: user?.id })
        });
        const data = await res.json();
        if (data.success) {
            setDoubts(doubts.filter(d => d.id !== id));
            setSelectedDoubt(null);
        }
    } catch(err) {
        console.error(err);
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm('Are you sure you want to delete this reply?')) return;
    try {
        const res = await fetch(`/api/replies/${replyId}`, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ userId: user?.id })
        });
        const data = await res.json();
        if (data.success) {
            setSelectedDoubt(prev => ({
                ...prev,
                replies: prev.replies.filter(r => r.id !== replyId)
            }));
        }
    } catch(err) {
        console.error(err);
    }
  };

  useEffect(() => {
    if (selectedDoubt) {
      fetch(`/api/doubts/${selectedDoubt.id}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
               setSelectedDoubt(data.doubt);
            }
        })
        .catch(console.error);
    }
  }, [selectedDoubt?.id]);

  const handleReplyDoubt = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please login to reply.');
    setIsSubmittingDoubt(true);
    const formData = new FormData(e.target);
    const content = formData.get('content');
    
    try {
        const res = await fetch(`/api/doubts/${selectedDoubt.id}/reply`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ userId: user.id, content })
        });
        const data = await res.json();
        if (data.success) {
            setSelectedDoubt(prev => ({
                ...prev,
                replies: [...(prev.replies || []), data.reply]
            }));
            e.target.reset();
        } else {
            console.error(data.message);
        }
    } catch(err) {
        console.error(err);
    }
    setIsSubmittingDoubt(false);
  };

  const handleResolveDoubt = async () => {
    try {
        const res = await fetch(`/api/doubts/${selectedDoubt.id}/resolve`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ userId: user?.id })
        });
        const data = await res.json();
        if (data.success) {
            setSelectedDoubt(data.doubt);
            setDoubts(doubts.map(d => d.id === data.doubt.id ? data.doubt : d));
        }
    } catch(err) {
        console.error(err);
    }
  };

  const handleUploadResource = async ({ title, subject, tag, description, file }) => {
    if (!user) { alert('Please login to upload.'); return; }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const res = await fetch('/api/resources', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              title,
              description,
              subject,
              tag,
              fileUrl: reader.result,
              fileType: file.type.includes('pdf') ? 'pdf' : 'image'
            })
          });
          const data = await res.json();
          if (data.success) {
            setDbResources(prev => [data.resource, ...prev]);
            setShowUploadModal(false);
            alert('Resource published successfully!');
            resolve();
          } else {
            const errorMsg = data.reason 
              ? `${data.message}\n\nAI Scan Result: ${data.reason}`
              : (data.message || 'Unknown error');
            alert('Upload failed: ' + errorMsg);
            reject();
          }
        } catch (err) {
          console.error(err);
          alert('Upload error: ' + err.message);
          reject();
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleLikeResource = async (resourceId) => {
    if (!user) return alert('Please login to like this resource.');
    try {
        const res = await fetch(`/api/resources/${resourceId}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id })
        });
        const data = await res.json();
        if (data.success) {
            // Update the resource list
            setDbResources(prev => prev.map(r => r.id === resourceId ? data.resource : r));
            // Update the viewer in-place by merging the updated likes/count — avoids remounting PdfViewer
            if (selectedResource?.id === resourceId) {
                setSelectedResource(prev => ({
                    ...prev,
                    likes: data.resource.likes,
                    dislikes: data.resource.dislikes,
                    _count: data.resource._count
                }));
            }
        }
    } catch(err) {
        console.error(err);
    }
  };

  const updateStatus = async (subject, index, status) => {
    // Optimistic UI update
    setSyllabusProgress(prev => {
      const newProgress = { ...prev };
      newProgress[subject] = { ...(prev[subject] || {}) };
      newProgress[subject][index] = status;
      return newProgress;
    });

    // Save to backend if user is logged in
    if (user && user.id) {
      try {
        const res = await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            subject,
            chapterIndex: index,
            status
          })
        });
        const data = await res.json();
        console.log(`Progress save result for ${subject}/${index}:`, data);
      } catch (error) {
        console.error('Network error while saving progress:', error);
      }
    }
  };

  const getChapterStatus = (subject, index) => {
    return syllabusProgress[subject]?.[index] || 0;
  };

  const getSubjectProgress = (subject) => {
    const total = CURRENT_SYLLABUS[subject]?.length || 0;
    if (total === 0) return 0;
    const progress = syllabusProgress[subject] || {};
    const completed = Object.values(progress).filter(s => s === 2).length;
    return Math.round((completed / total) * 100);
  };

  const getOverallSyllabusProgress = () => {
    const subjects = modeSubjects[syllabusMode] || modeSubjects['jee'];
    const totalProgress = subjects.reduce((acc, sub) => acc + getSubjectProgress(sub), 0);
    return Math.round(totalProgress / (subjects.length || 1));
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const exams = [
    { id: 'jee', name: 'JEE', color: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-500/20', img: '/cbse_logo.png' },
    { id: 'neet', name: 'NEET', color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/20', img: '/cbse_logo.png' },
    { id: 'bitsat', name: 'BITSAT', color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-500/20', img: 'https://i.postimg.cc/hvR8rBn1/image.png' },
    { id: 'viteee', name: 'VITEEE', color: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-500/20', img: 'https://i.postimg.cc/xC5LVFb5/image.png' },
    { id: 'kcet', name: 'KCET', color: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-500/20', img: 'https://i.postimg.cc/hGPS3yg2/image.png' },
    { id: 'comedk', name: 'COMEDK', color: 'bg-slate-50 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-500/20', img: 'https://i.postimg.cc/ry59QQm6/Untitled.png' },
    { id: 'cuet', name: 'CUET', color: 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400', border: 'border-sky-200 dark:border-sky-500/20', img: '/cbse_logo.png' },
    { id: 'keam', name: 'KEAM', color: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-500/20', img: 'https://i.postimg.cc/BQ4Hn3Cn/image.png' },
  ];

  const books = [
    { title: 'JEE MAIN 2026 PATTERN', tag: 'JUST LAUNCHED', bg: 'bg-white/80 dark:bg-[#161923]/60', text: 'text-slate-900 dark:text-white', tagBg: 'bg-blue-500 text-white border border-blue-400' },
    { title: 'TOP 500 PYQS FOR APRIL', tag: 'HOT', bg: 'bg-slate-50/90 dark:bg-[#161923]/60', text: 'text-slate-900 dark:text-white', tagBg: 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30' },
    { title: 'INORGANIC CHEMISTRY', tag: 'NEW', bg: 'bg-gradient-to-br from-slate-50/90 to-white/80 dark:from-[#161923]/60 dark:to-[#1C1F29]/60', text: 'text-slate-900 dark:text-white', tagBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' },
    { title: 'IIT-JEE RANK BOOSTER', tag: 'REVISED', bg: 'bg-blue-50/80 dark:bg-blue-900/20', text: 'text-slate-900 dark:text-white', tagBg: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30' },
    { title: 'MATRIX STATEMENT ASSERTION', tag: 'SPECIAL', bg: 'bg-purple-50/80 dark:bg-purple-900/20', text: 'text-slate-900 dark:text-white', tagBg: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30' },
    { title: '99 PERCENTILE BANK', tag: 'BEST', bg: 'bg-slate-50/90 dark:bg-[#161923]/60', text: 'text-slate-900 dark:text-white', tagBg: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30' },
  ];

  const resources = [
    { title: 'Physics Formulae', desc: 'Quick revision sheets', icon: <Calculator size={22} />, bg: 'bg-purple-50 dark:bg-purple-500/10', iconColor: 'text-purple-600 dark:text-purple-400' },
    { title: 'Chemistry Notes', desc: 'Reaction mechanisms', icon: <FileText size={22} />, bg: 'bg-emerald-50 dark:bg-emerald-500/10', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    { title: 'Maths Mind Maps', desc: 'Concept connections', icon: <Layers size={22} />, bg: 'bg-orange-50 dark:bg-orange-500/10', iconColor: 'text-orange-600 dark:text-orange-400' },
    { title: 'NCERT Solutions', desc: 'Step-by-step guides', icon: <Bookmark size={22} />, bg: 'bg-blue-50 dark:bg-blue-500/10', iconColor: 'text-blue-600 dark:text-blue-400' },
  ];

  const browseCategories = [
    { name: 'Physics', count: '120+ Docs', color: 'bg-blue-50 dark:bg-blue-500/10', iconColor: 'text-blue-600 dark:text-blue-400' },
    { name: 'Chemistry', count: '95+ Docs', color: 'bg-emerald-50 dark:bg-emerald-500/10', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    { name: 'Mathematics', count: '150+ Docs', color: 'bg-orange-50 dark:bg-orange-500/10', iconColor: 'text-orange-600 dark:text-orange-400' },
    { name: 'Biology', count: '80+ Docs', color: 'bg-rose-50 dark:bg-rose-500/10', iconColor: 'text-rose-600 dark:text-rose-400' },
  ];

  const examTemplates = [
    { id: 'custom', name: 'Auto-detect', desc: 'From JSON structure', icon: <FileText className="text-slate-400" size={40} /> },
    { id: 'jee', name: 'JEE Main', desc: '75 Qs · MCQ + Numerical', icon: <img src="/cbse_logo.png" alt="JEE" className="w-12 h-12 object-contain drop-shadow-sm" /> },
    { id: 'bitsat', name: 'BITSAT', desc: '150 Qs · MCQ only', icon: <img src="https://i.postimg.cc/hvR8rBn1/image.png" alt="BITSAT" className="w-12 h-12 object-contain drop-shadow-sm" /> },
    { id: 'neet', name: 'NEET', desc: '200 Qs · MCQ only', icon: <img src="/cbse_logo.png" alt="NEET" className="w-12 h-12 object-contain drop-shadow-sm" /> },
    { id: 'comedk', name: 'COMEDK', desc: '180 Qs · No Negative', icon: <img src="https://i.postimg.cc/ry59QQm6/Untitled.png" alt="COMEDK" className="w-12 h-12 object-contain drop-shadow-sm" /> },
    { id: 'kcet', name: 'KCET', desc: '180 Qs · No Negative', icon: <img src="https://i.postimg.cc/hGPS3yg2/image.png" alt="KCET" className="w-12 h-12 object-contain drop-shadow-sm" /> },
    { id: 'viteee', name: 'VITEEE', desc: '125 Qs · No Negative', icon: <img src="https://i.postimg.cc/xC5LVFb5/image.png" alt="VITEEE" className="w-12 h-12 object-contain drop-shadow-sm" /> },
  ];

  const pyqSubjectThemes = {
    Physics: { icon: <Zap size={20} />, color: 'bg-blue-600', text: 'text-blue-600 dark:text-blue-400', lightBg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/20' },
    Chemistry: { icon: <Flame size={20} />, color: 'bg-emerald-600', text: 'text-emerald-600 dark:text-emerald-400', lightBg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20' },
    Maths: { icon: <Calculator size={20} />, color: 'bg-orange-600', text: 'text-orange-600 dark:text-orange-400', lightBg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-200 dark:border-orange-500/20' },
    Biology: { icon: <Activity size={20} />, color: 'bg-rose-600', text: 'text-rose-600 dark:text-rose-400', lightBg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/20' }
  };

  const getMockChapterStats = (chapterName) => {
    const hash = chapterName.length + chapterName.charCodeAt(0);
    const totalQs = hash * 8 + 45;
    const solvedQs = Math.floor(totalQs * ((hash % 10) / 10));
    const recentQs = hash % 5 + 2;
    const isTrendingUp = hash % 2 === 0;
    const isHighWeightage = hash % 3 === 0;
    return { totalQs, solvedQs, recentQs, isTrendingUp, isHighWeightage };
  };

  const ChapterPYQsView = () => {
    const examConfig = selectedExamForPYQ || exams[0];
    const availableSubjects = modeSubjects[examConfig.id] || modeSubjects['jee'];

    useEffect(() => {
      if (!availableSubjects.includes(pyqSubject)) {
        setPyqSubject(availableSubjects[0]);
      }
    }, [examConfig, availableSubjects]);

    const chapters = CURRENT_SYLLABUS[pyqSubject] || [];
    const activeTheme = pyqSubjectThemes[pyqSubject];

    return (
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto space-y-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white/80 dark:bg-[#161923]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-sm dark:shadow-2xl dark:shadow-black/40">
          <div className={`absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[100px] opacity-20 ${activeTheme.color} pointer-events-none`}></div>
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4 md:gap-6">
              <button onClick={() => setActiveTab('Home')} className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-2xl bg-white dark:bg-[#0B0E14] text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 flex items-center justify-center transition-all hover:scale-105 shadow-sm">
                <ArrowLeft size={20} className="md:w-6 md:h-6" />
              </button>
              <div className="flex items-center gap-3 md:gap-4">
                <div className={`w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-2xl md:rounded-3xl flex items-center justify-center border ${examConfig.color} ${examConfig.border} shadow-inner bg-white dark:bg-[#0B0E14]`}>
                  {examConfig.img ? <img src={examConfig.img} alt={examConfig.name} className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-sm" /> : <BookOpen size={24} className="md:w-7 md:h-7" />}
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">{examConfig.name} Masterbank</h2>
                  <div className="text-[10px] md:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                    <Clock size={12} className="md:w-3.5 md:h-3.5" /> 2024 to 2010 • {chapters.length} Chapters
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="w-full lg:w-auto px-6 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-transform">
                <Target size={18} /> Create Custom Test
              </button>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
            {availableSubjects.map((sub) => {
              const theme = pyqSubjectThemes[sub];
              const isActive = pyqSubject === sub;
              return (
                <button key={sub} onClick={() => setPyqSubject(sub)} className={`px-5 py-3 md:px-6 md:py-3.5 rounded-2xl font-bold text-xs md:text-sm transition-all duration-300 flex items-center gap-2 md:gap-3 shrink-0 ${isActive ? `${theme.color} text-white shadow-lg` : 'bg-slate-50 dark:bg-[#0B0E14] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'}`}>
                  <div className={isActive ? 'text-white' : theme.text}>{theme.icon}</div>
                  {sub}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search chapters..." className="w-full sm:w-64 pl-11 pr-4 py-3 rounded-2xl bg-white/80 dark:bg-[#161923]/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:border-blue-500 transition-colors dark:text-white placeholder:text-slate-400" />
            </div>
            <button className="w-12 h-12 shrink-0 flex items-center justify-center rounded-2xl bg-white/80 dark:bg-[#161923]/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-colors text-slate-500">
              <Filter size={18} />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-[#161923]/40 px-5 py-3 rounded-2xl border border-slate-200 dark:border-white/5 w-full sm:w-auto justify-center">
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></div> High Weightage</span>
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div> Mastered</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
          {chapters.map((chapter, index) => {
            const stats = getMockChapterStats(chapter);
            const progressPercent = Math.round((stats.solvedQs / stats.totalQs) * 100);
            const isMastered = progressPercent >= 80;
            return (
              <div key={index} className="group flex flex-col bg-white/80 dark:bg-[#161923]/60 backdrop-blur-xl rounded-[2rem] border border-slate-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500/50 p-6 transition-all shadow-sm hover:shadow-xl dark:shadow-black/20 cursor-pointer overflow-hidden relative min-h-[280px]">
                <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[50px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none ${activeTheme.color}`}></div>
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border ${activeTheme.lightBg} ${activeTheme.text} ${activeTheme.border}`}>
                    {index + 1}
                  </div>
                  {stats.isHighWeightage && (
                    <div className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-[0_4px_10px_rgba(244,63,94,0.3)] flex items-center gap-1">
                      <Flame size={12} /> High Yield
                    </div>
                  )}
                </div>
                <div className="flex-1 relative z-10 mb-6">
                  <h3 className="font-black text-slate-900 dark:text-white text-lg leading-snug mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">{chapter}</h3>
                  <div className="flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-[#0B0E14] px-2 py-1 rounded-lg border border-slate-200 dark:border-[#333942]">
                      {stats.isTrendingUp ? <TrendingUp size={14} className="text-emerald-500" /> : <TrendingDown size={14} className="text-rose-500" />}
                      {stats.recentQs} recent
                    </span>
                    <span>{stats.totalQs} total questions</span>
                  </div>
                </div>
                <div className="mt-auto relative z-10">
                  <div className="flex items-end justify-between mb-3">
                    <div>
                      <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">{progressPercent}%</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Completion</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{stats.solvedQs} <span className="text-slate-400 font-medium">solved</span></div>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-[#0B0E14] rounded-full overflow-hidden border border-transparent dark:border-[#333942] mb-6">
                    <div className={`h-full rounded-full transition-all duration-1000 ${isMastered ? 'bg-emerald-500' : activeTheme.color}`} style={{ width: `${progressPercent}%` }}></div>
                  </div>
                  <button className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${isMastered ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' : 'bg-slate-100 dark:bg-[#0B0E14] text-slate-900 dark:text-white border border-slate-200 dark:border-[#333942] group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 dark:group-hover:bg-blue-600 dark:group-hover:border-blue-500 shadow-sm group-hover:shadow-[0_5px_20px_rgba(37,99,235,0.3)]'}`}>
                    {isMastered ? <><CheckCircle2 size={18} /> Mastered</> : <>Start Practicing <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };





  const CommunityView = () => (
    <section className="animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/80 dark:bg-[#161923]/60 backdrop-blur-xl border border-slate-200 dark:border-[#333942] rounded-3xl p-6 shadow-sm dark:shadow-lg dark:shadow-black/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-500 border border-blue-100 dark:border-blue-500/20">
                  {user?.picture ? <img src={user.picture} className="w-full h-full rounded-full" /> : <User size={20} />}
              </div>
              <button onClick={() => setShowAskDoubtModal(true)} className="flex-1 text-left bg-slate-50 dark:bg-[#0B0E14]/80 border border-slate-200 dark:border-[#333942] rounded-2xl px-5 py-3 text-sm text-slate-500 hover:bg-slate-100 transition-colors">Ask a doubt or share a resource...</button>
            </div>
            <div className="flex gap-4 border-t border-slate-100 dark:border-[#444b55] pt-4">
              <button onClick={() => setShowAskDoubtModal(true)} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><FileText size={16} /> Question</button>
              <button onClick={() => {setActiveTab('Resources'); setShowUploadModal(true);}} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"><Book size={16} /> Resource</button>
              <button className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"><Star size={16} /> Achievement</button>
            </div>
          </div>
          {doubts.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
                <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                <p>No doubts yet. Be the first to ask!</p>
            </div>
          ) : doubts.map((post) => (
            <div key={post.id} onClick={(e) => { if(!e.target.closest('button')) setSelectedDoubt(post); }} className="bg-white/80 dark:bg-[#161923]/60 backdrop-blur-xl border border-slate-200 dark:border-[#333942] rounded-3xl p-6 shadow-sm dark:shadow-lg dark:shadow-black/20 hover:border-blue-400 dark:hover:border-blue-500/30 transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#2d323c]/70 flex items-center justify-center text-slate-400 border border-transparent dark:border-[#444b55]">
                      {post.user.picture ? <img src={post.user.picture} className="w-full h-full rounded-full" /> : <User size={20} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{post.user.name}</span>
                      {post.status === 'Resolved' && <span className="text-[10px] bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-transparent dark:border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-tight">Resolved</span>}
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{timeAgo(post.createdAt)}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${getSubjectColor(post.subject)}`}>{post.subject}</span>
              </div>
              <h3 className="font-black text-slate-900 dark:text-white mb-2 leading-snug">{post.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2">{post.content}</p>
              {post.imageUrl && (
                  <div className="mb-6 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 max-h-60">
                      <img src={post.imageUrl} className="w-full object-cover" />
                  </div>
              )}
              <div className="flex items-center gap-6 pt-4 border-t border-slate-100 dark:border-[#444b55]">
                <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><MessageCircle size={16} /> {post._count?.replies || 0} Replies</button>
                {post.status === 'Resolved' && <span className="flex items-center gap-2 text-xs font-bold text-emerald-500"><CheckCircle2 size={16} /> Marked as solved</span>}
                {user?.id === post.userId && <button onClick={() => handleDeleteDoubt(post.id)} className="ml-auto text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>}
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-6">
          <div className="bg-slate-800 dark:bg-[#2d323c]/70 backdrop-blur-xl border border-slate-700 dark:border-[#444b55] rounded-3xl p-6 text-white shadow-xl">
            <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-white"><Trophy size={20} className="text-amber-400" /> Hall of Fame</h3>
            <div className="space-y-4">
              {[{ name: "Aditya Verma", score: "2,450 pts", rank: 1, color: "text-amber-400" }, { name: "Sarah Khan", score: "2,120 pts", rank: 2, color: "text-slate-300" }, { name: "Ishaan P.", score: "1,980 pts", rank: 3, color: "text-amber-700" }].map((user, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <span className={`font-black text-sm ${user.color}`}>#{user.rank}</span>
                    <span className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{user.name}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400">{user.score}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2.5 bg-slate-900/50 dark:bg-[#15181e]/80 border border-slate-700 dark:border-[#333942] hover:border-slate-600 rounded-xl text-xs font-bold transition-all text-slate-300">View All Rankings</button>
          </div>
          <div className="bg-white/80 dark:bg-[#22262e]/70 backdrop-blur-xl border border-slate-200 dark:border-[#333942] rounded-3xl p-6 shadow-sm dark:shadow-lg dark:shadow-black/20">
            <h3 className="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Zap size={18} className="text-blue-600 dark:text-blue-500" /> Popular Groups</h3>
            <div className="space-y-3">
              {["JEE Main April '26", "Organic Chemistry Doubts", "NEET Biology Hub", "Maths Short Tricks"].map((group, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-[#444b55] bg-slate-50 dark:bg-[#2d323c]/70 hover:border-blue-300 dark:hover:border-blue-500/30 hover:bg-white dark:hover:bg-[#22262e]/70 cursor-pointer transition-all">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{group}</span>
                  <ChevronRight size={14} className="text-slate-400 dark:text-slate-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const GoalsView = () => {
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const [newTaskText, setNewTaskText] = useState('');
    const [isAddingBlock, setIsAddingBlock] = useState(false);
    const [newBlock, setNewBlock] = useState({ time: '', title: '', type: 'Study', duration: '', theme: 'blue' });

    const currentSchedule = timetableSchedules.filter(s => s.day === selectedDay);
    const completedTasksWeeklyCount = timetableTasks.filter(t => t.done).length;

    const handleAddSchedule = async (e) => {
      e.preventDefault();
      if (!newBlock.time || !newBlock.title || !newBlock.duration) return;
      try {
        const res = await fetch('/api/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, day: selectedDay, ...newBlock })
        });
        const data = await res.json();
        if (data.success) {
          setTimetableSchedules([...timetableSchedules, data.schedule]);
          setIsAddingBlock(false);
          setNewBlock({ time: '', title: '', type: 'Study', duration: '', theme: 'blue' });
        }
      } catch (e) {
        console.error(e);
      }
    };

    const handleToggleTask = async (taskId, currentStatus) => {
      // Optimistic up
      setTimetableTasks(timetableTasks.map(t => t.id === taskId ? { ...t, done: !currentStatus } : t));
      try {
        const res = await fetch(`/api/tasks/${taskId}/toggle`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, done: !currentStatus })
        });
        const data = await res.json();
        if (!data.success) {
          setTimetableTasks(timetableTasks.map(t => t.id === taskId ? { ...t, done: currentStatus } : t));
        }
      } catch (e) {
        setTimetableTasks(timetableTasks.map(t => t.id === taskId ? { ...t, done: currentStatus } : t));
      }
    };

    const handleAddTask = async (e) => {
      e.preventDefault();
      if (!newTaskText.trim()) return;
      const t = { userId: user.id, title: newTaskText, subject: 'General', color: 'text-slate-500' };
      try {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(t)
        });
        const data = await res.json();
        if (data.success) {
          setTimetableTasks([data.task, ...timetableTasks]);
          setNewTaskText('');
        }
      } catch (e) {
        console.error(e);
      }
    };

    const getThemeClasses = (theme) => {
      const themes = {
        blue: 'bg-blue-50/80 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
        orange: 'bg-orange-50/80 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20',
        emerald: 'bg-emerald-50/80 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
        purple: 'bg-purple-50/80 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
        rose: 'bg-rose-50/80 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
        slate: 'bg-slate-50/80 dark:bg-[#1C1F29]/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#333942]',
      };
      return themes[theme] || themes.slate;
    };

    const getDotClasses = (theme) => {
      const themes = {
        blue: 'bg-blue-500',
        orange: 'bg-orange-500',
        emerald: 'bg-emerald-500',
        purple: 'bg-purple-500',
        rose: 'bg-rose-500',
        slate: 'bg-slate-400 dark:bg-slate-500',
      };
      return themes[theme] || themes.slate;
    };

    return (
      <section className="animate-in fade-in duration-500 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Study Timetable</h2>
          <div className="flex flex-wrap gap-3">
            <button className="bg-slate-100 dark:bg-[#161923] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#333942] px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-[#1C1F29] transition flex items-center gap-2 shadow-sm"><Calendar size={18} /> Sync Calendar</button>
            <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-[0_4px_15px_rgba(37,99,235,0.2)] hover:bg-blue-700 transition flex items-center gap-2"><Plus size={18} /> New Goal</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { icon: <CheckCircle2 size={28} />, value: `${completedTasksWeeklyCount}/${timetableTasks.length}`, label: 'Tasks Completed', bg: 'bg-emerald-50 dark:bg-emerald-500/10', iconColor: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-500/20' },
            { icon: <Flame size={28} />, value: timetableStats?.streak || '0', label: 'Day Streak', bg: 'bg-orange-50 dark:bg-orange-500/10', iconColor: 'text-orange-600 dark:text-orange-400', border: 'border-orange-100 dark:border-orange-500/20' },
            { icon: <Clock size={28} />, value: `${timetableStats?.focusTime || 0}h`, label: 'Focus Time', bg: 'bg-blue-50 dark:bg-blue-500/10', iconColor: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-500/20' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/80 dark:bg-[#161923]/80 backdrop-blur-xl border border-slate-200 dark:border-[#333942] p-6 rounded-3xl shadow-sm dark:shadow-lg dark:shadow-black/20 flex items-center gap-5 hover:-translate-y-1 transition-transform">
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.iconColor} border ${stat.border} flex items-center justify-center shadow-inner`}>{stat.icon}</div>
              <div>
                <div className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{stat.value}</div>
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 flex flex-col">
            <div className="bg-white/80 dark:bg-[#161923]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-sm dark:shadow-xl dark:shadow-black/20 overflow-hidden flex-1 flex flex-col">
              <div className="p-6 border-b border-slate-100 dark:border-[#444b55] flex justify-between items-center bg-slate-50/80 dark:bg-[#2d323c]/40">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Target className="text-rose-500" size={18} /> Today's Tasks</h3>
                <button className="text-xs font-bold text-blue-600 dark:text-blue-500 uppercase tracking-widest">View All</button>
              </div>
              <div className="p-4 space-y-2 flex-1">
                {isGoalsLoading ? (
                   <div className="text-sm text-slate-500 text-center py-6">Loading tasks...</div>
                ) : timetableTasks.length > 0 ? timetableTasks.map((task, i) => (
                  <div key={i} onClick={() => handleToggleTask(task.id, task.done)} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-[#2d323c]/70 rounded-2xl transition-colors group cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-[#444b55]">
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${task.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 dark:border-[#444b55] text-transparent group-hover:border-blue-500'}`}><CheckCircle2 size={16} /></div>
                      <div>
                        <h4 className={`font-bold text-sm transition-colors line-clamp-1 pr-2 ${task.done ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>{task.title}</h4>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${task.done ? 'text-slate-400' : task.color}`}>{task.subject}</span>
                      </div>
                    </div>
                  </div>
                )) : (
                   <div className="text-sm text-slate-500 text-center py-6 border border-dashed rounded-xl border-slate-200 dark:border-[#333942]">
                     No tasks for today. Start by adding one!
                   </div>
                )}
              </div>
              <div className="p-4 border-t border-slate-100 dark:border-[#444b55] bg-slate-50/50 dark:bg-[#1C1F29]/50">
                <form onSubmit={handleAddTask} className="flex gap-2">
                   <input type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder="Add a new task..." className="flex-1 bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#333942] rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" />
                   <button type="submit" disabled={!newTaskText.trim()} className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white w-10 h-10 rounded-xl flex items-center justify-center transition-colors">
                     <Plus size={18} />
                   </button>
                </form>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 flex flex-col">
            <div className="bg-white/80 dark:bg-[#161923]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 md:p-8 shadow-sm dark:shadow-xl dark:shadow-black/20 flex-1 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 relative z-10">
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2"><Calendar className="text-blue-500" size={24} /> Weekly Schedule</h3>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0f1219] p-1.5 rounded-[1.25rem] border border-slate-200 dark:border-[#2a2f3a] overflow-x-auto no-scrollbar w-full sm:w-auto">
                  {daysOfWeek.map(day => (
                    <button key={day} onClick={() => setSelectedDay(day)} className={`shrink-0 px-4 py-2 rounded-xl text-[13px] font-bold transition-all whitespace-nowrap ${selectedDay === day ? 'bg-white dark:bg-[#252a36] text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-[#3a4150]' : 'text-slate-500 dark:text-blue-200/60 hover:text-slate-700 dark:hover:text-blue-300 border border-transparent'}`}>{day}</button>
                  ))}
                </div>
              </div>
              <div className="relative pl-4 md:pl-10 py-2 min-h-[300px]">
                <div className="absolute left-[23px] md:left-[47px] top-4 bottom-8 w-[3px] bg-gradient-to-b from-blue-500 via-slate-200 dark:via-[#333942] to-transparent rounded-full"></div>
                <div className="space-y-8 relative z-10">
                  {currentSchedule.length > 0 ? currentSchedule.map((slot, idx) => (
                    <div key={idx} className="relative flex items-start gap-5 md:gap-8 group">
                      <div className={`absolute -left-[23px] md:-left-[20px] top-1.5 w-[14px] h-[14px] md:w-4 md:h-4 rounded-full border-[3px] md:border-4 border-white dark:border-[#161923] z-10 ${getDotClasses(slot.theme)} group-hover:scale-150 transition-transform duration-300`}></div>
                      <div className="w-16 md:w-20 shrink-0 pt-0.5 text-right"><span className="text-[11px] md:text-xs font-black text-slate-900 dark:text-white leading-tight block">{slot.time}</span></div>
                      <div className={`flex-1 p-5 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-sm ${getThemeClasses(slot.theme)}`}>
                        <div className="flex justify-between items-start mb-2.5">
                          <span className="px-2.5 py-1 rounded-lg bg-white/60 dark:bg-black/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                            {slot.type === 'Study' && <BookOpen size={12} />}
                            {slot.type === 'Practice' && <Target size={12} />}
                            {slot.type === 'Exam' && <ClipboardList size={12} />}
                            {slot.type}
                          </span>
                          <span className="text-[10px] font-bold opacity-80 flex items-center gap-1.5"><Clock size={12} /> {slot.duration}</span>
                        </div>
                        <h4 className="font-black text-sm md:text-base leading-snug">{slot.title}</h4>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                      <Calendar size={48} className="mx-auto mb-4 opacity-20" />
                      <p className="font-bold text-sm">No tasks scheduled for {selectedDay}.</p>
                    </div>
                  )}
                  <div className="relative flex items-start gap-5 md:gap-8 pt-4">
                    <div className="absolute -left-[20px] md:-left-[17px] top-6 w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-[#444b55] z-10 border-2 border-white dark:border-[#161923]"></div>
                    <div className="w-16 md:w-20 shrink-0"></div>
                    <div className="flex-1">
                      {!isAddingBlock ? (
                        <button onClick={() => setIsAddingBlock(true)} className="w-full p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-[#444b55] bg-slate-50/50 dark:bg-[#0B0E14]/50 text-slate-500 dark:text-slate-400 font-bold text-sm hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all flex items-center justify-center gap-2 group shadow-sm">
                          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-[#333942] group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 flex items-center justify-center transition-colors"><Plus size={14} /></div>
                          Add Time Block
                        </button>
                      ) : (
                        <form onSubmit={handleAddSchedule} className="p-5 rounded-2xl border border-slate-200 dark:border-[#333942] bg-white dark:bg-[#22262e]/70 backdrop-blur-sm shadow-sm space-y-3">
                           <div className="flex justify-between items-center mb-2">
                              <h4 className="font-bold text-sm">New Block ({selectedDay})</h4>
                              <button type="button" onClick={() => setIsAddingBlock(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={16} /></button>
                           </div>
                           <div className="grid grid-cols-2 gap-3">
                              <input type="text" placeholder="Time (e.g. 08:00 AM)" value={newBlock.time} onChange={e => setNewBlock({...newBlock, time: e.target.value})} className="bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-[#333942] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100" required />
                              <input type="text" placeholder="Duration (e.g. 2h)" value={newBlock.duration} onChange={e => setNewBlock({...newBlock, duration: e.target.value})} className="bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-[#333942] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100" required />
                           </div>
                           <input type="text" placeholder="Title (e.g. Physics: Thermodynamics)" value={newBlock.title} onChange={e => setNewBlock({...newBlock, title: e.target.value})} className="w-full bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-[#333942] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100" required />
                           <div className="grid grid-cols-2 gap-3">
                              <select value={newBlock.type} onChange={e => setNewBlock({...newBlock, type: e.target.value})} className="bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-[#333942] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100">
                                <option value="Study">Study</option>
                                <option value="Practice">Practice</option>
                                <option value="Exam">Exam</option>
                              </select>
                              <select value={newBlock.theme} onChange={e => setNewBlock({...newBlock, theme: e.target.value})} className="bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-[#333942] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100">
                                <option value="blue">Blue</option>
                                <option value="emerald">Emerald</option>
                                <option value="orange">Orange</option>
                                <option value="purple">Purple</option>
                                <option value="rose">Rose</option>
                                <option value="slate">Slate</option>
                              </select>
                           </div>
                           <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-sm transition-colors mt-2">Create Block</button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  const ProfileView = () => (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 bg-white/80 dark:bg-[#22262e]/70 backdrop-blur-xl border border-slate-200 dark:border-[#333942] rounded-3xl p-8 shadow-sm dark:shadow-lg dark:shadow-black/20">
          <div className="flex items-start gap-6 mb-8">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-500 border border-blue-100 dark:border-blue-500/20 shadow-sm">
              {user?.picture ? (
                <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User size={48} />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">{user?.name || 'Alex Johnson'}</h2>
                <span className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tight">Premium Scholar</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2"><Mail size={14} /> {user?.email || 'alex.j@university.edu'}</p>
              <div className="flex gap-2">
                <button onClick={() => setShowEditModal(true)} className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-[0_4px_15px_rgba(37,99,235,0.2)] hover:bg-blue-700 transition-all">Edit Profile</button>
                <button onClick={() => setShowSettingsModal(true)} className="bg-slate-50 dark:bg-[#2d323c]/70 border border-slate-200 dark:border-[#444b55] text-slate-700 dark:text-slate-300 text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-100 transition-all">Account Settings</button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-100 dark:border-[#444b55]">
            <div className="text-center"><div className="text-xl font-black text-slate-900 dark:text-white">{user?.points || 0}</div><div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Points</div></div>
            <div className="text-center border-x border-slate-100 dark:border-[#444b55]"><div className="text-xl font-black text-slate-900 dark:text-white">0</div><div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Level</div></div>
            <div className="text-center"><div className="text-xl font-black text-slate-900 dark:text-white">-</div><div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Rank</div></div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="bg-white/80 dark:bg-[#22262e]/70 backdrop-blur-xl border border-slate-200 dark:border-[#333942] rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm dark:shadow-lg dark:shadow-black/20">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3 shadow-sm"><ShieldCheck size={24} /></div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Account Verified</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Your identity and student status are active.</p>
          </div>
          <div className="bg-white/80 dark:bg-[#22262e]/70 backdrop-blur-xl border border-slate-200 dark:border-[#333942] rounded-3xl p-6 flex flex-col shadow-sm dark:shadow-lg dark:shadow-black/20">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-slate-900 dark:text-white font-bold text-xs">Overall Prep</h4>
              <Sparkles size={14} className="text-amber-500 dark:text-amber-400" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mb-2">{getOverallSyllabusProgress()}%</div>
            <div className="h-1.5 w-full bg-slate-200 dark:bg-[#15181e] border border-transparent dark:border-[#333942] rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{width: `${getOverallSyllabusProgress()}%`}}></div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white/80 dark:bg-[#22262e]/70 backdrop-blur-xl border border-slate-200 dark:border-[#333942] rounded-3xl overflow-hidden shadow-sm dark:shadow-lg dark:shadow-black/20">
        {[
          { icon: <ClipboardList size={20} />, bg: 'bg-blue-50 dark:bg-blue-500/10', iconColor: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-500/20', title: 'My Test History', desc: 'View all your past attempts and scores' },
          { icon: <Bookmark size={20} />, bg: 'bg-purple-50 dark:bg-purple-500/10', iconColor: 'text-purple-600 dark:text-purple-400', border: 'border-purple-100 dark:border-blue-500/20', title: 'Saved Resources', desc: 'Your bookmarked notes and papers' },
        ].map((item, i) => (
          <div key={i} className="p-4 border-b border-slate-100 dark:border-[#444b55] flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#2d323c]/70 cursor-pointer group transition-colors">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 ${item.bg} ${item.iconColor} border ${item.border} rounded-xl flex items-center justify-center`}>{item.icon}</div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{item.title}</h4>
                <p className="text-[10px] text-slate-500 font-medium">{item.desc}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
          </div>
        ))}
        <div onClick={() => { setIsAuthenticated(false); setUser(null); setAuthPage('login'); setActiveTab('Home'); }} className="p-4 flex items-center justify-between hover:bg-rose-50 dark:hover:bg-rose-500/10 cursor-pointer group transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 rounded-xl flex items-center justify-center"><LogOut size={20} /></div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-rose-600 dark:group-hover:text-rose-400">Logout</h4>
              <p className="text-[10px] text-slate-500 font-medium">Sign out of PaperBase</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const currentOverallProgress = getOverallSyllabusProgress();

  if (!isAuthenticated) {
    if (authPage === 'signup') {
      return <SignupPage onSignup={(userData) => { setIsAuthenticated(true); setUser(userData); setActiveTab('Home'); }} onNavigateLogin={() => setAuthPage('login')} />;
    }
    return <LoginPage onLogin={async (userData) => { 
        setIsAuthenticated(true); 
        setUser(userData);
        // Fetch user progress
        if (userData?.id) {
            try {
                const res = await fetch(`/api/progress/${userData.id}`);
                const data = await res.json();
                if (data.success && data.progress) {
                    setSyllabusProgress(data.progress);
                }
            } catch(e) { console.error('Failed to load progress', e); }
        }
        setActiveTab('Home'); 
    }} onNavigateSignup={() => setAuthPage('signup')} />;
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="flex min-h-screen bg-slate-50 dark:bg-[#0B0E14] text-slate-600 dark:text-slate-300 font-sans relative overflow-hidden transition-colors duration-300">
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className={`absolute inset-0 transition-opacity duration-700 ${isDarkMode ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.12)_0%,transparent_60%)]"></div>
            <div className="absolute bottom-[-10%] right-[10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.12)_0%,transparent_60%)]"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle,rgba(225,29,72,0.08)_0%,transparent_60%)]"></div>
          </div>
          <div className="absolute inset-0 z-10 transition-colors duration-300" style={{ backgroundImage: isDarkMode ? 'linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px)' : 'linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)', backgroundSize: '64px 64px' }}></div>
        </div>

        <aside className="w-64 border-r border-slate-200 dark:border-white/5 flex flex-col fixed h-full bg-white/90 dark:bg-[#0B0E14]/80 backdrop-blur-2xl z-50 transition-colors duration-300">
          <div className="p-6 flex items-center mb-4">
            <img src="/logo.png" alt="PaperBase Logo" className="h-10 w-auto object-contain transition-all" onError={(e) => { e.target.src = 'https://via.placeholder.com/150x40?text=PAPERBASE'; }} />
          </div>
          <nav className="flex-1 px-4 space-y-2">
            <SidebarItem icon={<Home size={20} />} label="Home" active={activeTab === 'Home' || activeTab === 'ChapterPYQs'} onClick={() => setActiveTab('Home')} />
            <SidebarItem icon={<Target size={20} />} label="Goals" active={activeTab === 'Goals'} onClick={() => setActiveTab('Goals')} />
            <SidebarItem icon={<HelpCircle size={20} />} label="Doubts" active={activeTab === 'Doubts'} onClick={() => setActiveTab('Doubts')} />
            <SidebarItem icon={<ClipboardList size={20} />} label="Tests" active={activeTab === 'Tests'} onClick={() => setActiveTab('Tests')} />
            <SidebarItem icon={<BookOpen size={20} />} label="Notes" active={activeTab === 'Notes'} onClick={() => setActiveTab('Notes')} />
            <SidebarItem icon={<Layers size={20} />} label={<span className="flex items-center gap-2">Resources <Sparkles size={14} className="text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400 animate-pulse" /></span>} active={activeTab === 'Resources'} onClick={() => setActiveTab('Resources')} />
            <SidebarItem icon={<ListChecks size={20} />} label="Syllabus" active={activeTab === 'Syllabus'} onClick={() => setActiveTab('Syllabus')} />
            <SidebarItem icon={<MonitorPlay size={20} />} label="Study Room" active={activeTab === 'StudyRoom'} onClick={() => setActiveTab('StudyRoom')} />
            <SidebarItem icon={<Users size={20} />} label="Community" active={activeTab === 'Community'} onClick={() => setActiveTab('Community')} />
          </nav>
          <div className="p-4 space-y-2 border-t border-slate-200 dark:border-white/5">
            <div onClick={toggleTheme} className="flex items-center gap-3 px-4 py-3 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl cursor-pointer transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10 select-none">
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              <span className="font-bold">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
            <a href="https://github.com/scruffyoncord-a11y/paperbases" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl cursor-pointer transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10 no-underline">
              <Chrome size={18} />
              <span className="font-bold">Our Extension</span>
            </a>
            <div onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-sm text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl cursor-pointer transition-all border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20 select-none">
              <LogOut size={18} />
              <span className="font-bold">Sign Out</span>
            </div>
          </div>
          <div className="mt-auto p-6 border-t border-slate-200 dark:border-white/5 space-y-2.5 opacity-60 hover:opacity-100 transition-opacity">
             <button onClick={() => setShowPolicyModal(true)} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-500 block transition-colors">Terms & Conditions</button>
             <button onClick={() => setShowPolicyModal(true)} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-500 block transition-colors">Privacy Policy</button>
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-4">© 2026 PaperBase.in</p>
          </div>
        </aside>

        <main className="ml-64 flex-1 p-8 z-10 relative h-screen overflow-y-auto custom-scrollbar">
          <header className="flex items-center justify-between mb-8">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Dashboard</span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {activeTab === 'ChapterPYQs' ? 'PYQ Library' : 
                 activeTab === 'StudyRoom' ? 'Deep Work Room' : activeTab}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white/80 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 dark:hover:border-blue-500/30 transition-all shadow-sm"><Bell size={20} /></button>
              <div onClick={() => setActiveTab('Profile')} className={`flex items-center gap-3 cursor-pointer p-1 pr-4 rounded-full border transition-all shadow-sm ${activeTab === 'Profile' ? 'bg-slate-50/80 dark:bg-white/10 border-blue-400 dark:border-blue-500/50 backdrop-blur-md' : 'bg-white/80 dark:bg-white/5 backdrop-blur-md border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/30'}`}>
                {user?.picture ? (
                    <img src={user.picture} alt="Profile" className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-white/10" />
                ) : (
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center overflow-hidden transition-colors border border-transparent dark:border-white/5 ${activeTab === 'Profile' ? 'bg-blue-100 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-black/50 text-slate-500 dark:text-slate-400'}`}><User size={18} /></div>
                )}
                <div className="hidden sm:block"><div className="flex items-center gap-1"><span className="text-xs font-bold text-slate-900 dark:text-white">{user?.name?.split(' ')[0] || 'User'}</span><ChevronDown size={12} className="text-slate-500" /></div></div>
              </div>
            </div>
          </header>

          
          {activeTab === 'Home' && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-700 mb-10 pb-10 border-b border-slate-200 dark:border-white/10">
              <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Good afternoon, {user?.name?.split(' ')[0] || 'User'}! 👋</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Ready to conquer your {syllabusMode.toUpperCase()} prep today?</p>
                </div>
                <div className="flex gap-4">
                  <div className="bg-white/80 dark:bg-[#161923]/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-4 rounded-2xl shadow-sm dark:shadow-lg dark:shadow-black/20 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-500/20 flex items-center justify-center"><Flame size={20} /></div>
                    <div>
                      <div className="text-lg font-black text-slate-900 dark:text-white">12 Days</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Streak</div>
                    </div>
                  </div>
                  <div className="bg-blue-600 p-4 rounded-2xl shadow-[0_4px_15px_rgba(37,99,235,0.2)] dark:shadow-[0_0_20px_rgba(37,99,235,0.3)] text-white flex items-center gap-4 border border-blue-500 dark:border-blue-400/30">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm"><TrendingUp size={20} /></div>
                    <div>
                      <div className="text-lg font-black">Top 5%</div>
                      <div className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">Percentile</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white/80 dark:bg-[#161923]/60 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-white/10 p-8 shadow-sm dark:shadow-lg dark:shadow-black/20 flex flex-col md:flex-row gap-8 items-center overflow-hidden relative">
                  <div className="w-32 h-32 relative shrink-0">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle className="text-slate-100 dark:text-white/5 stroke-current" strokeWidth="8" fill="transparent" r="40" cx="50" cy="50" />
                      <circle className="text-blue-500 stroke-current transition-all duration-1000 ease-out" strokeWidth="8" strokeDasharray={`${2.51 * currentOverallProgress} 251`} strokeLinecap="round" fill="transparent" r="40" cx="50" cy="50" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">{currentOverallProgress}%</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Prep</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4 relative z-10">
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-lg mb-1">Today's Focus: Integral Calculus</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">You've completed 4/10 goals for today. Keep pushing!</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-blue-700 shadow-[0_4px_15px_rgba(37,99,235,0.2)] transition-all">Resume Practice</button>
                      <button className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-100 transition-all">Adjust Goals</button>
                    </div>
                  </div>
                </div>
                <div className="bg-white/80 dark:bg-[#161923]/60 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-sm dark:shadow-lg dark:shadow-black/20">
                  <h4 className="font-black text-slate-900 dark:text-white text-sm mb-4 uppercase tracking-widest">Subject Health</h4>
                  <div className="space-y-4">
                    {modeSubjects[syllabusMode]?.map(sub => (
                      <div key={sub} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-700 dark:text-slate-300">{sub}</span>
                          <span className="text-slate-500">{getSubjectProgress(sub)}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-black/50 border border-transparent dark:border-white/5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-1000 ${sub === 'Maths' ? 'bg-orange-500' : sub === 'Physics' ? 'bg-blue-500' : sub === 'Chemistry' ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{width: `${getSubjectProgress(sub)}%`}}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Home' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <section className="mb-10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-black text-xl text-slate-900 dark:text-white flex items-center gap-3"><BookOpen size={24} className="text-blue-600 dark:text-blue-500" /> Chapter-wise PYQs</h2>
                  <button className="text-xs font-bold text-blue-600 dark:text-blue-500 uppercase tracking-widest hover:text-blue-500 dark:hover:text-blue-400 transition">View Library</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                  {exams.map((exam, i) => (
                    <div key={i} onClick={() => { setSelectedExamForPYQ(exam); setPyqSubject(modeSubjects[exam.id]?.[0] || 'Physics'); setActiveTab('ChapterPYQs'); }} className="flex flex-col items-center p-5 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#161923]/60 backdrop-blur-xl shadow-sm dark:shadow-lg dark:shadow-black/20 hover:border-blue-400 dark:hover:border-blue-500/50 hover:-translate-y-1.5 transition duration-300 cursor-pointer group">
                      <div className={`w-14 h-14 rounded-2xl mb-3 flex items-center justify-center border ${exam.color} ${exam.border} group-hover:scale-110 transition duration-300 shadow-sm`}>
                        {exam.img ? <img src={exam.img} alt={exam.name} className="w-8 h-8 object-contain drop-shadow-sm" /> : <BookOpen size={24} className="text-slate-500" />}
                      </div>
                      <span className="text-xs font-black text-slate-800 dark:text-white text-center leading-tight">{exam.name}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mb-10">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-black text-xl text-slate-900 dark:text-white flex items-center gap-3"><img src="/logo.png" className="w-8 h-8 object-contain" alt="" /> Recommended Modules</h2>
                  <button className="text-xs font-bold text-blue-600 dark:text-blue-500 uppercase tracking-widest hover:text-blue-500 dark:hover:text-blue-400 transition">All Tests</button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-6">Handpicked practice modules based on your performance trends.</p>
                <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar">
                  {books.map((book, i) => (
                    <div key={i} className={`min-w-[200px] h-[260px] rounded-3xl shadow-md dark:shadow-lg dark:shadow-black/30 border border-slate-200 dark:border-white/10 flex flex-col relative group cursor-pointer overflow-hidden hover:border-blue-300 dark:hover:border-blue-500/30 hover:-translate-y-2 transition duration-500 ${book.bg} backdrop-blur-xl`}>
                      <div className="p-4 relative z-10"><div className={`text-[9px] font-black px-3 py-1.5 rounded-full w-fit shadow-sm uppercase tracking-wider ${book.tagBg}`}>{book.tag}</div></div>
                      <div className="flex-1 flex flex-col justify-center items-start p-6 relative z-10">
                        <h4 className={`text-lg font-black leading-tight tracking-tight mb-4 ${book.text}`}>{book.title}</h4>
                        <div className="flex items-center gap-2 opacity-80"><Clock size={12} className="text-slate-500 dark:text-slate-400" /><span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">45 Mins</span></div>
                      </div>
                      <div className="bg-slate-100/80 dark:bg-black/40 backdrop-blur-md p-4 mt-auto flex items-center justify-between border-t border-slate-200 dark:border-white/10 group-hover:bg-slate-100 dark:group-hover:bg-black/60 transition duration-300 relative z-10">
                        <span className="text-[11px] font-black tracking-widest text-blue-600 dark:text-blue-400">START NOW</span>
                        <ChevronRight size={16} className="text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="animate-in fade-in duration-500">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-black text-xl text-slate-900 dark:text-white flex items-center gap-3"><Star size={24} className="text-purple-500 dark:text-purple-400" /> Quick Access Resources</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {resources.map((res, i) => (
                    <div key={i} className="bg-white/80 dark:bg-[#161923]/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-5 rounded-3xl shadow-sm dark:shadow-lg dark:shadow-black/20 hover:border-blue-400 dark:hover:border-blue-500/50 transition-all duration-300 cursor-pointer flex items-center gap-5 group">
                      <div className={`p-4 rounded-2xl border border-slate-100 dark:border-white/5 ${res.bg} ${res.iconColor} group-hover:scale-110 transition-transform duration-300`}>{res.icon}</div>
                      <div>
                        <h4 className="font-black text-slate-900 dark:text-white text-sm">{res.title}</h4>
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{res.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'ChapterPYQs' && <ChapterPYQsView />}
          {activeTab === 'Goals' && <GoalsView />}
          {activeTab === 'Profile' && <ProfileView />}
          {activeTab === 'Community' && <CommunityView />}
          {activeTab === 'Resources' && (
            <ResourcesView 
                syllabusMode={syllabusMode}
                modeSubjects={modeSubjects}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                dbResources={dbResources}
                resourceFilter={resourceFilter}
                setResourceFilter={setResourceFilter}
                resourceTab={resourceTab}
                setResourceTab={setResourceTab}
                setShowUploadModal={setShowUploadModal}
                openResource={openResource}
                user={user}
                handleLikeResource={handleLikeResource}
                handleDislikeResource={handleDislikeResource}
                setReportingResource={setReportingResource}
                setActiveTab={setActiveTab}
                setEditingResource={setEditingResource}
                handleDeleteResource={handleDeleteResource}
            />
          )}

          {activeTab === 'Syllabus' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Syllabus Tracker</h2>
                  <div className="flex items-center gap-2 bg-white/80 dark:bg-white/5 backdrop-blur-md p-1 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm w-fit overflow-x-auto no-scrollbar max-w-[90vw]">
                    <button onClick={() => setSyllabusMode('jee')} className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${syllabusMode === 'jee' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}>JEE</button>
                    <button onClick={() => setSyllabusMode('neet')} className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${syllabusMode === 'neet' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}>NEET</button>
                    <button onClick={() => setSyllabusMode('bitsat')} className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${syllabusMode === 'bitsat' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}>
                      <img src="/bitsat_logo.png" alt="" className="w-5 h-5 object-contain" /> BITSAT
                    </button>
                    <button onClick={() => setSyllabusMode('keam')} className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${syllabusMode === 'keam' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}>
                      <img src="/keam_logo.png" alt="" className="w-5 h-5 object-contain" /> KEAM
                    </button>
                    <button onClick={() => setSyllabusMode('kcet')} className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${syllabusMode === 'kcet' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}>
                      <img src="/kcet_logo.png" alt="" className="w-5 h-5 object-contain" /> KCET
                    </button>
                  </div>
                </div>
                <div className="bg-white/80 dark:bg-[#161923]/60 backdrop-blur-xl px-6 py-3 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-lg dark:shadow-black/20 flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{syllabusMode.toUpperCase()} Completion</div>
                    <div className="text-xl font-black text-slate-900 dark:text-white">{getOverallSyllabusProgress()}%</div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/5 flex items-center justify-center"><Trophy size={20} className="text-amber-500 dark:text-amber-400" /></div>
                </div>
              </div>
              <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar pb-2">
                {modeSubjects[syllabusMode]?.map(sub => (
                  <button key={sub} onClick={() => setActiveSubject(sub)} className={`px-6 py-4 rounded-2xl text-sm font-bold whitespace-nowrap transition-all flex flex-col items-start gap-2 border min-w-[150px] shadow-sm dark:shadow-lg dark:shadow-black/20 backdrop-blur-xl ${activeSubject === sub ? 'bg-slate-50 dark:bg-white/10 border-blue-400 dark:border-blue-500 text-blue-600 dark:text-blue-400' : 'bg-white/80 dark:bg-[#161923]/60 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-800 dark:hover:text-white'}`}>
                    <span className="uppercase text-[10px] tracking-widest opacity-70">{sub}</span>
                    <div className="flex items-center justify-between w-full">
                      <span className="text-lg">{getSubjectProgress(sub)}%</span>
                      <div className="w-10 h-1.5 bg-slate-200 dark:bg-black/50 rounded-full overflow-hidden"><div className="h-full bg-blue-500 transition-all duration-700" style={{ width: `${getSubjectProgress(sub)}%` }}></div></div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="grid gap-3 max-w-4xl">
                {CURRENT_SYLLABUS[activeSubject]?.map((chapter, idx) => {
                  const status = getChapterStatus(activeSubject, idx);
                  return (
                    <div key={idx} className="bg-white/80 dark:bg-[#161923]/60 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-blue-300 dark:hover:border-blue-500/30 transition-all shadow-sm dark:shadow-lg dark:shadow-black/10">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors border border-slate-100 dark:border-white/5 ${status === 2 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : status === 1 ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-500'}`}>
                          {status === 2 ? <CheckCircle2 size={20} /> : status === 1 ? <Clock size={20} /> : <Circle size={20} />}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-white text-sm leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{chapter}</h4>
                          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">{activeSubject} • Chapter {idx + 1}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateStatus(activeSubject, idx, 0)} className={`text-[10px] font-black px-3 py-1.5 rounded-lg border transition-all ${status === 0 ? 'bg-slate-100 dark:bg-white/10 border-slate-200 dark:border-white/20 text-slate-700 dark:text-slate-300' : 'bg-transparent border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'}`}>TODO</button>
                        <button onClick={() => updateStatus(activeSubject, idx, 1)} className={`text-[10px] font-black px-3 py-1.5 rounded-lg border transition-all ${status === 1 ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400' : 'bg-transparent border-transparent text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/5'}`}>WORKING</button>
                        <button onClick={() => updateStatus(activeSubject, idx, 2)} className={`text-[10px] font-black px-3 py-1.5 rounded-lg border transition-all ${status === 2 ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-transparent border-transparent text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/5'}`}>DONE</button>
                      </div>
                    </div>
                  );
                })}
              </div>
        </div>
      )}

          {activeTab === 'StudyRoom' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
              <PomodoroTimer>
                <div className="flex flex-col gap-6">
                   <div className="space-y-4">
                      <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Focus Subject</h4>
                        <div className="flex gap-2">
                           {modeSubjects[syllabusMode]?.map(sub => (
                             <button 
                               key={sub} 
                               onClick={() => { setActiveSubject(sub); setStudyChapter(UNIFIED_SYLLABUS[sub][0]); }}
                               className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all border ${activeSubject === sub ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-white dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10'}`}
                             >
                               {sub}
                             </button>
                           ))}
                        </div>
                      </div>

                      <div className="relative">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Select Chapter</h4>
                        <select 
                           value={studyChapter || (CURRENT_SYLLABUS[activeSubject]?.[0] || '')}
                           onChange={(e) => setStudyChapter(e.target.value)}
                           className="w-full bg-white dark:bg-[#161923] border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-blue-500 transition-all text-sm font-bold text-slate-800 dark:text-white appearance-none cursor-pointer"
                        >
                           {UNIFIED_SYLLABUS[activeSubject]?.map(chap => (
                             <option key={chap} value={chap}>{chap}</option>
                           ))}
                        </select>
                        <ChevronDown size={18} className="absolute right-6 bottom-4 text-slate-400 pointer-events-none" />
                      </div>
                   </div>

                   <button 
                      onClick={async () => {
                         setIsGeneratingPlan(true);
                         // This is a placeholder for the actual AI API call logic
                         // We simulate the call to create a premium "vibe"
                         setTimeout(() => {
                            setAiStudyPlan(`Deep Focus Session for ${studyChapter || 'this chapter'}:\n1. Master 3 Core Concepts\n2. Solve 15 High-Yield PYQs\n3. Rapid Active Recall`);
                            setIsGeneratingPlan(false);
                         }, 1500);
                      }}
                      className="w-full flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 text-white font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all group"
                   >
                      {isGeneratingPlan ? <RotateCcw size={18} className="animate-spin" /> : <Sparkles size={18} className="group-hover:animate-pulse" />}
                      Generate AI Study Plan
                   </button>
                </div>
              </PomodoroTimer>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2">
                    <ChapterResources 
                      chapter={studyChapter || CURRENT_SYLLABUS[activeSubject]?.[0] || 'Physics'} 
                      syllabusMode={syllabusMode} 
                      videoCache={videoCache}
                      setVideoCache={setVideoCache}
                    />
                 </div>
                 
                 <div className="space-y-6">
                    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 min-h-[300px] relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity"><Sparkles size={64} className="text-violet-500" /></div>
                       <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3 mb-6">
                          <Zap size={18} className="text-amber-500" /> AI Insights
                       </h3>
                       
                       {aiStudyPlan ? (
                          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                             {aiStudyPlan.split('\n').map((line, i) => (
                                <div key={i} className="flex gap-3">
                                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                   <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed">{line}</p>
                                </div>
                             ))}
                             <div className="mt-8 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest text-center">AI Plan Active</p>
                             </div>
                          </div>
                       ) : (
                          <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                             <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-4"><Search size={24} className="text-slate-300" /></div>
                             <p className="text-xs font-bold text-slate-400">Click generate to get your AI study roadmap.</p>
                          </div>
                       )}
                    </div>

                    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                        <div className="relative z-10">
                           <h4 className="font-black text-xs uppercase tracking-[0.2em] opacity-60 mb-2">Deep Work Streak</h4>
                           <div className="text-4xl font-black mb-4">4.2 <span className="text-sm opacity-60">Hours</span></div>
                           <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Keep going for a 15 min break</p>
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'Tests' && (
            <div className="max-w-4xl mx-auto mt-4 animate-in fade-in duration-500 flex flex-col items-center">
              <div className="w-full text-left mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><FolderSearch size={20} className="text-blue-600 dark:text-blue-500" /> Browse available papers</h3>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer group transition-colors">View full library <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></div>
                </div>
                <div className="bg-white/80 dark:bg-[#161923]/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm dark:shadow-lg dark:shadow-black/20">
                  <div className="relative mb-6">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="text" placeholder="Find a specific mock test or DPP..." className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-blue-500 transition-all text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { name: 'JEE Previous Year', count: '45 Papers', color: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20' },
                      { name: 'BITSAT Mock Series', count: '12 Papers', color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20' },
                      { name: 'NEET Practice', count: '30 Papers', color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' },
                      { name: 'Chapter DPPs', count: '150+ Sets', color: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20' },
                    ].map((category, idx) => (
                      <div key={idx} className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:opacity-80 ${category.color}`}>
                        <h4 className="font-bold text-xs mb-1 text-slate-900 dark:text-white">{category.name}</h4>
                        <p className="text-[10px] font-medium">{category.count}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="w-full h-px bg-slate-200 dark:bg-white/5 mb-12"></div>
              <div className="w-full max-w-4xl flex flex-col items-center gap-10 relative z-30 py-10">
                {/* Hero Section */}
                <div className="text-center space-y-4 max-w-2xl px-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest mb-2">
                    <Sparkles size={12} />
                    Exam Portal v2.0
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                    Practice with the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300">Advanced Parser</span>
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed">
                    Upload your PDF or JSON papers and experience a full-featured exam interface with real-time analytics, LaTeX rendering, and precise scoring.
                  </p>
                </div>

                {/* Launch Card */}
                <div className="w-full bg-white dark:bg-[#161923] rounded-[2.5rem] border border-slate-200 dark:border-[#333942] p-10 md:p-16 shadow-2xl dark:shadow-black/60 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-blue-600/10 transition-colors duration-700"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/5 rounded-full -ml-32 -mb-32 blur-3xl group-hover:bg-indigo-600/10 transition-colors duration-700"></div>
                  
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-[#0B0E14] rounded-3xl flex items-center justify-center border border-slate-200 dark:border-[#333942] shadow-sm mb-8 transform group-hover:rotate-6 transition-transform duration-500">
                      <FileText size={36} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Ready to start your exam?</h3>
                    
                    <a 
                      href="/exam-portal/index.html" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group/btn relative inline-flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-black text-lg shadow-[0_10px_30px_rgba(37,99,235,0.3)] hover:shadow-[0_15px_40px_rgba(37,99,235,0.5)] transition-all duration-300 hover:-translate-y-1"
                    >
                      <img src="/logo.png" className="w-6 h-6 object-contain" alt="" />
                      Launch Exam Portal
                      <ChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                    
                    <ul className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl">
                      {[
                        { icon: <Search size={18} />, text: 'OCR PDF Parsing' },
                        { icon: <Clock size={18} />, text: 'Timed Mock Tests' },
                        { icon: <Activity size={18} />, text: 'In-depth Analytics' },
                      ].map((item, i) => (
                        <li key={i} className="flex items-center justify-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 py-3 px-4 rounded-xl border border-slate-100 dark:border-white/10">
                          {item.icon}
                          {item.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Info Note */}
                <div className="flex items-start gap-3 p-5 rounded-2xl bg-amber-50 dark:bg-amber-500/5 border border-amber-200/50 dark:border-amber-500/20 max-w-2xl text-amber-800 dark:text-amber-200">
                  <Info size={20} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <p className="text-sm font-medium leading-relaxed">
                    <strong>Pro Tip:</strong> The portal runs independently in a new tab. 
                    Any papers you save in the portal will automatically appear in your dashboard history!
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Notes' && (
            <div className="animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">My Study Vault</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Access your hand-written notes and key snippets from PDFs.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setNoteTab('My Notes')} 
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${noteTab === 'My Notes' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg' : 'bg-white dark:bg-[#161923] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-[#333942] hover:border-slate-400'}`}
                    >
                        Notes
                    </button>
                    <button 
                        onClick={() => setNoteTab('My Highlights')} 
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${noteTab === 'My Highlights' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg' : 'bg-white dark:bg-[#161923] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-[#333942] hover:border-slate-400'}`}
                    >
                        Highlights
                    </button>
                    <button 
                        onClick={() => setNoteTab('Flashcards')} 
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${noteTab === 'Flashcards' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg' : 'bg-white dark:bg-[#161923] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-[#333942] hover:border-slate-400'}`}
                    >
                        Flashcards
                    </button>
                </div>
              </div>

              {noteTab === 'My Notes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
                  {[
                    { title: 'Thermodynamics Laws', subject: 'Physics', date: 'Oct 12', color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20' },
                    { title: 'Organic Named Reactions', subject: 'Chemistry', date: 'Oct 10', color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' },
                    { title: 'Calculus Integration Tricks', subject: 'Maths', date: 'Oct 08', color: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-500/20' },
                    { title: 'Human Reproduction', subject: 'Biology', date: 'Oct 05', color: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20' },
                  ].map((note, i) => (
                    <div key={i} className="bg-white/80 dark:bg-[#161923]/60 backdrop-blur-xl p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-lg dark:shadow-black/20 hover:border-blue-400 dark:hover:border-blue-500/50 transition cursor-pointer group">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${note.color}`}><FileText size={20} /></div>
                        <span className="text-xs font-bold text-slate-500">{note.date}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">{note.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest">{note.subject}</p>
                    </div>
                  ))}
                  <div className="bg-slate-50/50 dark:bg-[#0B0E14]/10 border-2 border-dashed border-slate-200 dark:border-[#333942] rounded-2xl flex flex-col items-center justify-center p-8 hover:border-blue-400 transition cursor-pointer group">
                    <Plus size={32} className="text-slate-300 group-hover:text-blue-500 mb-2" />
                    <span className="text-sm font-bold text-slate-400 group-hover:text-blue-500">Add New Note</span>
                  </div>
                </div>
              )}

              {noteTab === 'My Highlights' && (
                <div className="space-y-4 animate-in fade-in duration-500 pb-12">
                    {highlights.length === 0 ? (
                        <div className="py-24 text-center bg-slate-50/50 dark:bg-white/5 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/10 animate-in fade-in zoom-in duration-700">
                            <div className="w-20 h-20 bg-white dark:bg-[#0B0E14] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100 dark:border-white/5">
                                <Highlighter size={40} className="text-blue-500 opacity-40" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">No highlights yet</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Your saved snippets and equations from PDFs will appear here for quick review.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {highlights.map((h) => (
                                <div key={h.id} className="bg-white dark:bg-[#161923] p-5 rounded-2xl border border-slate-200 dark:border-[#333942] shadow-sm flex flex-col gap-4 group">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${
                                                h.color === 'green' ? 'bg-emerald-400 shadow-emerald-400/50' : 
                                                h.color === 'blue' ? 'bg-sky-400 shadow-sky-400/50' : 
                                                h.color === 'pink' ? 'bg-rose-400 shadow-rose-400/50' : 
                                                'bg-yellow-400 shadow-yellow-400/50'
                                            }`}></div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{h.resource?.title || 'Resource'} — Page {h.pageIndex + 1}</span>
                                        </div>
                                        <button 
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                if(!confirm('Remove this highlight?')) return;
                                                const res = await fetch(`/api/highlights/${h.id}`, {
                                                    method: 'DELETE',
                                                    headers: {'Content-Type': 'application/json'},
                                                    body: JSON.stringify({ userId: user.id })
                                                });
                                                if((await res.json()).success) {
                                                    setHighlights(prev => prev.filter(x => x.id !== h.id));
                                                }
                                            }}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-rose-500"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className={`text-sm font-medium border-l-4 pl-4 py-1.5 leading-relaxed rounded-r-lg transition-colors overflow-x-auto custom-scrollbar ${
                                        h.color === 'green' ? 'text-emerald-900 dark:text-emerald-50 border-emerald-400/50 bg-emerald-400/5 dark:bg-emerald-400/10' :
                                        h.color === 'blue' ? 'text-sky-900 dark:text-sky-50 border-sky-400/50 bg-sky-400/5 dark:bg-sky-400/10' :
                                        h.color === 'pink' ? 'text-rose-900 dark:text-rose-50 border-rose-400/50 bg-rose-400/5 dark:bg-rose-400/10' :
                                        'text-slate-700 dark:text-slate-300 border-yellow-400/50 bg-yellow-400/5 dark:bg-yellow-400/10'
                                    }`}>
                                        <Latex>{h.text}</Latex>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            const res = dbResources.find(r => r.id === h.resourceId);
                                            if(res) setSelectedResource(res);
                                        }}
                                        className="text-xs font-bold text-blue-600 hover:text-blue-500 flex items-center gap-1.5 self-start"
                                    >
                                        Jump to PDF <ArrowUpRight size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
              )}

              {noteTab === 'Flashcards' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
                    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20"><Zap size={28} /></div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">AI Magic Flashcards</h3>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Transform any chapter into active recall cards.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:flex-none">
                                <select 
                                    value={studyChapter}
                                    onChange={(e) => setStudyChapter(e.target.value)}
                                    className="bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 px-6 text-xs font-black text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 transition-all cursor-pointer appearance-none min-w-[200px]"
                                >
                                    {UNIFIED_SYLLABUS[activeSubject]?.map(chap => <option key={chap} value={chap}>{chap}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                            <button 
                                onClick={() => {
                                    setIsGeneratingFlashcards(true);
                                    setTimeout(() => {
                                        const cards = [
                                            { q: `What is the First Law of Thermodynamics for ${studyChapter}?`, a: "Energy cannot be created or destroyed, only transformed from one form to another." },
                                            { q: `State the significance of Entropy in ${studyChapter}.`, a: "Entropy is a measure of molecular randomness or disorder in the system." },
                                            { q: `Key formula for efficiency in ${studyChapter} cycles?`, a: "Efficiency (η) = Net work done (W) / Heat supplied (Q_in)" },
                                            { q: `What is an Adiabatic process?`, a: "A process in which no heat is transferred to or from the system." }
                                        ];
                                        setFlashcards(prev => ({ ...prev, [studyChapter]: cards }));
                                        setIsGeneratingFlashcards(false);
                                    }, 2000);
                                }}
                                disabled={isGeneratingFlashcards}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-8 py-3.5 rounded-2xl transition-all shadow-[0_10px_30px_rgba(79,70,229,0.3)] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                            >
                                {isGeneratingFlashcards ? <RotateCcw size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                {isGeneratingFlashcards ? 'Brewing...' : 'Generate Cards'}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {flashcards[studyChapter]?.map((card, i) => (
                            <Flashcard key={i} question={card.q} answer={card.a} />
                        )) || (
                            <div className="col-span-full py-24 text-center">
                                <Search size={48} className="mx-auto mb-4 text-slate-200 dark:text-white/5" />
                                <p className="text-sm font-bold text-slate-400 dark:text-slate-500 font-medium">Pick a chapter and hit generate to start your active recall session.</p>
                            </div>
                        )}
                    </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'Doubts' && (
            <div className="animate-in fade-in duration-500 max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Doubt Forum</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Get help from the community or test your knowledge by solving doubts.</p>
                </div>
                <button onClick={() => setShowAskDoubtModal(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-[0_4px_15px_rgba(37,99,235,0.2)] hover:bg-blue-700 transition flex items-center gap-2">
                  <HelpCircle size={16} /> Ask a Doubt
                </button>
              </div>

              <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Search for concepts, questions, or topics..." className="w-full bg-white dark:bg-[#161923]/80 border border-slate-200 dark:border-[#333942] rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium outline-none focus:border-blue-500 transition-all text-slate-900 dark:text-white shadow-sm dark:shadow-none" />
              </div>

              <div className="flex gap-3 border-b border-slate-200 dark:border-[#333942] pb-6 mb-8 overflow-x-auto no-scrollbar mask-gradient-right">
                {['All', 'Unanswered', 'My Doubts', 'Resolved'].map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setDoubtTab(tab)}
                    className={`whitespace-nowrap px-5 py-2 text-sm font-bold rounded-xl transition-all border ${doubtTab === tab ? 'bg-slate-100 dark:bg-[#22262e] text-slate-900 dark:text-white border-slate-200 dark:border-[#444b55]' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#22262e]/50'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {doubts.filter(d => {
                  if (doubtTab === 'Unanswered') return d.status === 'Unanswered' && d._count?.replies === 0;
                  if (doubtTab === 'My Doubts') return d.userId === user?.id;
                  if (doubtTab === 'Resolved') return d.status === 'Resolved';
                  return true;
                }).map((doubt) => (
                  <div key={doubt.id} onClick={() => setSelectedDoubt(doubt)} className="bg-white dark:bg-[#161923] p-7 rounded-2xl border border-slate-200 dark:border-[#333942] shadow-sm dark:shadow-lg dark:shadow-black/20 hover:border-slate-300 dark:hover:border-slate-600 transition duration-300 cursor-pointer group flex flex-col h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full pointer-events-none opacity-50"></div>
                    <div className="flex justify-between items-start mb-5 relative z-10">
                      <span className={`text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full ${getSubjectColor(doubt.subject)}`}>{doubt.subject}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${getStatusColor(doubt.status, doubt._count?.replies)}`}>{getStatusText(doubt.status, doubt._count?.replies)}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-8 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition leading-snug flex-1 relative z-10">{doubt.title}</h4>
                    <div className="border-t border-slate-100 dark:border-[#333942] pt-5 flex items-center gap-2.5 mt-auto relative z-10">
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-[#2d323c] overflow-hidden flex items-center justify-center text-slate-500 border border-slate-200 dark:border-[#444b55]">
                        {doubt.user?.picture ? <img src={doubt.user.picture} alt="" className="w-full h-full object-cover" /> : <User size={12} strokeWidth={3} />}
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{doubt.user?.name || 'Anonymous'} <span className="text-slate-400 dark:text-slate-500 font-medium ml-1">• {timeAgo(doubt.createdAt)}</span></span>
                    </div>
                  </div>
                ))}
                {doubts.length === 0 && (
                  <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400 font-medium">No doubts asked yet. Be the first!</div>
                )}
              </div>
            </div>
          )}


          {activeTab !== 'Home' && activeTab !== 'Tests' && activeTab !== 'Resources' && activeTab !== 'Syllabus' && activeTab !== 'Notes' && activeTab !== 'Profile' && activeTab !== 'Community' && activeTab !== 'Goals' && activeTab !== 'Doubts' && activeTab !== 'ChapterPYQs' && activeTab !== 'StudyRoom' && (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-300 dark:border-white/10 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-md">
              <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 mb-2">{activeTab}</h3>
              <p className="text-sm text-slate-400 dark:text-slate-500 text-center max-w-sm">This section is currently under development.</p>
            </div>
          )}

          {showAskDoubtModal && (
            <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#161923] rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-[#333942] relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <form onSubmit={handleAskDoubt}>
                  <div className="p-6 border-b border-slate-100 dark:border-[#333942] flex justify-between items-center">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Ask a Doubt</h3>
                    <button type="button" onClick={() => setShowAskDoubtModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"><X size={20} /></button>
                  </div>
                  <div className="p-6 space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Subject</label>
                      <select name="subject" required className="w-full bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-[#333942] rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all text-sm font-medium text-slate-900 dark:text-white appearance-none">
                        <option value="Physics">Physics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Maths">Maths</option>
                        <option value="Biology">Biology</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Question Title</label>
                      <input type="text" name="title" required placeholder="A short, clear title..." className="w-full bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-[#333942] rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all text-sm font-medium text-slate-900 dark:text-white" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Description</label>
                      <textarea name="content" required rows="4" placeholder="Explain your doubt in detail..." className="w-full bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-[#333942] rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all text-sm font-medium text-slate-900 dark:text-white resize-none"></textarea>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Attach Media (Optional)</label>
                      <div className="flex flex-col gap-3">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => setDoubtImage(reader.result);
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden" 
                          id="doubt-image-upload" 
                        />
                        <label 
                          htmlFor="doubt-image-upload" 
                          className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-slate-200 dark:border-[#333942] rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-sm font-bold text-slate-500 dark:text-slate-400"
                        >
                          <ImageIcon size={18} /> {doubtImage ? 'Change Image' : 'Upload Image'}
                        </label>
                        {doubtImage && (
                          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-[#333942]">
                            <img src={doubtImage} alt="Preview" className="w-full h-full object-cover" />
                            <button 
                              type="button" 
                              onClick={() => setDoubtImage(null)} 
                              className="absolute top-2 right-2 bg-rose-500 text-white p-1.5 rounded-lg shadow-lg hover:bg-rose-600 transition"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-6 border-t border-slate-100 dark:border-[#333942] bg-slate-50 dark:bg-[#1C1F29]/50 flex justify-end gap-3">
                      <button type="button" onClick={() => setShowAskDoubtModal(false)} className="py-2.5 px-5 rounded-xl font-bold border border-slate-200 dark:border-[#444b55] text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-[#22262e] transition-all text-sm">Cancel</button>
                      <button type="submit" disabled={isSubmittingDoubt} className="py-2.5 px-6 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-[0_4px_15px_rgba(37,99,235,0.2)] transition-all text-sm flex items-center justify-center min-w-[120px] disabled:opacity-50">
                        {isSubmittingDoubt ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Post Doubt'}
                      </button>
                  </div>
                </form>
              </div>
            </div>
          )}


          {showEditModal && (
            <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#161923] rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-[#333942] relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 dark:border-[#333942]">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Edit Profile</h3>
                    <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"><X size={20} /></button>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Full Name</label>
                    <input type="text" defaultValue={user?.name || ''} className="w-full bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-[#333942] rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all text-sm font-medium text-slate-900 dark:text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Email Address</label>
                    <input type="email" defaultValue={user?.email || ''} readOnly className="w-full bg-slate-100 dark:bg-[#0B0E14]/50 border border-slate-200 dark:border-[#333942] rounded-xl px-4 py-3 outline-none text-sm font-medium text-slate-500 opacity-70 cursor-not-allowed" />
                  </div>
                </div>
                <div className="p-6 border-t border-slate-100 dark:border-[#333942] bg-slate-50 dark:bg-[#1C1F29]/50 flex gap-3">
                    <button onClick={() => setShowEditModal(false)} className="flex-1 py-3 px-4 rounded-xl font-bold border border-slate-200 dark:border-[#444b55] text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-[#22262e] transition-all text-sm">Cancel</button>
                    <button onClick={() => setShowEditModal(false)} className="flex-1 py-3 px-4 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-[0_4px_15px_rgba(37,99,235,0.2)] transition-all text-sm">Save Changes</button>
                </div>
              </div>
            </div>
          )}

          {showSettingsModal && (
            <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#161923] rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-[#333942] relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 dark:border-[#333942]">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Account Settings</h3>
                    <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"><X size={20} /></button>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Theme Preferences</h4>
                    <p className="text-[11px] text-slate-500 font-medium mb-3">Choose how PaperBase looks to you.</p>
                    <div className="flex bg-slate-100 dark:bg-[#0B0E14] p-1 rounded-xl border border-slate-200 dark:border-[#333942]">
                        <button onClick={() => !isDarkMode && setIsDarkMode(false)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!isDarkMode ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Light</button>
                        <button onClick={() => !isDarkMode && setIsDarkMode(true)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${isDarkMode ? 'bg-[#22262e] shadow-sm text-white border border-[#333942]' : 'text-slate-500 hover:text-slate-300'}`}>Dark</button>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-slate-100 dark:border-[#333942]">
                    <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400 mb-1">Danger Zone</h4>
                    <p className="text-[11px] text-slate-500 font-medium mb-4">Permanently delete your account and all progress.</p>
                    <button className="w-full py-3 rounded-xl border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm font-bold bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all">Delete Account</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <style dangerouslySetInnerHTML={{ __html: `
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #333942; border-radius: 20px; }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #444b55; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
        `}} />
      </div>

      {/* Global Overlays - High z-index to cover sidebar and main content */}
      {showUploadModal && (
        <UploadResourceModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUploadResource}
          user={user}
        />
      )}

      {selectedResource && (
        <ResourceViewerModal
          resource={selectedResource}
          user={user}
          onClose={() => setSelectedResource(null)}
          onLike={handleLikeResource}
        />
      )}

      {editingResource && (
         <EditResourceModal 
            resource={editingResource} 
            onClose={() => setEditingResource(null)} 
            onUpdate={handleUpdateResource}
            isUpdating={isUpdatingResource}
         />
      )}

      {reportingResource && (
         <ReportResourceModal 
            resource={reportingResource} 
            onClose={() => setReportingResource(null)} 
            onReport={handleReportResource}
         />
      )}

      {selectedDoubt && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white dark:bg-[#161923] rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-200 dark:border-[#333942] relative flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-[#333942] flex justify-between items-center bg-slate-50 dark:bg-[#0B0E14]">
              <div className="flex gap-2 items-center">
                <span className={`text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full ${getSubjectColor(selectedDoubt.subject)}`}>{selectedDoubt.subject}</span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${getStatusColor(selectedDoubt.status, selectedDoubt._count?.replies || selectedDoubt.replies?.length)}`}>{getStatusText(selectedDoubt.status, selectedDoubt._count?.replies || selectedDoubt.replies?.length)}</span>
              </div>
              <div className="flex gap-2">
                {user?.id === selectedDoubt.userId && (
                  <>
                    {selectedDoubt.status !== 'Resolved' && (
                      <button onClick={handleResolveDoubt} className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition">Mark Resolved</button>
                    )}
                    <button onClick={() => handleDeleteDoubt(selectedDoubt.id)} className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5">
                      <Trash2 size={12} /> Delete
                    </button>
                  </>
                )}
                <button onClick={() => setSelectedDoubt(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"><X size={20} /></button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-white dark:bg-[#161923] no-scrollbar">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-4 leading-snug">{selectedDoubt.title}</h2>
                {selectedDoubt.imageUrl && (
                  <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200 dark:border-[#333942] bg-slate-100 dark:bg-black/20">
                    <img src={selectedDoubt.imageUrl} alt="Doubt Context" className="w-full h-auto max-h-[400px] object-contain mx-auto" />
                  </div>
                )}
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{selectedDoubt.content}</p>
                <div className="flex items-center gap-2 mt-6">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#2d323c] overflow-hidden flex items-center justify-center text-slate-500 border border-slate-200 dark:border-[#444b55]">
                    {selectedDoubt.user?.picture ? <img src={selectedDoubt.user.picture} alt="" className="w-full h-full object-cover" /> : <User size={14} strokeWidth={3} />}
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedDoubt.user?.name || 'Anonymous'} <span className="text-slate-400 dark:text-slate-500 font-medium ml-1 flex items-center gap-1"><Clock size={12}/>{timeAgo(selectedDoubt.createdAt)}</span></span>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-[#333942] pt-6">
                <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2"><MessageSquare size={16} /> {selectedDoubt.replies ? selectedDoubt.replies.length : 0} Replies</h3>
                
                {selectedDoubt.replies?.length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium bg-slate-50 dark:bg-[#0B0E14] p-4 rounded-xl text-center">No replies yet. Can you help?</p>
                )}

                <div className="space-y-4">
                    {selectedDoubt.replies?.map((reply, idx) => (
                        <div key={idx} className="bg-slate-50 dark:bg-[#1C1F29]/50 p-4 rounded-2xl border border-slate-200 dark:border-[#333942]">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 whitespace-pre-wrap">{reply.content}</p>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-[#2d323c] overflow-hidden flex items-center justify-center text-slate-500">
                                {reply.user?.picture ? <img src={reply.user.picture} alt="" className="w-full h-full object-cover" /> : <User size={10} strokeWidth={3} />}
                              </div>
                              <span className="text-xs font-bold text-slate-900 dark:text-white flex-1">{reply.user?.name || 'Anonymous'} <span className="text-slate-400 dark:text-slate-500 font-medium ml-1">• {timeAgo(reply.createdAt)}</span></span>
                              {user?.id === reply.userId && (
                                <button onClick={() => handleDeleteReply(reply.id)} className="text-slate-400 hover:text-rose-500 transition-colors p-1">
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-[#333942] bg-slate-50 dark:bg-[#0B0E14]">
                <form onSubmit={handleReplyDoubt} className="flex gap-3">
                    <input type="text" name="content" required placeholder="Type your reply..." disabled={isSubmittingDoubt} className="flex-1 bg-white dark:bg-[#161923] border border-slate-200 dark:border-[#333942] rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all text-sm font-medium text-slate-900 dark:text-white disabled:opacity-50" />
                    <button type="submit" disabled={isSubmittingDoubt} className="bg-blue-600 text-white px-5 rounded-xl text-sm font-bold shadow-[0_4px_15px_rgba(37,99,235,0.2)] hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center min-w-[100px]">
                        {isSubmittingDoubt ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Reply'}
                    </button>
                </form>
            </div>
          </div>
        </div>
      )}

      {/* Policy Acceptance Modal */}
      <PolicyAcceptanceModal 
        isOpen={showPolicyModal} 
        onAccept={handleAcceptPolicies} 
        onCancel={() => { 
          setShowPolicyModal(false); 
          setPendingResource(null); 
          if(activeTab === 'Resources') setActiveTab('Home');
        }} 
      />
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <div onClick={onClick} className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'}`}>
      {icon}
      <span className="text-sm font-bold">{label}</span>
    </div>
  );
}
