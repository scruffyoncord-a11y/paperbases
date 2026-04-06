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
  Image as ImageIcon
} from 'lucide-react';

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

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('peakprep_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return !!localStorage.getItem('peakprep_user');
    } catch {
      return false;
    }
  });
  const [authPage, setAuthPage] = useState('login');
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
  const [selectedDay, setSelectedDay] = useState('Mon');
  const [syllabusMode, setSyllabusMode] = useState('jee'); 
  const [activeSubject, setActiveSubject] = useState('Physics');
  const [syllabusData, setSyllabusData] = useState(null); // From DB
  const [syllabusProgress, setSyllabusProgress] = useState(() => {
    try {
      const savedProgress = localStorage.getItem('peakprep_progress');
      return savedProgress ? JSON.parse(savedProgress) : {};
    } catch {
      return {};
    }
  }); 

  useEffect(() => {
    localStorage.setItem('peakprep_progress', JSON.stringify(syllabusProgress));
  }, [syllabusProgress]);

  // Resource Sharing State
  const [dbResources, setDbResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [resourceFilter, setResourceFilter] = useState('All');
  const [isUploadingResource, setIsUploadingResource] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

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

  useEffect(() => {
    if (user) {
      localStorage.setItem('peakprep_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('peakprep_user');
    }
  }, [user]);

  useEffect(() => {
    if (user && user.id) {
      // Validate user still exists in DB (handles database resets)
      fetch(`/api/auth/validate/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
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
            localStorage.removeItem('peakprep_user');
            localStorage.removeItem('peakprep_progress');
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

  useEffect(() => {
    if (activeTab === 'Resources') {
        const url = resourceFilter === 'All' ? '/api/resources' : `/api/resources?subject=${resourceFilter}`;
        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (data.success) setDbResources(data.resources);
            })
            .catch(console.error);
    }
  }, [activeTab, resourceFilter]);

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

  const handleUploadResource = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please login to upload.');
    setIsUploadingResource(true);
    const formData = new FormData(e.target);
    const title = formData.get('title');
    const description = formData.get('description');
    const subject = formData.get('subject');
    const tag = formData.get('tag'); // Get tag
    const file = formData.get('file');

    if (!file || !file.name) {
        alert('Please select a file.');
        setIsUploadingResource(false);
        return;
    }

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
                setDbResources([data.resource, ...dbResources]);
                setShowUploadModal(false);
                e.target.reset();
            }
        } catch (err) {
            console.error(err);
        }
        setIsUploadingResource(false);
    };
    reader.readAsDataURL(file);
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
            setDbResources(prev => prev.map(r => r.id === resourceId ? data.resource : r));
            if (selectedResource?.id === resourceId) {
                setSelectedResource(data.resource);
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
    { id: 'jee', name: 'JEE', color: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-500/20', img: 'https://i.postimg.cc/LXfc8LVS/image.png' },
    { id: 'neet', name: 'NEET', color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/20', img: 'https://i.postimg.cc/LXfc8LVS/image.png' },
    { id: 'bitsat', name: 'BITSAT', color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-500/20', img: 'https://i.postimg.cc/hvR8rBn1/image.png' },
    { id: 'viteee', name: 'VITEEE', color: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-500/20', img: 'https://i.postimg.cc/xC5LVFb5/image.png' },
    { id: 'kcet', name: 'KCET', color: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-500/20', img: 'https://i.postimg.cc/hGPS3yg2/image.png' },
    { id: 'comedk', name: 'COMEDK', color: 'bg-slate-50 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-500/20', img: 'https://i.postimg.cc/ry59QQm6/Untitled.png' },
    { id: 'cuet', name: 'CUET', color: 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400', border: 'border-sky-200 dark:border-sky-500/20', img: 'https://i.postimg.cc/LXfc8LVS/image.png' },
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
    { id: 'jee', name: 'JEE Main', desc: '75 Qs · MCQ + Numerical', icon: <img src="https://i.postimg.cc/LXfc8LVS/image.png" alt="JEE" className="w-12 h-12 object-contain drop-shadow-sm" /> },
    { id: 'bitsat', name: 'BITSAT', desc: '150 Qs · MCQ only', icon: <img src="https://i.postimg.cc/hvR8rBn1/image.png" alt="BITSAT" className="w-12 h-12 object-contain drop-shadow-sm" /> },
    { id: 'neet', name: 'NEET', desc: '200 Qs · MCQ only', icon: <img src="https://i.postimg.cc/LXfc8LVS/image.png" alt="NEET" className="w-12 h-12 object-contain drop-shadow-sm" /> },
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

  const ResourcesView = () => {
    const availableSubjects = ['All', ...modeSubjects[syllabusMode]];

    return (
      <section className="animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold text-lg text-slate-900 dark:text-white">Study Resources</h2>
          <button className="text-xs font-bold text-blue-600 dark:text-blue-500 uppercase tracking-widest hover:text-blue-500 dark:hover:text-blue-400 transition">View All</button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Quick revision notes, formula sheets, and mind maps for prep.</p>
        
        <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex items-center flex-1 bg-white/80 dark:bg-[#161923]/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 shadow-sm focus-within:border-blue-500 transition-all">
                <Search size={18} className="text-blue-500" />
                <input type="text" placeholder="Search resources..." className="flex-1 bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400 ml-3 text-sm" />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {availableSubjects.map(sub => (
                    <button 
                        key={sub} 
                        onClick={() => setResourceFilter(sub)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${resourceFilter === sub ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white/80 dark:bg-[#161923]/60 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-blue-400'}`}
                    >
                        {sub}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex gap-6 border-b border-slate-200 dark:border-white/10 mb-6">
          <button onClick={() => setResourceTab('Quick Access')} className={`pb-2 text-sm font-bold transition-all ${resourceTab === 'Quick Access' ? 'border-b-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-500' : 'border-b-2 border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Quick Access</button>
          <button onClick={() => setResourceTab('Browse')} className={`pb-2 text-sm font-bold transition-all ${resourceTab === 'Browse' ? 'border-b-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-500' : 'border-b-2 border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Browse Community</button>
        </div>

        {resourceTab === 'Quick Access' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {resources.map((res, i) => (
              <div key={i} className="bg-white/80 dark:bg-[#161923]/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-4 rounded-xl shadow-sm hover:border-blue-400 transition-all cursor-pointer flex items-center gap-4 group">
                <div className={`p-3 rounded-lg ${res.bg} ${res.iconColor} group-hover:scale-110 transition-transform`}>{res.icon}</div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{res.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{res.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {resourceTab === 'Browse' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
            {dbResources.length === 0 ? (
                <div className="col-span-full py-20 text-center text-slate-500">
                    <FolderSearch size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No resources found for this subject.</p>
                </div>
            ) : (
                dbResources.map((res) => {
                    const hasLiked = res.likes?.some(l => l.userId === user?.id);
                    return (
                    <div key={res.id} onClick={(e) => { if(e.target.closest('button') || e.target.closest('a')) return; setSelectedResource(res); }} className="bg-white/80 dark:bg-[#161923]/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-sm hover:border-blue-500 transition-all group cursor-pointer relative overflow-hidden">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${getSubjectColor(res.subject)}`}>
                                {res.fileType === 'pdf' ? <FileText size={20} /> : <ImageIcon size={20} />}
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{timeAgo(res.createdAt)}</span>
                                {res.tag && <span className="text-[9px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 font-bold uppercase text-slate-600 dark:text-slate-300">{res.tag}</span>}
                            </div>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-500 transition-colors">{res.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 h-8">{res.description}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold">
                                    {res.user.picture ? <img src={res.user.picture} className="w-full h-full rounded-full" /> : res.user.name[0]}
                                </div>
                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{res.user.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => handleLikeResource(res.id)} className={`flex items-center gap-1 text-[11px] font-black transition-colors ${hasLiked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}>
                                    <ThumbsUp size={14} className={hasLiked ? 'fill-rose-500' : ''} /> {res._count?.likes || 0}
                                </button>
                                <a href={res.fileUrl} download={res.title} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-bold text-[10px] flex items-center gap-1">
                                    <UploadCloud size={14} /> SAVE
                                </a>
                            </div>
                        </div>
                    </div>
                )})
            )}
          </div>
        )}

        {/* Upload CTA */}
        <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 dark:from-blue-600/20 dark:to-indigo-600/20 rounded-[2rem] p-8 md:p-12 text-center mt-12 mb-4 border border-blue-200 dark:border-blue-500/20">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Help your friends succeed!</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-lg mx-auto">Upload your revision notes, formula sheets, or hand-written solutions to help the community.</p>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-blue-600/20 hover:scale-105 transition-all flex items-center gap-3 mx-auto"
          >
            <Upload size={20} /> UPLOAD RESOURCE
          </button>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                <div className="bg-white dark:bg-[#161923] w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
                    <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Share Resource</h3>
                            <p className="text-xs text-slate-500">Upload PDFs or revision notes.</p>
                        </div>
                        <button onClick={() => setShowUploadModal(false)} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-slate-200 transition-colors"><X size={20} /></button>
                    </div>
                    <form onSubmit={handleUploadResource} className="p-8 space-y-5">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Title</label>
                            <input name="title" required placeholder="e.g. Physics Formula Sheet" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-sm" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Subject</label>
                            <select name="subject" required className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-sm">
                                {modeSubjects[syllabusMode].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tag Category</label>
                            <select name="tag" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-sm text-slate-600 dark:text-slate-300">
                                <option value="">None</option>
                                <option value="Formula Sheet">Formula Sheet</option>
                                <option value="PYQ Solutions">PYQ Solutions</option>
                                <option value="Handwritten Notes">Handwritten Notes</option>
                                <option value="Mind Map">Mind Map</option>
                                <option value="Mocks">Mock Test</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
                            <textarea name="description" rows="3" placeholder="What is inside this resource?" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-sm resize-none"></textarea>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">File (PDF or Image)</label>
                            <div className="relative group cursor-pointer">
                                <input type="file" name="file" required accept=".pdf,image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                <div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-6 bg-slate-50 dark:bg-black/20 group-hover:border-blue-500 transition-all flex flex-col items-center">
                                    <UploadCloud size={32} className="text-slate-300 group-hover:text-blue-500" />
                                    <span className="text-xs text-slate-400 mt-2">Click or drag & drop</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            disabled={isUploadingResource}
                            className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {isUploadingResource ? <Sparkles className="animate-spin" /> : <Upload size={20} />}
                            {isUploadingResource ? 'UPLOADING...' : 'PUBLISH RESOURCE'}
                        </button>
                    </form>
                </div>
            </div>
        )}

        {/* PDF/Resource Viewer Modal */}
        {selectedResource && (
            <div className="fixed inset-0 z-[100] flex flex-col bg-slate-900/95 backdrop-blur-xl animate-in fade-in duration-300">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0B0E14] shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSelectedResource(null)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-white"><X size={20} /></button>
                        <div>
                            <h3 className="text-xl font-black text-white">{selectedResource.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-widest bg-blue-500/20 text-blue-400 border border-blue-500/30`}>{selectedResource.subject}</span>
                                {selectedResource.tag && <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-widest bg-white/10 text-slate-300">{selectedResource.tag}</span>}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => handleLikeResource(selectedResource.id)} 
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-colors ${selectedResource.likes?.some(l => l.userId === user?.id) ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
                        >
                            <ThumbsUp size={16} className={selectedResource.likes?.some(l => l.userId === user?.id) ? 'fill-rose-500' : ''} /> {selectedResource._count?.likes || 0}
                        </button>
                        <a href={selectedResource.fileUrl} download={selectedResource.title} className="flex items-center gap-2 px-6 py-2 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-500 transition-colors shadow-lg">
                            <UploadCloud size={16} /> Download Copy
                        </a>
                    </div>
                </div>
                <div className="flex-1 w-full bg-[#161923] p-4 md:p-8 flex items-center justify-center overflow-hidden">
                    <div className="w-full max-w-5xl h-full bg-white rounded-xl overflow-hidden shadow-2xl relative border border-white/10">
                        {selectedResource.fileType === 'pdf' ? (
                            <embed src={selectedResource.fileUrl} type="application/pdf" className="w-full h-full" />
                        ) : (
                            <div className="w-full h-full overflow-auto flex items-center justify-center p-4 bg-[#0f1219]">
                                <img src={selectedResource.fileUrl} alt={selectedResource.title} className="max-w-full h-auto rounded-lg shadow-xl" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
      </section>
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
            <div className="text-center"><div className="text-xl font-black text-slate-900 dark:text-white">0</div><div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Points</div></div>
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
            <img src="/logo.png" alt="PeakPrep Logo" className="h-10 w-auto object-contain transition-all" onError={(e) => { e.target.src = 'https://via.placeholder.com/150x40?text=PEAKPREP'; }} />
          </div>
          <nav className="flex-1 px-4 space-y-2">
            <SidebarItem icon={<Home size={20} />} label="Home" active={activeTab === 'Home' || activeTab === 'ChapterPYQs'} onClick={() => setActiveTab('Home')} />
            <SidebarItem icon={<Target size={20} />} label="Goals" active={activeTab === 'Goals'} onClick={() => setActiveTab('Goals')} />
            <SidebarItem icon={<HelpCircle size={20} />} label="Doubts" active={activeTab === 'Doubts'} onClick={() => setActiveTab('Doubts')} />
            <SidebarItem icon={<ClipboardList size={20} />} label="Tests" active={activeTab === 'Tests'} onClick={() => setActiveTab('Tests')} />
            <SidebarItem icon={<BookOpen size={20} />} label="Notes" active={activeTab === 'Notes'} onClick={() => setActiveTab('Notes')} />
            <SidebarItem icon={<Layers size={20} />} label={<span className="flex items-center gap-2">Resources <Sparkles size={14} className="text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400 animate-pulse" /></span>} active={activeTab === 'Resources'} onClick={() => setActiveTab('Resources')} />
            <SidebarItem icon={<ListChecks size={20} />} label="Syllabus" active={activeTab === 'Syllabus'} onClick={() => setActiveTab('Syllabus')} />
            <SidebarItem icon={<Users size={20} />} label="Community" active={activeTab === 'Community'} onClick={() => setActiveTab('Community')} />
          </nav>
          <div className="p-4 space-y-2 border-t border-slate-200 dark:border-white/5">
            <div onClick={toggleTheme} className="flex items-center gap-3 px-4 py-3 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl cursor-pointer transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10 select-none">
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              <span className="font-bold">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
            <a href="https://peakprep.github.io/peakprep/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl cursor-pointer transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10 no-underline">
              <Chrome size={18} />
              <span className="font-bold">Our Extension</span>
            </a>
          </div>
        </aside>

        <main className="ml-64 flex-1 p-8 z-10 relative h-screen overflow-y-auto custom-scrollbar">
          <header className="flex items-center justify-between mb-8">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Dashboard</span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">{activeTab === 'ChapterPYQs' ? 'PYQ Library' : activeTab}</h2>
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
                  <h2 className="font-black text-xl text-slate-900 dark:text-white flex items-center gap-3"><Zap size={24} className="text-amber-500 dark:text-amber-400" /> Recommended Modules</h2>
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
          {activeTab === 'Resources' && <ResourcesView />}

          {activeTab === 'Syllabus' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Syllabus Tracker</h2>
                  <div className="flex items-center gap-2 bg-white/80 dark:bg-white/5 backdrop-blur-md p-1 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm w-fit">
                    <button onClick={() => setSyllabusMode('jee')} className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${syllabusMode === 'jee' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>JEE</button>
                    <button onClick={() => setSyllabusMode('neet')} className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${syllabusMode === 'neet' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>NEET</button>
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
                      <Zap size={20} className="fill-current" />
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">My Notes</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-[0_4px_15px_rgba(37,99,235,0.2)] hover:bg-blue-700 transition">+ New Note</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              </div>
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


          {activeTab !== 'Home' && activeTab !== 'Tests' && activeTab !== 'Resources' && activeTab !== 'Syllabus' && activeTab !== 'Notes' && activeTab !== 'Profile' && activeTab !== 'Community' && activeTab !== 'Goals' && activeTab !== 'Doubts' && activeTab !== 'ChapterPYQs' && (
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

          {selectedDoubt && (
            <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-2 sm:p-4">
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
                          <button onClick={() => {
                            handleResolveDoubt();
                            // Logic for solving: mark as resolved
                          }} className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition">Mark Resolved</button>
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
                    
                    {!selectedDoubt.replies && (
                        <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin"></div></div>
                    )}
                    
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
                    <p className="text-[11px] text-slate-500 font-medium mb-3">Choose how PeakPrep looks to you.</p>
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
