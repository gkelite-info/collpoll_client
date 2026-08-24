"use client";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { getTopicsBySubjectId } from "@/lib/helpers/faculty/getFacultySubjects";
import { fetchQuizById, saveQuiz } from "@/lib/helpers/quiz/quizAPI";
import { CaretLeftIcon, Clock, X } from "@phosphor-icons/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CustomDropdown } from "@/app/components/CustomDropdown";
import { useFacultyAssignmentsHierarchy } from "@/lib/helpers/faculty/assignment/useFacultyAssignmentsHierarchy";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";

interface FacultyQuizFormProps {
  onCancel: () => void;
  onSaved?: () => void;
}

const todayStr = new Date().toISOString().split("T")[0];

const NativeLikeTimePicker = ({
  hour,
  minute,
  onHourChange,
  onMinuteChange,
}: {
  hour: string;
  minute: string;
  onHourChange: (v: string) => void;
  onMinuteChange: (v: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [selectedParts, setSelectedParts] = useState({ h: false, m: false });
  const triggerRef = useRef<HTMLDivElement>(null);
  const hourScrollRef = useRef<HTMLDivElement>(null);
  const minuteScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      setRect(triggerRef.current.getBoundingClientRect());
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (hourScrollRef.current) {
          const selectedHourEl = hourScrollRef.current.querySelector('.selected-item') as HTMLElement;
          if (selectedHourEl) selectedHourEl.scrollIntoView({ block: 'center' });
        }
        if (minuteScrollRef.current) {
          const selectedMinuteEl = minuteScrollRef.current.querySelector('.selected-item') as HTMLElement;
          if (selectedMinuteEl) selectedMinuteEl.scrollIntoView({ block: 'center' });
        }
      }, 10);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        if (!(e.target as Element).closest(".native-like-time-popover")) {
          setIsOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuHeight = 220;
  const renderAbove = rect ? window.innerHeight - rect.bottom < menuHeight && rect.top > menuHeight : false;

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

  const popover = (
    <AnimatePresence>
      {isOpen && rect && (
        <motion.div
          initial={{ opacity: 0, y: renderAbove ? 10 : -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: renderAbove ? 10 : -10 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{
            position: "fixed",
            top: renderAbove ? undefined : rect.bottom + 6,
            bottom: renderAbove ? (typeof window !== 'undefined' ? window.innerHeight - rect.top + 6 : undefined) : undefined,
            left: rect.left,
            width: "150px",
            zIndex: 999999,
          }}
          className="native-like-time-popover bg-white rounded-lg shadow-[0_4px_20px_rgb(0,0,0,0.15)] border border-gray-200 flex h-[220px] overflow-hidden p-1"
        >
          <div ref={hourScrollRef} className="flex flex-col flex-1 overflow-y-auto custom-scrollbar pr-1">
            {hours.map(h => (
              <div key={h} className="pb-0.5">
                <div 
                  onClick={() => {
                    onHourChange(h);
                    setSelectedParts(prev => {
                      const next = { ...prev, h: true };
                      if (next.h && next.m) setIsOpen(false);
                      return next;
                    });
                  }} 
                  className={`px-2 py-1.5 rounded-md cursor-pointer text-[14px] text-center transition-colors ${hour === h ? "bg-[#1A73E8] text-white selected-item font-semibold shadow-sm" : "hover:bg-gray-100 text-gray-800"}`}
                >
                  {h}
                </div>
              </div>
            ))}
          </div>
          <div className="w-[1px] bg-gray-100 mx-1 my-2"></div>
          <div ref={minuteScrollRef} className="flex flex-col flex-1 overflow-y-auto custom-scrollbar pr-1">
            {minutes.map(m => (
              <div key={m} className="pb-0.5">
                <div 
                  onClick={() => {
                    onMinuteChange(m);
                    setSelectedParts(prev => {
                      const next = { ...prev, m: true };
                      if (next.h && next.m) setIsOpen(false);
                      return next;
                    });
                  }} 
                  className={`px-2 py-1.5 rounded-md cursor-pointer text-[14px] text-center transition-colors ${minute === m ? "bg-[#1A73E8] text-white selected-item font-semibold shadow-sm" : "hover:bg-gray-100 text-gray-800"}`}
                >
                  {m}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="flex-1 relative min-w-[90px]">
      <div ref={triggerRef} onClick={() => { setIsOpen(!isOpen); if (!isOpen) setSelectedParts({ h: false, m: false }); }} className={`flex items-center justify-between gap-1 md:gap-2 border ${isOpen ? "border-[#43C17A]" : "border-gray-200"} rounded-md p-2.5 bg-white cursor-pointer transition-colors hover:border-gray-300 w-full`}>
        <span className="text-[13px] text-[#282828] font-semibold tracking-wide">
          {hour}:{minute}
        </span>
        <Clock size={16} className="text-gray-500 shrink-0" weight="bold" />
      </div>
      {typeof document !== "undefined" ? createPortal(popover, document.body) : popover}
    </div>
  );
};

export default function FacultyQuizForm({ onCancel, onSaved }: FacultyQuizFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { facultyId } = useFaculty();

  const quizId = searchParams.get("quizId");
  const isEditMode = searchParams.get("action") === "editQuiz";

  const { data: hierarchyData = [], isLoading: isLoadingHierarchy } = useFacultyAssignmentsHierarchy(facultyId);

  const [selectedEducationId, setSelectedEducationId] = useState<number | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);

  const [topics, setTopics] = useState<{
    topicTitle: string;
    collegeSubjectUnitId: number;
    collegeSubjectUnitTopicId: number;
  }[]>([]);

  const [quizTitle, setQuizTitle] = useState("");
  const [questionsCount, setQuestionsCount] = useState("");
  const [marksPerQuestion, setMarksPerQuestion] = useState("");
  const [totalMarks, setTotalMarks] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [startHour, setStartHour] = useState("12");
  const [startMinute, setStartMinute] = useState("00");
  const [startAmPm, setStartAmPm] = useState("AM");

  const [endHour, setEndHour] = useState("12");
  const [endMinute, setEndMinute] = useState("00");
  const [endAmPm, setEndAmPm] = useState("AM");

  const [durationMinutes, setDurationMinutes] = useState("");
  const [maxAttempts, setMaxAttempts] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);

  useEffect(() => {
    if (questionsCount !== "" && marksPerQuestion !== "") {
      setTotalMarks(Number(questionsCount) * Number(marksPerQuestion));
    } else {
      setTotalMarks(0);
    }
  }, [questionsCount, marksPerQuestion]);

  useEffect(() => {
    if (!selectedSubjectId) {
      setTopics([]);
      setSelectedTopicId("");
      return;
    }
    getTopicsBySubjectId(selectedSubjectId)
      .then(setTopics)
      .catch(() => toast.error("Failed to fetch topics"));
  }, [selectedSubjectId]);

  useEffect(() => {
    if (!isEditMode || !quizId) return;
    fetchQuizById(Number(quizId))
      .then((data) => {
        if (!data) return;
        setQuizTitle(data.quizTitle);
        setQuestionsCount(String(data.questionsCount));
        setMarksPerQuestion(String(data.marksPerQuestion));
        setStartDate(data.startDate ? data.startDate.split("T")[0] : "");
        setEndDate(data.endDate ? data.endDate.split("T")[0] : "");
        
        if (data.startTime) {
          const [h, m] = data.startTime.split(":");
          let hour = parseInt(h, 10);
          setStartAmPm(hour >= 12 ? "PM" : "AM");
          hour = hour % 12 || 12;
          setStartHour(hour.toString().padStart(2, "0"));
          
          const nearestM = Math.round(parseInt(m || "0", 10) / 5) * 5;
          setStartMinute((nearestM % 60).toString().padStart(2, "0"));
        } else {
          setStartHour("12");
          setStartMinute("00");
          setStartAmPm("AM");
        }
        if (data.endTime) {
          const [h, m] = data.endTime.split(":");
          let hour = parseInt(h, 10);
          setEndAmPm(hour >= 12 ? "PM" : "AM");
          hour = hour % 12 || 12;
          setEndHour(hour.toString().padStart(2, "0"));
          
          const nearestM = Math.round(parseInt(m || "0", 10) / 5) * 5;
          setEndMinute((nearestM % 60).toString().padStart(2, "0"));
        } else {
          setEndHour("12");
          setEndMinute("00");
          setEndAmPm("AM");
        }

        setDurationMinutes(String(data.durationMinutes));
        setMaxAttempts(String(data.maxAttempts));
        
        setSelectedYearId(data.collegeAcademicYearId ?? null);
        setSelectedSubjectId(data.collegeSubjectId ?? null);
        
        if (data.collegeSubjectUnitTopicId) {
          setSelectedTopicId(String(data.collegeSubjectUnitTopicId));
        }
        if (data.collegeSectionsId) {
          setSelectedSectionIds([String(data.collegeSectionsId)]);
        }

        setQuizTitle(data.quizTitle || "");
      })
      .catch(() => toast.error("Failed to load quiz details"));
  }, [quizId, isEditMode]);

  // Auto-fill parent dropdowns in edit mode based on selectedSubjectId
  useEffect(() => {
    if (!isEditMode || hierarchyData.length === 0 || !selectedSubjectId || selectedEducationId) {
      return;
    }

    for (const edu of hierarchyData) {
      for (const branch of edu.branches) {
        for (const year of branch.years) {
          for (const sem of year.semesters) {
            const hasSubject = sem.subjects.some((s: any) => s.collegeSubjectId === selectedSubjectId);
            if (hasSubject) {
              setSelectedEducationId(edu.collegeEducationId);
              setSelectedBranchId(branch.collegeBranchId);
              setSelectedSemesterId(sem.collegeSemesterId);
              return;
            }
          }
        }
      }
    }
  }, [isEditMode, hierarchyData, selectedSubjectId, selectedEducationId]);

  const educations = useMemo(() => {
    return hierarchyData.map(e => ({ value: e.collegeEducationId, label: e.educationType }));
  }, [hierarchyData]);

  const selectedEduNode = useMemo(() => {
    return hierarchyData.find(e => e.collegeEducationId === selectedEducationId);
  }, [hierarchyData, selectedEducationId]);

  const branches = useMemo(() => {
    if (!selectedEduNode) return [];
    return selectedEduNode.branches.map(b => ({ value: b.collegeBranchId, label: b.branchCode }));
  }, [selectedEduNode]);

  const selectedBranchNode = useMemo(() => {
    if (!selectedEduNode) return null;
    return selectedEduNode.branches.find(b => b.collegeBranchId === selectedBranchId);
  }, [selectedEduNode, selectedBranchId]);

  const years = useMemo(() => {
    if (!selectedBranchNode) return [];
    return selectedBranchNode.years.map(y => ({ value: y.collegeAcademicYearId, label: y.yearName }));
  }, [selectedBranchNode]);

  const selectedYearNode = useMemo(() => {
    if (!selectedBranchNode) return null;
    return selectedBranchNode.years.find(y => y.collegeAcademicYearId === selectedYearId);
  }, [selectedBranchNode, selectedYearId]);

  const semesters = useMemo(() => {
    if (!selectedYearNode) return [];
    return selectedYearNode.semesters.map(s => ({ value: s.collegeSemesterId, label: s.semesterName }));
  }, [selectedYearNode]);

  const selectedSemNode = useMemo(() => {
    if (!selectedYearNode) return null;
    return selectedYearNode.semesters.find(s => s.collegeSemesterId === selectedSemesterId);
  }, [selectedYearNode, selectedSemesterId]);

  const subjects = useMemo(() => {
    if (!selectedSemNode) return [];
    return selectedSemNode.subjects.map(s => ({ value: s.collegeSubjectId, label: s.subjectName }));
  }, [selectedSemNode]);

  const selectedSubNode = useMemo(() => {
    if (!selectedSemNode) return null;
    return selectedSemNode.subjects.find(s => s.collegeSubjectId === selectedSubjectId);
  }, [selectedSemNode, selectedSubjectId]);

  const sectionsOptions = useMemo(() => {
    if (!selectedSubNode) return [];
    return selectedSubNode.sections.map(s => ({ value: s.collegeSectionsId, label: s.sectionName }));
  }, [selectedSubNode]);

  useEffect(() => {
    if (!isEditMode && educations.length === 1 && !selectedEducationId) {
      setSelectedEducationId(educations[0].value as number);
    }
  }, [educations, selectedEducationId, isEditMode]);

  useEffect(() => {
    if (!isEditMode && branches.length === 1 && !selectedBranchId) {
      setSelectedBranchId(branches[0].value as number);
    }
  }, [branches, selectedBranchId, isEditMode]);

  useEffect(() => {
    if (!isEditMode && years.length === 1 && !selectedYearId) {
      setSelectedYearId(years[0].value as number);
    }
  }, [years, selectedYearId, isEditMode]);

  useEffect(() => {
    if (!isEditMode && semesters.length === 1 && !selectedSemesterId) {
      setSelectedSemesterId(semesters[0].value as number);
    }
  }, [semesters, selectedSemesterId, isEditMode]);

  useEffect(() => {
    if (!isEditMode && subjects.length === 1 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0].value as number);
    }
  }, [subjects, selectedSubjectId, isEditMode]);

  useEffect(() => {
    if (!isEditMode && topics.length === 1 && !selectedTopicId) {
      setSelectedTopicId(String(topics[0].collegeSubjectUnitTopicId));
    }
  }, [topics, selectedTopicId, isEditMode]);

  const ampmOptions = useMemo(() => [{ value: "AM", label: "AM" }, { value: "PM", label: "PM" }], []);

  const handleEducationChange = (val: string | number) => {
    setSelectedEducationId(val as number);
    setSelectedBranchId(null);
    setSelectedYearId(null);
    setSelectedSemesterId(null);
    setSelectedSubjectId(null);
    setSelectedTopicId("");
    setSelectedSectionIds([]);
  };
  
  const handleBranchChange = (val: string | number) => {
    setSelectedBranchId(val as number);
    setSelectedYearId(null);
    setSelectedSemesterId(null);
    setSelectedSubjectId(null);
    setSelectedTopicId("");
    setSelectedSectionIds([]);
  };

  const handleYearChange = (val: string | number) => {
    setSelectedYearId(val as number);
    setSelectedSemesterId(null);
    setSelectedSubjectId(null);
    setSelectedTopicId("");
    setSelectedSectionIds([]);
  };

  const handleSemesterChange = (val: string | number) => {
    setSelectedSemesterId(val as number);
    setSelectedSubjectId(null);
    setSelectedTopicId("");
    setSelectedSectionIds([]);
  };

  const handleSubjectChange = (val: string | number) => {
    setSelectedSubjectId(val as number);
    setSelectedTopicId("");
    setSelectedSectionIds([]);
  };

  const isSchool = selectedEduNode ? isSchoolEducation(selectedEduNode.educationType) : false;
  const isInter = selectedEduNode ? selectedEduNode.educationType.toUpperCase() === "INTER" || selectedEduNode.educationType.toUpperCase() === "INTERMEDIATE" : false;



  const get24HourTime = (h: string, m: string, ampm: string) => {
    let hour = parseInt(h || "12", 10);
    if (ampm === "PM" && hour !== 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, "0")}:${(m || "00").padStart(2, "0")}:00`;
  };

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    if (endDate && val > endDate) {
      setEndDate(val);
    }
  };

  const handleEndDateChange = (val: string) => {
    if (startDate && val < startDate) {
      toast.error("End date cannot be earlier than start date");
      setEndDate(startDate);
    } else {
      setEndDate(val);
    }
  };

  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (payload: { status: "Draft" | "Active" }) => {
      if (!quizTitle.trim()) throw new Error("Quiz title is required");
      if (!selectedEducationId) throw new Error("Education is required");
      if (!selectedYearId) throw new Error("Academic Year is required");
      if (!selectedSubjectId) throw new Error("Subject is required");
      if (selectedSectionIds.length === 0) throw new Error("At least one section is required");

      if (payload.status === "Active") {
        if (!selectedTopicId) throw new Error("Topic is required");
        if (!questionsCount || Number(questionsCount) < 1) throw new Error("Valid No. of Questions is required");
        if (!marksPerQuestion || Number(marksPerQuestion) < 1) throw new Error("Valid Marks per Qtn is required");
        if (!durationMinutes || Number(durationMinutes) < 1) throw new Error("Valid Duration is required");
        if (!startDate || !endDate) throw new Error("Dates are required");
      }
      
      const finalStartTime = startHour && startMinute ? get24HourTime(startHour, startMinute, startAmPm) : undefined;
      const finalEndTime = endHour && endMinute ? get24HourTime(endHour, endMinute, endAmPm) : undefined;
      
      if (payload.status === "Active") {
        const startDateTime = new Date(`${startDate}T${finalStartTime}`);
        const endDateTime = new Date(`${endDate}T${finalEndTime}`);
        if (endDateTime <= startDateTime) throw new Error("End date and time must be after start date and time");
      }

      if (!facultyId) throw new Error("Faculty not found");

      const selectedTopicObj = selectedTopicId 
        ? topics.find((t) => t.collegeSubjectUnitTopicId === Number(selectedTopicId))
        : undefined;
        
      if (!selectedTopicObj && payload.status === "Active") {
        throw new Error("Invalid topic selected.");
      }

      const promises = selectedSectionIds.map((sectionId, index) => {
        const currentQuizId = (isEditMode && quizId && index === 0) ? Number(quizId) : undefined;
        return saveQuiz({
          quizId: currentQuizId,
          facultyId,
          collegeEducationId: selectedEducationId,
          collegeBranchId: selectedBranchId,
          collegeSemesterId: selectedSemesterId,
          collegeSubjectId: selectedSubjectId,
          collegeAcademicYearId: selectedYearId,
          collegeSectionsId: Number(sectionId),
          collegeSubjectUnitId: selectedTopicObj?.collegeSubjectUnitId || null,
          collegeSubjectUnitTopicId: selectedTopicObj?.collegeSubjectUnitTopicId || null,
          quizTitle: quizTitle.trim(),
          totalMarks: totalMarks || null,
          questionsCount: questionsCount ? Number(questionsCount) : null,
          marksPerQuestion: marksPerQuestion ? Number(marksPerQuestion) : null,
          startTime: finalStartTime || null,
          endTime: finalEndTime || null,
          durationMinutes: durationMinutes ? Number(durationMinutes) : null,
          startDate: startDate || null,
          endDate: endDate || null,
          maxAttempts: Number(maxAttempts) || null,
          status: payload.status,
        });
      });

      const results = await Promise.all(promises);
      const failed = results.find(r => !r.success);
      if (failed) throw new Error("Failed to save one or more sections");
      return results;
    },
    onSuccess: (results, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quizzes", facultyId] });
      toast.success(variables.status === "Active" ? "Details saved!" : "Quiz saved as draft!");
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", "quiz");
      params.set("quizView", variables.status === "Draft" ? "drafts" : "active");
      
      if (results && results.length > 0 && results[0].quizId) {
        params.set("action", "addQuestions");
        params.set("quizId", String(results[0].quizId));
      }
      
      router.push(`${pathname}?${params.toString()}`);
    },
    onError: (err: any) => {
      let msg = err?.message || "Something went wrong";
      if (msg.includes("duplicate key") || msg.includes("UniqueViolation")) {
        msg = "This quiz already exists or a conflict occurred.";
      } else if (msg.includes("violates not-null constraint") || msg.includes("NotNullViolation")) {
        msg = "Some required fields are missing.";
      } else if (msg.includes("JSON") || msg.includes("Unexpected token")) {
        msg = "An unexpected error occurred while saving.";
      } else if (msg.length > 50) {
        msg = "Failed to save quiz details. Please try again.";
      }
      toast.error(msg);
    },
    onSettled: () => {
      setIsSaving(false);
      setIsDraftSaving(false);
    }
  });

  const handleSave = async (status: "Draft" | "Active") => {
    setIsSaving(status === "Active");
    setIsDraftSaving(status === "Draft");
    saveMutation.mutate({ status });
  };

  const isDraftValid = Boolean(
    quizTitle.trim() &&
    selectedEducationId &&
    selectedYearId &&
    selectedSubjectId &&
    selectedSectionIds.length > 0
  );

  const isActiveValid = Boolean(
    isDraftValid &&
    selectedTopicId &&
    questionsCount && Number(questionsCount) >= 1 &&
    marksPerQuestion && Number(marksPerQuestion) >= 1 &&
    durationMinutes && Number(durationMinutes) >= 1 &&
    startDate && endDate
  );

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center lg:mb-1">
          <CaretLeftIcon size={22} weight="bold" className="text-[#282828] cursor-pointer active:scale-90" onClick={onCancel} />
          <h1 className="font-bold text-2xl text-[#282828] ml-2">{isEditMode ? "Edit Quiz" : "Create New Quiz"}</h1>
        </div>
        <p className="text-[#282828] text-sm lg:ml-8">Set up the timing and scoring for your quiz.</p>
      </div>

      <div className="bg-white rounded-md p-4 flex flex-col gap-4 flex-1 overflow-y-auto border border-gray-100">
        
        {/* Quiz Title */}
        <div className="flex flex-col gap-1 w-full">
          <label className="text-sm font-bold text-[#282828]">Quiz Title <span className="text-red-500">*</span></label>
          <input type="text" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} placeholder="e.g. Unit 1 Assessment" className="border border-gray-200 rounded-md p-2.5 text-[13px] outline-none focus:border-[#43C17A] text-[#282828]" />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomDropdown
            label="Education *"
            value={selectedEducationId ?? ""}
            options={educations}
            onChange={handleEducationChange}
            placeholder="Select Education"
            disabled={educations.length <= 1}
          />
          
          {(!isSchool) && (
            <CustomDropdown
              label={isInter ? "Group *" : "Branch *"}
              value={selectedBranchId ?? ""}
              options={branches}
              onChange={handleBranchChange}
              placeholder={isInter ? "Select Group" : "Select Branch"}
              disabled={!selectedEducationId || branches.length <= 1}
            />
          )}

          <CustomDropdown
            label="Academic Year *"
            value={selectedYearId ?? ""}
            options={years}
            onChange={handleYearChange}
            placeholder="Select Year"
            disabled={(!isSchool && !selectedBranchId) || (isSchool && !selectedEducationId) || years.length <= 1}
          />

          {(!isSchool && !isInter) && (
             <CustomDropdown
               label="Semester *"
               value={selectedSemesterId ?? ""}
               options={semesters}
               onChange={handleSemesterChange}
               placeholder="Select Semester"
               disabled={!selectedYearId || semesters.length <= 1}
             />
          )}

          <CustomDropdown
            label="Subject *"
            value={selectedSubjectId ?? ""}
            options={subjects}
            onChange={handleSubjectChange}
            placeholder="Select Subject"
            disabled={((!isSchool && !isInter && !selectedSemesterId) || ((isSchool || isInter) && !selectedYearId)) || subjects.length <= 1}
          />

          <CustomDropdown
            label="Topic *"
            value={selectedTopicId}
            options={topics.map(t => ({ value: String(t.collegeSubjectUnitTopicId), label: t.topicTitle }))}
            onChange={(val) => setSelectedTopicId(String(val))}
            placeholder="Select Topic"
            disabled={!selectedSubjectId || topics.length <= 1}
          />
          
          <div className="flex flex-col gap-1 w-full">
            <CustomDropdown
              label="Section *"
              options={sectionsOptions}
              value=""
              selectedValues={selectedSectionIds}
              isMultiSelect={true}
              onChange={(val) => {
                const strVal = String(val);
                setSelectedSectionIds(prev => 
                  prev.includes(strVal) ? prev.filter(v => v !== strVal) : [...prev, strVal]
                );
              }}
              placeholder="Select Section(s)"
              disabled={!selectedSubjectId}
            />
            
            {selectedSectionIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1.5">
                {selectedSectionIds.map(id => {
                  const sec = sectionsOptions.find(s => String(s.value) === id);
                  return (
                    <div key={id} className="flex items-center gap-1.5 bg-[#43C17A]/10 text-[#43C17A] px-2.5 py-1 rounded-md text-[13px] font-semibold border border-[#43C17A]/20">
                      {sec?.label || id}
                      <button 
                        type="button" 
                        onClick={() => setSelectedSectionIds(prev => prev.filter(v => v !== id))} 
                        className="text-[#43C17A] hover:text-red-500 hover:bg-red-50 p-0.5 rounded transition-colors cursor-pointer"
                      >
                        <X size={12} weight="bold" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 bg-gray-50 p-3 rounded-lg">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">No. of Questions <span className="text-red-500">*</span></label>
            <input type="number" value={questionsCount} onWheel={(e) => e.currentTarget.blur()} onChange={(e) => setQuestionsCount(e.target.value)} min="1" className="border border-gray-200 rounded-md p-2 text-sm outline-none focus:border-[#43C17A] text-[#282828]" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">Marks per Qtn <span className="text-red-500">*</span></label>
            <input type="number" value={marksPerQuestion} onWheel={(e) => e.currentTarget.blur()} onChange={(e) => setMarksPerQuestion(e.target.value)} min="1" className="border border-gray-200 rounded-md p-2 text-sm outline-none focus:border-[#43C17A] text-[#282828]" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500">Total Marks</label>
            <div className="p-2 text-sm font-bold text-[#43C17A] bg-gray-100 border border-gray-200 rounded-md text-center cursor-not-allowed select-none">{totalMarks}</div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 w-full">
          <div className="flex flex-col gap-1 w-full lg:w-[120px] shrink-0">
            <label className="text-sm font-bold text-[#282828] whitespace-nowrap">Duration (Mins) <span className="text-red-500">*</span></label>
            <input type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} min="1" className="border border-gray-200 rounded-md p-2.5 text-[13px] outline-none focus:border-[#43C17A] text-[#282828] w-full" />
          </div>
          <div className="flex flex-col gap-1 w-full lg:w-[120px] shrink-0">
            <label className="text-sm font-bold text-[#282828] whitespace-nowrap">Max Attempts</label>
            <input type="number" value={maxAttempts} onChange={(e) => setMaxAttempts(e.target.value)} min="1" className="border border-gray-200 rounded-md p-2.5 text-[13px] outline-none focus:border-[#43C17A] text-[#282828] w-full" />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
            <label className="text-sm font-bold text-[#282828] whitespace-nowrap">Start Time <span className="text-red-500">*</span></label>
            <div className="flex items-center gap-2">
              <NativeLikeTimePicker 
                hour={startHour} 
                minute={startMinute} 
                onHourChange={setStartHour} 
                onMinuteChange={setStartMinute} 
              />
              <div className="w-[75px] shrink-0">
                <CustomDropdown 
                  options={ampmOptions} 
                  value={startAmPm} 
                  onChange={(val) => setStartAmPm(String(val))} 
                  hideCheckmark
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
            <label className="text-sm font-bold text-[#282828] whitespace-nowrap">End Time <span className="text-red-500">*</span></label>
            <div className="flex items-center gap-2">
              <NativeLikeTimePicker 
                hour={endHour} 
                minute={endMinute} 
                onHourChange={setEndHour} 
                onMinuteChange={setEndMinute} 
              />
              <div className="w-[75px] shrink-0">
                <CustomDropdown 
                  options={ampmOptions} 
                  value={endAmPm} 
                  onChange={(val) => setEndAmPm(String(val))} 
                  hideCheckmark
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#282828]">Start Date <span className="text-red-500">*</span></label>
            <input type="date" value={startDate} min={isEditMode ? undefined : todayStr} onChange={(e) => handleStartDateChange(e.target.value)} className="border border-gray-200 rounded-md p-2.5 text-[13px] outline-none focus:border-[#43C17A] text-[#282828]" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-[#282828]">End Date <span className="text-red-500">*</span></label>
            <input type="date" value={endDate} min={startDate || todayStr} onChange={(e) => handleEndDateChange(e.target.value)} className="border border-gray-200 rounded-md p-2.5 text-[13px] outline-none focus:border-[#43C17A] text-[#282828]" />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <button onClick={onCancel} disabled={isSaving || isDraftSaving} className="px-6 py-2 rounded-md border border-[#16284F] text-[#16284F] text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
          <div className="flex items-center gap-3">
            <button onClick={() => handleSave("Draft")} disabled={isDraftSaving || isSaving || !isDraftValid} className={`px-6 py-2 rounded-md bg-[#16284F] text-white text-sm font-medium transition-colors ${isDraftSaving || isSaving || !isDraftValid ? "opacity-50 cursor-not-allowed" : "hover:bg-[#102040] cursor-pointer"}`}>
              {isDraftSaving ? "Saving..." : "Save Draft"}
            </button>
            <button onClick={() => handleSave("Active")} disabled={isSaving || isDraftSaving || !isActiveValid} className={`px-6 py-2 rounded-md bg-[#43C17A] text-white text-sm font-medium flex items-center gap-2 transition-colors ${isSaving || isDraftSaving || !isActiveValid ? "opacity-50 cursor-not-allowed" : "hover:bg-[#35a868] cursor-pointer"}`}>
              {isSaving ? "Saving..." : <>Save & Add Questions <span className="text-lg">›</span></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}