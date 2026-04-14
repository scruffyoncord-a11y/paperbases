// ==========================================================
// parser.js — Converts raw PaddleOCR JSON or OCR markdown
// to structured Q&A. Handles JEE/BITSAT/NEET OCR formats.
// ==========================================================

const ExamParser = (function () {
  'use strict';

  // ── Regex patterns ──

  // Question start: Q1 text, Q.3) text, Q3. text, Q 3. text, Q.3: text
  // The separator after the number (.  )  : ) is NOW OPTIONAL to match "Q1 A light wave..."
  const RE_QSTART = /^Q[.]?\s*(\d{1,3})\s*[.):]?\s+(.*)/i;

  // Standalone number start: "3. " or "3) " at start of line — text after is optional
  const RE_NUMSTART = /^(\d{1,3})[.)]\s*(.*)/;

  // Single option: (A) text  OR  A. text  OR  A) text
  const RE_OPT_SINGLE = /^\(\s*([A-Da-d1-4])\s*\)\s*(.+)|^([A-Da-d])\s*[.)]\s+(.+)/;

  // Inline options: (A) text (B) text ...
  // Uses [^]* but stops at next option marker — handles commas, slashes, special chars in option text
  const RE_ALL_OPTS = /\(\s*([A-Da-d1-4])\s*\)\s*(.*?)(?=\s*\(\s*[A-Da-d1-4]\s*\)|$)/g;

  // Two-column numeric: 'A  3043 J (2) 3024 J'
  const RE_TWO_COL_NUM = /^([AaCcBbDd])\s{1,5}(.+?)\s+\(([1-4])\)\s+(.+)$/;

  // Two-column gap: 'A text   B text'
  const RE_TWO_COL_GAP = /^([A-Da-d])[.]?\s(.+?)\s{3,}([A-Da-d])[.]?\s(.+)$/;

  // Option starting with dollar-sign LaTeX: (A) $ ... $
  const RE_OPT_LATEX = /^\(\s*([A-Da-d])\s*\)\s*(\$.*)/;

  const OPT_MAP = {
    '1':'A','2':'B','3':'C','4':'D',
    'a':'A','b':'B','c':'C','d':'D',
    'A':'A','B':'B','C':'C','D':'D'
  };

  // ── Stop markers — stop parsing questions when these appear ──
  const STOP_MARKERS = [
    /^#{1,6}\s*Answer\s*Key/i,
    /^#{1,6}\s*Hints?\s*[&]\s*Solutions?/i,
    /^#{1,6}\s*Solutions?/i,
    /^\s*##?\s*Answer\s*Key/i,
    /^\s*##?\s*Hints?\s*[&]\s*Solutions?/i,
    /^Q\d+\s+Video\s+Solution/i,
    /^####?\s*Q\d+\s+Video\s+Solution/i,
  ];

  // ── Junk line patterns — lines that should be skipped entirely ──
  const JUNK_LINE_PATTERNS = [
    // Marketing / promotional content
    /SCAN\s*QR\s*CODE/i,
    /VIDEO\s*SOLUTIONS?\s*AVAILABLE/i,
    /Your\s*Test\s*Report\s*is\s*Live/i,
    /UPCOMING\s*TEST\s*ALERT/i,
    /RANK[- ]?BOOSTER/i,
    /TEST\s*SERIES/i,
    /FULL\s*SYLLABUS\s*TEST/i,
    /COURSES?\.ACADXL\.COM/i,
    /https?:\/\/[^\s]+acadxl[^\s]*/i,
    /https?:\/\/[^\s]+courses[^\s]*/i,
    /https?:\/\/[^\s]*penpencil\.co[^\s]*/i,
    /Welcome\s*back,?\s*Students?/i,
    /Ready\s+to\s+continue\s+your\s+learning/i,
    /Latest\s+Test\s+Performance/i,
    /^JEE\s+MAIN$/i,
    /^AcadXl$/i,
    /^For\s*More\s*Join/i,
    /^More\s*Join/i,
    /@HTJEE/i,
    /JEE\s+Advanced/i,
    /^\d{1,2}\/\d{1,2}\/\d{2,4},\s*\d{1,2}:\d{2}\s*(AM|PM)$/i,
    /^\d+\s*\/\s*\d+$/i,
    /^NEET[-_ ]?JEE(?:[_ -].*)?$/i,
    /^Android\s+App\s*\|\s*iOS\s+App\s*\|\s*PW\s+Website$/i,
    // Section instruction headers (with optional bullet prefix •, *, -, ‣)
    /^[\s•*\-‣]*SECTION[-\s]*\d+\s*:?\s*\(.*MARKS/i,
    /^#{1,6}\s*SECTION[-\s]*\d+\s*:?\s*\(.*MARKS/i,
    /^[\s•*\-‣]*This\s+section\s+contains/i,
    /^#{1,6}\s*This\s+section\s+contains/i,
    /^[\s•*\-‣]*Each\s+question\s+has\s+FOUR\s+options/i,
    /^#{1,6}\s*Each\s+question\s+has\s+FOUR\s+options/i,
    /^[\s•*\-‣]*ONLY\s+ONE\s+of\s+these\s+four/i,
    /^#{1,6}\s*ONLY\s+ONE\s+of\s+these\s+four/i,
    /^[\s•*\-‣]*For\s+each\s+question,\s+choose/i,
    /^#{1,6}\s*For\s+each\s+question,\s+choose/i,
    /^[\s•*\-‣]*Answer\s+to\s+each\s+question\s+will\s+be\s+evaluated/i,
    /^#{1,6}\s*Answer\s+to\s+each\s+question\s+will\s+be\s+evaluated/i,
    /^[\s•*\-‣]*Full\s+Marks\s*:\s*\+?\d/i,
    /^#{1,6}\s*Full\s+Marks\s*:\s*\+?\d/i,
    /^[\s•*\-‣]*Zero\s+Marks\s*:/i,
    /^#{1,6}\s*Zero\s+Marks\s*:/i,
    /^[\s•*\-‣]*Negative\s+Marks\s*:/i,
    /^#{1,6}\s*Negative\s+Marks\s*:/i,
    /^[\s•*\-‣]*MAXIMUM\s+MARKS/i,
    /^[\s•*\-‣]*the\s+correct\s+option\s+is\s+chosen/i,
    /^[\s•*\-‣]*none\s+of\s+the\s+options\s+is\s+chosen/i,
    /^[\s•*\-‣]*In\s+all\s+other\s+cases/i,
    /^\s*PART\s*[-–]\s*[A-C]\s*$/i,
    /^\s*SECTION\s*[-–]\s*\d/i,
    // Date/schedule table content
    /^\s*DATE\s+PATTERN\s+SYLLABUS/i,
    /^\s*\d{1,2}\/\d{1,2}\/\d{2,4}\s+(?:JEE|NEET|BITSAT|COMEDK)/i,
    // General header/footer junk
    /^\s*#{1,4}\s*$/,  // Empty headings
    /^\s*\*\*\s*\*\*\s*$/,  // Empty bold
    /^\s*\|\s*DATE\s*\|/i, // Markdown table headers for schedules
  ];

  // ── Junk image path patterns — images from headers/footers/promos ──
  const JUNK_IMAGE_PATTERNS = [
    /header_image/i,
    /footer_image/i,
    /logo/i,
    /watermark/i,
    /qr[_\s]?code/i,
    /banner/i,
    /promo/i,
  ];

  // ── Solution / Answer markers — strip from question bodies ──
  // Detects: "Sol.", "Sol:", "Solution.", "Soln.", "Ans.", "Ans:"
  const RE_SOL_INLINE = /\bSol(?:ution|n)?\s*[.:]/i;
  const RE_ANS_INLINE = /\bAns(?:wer)?\s*[.:]/i;
  const RE_SOL_LINE_START = /^\s*(?:Sol(?:ution|n)?|Ans(?:wer)?)\s*[.:]/i;

  // Bare option label on its own line: just "(A)" or "(B)" etc with nothing after
  const RE_BARE_OPT = /^\(?\s*([A-Da-d])\s*\)?\s*$/;

  // ── Main parse entry (from JSON) ──────────────────────────

  function parse(rawJson) {
    let pages = null;

    if (rawJson.layoutParsingResults) {
      pages = rawJson.layoutParsingResults;
    } else if (rawJson.result && rawJson.result.layoutParsingResults) {
      pages = rawJson.result.layoutParsingResults;
    } else if (Array.isArray(rawJson)) {
      pages = rawJson;
    } else {
      const found = deepFindKey(rawJson, 'layoutParsingResults');
      if (found) pages = found;
    }

    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      throw new Error('Invalid JSON: could not find "layoutParsingResults" array.');
    }

    // Merge all page markdown and collect images
    let fullMarkdown = '';
    const imageMap = {};

    for (const page of pages) {
      const md = page.markdown?.text || page.text || '';
      fullMarkdown += md + '\n\n';
      const images = page.markdown?.images || page.images || {};
      for (const [relPath, url] of Object.entries(images)) {
        imageMap[relPath] = url;
      }
    }

    return parseMarkdownContent(fullMarkdown, imageMap);
  }

  // ── Parse from raw markdown string ────────────────────────

  function parseMarkdown(rawText) {
    console.log('[Parser] Parsing raw markdown, length:', rawText.length);
    return parseMarkdownContent(rawText, {});
  }

  // ── Core parser (shared by both entry points) ─────────────

  function parseMarkdownContent(fullMarkdown, imageMap) {
    console.log('[Parser] Total markdown length:', fullMarkdown.length);
    console.log('[Parser] First 800 chars:\n', fullMarkdown.substring(0, 800));

    // Extract answer key before stripping it
    const answerKey = extractAnswerKey(fullMarkdown);
    console.log('[Parser] Answer key entries:', Object.keys(answerKey).length);

    // Strip everything after answer key / hints / solutions header
    fullMarkdown = stripAfterAnswerKey(fullMarkdown);

    // Extract title
    const title = extractTitle(fullMarkdown);

    // Split into sections by subject headings
    const sections = extractSections(fullMarkdown);

    // Parse each section
    const questions = [];
    for (const section of sections) {
      const sectionQuestions = parseQuestionsLineByLine(section.content, section.subject, imageMap);
      questions.push(...sectionQuestions);
    }

    // Sort and apply answer key
    questions.sort((a, b) => a.id - b.id);

    for (const q of questions) {
      if (answerKey[q.id] !== undefined) {
        q.correctAnswer = answerKey[q.id];
      }
    }

    const subjects = [...new Set(questions.map(q => q.subject))];
    console.log(`[Parser] Found ${questions.length} questions across ${subjects.length} subjects`);
    if (questions.length > 0) {
      console.log('[Parser] Q1:', questions[0].text.substring(0, 100));
      console.log('[Parser] Q1 options:', questions[0].options.map(o => o.text.substring(0, 30)));
    }

    return { title, questions, subjects, imageMap };
  }

  function deepFindKey(obj, key) {
    if (!obj || typeof obj !== 'object') return null;
    if (obj[key]) return obj[key];
    for (const k of Object.keys(obj)) {
      const result = deepFindKey(obj[k], key);
      if (result) return result;
    }
    return null;
  }

  function extractTitle(md) {
    const match = md.match(/^#\s+(.+?)$/m);
    return match ? match[1].trim() : 'Exam Paper';
  }

  // ── Extract answer key from HTML table or text ────────────

  function extractAnswerKey(md) {
    const answers = {};
    const answerKeySections = [extractAnswerKeySection(md), md];

    for (const section of answerKeySections) {
      extractAnswerKeyEntries(section, answers);
    }

    return answers;

    // 1. HTML table rows: <td>Q67</td><td>(A)</td>   or   <td>Q67</td><td>1</td>
    const tableRowRe = /<tr[^>]*>\s*<td[^>]*>\s*Q?(\d{1,3})\s*<\/td>\s*<td[^>]*>\s*\(?([A-Da-d1-4])\)?\s*<\/td>\s*<\/tr>/gi;
    let m;
    while ((m = tableRowRe.exec(md)) !== null) {
      const qNum = parseInt(m[1], 10);
      const rawAns = m[2].toUpperCase();
      const ansLabel = OPT_MAP[rawAns] || rawAns;
      const optIdx = 'ABCD'.indexOf(ansLabel);
      if (optIdx >= 0) {
        answers[qNum] = optIdx;
      }
    }

    // 2. Plain text: "Q1. (A)" or "Q1 A" or "1. (A)" patterns
    const textRe = /Q\.?\s*(\d{1,3})\s*[.):]\s*\(?([A-Da-d])\)?/gi;
    while ((m = textRe.exec(md)) !== null) {
      const qNum = parseInt(m[1], 10);
      const ansLabel = m[2].toUpperCase();
      const optIdx = 'ABCD'.indexOf(ansLabel);
      if (optIdx >= 0 && !answers[qNum]) {
        answers[qNum] = optIdx;
      }
    }

    // 3. Numerical answers in table: Q71 → 1 (just a number)
    const numTableRe = /<tr[^>]*>\s*<td[^>]*>\s*Q?(\d{1,3})\s*<\/td>\s*<td[^>]*>\s*(-?\d+(?:\.\d+)?)\s*<\/td>\s*<\/tr>/gi;
    while ((m = numTableRe.exec(md)) !== null) {
      const qNum = parseInt(m[1], 10);
      const numVal = parseFloat(m[2]);
      // If it's not A=0,B=1,C=2,D=3, store as numerical answer
      if (!answers[qNum]) {
        answers[qNum] = numVal;
      }
    }

    return answers;
  }

  function extractAnswerKeyEntries(text, answers) {
    if (!text) return;

    const tableRowRe = /<tr[^>]*>\s*<td[^>]*>\s*Q?(\d{1,3})\s*<\/td>\s*<td[^>]*>\s*\(?([A-Da-d1-4])\)?\s*<\/td>\s*<\/tr>/gi;
    let m;
    while ((m = tableRowRe.exec(text)) !== null) {
      setAnswerKeyValue(answers, parseInt(m[1], 10), m[2]);
    }

    const textRe = /(?:^|[\s|,;])Q?\.?\s*(\d{1,3})\s*[-:=.)]?\s*\(?([A-Da-d])\)?(?=$|[\s|,;])/gmi;
    while ((m = textRe.exec(text)) !== null) {
      setAnswerKeyValue(answers, parseInt(m[1], 10), m[2]);
    }

    const numericRe = /(?:<tr[^>]*>\s*<td[^>]*>\s*Q?(\d{1,3})\s*<\/td>\s*<td[^>]*>\s*(-?\d+(?:\.\d+)?)\s*<\/td>\s*<\/tr>)|(?:^\s*\|?\s*Q?(\d{1,3})\s*\|?\s*[:\-]?\s*\|?\s*(-?\d+(?:\.\d+)?)\s*\|?\s*$)|(?:^|[\s|,;])Q?\.?\s*(\d{1,3})\s*[-:=.)]?\s*(-?\d+(?:\.\d+)?)(?=$|[\s|,;])/gmi;
    while ((m = numericRe.exec(text)) !== null) {
      const qNum = parseInt(m[1] || m[3] || m[5], 10);
      const rawValue = m[2] || m[4] || m[6];
      setAnswerKeyValue(answers, qNum, rawValue);
    }
  }

  function extractAnswerKeySection(md) {
    const markers = [
      /^#{1,6}\s*Answer\s*Key\b.*$/gmi,
      /^#{1,6}\s*Answers?\b.*$/gmi,
      /^#{1,6}\s*Hints?\s*[&]\s*Solutions?\b.*$/gmi,
      /^\s*Answer\s*Key\b.*$/gmi,
      /^\s*Answers?\b.*$/gmi,
    ];

    let start = -1;
    for (const re of markers) {
      const match = re.exec(md);
      if (match && (start === -1 || match.index < start)) {
        start = match.index;
      }
    }

    return start >= 0 ? md.substring(start) : '';
  }

  function setAnswerKeyValue(answers, qNum, rawValue) {
    if (!Number.isFinite(qNum) || answers[qNum] !== undefined) return;
    const normalized = normalizeAnswerKeyValue(rawValue);
    if (normalized !== undefined) answers[qNum] = normalized;
  }

  function normalizeAnswerKeyValue(rawValue) {
    const value = String(rawValue || '').trim();
    if (!value) return undefined;

    const optionLabel = OPT_MAP[value] || OPT_MAP[value.toUpperCase()];
    if (optionLabel) {
      const optIdx = 'ABCD'.indexOf(optionLabel);
      return optIdx >= 0 ? optIdx : undefined;
    }

    if (/^-?\d+(?:\.\d+)?$/.test(value)) {
      return parseFloat(value);
    }

    return undefined;
  }

  // ── Strip content after answer key / hints ────────────────

  function stripAfterAnswerKey(md) {
    // Find the earliest occurrence of answer key / hints header
    const markers = [
      /^#{1,6}\s*Answer\s*Key/im,
      /^#{1,6}\s*Hints?\s*[&]\s*Solutions?/im,
      /^##\s*Answer\s*Key/im,
      /^##\s*Hints?\s*[&]/im,
    ];

    let earliest = md.length;
    for (const re of markers) {
      const m = re.exec(md);
      if (m && m.index < earliest) {
        earliest = m.index;
      }
    }

    // Also look for "Q1 Video Solution:" pattern as a stop point
    const videoSolRe = /^(?:####?\s*)?Q\d+\s+Video\s+Solution/im;
    const vm = videoSolRe.exec(md);
    if (vm && vm.index < earliest) {
      earliest = vm.index;
    }

    // Look for promotional footer markers
    const promoMarkers = [
      /^#{1,6}\s*Your\s+Test\s+Report\s+is\s+Live/im,
      /^###?\s*Your\s+Test\s+Report/im,
      /SCAN\s+QR\s+CODE.*VIDEO\s+SOLUTIONS/im,
    ];
    for (const re of promoMarkers) {
      const m = re.exec(md);
      if (m && m.index < earliest) {
        earliest = m.index;
      }
    }

    if (earliest < md.length) {
      console.log('[Parser] Stripping content after position', earliest, '(answer key / hints / promo)');
    }

    return md.substring(0, earliest);
  }

  // ── Split into subject sections ───────────────────────────

  function extractSections(md) {
    const subjectPatterns = [
      'PHYSICS', 'CHEMISTRY', 'MATHEMATICS', 'MATH',
      'ENGLISH', 'ENGLISH\\s+PROFICIENCY', 'LOGICAL\\s+REASONING',
      'BIOLOGY', 'BOTANY', 'ZOOLOGY', 'APTITUDE', 'GENERAL\\s+APTITUDE'
    ];

    const keywordGroup = subjectPatterns.join('|');
    const headingPattern = new RegExp(
      `(?:^|\\n)\\s*(?:#{1,6}\\s+|\\*\\*\\s*)?(?:SECTION\\s*[-–:]?\\s*[A-C]\\s*[-–:]?\\s*)?(?:${keywordGroup})(?:[^\\n]*?)(?:\\s*\\*\\*)?\\s*(?:\\n|$)`,
      'gmi'
    );

    const matches = [];
    let m;
    while ((m = headingPattern.exec(md)) !== null) {
      const rawSubject = m[0].replace(/[#*\n]/g, '').trim();
      const subjectName = extractSubjectName(rawSubject);
      matches.push({
        subject: normalizeSubject(subjectName),
        headingStart: m.index,
        contentStart: m.index + m[0].length
      });
    }

    if (matches.length === 0) {
      return [{ subject: 'General', content: md }];
    }

    const sections = [];
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].contentStart;
      const end = i + 1 < matches.length ? matches[i + 1].headingStart : md.length;
      sections.push({
        subject: matches[i].subject,
        content: md.substring(start, end)
      });
    }

    // OCR often repeats the same subject heading at the top of each page.
    // Merge adjacent same-subject chunks so questions can continue across page breaks.
    const mergedSections = [];
    for (const section of sections) {
      const prev = mergedSections[mergedSections.length - 1];
      if (prev && prev.subject === section.subject) {
        prev.content += '\n\n' + section.content;
      } else {
        mergedSections.push(section);
      }
    }

    return mergedSections;
  }

  function extractSubjectName(raw) {
    const match = raw.match(/(?:PHYSICS|CHEMISTRY|MATHEMATICS|MATH|ENGLISH|BIOLOGY|BOTANY|ZOOLOGY|APTITUDE|LOGICAL\s*REASONING)/i);
    return match ? match[0] : raw;
  }

  function normalizeSubject(raw) {
    const s = raw.trim().toUpperCase();
    if (s.includes('PHYSICS')) return 'Physics';
    if (s.includes('CHEM')) return 'Chemistry';
    if (s.includes('MATH')) return 'Mathematics';
    if (s.includes('ENGLISH') || s.includes('PROFICIENCY')) return 'English';
    if (s.includes('LOGIC') || s.includes('REASONING')) return 'Logical Reasoning';
    if (s.includes('BOTANY')) return 'Botany';
    if (s.includes('ZOOLOGY')) return 'Zoology';
    if (s.includes('APTITUDE')) return 'Aptitude';
    if (s.includes('BIO')) return 'Biology';
    return s.charAt(0) + s.slice(1).toLowerCase();
  }

  // ── Line-by-line question parser ──────────────────────────

  function parseQuestionsLineByLine(content, subject, imageMap) {
    const lines = content.split('\n');
    const rawQuestions = [];
    let current = null;

    function saveCurrent() {
      const hasQuestionSignal = current && (
        current.text.trim() ||
        Object.keys(current.options || {}).length > 0 ||
        Object.keys(current.optionImages || {}).length > 0 ||
        (current.images && current.images.length > 0) ||
        (current.preOptionImages && current.preOptionImages.length > 0) ||
        (current.pendingOptionImages && current.pendingOptionImages.length > 0)
      );

      if (hasQuestionSignal) {
        // If no options were found, try to extract inline options from the question text
        if (Object.keys(current.options).length === 0) {
          RE_ALL_OPTS.lastIndex = 0;
          const inlineOpts = [];
          let om;
          while ((om = RE_ALL_OPTS.exec(current.text)) !== null) {
            const lbl = OPT_MAP[om[1]] || om[1].toUpperCase();
            const txt = (om[2] || '').trim();
            if ('ABCD'.includes(lbl)) inlineOpts.push({ lbl, txt });
          }
          if (inlineOpts.length >= 2) {
            // Strip the options part from the question text
            const firstOptIdx = current.text.search(/\(\s*[A-Da-d1-4]\s*\)/);
            if (firstOptIdx > 0) current.text = current.text.substring(0, firstOptIdx).trim();
            for (const { lbl, txt } of inlineOpts) {
              current.options[lbl] = txt;
            }
          }
        }

        if (!current.text.trim()) {
          current.text = '';
          current.ocrMissingStem = true;
        }

        normalizeEmbeddedOptionText(current);
        recoverMissingBinaryTupleOption(current);
        salvageTrailingFormulaOptions(current);
        rawQuestions.push(current);
      }
    }

    function normalizeEmbeddedOptionText(currentQuestion) {
      if (!currentQuestion || !currentQuestion.options) return;

      const orderedLabels = ['A', 'B', 'C', 'D'];
      for (const label of orderedLabels) {
        const rawText = currentQuestion.options[label];
        if (!rawText || !/\(\s*[A-Da-d1-4]\s*\)/.test(rawText)) continue;

        const laterMarkerIdx = rawText.search(/\(\s*[A-Da-d1-4]\s*\)/);
        if (laterMarkerIdx > 0) {
          const prefix = rawText.slice(0, laterMarkerIdx).trim();
          const suffix = rawText.slice(laterMarkerIdx).trim();
          const suffixParsed = tryParseOpt(suffix);
          if (suffixParsed && suffixParsed.length >= 1) {
            currentQuestion.options[label] = prefix;
            for (const { label: parsedLabel, text, image } of suffixParsed) {
              currentQuestion.options[parsedLabel] = text || '';
              if (image) {
                if (!currentQuestion.optionImages) currentQuestion.optionImages = {};
                currentQuestion.optionImages[parsedLabel] = image;
              }
            }
            continue;
          }
        }

        const parsed = tryParseOpt(rawText);
        if (!parsed || parsed.length < 2) continue;

        const firstMarker = rawText.search(/\(\s*[A-Da-d1-4]\s*\)/);
        const prefix = firstMarker > 0 ? rawText.slice(0, firstMarker).trim() : '';
        currentQuestion.options[label] = prefix;

        for (const { label: parsedLabel, text, image } of parsed) {
          currentQuestion.options[parsedLabel] = text || '';
          if (image) {
            if (!currentQuestion.optionImages) currentQuestion.optionImages = {};
            currentQuestion.optionImages[parsedLabel] = image;
          }
        }
      }
    }

    function recoverMissingBinaryTupleOption(currentQuestion) {
      if (!currentQuestion || !currentQuestion.options) return;

      const orderedLabels = ['A', 'B', 'C', 'D'];
      const existingLabels = orderedLabels.filter(label => {
        const text = (currentQuestion.options[label] || '').trim();
        return text.length > 0;
      });
      if (existingLabels.length !== 3) return;

      const tupleRe = /^([01])\s*,\s*([01])$/;
      const tuples = existingLabels.map(label => {
        const cleaned = cleanText(currentQuestion.options[label] || '').trim();
        const match = cleaned.match(tupleRe);
        return match ? `${match[1]},${match[2]}` : null;
      });
      if (tuples.some(v => !v)) return;

      const allTuples = ['0,0', '0,1', '1,0', '1,1'];
      const missingTuple = allTuples.find(tuple => !tuples.includes(tuple));
      if (!missingTuple) return;

      const missingLabel = orderedLabels.find(label => {
        const text = cleanText(currentQuestion.options[label] || '').trim();
        return text.length === 0;
      });
      if (!missingLabel) return;

      currentQuestion.options[missingLabel] = missingTuple;
    }

    function salvageTrailingFormulaOptions(currentQuestion) {
      if (!currentQuestion || !currentQuestion.text) return;

      const orderedLabels = ['A', 'B', 'C', 'D'];
      const existingLabels = orderedLabels.filter(label => currentQuestion.options[label] !== undefined);
      if (existingLabels.length === 0 || existingLabels.length >= 4) return;

      const firstExistingIdx = orderedLabels.indexOf(existingLabels[0]);
      if (firstExistingIdx <= 0) return;

      const missingBefore = orderedLabels.slice(0, firstExistingIdx)
        .filter(label => currentQuestion.options[label] === undefined);
      if (missingBefore.length === 0) return;

      const formulaMatches = [...currentQuestion.text.matchAll(/\$\$[\s\S]*?\$\$/g)];
      if (formulaMatches.length < missingBefore.length) return;

      const trailingMatches = formulaMatches.slice(-missingBefore.length);
      missingBefore.forEach((label, idx) => {
        currentQuestion.options[label] = trailingMatches[idx][0].trim();
      });

      let text = currentQuestion.text;
      trailingMatches.forEach(match => {
        text = text.replace(match[0], ' ');
      });
      currentQuestion.text = text.replace(/\s{2,}/g, ' ').trim();
    }

    function isStopMarker(line) {
      const trimmed = line.trim();
      return STOP_MARKERS.some(re => re.test(trimmed));
    }

    // Check if a line is junk (marketing, instructions, etc.)
    function isJunkLine(line) {
      const trimmed = line.trim();
      if (!trimmed) return false;
      return JUNK_LINE_PATTERNS.some(re => re.test(trimmed));
    }

    // Check if an image path is junk (header/footer/promotional)
    function isJunkImage(imgPath) {
      if (!imgPath) return false;
      return JUNK_IMAGE_PATTERNS.some(re => re.test(imgPath));
    }

    function tryParseQStart(line) {
      const trimmed = line.trim();
      const detectionText = trimmed
        .replace(/<div[^>]*>/gi, ' ')
        .replace(/<\/div>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/^#{1,6}\s*/, '')
        .replace(/\s+/g, ' ')
        .trim();

      // Skip lines that are just "Q3 Video Solution:" etc.
      if (/Video\s*Solution/i.test(detectionText)) return null;

      // 1. Try Q-prefixed: Q1 text, Q.3) text, Q3. text
      let m = RE_QSTART.exec(detectionText);
      if (m) {
        const num = parseInt(m[1], 10);
        const txt = (m[2] || '').trim();
        if (num >= 1 && num <= 300) return { num, txt };
      }

      // 1b. Standalone Q-prefixed number: "Q17" or "Q.17)"
      m = /^Q[.]?\s*(\d{1,3})\s*[.):]?\s*$/i.exec(detectionText);
      if (m) {
        const num = parseInt(m[1], 10);
        if (num >= 1 && num <= 300) return { num, txt: '' };
      }

      // 2. Try standalone number: "1. text" or "3) text"
      m = RE_NUMSTART.exec(detectionText);
      if (m) {
        const num = parseInt(m[1], 10);
        const txt = (m[2] || '').trim();
        if (num >= 1 && num <= 300) {
          // Guard against math expressions like "2 F", "100 V", "3 Ω" being 
          // mistaken for question numbers — these are short unit-value strings
          if (txt && /^[A-Z]{1,2}$/.test(txt)) return null; // e.g. "2 F" after split
          if (txt && /^\d/.test(txt)) return null; // starts with digit, e.g. "2. 300 km"
          return { num, txt };
        }
      }

      return null;
    }

    // Extract image URL from a line if it contains one
    function extractImageFromText(text) {
      const mdImg = text.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      if (mdImg) return mdImg[2];
      const htmlImg = text.match(/<img\s+src="([^"]+)"/);
      if (htmlImg) return htmlImg[1];
      return null;
    }

    // Extract ALL image URLs from a line
    function extractAllImagesFromLine(line) {
      const urls = [];
      const htmlImgRe = /<img\s+src="([^"]+)"/g;
      let m;
      while ((m = htmlImgRe.exec(line)) !== null) urls.push(m[1]);
      const mdImgRe = /!\[([^\]]*)\]\(([^)]+)\)/g;
      while ((m = mdImgRe.exec(line)) !== null) urls.push(m[2]);
      return urls;
    }

    // Extract image URL from a raw line (including wrapped in divs)
    function extractImageFromLine(line) {
      const htmlImg = line.match(/<img\s+src="([^"]+)"/);
      if (htmlImg) return htmlImg[1];
      const mdImg = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      if (mdImg) return mdImg[2];
      return null;
    }

    // Detect if a line is an HTML table block
    function isHtmlTable(line) {
      return /<table[\s>]/i.test(line);
    }

    // Detect if a table is junk (answer key, schedule, promotional, etc.)
    function isJunkTable(tableHtml) {
      if (!tableHtml) return false;
      // Strip HTML tags to get plain text content
      const plainText = tableHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      // Answer key tables: contain Q55 (A), Q56 (D), etc.
      if (/Q\d+\s*\([A-D]\)/i.test(plainText)) return true;
      // Schedule/date tables: contain dates and exam names
      if (/DATE\s+PATTERN\s+SYLLABUS/i.test(plainText)) return true;
      if (/\d{1,2}\/\d{1,2}\/\d{2,4}\s+(?:JEE|NEET|BITSAT)/i.test(plainText)) return true;
      if (/FULL\s+SYLLABUS/i.test(plainText) && /JEE\s+MAIN/i.test(plainText)) return true;
      // Promotional tables
      if (/UPCOMING\s+TEST/i.test(plainText)) return true;
      if (/RANK\s*BOOSTER/i.test(plainText)) return true;
      // Section instruction tables (marking scheme, rules)
      if (/MAXIMUM\s+MARKS/i.test(plainText)) return true;
      if (/Full\s+Marks\s*:/i.test(plainText) && /Zero\s+Marks\s*:/i.test(plainText)) return true;
      if (/Negative\s+Marks\s*:/i.test(plainText)) return true;
      if (/This\s+section\s+contains/i.test(plainText) && /questions/i.test(plainText)) return true;
      if (/ONLY\s+ONE\s+of\s+these\s+four/i.test(plainText)) return true;
      if (/Each\s+question\s+has\s+FOUR\s+options/i.test(plainText)) return true;
      return false;
    }

    // Extract option label (and optional text) from a div-wrapped line
    // Returns { label, text } or null
    function unwrapDivWrappers(text) {
      let current = (text || '').trim();
      let prev = null;
      while (current !== prev) {
        prev = current;
        current = current.replace(/^<div[^>]*>\s*/i, '').replace(/\s*<\/div>$/i, '').trim();
      }
      return current;
    }

    function extractOptLabelFromDiv(line, hasExistingOptions) {
      const trimmed = line.trim();
      const unwrapped = unwrapDivWrappers(trimmed);

      // Match nested/centered div wrappers around "(A) some text"
      const mParensText = unwrapped.match(/^\(\s*([A-Da-d])\s*\)\s*(.*?)$/i);
      if (mParensText) {
        const lbl = OPT_MAP[mParensText[1]] || mParensText[1].toUpperCase();
        if ('ABCD'.includes(lbl)) {
          // Strip any remaining html tags from the text portion
          const txt = mParensText[2].replace(/<[^>]+>/g, '').trim();
          return { label: lbl, text: txt };
        }
      }
      // Match <div ...>A</div> — bare label, only treat as option if we already have options
      if (hasExistingOptions) {
        const mBare = unwrapped.match(/^([A-Da-d])$/i);
        if (mBare) {
          const lbl = OPT_MAP[mBare[1]] || mBare[1].toUpperCase();
          if ('ABCD'.includes(lbl)) return { label: lbl, text: '' };
        }
      }
      return null;
    }

    function tryParseOpt(line, allowBareLabel = false) {
      const trimmed = line.trim();
      const normalized = unwrapDivWrappers(trimmed);
      // Skip empty/whitespace lines
      if (!trimmed) return null;

      // 1. Two-col numeric: 'A  3043 J (2) 3024 J'
      let m = RE_TWO_COL_NUM.exec(normalized);
      if (m) {
        const leftLbl = OPT_MAP[m[1]] || m[1].toUpperCase();
        const leftTxt = m[2].trim();
        const rightLbl = OPT_MAP[m[3]] || m[3].toUpperCase();
        const rightTxt = m[4].trim();
        if ('ABCD'.includes(leftLbl) && 'ABCD'.includes(rightLbl) && leftLbl !== rightLbl) {
          return [
            { label: leftLbl, text: leftTxt, image: extractImageFromText(leftTxt) },
            { label: rightLbl, text: rightTxt, image: extractImageFromText(rightTxt) }
          ];
        }
      }

      // 2. Two-col gap: 'A text   B text'
      m = RE_TWO_COL_GAP.exec(normalized);
      if (m) {
        const l1 = OPT_MAP[m[1]] || m[1].toUpperCase();
        const t1 = m[2].trim();
        const l2 = OPT_MAP[m[3]] || m[3].toUpperCase();
        const t2 = m[4].trim();
        if ('ABCD'.includes(l1) && 'ABCD'.includes(l2) && l1 !== l2) {
          return [
            { label: l1, text: t1, image: extractImageFromText(t1) },
            { label: l2, text: t2, image: extractImageFromText(t2) }
          ];
        }
      }

      // 3. Inline options: (A) text (B) text ...
      RE_ALL_OPTS.lastIndex = 0;
      const allMatches = [];
      let om;
      while ((om = RE_ALL_OPTS.exec(normalized)) !== null) {
        const lbl = OPT_MAP[om[1]] || om[1].toUpperCase();
        const txt = (om[2] || '').trim();
        if ('ABCD'.includes(lbl)) {
          allMatches.push({ label: lbl, text: txt, image: extractImageFromText(txt) });
        }
      }
      if (allMatches.length >= 2) return allMatches;

      // 4. Single option on its own line
      m = RE_OPT_SINGLE.exec(normalized);
      if (m) {
        const rawLbl = m[1] || m[3] || '';
        const lbl = OPT_MAP[rawLbl] || rawLbl.toUpperCase();
        const txt = (m[2] || m[4] || '').trim();
        if ('ABCD'.includes(lbl)) {
          const img = extractImageFromText(txt);
          // Allow empty text — image may come on next line
          return [{ label: lbl, text: txt || '', image: img }];
        }
      }

      // 5. LaTeX option: (A) $ \cos^{-1}... $
      m = RE_OPT_LATEX.exec(normalized);
      if (m) {
        const lbl = OPT_MAP[m[1]] || m[1].toUpperCase();
        const txt = m[2].trim();
        if ('ABCD'.includes(lbl) && txt) {
          return [{ label: lbl, text: txt, image: extractImageFromText(txt) }];
        }
      }

      // 6. Bare option label: just "(A)" or "(D)" with nothing else
      if (allowBareLabel) {
        m = RE_BARE_OPT.exec(normalized);
        if (m) {
          const lbl = OPT_MAP[m[1]] || m[1].toUpperCase();
          if ('ABCD'.includes(lbl)) {
            return [{ label: lbl, text: '', image: null }];
          }
        }
      }

      // 7. Option label inside a div: <div>(D)</div>
      if (allowBareLabel) {
        const divOptMatch = normalized.match(/^\(?\s*([A-Da-d])\s*\)?$/i);
        if (divOptMatch) {
          const lbl = OPT_MAP[divOptMatch[1]] || divOptMatch[1].toUpperCase();
          if ('ABCD'.includes(lbl)) {
            return [{ label: lbl, text: '', image: null }];
          }
        }
      }

      return null;
    }

    function extractInlineOptionsFromQuestionText(text) {
      if (!text) return null;

      const parsed = tryParseOpt(text);
      if (!parsed || parsed.length < 2) return null;

      const markers = [
        text.search(/\(\s*[A-Da-d1-4]\s*\)/),
        text.search(/\b[A-Da-d]\s*[.)]\s+/)
      ].filter(idx => idx >= 0);

      if (markers.length === 0) return null;

      const firstMarker = Math.min(...markers);
      const questionText = text.slice(0, firstMarker).trim();
      if (!questionText) return null;

      return { questionText, options: parsed };
    }

    function collectInlineMcqFallbacks(lines, existingQuestions) {
      const existingNums = new Set((existingQuestions || []).map(q => q.num));
      const recovered = [];

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || /<img\b/i.test(line) || /^<div[^>]*>\s*$/i.test(line)) continue;

        const qResult = tryParseQStart(line);
        if (!qResult || !qResult.txt) continue;
        if (existingNums.has(qResult.num)) continue;

        const inlineOptionSplit = extractInlineOptionsFromQuestionText(qResult.txt);
        if (!inlineOptionSplit || inlineOptionSplit.options.length < 2) continue;

        const recoveredQuestion = {
          num: qResult.num,
          text: inlineOptionSplit.questionText,
          options: {},
          optionImages: {},
          images: [],
          preOptionImages: [],
        };

        for (const { label, text, image } of inlineOptionSplit.options) {
          recoveredQuestion.options[label] = text || '';
          if (image) {
            recoveredQuestion.optionImages[label] = image;
          }
        }

        normalizeEmbeddedOptionText(recoveredQuestion);
        recoverMissingBinaryTupleOption(recoveredQuestion);
        recovered.push(recoveredQuestion);
        existingNums.add(qResult.num);
      }

      return recovered;
    }

    // ── Main line-by-line loop ──
    let hitSolution = false; // track if we're inside solution text
    let lastOptionLabel = null; // track last empty option label waiting for an image
    let openOptionLabel = null; // most recent option that may continue on later lines/pages
    let insideTable = false; // track if we're collecting a multi-line HTML table
    let tableBuffer = ''; // buffer for multi-line table content

    function parseImageMeta(imgPath) {
      if (!imgPath) return null;
      const m = imgPath.match(/_(\d+)_(\d+)_(\d+)_(\d+)\.(?:jpg|jpeg|png|webp)$/i);
      if (!m) return null;
      const x1 = parseInt(m[1], 10);
      const y1 = parseInt(m[2], 10);
      const x2 = parseInt(m[3], 10);
      const y2 = parseInt(m[4], 10);
      return {
        x1, y1, x2, y2,
        width: Math.max(0, x2 - x1),
        height: Math.max(0, y2 - y1),
        area: Math.max(0, x2 - x1) * Math.max(0, y2 - y1)
      };
    }

    function splitPreOptionImages(currentQuestion) {
      const preImages = currentQuestion.preOptionImages || [];
      if (preImages.length === 0) return { questionImages: [], optionImages: [] };

      const withMeta = preImages.map(img => ({ img, meta: parseImageMeta(img) }));
      const sortedByArea = withMeta
        .filter(entry => entry.meta)
        .sort((a, b) => b.meta.area - a.meta.area);

      // A single dominant wide image before any option labels is usually the stem diagram.
      if (sortedByArea.length > 0) {
        const largest = sortedByArea[0];
        const second = sortedByArea[1] || null;
          const isDominant =
            largest.meta.width >= 300 &&
            largest.meta.area >= 45000 &&
            (!second || largest.meta.area >= second.meta.area * 1.7);

        if (isDominant) {
          return {
            questionImages: [largest.img],
            optionImages: preImages.filter(img => img !== largest.img)
          };
        }
      }

      // Otherwise, treat the block as option images shown before their labels.
      return { questionImages: [], optionImages: preImages.slice() };
    }

    function pruneDecorativeQuestionImages(images) {
      if (!images || images.length <= 1) return images || [];

      const withMeta = images.map(img => ({ img, meta: parseImageMeta(img) }));
      if (withMeta.some(entry => !entry.meta)) return images;

      const sorted = withMeta.sort((a, b) => {
        if (a.meta.y1 !== b.meta.y1) return a.meta.y1 - b.meta.y1;
        return a.meta.x1 - b.meta.x1;
      });

      const first = sorted[0];
      const kept = [first.img];
      for (let i = 1; i < sorted.length; i++) {
        const current = sorted[i];
        const looksLikeBackgroundArt =
          current.meta.y1 > first.meta.y1 + 100 &&
          current.meta.area > first.meta.area * 4 &&
          current.meta.width > first.meta.width * 1.8;

        if (!looksLikeBackgroundArt) {
          kept.push(current.img);
        }
      }
      return kept;
    }

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      // === Handle multi-line HTML table collection ===
      if (insideTable) {
        tableBuffer += ' ' + rawLine;
        if (/<\/table>/i.test(rawLine)) {
          insideTable = false;
          // Check if table is junk (answer key, schedule, etc.)
          const isJunk = isJunkTable(tableBuffer);
          // Append completed table HTML to current question's text only if not junk
          if (!isJunk && current && Object.keys(current.options).length === 0) {
            current.text += '\n' + tableBuffer.trim();
          }
          tableBuffer = '';
        }
        continue;
      }

      // Detect start of an HTML table (may span multiple lines)
      if (isHtmlTable(line)) {
        if (/<\/table>/i.test(line)) {
          // Single-line table — check for junk and append if clean
          if (!isJunkTable(line) && current && Object.keys(current.options).length === 0) {
            current.text += '\n' + line;
          }
        } else {
          insideTable = true;
          tableBuffer = rawLine;
        }
        continue;
      }

      // Stop at answer key / hints / video solutions
      if (isStopMarker(line)) {
        console.log('[Parser] Hit stop marker:', line.substring(0, 60));
        break;
      }

      // Skip junk lines (marketing, section instructions, promotional)
      if (isJunkLine(line)) {
        continue;
      }

      // Check if this line starts a new question — if so, reset solution flag
      const qResult = tryParseQStart(line);
      if (qResult) {
        hitSolution = false; // new question, reset
        lastOptionLabel = null;
        openOptionLabel = null;
      }

      // Detect solution/answer text at start of line
      if (RE_SOL_LINE_START.test(line)) {
        hitSolution = true;
        continue;
      }

      // If we're in solution text and no new question started, skip the line
      if (hitSolution && !qResult) {
        continue;
      }

      // If we have a current question, try to parse options first
      if (current !== null) {
        // --- Check for div-wrapped option label first ---
        const divLabelResult = extractOptLabelFromDiv(line, Object.keys(current.options).length > 0);
        if (divLabelResult) {
          const { label: divLabel, text: divText } = divLabelResult;
          if (current.options[divLabel] === undefined) {
            current.options[divLabel] = divText || '';
          }
          // IMAGE-BEFORE-LABEL pattern: PaddleOCR often puts images BEFORE their labels.
          // We track a pendingOptionImages queue. When we see a label, we assign the
          // next image from the queue (FIFO order matches layout order A→B→C→D).
          if (!current.pendingOptionImages) current.pendingOptionImages = [];
          if (current.pendingOptionImages.length > 0 && !divText) {
            const nextImg = current.pendingOptionImages.shift(); // FIFO
            if (!current.optionImages) current.optionImages = {};
            current.optionImages[divLabel] = nextImg;
            // Remove from current.images too if it's still there
            const idx = current.images.indexOf(nextImg);
            if (idx >= 0) current.images.splice(idx, 1);
            lastOptionLabel = null;
            openOptionLabel = divLabel;
          } else if (!divText) {
            // No preceding image and no text — set lastOptionLabel for forward association
            lastOptionLabel = divLabel;
            openOptionLabel = divLabel;
          } else {
            lastOptionLabel = null; // text already captured
            openOptionLabel = divLabel;
          }
          continue;
        }

        // --- If we have a pending empty option, check for image or text ---
        if (lastOptionLabel && current.options[lastOptionLabel] !== undefined) {
          const imgUrl = extractImageFromLine(line);
          if (imgUrl) {
            if (!current.optionImages) current.optionImages = {};
            current.optionImages[lastOptionLabel] = imgUrl;
            openOptionLabel = lastOptionLabel;
            lastOptionLabel = null;
            continue;
          }
          // Check if the line is text content for the pending option
          const stripped = line
            .replace(/<div[^>]*>/g, '').replace(/<\/div>/g, '')
            .replace(/<img[^>]*>/g, '')
            .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
            .trim();
          const allowBareLabel = Object.keys(current.options).length > 0 || (current.pendingOptionImages && current.pendingOptionImages.length > 0) || !!lastOptionLabel;
          if (stripped && !tryParseQStart(line) && !tryParseOpt(line, allowBareLabel)) {
            current.options[lastOptionLabel] = stripped;
            openOptionLabel = lastOptionLabel;
            lastOptionLabel = null;
            continue;
          }
        }

        const allowBareLabel = Object.keys(current.options).length > 0 || (current.pendingOptionImages && current.pendingOptionImages.length > 0) || !!lastOptionLabel;
        const optResult = tryParseOpt(line, allowBareLabel);
        if (optResult) {
          lastOptionLabel = null;
          for (const { label, text, image } of optResult) {
            if (!current.options[label]) {
              current.options[label] = text;
              if (image) {
                if (!current.optionImages) current.optionImages = {};
                current.optionImages[label] = image;
              }
              // If option text is empty, track it so next image line gets assigned
              if (!text && !image) {
                lastOptionLabel = label;
              }
              openOptionLabel = label;
            }
          }
          continue;
        }
      }

      // Try to parse as question start (already computed above)
      if (qResult) {
        const isNewQuestion = !current ||
          qResult.num > current.num ||
          (qResult.num === 1 && current.num > 1) ||
          Object.keys(current.options).length >= 2;

        if (isNewQuestion) {
          if (current) {
            current.text = stripSolutionFromText(current.text);
          }
          saveCurrent();
          const inlineOptionSplit = extractInlineOptionsFromQuestionText(qResult.txt);
          current = {
            num: qResult.num,
            text: inlineOptionSplit ? inlineOptionSplit.questionText : qResult.txt,
            options: {},
            optionImages: {},
            images: [],
            preOptionImages: [],
          };
          if (inlineOptionSplit) {
            for (const { label, text, image } of inlineOptionSplit.options) {
              current.options[label] = text || '';
              if (image) {
                current.optionImages[label] = image;
              }
            }
          }
          lastOptionLabel = null;
          openOptionLabel = null;
          continue;
        }
      }

      // Collect images from HTML img tags or markdown images
      if (current !== null) {
        const lineImgs = extractAllImagesFromLine(line);
        if (lineImgs.length > 0) {
          // Once a 4-option MCQ is complete, trailing page artwork should not attach to it.
          if (Object.keys(current.options).length >= 4 && !lastOptionLabel) {
            continue;
          }

          // Filter out junk images (header/footer/promotional)
          const goodImgs = lineImgs.filter(img => !isJunkImage(img));
          if (goodImgs.length > 0) {
            for (const imgUrl of goodImgs) {
              if (lastOptionLabel) {
                // Forward association: image came after label
                if (!current.optionImages) current.optionImages = {};
                current.optionImages[lastOptionLabel] = imgUrl;
                openOptionLabel = lastOptionLabel;
                lastOptionLabel = null;
              } else if (Object.keys(current.options).length > 0) {
                // We already have some option labels — queue for next label (image-before-label)
                if (!current.pendingOptionImages) current.pendingOptionImages = [];
                current.pendingOptionImages.push(imgUrl);
              } else {
                // No options yet — defer classification until we see whether labels follow.
                current.preOptionImages.push(imgUrl);
              }
            }
          }
          continue; // Don't also add image markup to text
        }
      }

      // Otherwise, append to current question text
      if (current !== null) {
        const stripped = line
          .replace(/<div[^>]*>/g, '').replace(/<\/div>/g, '')
          .replace(/<img[^>]*>/g, '')
          .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
          .trim();

        if (
          Object.keys(current.options).length >= 4 &&
          !lastOptionLabel &&
          !tryParseQStart(line) &&
          !tryParseOpt(line, false)
        ) {
          continue;
        }

        if (
          openOptionLabel &&
          current.options[openOptionLabel] !== undefined &&
          stripped &&
          !tryParseQStart(line) &&
          !tryParseOpt(line, false)
        ) {
          current.options[openOptionLabel] = [current.options[openOptionLabel], stripped]
            .filter(Boolean)
            .join(' ')
            .trim();
          continue;
        }

        if (Object.keys(current.options).length === 0) {
          const cleanedQuestionText = line
            .replace(/<div[^>]*>.*?<\/div>/gs, '')
            .replace(/<img[^>]*>/g, '')
            .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
            .trim();
          if (cleanedQuestionText) {
            // Check for inline "Ans." or "Sol." mid-text
            const solMatch = RE_SOL_INLINE.exec(cleanedQuestionText);
            const ansMatch = RE_ANS_INLINE.exec(cleanedQuestionText);
            const matchPos = Math.min(
              solMatch ? solMatch.index : Infinity,
              ansMatch ? ansMatch.index : Infinity
            );
            if (matchPos < Infinity) {
              const beforeSol = cleanedQuestionText.substring(0, matchPos).trim();
              if (beforeSol) {
                current.text += ' ' + beforeSol;
              }
              hitSolution = true;
            } else {
              current.text += ' ' + cleanedQuestionText;
            }
          }
        }
      }
    }
    // Strip solution from the last question too
    if (current) {
      current.text = stripSolutionFromText(current.text);
    }
    saveCurrent();

    const inlineFallbacks = collectInlineMcqFallbacks(lines, rawQuestions);
    if (inlineFallbacks.length > 0) {
      rawQuestions.push(...inlineFallbacks);
    }

    // ── Deduplicate and sort ──
    const seen = new Set();
    const deduped = [];
    for (const q of rawQuestions) {
      if (!seen.has(q.num)) {
        seen.add(q.num);
        deduped.push(q);
      }
    }
    deduped.sort((a, b) => a.num - b.num);

    console.log(`[Parser] Line-by-line found ${deduped.length} questions for "${subject}"`);

    // ── Convert to final format ──
    return deduped.map(q => {
      const optLabels = ['A', 'B', 'C', 'D'];
      const optionImages = { ...(q.optionImages || {}) };
      const preOptionImages = (q.preOptionImages || []).filter(img => !isJunkImage(img));
      const trailingOptionImages = (q.pendingOptionImages || []).filter(img => !isJunkImage(img));
      const labelsPresent = optLabels.filter(l => q.options[l] !== undefined || optionImages[l]);
      const labelsWithText = labelsPresent.filter(l => cleanText(q.options[l] || '').trim().length > 0);
      const missingOrEmptyLabels = optLabels.filter(l => !optionImages[l] && cleanText(q.options[l] || '').trim().length === 0);

      let deferredQuestionImages = [];
      if (preOptionImages.length > 0) {
        const mostlyTextualOptions = labelsWithText.length >= 2;
        const canRebuildImageOptions = preOptionImages.length >= 3 && labelsPresent.length < 2;

        if (mostlyTextualOptions) {
          deferredQuestionImages = preOptionImages.slice();
        } else if (canRebuildImageOptions) {
          const split = splitPreOptionImages(q);
          deferredQuestionImages = split.questionImages.slice();
          const remainingOptionImgs = [...split.optionImages.slice(), ...trailingOptionImages];
          missingOrEmptyLabels.forEach(label => {
            if (!optionImages[label] && remainingOptionImgs.length > 0) {
              optionImages[label] = remainingOptionImgs.shift();
            }
          });
          deferredQuestionImages.push(...remainingOptionImgs);
        } else if (labelsPresent.length === 0) {
          deferredQuestionImages = preOptionImages.slice();
        } else {
          const split = splitPreOptionImages(q);
          deferredQuestionImages = split.questionImages;
          const remainingOptionImgs = [...split.optionImages.slice(), ...trailingOptionImages];
          missingOrEmptyLabels.forEach(label => {
            if (!optionImages[label] && remainingOptionImgs.length > 0) {
              optionImages[label] = remainingOptionImgs.shift();
            }
          });
          deferredQuestionImages.push(...remainingOptionImgs);
        }
      } else if (trailingOptionImages.length > 0) {
        const remainingOptionImgs = trailingOptionImages.slice();
        missingOrEmptyLabels.forEach(label => {
          if (!optionImages[label] && remainingOptionImgs.length > 0) {
            optionImages[label] = remainingOptionImgs.shift();
          }
        });
      }

      if (labelsPresent.length === 0) {
        deferredQuestionImages = pruneDecorativeQuestionImages(deferredQuestionImages);
      }

      const hasEnoughOptionSignal = labelsPresent.length >= 2;
      const options = hasEnoughOptionSignal
        ? optLabels.map(l => {
            const opt = {
              label: l.toLowerCase(),
              text: cleanText(q.options[l] || '')
            };
            // Strip image markup from option text, store image separately
            if (optionImages[l]) {
              opt.image = imageMap[optionImages[l]] || optionImages[l];
              // Clean image markup from text
              opt.text = opt.text
                .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
                .replace(/<img[^>]*>/g, '')
                .trim();
            } else {
              opt.text = opt.text.trim();
            }
            if (!opt.text && !opt.image) {
              opt.text = '—';
            }
            return opt;
          })
        : optLabels
            .filter(l => q.options[l] !== undefined || optionImages[l])
            .map(l => {
              const opt = {
                label: l.toLowerCase(),
                text: cleanText(q.options[l] || '')
              };
              if (optionImages[l]) {
                opt.image = imageMap[optionImages[l]] || optionImages[l];
                opt.text = opt.text
                  .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
                  .replace(/<img[^>]*>/g, '')
                  .trim();
              }
              return opt;
            });

      // Extract images — collect all, resolve through imageMap, filter junk
      // Also exclude images that were assigned to options (they belong there, not question level)
      const assignedOptionImages = new Set(Object.values(optionImages).map(img => imageMap[img] || img));
      let allImages = [];
      if (q.images && q.images.length > 0) {
        allImages = q.images
          .filter(img => !isJunkImage(img))
          .map(img => imageMap[img] || img)
          .filter(img => !isJunkImage(img) && !assignedOptionImages.has(img));
      }
      deferredQuestionImages
        .map(img => imageMap[img] || img)
        .forEach(img => {
          if (!isJunkImage(img) && !assignedOptionImages.has(img) && !allImages.includes(img)) {
            allImages.push(img);
          }
        });
      // Also extract from text
      const mdImgRe = /!\[([^\]]*)\]\(([^)]+)\)/g;
      let imgMatch;
      while ((imgMatch = mdImgRe.exec(q.text)) !== null) {
        const resolved = imageMap[imgMatch[2]] || imgMatch[2];
        if (!allImages.includes(resolved)) allImages.push(resolved);
      }
      const htmlImgRe = /<img\s+src="([^"]+)"/g;
      while ((imgMatch = htmlImgRe.exec(q.text)) !== null) {
        const resolved = imageMap[imgMatch[1]] || imgMatch[1];
        if (!allImages.includes(resolved)) allImages.push(resolved);
      }

      let image = allImages.length > 0 ? allImages[0] : null;

      // Clean text but PRESERVE <table> elements for match-the-following
      let text = q.text;
      // Extract table HTML before cleaning
      const tables = [];
      text = text.replace(/<table[\s\S]*?<\/table>/gi, (match) => {
        tables.push(match);
        return `__TABLE_PLACEHOLDER_${tables.length - 1}__`;
      });
      // Now clean the rest
      text = text.replace(/!\[[^\]]*\]\([^)]+\)/g, '');
      text = text.replace(/<div[^>]*>.*?<\/div>\s*/gs, '');
      text = text.replace(/<img[^>]*>\s*/g, '');
      text = cleanText(text);
      // Restore tables
      tables.forEach((tbl, idx) => {
        text = text.replace(`__TABLE_PLACEHOLDER_${idx}__`, tbl);
      });

      // Determine if numerical (no options or only placeholder options)
      const isNumerical = !hasEnoughOptionSignal;

      return {
        id: q.num,
        subject,
        text: text || `Question ${q.num}`,
        options: options.length >= 2 ? options : [
          { label: 'a', text: '—' },
          { label: 'b', text: '—' },
          { label: 'c', text: '—' },
          { label: 'd', text: '—' }
        ],
        image,
        images: allImages.length > 1 ? allImages : undefined,
        type: isNumerical ? 'Numerical' : 'MCQ',
        ocrIncomplete: !isNumerical && labelsPresent.length < 4
      };
    });
  }

  // ── Clean text ────────────────────────────────────────────

  function cleanText(text) {
    return text
      // OCR often wraps real text options in divs; drop the wrapper, not the content.
      .replace(/<\/?div[^>]*>/gi, '')
      .replace(/<[^>]+>/g, '')
      // Strip URLs that leaked into question text
      .replace(/https?:\/\/\S+/gi, '')
      // Strip marketing / promotional remnants
      .replace(/SCAN\s*QR\s*CODE[^.]*/gi, '')
      .replace(/VIDEO\s*SOLUTIONS?\s*AVAILABLE[^.]*/gi, '')
      .replace(/Your\s*Test\s*Report\s*is\s*Live[^.]*/gi, '')
      .replace(/UPCOMING\s*TEST\s*ALERT[^.]*/gi, '')
      // Strip section instruction remnants
      .replace(/SECTION[-\s]*\d+\s*:\s*\([^)]*\)/gi, '')
      .replace(/This\s+section\s+contains\s+\w+\s+\(\d+\)\s+questions\.?/gi, '')
      .replace(/Full\s+Marks\s*:\s*\+?\d+[^.]*\.?/gi, '')
      .replace(/Zero\s+Marks\s*:\s*\d+[^.]*\.?/gi, '')
      .replace(/Negative\s+Marks\s*:\s*-?\d+[^.]*\.?/gi, '')
      .replace(/Each\s+question\s+has\s+FOUR\s+options[^.]*\.?/gi, '')
      .replace(/MAXIMUM\s+MARKS[^.)]*[.)]/gi, '')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/^\s+|\s+$/g, '')
      .trim();
  }

  // ── Strip solution text from question text ────────────────
  function stripSolutionFromText(text) {
    if (!text) return text;
    // Remove everything from " Sol." / " Solution:" / " Soln." onwards
    const solPatterns = [
      /\s+Sol(?:ution|n)?\s*[:.]\s.*/si,
      /\s+Sol\s*\..*/si,
    ];
    for (const pat of solPatterns) {
      text = text.replace(pat, '');
    }
    return text.trim();
  }

  // ── Resync a single question from raw markdown ─────────
  function resyncQuestion(rawMarkdown, questionId) {
    if (!rawMarkdown || !questionId) return null;

    const md = rawMarkdown;
    const qNum = questionId;
    const nextNum = qNum + 1;

    // Strategy: Find the text block between Q-N and Q-(N+1) in the raw markdown
    // Try several patterns to locate the question start
    const patterns = [
      new RegExp(`(?:^|\\n)\\s*(?:Q\\.?\\s*${qNum}[.):]?|${qNum}[.):]?)\\s+(.+?)(?=(?:^|\\n)\\s*(?:Q\\.?\\s*${nextNum}[.):]?|${nextNum}[.):]?)\\s|$)`, 'si'),
      new RegExp(`(?:^|\\n)\\s*(?:Q\\.?\\s*${qNum}[.):]?|${qNum}[.):]?)\\s+(.+?)(?=(?:^|\\n)\\s*(?:Q\\.?\\s*\\d+[.):]?|\\d+[.):]?)\\s|$)`, 'si'),
    ];

    let rawBlock = null;
    for (const pat of patterns) {
      const m = pat.exec(md);
      if (m) { rawBlock = m[1].trim(); break; }
    }

    if (!rawBlock) {
      console.log('[Parser:Resync] Could not locate Q' + qNum + ' in raw markdown');
      return null;
    }

    console.log('[Parser:Resync] Found raw block for Q' + qNum + ':', rawBlock.substring(0, 150));

    // Extract question text (everything before options)
    const optionPatterns = [
      /\(\s*[Aa]\s*\)/,
      /\b[Aa]\s*[.)]/,
      /\(1\)/,
    ];

    let splitIdx = rawBlock.length;
    for (const op of optionPatterns) {
      const match = op.exec(rawBlock);
      if (match && match.index < splitIdx) {
        splitIdx = match.index;
      }
    }

    const questionText = rawBlock.substring(0, splitIdx).trim();

    // Extract options
    const optRegex = /\(\s*([A-Da-d1-4])\s*\)\s*(.*?)(?=\s*\([A-Da-d1-4]\)|$)/gs;
    const options = [];
    let om;
    while ((om = optRegex.exec(rawBlock)) !== null) {
      options.push({
        label: om[1].toUpperCase(),
        text: om[2].trim()
      });
    }

    // Also try "A. text" "B. text" format if no (A) style found
    if (options.length === 0) {
      const altOptRegex = /(?:^|\n)\s*([A-Da-d])\s*[.)]\s*(.+?)(?=(?:\n\s*[A-Da-d]\s*[.)])|$)/gs;
      while ((om = altOptRegex.exec(rawBlock)) !== null) {
        options.push({
          label: om[1].toUpperCase(),
          text: om[2].trim()
        });
      }
    }

    if (!questionText && options.length === 0) return null;

    // Check for inline image
    let image = null;
    const imgMatch = rawBlock.match(/!\[.*?\]\((.*?)\)/);
    if (imgMatch) image = imgMatch[1];

    return {
      id: qNum,
      text: questionText || '(No question text found)',
      options: options.length > 0 ? options : [
        { label: 'A', text: '—' },
        { label: 'B', text: '—' },
        { label: 'C', text: '—' },
        { label: 'D', text: '—' }
      ],
      image: image,
      resynced: true
    };
  }

  const parser = { parse, parseMarkdown, resyncQuestion };
  if (typeof window !== 'undefined') window.ExamParser = parser;
  return parser;
})();
