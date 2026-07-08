const fs = require('fs');
const path = require('path');

function findMyPayPages(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findMyPayPages(filePath, fileList);
    } else if (file === 'mypaypage.tsx' && filePath.includes('payroll')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const targetFiles = findMyPayPages('app/(screens)');
console.log('Found files:', targetFiles);

const newContent = `"use client";

import React, { Suspense } from "react";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
import { SharedMyPayPage } from "@/app/components/payroll/SharedMyPayPage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm">
          <Loader />
        </div>
      }
    >
      <SharedMyPayPage />
    </Suspense>
  );
}
`;

targetFiles.forEach(file => {
  fs.writeFileSync(file, newContent, 'utf-8');
  console.log('Updated:', file);
});

console.log('All mypaypage.tsx files refactored successfully.');
