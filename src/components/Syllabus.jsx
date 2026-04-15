import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Clock, Circle, ArrowLeft, BookOpen, Target, Search, Filter, MonitorPlay, PlayCircle, Trophy, BarChart3, ChevronDown, ChevronRight, Flame, TrendingUp, TrendingDown
} from 'lucide-react';

export const ChapterResources = ({ chapter, syllabusMode, videoCache, setVideoCache }) => {
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
        </div>
      )}
    </div>
  );
};

// Internal Mock Helper (as used in original App.jsx)
const getMockChapterStats = (chapter) => {
    const hash = chapter.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return {
      totalQs: 200 + (hash % 150),
      solvedQs: 50 + (hash % 100),
      isHighWeightage: hash % 7 === 0,
      recentQs: 12 + (hash % 8),
      isTrendingUp: hash % 3 === 0
    };
};

export const ChapterPYQsView = ({ 
  selectedExamForPYQ, exams, modeSubjects, pyqSubject, setPyqSubject, pyqSubjectThemes, 
  CURRENT_SYLLABUS, setActiveTab, loadQuestions 
}) => {
    const examConfig = selectedExamForPYQ || exams[0];
    const availableSubjects = modeSubjects[examConfig.id] || modeSubjects['jee'];

    useEffect(() => {
      if (!availableSubjects.includes(pyqSubject)) {
        setPyqSubject(availableSubjects[0]);
      }
    }, [examConfig, availableSubjects, pyqSubject, setPyqSubject]);

    const chapters = CURRENT_SYLLABUS[pyqSubject] || [];
    const activeTheme = pyqSubjectThemes[pyqSubject] || pyqSubjectThemes['Physics'];

    return (
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto space-y-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white/80 dark:bg-[#161923]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-sm dark:shadow-2xl dark:shadow-black/40">
          <div className={`absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[100px] opacity-20 ${activeTheme.color} pointer-events-none`}></div>
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4 md:gap-6">
              <button 
                onClick={() => setActiveTab('Home')} 
                className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-2xl bg-white dark:bg-[#0B0E14] text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 flex items-center justify-center transition-all hover:scale-105 shadow-sm"
              >
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
              const theme = pyqSubjectThemes[sub] || theme['Maths'];
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {chapters.map((chapter, index) => {
                const stats = getMockChapterStats(chapter);
                const progressPercent = Math.round((stats.solvedQs / stats.totalQs) * 100);
                const isMastered = progressPercent >= 80;
                
                return (
                  <div key={index} onClick={() => loadQuestions(chapter)} className="group flex flex-col bg-white/80 dark:bg-[#161923]/60 backdrop-blur-xl rounded-[2rem] border border-slate-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500/50 p-6 transition-all shadow-sm hover:shadow-xl dark:shadow-black/20 cursor-pointer overflow-hidden relative min-h-[280px]">
                    <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[50px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none ${activeTheme.color}`}></div>
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border ${activeTheme.border} ${activeTheme.text}`}>
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
                        <span>{stats.totalQs} questions</span>
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
