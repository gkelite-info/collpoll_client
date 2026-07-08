const fs = require('fs');
const path = require('path');

function findFiles(dir, filename, fileList) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findFiles(filePath, filename, fileList);
    } else if (file === filename) {
      fileList.push(filePath);
    }
  }
}

const fileList = [];
findFiles(path.join(process.cwd(), 'app', '(screens)'), 'mypaypage.tsx', fileList);

fileList.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf-8');
  let searchStr = 'console.error("Failed to fetch pay summary:", error);';
  let replaceStr = 'toast.error("Unable to fetch pay summary at this time.", { id: "pay-summary-fetch-error" });';
  if (content.includes(searchStr)) {
    content = content.replace(searchStr, replaceStr);
    if (!content.includes('import toast from "react-hot-toast";')) {
       content = content.replace('import React', 'import toast from "react-hot-toast";\nimport React');
    }
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Updated ' + filePath);
  }
});
