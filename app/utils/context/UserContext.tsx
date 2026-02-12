"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getStudentId } from "@/lib/helpers/studentAPI";
import { fetchStudentContext } from "./student/studentContextAPI";

type UserContextType = {
  userId: number | null;
  loading: boolean;
  studentId: number | null;
  fullName: string | null;
  mobile: string | null;
  email: string | null;
  gender: string | null;
  role: string | null;
  collegePublicId: string | null;
  collegeId: number | null;
  adminId?: number | null;
  collegeEducationType?: string | null;
  collegeBranchCode?: string | null;
  collegeAcademicYear?: string | null;
  financeManagerId?: number | null;
  facultyId?: number | null;
};

const StudentContext = createContext<UserContextType>({
  userId: null,
  loading: true,
  studentId: null,
  fullName: null,
  mobile: null,
  email: null,
  gender: null,
  role: null,
  collegePublicId: null,
  collegeId: null,
  collegeEducationType: null,
  collegeBranchCode: null,
  collegeAcademicYear: null
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [financeManagerId, setFinanceManagerId] = useState<number | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [mobile, setMobile] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [collegePublicId, setCollegePublicId] = useState<string | null>(null);
  const [collegeId, setCollegeId] = useState<number | null>(null);
  const [collegeEducationType, setCollegeEducationType] = useState<string | null>(null);
  const [collegeBranchCode, setCollegeBranchCode] = useState<string | null>(null);
  const [collegeAcademicYear, setCollegeAcademicYear] = useState<string | null>(null);
  const [facultyId, setFacultyId] = useState<number | null>(null);
  const [adminId, setAdminId] = useState<number | null>(null);




  useEffect(() => {
    getStudentId().then(setStudentId).catch(console.error);
  }, []);

  useEffect(() => {
    async function loadStudentContext() {
      if (!userId || role !== "Student" || collegeEducationType) return;

      const student = await fetchStudentContext(userId);

      setCollegeEducationType(student.collegeEducationType);
      setCollegeBranchCode(student.collegeBranchCode);
      setCollegeAcademicYear(student.collegeAcademicYear);
    }

    loadStudentContext();
  }, [userId, role]);


  useEffect(() => {
    async function loadAdminId() {
      if (!userId || role !== "Admin" && role !== "SuperAdmin") return;

      const { data, error } = await supabase
        .from("admins")
        .select("adminId")
        .eq("userId", userId)
        .is("deletedAt", null)
        .maybeSingle();

      if (!error && data) {
        setAdminId(data.adminId);
      }
    }

    loadAdminId();
  }, [userId, role]);


  useEffect(() => {
    async function loadFinanceId() {
      if (!userId || role !== "Finance") return;

      const { data, error } = await supabase
        .from("finance_manager")
        .select("financeManagerId")
        .eq("userId", userId)
        .eq("is_deleted", false)
        .maybeSingle();

      if (!error && data) {
        setFinanceManagerId(data.financeManagerId);
      }
    }

    loadFinanceId();
  }, [userId, role]);


  useEffect(() => {
    const resolveStudentId = async () => {
      const { data: auth } = await supabase.auth.getUser();

      if (!auth.user) {
        setUserId(null);
        setStudentId(null);
        setFullName(null);
        setMobile(null);
        setEmail(null);
        setGender(null);
        setRole(null);
        setLoading(false);
        setCollegePublicId(null);
        setCollegeId(null);
        setCollegeEducationType(null);
        setCollegeBranchCode(null);
        setCollegeAcademicYear(null);
        setFinanceManagerId(null);
        setFacultyId(null);
        setAdminId(null);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select(
          "userId, fullName, mobile, email, gender, role, collegePublicId, collegeId"
        )
        .eq("auth_id", auth.user.id)
        .maybeSingle();

      if (error || !data) {
        console.error("User not found", error);
        setUserId(null);
      } else {
        setUserId(data.userId);
        setFullName(data.fullName);
        setMobile(data.mobile);
        setEmail(data.email);
        setGender(data.gender);
        setRole(data.role);
        setCollegePublicId(data.collegePublicId);
        setCollegeId(data.collegeId);
      }

      setLoading(false);
    };

    resolveStudentId();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      setLoading(true);
      resolveStudentId();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);


  useEffect(() => {
    async function loadFacultyId() {
      if (!userId || role !== "Faculty") return;

      const { data, error } = await supabase
        .from("faculty")
        .select("facultyId")
        .eq("userId", userId)
        .is("deletedAt", null)  // better than is_deleted
        .maybeSingle();

      if (!error && data) {
        setFacultyId(data.facultyId);
      }
    }

    loadFacultyId();
  }, [userId, role]);


  return (
    <StudentContext.Provider
      value={{
        userId,
        loading,
        studentId,
        facultyId,
        financeManagerId,
        fullName,
        mobile,
        email,
        gender,
         adminId,  
        role,
        collegePublicId,
        collegeId,
        collegeEducationType,
        collegeBranchCode,
        collegeAcademicYear
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useUser = () => useContext(StudentContext);
