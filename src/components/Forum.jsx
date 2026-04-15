import React from 'react';
import { 
  Search, ImageIcon, Send, HelpCircle, CheckCircle2, User, Trophy, Award, TrendingUp, MessageCircle, MessageSquare, ChevronUp, ChevronDown, Share2, Trash2, Link as LinkIcon
} from 'lucide-react';
import { timeAgo, getSubjectColor, UserBadge } from './SharedComponents';

export const DoubtsView = ({ 
  setShowAskDoubtModal, doubtSubjectFilter, setDoubtSubjectFilter, doubts, setSelectedDoubt 
}) => (
  <section className="animate-in fade-in duration-500 max-w-7xl mx-auto">
    {/* Hero Section */}
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 md:p-12 mb-8 relative overflow-hidden shadow-2xl shadow-blue-900/20">
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">Got a doubt? We got the solution.</h2>
        <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-[#161923] p-2 rounded-2xl md:rounded-full shadow-lg">
          <div className="flex-1 flex items-center pl-4">
            <Search className="text-slate-400" size={20} />
            <input type="text" placeholder="Type your question..." className="w-full bg-transparent border-none py-3 px-4 text-slate-900 dark:text-white font-medium outline-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAskDoubtModal(true)} className="flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition-colors px-4 py-3 rounded-xl md:rounded-full text-sm font-bold"><ImageIcon size={18} /> <span className="hidden sm:inline">Upload</span></button>
            <button onClick={() => setShowAskDoubtModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-md px-6 py-3 rounded-xl md:rounded-full text-sm font-bold"><Send size={18} /> Ask</button>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3 space-y-6">
        {/* Subject Category Filters */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar mask-gradient-right pb-2">
          {['All', 'Maths', 'Physics', 'Chemistry', 'Biology'].map(sub => (
            <button 
              key={sub}
              onClick={() => setDoubtSubjectFilter(sub)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${doubtSubjectFilter === sub ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md border-transparent' : 'bg-white dark:bg-[#161923] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'}`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Doubt Cards List */}
        <div className="grid grid-cols-1 gap-4">
          {doubts.filter(d => doubtSubjectFilter === 'All' || d.subject === doubtSubjectFilter).length === 0 ? (
              <div className="py-24 text-center">
                  <HelpCircle size={48} className="mx-auto text-slate-300 dark:text-white/10 mb-4" />
                  <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No doubts found</h3>
                  <p className="text-slate-500 mt-2">Try switching subjects or ask a new question.</p>
              </div>
          ) : doubts.filter(d => doubtSubjectFilter === 'All' || d.subject === doubtSubjectFilter).map((doubt) => (
              <div key={doubt.id} onClick={() => setSelectedDoubt(doubt)} className="bg-white dark:bg-[#161923] border border-slate-200 dark:border-white/5 rounded-2xl p-5 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-500/30 transition-all cursor-pointer group flex flex-col xl:flex-row gap-6">
                  <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                          <span className={`text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded-md ${getSubjectColor(doubt.subject)}`}>{doubt.subject}</span>
                          {doubt.status === 'Resolved' && <span className="text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center gap-1"><CheckCircle2 size={12}/> Expert Verified</span>}
                          {doubt.status !== 'Resolved' && <span className="text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">Needs Answer</span>}
                      </div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">{doubt.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">{doubt.content}</p>
                      
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden flex items-center justify-center">
                                  {doubt.user?.picture ? <img src={doubt.user.picture} className="w-full h-full object-cover" alt={doubt.user.name}/> : <User size={12} className="text-slate-400" />}
                              </div>
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{doubt.user?.name || "User"}</span>
                              <UserBadge u={doubt.user} />
                              <span className="text-[10px] text-slate-400 font-medium ml-2">• {timeAgo(doubt.createdAt)}</span>
                          </div>
                      </div>
                  </div>
                  {doubt.imageUrl && (
                      <div className="w-full xl:w-32 h-32 shrink-0 rounded-xl overflow-hidden bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 self-center">
                          <img src={doubt.imageUrl} className="w-full h-full object-cover" alt="Doubt media" />
                      </div>
                  )}
                  <div className="flex xl:flex-col items-center justify-center gap-2 justify-end border-t xl:border-t-0 xl:border-l border-slate-100 dark:border-white/5 pt-4 xl:pt-0 xl:pl-6">
                      {doubt.status === 'Resolved' ? (
                          <button className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 px-5 py-2.5 rounded-xl text-sm font-bold transition-all w-full xl:w-auto text-nowrap">View Solution</button>
                      ) : (
                          <button className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 px-5 py-2.5 rounded-xl text-sm font-bold transition-all w-full xl:w-auto flex items-center justify-center gap-2 text-nowrap">Provide Answer</button>
                      )}
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mt-1 w-full text-nowrap">{doubt._count?.replies || 0} Answers</div>
                  </div>
              </div>
          ))}
        </div>
      </div>

      {/* Right Sidebar - Educational Metrics */}
      <div className="space-y-6">
        <div className="bg-gradient-to-b from-amber-50 to-white dark:from-amber-500/10 dark:to-[#161923] border border-amber-200 dark:border-amber-500/20 p-6 rounded-3xl relative overflow-hidden">
           <Trophy size={100} className="absolute -bottom-8 -right-8 text-amber-500/20 rotate-12 pointer-events-none" />
           <h3 className="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2 text-lg"><Award className="text-amber-500" size={20} /> Top Experts</h3>
           <div className="space-y-4 relative z-10">
              {[...doubts].filter(d => d.user && d.user.profession === 'Teacher').slice(0, 3).map((d, i) => (
                  <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-xs font-black text-slate-400 shadow-sm">#{i+1}</div>
                      <div className="flex-1">
                          <div className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{d.user.name}</div>
                          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-widest">{d.user.experience}</div>
                      </div>
                  </div>
              ))}
              {doubts.filter(d => d.user && d.user.profession === 'Teacher').length === 0 && (
                  <div className="text-sm text-slate-500 font-medium">No verified experts active recently.</div>
              )}
           </div>
        </div>

        <div className="bg-white/80 dark:bg-[#161923]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 p-6 rounded-3xl">
          <h3 className="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2 text-lg"><TrendingUp className="text-blue-500" size={20} /> Recommended</h3>
          <div className="space-y-3">
              {doubts.slice(0, 4).map((d, i) => (
                  <div key={i} onClick={() => setSelectedDoubt(d)} className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 line-clamp-2 leading-snug">{d.title}</h4>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                         <span><MessageCircle size={10} className="inline mr-1" />{d._count?.replies} answers</span>
                      </div>
                  </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export const CommunityView = ({ 
  user, setShowAskDoubtModal, activeFilter, setActiveFilter, doubts, setSelectedDoubt, handleDeleteDoubt 
}) => (
  <section className="animate-in fade-in duration-500">
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3 space-y-4">
        {/* Post Creation (Reddit Style Top Bar) */}
        <div className="bg-white/80 dark:bg-[#161923]/60 backdrop-blur-xl border border-slate-200 dark:border-[#333942] rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center shrink-0">
              {user?.picture ? <img src={user.picture} className="w-full h-full rounded-full" alt={user.name}/> : <User size={20} className="text-slate-400" />}
          </div>
          <button onClick={() => setShowAskDoubtModal(true)} className="flex-1 text-left bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl px-5 py-2.5 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">Create Post</button>
          <div className="flex gap-2">
            <button onClick={() => setShowAskDoubtModal(true)} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"><ImageIcon size={20} /></button>
            <button onClick={() => setShowAskDoubtModal(true)} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"><LinkIcon size={20} /></button>
          </div>
        </div>

        <div className="flex bg-white/40 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 p-1 mb-4 w-fit">
          {['All', 'Unanswered', 'Resolved'].map(filter => (
             <button 
              key={filter} 
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeFilter === filter ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              onClick={() => setActiveFilter(filter)}
             >
               {filter}
             </button>
          ))}
        </div>

        {doubts.filter(d => {
          if (activeFilter === 'Unanswered') return d.status === 'Unanswered' && d._count?.replies === 0;
          if (activeFilter === 'Resolved') return d.status === 'Resolved';
          return true;
        }).length === 0 ? (
          <div className="py-20 text-center text-slate-500">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-10" />
              <p className="font-bold text-lg">No posts yet</p>
              <p className="text-sm opacity-60">Be the first to start a conversation in this community.</p>
          </div>
        ) : doubts.filter(d => {
          if (activeFilter === 'Unanswered') return d.status === 'Unanswered' && d._count?.replies === 0;
          if (activeFilter === 'Resolved') return d.status === 'Resolved';
          return true;
        }).map((post) => (
          <article key={post.id} onClick={(e) => { if(!e.target.closest('button')) setSelectedDoubt(post); }} className="bg-white/80 dark:bg-[#161923]/60 backdrop-blur-xl border border-slate-200 dark:border-[#333942] rounded-2xl flex hover:border-slate-400 dark:hover:border-blue-500/30 transition-all cursor-pointer group shadow-sm overflow-hidden">
             {/* Vote Sidebar */}
             <div className="w-10 sm:w-12 bg-slate-50/50 dark:bg-black/10 flex flex-col items-center py-4 gap-1 border-r border-slate-100 dark:border-white/5">
               <button className="text-slate-400 hover:text-orange-500 transition-colors"><ChevronUp size={24} /></button>
               <span className="text-xs font-black text-slate-700 dark:text-slate-200">{post._count?.replies || 0}</span>
               <button className="text-slate-400 hover:text-blue-500 transition-colors"><ChevronDown size={24} /></button>
             </div>

             {/* Post Content */}
             <div className="flex-1 p-4 pb-3">
               <div className="flex items-center gap-2 mb-2">
                 <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center overflow-hidden">
                    {post.user.picture ? <img src={post.user.picture} className="w-full h-full object-cover" alt={post.user.name}/> : <User size={12} className="text-slate-400" />}
                 </div>
                 <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-black text-slate-900 dark:text-white">{post.user.name}</span>
                    <UserBadge u={post.user} />
                    <span className="text-[11px] text-slate-400">• {timeAgo(post.createdAt)}</span>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ml-2 uppercase tracking-tighter ${getSubjectColor(post.subject)}`}>r/{post.subject}</span>
                 </div>
               </div>

               <h2 className="text-lg font-black text-slate-900 dark:text-white mb-2 leading-tight group-hover:underline">{post.title}</h2>
               <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-3 leading-relaxed">{post.content}</p>
               
               {post.imageUrl && (
                  <div className="mb-4 rounded-xl overflow-hidden border border-slate-200 dark:border-white/5 max-h-[400px]">
                      <img src={post.imageUrl} className="w-full h-full object-contain bg-black/5" alt="Post media" />
                  </div>
               )}

               <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                 <div className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                   <MessageCircle size={16} /> {post._count?.replies || 0} Comments
                 </div>
                 <button className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                   <Share2 size={16} /> Share
                 </button>
                 {post.status === 'Resolved' && (
                   <div className="flex items-center gap-1.5 text-emerald-500 ml-auto">
                      <CheckCircle2 size={16} /> <span className="text-[10px] uppercase tracking-widest">Solved</span>
                   </div>
                 )}
                 {user?.id === post.userId && (
                   <button onClick={(e) => { e.stopPropagation(); handleDeleteDoubt(post.id); }} className="p-2 text-slate-300 hover:text-rose-500 transition-colors ml-auto">
                      <Trash2 size={16} />
                   </button>
                 )}
               </div>
             </div>
          </article>
        ))}
      </div>

      {/* Sidebar Information */}
      <div className="space-y-6 hidden lg:block">
        <div className="bg-white/80 dark:bg-[#161923]/60 backdrop-blur-xl border border-slate-200 dark:border-[#333942] rounded-2xl shadow-sm overflow-hidden">
           <div className="h-10 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
           <div className="p-4 pt-2">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#0B0E14] border-2 border-white dark:border-[#161923] -mt-10 shadow-lg flex items-center justify-center">
                    <img src="/logo.png" className="w-10 h-10 object-contain" alt="PeakPrep Logo" />
                 </div>
                 <h3 className="font-black text-sm text-slate-900 dark:text-white mt-1">r/PeakPrep_Community</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                 The official community for JEE, NEET, and BITSAT aspirants. Discuss questions, share resources, and help each other grow.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-slate-100 dark:border-white/5">
                 <div>
                    <div className="text-sm font-black text-slate-900 dark:text-white">12.4k</div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-400">Members</div>
                 </div>
                 <div>
                    <div className="text-sm font-black text-slate-900 dark:text-white">45</div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-400">Online</div>
                 </div>
              </div>
              <button onClick={() => setShowAskDoubtModal(true)} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95">Create Post</button>
           </div>
        </div>

        <div className="bg-white/80 dark:bg-[#161923]/60 backdrop-blur-xl border border-slate-200 dark:border-[#333942] rounded-2xl p-4 shadow-sm">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Rules & Conduct</h3>
           <ul className="space-y-3">
              {['Be respectful', 'No spam', 'Stay on topic', 'Search before posting'].map((rule, i) => (
                <li key={i} className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-50 dark:border-white/5 pb-2 last:border-0">
                  <span className="text-blue-500">{i + 1}.</span> {rule}
                </li>
              ))}
           </ul>
        </div>
      </div>
    </div>
  </section>
);
