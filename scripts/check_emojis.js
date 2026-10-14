const fs = require('fs');
const path = require('path');

const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/u;

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.tsx') || file.endsWith('.html')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk(path.resolve('./frontend/src'));
let found = 0;
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, idx) => {
    if (EMOJI_REGEX.test(l)) {
      console.log(`EMOJI at ${path.relative('./frontend/src', f)}:${idx + 1}: ${l.trim()}`);
      found++;
    }
  });
});

console.log(`Total emoji instances found in frontend/src: ${found}`);
