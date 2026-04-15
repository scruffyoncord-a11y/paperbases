import React from 'react';
import { 
  Search, Sparkles, X, UploadCloud, FileText, ClipboardList, Layers, Settings, Trash2, FolderSearch, Book,
  Heart, ThumbsUp, ThumbsDown, Flag, ExternalLink, Activity
} from 'lucide-react';

export const ResourceCard = ({ res, user, handleLikeResource, handleDislikeResource, setReportingResource, openResource }) => {
  const hasLiked = res.likes?.some(l => l.userId === user?.id);
  const hasDisliked = res.dislikes?.some(d => d.userId === user?.id);

  return (
    <div 
        onClick={() => openResource(res)}
        className="bg-white/80 dark:bg-[#161923]/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-sm hover:border-violet-500/40 transition-all group cursor-pointer overflow-hidden flex flex-col h-full hover:shadow-2xl hover:shadow-violet-500/5 active:scale-[0.98]"
    >
        <div className="aspect-[4/3] w-full bg-slate-50 dark:bg-[#0B0E14] relative overflow-hidden flex items-center justify-center border-b border-slate-100 dark:border-white/5 group-hover:bg-slate-100/50 dark:group-hover:bg-white/[0.02] transition-colors">
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] group-hover:opacity-[0.07] transition-opacity scale-150 rotate-12">
                <FileText size={160} />
            </div>
            
            {/* Subject Badge */}
            <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{res.subject}</span>
            </div>

            {/* AI High-Performance Badge */}
            <div className="absolute bottom-4 right-4 z-10 w-8 h-8 rounded-xl bg-violet-600/10 text-violet-500 flex items-center justify-center border border-violet-500/20 shadow-lg shadow-violet-500/10 group-hover:bg-violet-600 group-hover:text-white transition-all">
                <Sparkles size={16} />
            </div>

            {res.fileType === 'pdf' ? (
                <div className="flex flex-col items-center gap-2 group-hover:scale-110 transition-transform">
                    <div className="w-12 h-16 bg-rose-500 rounded-md relative shadow-lg overflow-hidden flex flex-col">
                        <div className="h-4 bg-rose-600 flex items-center px-1">
                            <div className="w-1 h-1 rounded-full bg-white/50" />
                        </div>
                        <div className="flex-1 flex items-center justify-center text-white font-black text-[10px]">PDF</div>
                    </div>
                </div>
            ) : (
                <Activity size={32} className="text-slate-300" />
            )}
        </div>
        
        <div className="p-7 flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                    <Activity size={10} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{res.tag || 'Standard'}</span>
            </div>
            
            <h4 className="font-black text-slate-900 dark:text-white text-[15px] mb-2 group-hover:text-violet-500 transition-colors leading-snug line-clamp-2">{res.title}</h4>
            <p className="text-[11px] text-slate-500/80 leading-relaxed line-clamp-2 mb-6 font-medium">{res.description}</p>
            
            <div className="mt-auto pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleLikeResource(res.id); }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${hasLiked ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-blue-500'}`}
                    >
                        <ThumbsUp size={14} className={hasLiked ? 'fill-current' : ''} />
                        <span className="text-[10px] font-black">{res._count?.likes || 0}</span>
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleDislikeResource(res.id); }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${hasDisliked ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-rose-500'}`}
                    >
                        <ThumbsDown size={14} className={hasDisliked ? 'fill-current' : ''} />
                    </button>
                </div>
                
                <button 
                    onClick={(e) => { e.stopPropagation(); setReportingResource(res); }}
                    className="p-2 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-500/5 transition-all"
                >
                    <Flag size={14} />
                </button>
            </div>
        </div>
    </div>
  );
};

export const ResourcesView = ({ 
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
        }, 150);
        return () => clearTimeout(timer);
    }, [localQuery, setSearchQuery]);

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
