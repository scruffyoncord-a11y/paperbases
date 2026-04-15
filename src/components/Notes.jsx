import React, { useState } from 'react';
import { 
  RotateCcw 
} from 'lucide-react';

export const Flashcard = ({ question, answer }) => {
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
