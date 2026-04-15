import React, { useState } from 'react';
import { 
  History, CheckCircle2, Circle, Plus, ListChecks, Calendar, ExternalLink, Trash2, Clock, Filter, AlertTriangle
} from 'lucide-react';

export const GoalsView = ({ 
  user, daysOfWeek, selectedDay, setSelectedDay, timetableSchedules, setTimetableSchedules, 
  timetableTasks, setTimetableTasks 
}) => {
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
      try {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, title: newTaskText, subject: 'General' })
        });
        const data = await res.json();
        if (data.success) {
          setTimetableTasks([...timetableTasks, data.task]);
          setNewTaskText('');
        }
      } catch (e) {
        console.error(e);
      }
    };

    const handleDeleteTask = async (taskId) => {
       try {
         await fetch(`/api/tasks/${taskId}`, { 
           method: 'DELETE',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ userId: user.id })
         });
         setTimetableTasks(timetableTasks.filter(t => t.id !== taskId));
       } catch(e) { console.error(e); }
    };

    return (
      <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            {/* Header & Day Selector */}
            <div className="bg-white/80 dark:bg-[#161923]/60 backdrop-blur-2xl border border-slate-200 dark:border-white/10 p-8 rounded-[2.5rem] shadow-sm">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Weekly Roadmap</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1 uppercase tracking-widest">Optimized for Academic Excellence</p>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 bg-slate-100/50 dark:bg-black/20 rounded-2xl">
                     <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 text-[10px] font-black uppercase tracking-widest">
                        <History size={14} /> Streak: 12 days
                     </div>
                  </div>
               </div>
               
               <div className="flex items-center gap-2 md:gap-3 overflow-x-auto no-scrollbar pb-2">
                  {daysOfWeek.map(day => (
                    <button 
                      key={day} 
                      onClick={() => setSelectedDay(day)}
                      className={`flex-1 min-w-[80px] py-4 rounded-2xl flex flex-col items-center gap-1 transition-all border ${selectedDay === day ? 'bg-slate-900 border-slate-900 dark:bg-white dark:border-white text-white dark:text-slate-900 shadow-xl' : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-500 hover:border-slate-300'}`}
                    >
                       <span className="text-[10px] font-black uppercase tracking-tighter">{day}</span>
                       <div className={`w-1.5 h-1.5 rounded-full ${selectedDay === day ? 'bg-blue-400' : 'bg-slate-200 dark:bg-white/10'}`} />
                    </button>
                  ))}
               </div>
            </div>

            {/* Timetable Blocks */}
            <div className="relative">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-[11px] flex items-center gap-2">
                     <Clock size={16} className="text-blue-500" /> Daily Blocks
                  </h3>
                  <button onClick={() => setIsAddingBlock(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                     <Plus size={14} /> Add Block
                  </button>
               </div>

               <div className="space-y-4">
                  {currentSchedule.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center bg-white/40 dark:bg-white/[0.02] border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2.5rem] text-slate-400">
                       <Calendar size={48} className="opacity-20 mb-4" />
                       <p className="font-bold text-sm">Nothing planned for {selectedDay}.</p>
                    </div>
                  ) : (
                    currentSchedule.sort((a,b) => a.time.localeCompare(b.time)).map((item, idx) => (
                       <div key={idx} className="group bg-white dark:bg-[#161923] border border-slate-100 dark:border-white/5 p-6 rounded-[2rem] flex items-center gap-6 hover:border-blue-500/30 transition-all shadow-sm">
                          <div className="w-16 text-center shrink-0">
                             <div className="text-xs font-black text-slate-900 dark:text-white">{item.time}</div>
                             <div className="text-[9px] font-bold text-slate-400 uppercase">{item.duration}</div>
                          </div>
                          <div className={`w-1 h-12 rounded-full ${item.theme === 'orange' ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]' : item.theme === 'emerald' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]'}`} />
                          <div className="flex-1">
                             <h4 className="font-black text-slate-900 dark:text-white mb-1">{item.title}</h4>
                             <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-[9px] font-black uppercase text-slate-400 tracking-tighter">{item.type}</span>
                                {item.exam && <span className="text-[9px] font-bold text-blue-500">Preparation for {item.exam}</span>}
                             </div>
                          </div>
                          <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all"><ExternalLink size={16} /></button>
                       </div>
                    ))
                  )}
               </div>
            </div>
          </div>

          <div className="space-y-8">
             {/* Progress Box */}
             <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                <h3 className="text-xl font-black mb-6 flex items-center gap-2"><ListChecks size={24} className="text-blue-400" /> Weekly Task List</h3>
                <div className="space-y-4 mb-8">
                   {timetableTasks.length === 0 && <p className="text-sm text-slate-400 font-medium">Clear for today! Add some tasks below.</p>}
                   {timetableTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 group/item">
                       <button onClick={() => handleToggleTask(task.id, task.done)} className={`shrink-0 w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${task.done ? 'bg-emerald-500 border-emerald-500 text-slate-900' : 'border-slate-700 hover:border-blue-500'}`}>
                          {task.done && <CheckCircle2 size={14} />}
                       </button>
                       <span className={`text-sm font-bold flex-1 transition-opacity ${task.done ? 'opacity-40 line-through' : 'text-slate-200'}`}>{task.title}</span>
                       <button onClick={() => handleDeleteTask(task.id)} className="opacity-0 group-hover/item:opacity-100 p-1 text-slate-600 hover:text-rose-400 transition-all"><Trash2 size={14}/></button>
                    </div>
                   ))}
                </div>
                <form onSubmit={handleAddTask} className="flex items-center gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/10 group-focus-within:border-blue-500/50 transition-all">
                   <input 
                    type="text" 
                    placeholder="Add a high-yield goal..." 
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none px-3 py-1.5 text-xs font-bold placeholder:text-slate-600" 
                   />
                   <button type="submit" className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/20">
                      <Plus size={18} />
                   </button>
                </form>
             </div>

             {/* Stat Box */}
             <div className="grid grid-cols-1 gap-6">
                <div className="bg-white/80 dark:bg-[#161923]/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-[2.5rem] shadow-sm">
                   <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center"><Trophy size={20} /></div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Weekly Performance</div>
                   </div>
                   <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{completedTasksWeeklyCount}</div>
                   <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Tasks Completed This Week</div>
                </div>
             </div>
          </div>
        </div>

        {isAddingBlock && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
             <div className="bg-white dark:bg-[#0B0E14] w-full max-w-md rounded-[3rem] p-10 shadow-2xl border border-slate-200 dark:border-white/5 animate-in zoom-in-95 duration-300">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">New Schedule Block</h3>
                <p className="text-xs text-slate-500 mb-8 font-medium italic">"Planning is bringing the future into the present."</p>
                <form onSubmit={handleAddSchedule} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Title</label>
                      <input 
                        type="text" 
                        required
                        value={newBlock.title}
                        onChange={e => setNewBlock({...newBlock, title: e.target.value})}
                        placeholder="e.g. Physics - Laws of Motion" 
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-blue-500 transition-all dark:text-white" 
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Start Time</label>
                         <input 
                            type="time" 
                            required
                            value={newBlock.time}
                            onChange={e => setNewBlock({...newBlock, time: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-blue-500 transition-all dark:text-white [color-scheme:dark]" 
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Duration</label>
                         <input 
                            type="text" 
                            required
                            value={newBlock.duration}
                            onChange={e => setNewBlock({...newBlock, duration: e.target.value})}
                            placeholder="e.g. 1.5 hrs" 
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-blue-500 transition-all dark:text-white" 
                         />
                      </div>
                   </div>
                   <div className="flex gap-4 pt-4">
                      <button type="button" onClick={() => setIsAddingBlock(false)} className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                      <button type="submit" className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all">Save Block</button>
                   </div>
                </form>
             </div>
          </div>
        )}
      </div>
    );
};
