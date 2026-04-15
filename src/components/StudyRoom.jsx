import React, { useState, useEffect } from 'react';
import { 
  RotateCcw 
} from 'lucide-react';

export const PomodoroTimer = ({ children }) => {
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
