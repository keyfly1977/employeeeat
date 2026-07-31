const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'swagger-ui-init.js');
const content = fs.readFileSync(filePath, 'utf8');

const docStartMarker = '"swaggerDoc":';
const startIndex = content.indexOf(docStartMarker);
const jsonStartIndex = content.indexOf('{', startIndex);
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
const swaggerDoc = JSON.parse(content.substring(jsonStartIndex, jsonEndIndex));

const ep = '/api/os/company';
const epDoc = swaggerDoc.paths[ep];
if (epDoc) {
  console.log(`Endpoint: ${ep}`);
  console.log(`Summary: ${epDoc.post.summary}`);
  console.log(`Request Body Schema Properties:`);
  const reqBodyContent = epDoc.post.requestBody?.content?.['application/json']?.schema;
  if (reqBodyContent) {
    console.log(JSON.stringify(reqBodyContent.properties, null, 2));
    console.log(`Required Fields:`, reqBodyContent.required);
  }
  console.log(`Responses:`);
  console.log(JSON.stringify(epDoc.post.responses, null, 2));
} else {
  console.log(`Endpoint ${ep} not found`);
}
