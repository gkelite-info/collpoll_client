"use client";

import { useState, useEffect } from "react";
import { CurrencyInr, PencilSimple, Check, SpinnerGap } from "@phosphor-icons/react";
import { useUser } from "@/app/utils/context/UserContext";
import { 
  fetchAdmissionsCourses, 
  fetchCourseAdmissions,
  upsertCourseAdmissionConfig 
} from "@/lib/helpers/admin/admissionsAPI";
import CourseCardShimmer from "@/app/utils/shimmers/CourseCardShimmer";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";

type Course = {
  collegeBranchId: number;
  name: string;
  code: string;
};

export default function AdmissionFee() {
  const { collegeId, adminId } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [feeState, setFeeState] = useState<Record<number, number>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [globalFee, setGlobalFee] = useState<number>(0);
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [isEditingGlobal, setIsEditingGlobal] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const loadData = async () => {
      if (collegeId) {
        try {
          const [branches, courseSettings] = await Promise.all([
            fetchAdmissionsCourses(collegeId),
            fetchCourseAdmissions(collegeId)
          ]);
          setCourses(branches);
          
          const initialState: Record<number, number> = {};
          branches.forEach(b => {
            initialState[b.collegeBranchId] = 0; // default fee to 0
          });
          
          if (courseSettings && courseSettings.length > 0) {
            courseSettings.forEach((cs: any) => {
              initialState[cs.collegeBranchId] = cs.admissionFee;
            });
          }
          
          setFeeState(initialState);
        } catch (error) {
          console.error("Failed to load admission fees:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadData();
  }, [collegeId]);
  
  const handleUpdateAmount = (id: number, newAmount: number) => {
    setFeeState(prev => ({
      ...prev,
      [id]: newAmount
    }));
  };

  const handleSaveFee = async (id: number) => {
    if (!collegeId || !adminId) return;
    const amount = feeState[id] ?? 0;
    
    setSavingId(id);
    try {
      await upsertCourseAdmissionConfig(collegeId, adminId, id, { admissionFee: amount });
      setEditingId(null);
    } catch (error) {
      console.error("Error saving admission fee:", error);
      alert("Failed to save fee. Please try again.");
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveGlobalFee = async () => {
    if (!collegeId || !adminId) return;
    
    setSavingGlobal(true);
    try {
      // 1. Update the UI optimistically for all courses
      const updatedState: Record<number, number> = {};
      courses.forEach(c => {
        updatedState[c.collegeBranchId] = globalFee;
      });
      setFeeState(updatedState);
      
      // 2. Fire backend updates for all courses
      const coursePromises = courses.map(course => 
        upsertCourseAdmissionConfig(collegeId, adminId, course.collegeBranchId, { admissionFee: globalFee })
      );
      await Promise.all(coursePromises);
      setIsEditingGlobal(false);
    } catch (error) {
      console.error("Error saving global fee:", error);
      alert("Failed to update all courses. Please try again.");
    } finally {
      setSavingGlobal(false);
    }
  };

  const paginatedCourses = courses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 p-4 rounded-xl border border-gray-100 gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#1F2937]">Global Admission Fee</h2>
          <p className="text-sm text-gray-500">Apply a single fee amount to all courses instantly.</p>
        </div>
        <div className="flex items-center gap-2">
          {isEditingGlobal ? (
            <>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-600">
                  <CurrencyInr size={16} weight="bold" />
                </span>
                <input
                  type="number"
                  value={globalFee || ""}
                  onChange={(e) => setGlobalFee(Number(e.target.value))}
                  placeholder="0"
                  min="0"
                  autoFocus
                  className="w-32 pl-8 pr-3 py-2 bg-white border border-[#43C17A] rounded-lg text-md font-bold text-[#43C17A] focus:outline-none focus:ring-1 focus:ring-[#43C17A] transition-colors"
                />
              </div>
              <button
                onClick={handleSaveGlobalFee}
                disabled={savingGlobal || globalFee < 0}
                className="flex items-center justify-center min-w-[100px] gap-2 px-4 py-2 bg-[#43C17A] text-white rounded-lg text-sm font-medium hover:bg-[#3ba869] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {savingGlobal ? <SpinnerGap size={16} className="animate-spin" /> : "Apply to All"}
              </button>
            </>
          ) : (
            <>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-600">
                  <CurrencyInr size={16} weight="bold" />
                </span>
                <div className="w-32 pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-md font-bold text-[#43C17A]">
                  {globalFee || "0"}
                </div>
              </div>
              <button
                onClick={() => setIsEditingGlobal(true)}
                className="flex items-center justify-center min-w-[100px] gap-2 px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <PencilSimple size={16} /> Edit
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-md font-semibold text-[#1F2937]">Fee Structure by Course</h3>
          <p className="text-sm text-gray-500">Define admission fees based on different courses.</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <CourseCardShimmer key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedCourses.map((course) => {
            const amount = feeState[course.collegeBranchId] ?? 0;
            
            return (
              <div
                key={course.collegeBranchId}
                className="flex flex-col p-5 rounded-xl border border-gray-200 shadow-sm bg-white gap-4 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-[#43C17A]"></div>
                
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-gray-800 break-words pr-2">{course.name}</h4>
                  <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">{course.code}</span>
                </div>
                
                <div className="flex flex-col gap-1 mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-gray-500">Fee Amount</label>
                    {editingId === course.collegeBranchId ? (
                      <button
                        onClick={() => handleSaveFee(course.collegeBranchId)}
                        disabled={savingId === course.collegeBranchId}
                        className="text-[#43C17A] hover:bg-[#43C17A]/10 p-1 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {savingId === course.collegeBranchId ? (
                          <SpinnerGap size={16} className="animate-spin" />
                        ) : (
                          <Check size={16} weight="bold" />
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingId(course.collegeBranchId)}
                        className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-md transition-colors cursor-pointer"
                      >
                        <PencilSimple size={16} />
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-600">
                      <CurrencyInr size={16} weight="bold" />
                    </span>
                    {editingId === course.collegeBranchId ? (
                      <input
                        type="number"
                        value={amount || ""}
                        onChange={(e) => handleUpdateAmount(course.collegeBranchId, Number(e.target.value))}
                        placeholder="0"
                        min="0"
                        autoFocus
                        className="w-full pl-8 pr-3 py-2 bg-white border border-[#43C17A] rounded-lg text-lg font-bold text-[#43C17A] focus:outline-none focus:ring-1 focus:ring-[#43C17A] transition-colors"
                      />
                    ) : (
                      <div className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-lg font-bold text-[#43C17A]">
                        {amount || "0"}
                      </div>
                    )}
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
