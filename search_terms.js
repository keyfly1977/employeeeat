const fs = require('fs');
const content = fs.readFileSync('swagger-ui-init.js', 'utf8');

const regex = /事項|原因/g;
let match;
while ((match = regex.exec(content)) !== null) {
  const start = Math.max(0, match.index - 50);
  const end = Math.min(content.length, match.index + 50);
  console.log(`Match at ${match.index}: ...${content.substring(start, end).replace(/\r?\n/g, ' ')}...`);
}
