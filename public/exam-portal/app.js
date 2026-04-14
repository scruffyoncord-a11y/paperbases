// ====================================
// Exam Portal — Full Exam Logic
// Template-aware, MCQ + Numerical
// ====================================

(function () {
  'use strict';

  // ---- State ----
  let questions = [];
  let subjects = [];
  let imageMap = {};
  let paletteGroups = [];
  let selectedTemplate = 'custom';
  let activeTemplate = null;
  let examFontScale = Math.max(0.85, Math.min(1.5, parseFloat(localStorage.getItem('examFontScale') || '1') || 1));

  let currentIndex = 0;
  let answers = {};        // index → optionIndex (MCQ) or number (Numerical)
  let visited = new Set([0]);
  let markedForReview = new Set();
  let isFinished = false;
  let isDarkMode = false;
  let isSidebarOpen = false;

  // Timer
  let timerSeconds = 3 * 60 * 60;
  let timerInterval = null;

  // ---- DOM ----
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  // Views
  const uploadView = $('#uploadView');
  const examView = $('#examView');
  const resultsView = $('#resultsView');

  // Upload
  const dropZone = $('#dropZone');
  const fileInput = $('#fileInput');
  const uploadError = $('#uploadError');
  const demoBtn = $('#demoBtn');
  const processingSection = $('#processingSection');
  const processingTitle = $('#processingTitle');
  const processingDetail = $('#processingDetail');
  const templateCards = $('#templateCards');

  // Exam
  const qSubject = $('#qSubject');
  const qType = $('#qType');
  const qBadgePill = $('#qBadgePill');
  const qCard = $('#qCard');
  const qText = $('#qText');
  const qImage = $('#qImage');
  const qOptions = $('#qOptions');
  const qNumerical = $('#qNumerical');
  const numericalInput = $('#numericalInput');
  const prevBtn = $('#prevBtn');
  const clearBtn = $('#clearBtn');
  const markReviewBtn = $('#markReviewBtn');
  const saveMarkBtn = $('#saveMarkBtn');
  const saveNextBtn = $('#saveNextBtn');
  const submitBtn = $('#submitBtn');
  const paletteScroll = $('#paletteScroll');
  const timerValue = $('#timerValue');
  const paletteSidebar = $('#paletteSidebar');
  const mobileOverlay = $('#mobileOverlay');
  const savedExamsList = $('#savedExamsList');
  const fontDecreaseBtn = $('#fontDecreaseBtn');
  const fontIncreaseBtn = $('#fontIncreaseBtn');

  // Results
  const trophyIcon = $('#trophyIcon');
  const scoreValue = $('#scoreValue');
  const scoreMax = $('#scoreMax');
  const resultsStats = $('#resultsStats');

  // ================================
  //  INIT
  // ================================
  function init() {
    applyFontScale();
    bindUploadEvents();
    bindExamEvents();
    bindThemeEvents();
    bindTemplateEvents();
    bindFontZoomEvents();
    renderSavedExams();

    // Check for auto-load ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const autoLoadId = urlParams.get('id');
    const dbid = urlParams.get('dbid');

    if (dbid) {
      console.log('[App] Auto-loading from DB, ID:', dbid);
      loadExamFromDb(dbid);
    } else if (autoLoadId && typeof ExamStore !== 'undefined') {
      console.log('[App] Auto-loading exam ID:', autoLoadId);
      loadSavedExam(parseInt(autoLoadId, 10));
    }
  }

  // ================================
  //  TEMPLATE SELECTOR
  // ================================
  function bindTemplateEvents() {
    templateCards.addEventListener('click', (e) => {
      const card = e.target.closest('.template-card');
      if (!card) return;
      selectedTemplate = card.dataset.template;
      syncTemplateSelectionUI();
    });
  }

  function syncTemplateSelectionUI() {
    templateCards.querySelectorAll('.template-card').forEach(c => {
      c.classList.toggle('active', c.dataset.template === selectedTemplate);
    });
  }

  function bindFontZoomEvents() {
    if (fontDecreaseBtn) {
      fontDecreaseBtn.addEventListener('click', () => {
        examFontScale = Math.max(0.85, +(examFontScale - 0.1).toFixed(2));
        applyFontScale();
      });
    }
    if (fontIncreaseBtn) {
      fontIncreaseBtn.addEventListener('click', () => {
        examFontScale = Math.min(1.5, +(examFontScale + 0.1).toFixed(2));
        applyFontScale();
      });
    }
  }

  function applyFontScale() {
    document.documentElement.style.setProperty('--exam-font-scale', String(examFontScale));
    try { localStorage.setItem('examFontScale', String(examFontScale)); } catch (_) {}
  }

  // ================================
  //  UPLOAD
  // ================================
  function bindUploadEvents() {
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault(); dropZone.classList.remove('drag-over');
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); });
    dropZone.addEventListener('click', () => fileInput.click());
    demoBtn.addEventListener('click', loadDemoData);
  }

  function handleFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'pdf') handlePdfUpload(file);
    else if (ext === 'json') handleJsonUpload(file);
    else if (ext === 'md' || ext === 'txt') handleTextUpload(file);
    else showError('Please upload a .pdf, .json, .md, or .txt file.');
  }

  function handleJsonUpload(file) {
    showError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      try { processJson(JSON.parse(e.target.result)); }
      catch (err) { showError('Failed to parse JSON: ' + err.message); }
    };
    reader.onerror = () => showError('Failed to read file.');
    reader.readAsText(file);
  }

  function handleTextUpload(file) {
    showError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      try { processRawMarkdown(e.target.result); }
      catch (err) { showError('Failed to parse text: ' + err.message); }
    };
    reader.onerror = () => showError('Failed to read file.');
    reader.readAsText(file);
  }

  async function handlePdfUpload(file) {
    showError('');
    showProcessing('Converting PDF...', 'This may take a few minutes depending on file size');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadResp = await fetch('/api/upload-pdf', { method: 'POST', body: formData });
      if (!uploadResp.ok) { const err = await uploadResp.json(); throw new Error(err.error || 'Upload failed'); }
      const { jobId } = await uploadResp.json();
      while (true) {
        await sleep(3000);
        const statusResp = await fetch(`/api/status/${jobId}`);
        const statusData = await statusResp.json();
        if (statusData.status === 'done') { hideProcessing(); processJson(statusData.result); return; }
        else if (statusData.status === 'failed') { hideProcessing(); showError('Conversion failed: ' + (statusData.error || 'Unknown')); return; }
        else { updateProcessing(statusData.status === 'submitting' ? 'Submitting...' : 'Processing PDF...', statusData.progress || 'Please wait...'); }
      }
    } catch (err) { hideProcessing(); showError('PDF upload error: ' + err.message); }
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  function showProcessing(title, detail) {
    processingSection.classList.remove('hidden');
    dropZone.style.display = 'none';
    demoBtn.style.display = 'none';
    processingTitle.textContent = title;
    processingDetail.textContent = detail;
  }
  function updateProcessing(title, detail) {
    processingTitle.textContent = title;
    processingDetail.textContent = detail;
  }
  function hideProcessing() {
    processingSection.classList.add('hidden');
    dropZone.style.display = '';
    demoBtn.style.display = '';
  }

  function processRawMarkdown(rawText) {
    try {
      console.log('[App] Processing raw markdown, length:', rawText.length);
      const result = ExamParser.parseMarkdown(rawText);
      finishProcessing(result);
    } catch (err) {
      console.error('[App] Markdown parser error:', err);
      showError('Parser error: ' + err.message);
    }
  }

  function processJson(rawJson) {
    try {
      console.log('[App] Raw JSON keys:', Object.keys(rawJson));
      
      let result;

      // Check if this is pre-structured question data
      const directQuestions = detectDirectQuestions(rawJson);
      if (directQuestions) {
        console.log('[App] Detected pre-structured question format');
        const subjects = [...new Set(directQuestions.map(q => q.subject || 'General'))];
        directQuestions.forEach((q, i) => {
          if (!q.id) q.id = i + 1;
          if (!q.subject) q.subject = 'General';
          if (!q.type) q.type = 'MCQ';
          if (q.options && q.options.length > 0 && typeof q.options[0] === 'string') {
            const labels = ['a', 'b', 'c', 'd'];
            q.options = q.options.map((opt, j) => ({ label: labels[j] || String(j+1), text: opt }));
          }
        });
        result = { title: rawJson.title || 'Exam Paper', questions: directQuestions, subjects, imageMap: {} };
      } else {
        result = ExamParser.parse(rawJson);
      }
      
      finishProcessing(result);
    } catch (err) { console.error('[App] Parser error:', err); showError('Parser error: ' + err.message); }
  }

  function finishProcessing(result, skipSave) {
    console.log('[App] Parsed result:', result.questions.length, 'questions,', result.subjects.length, 'subjects');
    if (result.questions.length > 0) {
      console.log('[App] First question:', JSON.stringify(result.questions[0]));
    }
    
    if (result.questions.length === 0) { showError('No questions found. Check browser console (F12) for debug info.'); return; }
    questions = dedupeQuestionsById(result.questions);
    subjects = result.subjects;
    imageMap = result.imageMap;

    if (selectedTemplate === 'custom') {
      selectedTemplate = detectTemplateFromResult({ questions, subjects, title: result.title });
      syncTemplateSelectionUI();
    }

    // Apply template
    activeTemplate = EXAM_TEMPLATES[selectedTemplate] || EXAM_TEMPLATES['custom'];
    applyTemplate();

    // Auto-save to IndexedDB (unless loading from saved)
    if (!skipSave && typeof ExamStore !== 'undefined') {
      const examName = result.title || 'Exam Paper';
      ExamStore.saveExam({
        name: examName,
        template: selectedTemplate,
        questions: questions,
        subjects: subjects,
        imageMap: imageMap
      }).then(() => {
        console.log('[App] Exam saved:', examName);
        renderSavedExams();
      }).catch(err => console.error('[App] Save failed:', err));
    }

    buildPaletteGroups();
    resetExamState();
    switchView('exam');
  }

  // ================================
  //  SAVED EXAMS
  // ================================
  function renderSavedExams() {
    if (!savedExamsList || typeof ExamStore === 'undefined') return;
    ExamStore.listExams().then(exams => {
      if (exams.length === 0) {
        savedExamsList.innerHTML = '';
        return;
      }
      savedExamsList.innerHTML = exams.map(e => {
        const d = new Date(e.date);
        const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        const tmplName = EXAM_TEMPLATES[e.template] ? EXAM_TEMPLATES[e.template].name : e.template;
        return `<div class="saved-exam-card" data-id="${e.id}">
          <div class="saved-exam-info">
            <div class="saved-exam-name">${escapeHtml(e.name)}</div>
            <div class="saved-exam-meta">
              <span>${tmplName}</span>
              <span>${e.questionCount} Qs</span>
              <span>${dateStr} ${timeStr}</span>
            </div>
          </div>
          <div class="saved-exam-actions">
            <button class="saved-exam-load" data-id="${e.id}">Load</button>
            <button class="saved-exam-delete" data-id="${e.id}">✕</button>
          </div>
        </div>`;
      }).join('');

      // Bind events
      savedExamsList.querySelectorAll('.saved-exam-load').forEach(btn => {
        btn.addEventListener('click', (ev) => { ev.stopPropagation(); loadSavedExam(parseInt(btn.dataset.id)); });
      });
      savedExamsList.querySelectorAll('.saved-exam-delete').forEach(btn => {
        btn.addEventListener('click', (ev) => { ev.stopPropagation(); deleteSavedExam(parseInt(btn.dataset.id)); });
      });
      savedExamsList.querySelectorAll('.saved-exam-card').forEach(card => {
        card.addEventListener('click', () => loadSavedExam(parseInt(card.dataset.id)));
      });
    }).catch(err => console.error('[App] List exams failed:', err));
  }

  function loadSavedExam(id) {
    ExamStore.loadExam(id).then(exam => {
      if (!exam) { showError('Exam not found.'); return; }
      selectedTemplate = exam.template || 'custom';
      finishProcessing({
        title: exam.name,
        questions: exam.questions,
        subjects: exam.subjects,
        imageMap: exam.imageMap || {}
      }, true); // skipSave = true
    }).catch(err => showError('Failed to load: ' + err.message));
  }

  async function loadExamFromDb(dbid) {
    showProcessing('Loading Exam...', 'Fetching data from server');
    try {
      const res = await fetch(`/api/exams/${dbid}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to load exam');
      
      const exam = data.exam;
      const parsedData = JSON.parse(exam.data);
      
      selectedTemplate = exam.template || 'custom';
      hideProcessing();
      finishProcessing({
        title: exam.name,
        questions: parsedData.questions,
        subjects: parsedData.subjects,
        imageMap: parsedData.imageMap || {}
      }, true); // skipSave = true (already in DB)
    } catch (err) {
      hideProcessing();
      showError('Failed to load from DB: ' + err.message);
    }
  }

  function deleteSavedExam(id) {
    ExamStore.deleteExam(id).then(() => renderSavedExams()).catch(err => console.error(err));
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Detect if the JSON contains pre-structured questions (already parsed)
  function detectDirectQuestions(rawJson) {
    // Format: { questions: [...] }
    if (rawJson.questions && Array.isArray(rawJson.questions) && rawJson.questions.length > 0) {
      const q = rawJson.questions[0];
      if (q.text !== undefined || q.question !== undefined || q.options !== undefined) {
        // Normalize: some formats use 'question' instead of 'text'
        return rawJson.questions.map(normalizeIncomingQuestion);
      }
    }
    // Format: direct array of question objects
    if (Array.isArray(rawJson) && rawJson.length > 0) {
      const q = rawJson[0];
      if (q.text !== undefined || q.question !== undefined || q.options !== undefined) {
        return rawJson.map(normalizeIncomingQuestion);
      }
    }
    return null;
  }

  function normalizeIncomingQuestion(q) {
    if (q.question && !q.text) q.text = q.question;

    const normalizedAnswer = normalizeCorrectAnswerValue(
      q.correctAnswer ?? q.correct_answer ?? q.answer ?? q.answerKey ?? q.correctOption
    );

    if (normalizedAnswer !== undefined) {
      q.correctAnswer = normalizedAnswer;
    }

    return q;
  }

  function formatUserError(msg) {
    if (!msg) return '';
    const text = String(msg);
    if (/unable to connect to proxy|proxyerror|winerror 10061|conversion service could not be reached/i.test(text)) {
      return 'Upload could not reach conversion service. Please restart the server with start_server.bat and try again.';
    }
    if (/failed to parse|parser error|no questions found/i.test(text)) {
      return 'This file could not be read cleanly. Try the parsed JSON version or upload the PDF again.';
    }
    return text;
  }

  function showError(msg) {
    uploadError.textContent = formatUserError(msg);
    uploadError.style.display = msg ? 'block' : 'none';
  }

  // ================================
  //  APPLY TEMPLATE
  // ================================
  function applyTemplate() {
    if (!activeTemplate || selectedTemplate === 'custom') {
      // Auto-detect: all questions are MCQ by default
      questions.forEach(q => { if (!q.type) q.type = 'MCQ'; });
      return;
    }

    const tmpl = activeTemplate;

    // Build a flat list of all sections with their subject
    const allSections = [];
    for (const subj of tmpl.subjects) {
      for (const sec of subj.sections) {
        allSections.push({ ...sec, subjectName: subj.name });
      }
    }
    allSections.sort((a, b) => a.startQ - b.startQ);

    // Assign question types and subjects based on template sections
    questions.forEach((q, idx) => {
      q.type = 'MCQ'; // default
      let matched = false;
      for (const sec of allSections) {
        if (q.id >= sec.startQ && q.id <= sec.endQ) {
          q.type = sec.type;
          q.subject = sec.subjectName;
          matched = true;
          break;
        }
      }
      // If no template section matched, assign by position proportionally
      if (!matched && tmpl.subjects.length > 0) {
        const totalTemplateQs = allSections.reduce((sum, s) => sum + (s.endQ - s.startQ + 1), 0);
        const qsPerSubject = Math.ceil(questions.length / tmpl.subjects.length);
        const subjIdx = Math.min(Math.floor(idx / qsPerSubject), tmpl.subjects.length - 1);
        q.subject = tmpl.subjects[subjIdx].name;
      }
    });

    // Override subjects list from template
    if (tmpl.subjects.length > 0) {
      subjects = tmpl.subjects.map(s => s.name);
    }

    // Duration
    if (tmpl.duration) {
      timerSeconds = tmpl.duration;
    }

    ensureTemplateQuestionCoverage(tmpl);
  }

  function detectTemplateFromResult(result) {
    const title = String(result.title || '').toLowerCase();
    const normalizedSubjects = (result.subjects || []).map(s => String(s || '').toLowerCase());
    const maxId = Math.max(0, ...((result.questions || []).map(q => Number(q.id) || 0)));

    if (
      title.includes('bitsat') ||
      (
        normalizedSubjects.includes('english proficiency') &&
        normalizedSubjects.includes('logical reasoning') &&
        normalizedSubjects.includes('physics') &&
        normalizedSubjects.includes('chemistry') &&
        normalizedSubjects.includes('mathematics') &&
        maxId <= 150
      )
    ) {
      return 'bitsat';
    }

    return selectedTemplate;
  }

  function ensureTemplateQuestionCoverage(tmpl) {
    if (!tmpl || !Array.isArray(tmpl.subjects) || tmpl.subjects.length === 0) return;

    const expected = [];
    for (const subj of tmpl.subjects) {
      for (const sec of subj.sections) {
        for (let id = sec.startQ; id <= sec.endQ; id++) {
          expected.push({ id, subject: subj.name, type: sec.type });
        }
      }
    }

    const existingIds = new Set(questions.map(q => q.id));
    const placeholders = expected
      .filter(entry => !existingIds.has(entry.id))
      .map(entry => ({
        id: entry.id,
        subject: entry.subject,
        type: entry.type,
        text: '',
        options: entry.type === 'Numerical'
          ? []
          : [
              { label: 'a', text: '—' },
              { label: 'b', text: '—' },
              { label: 'c', text: '—' },
              { label: 'd', text: '—' }
            ],
        missingFromParse: true
      }));

    questions = dedupeQuestionsById([...questions, ...placeholders]).sort((a, b) => a.id - b.id);
  }

  function dedupeQuestionsById(list) {
    const byId = new Map();

    for (const q of list || []) {
      const existing = byId.get(q.id);
      if (!existing || getQuestionRichnessScore(q) > getQuestionRichnessScore(existing)) {
        byId.set(q.id, q);
      }
    }

    return Array.from(byId.values());
  }

  function getQuestionRichnessScore(q) {
    if (!q) return -1;

    const textScore = (q.text || '').trim().length;
    const options = Array.isArray(q.options) ? q.options : [];
    const optionScore = options.reduce((sum, opt) => {
      const text = String(opt && opt.text || '').trim();
      const imageBonus = opt && opt.image ? 40 : 0;
      const placeholderPenalty = text === '—' ? 0 : text.length;
      return sum + placeholderPenalty + imageBonus;
    }, 0);
    const imageScore = (Array.isArray(q.images) ? q.images.length : 0) * 50 + (q.image ? 50 : 0);
    const missingPenalty = q.missingFromParse ? -1000 : 0;

    return textScore + optionScore + imageScore + missingPenalty;
  }

  // ================================
  //  DEMO DATA
  // ================================
  function loadDemoData() {
    processJson({
      layoutParsingResults: [{
        markdown: {
          text: `# Demo Physics Paper\n\n##### PHYSICS\n\n1. A body of mass 5 kg is thrown vertically upward with a velocity of $10\\;\\text{m/s}$. Maximum height reached is: (Take $g = 10\\;\\text{m/s}^2$)\n\n(a) 5 m (b) 10 m (c) 15 m (d) 20 m\n\n2. The SI unit of electric charge is:\n\n(a) Ampere (b) Coulomb (c) Volt (d) Ohm\n\n3. A convex lens has focal length 20 cm. Object at 30 cm. Image formed at:\n\n(a) 60 cm (b) 40 cm (c) 30 cm (d) 20 cm\n\n4. Energy stored in a capacitor $C$ charged to $V$ is:\n\n(a) $CV$ (b) $CV^2$ (c) $\\frac{1}{2}CV^2$ (d) $\\frac{1}{2}C^2V$\n\n5. Dimensional formula of Planck's constant:\n\n(a) $[ML^2T^{-1}]$ (b) $[MLT^{-2}]$ (c) $[ML^2T^{-2}]$ (d) $[ML^{-1}T^{-1}]$\n\n##### CHEMISTRY\n\n6. The number of moles in 36 g of water is:\n\n(a) 1 (b) 2 (c) 3 (d) 4\n\n7. pH of a neutral solution at 25°C is:\n\n(a) 0 (b) 1 (c) 7 (d) 14\n\n8. Which is an inert gas?\n\n(a) Nitrogen (b) Oxygen (c) Helium (d) Hydrogen`,
          images: {}
        }
      }]
    });
  }

  // ================================
  //  STATE & GROUPS
  // ================================
  function resetExamState() {
    currentIndex = 0;
    answers = {};
    visited = new Set([0]);
    markedForReview = new Set();
    isFinished = false;
    if (activeTemplate && activeTemplate.duration) timerSeconds = activeTemplate.duration;
    startTimer();
  }

  function buildPaletteGroups() {
    paletteGroups = [];
    let currentSubject = null;
    let group = null;
    questions.forEach((q, i) => {
      if (q.subject !== currentSubject) {
        if (group) paletteGroups.push(group);
        currentSubject = q.subject;
        group = { title: q.subject.toUpperCase(), start: i, end: i };
      } else {
        group.end = i;
      }
    });
    if (group) paletteGroups.push(group);
  }

  // ================================
  //  TIMER
  // ================================
  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timerSeconds--;
      if (timerSeconds <= 0) { timerSeconds = 0; clearInterval(timerInterval); handleSubmit(); }
      updateTimerDisplay();
    }, 1000);
    updateTimerDisplay();
  }

  function updateTimerDisplay() {
    const h = Math.floor(timerSeconds / 3600);
    const m = Math.floor((timerSeconds % 3600) / 60);
    const s = timerSeconds % 60;
    timerValue.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  // ================================
  //  VIEW SWITCHING
  // ================================
  function switchView(view) {
    uploadView.classList.remove('active');
    examView.classList.remove('active');
    resultsView.classList.remove('active');
    closeSidebar();
    if (view === 'upload') { uploadView.classList.add('active'); if (timerInterval) clearInterval(timerInterval); }
    else if (view === 'exam') { examView.classList.add('active'); renderQuestion(); renderPalette(); }
    else if (view === 'results') { resultsView.classList.add('active'); renderResults(); }
  }

  // ================================
  //  RENDER QUESTION
  // ================================
  function renderQuestion() {
    const q = questions[currentIndex];
    visited.add(currentIndex);

    const qTypeLabel = q.type || 'MCQ';
    qSubject.innerHTML = `${q.subject} <span class="q-type">(${qTypeLabel})</span>`;
    qBadgePill.textContent = `Q. ${q.id}`;
    qText.innerHTML = q.text;

    // Render question images (single or multiple)
    if (q.images && q.images.length > 1) {
      qImage.innerHTML = q.images.map((img, idx) =>
        `<img src="${img}" alt="Q${q.id} diagram ${idx + 1}" loading="lazy">`
      ).join('');
    } else if (q.image) {
      qImage.innerHTML = `<img src="${q.image}" alt="Q${q.id} diagram" loading="lazy">`;
    } else {
      qImage.innerHTML = '';
    }

    // MCQ vs Numerical
    if (qTypeLabel === 'Numerical') {
      qOptions.innerHTML = '';
      qOptions.classList.add('hidden');
      qNumerical.classList.remove('hidden');
      numericalInput.value = answers[currentIndex] !== undefined ? answers[currentIndex] : '';
    } else {
      qNumerical.classList.add('hidden');
      qOptions.classList.remove('hidden');
      const labels = ['A', 'B', 'C', 'D'];
      qOptions.innerHTML = q.options.map((opt, i) => {
        const selected = answers[currentIndex] === i ? ' selected' : '';
        const label = labels[i] || String(i + 1);
        // Build option content: show image if available, text otherwise
        let optContent = '';
        if (opt.image) {
          optContent = `<img src="${opt.image}" alt="Option ${label}" class="option-img" loading="lazy">`;
          if (opt.text) optContent += ` <span>${opt.text}</span>`;
        } else {
          optContent = opt.text;
        }
        return `
          <button class="option-btn${selected}" data-index="${i}">
            <span class="option-radio"><span class="option-radio-dot"></span></span>
            <span class="option-label">${label}</span>
            <span class="option-content">${optContent}</span>
          </button>`;
      }).join('');
    }

    // KaTeX
    if (typeof renderMathInElement === 'function') {
      renderMathInElement(qCard, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false, strict: false
      });
    }

    // Button states
    const isLastQ = currentIndex === questions.length - 1;
    prevBtn.disabled = currentIndex === 0;
    clearBtn.disabled = answers[currentIndex] === undefined;
    saveMarkBtn.disabled = answers[currentIndex] === undefined;
    saveNextBtn.classList.toggle('hidden', isLastQ);
    submitBtn.classList.toggle('hidden', !isLastQ);
    markReviewBtn.textContent = isLastQ ? 'Mark for Review' : 'Mark Review & Next';

    renderPalette();
    const panel = $('#questionPanel');
    if (panel) panel.scrollTop = 0;
  }

  // ================================
  //  RENDER PALETTE
  // ================================
  function renderPalette() {
    let html = '';
    for (const group of paletteGroups) {
      html += `<div class="palette-group">
        <div class="palette-group-header">
          <span class="palette-group-title">${group.title}</span>
          <div class="palette-group-line"></div>
        </div>
        <div class="palette-grid">`;
      for (let i = group.start; i <= group.end; i++) {
        const cls = getPaletteClass(i);
        const isCurrent = i === currentIndex ? ' current' : '';
        const showGreenDot = answers[i] !== undefined && markedForReview.has(i);
        html += `<button class="p-btn${cls}${isCurrent}" data-qi="${i}">
          <span>${questions[i].id}</span>
          ${showGreenDot ? '<span class="green-dot"></span>' : ''}
        </button>`;
      }
      html += `</div></div>`;
    }
    paletteScroll.innerHTML = html;
  }

  function getPaletteClass(i) {
    const isAnswered = answers[i] !== undefined;
    const isVisited = visited.has(i);
    const isMarked = markedForReview.has(i);
    if (isAnswered && isMarked) return ' answered-review';
    if (isMarked) return ' review';
    if (isAnswered) return ' answered';
    if (isVisited) return ' visited-only';
    return '';
  }

  // ================================
  //  EXAM EVENTS
  // ================================
  function bindExamEvents() {
    // MCQ option click
    qOptions.addEventListener('click', (e) => {
      const btn = e.target.closest('.option-btn');
      if (!btn) return;
      answers[currentIndex] = parseInt(btn.dataset.index, 10);
      renderQuestion();
    });

    // Numerical input
    numericalInput.addEventListener('input', () => {
      const val = numericalInput.value.trim();
      if (val === '') { delete answers[currentIndex]; }
      else { answers[currentIndex] = parseFloat(val); }
      clearBtn.disabled = answers[currentIndex] === undefined;
      saveMarkBtn.disabled = answers[currentIndex] === undefined;
    });

    prevBtn.addEventListener('click', () => { if (currentIndex > 0) { currentIndex--; renderQuestion(); } });

    clearBtn.addEventListener('click', () => { delete answers[currentIndex]; renderQuestion(); });

    saveNextBtn.addEventListener('click', () => {
      markedForReview.delete(currentIndex);
      if (currentIndex < questions.length - 1) { currentIndex++; renderQuestion(); }
    });

    markReviewBtn.addEventListener('click', () => {
      delete answers[currentIndex];
      markedForReview.add(currentIndex);
      if (currentIndex < questions.length - 1) { currentIndex++; renderQuestion(); }
    });

    saveMarkBtn.addEventListener('click', () => {
      markedForReview.add(currentIndex);
      if (currentIndex < questions.length - 1) { currentIndex++; renderQuestion(); }
    });

    submitBtn.addEventListener('click', handleSubmit);

    paletteScroll.addEventListener('click', (e) => {
      const btn = e.target.closest('.p-btn');
      if (!btn) return;
      currentIndex = parseInt(btn.dataset.qi, 10);
      renderQuestion();
      if (window.innerWidth < 768) closeSidebar();
    });

    $('#sidebarToggle').addEventListener('click', () => { if (isSidebarOpen) closeSidebar(); else openSidebar(); });
    mobileOverlay.addEventListener('click', closeSidebar);

    $('#uploadNewBtn').addEventListener('click', () => switchView('upload'));
    $('#uploadNewBtn2').addEventListener('click', () => switchView('upload'));
    $('#restartBtn').addEventListener('click', () => { resetExamState(); switchView('exam'); });

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (!examView.classList.contains('active')) return;
      if (e.target === numericalInput) return; // don't intercept numerical input
      if (e.key === 'ArrowRight') { e.preventDefault(); saveNextBtn.click(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prevBtn.click(); }
      else if (e.key >= '1' && e.key <= '4') {
        const q = questions[currentIndex];
        if (q.type === 'Numerical') return;
        const idx = parseInt(e.key, 10) - 1;
        if (idx < q.options.length) { answers[currentIndex] = idx; renderQuestion(); }
      }
    });
  }

  function handleSubmit() {
    if (timerInterval) clearInterval(timerInterval);
    isFinished = true;
    switchView('results');
  }

  function openSidebar() {
    isSidebarOpen = true;
    document.body.classList.add('sidebar-open');
    mobileOverlay.classList.add('active');
  }
  function closeSidebar() {
    isSidebarOpen = false;
    document.body.classList.remove('sidebar-open');
    mobileOverlay.classList.remove('active');
  }

  // ================================
  //  THEME
  // ================================
  function bindThemeEvents() {
    const toggleTheme = () => { isDarkMode = !isDarkMode; document.body.classList.toggle('dark', isDarkMode); };
    $('#themeToggleMobile').addEventListener('click', toggleTheme);
    $('#themeToggleDesktop').addEventListener('click', toggleTheme);
  }

  // ================================
  //  RESULTS
  // ================================
  function renderResults() {
    const scheme = activeTemplate ? activeTemplate.markingScheme : { mcq: { correct: 4, wrong: -1 }, numerical: { correct: 4, wrong: 0 } };
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

    const maxScore = gradedMaxScore > 0
      ? gradedMaxScore
      : (activeTemplate && activeTemplate.totalMarks
        ? activeTemplate.totalMarks
        : questions.length * scheme.mcq.correct);
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    scoreValue.textContent = score;
    scoreMax.textContent = maxScore;
    trophyIcon.className = 'trophy-icon' + (percentage < 40 ? ' dimmed' : '');

    const mcqInfo = `MCQ: +${scheme.mcq.correct} / ${scheme.mcq.wrong}`;
    const numInfo = `Numerical: +${scheme.numerical.correct} / ${scheme.numerical.wrong}`;

    resultsStats.innerHTML = `
      <div class="stat-box correct">
        <div class="stat-value">${correct}</div>
        <div class="stat-label">Correct</div>
      </div>
      <div class="stat-box incorrect">
        <div class="stat-value">${incorrect}</div>
        <div class="stat-label">Incorrect</div>
      </div>
      <div class="stat-box unattempted">
        <div class="stat-value">${unattempted}</div>
        <div class="stat-label">Unattempted</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${ungraded}</div>
        <div class="stat-label">Ungraded</div>
      </div>
      <div class="scoring-info" style="grid-column: 1/-1; text-align:center; font-size:12px; color:var(--text-muted); margin-top:8px;">
        ${mcqInfo} &nbsp;·&nbsp; ${numInfo} &nbsp;·&nbsp; Key coverage: ${correct + incorrect}/${questions.length}
      </div>`;
    return;

    questions.forEach((q, i) => {
      const isNumerical = q.type === 'Numerical';
      const marks = isNumerical ? scheme.numerical : scheme.mcq;

      if (answers[i] !== undefined) {
        if (q.correctAnswer !== undefined) {
          if (answers[i] === q.correctAnswer) { score += marks.correct; correct++; }
          else { score += marks.wrong; incorrect++; }
        } else {
          // No correct answer — treat as attempted
          score += marks.correct;
          correct++;
        }
      } else {
        unattempted++;
      }
    });

    const legacyMaxScore = activeTemplate && activeTemplate.totalMarks
      ? activeTemplate.totalMarks
      : questions.length * scheme.mcq.correct;
    const legacyPercentage = legacyMaxScore > 0 ? Math.round((score / legacyMaxScore) * 100) : 0;

    scoreValue.textContent = score;
    scoreMax.textContent = legacyMaxScore;
    trophyIcon.className = 'trophy-icon' + (legacyPercentage < 40 ? ' dimmed' : '');

    // Build marking info
    const legacyMcqInfo = `MCQ: +${scheme.mcq.correct} / ${scheme.mcq.wrong}`;
    const legacyNumInfo = `Numerical: +${scheme.numerical.correct} / ${scheme.numerical.wrong}`;

    resultsStats.innerHTML = `
      <div class="stat-box correct">
        <div class="stat-value">${correct}</div>
        <div class="stat-label">Correct</div>
      </div>
      <div class="stat-box incorrect">
        <div class="stat-value">${incorrect}</div>
        <div class="stat-label">Incorrect</div>
      </div>
      <div class="stat-box unattempted">
        <div class="stat-value">${unattempted}</div>
        <div class="stat-label">Unattempted</div>
      </div>
      <div class="scoring-info" style="grid-column: 1/-1; text-align:center; font-size:12px; color:var(--text-muted); margin-top:8px;">
        ${mcqInfo} &nbsp;·&nbsp; ${numInfo}
      </div>`;
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

    const isCorrect = isAnswerCorrect(submittedAnswer, normalizedCorrect, question);
    return {
      status: isCorrect ? 'correct' : 'incorrect',
      scoreDelta: isCorrect ? marks.correct : marks.wrong,
      maxScoreDelta: marks.correct
    };
  }

  function normalizeCorrectAnswerValue(value, question) {
    if (value === undefined || value === null || value === '') return undefined;

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    const raw = String(value).trim();
    if (!raw) return undefined;

    if (question && question.type !== 'Numerical') {
      const upper = raw.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(upper)) return 'ABCD'.indexOf(upper);
      if (/^[1-4]$/.test(raw)) return parseInt(raw, 10) - 1;
    }

    if (/^-?\d+(?:\.\d+)?$/.test(raw)) {
      return parseFloat(raw);
    }

    return undefined;
  }

  function isAnswerCorrect(submittedAnswer, correctAnswer, question) {
    if (question.type === 'Numerical') {
      const submitted = typeof submittedAnswer === 'number' ? submittedAnswer : parseFloat(submittedAnswer);
      const correct = typeof correctAnswer === 'number' ? correctAnswer : parseFloat(correctAnswer);
      if (!Number.isFinite(submitted) || !Number.isFinite(correct)) return false;
      return Math.abs(submitted - correct) < 1e-9;
    }

    const submitted = typeof submittedAnswer === 'number'
      ? submittedAnswer
      : normalizeCorrectAnswerValue(submittedAnswer, question);
    return submitted === correctAnswer;
  }

  // ---- Boot ----
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
