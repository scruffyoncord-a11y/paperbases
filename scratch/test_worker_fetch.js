
fetch('http://localhost:5173/pdf.worker.min.js')
  .then(res => console.log('Worker found:', res.status))
  .catch(err => console.log('Worker fetch failed:', err.message));
