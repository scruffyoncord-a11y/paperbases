// =====================================================
// examStore.js — IndexedDB-based local exam storage
// Stores parsed exam data with paper name, template, date
// =====================================================

const ExamStore = (function () {
  'use strict';

  const DB_NAME = 'ExamPortalDB';
  const DB_VERSION = 1;
  const STORE_NAME = 'exams';

  function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('date', 'date', { unique: false });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Save an exam: { name, template, questions, subjects, imageMap, date }
  async function saveExam(examData) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record = {
        name: examData.name || 'Untitled Exam',
        template: examData.template || 'custom',
        questions: examData.questions,
        subjects: examData.subjects,
        imageMap: examData.imageMap || {},
        questionCount: examData.questions.length,
        date: new Date().toISOString()
      };
      const req = store.add(record);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    });
  }

  // Get all saved exams (metadata only — no questions for speed)
  async function listExams() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const exams = req.result.map(e => ({
          id: e.id,
          name: e.name,
          template: e.template,
          questionCount: e.questionCount,
          date: e.date
        }));
        // Sort newest first
        exams.sort((a, b) => new Date(b.date) - new Date(a.date));
        resolve(exams);
      };
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    });
  }

  // Load a full exam by ID
  async function loadExam(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    });
  }

  // Delete an exam by ID
  async function deleteExam(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    });
  }

  return { saveExam, listExams, loadExam, deleteExam };
})();

export default ExamStore;
