"use client";

import { useEffect, useState } from "react";

import { PencilSimple } from "@phosphor-icons/react";
import Pill from "./Pill";
import { useRouter } from "next/navigation";
import AddSkillModal from "./addSkillModel";
import toast from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";
import {
  createUserSkill,
  fetchUserSkills,
  deleteUserSkill,
} from "@/lib/helpers/profile/profileKeyskills";
import ProfileSkillsShimmer from "../shimmers/ProfileSkillsShimmer";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";

type Skill = { skillId: number; name: string };

export default function ProfileKeySkillsWithModal() {
  const [technical, setTechnical] = useState<Skill[]>([]);
  const [soft, setSoft] = useState<Skill[]>([]);
  const [tools, setTools] = useState<Skill[]>([]);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [editTechnical, setEditTechnical] = useState(false);
  const [editSoft, setEditSoft] = useState(false);
  const [editTools, setEditTools] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  const router = useRouter();
  const { userId } = useUser();

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetchUserSkills(userId)
      .then((data) => {
        setTechnical(data.filter((d) => d.category === "Technical Skills"));
        setSoft(data.filter((d) => d.category === "Soft Skills"));
        setTools(data.filter((d) => d.category === "Tools & Frameworks"));
      })
      .catch(() => {
        toast.error("Failed to load skills");
      })
      .finally(() => setLoading(false))
      ;
  }, [userId]);


  const removeFrom = async (skillId: number) => {
    if (!userId) return toast.error("User not loaded");
    try {
      setRemoving(true);
      await deleteUserSkill(userId, skillId);
      setTechnical((s) => s.filter((x) => x.skillId !== skillId));
      setSoft((s) => s.filter((x) => x.skillId !== skillId));
      setTools((s) => s.filter((x) => x.skillId !== skillId));
      toast.success("Skill removed successfully");
    } catch (err: any) {
      toast.error("Failed to remove skill");
    } finally {
      setRemoving(false);
    }
  };

  const handleAdd = async (
    section: "technical" | "soft" | "tools",
    value: string
  ): Promise<boolean> => {
    if (!userId) {
      toast.error("User not loaded");
      return false;
    }
    try {
      setSaving(true);
      const newSkill = await createUserSkill(userId, section, value);
      if (section === "technical")
        setTechnical((prev) =>
          prev.some((s) => s.skillId === newSkill.skillId)
            ? prev
            : [...prev, newSkill]
        );

      if (section === "soft")
        setSoft((prev) =>
          prev.some((s) => s.skillId === newSkill.skillId)
            ? prev
            : [...prev, newSkill]
        );

      if (section === "tools")
        setTools((prev) =>
          prev.some((s) => s.skillId === newSkill.skillId)
            ? prev
            : [...prev, newSkill]
        );

      toast.success("Skill added successfully");
      return true;
    } catch (err: any) {
      toast.error("Failed to add skill");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (skillId: number) => {
    setSelectedSkillId(skillId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userId || !selectedSkillId) return;

    try {
      setRemoving(true);
      await deleteUserSkill(userId, selectedSkillId);
      setTechnical((s) => s.filter((x) => x.skillId !== selectedSkillId));
      setSoft((s) => s.filter((x) => x.skillId !== selectedSkillId));
      setTools((s) => s.filter((x) => x.skillId !== selectedSkillId));
      toast.success("Skill removed successfully");
      setDeleteModalOpen(false);
      setSelectedSkillId(null);
    } catch {
      toast.error("Failed to remove skill");
    } finally {
      setRemoving(false);
    }
  };

  if (loading) {
    return <ProfileSkillsShimmer />;
  }

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
    ${saving ? "opacity-50 cursor-not-allowed" : "bg-[#43C17A] cursor-pointer text-white"}`}
            >
              {saving ? "Saving..." : "Add +"}
            </button>

            <button
              onClick={() => router.push('/profile?profile=languages&Step=4')}
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

            <div className="relative rounded-md border border-[#C0C0C0] p-3 pr-12 flex items-center">
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
                    onRemove={() => handleDeleteClick(t.skillId)}
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

            <div className="relative rounded-md border border-[#C0C0C0] p-3 pr-12 min-h-[68px] flex">
              {soft.length > 0 && (
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

            <div className="relative rounded-md border border-[#C0C0C0] p-3 pr-12 flex items-center">
              {tools.length > 0 && (
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
                    onRemove={() => handleDeleteClick(t.skillId)}
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
        isLoading={saving}
        defaultSection="technical"
      />

      <ConfirmDeleteModal
        open={deleteModalOpen}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedSkillId(null);
        }}
        onConfirm={confirmDelete}
        isDeleting={removing}
        name="skill"
      />
    </div>
  );
}
