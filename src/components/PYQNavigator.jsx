import React, { useState, useEffect } from 'react';
import { 
  Zap, ArrowRight, ArrowLeft, RotateCcw, Star, Share2 
} from 'lucide-react';

const chr = (n) => String.fromCharCode(n);

// Assuming Latex is passed from parent or we import it. 
// For now, I'll pass it as a prop or assume it's globally available if we keep it in main.
// Actually, I'll move Latex to a common component file.

export const PYQNavigator = ({ user, Latex }) => {
  const [chapters, setChapters] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [years, setYears] = useState('last_5');
  const [showExplanation, setShowExplanation] = useState({});

  useEffect(() => {
    fetch('/api/pyqs/chapters')
      .then(res => res.json())
      .then(data => {
        if (data.success) setChapters(data.chapters);
      })
      .catch(console.error);
  }, []);

  const loadQuestions = (chapKey) => {
    setLoading(true);
    setSelectedChapter(chapKey);
    fetch(`/api/pyqs/questions?chapter=${chapKey}&years=${years}&limit=20`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setQuestions(data.questions);
          setShowExplanation({});
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const toggleExplanation = (idx) => {
    setShowExplanation(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-transparent animate-in fade-in duration-500">
      {!selectedChapter ? (
        <div className="p-8 max-w-6xl mx-auto w-full">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                <Zap size={32} className="text-amber-500" /> Maths PYQ Vault
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold mt-1 uppercase tracking-widest text-[10px]">14,000+ JEE Mains Questions from 2013-2024</p>
            </div>
            <div className="flex gap-2">
               {['last_5', 'last_10', 'all'].map(v => (
                 <button 
                  key={v} 
                  onClick={() => setYears(v)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${years === v ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-white dark:bg-white/5 text-slate-400 border border-slate-200 dark:border-white/10'}`}
                 >
                   {v.replace('_', ' ')}
                 </button>
               ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {chapters && chapters['Maths'] && chapters['Maths'].map(chap => (
               <button 
                key={chap.key} 
                onClick={() => loadQuestions(chap.key)}
                className="group p-6 rounded-[2rem] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-amber-500/50 transition-all hover:shadow-xl text-left relative overflow-hidden active:scale-95"
               >
                 <div className="absolute -top-4 -right-4 w-16 h-16 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors"></div>
                 <h3 className="font-black text-slate-900 dark:text-white text-sm leading-tight mb-2 group-hover:text-amber-500 transition-colors">{chap.name}</h3>
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{chap.total} Questions</span>
                    <ArrowRight size={14} className="text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                 </div>
               </button>
             ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
           <div className="p-6 bg-white dark:bg-[#0B0E14] border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <button onClick={() => setSelectedChapter(null)} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all">
                    <ArrowLeft size={20} />
                 </button>
                 <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{chapters['Maths'].find(c => c.key === selectedChapter)?.name}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">JEE Mains PYQs • {years.replace('_', ' ')}</p>
                 </div>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => loadQuestions(selectedChapter)} className="p-2 ml-4 rounded-xl text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 transition-all">
                    <RotateCcw size={18} />
                 </button>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                   <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Digging through vault...</p>
                </div>
              ) : (
                <>
                  {questions.map((q, idx) => (
                    <div key={idx} className="bg-white dark:bg-[#0B0E14] rounded-[2.5rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                       <div className="p-8">
                          <div className="flex items-center justify-between mb-6">
                             <div className="flex items-center gap-2">
                                <span className="px-3 py-1 rounded-lg bg-amber-500 text-white text-[11px] font-black shadow-lg shadow-amber-500/20">#{idx + 1}</span>
                                <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-tight">{q.year}</span>
                                {q.difficulty && <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight ${q.difficulty === 'Hard' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>{q.difficulty}</span>}
                             </div>
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{q.type}</span>
                          </div>

                          <div className="text-[17px] font-bold text-slate-900 dark:text-white leading-relaxed mb-8">
                             {Latex ? <Latex>{q.question}</Latex> : q.question}
                          </div>

                          {q.options && q.options.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                               {q.options.map((opt, oIdx) => (
                                 <div key={oIdx} className="p-5 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex items-center gap-4 group hover:border-amber-500/30 transition-all cursor-pointer">
                                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center text-[11px] font-black text-slate-400 border border-slate-200 dark:border-white/10 group-hover:text-amber-500 group-hover:border-amber-500 transition-all">
                                       {chr(65 + oIdx)}
                                    </div>
                                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                       {Latex ? <Latex>{opt}</Latex> : opt}
                                    </div>
                                 </div>
                               ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                             <div className="flex gap-4">
                                <button 
                                 onClick={() => toggleExplanation(idx)}
                                 className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
                                >
                                   {showExplanation[idx] ? 'Hide Solution' : 'View Correct Answer'}
                                </button>
                                <button className="px-6 py-3 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 font-black text-[11px] uppercase tracking-widest hover:bg-violet-500/20 transition-all">
                                   Discuss Doubt
                                </button>
                             </div>
                             <div className="flex gap-2">
                                <button className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-amber-500 transition-all">
                                   <Star size={18} />
                                </button>
                                <button className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-blue-500 transition-all">
                                   <Share2 size={18} />
                                </button>
                             </div>
                          </div>

                          {showExplanation[idx] && (
                            <div className="mt-8 p-8 rounded-[2rem] bg-amber-50 dark:bg-amber-500/5 border border-amber-200/50 dark:border-amber-500/10 animate-in slide-in-from-top-4 duration-500">
                               <div className="flex items-center gap-2 mb-4">
                                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                  <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Correct Response: {q.correct_options.join(', ') || q.answer}</span>
                               </div>
                               <div className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed explanation-content">
                                  <h4 className="text-[11px] font-black uppercase text-slate-400 mb-3 tracking-widest">Step-by-Step Logic</h4>
                                  {Latex ? <Latex>{q.explanation || 'Detailed explanation not available in the vault yet.'}</Latex> : (q.explanation || 'Detailed explanation not available in the vault yet.')}
                                </div>
                            </div>
                          )}
                       </div>
                    </div>
                  ))}
                  <div className="py-10 text-center opacity-30">
                     <p className="text-[10px] font-bold uppercase tracking-[0.3em]">End of Vault Results</p>
                  </div>
                </>
              )}
           </div>
        </div>
      )}
    </div>
  );
};
