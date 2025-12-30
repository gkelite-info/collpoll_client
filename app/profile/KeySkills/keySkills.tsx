"use client";

import { useEffect, useState } from "react";

import { Plus, PencilSimple, X } from "@phosphor-icons/react";
import Pill from "./Pill";
import { useRouter } from "next/navigation";
import AddSkillModal from "./addSkillModel";
import { addUserSkill, getUserSkills, removeUserSkill } from "@/lib/helpers/profile/skillsAPI";
import toast from "react-hot-toast";
import { useStudent } from "@/app/utils/context/UserContext";

type Skill = { skillId: number; name: string };

export default function KeySkillsWithModal() {
  const [technical, setTechnical] = useState<Skill[]>([]);
  const [soft, setSoft] = useState<Skill[]>([]);
  const [tools, setTools] = useState<Skill[]>([]);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const [editTechnical, setEditTechnical] = useState(false);
  const [editSoft, setEditSoft] = useState(false);
  const [editTools, setEditTools] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();
  const { userId, studentId } = useStudent();

  // const removeFrom = (listName: "technical" | "soft" | "tools", value: string) => {
  //   if (listName === "technical") setTechnical((s) => s.filter((x) => x !== value));
  //   if (listName === "soft") setSoft((s) => s.filter((x) => x !== value));
  //   if (listName === "tools") setTools((s) => s.filter((x) => x !== value));
  // };

  // const handleAdd = (section: "technical" | "soft" | "tools", value: string) => {
  //   if (section === "technical") setTechnical((s) => (s.includes(value) ? s : [...s, value]));
  //   if (section === "soft") setSoft((s) => (s.includes(value) ? s : [...s, value]));
  //   if (section === "tools") setTools((s) => (s.includes(value) ? s : [...s, value]));
  // };

  useEffect(() => {
    if (!userId) return;

    getUserSkills(userId)
      .then(data => {
        setTechnical(data.filter(d => d.category === "Technical Skills"));
        setSoft(data.filter(d => d.category === "Soft Skills"));
        setTools(data.filter(d => d.category === "Tools & Frameworks"));
      })
      .catch(err => {
        toast.error(err.message || "Failed to load skills");
      });
  }, [userId]);

  const removeFrom = async (skillId: number) => {
    if (!userId) {
      toast.error("User not loaded yet");
      return;
    }

    try {
      setRemoving(true);
      await removeUserSkill(userId, skillId);

      setTechnical(s => s.filter(x => x.skillId !== skillId));
      setSoft(s => s.filter(x => x.skillId !== skillId));
      setTools(s => s.filter(x => x.skillId !== skillId));
    } catch (err: any) {
      toast.error(err.message || "Error while removing");
    } finally {
      setRemoving(false);
    }
  };


  const handleAdd = async (
    section: "technical" | "soft" | "tools",
    value: string
  ) => {
    if (!userId) {
      toast.error("User not loaded yet");
      return;
    }

    if (!studentId) {
      toast.error("Student profile not loaded");
      return;
    }

    console.log("studentId", studentId);


    try {
      setSaving(true);
      await addUserSkill(studentId, section, value);

      const data = await getUserSkills(userId);
      setTechnical(data.filter(d => d.category === "Technical Skills"));
      setSoft(data.filter(d => d.category === "Soft Skills"));
      setTools(data.filter(d => d.category === "Tools & Frameworks"));

      toast.success("Skill added");
    } catch (err: any) {
      toast.error(err.message || "Error while saving");
    } finally {
      setSaving(false);
    }
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
              disabled={saving}
              onClick={() => setModalOpen(true)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium
    ${saving ? "opacity-50 cursor-not-allowed" : "bg-[#43C17A] text-white"}`}
            >
              {saving ? "Saving..." : "Add +"}
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

            <div className="relative rounded-md border border-[#C0C0C0] p-3 flex items-center">
              {technical.length > 0 && (
                <button
                  aria-label="Toggle edit technical"
                  onClick={() => setEditTechnical((v) => !v)}
                  className={`absolute right-3 cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-full ${editTechnical ? "bg-emerald-600 text-white" : "bg-[#43C17A30] text-[#43C17A]"
                    }`}
                  title={editTechnical ? "Done editing" : "Edit"}
                >
                  <PencilSimple size={16} weight="bold" />
                </button>
              )}

              <div className="flex flex-wrap items-center">
                {technical.map((t) => (
                  <Pill
                    key={t.skillId}
                    showRemove={editTechnical}
                    onRemove={() => removeFrom(t.skillId)}
                  >
                    <p className="text-[#525252] font-normal">{t.name}</p>
                  </Pill>
                ))}


                {technical.length === 0 && (
                  <div className="text-sm text-gray-400">No technical skills added.</div>
                )}
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg text-[#43C17A] font-medium">Soft Skills</h4>
            </div>

            <div className="relative rounded-md border border-[#C0C0C0] p-3 min-h-[68px] flex">
              {technical.length > 0 && (
                <button
                  aria-label="Toggle edit soft"
                  onClick={() => setEditSoft((v) => !v)}
                  className={`absolute right-3 cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-full ${editSoft ? "bg-emerald-600 text-white" : "bg-[#43C17A30] text-[#43C17A]"
                    }`}
                  title={editSoft ? "Done editing" : "Edit"}
                >
                  <PencilSimple size={16} weight="bold" />
                </button>
              )}

              <div className="flex flex-wrap items-center">
                {soft.map((s) => (
                  <Pill
                    key={s.skillId}
                    showRemove={editSoft}
                    onRemove={() => removeFrom(s.skillId)}
                  >
                    <p className="text-[#525252] font-normal">{s.name}</p>
                  </Pill>
                ))}


                {soft.length === 0 && (
                  <div className="text-sm text-gray-400">No soft skills added.</div>
                )}
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg text-[#43C17A] font-medium">Tools & Frameworks</h4>
            </div>

            <div className="relative rounded-md border border-[#C0C0C0] p-3 flex items-center">
              {technical.length > 0 && (
                <button
                  aria-label="Toggle edit tools"
                  onClick={() => setEditTools((v) => !v)}
                  className={`absolute right-3 cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-full ${editTools ? "bg-emerald-600 text-white" : "bg-[#43C17A30] text-[#43C17A]"
                    }`}
                  title={editTools ? "Done editing" : "Edit"}
                >
                  <PencilSimple size={16} weight="bold" />
                </button>
              )}
              <div className="flex flex-wrap items-center">
                {tools.map((t) => (
                  <Pill
                    key={t.skillId}
                    showRemove={editTools}
                    onRemove={() => removeFrom(t.skillId)}
                  >
                    <p className="text-[#525252] font-normal">{t.name}</p>
                  </Pill>
                ))}


                {tools.length === 0 && (
                  <div className="text-sm text-gray-400">No tools added.</div>
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
