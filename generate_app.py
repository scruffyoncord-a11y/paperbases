import json

content = ``import React, { useState, useMemo, useEffect } from 'react';
import { 
  Home, BookOpen, ClipboardList, User, Chrome, Sun, Moon,
  ChevronRight, Star, Trophy, Search, Book, FileText, Layers, 
  Calculator, Bookmark, UploadCloud, Sparkles, Zap, Target, 
  Activity, ChevronDown, Info, ListChecks, Upload, FolderSearch,
  ArrowRight, ArrowLeft, Settings, Mail, ShieldCheck, LogOut,
  Bell, CheckCircle2, Clock, Circle, Users, MessageSquare,
  ThumbsUp, MessageCircle, Share2, TrendingUp, TrendingDown,
  Calendar, Flame, Award, Plus, Flag, HelpCircle, Lock, X,
  Building, GraduationCap, Filter, BarChart3
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

const SidebarItem = ({ icon, label, active, onClick, isDarkMode }) => {
  return (
    <div 
      onClick={onClick}
      className={lex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300 \}
    >
      <div className={\}>
        {icon}
      </div>
      <span className="text-sm">{label}</span>
    </div>
  );
};

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('Home');
  const [homeTab, setHomeTab] = useState('All');
  const [resourceTab, setResourceTab] = useState('Quick Access');
  const [doubtTab, setDoubtTab] = useState('All');
  const [examTemplate, setExamTemplate] = useState('custom');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedExamForPYQ, setSelectedExamForPYQ] = useState(null);
  const [pyqSubject, setPyqSubject] = useState('Physics');
  const [selectedDay, setSelectedDay] = useState('Mon');
  const [syllabusMode, setSyllabusMode] = useState('jee'); 
  const [activeSubject, setActiveSubject] = useState('Physics');
  const [syllabusProgress, setSyllabusProgress] = useState({}); 

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

  const updateStatus = (subject, index, status) => {
    setSyllabusProgress(prev => {
      const newProgress = { ...prev };
      if (!newProgress[subject]) {
        newProgress[subject] = new Array(UNIFIED_SYLLABUS[subject].length).fill(0);
      }
      newProgress[subject][index] = status;
      return newProgress;
    });
  };

  const getChapterStatus = (subject, index) => {
    return syllabusProgress[subject]?.[index] || 0;
  };

  const getSubjectProgress = (subject) => {
    const total = UNIFIED_SYLLABUS[subject]?.length || 1;
    const completed = syllabusProgress[subject]?.filter(s => s === 2).length || 0;
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
    { id: 'neet', name: 'NEET', color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/20', img: 'https://i.postimg.cc/LXfc8LVS/image.png' }
  ];

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="flex min-h-screen bg-slate-50 dark:bg-[#0B0E14] text-slate-600 dark:text-slate-300 font-sans relative overflow-hidden transition-colors duration-300">
        <aside className="w-64 border-r border-slate-200 dark:border-white/5 flex flex-col fixed h-full bg-white/90 dark:bg-[#0B0E14]/80 backdrop-blur-2xl z-50">
          <div className="p-6 flex items-center mb-4 text-xl font-bold">PAPERBASE</div>
          <nav className="flex-1 px-4 space-y-2">
            <SidebarItem icon={<Home size={20} />} label="Home" active={activeTab === 'Home'} onClick={() => setActiveTab('Home')} isDarkMode={isDarkMode} />
            <SidebarItem icon={<Target size={20} />} label="Goals" active={activeTab === 'Goals'} onClick={() => setActiveTab('Goals')} isDarkMode={isDarkMode} />
            <SidebarItem icon={<ListChecks size={20} />} label="Syllabus" active={activeTab === 'Syllabus'} onClick={() => setActiveTab('Syllabus')} isDarkMode={isDarkMode} />
          </nav>
          <div className="p-4 space-y-2 border-t border-slate-200 dark:border-white/5">
            <div onClick={toggleTheme} className="flex items-center gap-3 px-4 py-3 text-sm cursor-pointer select-none">
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              <span className="font-bold">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
          </div>
        </aside>
        <main className="ml-64 flex-1 p-8 z-10 relative h-screen overflow-y-auto">
          <header className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black">{activeTab}</h2>
          </header>
          {activeTab === 'Home' && <div>Welcome to the Dashboard! Use the sidebar to navigate.</div>}
          {activeTab === 'Goals' && <div>Goals content goes here.</div>}
          {activeTab === 'Syllabus' && <div>Syllabus content goes here.</div>}
        </main>
      </div>
    </div>
  );
}
``

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

