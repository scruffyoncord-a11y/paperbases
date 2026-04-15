import React from 'react';
import { 
  CheckCircle2, Star, ShieldCheck, GraduationCap, Award
} from 'lucide-react';

export const timeAgo = (dateStr) => {
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

export const chr = (n) => String.fromCharCode(n);

export const getSubjectColor = (subject) => {
  switch(subject?.toUpperCase()) {
    case 'PHYSICS': return 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 'CHEMISTRY': return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    case 'MATHS': return 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400';
    case 'BIOLOGY': return 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400';
    default: return 'bg-slate-50 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400';
  }
};

export const UserBadge = ({ u }) => {
    if (!u) return null;
    if (u.profession === 'Teacher') return <div className="flex items-center gap-1 group/badge"><ShieldCheck size={12} className="text-amber-500" /><span className="text-[9px] font-black uppercase tracking-tighter text-amber-600 dark:text-amber-400 opacity-0 group-hover/badge:opacity-100 transition-opacity">Expert</span></div>;
    if (u.profession === 'Aspirant') return <div className="flex items-center gap-1 group/badge"><GraduationCap size={12} className="text-blue-500" /><span className="text-[9px] font-black uppercase tracking-tighter text-blue-600 dark:text-blue-400 opacity-0 group-hover/badge:opacity-100 transition-opacity">Student</span></div>;
    if (u.profession === 'Mentor') return <div className="flex items-center gap-1 group/badge"><Award size={12} className="text-purple-500" /><span className="text-[9px] font-black uppercase tracking-tighter text-purple-600 dark:text-purple-400 opacity-0 group-hover/badge:opacity-100 transition-opacity">Mentor</span></div>;
    return null;
};

// Custom hook for reliable MathJax loading & configuration
export function useMathJax() {
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

// LaTeX Renderer Component with surgical wrapping to preserve spaces
export const Latex = ({ children, inline = true }) => {
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
