"use client";

import { useState } from "react";

import { Plus, PencilSimple, X } from "@phosphor-icons/react";
import AddSkillModal from "@/app/(screens)/profile/KeySkills/addSkillModel";
import Pill from "./Pill";
import { useRouter } from "next/navigation";

const initialTechnical = [
  "React.js",
  "Node.js",
  "Django",
  "TensorFlow",
  "MongoDB",
  "Fire Base",
  "Git & GitHub",
];

const initialSoft = [
  "Communication Skills",
  "Team Collaboration",
  "Critical Thinking",
  "Problem-Solving",
  "Time Management",
  "Leadership & Ownership",
  "Attention to Detail",
  "Creativity & Innovation",
];

const initialTools = [
  "Visual Studio Code",
  "PyCharm",
  "Bitbucket",
  "React.js",
  "Django",
  "Spring Boot",
  "Pandas",
];

export default function KeySkillsWithModal() {
  const [technical, setTechnical] = useState<string[]>(initialTechnical);
  const [soft, setSoft] = useState<string[]>(initialSoft);
  const [tools, setTools] = useState<string[]>(initialTools);

  const [editTechnical, setEditTechnical] = useState(false);
  const [editSoft, setEditSoft] = useState(false);
  const [editTools, setEditTools] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);

  const router = useRouter();

  const removeFrom = (listName: "technical" | "soft" | "tools", value: string) => {
    if (listName === "technical") setTechnical((s) => s.filter((x) => x !== value));
    if (listName === "soft") setSoft((s) => s.filter((x) => x !== value));
    if (listName === "tools") setTools((s) => s.filter((x) => x !== value));
  };

  const handleAdd = (section: "technical" | "soft" | "tools", value: string) => {
    if (section === "technical") setTechnical((s) => (s.includes(value) ? s : [...s, value]));
    if (section === "soft") setSoft((s) => (s.includes(value) ? s : [...s, value]));
    if (section === "tools") setTools((s) => (s.includes(value) ? s : [...s, value]));
  };

  return (
    <div className="mt-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-[#282828]">Skills</h3>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 bg-[#43C17A] cursor-pointer text-white text-sm font-medium px-3 py-1.5 rounded"
            >
              {/* <Plus size={16} weight="bold" /> */}
              <span>Add +</span>
            </button>
            <button
              onClick={() => router.push('/profile?languages')}
              className="bg-[#43C17A] cursor-pointer text-white px-5 py-1.5 rounded-md text-sm">
              Next
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg text-[#43C17A] font-medium">Technical Skills</h4>
            </div>

            <div className="relative rounded-md border border-[#C0C0C0] p-3">
              <button
                aria-label="Toggle edit technical"
                onClick={() => setEditTechnical((v) => !v)}
                className={`absolute right-3 cursor-pointer top-3 inline-flex items-center justify-center w-8 h-8 rounded-full ${editTechnical ? "bg-emerald-600 text-white" : "bg-[#43C17A30] text-[#43C17A]"
                  }`}
                title={editTechnical ? "Done editing" : "Edit"}
              >
                <PencilSimple size={16} weight="bold" />
              </button>

              <div className="flex flex-wrap items-center">
                {technical.map((t) => (
                  <Pill
                    key={t}
                    showRemove={editTechnical}
                    onRemove={() => removeFrom("technical", t)}
                  >
                    <p className="text-[#525252] font-normal">{t}</p>
                  </Pill>
                ))}

                {technical.length === 0 && (
                  <div className="text-sm text-gray-400 italic">No technical skills added.</div>
                )}
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg text-[#43C17A] font-medium">Soft Skills</h4>
            </div>

            <div className="relative rounded-md border border-[#C0C0C0] p-3 min-h-[68px]">
              <button
                aria-label="Toggle edit soft"
                onClick={() => setEditSoft((v) => !v)}
                className={`absolute right-3 cursor-pointer top-3 inline-flex items-center justify-center w-8 h-8 rounded-full ${editSoft ? "bg-emerald-600 text-white" : "bg-[#43C17A30] text-[#43C17A]"
                  }`}
                title={editSoft ? "Done editing" : "Edit"}
              >
                <PencilSimple size={16} weight="bold" />
              </button>

              <div className="flex flex-wrap items-center">
                {soft.map((s) => (
                  <Pill key={s} showRemove={editSoft} onRemove={() => removeFrom("soft", s)}>
                    <p className="text-[#525252] font-normal">{s}</p>
                  </Pill>
                ))}

                {soft.length === 0 && (
                  <div className="text-sm text-gray-400 italic">No soft skills added.</div>
                )}
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg text-[#43C17A] font-medium">Tools & Frameworks</h4>
            </div>

            <div className="relative rounded-md border border-[#C0C0C0] p-3">
              <button
                aria-label="Toggle edit tools"
                onClick={() => setEditTools((v) => !v)}
                className={`absolute right-3 top-3 cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-full ${editTools ? "bg-emerald-600 text-white" : "bg-[#43C17A30] text-[#43C17A]"
                  }`}
                title={editTools ? "Done editing" : "Edit"}
              >
                <PencilSimple size={16} weight="bold" />
              </button>

              <div className="flex flex-wrap items-center">
                {tools.map((t) => (
                  <Pill key={t} showRemove={editTools} onRemove={() => removeFrom("tools", t)}>
                    <p className="text-[#525252] font-normal">{t}</p>
                  </Pill>
                ))}

                {tools.length === 0 && (
                  <div className="text-sm text-gray-400 italic">No tools added.</div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      <AddSkillModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAdd}
        defaultSection="technical"
      />
    </div>
  );
}
