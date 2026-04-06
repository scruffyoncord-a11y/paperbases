import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, Sun, Moon, Menu, X, RotateCcw,
  Upload, ZoomIn, ZoomOut, Clock
} from 'lucide-react';
import EXAM_TEMPLATES from './examTemplates';

// ── Utility ─────────────────────────────────────────────────
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function normalizeCorrectAnswerValue(value, question) {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const raw = String(value).trim();
  if (!raw) return undefined;
  if (question && question.type !== 'Numerical') {
    const upper = raw.toUpperCase();
    if (['A', 'B', 'C', 'D'].includes(upper)) return 'ABCD'.indexOf(upper);
    if (/^[1-4]$/.test(raw)) return parseInt(raw, 10) - 1;
  }
  if (/^-?\d+(?:\.\d+)?$/.test(raw)) return parseFloat(raw);
  return undefined;
}

function isAnswerCorrect(submitted, correct, question) {
  if (question.type === 'Numerical') {
    const s = typeof submitted === 'number' ? submitted : parseFloat(submitted);
    const c = typeof correct === 'number' ? correct : parseFloat(correct);
    if (!Number.isFinite(s) || !Number.isFinite(c)) return false;
    return Math.abs(s - c) < 1e-9;
  }
  const s2 = typeof submitted === 'number' ? submitted : normalizeCorrectAnswerValue(submitted, question);
  return s2 === correct;
}

function scoreQuestion(question, submittedAnswer, scheme) {
  const isNumerical = question.type === 'Numerical';
  const marks = isNumerical ? scheme.numerical : scheme.mcq;
  const normalizedCorrect = normalizeCorrectAnswerValue(question.correctAnswer, question);
  const hasSubmittedAnswer = submittedAnswer !== undefined && submittedAnswer !== null && submittedAnswer !== '';
  if (!hasSubmittedAnswer) {
    return { status: 'unattempted', scoreDelta: 0, maxScoreDelta: normalizedCorrect !== undefined ? marks.correct : 0 };
  }
  if (normalizedCorrect === undefined) {
    return { status: 'ungraded', scoreDelta: 0, maxScoreDelta: 0 };
  }
  const isCorrectResult = isAnswerCorrect(submittedAnswer, normalizedCorrect, question);
  return {
    status: isCorrectResult ? 'correct' : 'incorrect',
    scoreDelta: isCorrectResult ? marks.correct : marks.wrong,
    maxScoreDelta: marks.correct
  };
}

// ── Main ExamPortal Component ───────────────────────────────
export default function ExamPortal({ questions: initialQuestions, subjects: initialSubjects, imageMap, templateId, title, onExit }) {
  const [view, setView] = useState('exam'); // 'exam' | 'results'
  const [questions, setQuestions] = useState(initialQuestions);
  const [subjects] = useState(initialSubjects);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [visited, setVisited] = useState(new Set([0]));
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const questionPanelRef = useRef(null);

  // Timer
  const activeTemplate = EXAM_TEMPLATES[templateId] || EXAM_TEMPLATES['custom'];
  const [timerSeconds, setTimerSeconds] = useState(activeTemplate.duration || 3 * 60 * 60);

  useEffect(() => {
    if (view !== 'exam') return;
    const interval = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) { clearInterval(interval); handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [view]);

  // Build palette groups
  const paletteGroups = [];
  let currentSubject = null;
  let group = null;
  questions.forEach((q, i) => {
    if (q.subject !== currentSubject) {
      if (group) paletteGroups.push(group);
      currentSubject = q.subject;
      group = { title: q.subject?.toUpperCase() || 'GENERAL', start: i, end: i };
    } else if (group) {
      group.end = i;
    }
  });
  if (group) paletteGroups.push(group);

  // Mark visited
  useEffect(() => {
    setVisited(prev => new Set([...prev, currentIndex]));
  }, [currentIndex]);

  // KaTeX rendering
  useEffect(() => {
    if (typeof window.renderMathInElement === 'function' && questionPanelRef.current) {
      window.renderMathInElement(questionPanelRef.current, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false, strict: false
      });
    }
  }, [currentIndex, view]);

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleOptionClick = (optIndex) => {
    setAnswers(prev => ({ ...prev, [currentIndex]: optIndex }));
  };

  const handleNumericalChange = (val) => {
    const trimmed = val.trim();
    if (trimmed === '') {
      setAnswers(prev => { const n = { ...prev }; delete n[currentIndex]; return n; });
    } else {
      setAnswers(prev => ({ ...prev, [currentIndex]: parseFloat(trimmed) }));
    }
  };

  const clearResponse = () => {
    setAnswers(prev => { const n = { ...prev }; delete n[currentIndex]; return n; });
  };

  const saveAndNext = () => {
    setMarkedForReview(prev => { const n = new Set(prev); n.delete(currentIndex); return n; });
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const markReviewAndNext = () => {
    setAnswers(prev => { const n = { ...prev }; delete n[currentIndex]; return n; });
    setMarkedForReview(prev => new Set([...prev, currentIndex]));
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const saveMarkReview = () => {
    setMarkedForReview(prev => new Set([...prev, currentIndex]));
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleSubmit = useCallback(() => {
    setView('results');
  }, []);

  const handleRestart = () => {
    setCurrentIndex(0);
    setAnswers({});
    setVisited(new Set([0]));
    setMarkedForReview(new Set());
    setTimerSeconds(activeTemplate.duration || 3 * 60 * 60);
    setView('exam');
  };

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (view !== 'exam') return;
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') { e.preventDefault(); saveAndNext(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); if (currentIndex > 0) setCurrentIndex(currentIndex - 1); }
      else if (e.key >= '1' && e.key <= '4') {
        const q = questions[currentIndex];
        if (q.type === 'Numerical') return;
        const idx = parseInt(e.key, 10) - 1;
        if (idx < (q.options?.length || 0)) handleOptionClick(idx);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [currentIndex, view, questions]);

  const getPaletteClass = (i) => {
    const isAnswered = answers[i] !== undefined;
    const isVisited2 = visited.has(i);
    const isMarked = markedForReview.has(i);
    if (isAnswered && isMarked) return 'bg-violet-600 text-white border-violet-500';
    if (isMarked) return 'bg-purple-600 text-white border-purple-500';
    if (isAnswered) return 'bg-emerald-600 text-white border-emerald-500';
    if (isVisited2) return 'bg-rose-600 text-white border-rose-500';
    return 'bg-[#1C1F29] text-slate-400 border-[#333942]';
  };

  // ── RESULTS VIEW ──────────────────────────────────────────
  if (view === 'results') {
    const scheme = activeTemplate.markingScheme || { mcq: { correct: 4, wrong: -1 }, numerical: { correct: 4, wrong: 0 } };
    let correct = 0, incorrect = 0, unattempted = 0, ungraded = 0, score = 0, gradedMaxScore = 0;
    questions.forEach((q, i) => {
      const outcome = scoreQuestion(q, answers[i], scheme);
      score += outcome.scoreDelta;
      gradedMaxScore += outcome.maxScoreDelta;
      if (outcome.status === 'correct') correct++;
      else if (outcome.status === 'incorrect') incorrect++;
      else if (outcome.status === 'ungraded') ungraded++;
      else unattempted++;
    });
    const maxScore = gradedMaxScore > 0 ? gradedMaxScore : (activeTemplate.totalMarks || questions.length * scheme.mcq.correct);
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="bg-white/80 dark:bg-[#161923]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-10 max-w-lg w-full text-center shadow-2xl dark:shadow-black/40">
          <div className={`text-7xl mb-6 ${percentage < 40 ? 'opacity-40' : ''}`}>🏆</div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Exam Submitted!</h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 mb-8">
            You scored <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{score}</span> out of <span className="font-bold">{maxScore}</span>
          </p>
          <div className="grid grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Correct', value: correct, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' },
              { label: 'Incorrect', value: incorrect, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20' },
              { label: 'Unattempted', value: unattempted, color: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/20' },
              { label: 'Ungraded', value: ungraded, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' },
            ].map((s, i) => (
              <div key={i} className={`p-3 rounded-2xl border ${s.color}`}>
                <div className="text-2xl font-black">{s.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mb-8">
            MCQ: +{scheme.mcq.correct} / {scheme.mcq.wrong} · Numerical: +{scheme.numerical.correct} / {scheme.numerical.wrong} · Key coverage: {correct + incorrect}/{questions.length}
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={handleRestart} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-white/10 transition">
              <RotateCcw size={18} /> Restart
            </button>
            <button onClick={onExit} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-white/10 transition">
              <Upload size={18} /> Upload New
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── EXAM VIEW ─────────────────────────────────────────────
  const q = questions[currentIndex];
  const isLastQ = currentIndex === questions.length - 1;
  const labels = ['A', 'B', 'C', 'D'];

  return (
    <div className="flex flex-col lg:flex-row gap-0 -mx-8 -mt-8" style={{ minHeight: 'calc(100vh - 0px)' }}>
      {/* Question Panel */}
      <div className="flex-1 flex flex-col" ref={questionPanelRef}>
        {/* Q Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-white/50 dark:bg-[#0B0E14]/50 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={onExit} className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition">
              <ChevronLeft size={18} />
            </button>
            <h2 className="font-black text-slate-900 dark:text-white text-sm">
              {q.subject} <span className="text-slate-400 font-medium">({q.type || 'MCQ'})</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setFontScale(s => Math.max(0.85, s - 0.1))} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition">
              <ZoomOut size={14} />
            </button>
            <button onClick={() => setFontScale(s => Math.min(1.5, s + 0.1))} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition">
              <ZoomIn size={14} />
            </button>
            <span className="ml-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black border border-blue-200 dark:border-blue-500/20">
              Q. {q.id}
            </span>
            {/* Mobile sidebar toggle */}
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500">
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Question Body */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar" style={{ fontSize: `${fontScale}rem` }}>
          {/* Question Text */}
          <div className="mb-6 text-slate-800 dark:text-slate-200 leading-relaxed" dangerouslySetInnerHTML={{ __html: q.text }} />

          {/* Question Images */}
          {q.images && q.images.length > 1 ? (
            <div className="flex flex-wrap gap-3 mb-6">
              {q.images.map((img, idx) => (
                <img key={idx} src={img} alt={`Q${q.id} diagram ${idx + 1}`} className="max-w-full max-h-64 rounded-xl border border-slate-200 dark:border-white/10" loading="lazy" />
              ))}
            </div>
          ) : q.image ? (
            <div className="mb-6">
              <img src={q.image} alt={`Q${q.id} diagram`} className="max-w-full max-h-64 rounded-xl border border-slate-200 dark:border-white/10" loading="lazy" />
            </div>
          ) : null}

          {/* Options (MCQ) */}
          {q.type !== 'Numerical' && q.options && (
            <div className="space-y-3">
              {q.options.map((opt, i) => {
                const selected = answers[currentIndex] === i;
                return (
                  <button
                    key={i}
                    onClick={() => handleOptionClick(i)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                      selected
                        ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-400 dark:border-blue-500/50 ring-1 ring-blue-400 dark:ring-blue-500/50'
                        : 'bg-white/60 dark:bg-[#161923]/60 border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/30 hover:bg-blue-50/50 dark:hover:bg-blue-500/5'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 border ${
                      selected ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-100 dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10'
                    }`}>
                      {labels[i]}
                    </span>
                    <span className="flex-1 text-slate-800 dark:text-slate-200 text-sm">
                      {opt.image && <img src={opt.image} alt={`Option ${labels[i]}`} className="max-h-20 mb-1 rounded" loading="lazy" />}
                      <span dangerouslySetInnerHTML={{ __html: opt.text }} />
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Numerical Input */}
          {q.type === 'Numerical' && (
            <div className="mt-4">
              <label className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 block">Enter your answer (integer value):</label>
              <input
                type="number"
                className="w-full max-w-xs px-4 py-3 rounded-xl bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-lg font-bold"
                placeholder="Type your answer..."
                value={answers[currentIndex] !== undefined ? answers[currentIndex] : ''}
                onChange={(e) => handleNumericalChange(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-white/10 bg-white/50 dark:bg-[#0B0E14]/50 backdrop-blur-md">
          <div className="flex gap-2">
            <button onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)} disabled={currentIndex === 0}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-700 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-white/10 transition">
              <ChevronLeft size={16} /> Back
            </button>
            <button onClick={clearResponse} disabled={answers[currentIndex] === undefined}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-700 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-white/10 transition">
              Clear
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={markReviewAndNext}
              className="px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 shadow-sm transition">
              {isLastQ ? 'Mark for Review' : 'Mark Review & Next'}
            </button>
            <button onClick={saveMarkReview} disabled={answers[currentIndex] === undefined}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold disabled:opacity-30 hover:bg-indigo-700 shadow-sm transition">
              Save & Mark
            </button>
            {!isLastQ ? (
              <button onClick={saveAndNext}
                className="flex items-center gap-1 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-sm transition">
                Save & Next <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={handleSubmit}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 shadow-sm transition">
                Submit Exam
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar / Palette */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
      <div className={`fixed lg:relative right-0 top-0 h-full lg:h-auto w-72 lg:w-72 z-40 lg:z-auto border-l border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0B0E14]/95 backdrop-blur-xl flex flex-col transition-transform lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        {/* Timer */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-blue-500" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Time Left</span>
          </div>
          <span className={`font-mono text-lg font-black ${timerSeconds < 300 ? 'text-rose-500 animate-pulse' : 'text-slate-900 dark:text-white'}`}>
            {formatTime(timerSeconds)}
          </span>
        </div>

        {/* Question Palette */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {paletteGroups.map((grp, gi) => (
            <div key={gi} className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{grp.title}</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: grp.end - grp.start + 1 }, (_, j) => {
                  const idx = grp.start + j;
                  const isActive = idx === currentIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => { setCurrentIndex(idx); setIsSidebarOpen(false); }}
                      className={`w-10 h-10 rounded-xl text-xs font-bold border transition-all ${getPaletteClass(idx)} ${isActive ? 'ring-2 ring-blue-400 scale-110' : 'hover:scale-105'}`}
                    >
                      {questions[idx].id}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend + Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-600" /> Answered</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-rose-600" /> Not Answered</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-purple-600" /> Review</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#1C1F29] border border-[#333942]" /> Not Visited</span>
          </div>
          <button onClick={onExit} className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition">
            ← Upload New File
          </button>
        </div>
      </div>
    </div>
  );
}
