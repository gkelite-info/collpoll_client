"use client";

import { useState } from "react";
import ResumeTemplate1 from "./templates/Template1";
import ResumeTemplate2 from "./templates/Template2";
import ResumeTemplate3 from "./templates/Template3";
import ResumeTemplate4 from "./templates/Template4";
import ResumeTemplate5 from "./templates/Template5";

// ✅ ADDED THIS
type Props = {
  onBack?: () => void;
};

const templates = [
  {
    id: 1,
    name: "Classic Two-Column",
    description: "Profile photo header with sidebar layout",
    component: ResumeTemplate1,
  },
  {
    id: 2,
    name: "Clean Professional",
    description: "Centered header with underlined sections",
    component: ResumeTemplate2,
  },
  {
    id: 3,
    name: "Gray Box Sections",
    description: "Bold name with shaded section headers",
    component: ResumeTemplate3,
  },
  {
    id: 4,
    name: "Label Sidebar",
    description: "Left-label rows with vertical divider",
    component: ResumeTemplate4,
  },
  {
    id: 5,
    name: "Side Contact",
    description: "Contact info on right, ruled section titles",
    component: ResumeTemplate5,
  },
];

// Display order: Template 1 twice, then 2, 3, 4, 5
const previewList = [
  templates[0],
  templates[0],
  templates[1],
  templates[2],
  templates[3],
  templates[4],
];

// ✅ UPDATED FUNCTION SIGNATURE ONLY
export default function ResumePage({ onBack }: Props) {
  const [active, setActive] = useState(1);
  const ActiveTemplate = templates.find((t) => t.id === active)?.component;

  return (
    <div className="min-h-screen bg-white w-max rounded-2xl">

      {/* ✅ OPTIONAL BACK BUTTON (ADDED ONLY, NOTHING REMOVED) */}
      {onBack && (
        <button onClick={onBack} className="m-1 text-md font-semibold text-black cursor-pointer">
          ← Back
        </button>
      )}

      {/* Top Nav */}
      {/* <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <h1 className="text-lg font-bold text-gray-800 mb-3">Resume Templates</h1>
        <div className="flex gap-2 flex-wrap">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                active === t.id
                  ? "bg-gray-900 text-white shadow"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t.id}. {t.name}
            </button>
          ))}
        </div>
      </div> */}

      {/* Template Preview */}
      <div className="py-4 px-4 flex gap-2">
        {previewList.map((t, index) => {
          const TemplateComponent = t.component;
          return (
            <div key={index} className="max-w-2xl mx-auto border-8 border-gray-200 rounded-2xl">
              <div className="mb-4 text-center"></div>
              <TemplateComponent />
            </div>
          );
        })}
      </div>

    </div>
  );
}