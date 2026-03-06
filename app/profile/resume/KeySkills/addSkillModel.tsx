import { motion, AnimatePresence } from "framer-motion";
import { X } from "@phosphor-icons/react";
import { useRef, useState } from "react";
type AddModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (section: "technical" | "soft" | "tools", value: string) => void;
  defaultSection?: "technical" | "soft" | "tools";
};

export default function AddSkillModal({ isOpen, onClose, onAdd, defaultSection = "technical" }: AddModalProps) {
  const [section, setSection] = useState<"technical" | "soft" | "tools">(defaultSection);
  const [value, setValue] = useState("");
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const handleAdd = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(section, trimmed);
    setValue("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          
          <motion.div
            className="absolute inset-0 bg-black/40"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            ref={dialogRef}
            className="relative z-10 w-full max-w-md mx-4 bg-white rounded-lg shadow-lg p-6"
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-800">Add Skill</h3>
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-600 hover:bg-gray-100"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-black">
              <label className="block text-sm text-gray-600">Select section</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value as any)}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="technical">Technical Skills</option>
                <option value="soft">Soft Skills</option>
                <option value="tools">Tools & Frameworks</option>
              </select>

              <div>
                <label className="block text-sm text-gray-600">Skill name</label>
                <input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  type="text"
                  placeholder="e.g. Next.js"
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  onClick={onClose}
                  type="button"
                  className="px-3 py-2 rounded border text-sm"
                >
                  Cancel
                </button>

                <button
                  onClick={handleAdd}
                  type="button"
                  className="px-3 py-2 rounded bg-emerald-500 text-white text-sm"
                >
                  Add Skill
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}