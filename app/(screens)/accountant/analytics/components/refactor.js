
const fs = require("fs");

const content = fs.readFileSync("AnalyticsScreens.tsx", "utf8");

const groups = {
  cards: ["StatCard", "RevenueStatCard", "RevenueSourceCard", "StudentFeesStatCard", "FeeTypeCard"],
  charts: ["RevenueExpenseChart", "ExpensesByCategory", "RevenueAnalyticsChart", "StudentRevenueTrendChart"],
  modals: ["RevenueDetailsModal", "AddRevenueRecordModal"],
  panels: ["PanelHeader", "RevenueSourcesPanel", "RevenueSourceRow", "MonthlyExpensePanel", "RecentTransactionsPanel", "RecentFeeCollectionsTable", "RecentRevenueRecordsTable"],
  screens: ["StudentFeesScreen", "RevenueManagementScreen", "AnalyticsOverviewScreen"],
  constants: ["stats", "MONTH_LABELS", "CATEGORY_COLORS", "studentFeeRevenueSource", "revenueStats", "revenueSourceOverview", "studentFeeStats", "feeTypeSummary", "recentFeeCollections"]
};

// We will just do a dirty split based on "function " and "const " at the top level
const fileBlocks = {};

const regex = /^(?:export )?(?:function|const) (\w+)(?:[\s\(={]|$)/gm;
let match;
const matches = [];
while ((match = regex.exec(content)) !== null) {
  matches.push({ name: match[1], index: match.index });
}

// Find where the first block starts
const firstBlockStart = matches[0].index;
const importsStr = content.substring(0, firstBlockStart).trim();

for (let i = 0; i < matches.length; i++) {
  const start = matches[i].index;
  const end = i < matches.length - 1 ? matches[i+1].index : content.length;
  const blockCode = content.substring(start, end);
  fileBlocks[matches[i].name] = blockCode;
}

// Now write each group
for (const [group, names] of Object.entries(groups)) {
  let fileContent = importsStr + "\n\n";
  
  // Add local imports to everything except what is in this file
  for (const [otherGroup, otherNames] of Object.entries(groups)) {
    if (otherGroup !== group && otherGroup !== "constants") {
       const toImport = otherNames.filter(n => content.includes(n));
       if (toImport.length > 0) {
         fileContent += `import { ${toImport.join(", ")} } from "../${otherGroup}";\n`;
       }
    }
  }
  // import constants
  if (group !== "constants") {
    fileContent += `import { ${groups.constants.join(", ")} } from "../shared/constants";\n`;
  }
  // import shimmers explicitly since they were already extracted manually
  if (group !== "constants") {
     fileContent += `import { AnalyticsPageShimmer } from "../shimmers/AnalyticsPageShimmer";\n`;
     fileContent += `import { AnalyticsShimmerVariant } from "../shared/types";\n`;
  }
  
  fileContent += "\n";

  for (const name of names) {
    if (fileBlocks[name]) {
      // Ensure it is exported
      let code = fileBlocks[name];
      if (!code.startsWith("export ")) {
        code = "export " + code;
      }
      fileContent += code + "\n";
    }
  }
  
  if (group === "constants") {
    fs.writeFileSync(`shared/constants.tsx`, fileContent);
  } else {
    fs.writeFileSync(`${group}/index.tsx`, fileContent);
  }
}

