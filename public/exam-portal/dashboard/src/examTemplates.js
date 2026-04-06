// ==========================================
// Exam Templates Configuration
// ==========================================

const EXAM_TEMPLATES = {
  "jee_main": {
    name: "JEE Main",
    totalMarks: 300,
    duration: 3 * 60 * 60, // 3 hours in seconds
    markingScheme: {
      mcq: { correct: 4, wrong: -1 },
      numerical: { correct: 4, wrong: 0 }
    },
    subjects: [
      {
        name: "Mathematics",
        sections: [
          { type: "MCQ", startQ: 1, endQ: 20, options: 4 },
          { type: "Numerical", startQ: 21, endQ: 25 }
        ]
      },
      {
        name: "Physics",
        sections: [
          { type: "MCQ", startQ: 26, endQ: 45, options: 4 },
          { type: "Numerical", startQ: 46, endQ: 50 }
        ]
      },
      {
        name: "Chemistry",
        sections: [
          { type: "MCQ", startQ: 51, endQ: 70, options: 4 },
          { type: "Numerical", startQ: 71, endQ: 75 }
        ]
      }
    ]
  },

  "bitsat": {
    name: "BITSAT",
    totalMarks: 450,
    duration: 3 * 60 * 60,
    markingScheme: {
      mcq: { correct: 3, wrong: -1 },
      numerical: { correct: 3, wrong: 0 }
    },
    subjects: [
      {
        name: "Physics",
        sections: [
          { type: "MCQ", startQ: 1, endQ: 40, options: 4 }
        ]
      },
      {
        name: "Chemistry",
        sections: [
          { type: "MCQ", startQ: 41, endQ: 80, options: 4 }
        ]
      },
      {
        name: "English Proficiency",
        sections: [
          { type: "MCQ", startQ: 81, endQ: 95, options: 4 }
        ]
      },
      {
        name: "Logical Reasoning",
        sections: [
          { type: "MCQ", startQ: 96, endQ: 105, options: 4 }
        ]
      },
      {
        name: "Mathematics",
        sections: [
          { type: "MCQ", startQ: 106, endQ: 150, options: 4 }
        ]
      }
    ]
  },

  "neet": {
    name: "NEET",
    totalMarks: 720,
    duration: 3.33 * 60 * 60, // 3hr 20min
    markingScheme: {
      mcq: { correct: 4, wrong: -1 },
      numerical: { correct: 4, wrong: 0 }
    },
    subjects: [
      {
        name: "Physics",
        sections: [
          { type: "MCQ", startQ: 1, endQ: 35, options: 4 },
          { type: "MCQ", startQ: 36, endQ: 50, options: 4 }
        ]
      },
      {
        name: "Chemistry",
        sections: [
          { type: "MCQ", startQ: 51, endQ: 85, options: 4 },
          { type: "MCQ", startQ: 86, endQ: 100, options: 4 }
        ]
      },
      {
        name: "Biology",
        sections: [
          { type: "MCQ", startQ: 101, endQ: 135, options: 4 },
          { type: "MCQ", startQ: 136, endQ: 150, options: 4 },
          { type: "MCQ", startQ: 151, endQ: 185, options: 4 },
          { type: "MCQ", startQ: 186, endQ: 200, options: 4 }
        ]
      }
    ]
  },

  "comedk": {
    name: "COMEDK UGET",
    totalMarks: 180,
    duration: 3 * 60 * 60,
    markingScheme: {
      mcq: { correct: 1, wrong: 0 },
      numerical: { correct: 1, wrong: 0 }
    },
    subjects: [
      {
        name: "Physics",
        sections: [
          { type: "MCQ", startQ: 1, endQ: 60, options: 4 }
        ]
      },
      {
        name: "Chemistry",
        sections: [
          { type: "MCQ", startQ: 61, endQ: 120, options: 4 }
        ]
      },
      {
        name: "Mathematics",
        sections: [
          { type: "MCQ", startQ: 121, endQ: 180, options: 4 }
        ]
      }
    ]
  },

  "kcet": {
    name: "KCET",
    totalMarks: 180,
    duration: 3 * 60 * 60,
    markingScheme: {
      mcq: { correct: 1, wrong: 0 },
      numerical: { correct: 1, wrong: 0 }
    },
    subjects: [
      {
        name: "Physics",
        sections: [
          { type: "MCQ", startQ: 1, endQ: 60, options: 4 }
        ]
      },
      {
        name: "Chemistry",
        sections: [
          { type: "MCQ", startQ: 61, endQ: 120, options: 4 }
        ]
      },
      {
        name: "Mathematics",
        sections: [
          { type: "MCQ", startQ: 121, endQ: 180, options: 4 }
        ]
      }
    ]
  },

  "viteee": {
    name: "VITEEE",
    totalMarks: 125,
    duration: 2.5 * 60 * 60, // 2hr 30min
    markingScheme: {
      mcq: { correct: 1, wrong: 0 },
      numerical: { correct: 1, wrong: 0 }
    },
    subjects: [
      {
        name: "Mathematics",
        sections: [
          { type: "MCQ", startQ: 1, endQ: 40, options: 4 }
        ]
      },
      {
        name: "Physics",
        sections: [
          { type: "MCQ", startQ: 41, endQ: 75, options: 4 }
        ]
      },
      {
        name: "Chemistry",
        sections: [
          { type: "MCQ", startQ: 76, endQ: 110, options: 4 }
        ]
      },
      {
        name: "English",
        sections: [
          { type: "MCQ", startQ: 111, endQ: 115, options: 4 }
        ]
      },
      {
        name: "Aptitude",
        sections: [
          { type: "MCQ", startQ: 116, endQ: 125, options: 4 }
        ]
      }
    ]
  },

  "custom": {
    name: "Custom / Auto-detect",
    totalMarks: null, // calculated from questions
    duration: 3 * 60 * 60,
    markingScheme: {
      mcq: { correct: 4, wrong: -1 },
      numerical: { correct: 4, wrong: 0 }
    },
    subjects: [] // auto-detected from parsed data
  }
};

export default EXAM_TEMPLATES;
