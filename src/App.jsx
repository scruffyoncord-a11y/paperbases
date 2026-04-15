import React, { useState, useMemo, useEffect } from 'react';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import { 
  Home, BookOpen, ClipboardList, User, Sun, Moon,
  ChevronRight, Star, Trophy, Search, Book, FileText, 
  Layers, Calculator, Bookmark, UploadCloud, Sparkles, 
  Zap, Target, Activity, ChevronDown, Info, ListChecks, 
  Upload, FolderSearch, ArrowRight, ArrowLeft, Settings, 
  Mail, ShieldCheck, LogOut, Bell, CheckCircle2, Clock, 
  Circle, Users, MessageSquare, ThumbsUp, MessageCircle, 
  Share2, TrendingUp, Calendar, Award, Flag, HelpCircle, 
  Lock, X, Building, GraduationCap, Filter, BarChart3, 
  Trash2, ExternalLink, Highlighter, Image as ImageIcon, 
  ZoomIn, ZoomOut, ChevronLeft, Send, RotateCcw, 
  ThumbsDown, AlertTriangle, Coffee, Play, PlayCircle, 
  Tv, MonitorPlay, Save, ChevronUp, Link as LinkIcon, 
  UserCircle, Check
} from 'lucide-react';
import { GlobalWorkerOptions } from "pdfjs-dist";
import { PolicyAcceptanceModal } from './Policies';
GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

// Modular Components
import { PYQNavigator } from './components/PYQNavigator';
import { ResourcesView } from './components/Resources';
import { DoubtsView, CommunityView } from './components/Forum';
import { ChapterPYQsView, ChapterResources } from './components/Syllabus';
import { Flashcard } from './components/Notes';
import { PomodoroTimer } from './components/StudyRoom';
import { PdfViewer } from './components/PDF';
import { ResourceViewerModal } from './components/PaperAI';
import { GoalsView } from './components/Timetable';
import { Latex, UserBadge, timeAgo, getSubjectColor } from './components/SharedComponents';

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

const pyqSubjectThemes = {
  'Maths': { color: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500/20', icon: <Calculator size={24} /> },
  'Physics': { color: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500/20', icon: <Zap size={24} /> },
  'Chemistry': { color: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500/20', icon: <Activity size={24} /> },
  'Biology': { color: 'bg-rose-500', text: 'text-rose-500', border: 'border-rose-500/20', icon: <Sparkles size={24} /> }
};

const exams = [
  { id: 'jee', name: 'JEE Mains', color: 'text-blue-600', border: 'border-blue-600/20', img: '/jee_logo.webp' },
  { id: 'neet', name: 'NEET', color: 'text-rose-600', border: 'border-rose-600/20', img: '/neet_logo.webp' },
  { id: 'bitsat', name: 'BITSAT', color: 'text-indigo-600', border: 'border-indigo-600/20', img: '/bitsat_logo.webp' }
];

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
  const [activeFilter, setActiveFilter] = useState('All');
  const [doubtSubjectFilter, setDoubtSubjectFilter] = useState('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [savedExams, setSavedExams] = useState([]);
  const [isProcessingExam, setIsProcessingExam] = useState(false);
  const [examProcessingStatus, setExamProcessingStatus] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [testsSubTab, setTestsSubTab] = useState('Browse');
  const [examSearchQuery, setExamSearchQuery] = useState('');
  const [publicExams, setPublicExams] = useState([]);
  const [trendingExams, setTrendingExams] = useState([]);
  const [isLoadingExams, setIsLoadingExams] = useState(false);
  const [selectedExamForPYQ, setSelectedExamForPYQ] = useState(null);
  const [pyqSubject, setPyqSubject] = useState('Physics');
  const [selectedDay, setSelectedDay] = useState(new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date()));
  const [syllabusMode, setSyllabusMode] = useState('jee'); 
  const [activeSubject, setActiveSubject] = useState('Physics');
  const [syllabusData, setSyllabusData] = useState(null);
  const [syllabusProgress, setSyllabusProgress] = useState(() => {
    try {
      const savedProgress = localStorage.getItem('paperbase_progress');
      return savedProgress ? JSON.parse(savedProgress) : {};
    } catch {
      return {};
    }
  }); 

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

  const [doubts, setDoubts] = useState([]);
  const [showAskDoubtModal, setShowAskDoubtModal] = useState(false);
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [isSubmittingDoubt, setIsSubmittingDoubt] = useState(false); 
  const [doubtImage, setDoubtImage] = useState(null); 

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

  // PaperAI States
  const [sidebarTab, setSidebarTab] = useState('chat');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);

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

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ profession: '', grade: '', experience: '' });
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  useEffect(() => {
    localStorage.setItem('paperbase_progress', JSON.stringify(syllabusProgress));
  }, [syllabusProgress]);

  useEffect(() => {
    if ((activeTab === 'Community' || activeTab === 'Doubts') && user && !user.profession) {
      setShowProfileModal(true);
    }
  }, [activeTab, user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.profession) return;
    setIsSubmittingProfile(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...profileForm })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('paperbase_user', JSON.stringify(data.user));
        setShowProfileModal(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('paperbase_user');
    localStorage.removeItem('paperbase_policies_accepted');
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
            const updatedUser = { ...user, policiesAccepted: true };
            setUser(updatedUser);
            localStorage.setItem('paperbase_user', JSON.stringify(updatedUser));
         }
       } catch (err) { console.error(err); }
    }
    if (pendingResource) {
      setSelectedResource(pendingResource);
      setPendingResource(null);
    }
  };

  const generateAIStudyPlan = async () => {
    if (isGeneratingPlan) return;
    setIsGeneratingPlan(true);
    try {
      const res = await fetch('/api/ai/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterName: studyChapter })
      });
      const data = await res.json();
      if (data.success) {
        setAiStudyPlan(data.plan);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const generateFlashcards = async () => {
    if (isGeneratingFlashcards) return;
    setIsGeneratingFlashcards(true);
    try {
      const res = await fetch('/api/ai/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterName: studyChapter })
      });
      const data = await res.json();
      if (data.success) {
        setFlashcards(prev => ({ ...prev, [studyChapter]: data.cards }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const loadPYQQuestions = async (chapter) => {
    setSelectedExamForPYQ(exams.find(e => e.id === syllabusMode) || exams[0]);
    setPyqSubject(activeSubject);
    setActiveTab('PYQVault');
    // Actual loading logic would be triggered by interaction in PYQNavigator
  };

  if (!user) {
    return authPage === 'login' ? <LoginPage onSignup={() => setAuthPage('signup')} onLogin={setUser} /> : <SignupPage onLogin={() => setAuthPage('login')} onSignupSuccess={setUser} />;
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'PYQVault':
        return <PYQNavigator user={user} />;
      case 'Resources':
        return <ResourcesView user={user} dbResources={dbResources} setDbResources={setDbResources} onOpenResource={(res) => { if (!hasAcceptedTerms) { setPendingResource(res); setShowPolicyModal(true); } else { setSelectedResource(res); } }} />;
      case 'Doubts':
        return <DoubtsView doubts={doubts} setDoubts={setDoubts} user={user} doubtSubjectFilter={doubtSubjectFilter} setDoubtSubjectFilter={setDoubtSubjectFilter} onSelectDoubt={setSelectedDoubt} setShowAskModal={setShowAskDoubtModal} />;
      case 'Community':
        return <CommunityView user={user} doubts={doubts} onSelectDoubt={setSelectedDoubt} setSelectedDay={setSelectedDay} setTimetableSchedules={setTimetableSchedules} setTimetableTasks={setTimetableTasks} />;
      case 'Goals':
        return <GoalsView user={user} daysOfWeek={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']} selectedDay={selectedDay} setSelectedDay={setSelectedDay} timetableSchedules={timetableSchedules} setTimetableSchedules={setTimetableSchedules} timetableTasks={timetableTasks} setTimetableTasks={setTimetableTasks} />;
      case 'ChapterPYQs':
        return <ChapterPYQsView selectedExamForPYQ={selectedExamForPYQ} exams={exams} modeSubjects={modeSubjects} pyqSubject={pyqSubject} setPyqSubject={setPyqSubject} pyqSubjectThemes={pyqSubjectThemes} CURRENT_SYLLABUS={UNIFIED_SYLLABUS} setActiveTab={setActiveTab} loadQuestions={loadPYQQuestions} />;
      case 'StudyRoom':
        return (
          <div className="max-w-7xl mx-auto space-y-10">
             <PomodoroTimer>
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Chapter</h3>
                      <button onClick={generateAIStudyPlan} className="px-5 py-2.5 rounded-xl bg-orange-600/10 text-orange-600 text-xs font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all">
                         {isGeneratingPlan ? 'Thinking...' : 'Generate AI Plan'}
                      </button>
                   </div>
                   <div className="p-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2rem]">
                      <h4 className="font-bold text-slate-900 dark:text-white mb-2">{studyChapter}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">Currently preparing for {syllabusMode.toUpperCase()}. Phase 1 depth coverage.</p>
                   </div>
                   {aiStudyPlan && (
                     <div className="p-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2rem] animate-in slide-in-from-top-4">
                        <div className="flex items-center gap-2 mb-4 text-orange-500"><Sparkles size={16} /><span className="text-[10px] font-black uppercase tracking-widest">AI Roadmap</span></div>
                        <div className="text-xs font-medium text-slate-600 dark:text-slate-400 prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: aiStudyPlan.replace(/\n/g, '<br/>') }} />
                     </div>
                   )}
                </div>
             </PomodoroTimer>
             <ChapterResources chapter={studyChapter} syllabusMode={syllabusMode} videoCache={videoCache} setVideoCache={setVideoCache} />
          </div>
        );
      case 'Notes':
        return (
          <div className="max-w-7xl mx-auto space-y-10">
             <div className="flex bg-white dark:bg-[#161923] p-1.5 rounded-3xl border border-slate-200 dark:border-white/10 w-fit">
                {['My Notes', 'Flashcards'].map(t => (
                  <button key={t} onClick={() => setNoteTab(t)} className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${noteTab === t ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>{t}</button>
                ))}
             </div>
             {noteTab === 'Flashcards' ? (
                <div className="space-y-10">
                   <div className="flex items-center justify-between">
                      <div>
                         <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Active Recall Lab</h2>
                         <p className="text-slate-500 dark:text-slate-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Test your knowledge on {studyChapter}</p>
                      </div>
                      <button onClick={generateFlashcards} className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all">
                         <Zap size={18} /> {isGeneratingFlashcards ? 'Generating...' : 'Generate Flashcards'}
                      </button>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {flashcards[studyChapter]?.map((card, i) => <Flashcard key={i} question={card.question} answer={card.answer} />)}
                      {(!flashcards[studyChapter] || flashcards[studyChapter].length === 0) && !isGeneratingFlashcards && (
                        <div className="col-span-full py-20 text-center text-slate-400">
                           <Zap size={48} className="mx-auto mb-4 opacity-10" />
                           <p className="font-bold">No flashcards for this chapter yet. Click generate!</p>
                        </div>
                      )}
                   </div>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Placeholder for My Notes */}
                    <div className="p-10 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[2.5rem]">
                       <Book size={40} className="mx-auto mb-4 opacity-10" />
                       <p className="font-bold text-sm">Notes feature coming soon.</p>
                    </div>
                </div>
             )}
          </div>
        );
      default:
        return (
          <div className="max-w-7xl mx-auto space-y-12">
             <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-8">
                   <div className="bg-[#161923] rounded-[3rem] p-10 text-white relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-600/20 to-violet-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                      <div className="relative z-10">
                         <div className="flex items-center gap-3 mb-6">
                            <span className="px-3 py-1 bg-blue-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">Phase 1 Live</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock size={14} /> JEE MAINS 2025 • 284 Days Left</span>
                         </div>
                         <h1 className="text-4xl md:text-6xl font-black mb-8 leading-[1.1] tracking-tighter">Conquer the <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">Peak.</span><br/>Excel in Prep.</h1>
                         <button onClick={() => setActiveTab('PYQVault')} className="group/btn relative px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-blue-500 hover:text-white transition-all overflow-hidden">
                            <span className="relative z-10 flex items-center gap-3">Enter Master Vault <ArrowRight className="group-hover/btn:translate-x-2 transition-transform" /></span>
                         </button>
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { label: 'Weekly Goals', val: timetableTasks.filter(t => t.done).length, total: timetableTasks.length, unit: 'Tasks Done', icon: <ListChecks />, color: 'text-emerald-500' },
                        { label: 'Solved PYQs', val: '1,240', total: '14k+', unit: 'Questions', icon: <Activity />, color: 'text-amber-500' },
                        { label: 'Focus Streak', val: '12', total: 'Best: 15', unit: 'Days', icon: <Flame />, color: 'text-rose-500' }
                      ].map((s, i) => (
                        <div key={i} className="bg-white/80 dark:bg-[#161923]/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all">
                           <div className={`w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center ${s.color} mb-6 shadow-inner`}>{s.icon}</div>
                           <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</h4>
                           <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-black text-slate-900 dark:text-white">{s.val}</span>
                              <span className="text-xs font-bold text-slate-400">/ {s.total}</span>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
                <div className="space-y-6">
                   <div className="bg-white/80 dark:bg-[#161923]/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2"><Trophy size={18} className="text-amber-500" /> Leaderboard</h4>
                      <div className="space-y-6">
                         {[1,2,3].map(pos => (
                           <div key={pos} className="flex items-center gap-4 group">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${pos === 1 ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}>{pos}</div>
                              <div className="flex-1">
                                 <div className="text-xs font-black text-slate-900 dark:text-white mb-0.5">Renjith K.</div>
                                 <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">12,400 Points</div>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'dark bg-[#0B0E14]' : 'bg-[#F8FAFC]'}`}>
      <aside className="fixed left-0 top-0 bottom-0 w-[280px] bg-white dark:bg-[#0B0E14] border-r border-slate-200 dark:border-white/5 z-50 hidden lg:flex flex-col">
         <div className="p-8">
            <div className="flex items-center gap-3 mb-10">
               <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20"><Zap size={24} fill="currentColor" /></div>
               <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">PeakPrep</span>
            </div>
            
            <nav className="space-y-1">
               <SidebarItem icon={<Home size={20} />} label="Launchpad" active={activeTab === 'Home'} onClick={() => setActiveTab('Home')} />
               <SidebarItem icon={<Calculator size={20} />} label="PYQ Masterbank" active={activeTab === 'ChapterPYQs' || activeTab === 'PYQVault'} onClick={() => { setSelectedExamForPYQ(exams[0]); setPyqSubject('Physics'); setActiveTab('ChapterPYQs'); }} />
               <SidebarItem icon={<ClipboardList size={20} />} label="Study Room" active={activeTab === 'StudyRoom'} onClick={() => setActiveTab('StudyRoom')} />
               <SidebarItem icon={<MessageCircle size={20} />} label="Doubt Forum" active={activeTab === 'Doubts'} onClick={() => setActiveTab('Doubts')} />
               <SidebarItem icon={<Users size={20} />} label="Community" active={activeTab === 'Community'} onClick={() => setActiveTab('Community')} />
               <SidebarItem icon={<Layers size={20} />} label="Resources" active={activeTab === 'Resources'} onClick={() => setActiveTab('Resources')} />
               <SidebarItem icon={<Target size={20} />} label="Daily Roadmap" active={activeTab === 'Goals'} onClick={() => setActiveTab('Goals')} />
               <SidebarItem icon={<BookOpen size={20} />} label="Lab Notes" active={activeTab === 'Notes'} onClick={() => setActiveTab('Notes')} />
            </nav>
         </div>

         <div className="mt-auto p-8 border-t border-slate-100 dark:border-white/5">
            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0B0E14] flex items-center justify-center text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden">
                     {user.picture ? <img src={user.picture} className="w-full h-full object-cover" /> : <User size={20} />}
                  </div>
                  <div className="flex-1 overflow-hidden">
                     <p className="text-xs font-black text-slate-900 dark:text-white truncate">{user.name}</p>
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{user.profession || 'Level 1'}</p>
                  </div>
               </div>
               <button onClick={handleLogout} className="w-full py-2.5 rounded-xl bg-white dark:bg-white/5 text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 font-black text-[10px] uppercase tracking-widest border border-slate-200 dark:border-white/5 transition-all flex items-center justify-center gap-2">
                  <LogOut size={14} /> Kill Session
               </button>
            </div>
         </div>
      </aside>

      <main className="lg:pl-[280px] min-h-screen pb-20">
         <header className="h-20 flex items-center justify-between px-8 sticky top-0 bg-white/80 dark:bg-[#0B0E14]/80 backdrop-blur-xl z-40 border-b border-slate-100 dark:border-white/5">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{activeTab === 'Home' ? 'Operational Status: Ready' : activeTab}</h2>
            <div className="flex items-center gap-4">
               <div className="hidden md:flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                  <button onClick={() => setIsDarkMode(false)} className={`p-2 rounded-lg transition-all ${!isDarkMode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}><Sun size={18} /></button>
                  <button onClick={() => setIsDarkMode(true)} className={`p-2 rounded-lg transition-all ${isDarkMode ? 'bg-slate-900 text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}><Moon size={18} /></button>
               </div>
               <button className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-all"><Settings size={20} /></button>
               <button className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-blue-500 border border-slate-200 dark:border-white/10 transition-all relative">
                  <Bell size={20} />
                  <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-[#0B0E14]" />
               </button>
            </div>
         </header>

         <div className="p-8 animate-in fade-in duration-700">
            {renderContent()}
         </div>
      </main>

      {selectedResource && (
         <ResourceViewerModal 
            resource={selectedResource} 
            user={user} 
            onClose={() => setSelectedResource(null)} 
            onLike={async (id) => {}} 
            highlights={highlights} setHighlights={setHighlights}
            chatMessages={chatMessages} setChatMessages={setChatMessages}
            chatInput={chatInput} setChatInput={setChatInput}
            isChatLoading={isChatLoading} setIsChatLoading={setIsChatLoading}
            activeChatId={activeChatId} setActiveChatId={setActiveChatId}
            sidebarTab={sidebarTab} setSidebarTab={setSidebarTab}
            isDataLoading={false} setIsDataLoading={() => {}}
         />
      )}

      {showPolicyModal && (
        <PolicyAcceptanceModal 
          isOpen={showPolicyModal} 
          onAccept={handleAcceptPolicies} 
          onCancel={() => { 
            setShowPolicyModal(false); 
            setPendingResource(null); 
            if(activeTab === 'Resources') setActiveTab('Home');
          }} 
        />
      )}

      {showProfileModal && <ProfileOnboardingModal />}
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
