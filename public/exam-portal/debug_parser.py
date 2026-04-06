import json, sys, io, re, subprocess

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Simple test: simulate parsing of Q61 pattern through the parser
# We'll create a minimal markdown and run it through parser.js via Node

test_markdown = r'''61. Which of the following gives meso compound as product?

<div style="text-align: center;"><img src="imgs/option_A.jpg" alt="Image" width="22%" /></div>


<div style="text-align: center;">(A)</div>


<div style="text-align: center;"><img src="imgs/option_B.jpg" alt="Image" width="23%" /></div>


<div style="text-align: center;">(B)</div>


<div style="text-align: center;"><img src="imgs/option_C.jpg" alt="Image" width="26%" /></div>


<div style="text-align: center;">(C)</div>


<div style="text-align: center;"><img src="imgs/option_D.jpg" alt="Image" width="21%" /></div>


<div style="text-align: center;">(D)</div>


62. Next question here
(A) opt1 (B) opt2 (C) opt3 (D) opt4
'''

# Write a small Node.js test script
node_script = '''
const fs = require('fs');
eval(fs.readFileSync('parser.js', 'utf8'));

const testMarkdown = ''' + json.dumps(test_markdown) + ''';

// Create a minimal PaddleOCR-like structure
const testJson = {
  result: {
    layoutParsingResults: [{
      markdown: {
        text: testMarkdown,
        images: {}
      }
    }]
  }
};

const parser = new ExamParser();
const result = parser.parse(testJson);
const q61 = result.questions.find(q => q.id === 61);
if (q61) {
  console.log('Q61 found!');
  console.log('Text:', q61.text.substring(0, 60));
  console.log('Options:');
  for (const opt of q61.options) {
    console.log('  ' + opt.label.toUpperCase() + ':', 
                opt.text || '[no text]', 
                opt.image ? '| IMG: ' + opt.image : '| NO IMAGE');
  }
  console.log('Question image:', q61.image || 'none');
  console.log('');
  
  // Check correctness
  const issues = [];
  if (!q61.options.find(o => o.label === 'a' && o.image && o.image.includes('option_A')))
    issues.push('Option A missing or wrong image');
  if (!q61.options.find(o => o.label === 'b' && o.image && o.image.includes('option_B')))
    issues.push('Option B missing or wrong image');
  if (!q61.options.find(o => o.label === 'c' && o.image && o.image.includes('option_C')))
    issues.push('Option C missing or wrong image');
  if (!q61.options.find(o => o.label === 'd' && o.image && o.image.includes('option_D')))
    issues.push('Option D missing or wrong image');
  
  if (issues.length === 0) {
    console.log('✅ ALL OPTIONS CORRECTLY MAPPED!');
  } else {
    console.log('❌ ISSUES:');
    issues.forEach(i => console.log('  - ' + i));
  }
} else {
  console.log('❌ Q61 not found! Questions:', result.questions.map(q => q.id));
}
'''

with open('test_parser.js', 'w', encoding='utf8') as f:
    f.write(node_script)

result = subprocess.run(['node', 'test_parser.js'], capture_output=True, text=True, encoding='utf8')
print(result.stdout)
if result.stderr:
    print('STDERR:', result.stderr[:500])
