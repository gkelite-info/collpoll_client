import { MagnifyingGlass } from "@phosphor-icons/react";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import Field from "./Field";
import { insertProjectDetails } from "@/lib/helpers/profile/projectAPI";
import { supabase } from "@/lib/supabaseClient";

export interface ProjectData {
  projectName: string;
  domain: string;
  startDate: string;
  endDate: string;
  tools: string[];
  projectLink: string;
  description: string;
  isSubmitted: boolean;
}

interface Props {
  index: number;
  data: ProjectData;
  onUpdate: (data: ProjectData) => void;
}

const TOOL_OPTIONS = [
  "React",
  "Next.js",
  "Node.js",
  "Express",
  "MongoDB",
  "MySQL",
  "PostgreSQL",
  "Python",
  "OpenCV",
  "Tailwind CSS",
  "TypeScript",
  "AWS",
];

export default function ProjectItem({ index, data, onUpdate }: Props) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // const user = supabase.auth.getUser();
  // const studentId = user?.id;
  const studentId = 1;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredTools = TOOL_OPTIONS.filter(
    (tool) =>
      tool.toLowerCase().includes(search.toLowerCase()) &&
      !data.tools.includes(tool)
  );

  const handleSubmit = async () => {
    if (
      !data.projectName.trim() ||
      !data.domain.trim() ||
      !data.description.trim()
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      await insertProjectDetails({
        studentId: studentId,
        projectName: data.projectName,
        domain: data.domain,
        startDate: data.startDate,
        endDate: data.endDate,
        toolsAndTechnologies: data.tools,
        projectUrl: data.projectLink,
        description: data.description,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      onUpdate({ ...data, isSubmitted: true });
      toast.success(`Project ${index + 1} submitted successfully`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit project");
    }
  };

  return (
    <div className="mb-12">
      <h3 className="font-medium text-[#282828] mb-4">Project {index + 1}</h3>

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Project Name"
          type="text"
          value={data.projectName}
          placeholder="Enter Project Name"
          onChange={(v) => onUpdate({ ...data, projectName: v })}
        />
        <Field
          label="Domain"
          type="text"
          value={data.domain}
          placeholder="Enter Domain"
          onChange={(v) => onUpdate({ ...data, domain: v })}
        />
        <Field
          label="Start Date"
          type="date"
          value={data.startDate}
          placeholder="DD/MM/YYYY"
          onChange={(v) => onUpdate({ ...data, startDate: v })}
        />
        <Field
          label="End Date"
          type="date"
          value={data.endDate}
          placeholder="DD/MM/YYYY"
          onChange={(v) => onUpdate({ ...data, endDate: v })}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <div className="flex flex-col relative" ref={containerRef}>
          <label className="form-label font-medium text-[#282828]">
            Tools & Technologies Used
          </label>

          <div
            className="flex items-center gap-2 border border-[#CCCCCC] rounded-md px-2 py-1 min-h-[40px] overflow-x-auto cursor-text"
            onClick={() => setOpen(true)}
          >
            <span className="text-gray-400">
              <MagnifyingGlass size={20} />
            </span>

            <div className="flex gap-2 flex-nowrap">
              {data.tools.map((tool) => (
                <span
                  key={tool}
                  className="flex items-center gap-1 px-3 py-1 rounded-full border text-sm text-[#525252] whitespace-nowrap"
                >
                  {tool}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdate({
                        ...data,
                        tools: data.tools.filter((t) => t !== tool),
                      });
                    }}
                    className="text-[#525252] hover:text-black"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>

            <input
              className="flex-1 outline-none text-sm min-w-[60px]"
              placeholder={data.tools.length ? "" : "Search technologies"}
              onFocus={() => setOpen(true)}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {open && (
            <div className="absolute left-0 top-full mt-1 w-full bg-white border border-[#CCCCCC] rounded-md shadow z-20">
              <div className="max-h-48 overflow-auto">
                {filteredTools.length === 0 && (
                  <p className="px-3 py-2 text-sm text-gray-400">
                    No results found
                  </p>
                )}

                {filteredTools.map((tool) => (
                  <div
                    key={tool}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      onUpdate({
                        ...data,
                        tools: [...data.tools, tool],
                      });
                      setSearch("");
                    }}
                  >
                    {tool}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Field
          label="Project Link / GitHub"
          type="text"
          value={data.projectLink}
          placeholder="Enter Project Link"
          onChange={(v) => onUpdate({ ...data, projectLink: v })}
        />
      </div>

      <div className="mt-4 flex flex-col">
        <label className="form-label font-medium text-[#282828]">
          Short Description
        </label>
        <textarea
          rows={4}
          maxLength={500}
          className="border border-[#CCCCCC] rounded-md px-3 py-1 focus:outline-none resize-none"
          value={data.description}
          onChange={(e) => onUpdate({ ...data, description: e.target.value })}
        />
        <div className="text-right text-xs text-gray-400">
          {data.description.length}/500
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button
          disabled={data.isSubmitted}
          onClick={handleSubmit}
          className={`px-6 py-1.5 cursor-pointer rounded-md text-sm font-medium text-white bg-[#43C17A] ${
            data.isSubmitted ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {data.isSubmitted ? "Submitted" : "Submit Project"}
        </button>
      </div>
    </div>
  );
}
