
const fs = require("fs");
const path = require("path");

const fileContent = fs.readFileSync("AnalyticsScreens.tsx", "utf8");

const importLines = [];
let currentIndex = 0;

// Read imports
const lines = fileContent.split("\n");
let inImports = true;
const imports = [];
let codeStart = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.startsWith("import ") || line.startsWith("export type") || line.startsWith("export {") || line.trim() === "") {
    if (inImports) {
      imports.push(line);
      codeStart = i + 1;
    }
  } else if (line.startsWith("ModuleRegistry.registerModules") || line.startsWith("\"use client\"")) {
    imports.push(line);
    codeStart = i + 1;
  } else {
    inImports = false;
  }
}

const baseImports = imports.join("\n");

// Write to files (just duplicate for now, we will refine later)

