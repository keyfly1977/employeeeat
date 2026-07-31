const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'swagger-ui-init.js');
let content = fs.readFileSync(filePath, 'utf8');

// We want to extract the JSON object assigned to options
// A simple way is to find the index of '"swaggerDoc":' and parse the object from there.
const docStartMarker = '"swaggerDoc":';
const startIndex = content.indexOf(docStartMarker);
if (startIndex === -1) {
  console.error("Could not find swaggerDoc in file");
  process.exit(1);
}

// Find the start of the object after the marker
const jsonStartIndex = content.indexOf('{', startIndex);
if (jsonStartIndex === -1) {
  console.error("Could not find JSON start");
  process.exit(1);
}

// Simple brace matching to extract the JSON object
let braceCount = 0;
let jsonEndIndex = -1;
for (let i = jsonStartIndex; i < content.length; i++) {
  if (content[i] === '{') {
    braceCount++;
  } else if (content[i] === '}') {
    braceCount--;
    if (braceCount === 0) {
      jsonEndIndex = i + 1;
      break;
    }
  }
}

if (jsonEndIndex === -1) {
  console.error("Could not find matching closing brace");
  process.exit(1);
}

const jsonString = content.substring(jsonStartIndex, jsonEndIndex);
try {
  const swaggerDoc = JSON.parse(jsonString);
  console.log("Swagger API Title:", swaggerDoc.info.title);
  console.log("Total Paths:", Object.keys(swaggerDoc.paths).length);
  
  const results = [];
  for (const [apiPath, methods] of Object.entries(swaggerDoc.paths)) {
    for (const [method, detail] of Object.entries(methods)) {
      results.push({
        path: apiPath,
        method: method.toUpperCase(),
        summary: detail.summary || '',
        tags: detail.tags || [],
        description: detail.description || ''
      });
    }
  }

  // Write the parsed endpoints summary to a JSON file for easy reading
  fs.writeFileSync(
    path.join(__dirname, 'parsed_endpoints.json'), 
    JSON.stringify(results, null, 2), 
    'utf8'
  );
  console.log("Saved parsed endpoints to parsed_endpoints.json");

  // Output all paths with their tags and summaries
  results.forEach(r => {
    console.log(`[${r.method}] ${r.path} - ${r.summary} (${r.tags.join(', ')})`);
  });

} catch (err) {
  console.error("Failed to parse JSON:", err.message);
  // write snippet to check what went wrong
  fs.writeFileSync(path.join(__dirname, 'err_snippet.json'), jsonString.substring(0, 1000));
}
