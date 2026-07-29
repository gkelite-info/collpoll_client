"use client";

import React, { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { X } from "@phosphor-icons/react";
import { useUser } from "@/app/utils/context/UserContext";
import type { CalendarEventPayload } from "../page";
import { useAddEventModalState } from "../hooks/useAddEventModalState";
import { useAddEventModalData } from "../hooks/useAddEventModalData";

import TypeAndModeFields from "./AddEventFields/TypeAndModeFields";
import AcademicFields from "./AddEventFields/AcademicFields";
import SubjectTopicFields from "./AddEventFields/SubjectTopicFields";
import MeetingFields from "./AddEventFields/MeetingFields";
import DateTimeRoomFields from "./AddEventFields/DateTimeRoomFields";
import SectionFields from "./AddEventFields/SectionFields";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: any | null;
  isSaving?: boolean;
  onSave: (eventData: CalendarEventPayload) => Promise<{ success: boolean }>;
  initialData?: any | null;
  mode: "create" | "edit";
  degreeOptions?: any[]; // Not needed now with react-query but keeping for compatibility
}

const INPUT_HEIGHT = "h-[44px]";

const AddEventModalV2: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  value,
  isSaving = false,
  mode,
}) => {
  const { userId, collegeId } = useUser();
  
  const state = useAddEventModalState(isOpen, value, mode);
  const data = useAddEventModalData(
    userId, 
    collegeId, 
    state.educationId, 
    state.branchId, 
    state.academicYearId, 
    state.semester,
    state.subjectId
  );

  const modalContentRef = useRef<HTMLDivElement>(null);
  const isEditMode = mode === "edit";
  const TODAY = new Date().toISOString().split("T")[0];

  // Auto-fill logic for dropdowns if there's only one option available (or single subject)
  useEffect(() => {
    if (!data.facultyCtx) return;

    if (data.isSingleSubject) {
      // Single subject: lock everything to the first available option
      if (data.educations.length === 1 && !state.educationId) state.setEducationId(data.educations[0].collegeEducationId);
      if (data.branches.length === 1 && !state.branchId) state.setBranchId(data.branches[0].collegeBranchId);
      if (data.academicYears.length === 1 && !state.academicYearId) state.setAcademicYearId(data.academicYears[0].collegeAcademicYearId);
    } else {
      // Multi-subject: auto-select ONLY if there's strictly 1 option in the dropdown list
      if (data.educations.length === 1 && !state.educationId) state.setEducationId(data.educations[0].collegeEducationId);
      if (state.educationId && data.branches.length === 1 && !state.branchId) state.setBranchId(data.branches[0].collegeBranchId);
      if (state.educationId && data.academicYears.length === 1 && !state.academicYearId) state.setAcademicYearId(data.academicYears[0].collegeAcademicYearId);
    }

    // Auto-select subject if exactly 1 is available (works for both single and multi-subject after filtering)
    if (data.subjects.length === 1 && !state.subjectId) {
      state.setSubjectId(data.subjects[0].collegeSubjectId);
      state.setSubject(data.subjects[0].subjectName);
    }
  }, [
    data.facultyCtx,
    data.isSingleSubject,
    data.educations,
    data.branches,
    data.academicYears,
    data.subjects,
    state.educationId,
    state.branchId,
    state.academicYearId,
    state.subjectId,
    state.setEducationId,
    state.setBranchId,
    state.setAcademicYearId,
    state.setSubjectId,
    state.setSubject
  ]);

  useEffect(() => {
    if (!state.semester) {
      // 1. If only one semester exists in the dropdown, select it
      if (data.semesters.length === 1) {
        state.setSemester(data.semesters[0].collegeSemesterId);
        state.setIsSemesterAuto(true);
        return;
      }
      
      // 2. If all fetched subjects belong to the exact same semester, auto-select it!
      if (data.subjects.length > 0) {
        const uniqueSemesters = Array.from(new Set(data.subjects.map((s: any) => s.collegeSemesterId).filter(Boolean)));
        if (uniqueSemesters.length === 1) {
          state.setSemester(uniqueSemesters[0] as number);
          state.setIsSemesterAuto(true);
        }
      }
    }
  }, [data.semesters, data.subjects, state.semester, state.setSemester, state.setIsSemesterAuto]);

  useEffect(() => {
    if (!data.isSectionsFetching) {
      // Clear out any selected section IDs that are no longer valid for the current dropdowns
      const validSectionIds = state.sectionIds.filter((id) =>
        data.sections.some((s) => s.collegeSectionsId === id)
      );
      if (validSectionIds.length !== state.sectionIds.length) {
        state.setSectionIds(validSectionIds);
      } else if (data.sections.length === 1 && state.sectionIds.length === 0) {
        // Auto-select if there is exactly 1 valid section available
        state.setSectionIds([data.sections[0].collegeSectionsId]);
      }
    }
  }, [data.sections, data.isSectionsFetching, state.sectionIds, state.setSectionIds]);

  const to24Hour = (hour: string, minute: string, period: "AM" | "PM") => {
    let h = parseInt(hour, 10);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${minute}`;
  };

  const validateTimeRange = () => {
    const startTime = to24Hour(state.startHour, state.startMinute, state.startPeriod);
    const endTime = to24Hour(state.endHour, state.endMinute, state.endPeriod);

    if (startTime === endTime) {
      toast.error("Start and End time cannot be the same");
      return false;
    }

    if (endTime < startTime) {
      toast.error("End time must be after start time");
      return false;
    }

    if (startTime < "08:00" || endTime > "22:00") {
      toast.error("Events must be between 08:00 AM and 10:00 PM");
      return false;
    }
    return true;
  };

  const isValidMeetingLink = (url: string) => {
    try {
      const parsed = new URL(url);
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    // 1. Academic Fields Validation
    if (!state.educationId) {
      toast.error("Please provide an Education Type");
      return;
    }
    if (state.faculty_edu_type !== "Inter" && !state.branchId) {
      toast.error("Please provide a Branch");
      return;
    }
    if (!state.academicYearId) {
      toast.error("Please provide a Year");
      return;
    }
    if (state.faculty_edu_type !== "Inter" && !state.semester) {
      toast.error("Please select a Semester");
      return;
    }

    // 2. Subject Validation
    if (!state.subjectId) {
      toast.error("Please select a Subject");
      return;
    }

    // 3. Topic & Unit Validation
    if (state.calendarMode === "single" && !state.topicId && state.selectedType !== "meeting") {
      toast.error("Please select a Topic");
      return;
    }
    if (state.calendarMode === "bulk" && state.unitIds.length === 0 && state.selectedType !== "meeting") {
      toast.error("Please select at least one Unit");
      return;
    }

    // 4. Meeting Validations
    if (state.selectedType === "meeting") {
      if (!state.title.trim()) {
        toast.error("Please enter meeting title");
        return;
      }
      if (state.meetingPlatform === "zoom") {
        if (!state.meetingId.trim()) {
          toast.error("Please enter Zoom Meeting ID");
          return;
        }
        if (!state.meetingPassword.trim()) {
          toast.error("Please enter Meeting Password");
          return;
        }
      } else if (state.meetingPlatform === "meet") {
        if (!state.meetingLink.trim()) {
          toast.error("Please enter Google Meet Link");
          return;
        }
        if (!state.meetingLink.includes("meet.google.com")) {
          toast.error("Please enter a valid Google Meet link");
          return;
        }
      } else if (state.meetingPlatform === "others") {
        if (!state.meetingLink.trim()) {
          toast.error("Please enter Meeting Link");
          return;
        }
        if (!isValidMeetingLink(state.meetingLink.trim())) {
          toast.error("Please enter a valid meeting link");
          return;
        }
      }
    }

    // 5. Date Validations
    if (state.calendarMode === "single") {
      if (!state.date) {
        toast.error("Please select date");
        return;
      }
      if (state.date < TODAY) {
        toast.error("Past dates are not allowed");
        return;
      }
    } else {
      if (!state.fromDate || !state.toDate) {
        toast.error("Please select both from and to dates");
        return;
      }
      if (state.fromDate > state.toDate) {
        toast.error("To Date must be after From Date");
        return;
      }
      if (state.fromDate < TODAY) {
        toast.error("Past dates are not allowed");
        return;
      }
    }

    // 6. Time & Room & Section Validations
    if (!validateTimeRange()) return;

    if (state.selectedType === "class" && !state.roomNo.trim()) {
      toast.error("Please select a Room No.");
      return;
    }
    if (!state.sectionIds.length) {
      toast.error("Please select at least one section.");
      return;
    }

    const payload: CalendarEventPayload = {
      facultyId: userId!,
      subjectId: state.subjectId!,
      eventTopic: state.calendarMode === "single" ? state.topicId : null,
      eventUnitIds: state.calendarMode === "bulk" ? state.unitIds : undefined,
      eventTitle: state.selectedType === "meeting" ? state.title.trim() || "Meeting" : state.subject,
      type: state.selectedType.toLowerCase() as any,
      calendarMode: state.calendarMode,
      date: state.calendarMode === "single" ? state.date : "",
      fromDate: state.calendarMode === "bulk" ? state.fromDate : undefined,
      toDate: state.calendarMode === "bulk" ? state.toDate : undefined,
      fromTime: to24Hour(state.startHour, state.startMinute, state.startPeriod),
      toTime: to24Hour(state.endHour, state.endMinute, state.endPeriod),
      roomNo: state.roomNo,
      collegeRoomId: state.collegeRoomId ?? null,
      meetingLink: state.selectedType === "meeting" && state.meetingPlatform !== "zoom" ? state.meetingLink : null,
      meetingId: state.selectedType === "meeting" && state.meetingPlatform === "zoom" ? state.meetingId : null,
      meetingPassword: state.selectedType === "meeting" && state.meetingPlatform === "zoom" ? state.meetingPassword : null,
      collegeEducationId: state.educationId!,
      collegeBranchId: state.branchId!,
      collegeAcademicYearId: state.academicYearId!,
      collegeSemesterId: state.semester!,
      sectionIds: state.sectionIds,
    };

    try {
      state.setIsSubmitting(true);
      const result = await onSave(payload);
      if (result?.success !== false) {
        toast.success(isEditMode ? "Event updated successfully" : "Event created successfully");
        onClose();
      }
    } catch (error) {
      toast.error("Failed to save event. Please try again.");
    } finally {
      state.setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // Ignore clicks on floating portals (dropdowns)
      if (target?.closest && target.closest('.modal-dropdown-menu')) {
        return;
      }
      
      if (modalContentRef.current && !modalContentRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleSave();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [isOpen, onClose, handleSave]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        ref={modalContentRef}
        className="bg-white rounded-xl shadow-2xl w-[95%] md:max-w-[450px] lg:max-w-[450px] max-h-[90vh] flex flex-col relative"
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <h2 className="text-xl font-bold text-gray-800">
            {value ? "Edit Event" : "New Calendar Event"}
          </h2>
          <button
            onClick={() => { state.resetFormState(); onClose(); }}
            className="text-gray-500 cursor-pointer hover:text-gray-800 transition-colors p-1"
          >
            <X size={24} weight="bold" />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          
          <TypeAndModeFields
            calendarMode={state.calendarMode}
            setCalendarMode={state.setCalendarMode}
            selectedType={state.selectedType}
            setSelectedType={state.setSelectedType}
          />

          <AcademicFields
            educationId={state.educationId}
            setEducationId={(id) => {
               state.setEducationId(id);
               state.setBranchId(undefined);
               state.setAcademicYearId(undefined);
               state.setSemester(undefined);
               state.setSubjectId(undefined);
               state.setSubject("");
               state.setTopicId(null);
               state.setUnitIds([]);
            }}
            educations={data.educations}
            branchId={state.branchId}
            setBranchId={(id) => {
               state.setBranchId(id);
               state.setAcademicYearId(undefined);
               state.setSemester(undefined);
               state.setSubjectId(undefined);
               state.setSubject("");
               state.setTopicId(null);
               state.setUnitIds([]);
            }}
            branches={data.branches}
            academicYearId={state.academicYearId}
            setAcademicYearId={(id) => {
               state.setAcademicYearId(id);
               state.setSemester(undefined);
               state.setSubjectId(undefined);
               state.setSubject("");
               state.setTopicId(null);
               state.setUnitIds([]);
            }}
            academicYears={data.academicYears}
            semester={state.semester}
            setSemester={(sem) => {
               state.setSemester(sem);
               state.setSubjectId(undefined);
               state.setSubject("");
               state.setTopicId(null);
               state.setUnitIds([]);
            }}
            semesters={data.semesters}
            facultyEduType={data.educations.find((e: any) => e.collegeEducationId === state.educationId)?.collegeEducationType || data.facultyCtx?.faculty_edu_type}
            INPUT_HEIGHT={INPUT_HEIGHT}
            isSingleSubject={data.isSingleSubject}
          />

          <SubjectTopicFields
            calendarMode={state.calendarMode}
            subjects={data.subjects}
            subjectId={state.subjectId}
            setSubjectId={state.setSubjectId}
            subject={state.subject}
            setSubject={state.setSubject}
            topicId={state.topicId}
            setTopicId={state.setTopicId}
            topics={data.topics}
            unitIds={state.unitIds}
            setUnitIds={state.setUnitIds}
            units={data.units}
            isUnitOpen={state.isUnitOpen}
            setIsUnitOpen={state.setIsUnitOpen}
            INPUT_HEIGHT={INPUT_HEIGHT}
          />

          <MeetingFields
            selectedType={state.selectedType}
            title={state.title}
            setTitle={state.setTitle}
            meetingPlatform={state.meetingPlatform}
            setMeetingPlatform={state.setMeetingPlatform}
            meetingId={state.meetingId}
            setMeetingId={state.setMeetingId}
            meetingPassword={state.meetingPassword}
            setMeetingPassword={state.setMeetingPassword}
            meetingLink={state.meetingLink}
            setMeetingLink={state.setMeetingLink}
          />

          <DateTimeRoomFields
            calendarMode={state.calendarMode}
            selectedType={state.selectedType}
            date={state.date} setDate={state.setDate}
            fromDate={state.fromDate} setFromDate={state.setFromDate}
            toDate={state.toDate} setToDate={state.setToDate}
            TODAY={TODAY}
            roomNo={state.roomNo} setRoomNo={state.setRoomNo}
            setCollegeRoomId={state.setCollegeRoomId}
            collegeId={collegeId || 0}
            startHour={state.startHour} setStartHour={state.setStartHour}
            startMinute={state.startMinute} setStartMinute={state.setStartMinute}
            startPeriod={state.startPeriod} setStartPeriod={state.setStartPeriod}
            endHour={state.endHour} setEndHour={state.setEndHour}
            endMinute={state.endMinute} setEndMinute={state.setEndMinute}
            endPeriod={state.endPeriod} setEndPeriod={state.setEndPeriod}
            isDateInputFocused={false} setIsDateInputFocused={() => {}}
            INPUT_HEIGHT={INPUT_HEIGHT}
          />

          <SectionFields
            sectionIds={state.sectionIds}
            setSectionIds={state.setSectionIds}
            sections={data.sections}
            isSectionOpen={state.isSectionOpen}
            setIsSectionOpen={state.setIsSectionOpen}
            INPUT_HEIGHT={INPUT_HEIGHT}
          />
        </div>

        {/* Sticky Footer */}
        <div className="p-5 border-t border-gray-100 bg-white rounded-b-xl shrink-0">
          <button
            onClick={handleSave}
            disabled={state.isSubmitting || isSaving}
            className={`w-full text-white font-semibold py-3 rounded-lg shadow-md transition-colors text-base ${
              state.isSubmitting || isSaving
                ? "bg-emerald-400 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-600 cursor-pointer"
            }`}
          >
            {state.isSubmitting || isSaving
              ? isEditMode ? "Updating..." : "Saving..."
              : isEditMode ? "Update Event" : "Save Event"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEventModalV2;
