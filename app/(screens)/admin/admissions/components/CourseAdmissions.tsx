"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/app/utils/context/UserContext";
import { 
  fetchAdmissionsCourses, 
  fetchGlobalAdmissionSettings, 
  fetchCourseAdmissions,
  upsertGlobalAdmissionsStatus,
  upsertCourseAdmissionConfig
} from "@/lib/helpers/admin/admissionsAPI";
import CourseCardShimmer from "@/app/utils/shimmers/CourseCardShimmer";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";

type Course = {
  collegeBranchId: number;
  name: string;
  code: string;
};

export default function CourseAdmissions() {
  const { collegeId, adminId } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [admissionsState, setAdmissionsState] = useState<Record<number, boolean>>({});
  const [globalAdmissions, setGlobalAdmissions] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const loadData = async () => {
      if (collegeId) {
        try {
          const [branches, globalSettings, courseSettings] = await Promise.all([
            fetchAdmissionsCourses(collegeId),
            fetchGlobalAdmissionSettings(collegeId),
            fetchCourseAdmissions(collegeId)
          ]);
          
          setCourses(branches);
          if (globalSettings) {
            setGlobalAdmissions(globalSettings.isAdmissionsOpen);
          }
          
          const initialState: Record<number, boolean> = {};
          // Default all to false, then override with DB settings
          branches.forEach(b => {
            initialState[b.collegeBranchId] = false;
          });
          
          if (courseSettings && courseSettings.length > 0) {
            courseSettings.forEach((cs: any) => {
              initialState[cs.collegeBranchId] = cs.isAdmissionsOpen;
            });
          }
          
          setAdmissionsState(initialState);
        } catch (error) {
          console.error("Failed to load admissions data:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadData();
  }, [collegeId]);

  const handleToggleGlobal = async () => {
    if (!collegeId || !adminId) return;
    const newState = !globalAdmissions;
    setGlobalAdmissions(newState);
    
    // Optimistically update the UI state for all courses
    const updatedState: Record<number, boolean> = {};
    courses.forEach(c => {
      updatedState[c.collegeBranchId] = newState;
    });
    setAdmissionsState(updatedState);
    
    try {
      // 1. Update the global setting
      await upsertGlobalAdmissionsStatus(collegeId, adminId, newState);
      
      // 2. Update all individual course settings in the database to match
      const coursePromises = courses.map(course => 
        upsertCourseAdmissionConfig(collegeId, adminId, course.collegeBranchId, { isAdmissionsOpen: newState })
      );
      await Promise.all(coursePromises);
      
    } catch (error) {
      console.error("Error saving global setting:", error);
      // Revert if something fails
      setGlobalAdmissions(!newState);
      
      // Attempt to revert course states to their original (we don't have deep backup here, but they can refresh)
      alert("Failed to update all courses. Please refresh the page and try again.");
    }
  };

  const handleToggleCourse = async (id: number) => {
    if (!collegeId || !adminId) return;
    const currentState = admissionsState[id] ?? false;
    const newState = !currentState;
    
    // Optimistic update
    setAdmissionsState(prev => ({ ...prev, [id]: newState }));
    
    try {
      await upsertCourseAdmissionConfig(collegeId, adminId, id, { isAdmissionsOpen: newState });
    } catch (error) {
      console.error("Error saving course setting:", error);
      // Revert on error
      setAdmissionsState(prev => ({ ...prev, [id]: currentState }));
    }
  };

  const paginatedCourses = courses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
        <div>
          <h2 className="text-lg font-semibold text-[#1F2937]">Global Admissions Status</h2>
          <p className="text-sm text-gray-500">Turn admissions ON/OFF for all courses at once.</p>
        </div>
        <button
          onClick={handleToggleGlobal}
          disabled={!collegeId || !adminId}
          className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            globalAdmissions ? "bg-[#43C17A]" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              globalAdmissions ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-md font-semibold text-[#1F2937]">Offered Courses</h3>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <CourseCardShimmer key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedCourses.map((course) => {
            const isOpen = admissionsState[course.collegeBranchId] ?? false;
            
            return (
              <div
                key={course.collegeBranchId}
                className="flex flex-col p-4 rounded-xl border border-gray-200 shadow-sm bg-white gap-4"
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-800 break-words pr-2">{course.name}</h4>
                  <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">{course.code}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Admissions</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold ${
                        isOpen ? "text-[#43C17A]" : "text-gray-500"
                      }`}
                    >
                      {isOpen ? "OPEN" : "CLOSED"}
                    </span>
                    <button
                      onClick={() => handleToggleCourse(course.collegeBranchId)}
                      disabled={!collegeId || !adminId}
                      className={`relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                        isOpen ? "bg-[#43C17A]" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          isOpen ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {paginatedCourses.length === 0 && (
            <div className="col-span-full py-10 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
              No courses found for this college.
            </div>
          )}
        </div>
      )}
      
      {!loading && courses.length > 0 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalItems={courses.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            roundedBottom="rounded-xl"
            alwaysShow={true}
          />
        </div>
      )}
    </div>
  );
}
