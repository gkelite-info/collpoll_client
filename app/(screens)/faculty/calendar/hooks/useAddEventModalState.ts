"use client";

import { useState, useRef, useEffect } from "react";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";

const getTodayDateString = () => {
  const d = new Date();
  return d.toISOString().split("T")[0];
};

export const useAddEventModalState = (isOpen: boolean, value: any, mode: "create" | "edit") => {
  const { faculty_edu_type } = useFaculty();

  const [title, setTitle] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [meetingPlatform, setMeetingPlatform] = useState<"meet" | "zoom" | "others">("meet");
  const [meetingId, setMeetingId] = useState("");
  const [meetingPassword, setMeetingPassword] = useState("");

  const [selectedType, setSelectedType] = useState("class");
  const [calendarMode, setCalendarMode] = useState<"single" | "bulk">("single");
  const [date, setDate] = useState(getTodayDateString());
  const [fromDate, setFromDate] = useState(getTodayDateString());
  const [toDate, setToDate] = useState(getTodayDateString());
  
  const [startHour, setStartHour] = useState("09");
  const [startMinute, setStartMinute] = useState("00");
  const [startPeriod, setStartPeriod] = useState<"AM" | "PM">("AM");
  const [endHour, setEndHour] = useState("10");
  const [endMinute, setEndMinute] = useState("00");
  const [endPeriod, setEndPeriod] = useState<"AM" | "PM">("AM");
  
  const [roomNo, setRoomNo] = useState("");
  const [collegeRoomId, setCollegeRoomId] = useState<number | null>(null);
  
  // Academic selections
  const [educationId, setEducationId] = useState<number | undefined>(undefined);
  const [branchId, setBranchId] = useState<number | undefined>(undefined);
  const [academicYearId, setAcademicYearId] = useState<number | undefined>(undefined);
  const [semester, setSemester] = useState<number | undefined>();
  const [isSemesterAuto, setIsSemesterAuto] = useState(false);
  
  // Subject & Topic selections
  const [subjectId, setSubjectId] = useState<number | undefined>(undefined);
  const [subject, setSubject] = useState("");
  const [topicId, setTopicId] = useState<number | null>(null);
  const [unitIds, setUnitIds] = useState<number[]>([]);
  
  // Sections
  const [sectionIds, setSectionIds] = useState<number[]>([]);
  
  // UI States
  const [isSectionOpen, setIsSectionOpen] = useState(false);
  const [isUnitOpen, setIsUnitOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetFormState = () => {
    setTitle("");
    setMeetingLink("");
    setMeetingId("");
    setMeetingPassword("");
    setMeetingPlatform("meet");
    setSelectedType("class");
    setCalendarMode("single");
    setDate(getTodayDateString());
    setFromDate(getTodayDateString());
    setToDate(getTodayDateString());
    setStartHour("09");
    setStartMinute("00");
    setStartPeriod("AM");
    setEndHour("10");
    setEndMinute("00");
    setEndPeriod("AM");
    setRoomNo("");
    setCollegeRoomId(null);
    setSemester(undefined);
    setTopicId(null);
    setUnitIds([]);
    setSectionIds([]);
    setIsSectionOpen(false);
    setIsUnitOpen(false);
    setIsSemesterAuto(false);
  };

  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      hasInitializedRef.current = false;
      resetFormState();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && value && mode === "edit" && !hasInitializedRef.current) {
      hasInitializedRef.current = true;

      setSelectedType(value.type || "class");
      setRoomNo(value.roomNo ?? "");
      setCollegeRoomId(value.collegeRoomId ?? null);
      setDate(value.date ?? getTodayDateString());

      setStartHour(value.startHour ?? "09");
      setStartMinute(value.startMinute ?? "00");
      setStartPeriod(value.startPeriod ?? "AM");

      setEndHour(value.endHour ?? "10");
      setEndMinute(value.endMinute ?? "00");
      setEndPeriod(value.endPeriod ?? "AM");

      setTitle(value.title ?? "");
      setMeetingLink(value.meetingLink ?? "");
      setMeetingId(value.meetingId ?? "");
      setMeetingPassword(value.meetingPassword ?? "");

      if (value.meetingId) setMeetingPlatform("zoom");
      else if (value.meetingLink?.includes("meet.google")) setMeetingPlatform("meet");
      else setMeetingPlatform("others");

      setTopicId(value.topicId ?? null);
      if (value.semesterId) {
        setSemester(value.semesterId);
        setIsSemesterAuto(false);
      }

      if (value.calendarMode) {
        setCalendarMode(value.calendarMode);
      }

      if (value.fromDate) setFromDate(value.fromDate);
      if (value.toDate) setToDate(value.toDate);
      
      if (Array.isArray(value.unitIds)) {
        setUnitIds(value.unitIds);
      }

      if (Array.isArray(value.sectionIds)) {
        setSectionIds(value.sectionIds);
      }
      
      if (value.educationId) setEducationId(value.educationId);
      if (value.branchId) setBranchId(value.branchId);
      if (value.academicYearId) setAcademicYearId(value.academicYearId);
      if (value.subjectId) setSubjectId(value.subjectId);
    }
  }, [isOpen, value, mode]);

  return {
    faculty_edu_type,
    title, setTitle,
    meetingLink, setMeetingLink,
    meetingPlatform, setMeetingPlatform,
    meetingId, setMeetingId,
    meetingPassword, setMeetingPassword,
    selectedType, setSelectedType,
    calendarMode, setCalendarMode,
    date, setDate,
    fromDate, setFromDate,
    toDate, setToDate,
    startHour, setStartHour,
    startMinute, setStartMinute,
    startPeriod, setStartPeriod,
    endHour, setEndHour,
    endMinute, setEndMinute,
    endPeriod, setEndPeriod,
    roomNo, setRoomNo,
    collegeRoomId, setCollegeRoomId,
    educationId, setEducationId,
    branchId, setBranchId,
    academicYearId, setAcademicYearId,
    semester, setSemester,
    isSemesterAuto, setIsSemesterAuto,
    subjectId, setSubjectId,
    subject, setSubject,
    topicId, setTopicId,
    unitIds, setUnitIds,
    sectionIds, setSectionIds,
    isSectionOpen, setIsSectionOpen,
    isUnitOpen, setIsUnitOpen,
    isSubmitting, setIsSubmitting,
    resetFormState,
  };
};
