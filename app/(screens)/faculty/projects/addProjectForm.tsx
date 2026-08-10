"use client";

import { supabase } from "@/lib/supabaseClient";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { useEffect, useRef, useState, useCallback } from "react";
import { FaCloudUploadAlt, FaTimes } from "react-icons/fa";
import { FaAngleLeft, FaPlus } from "react-icons/fa6";
import SelectionModal, { SelectionItem } from "./modals/SelectionModal";
import { fetchFilteredFaculties } from "@/lib/helpers/admin/calender/fetchFacultyCalendar";
import { fetchStudentsWithProfile } from "@/lib/helpers/faculty/fetchStudents";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchFacultySections,
  fetchFacultySubjects,
  fetchFacultyYears,
  fetchFacultyBranches,
} from "@/lib/helpers/faculty/facultyAPI";
import toast from "react-hot-toast";
import { FacultySectionRow } from "@/lib/helpers/faculty/facultysectionsAPI";
import {
  addProjectFiles,
  uploadProjectFile,
} from "@/lib/helpers/projects/projectFiles";
import { addStudentsToProject } from "@/lib/helpers/projects/projectTeamMembers";
import { addMentorsToProject } from "@/lib/helpers/projects/projectMentors";
import { saveProject } from "@/lib/helpers/projects/project";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/app/utils/context/UserContext";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { FilterDropdown } from "../../admin/assignments/components/filterDropdown";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";

export type ProjectPayload = {
  title: string;
  description: string;
  year: string;
  subject: string;
  section: string;
  domain: string[];
  marks: number | string;
  startDate: string;
  endDate: string;
  mentorIds: number[];
  studentIds: number[];
  fileUrls: string[];
  files: File[];
};

type FacultyOption = {
  id: number | string;
  name: string;
  image?: string;
}

import { useAddProjectForm, AddProjectFormProps } from "./hooks/useAddProjectForm";
const AddProjectForm = ({
  onCancel,
  college_branch,
  collegeAcademicYear,
  faculty_edu_type,
}: AddProjectFormProps) => {
  const {
    formData,
    handleChange,
    handleSaveProject,
    domainInput,
    setDomainInput,
    handleAddDomain,
    removeDomain,
    handleFileChange,
    removeFile,
    handleDrag,
    handleDrop,
    isDragging,
    setIsDragging,
    fileInputRef,
    loading,
    isMentorModalOpen,
    setIsMentorModalOpen,
    isStudentModalOpen,
    setIsStudentModalOpen,
    selectedMentors,
    setSelectedMentors,
    selectedStudents,
    setSelectedStudents,
    fetchMentorItems,
    fetchStudentItems,
    branches,
    years,
    subjects,
    sections,
    isBranchesLoading,
    isYearsLoading,
    isSubjectsLoading,
    isSectionsLoading,
    isAdmin,
    isInter,
    isSchool,
    resolvedCollegeId,
  } = useAddProjectForm({
    onCancel,
    college_branch,
    collegeAcademicYear,
    faculty_edu_type,
  });

  return (
    <main className="min-h-screen p-2">
      <div
        className={`flex ${isAdmin ? "justify-end" : "justify-between"} items-start mb-6`}
      >
        {!isAdmin && (
          <div>
            <div className="flex items-center gap-1">
              <FaAngleLeft
                className="text-black active:scale-90 cursor-pointer"
                size={22}
                onClick={onCancel}
              />
              <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
            </div>
            <p className="text-[#282828] text-sm lg:ml-1.5">
              Create, manage, and track student projects effortlessly.
            </p>
          </div>
        )}
      </div>

      <div className="mb-6 flex flex-col md:flex-row w-full gap-4 overflow-x-visible pb-2 pl-2">
        {!isSchool && (
          <FilterDropdown
            label={isInter ? "Group" : "Branch"}
            value={formData.branch}
            options={branches.map((b: any) => ({
              label: b.label,
              value: b.id.toString(),
            }))}
            onChange={(val) => handleChange("branch", val)}
            disabled={isBranchesLoading || branches.length <= 1}
          />
        )}

        <FilterDropdown
          label="Year"
          value={formData.year}
          options={years.map((y: any) => ({
            label: y.label,
            value: y.id.toString(),
          }))}
          onChange={(val) => handleChange("year", val)}
          disabled={isYearsLoading || years.length <= 1}
        />

        <FilterDropdown
          label="Subject"
          value={formData.subject}
          options={[
            ...Array.from(
              new Map<any, any>(subjects.map((sub: any) => [sub.id, sub])).values(),
            ).map((sub) => ({
              label: sub.label,
              value: sub.id.toString(),
            })),
          ]}
          disabled={isSubjectsLoading || subjects.length <= 1}
          onChange={(val) => handleChange("subject", val)}
        />

        {(() => {
          const uniqueSections = Array.from(
            new Map<any, any>(
              sections.map((sec: any) => [
                sec.college_sections?.collegeSectionsId,
                sec,
              ]),
            ).values(),
          );

          return (
            <FilterDropdown
              label="Section"
              value={formData.section}
              options={uniqueSections.map((sec) => ({
                label: sec.college_sections?.collegeSections || "",
                value: (sec.college_sections?.collegeSectionsId || "").toString(),
              }))}
              disabled={isSectionsLoading || uniqueSections.length <= 1}
              onChange={(val) => handleChange("section", val)}
            />
          );
        })()}
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="col-span-1">
            <label className="block text-sm font-semibold mb-2 text-[#282828]">
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => {
                const val = e.target.value;
                handleChange(
                  "title",
                  val.charAt(0).toUpperCase() + val.slice(1),
                );
              }}
              placeholder="Smart Attendance System using Face Recog.."
              className="w-full border rounded-md px-2 py-1.5 focus:outline-green-600 text-base text-[#282828]"
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-semibold mb-2 text-[#282828]">
              Domain(s) <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={domainInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setDomainInput(val.charAt(0).toUpperCase() + val.slice(1));
                }}
                onKeyDown={handleAddDomain}
                placeholder="Type domain and press Enter (e.g. AI, Fintech)"
                className="w-full border rounded-md px-2 py-1.5 focus:outline-green-600 bg-white text-[#282828]"
              />
              <div className="flex flex-wrap gap-2 min-h-[32px]">
                {formData.domain.map((dom) => (
                  <span
                    key={dom}
                    className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-md text-xs font-medium border border-green-200"
                  >
                    {dom}
                    <button
                      type="button"
                      onClick={() => removeDomain(dom)}
                      className="hover:text-red-500 font-bold ml-1 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {formData.domain.length === 0 && (
                  <span className="text-gray-400 text-xs italic">
                    No domains added yet...
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold mb-2 text-[#282828]">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => {
                const val = e.target.value;
                handleChange(
                  "description",
                  val.charAt(0).toUpperCase() + val.slice(1),
                );
              }}
              placeholder="Develop a system that automates student attendance using facial recognition."
              className="w-full border rounded-md px-2 py-2 focus:outline-green-600 resize-none text-[#282828]"
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-semibold mb-2 text-[#282828]">
              Team Members <span className="text-red-500">*</span>
            </label>
            <div className="border rounded-md p-2 flex items-center justify-between border-[#282828] min-h-[46px]">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                {selectedStudents.length > 0 ? (
                  selectedStudents.map((student) => {
                    return (
                      <div
                        key={student.id}
                        className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200 whitespace-nowrap"
                      >
                        <span className="text-xs font-semibold">
                          {student.name || `ID: ${student.id}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const newStudents = selectedStudents.filter(
                              (s) => s.id !== student.id,
                            );
                            setSelectedStudents(newStudents);
                            handleChange(
                              "studentIds",
                              newStudents.map((s) => s.id),
                            );
                          }}
                          className="hover:text-red-500 font-bold leading-none cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <span className="text-gray-400 text-xs ml-1">
                    No members added
                  </span>
                )}
              </div>
              <button
                type="button"
                className="w-8 h-8 rounded-full border border-dashed border-green-500 flex items-center justify-center text-green-500 hover:bg-green-50 transition-colors ml-2 flex-shrink-0 cursor-pointer"
                onClick={() => setIsStudentModalOpen(true)}
              >
                <FaPlus size={14} />
              </button>
            </div>
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-semibold mb-2 text-[#282828]">
              Mentor / Guide <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col gap-2">
              <div className="border rounded-md p-2 flex items-center justify-between border-[#282828] min-h-[46px] bg-white">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                  {selectedMentors.length > 0 ? (
                    selectedMentors.map((mentor) => {
                      return (
                        <div
                          key={mentor.id}
                          className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200 whitespace-nowrap"
                        >
                          <span className="text-xs font-semibold">
                            {mentor.name || `ID: ${mentor.id}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const newMentors = selectedMentors.filter(
                                (m) => m.id !== mentor.id,
                              );
                              setSelectedMentors(newMentors);
                              handleChange(
                                "mentorIds",
                                newMentors.map((m) => m.id),
                              );
                            }}
                            className="hover:text-red-500 font-bold leading-none cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-gray-400 text-xs ml-1">
                      No mentors selected
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsMentorModalOpen(true)}
                  className="w-8 h-8 rounded-full border border-dashed border-green-500 flex items-center justify-center text-green-500 hover:bg-green-50 transition-colors flex-shrink-0 ml-2 cursor-pointer"
                >
                  <FaPlus size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-semibold mb-2 text-[#282828]">
              Marks <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.marks}
              onChange={(e) => {
                const val = e.target.value;
                handleChange("marks", val === "" ? "" : Number(val));
              }}
              onWheel={(e) => e.currentTarget.blur()}
              placeholder="Enter marks"
              className="w-full border rounded-md px-2 py-1.5 text-[#282828] focus:outline-green-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-semibold mb-2 text-[#282828]">
              Duration (From) <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
              className="w-full border rounded-md px-2 py-1.5 text-[#282828] focus:outline-green-600"
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-semibold mb-2 text-[#282828]">
              To <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleChange("endDate", e.target.value)}
              className="w-full border rounded-md px-2 py-1.5 text-[#282828] focus:outline-green-600"
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold mb-2 text-[#282828]">
              Upload Your File
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept=".pdf, .jpg, .jpeg, .png, .zip"
              className="hidden"
            />
            <div
              className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center transition-colors cursor-pointer ${isDragging ? "border-green-500 bg-green-50" : "border-gray-300 bg-gray-50"}`}
              onDragEnter={(e) => {
                handleDrag(e);
                setIsDragging(true);
              }}
              onDragOver={(e) => {
                handleDrag(e);
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                handleDrop(e);
                setIsDragging(false);
              }}
              onDrop={(e) => {
                handleDrop(e);
                setIsDragging(false);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <FaCloudUploadAlt
                className={`text-4xl mb-2 ${isDragging ? "text-green-500" : "text-gray-300"}`}
              />
              <p className="text-gray-500 mb-4 text-center">
                {isDragging
                  ? "Drop to upload!"
                  : formData.fileUrls.length > 0
                    ? `You've selected ${formData.fileUrls.length} file(s)`
                    : "Drag & Drop Your File here or"}
              </p>
              <button
                type="button"
                className="border px-6 py-2 rounded bg-white font-medium hover:bg-gray-50 cursor-pointer text-[#282828]"
              >
                Browse Files
              </button>
            </div>

            {formData.fileUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {formData.fileUrls.map((name, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white border border-gray-200 px-3 py-2 rounded-md shadow-sm"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 text-gray-500 text-xs font-bold uppercase">
                        {name.split(".").pop()?.substring(0, 3) || "FILE"}
                      </div>
                      <span className="text-sm text-[#282828] truncate font-medium">
                        {name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer lg:ml-1"
                    >
                      <FaTimes size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            type="button"
            onClick={handleSaveProject}
            className="flex-1 bg-[#43C17A] text-white py-3 rounded-md font-semibold transition-colors cursor-pointer"
            disabled={loading}
          >
            {loading ? "Saving.." : "Save"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-md font-semibold hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>

      <SelectionModal
        isOpen={isMentorModalOpen}
        onClose={() => setIsMentorModalOpen(false)}
        title="Assign Mentors"
        fetchItems={fetchMentorItems}
        selectedItems={selectedMentors}
        onSelectionChange={(items) => {
          setSelectedMentors(items);
          handleChange(
            "mentorIds",
            items.map((i) => i.id),
          );
        }}
      />
      <SelectionModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        title="Assign Team Members"
        fetchItems={fetchStudentItems}
        selectedItems={selectedStudents}
        onSelectionChange={(items) => {
          setSelectedStudents(items);
          handleChange(
            "studentIds",
            items.map((i) => i.id),
          );
        }}
      />
    </main>
  );
};

export default AddProjectForm;

