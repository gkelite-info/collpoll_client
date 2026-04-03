// "use client";

// import { createContext, useContext, useEffect, useState } from "react";
// import { supabase } from "@/lib/supabaseClient";
// import { getStudentId } from "@/lib/helpers/studentAPI";
// import { fetchStudentContext } from "./student/studentContextAPI";

// type UserContextType = {
//   userId: number | null;
//   loading: boolean;
//   studentId: number | null;
//   fullName: string | null;
//   setFullName: React.Dispatch<React.SetStateAction<string | null>>;
//   mobile: string | null;
//   email: string | null;
//   gender: string | null;
//   role: string | null;
//   collegePublicId: string | null;
//   collegeId: number | null;
//   adminId?: number | null;
//   collegeEducationType?: string | null;
//   collegeBranchCode?: string | null;
//   collegeAcademicYear?: string | null;
//   financeManagerId?: number | null;
//   facultyId?: number | null;
// };

// const StudentContext = createContext<UserContextType>({
//   userId: null,
//   loading: true,
//   studentId: null,
//   fullName: null,
//   setFullName: () => {},
//   mobile: null,
//   email: null,
//   gender: null,
//   role: null,
//   collegePublicId: null,
//   collegeId: null,
//   collegeEducationType: null,
//   collegeBranchCode: null,
//   collegeAcademicYear: null
// });

// export const UserProvider = ({ children }: { children: React.ReactNode }) => {
//   const [userId, setUserId] = useState<number | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [studentId, setStudentId] = useState<number | null>(null);
//   const [financeManagerId, setFinanceManagerId] = useState<number | null>(null);
//   const [fullName, setFullName] = useState<string | null>(null);
//   const [mobile, setMobile] = useState<string | null>(null);
//   const [email, setEmail] = useState<string | null>(null);
//   const [gender, setGender] = useState<string | null>(null);
//   const [role, setRole] = useState<string | null>(null);
//   const [collegePublicId, setCollegePublicId] = useState<string | null>(null);
//   const [collegeId, setCollegeId] = useState<number | null>(null);
//   const [collegeEducationType, setCollegeEducationType] = useState<string | null>(null);
//   const [collegeBranchCode, setCollegeBranchCode] = useState<string | null>(null);
//   const [collegeAcademicYear, setCollegeAcademicYear] = useState<string | null>(null);
//   const [facultyId, setFacultyId] = useState<number | null>(null);
//   const [adminId, setAdminId] = useState<number | null>(null);

//   useEffect(() => {
//     if (!userId || role !== "Student") return;
//     getStudentId().then(setStudentId).catch(console.error);
//   }, [userId, role]);

//   useEffect(() => {
//     async function loadStudentContext() {
//       if (!userId || role !== "Student" || collegeEducationType) return;

//       const student = await fetchStudentContext(userId);

//       setCollegeEducationType(student.collegeEducationType);
//       setCollegeBranchCode(student.collegeBranchCode);
//       setCollegeAcademicYear(student.collegeAcademicYear);
//     }

//     loadStudentContext();
//   }, [userId, role]);

//   useEffect(() => {
//     async function loadAdminId() {
//       if (!userId || role !== "Admin" && role !== "SuperAdmin") return;

//       const { data, error } = await supabase
//         .from("admins")
//         .select("adminId")
//         .eq("userId", userId)
//         .is("deletedAt", null)
//         .maybeSingle();

//       if (!error && data) {
//         setAdminId(data.adminId);
//       }
//     }

//     loadAdminId();
//   }, [userId, role]);

//   useEffect(() => {
//     async function loadFinanceId() {
//       if (!userId || role !== "Finance") return;

//       const { data, error } = await supabase
//         .from("finance_manager")
//         .select("financeManagerId")
//         .eq("userId", userId)
//         .eq("is_deleted", false)
//         .maybeSingle();

//       if (!error && data) {
//         setFinanceManagerId(data.financeManagerId);
//       }
//     }

//     loadFinanceId();
//   }, [userId, role]);

//   useEffect(() => {
//     const resolveStudentId = async () => {
//       const { data: auth } = await supabase.auth.getUser();

//       if (!auth.user) {
//         setUserId(null);
//         setStudentId(null);
//         setFullName(null);
//         setMobile(null);
//         setEmail(null);
//         setGender(null);
//         setRole(null);
//         setLoading(false);
//         setCollegePublicId(null);
//         setCollegeId(null);
//         setCollegeEducationType(null);
//         setCollegeBranchCode(null);
//         setCollegeAcademicYear(null);
//         setFinanceManagerId(null);
//         setFacultyId(null);
//         setAdminId(null);
//         return;
//       }

//       const { data, error } = await supabase
//         .from("users")
//         .select(
//           "userId, fullName, mobile, email, gender, role, collegePublicId, collegeId"
//         )
//         .eq("auth_id", auth.user.id)
//         .maybeSingle();

//       if (error || !data) {
//         console.error("User not found", error);
//         setUserId(null);
//       } else {
//         setUserId(data.userId);
//         setFullName(data.fullName);
//         setMobile(data.mobile);
//         setEmail(data.email);
//         setGender(data.gender);
//         setRole(data.role);
//         setCollegePublicId(data.collegePublicId);
//         setCollegeId(data.collegeId);
//       }

//       setLoading(false);
//     };

//     resolveStudentId();

//     const { data: listener } = supabase.auth.onAuthStateChange(() => {
//       setLoading(true);
//       resolveStudentId();
//     });

//     return () => {
//       listener.subscription.unsubscribe();
//     };
//   }, []);

//   useEffect(() => {
//     async function loadFacultyId() {
//       if (!userId || role !== "Faculty") return;

//       const { data, error } = await supabase
//         .from("faculty")
//         .select("facultyId")
//         .eq("userId", userId)
//         .is("deletedAt", null)
//         .maybeSingle();

//       if (!error && data) {
//         setFacultyId(data.facultyId);
//       }
//     }

//     loadFacultyId();
//   }, [userId, role]);

//   return (
//     <StudentContext.Provider
//       value={{
//         userId,
//         loading,
//         studentId,
//         facultyId,
//         financeManagerId,
//         fullName,
//         setFullName,
//         mobile,
//         email,
//         gender,
//         adminId,
//         role,
//         collegePublicId,
//         collegeId,
//         collegeEducationType,
//         collegeBranchCode,
//         collegeAcademicYear
//       }}
//     >
//       {children}
//     </StudentContext.Provider>
//   );
// };

// export const useUser = () => useContext(StudentContext);

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import { supabase } from "@/lib/supabaseClient";
import { getStudentId } from "@/lib/helpers/studentAPI";
import { fetchStudentContext } from "./student/studentContextAPI";
import { getUserProfilePhoto } from "@/lib/helpers/profile/profileInfo";
import { fetchFacultyContext } from "./faculty/facultyContextAPI";
import { fetchAdminContext } from "./admin/adminContextAPI";
import { fetchFinanceManagerContext } from "./financeManager/financeManagerContextAPI";

type UserContextType = {
  userId: number | null;
  loading: boolean;
  fullName: string | null;
  setFullName: React.Dispatch<React.SetStateAction<string | null>>;
  mobile: string | null;
  email: string | null;
  gender: string | null;
  role: string | null;
  collegePublicId: string | null;
  collegeId: number | null;
  studentId: number | null;
  adminId: number | null;
  financeManagerId: number | null;
  facultyId: number | null;
  collegeAdminId: number | null;
  parentId: number | null;
  collegeHrId: number | null;
  collegeEducationType: string | null;
  collegeBranchCode: string | null;
  collegeAcademicYear: string | null;
  collegeSection: string | null;
  profilePhoto: string | null;
  setProfilePhoto: React.Dispatch<React.SetStateAction<string | null>>;
  dateOfJoining: string | null;
  professionalExperienceYears: number | null;
};

const UserContext = createContext<UserContextType>({
  userId: null,
  loading: true,
  fullName: null,
  setFullName: () => { },
  mobile: null,
  email: null,
  gender: null,
  role: null,
  collegePublicId: null,
  collegeId: null,
  studentId: null,
  adminId: null,
  financeManagerId: null,
  facultyId: null,
  collegeAdminId: null,
  parentId: null,
  collegeHrId: null,
  collegeEducationType: null,
  collegeBranchCode: null,
  collegeAcademicYear: null,
  collegeSection: null,
  profilePhoto: null,
  setProfilePhoto: () => { },
  dateOfJoining: null,
  professionalExperienceYears: null,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState<string | null>(null);
  const [mobile, setMobile] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [collegePublicId, setCollegePublicId] = useState<string | null>(null);
  const [collegeId, setCollegeId] = useState<number | null>(null);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [adminId, setAdminId] = useState<number | null>(null);
  const [financeManagerId, setFinanceManagerId] = useState<number | null>(null);
  const [facultyId, setFacultyId] = useState<number | null>(null);
  const [collegeAdminId, setCollegeAdminId] = useState<number | null>(null);
  const [parentId, setParentId] = useState<number | null>(null);
  const [collegeHrId, setCollegeHrId] = useState<number | null>(null);
  const [collegeEducationType, setCollegeEducationType] = useState<
    string | null
  >(null);
  const [collegeBranchCode, setCollegeBranchCode] = useState<string | null>(
    null,
  );
  const [collegeAcademicYear, setCollegeAcademicYear] = useState<string | null>(
    null,
  );
  const [collegeSection, setCollegeSection] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [dateOfJoining, setDateOfJoining] = useState<string | null>(null);
  const [professionalExperienceYears, setProfessionalExperienceYears] =
    useState<number | null>(null);
  const lastAuthUserId = useRef<string | null>(null);
  const isContextLoaded = useRef(false);

  const resetState = () => {
    setUserId(null);
    setFullName(null);
    setMobile(null);
    setEmail(null);
    setGender(null);
    setRole(null);
    setCollegePublicId(null);
    setCollegeId(null);
    setStudentId(null);
    setAdminId(null);
    setFinanceManagerId(null);
    setFacultyId(null);
    setCollegeAdminId(null);
    setParentId(null);
    setCollegeHrId(null);
    setCollegeEducationType(null);
    setCollegeBranchCode(null);
    setCollegeAcademicYear(null);
    setCollegeSection(null);
    setProfilePhoto(null);
    setDateOfJoining(null);
    setProfessionalExperienceYears(null);
  };

  const roleLoaders: Record<string, (userId: number) => Promise<void>> = {
    Student: async (uid) => {
      const [sid, studentCtx] = await Promise.all([
        getStudentId(),
        fetchStudentContext(uid),
      ]);
      setStudentId(sid);
      setCollegeEducationType(studentCtx?.collegeEducationType ?? null);
      setCollegeBranchCode(studentCtx?.collegeBranchCode ?? null);
      setCollegeAcademicYear(studentCtx?.collegeAcademicYear ?? null);
      setCollegeSection(studentCtx?.collegeSections ?? null);
    },

    Admin: async (uid) => {
      const [adminData, adminCtx] = await Promise.all([
        supabase
          .from("admins")
          .select("adminId")
          .eq("userId", uid)
          .is("deletedAt", null)
          .maybeSingle(),

        fetchAdminContext(uid),
      ]);
      setAdminId(adminData.data?.adminId ?? null);
      setCollegeEducationType(adminCtx?.collegeEducationType ?? null);
    },

    Finance: async (uid) => {
      const [financeData, financeCtx] = await Promise.all([
        supabase
          .from("finance_manager")
          .select("financeManagerId")
          .eq("userId", uid)
          .eq("is_deleted", false)
          .maybeSingle(),
        fetchFinanceManagerContext(uid),
      ]);
      setFinanceManagerId(financeData.data?.financeManagerId ?? null);
      setCollegeEducationType(financeCtx?.collegeEducationType ?? null);
    },

    Faculty: async (uid) => {
      const [facultyData, facultyCtx] = await Promise.all([
        supabase
          .from("faculty")
          .select("facultyId")
          .eq("userId", uid)
          .is("deletedAt", null)
          .maybeSingle(),

        fetchFacultyContext(uid),
      ]);

      setFacultyId(facultyData.data?.facultyId ?? null);
      setCollegeEducationType(facultyCtx?.faculty_edu_type ?? null);
      setCollegeBranchCode(facultyCtx?.college_branch ?? null);
      setCollegeAcademicYear(facultyCtx?.collegeAcademicYear ?? null);

      const sections =
        facultyCtx?.sections
          ?.map((s: any) => s.college_sections.collegeSections)
          .join(", ") ?? null;

      setCollegeSection(sections);
    },

    CollegeAdmin: async (uid) => {
      const { data } = await supabase
        .from("college_admin")
        .select("collegeAdminId")
        .eq("userId", uid)
        .eq("is_deleted", false)
        .maybeSingle();
      setCollegeAdminId(data?.collegeAdminId ?? null);
    },

    Parent: async (uid) => {
      const { data } = await supabase
        .from("parents")
        .select("parentId")
        .eq("userId", uid)
        .eq("is_deleted", false)
        .maybeSingle();
      setParentId(data?.parentId ?? null);
    },

    CollegeHR: async (uid) => {
      const { data } = await supabase
        .from("college_hr")
        .select("collegeHrId")
        .eq("userId", uid)
        .eq("is_deleted", false)
        .maybeSingle();
      setCollegeHrId(data?.collegeHrId ?? null);
    },

    // FUTURE ROLES — add here, nothing else changes:
    // Placement: async (uid) => { ... setPlacementId(...) },
  };

  // useEffect(() => {
  //   const loadUserContext = async () => {
  //     setLoading(true);
  //     try {
  //       const { data: auth } = await Promise.race([
  //         supabase.auth.getUser(),
  //         new Promise<never>((_, reject) =>
  //           setTimeout(() => reject(new Error("getUser timeout")), 5000)
  //         )
  //       ]) as any;

  //       const authId = auth.user?.id ?? null;

  //       if (isContextLoaded.current && lastAuthUserId.current === authId) {
  //         setLoading(false);
  //         return;
  //       }

  //       lastAuthUserId.current = authId;

  //       if (!auth?.user) {
  //         resetState();
  //         isContextLoaded.current = false;
  //         return;
  //       }

  //       const { data: userData, error } = await supabase
  //         .from("users")
  //         .select(
  //           "userId, fullName, mobile, email, gender, role, collegePublicId, collegeId, dateOfJoining, professionalExperienceYears",
  //         )
  //         .eq("auth_id", auth.user.id)
  //         .maybeSingle();

  //       if (error || !userData) {
  //         console.error("User fetch failed:", error);
  //         resetState();
  //         return;
  //       }

  //       setDateOfJoining(userData.dateOfJoining ?? null);
  //       setProfessionalExperienceYears(
  //         userData.professionalExperienceYears ?? null,
  //       );
  //       setUserId(userData.userId);
  //       setFullName(userData.fullName);
  //       setMobile(userData.mobile);
  //       setEmail(userData.email);
  //       setGender(userData.gender);
  //       setRole(userData.role);
  //       setCollegePublicId(userData.collegePublicId);
  //       setCollegeId(userData.collegeId);
  //       setDateOfJoining(userData.dateOfJoining ?? null);
  //       setProfessionalExperienceYears(
  //         userData.professionalExperienceYears ?? null,
  //       );

  //       try {
  //         const photoData = await getUserProfilePhoto(userData.userId);
  //         setProfilePhoto(photoData?.profileUrl ?? null);
  //       } catch { }

  //       const loader = roleLoaders[userData.role];

  //       if (loader) {
  //         await loader(userData.userId);
  //       }

  //       isContextLoaded.current = true;
  //     } catch (err: any) {
  //       console.error("UserContext loadUserContext failed:", err.message);
  //       // resetState();
  //       // isContextLoaded.current = false;
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   loadUserContext();

  //   // const { data: listener } = supabase.auth.onAuthStateChange(
  //   //   async (event, session) => {
  //   //     const authId = session?.user?.id ?? null;
  //   //     if (event === "SIGNED_OUT") {
  //   //       resetState();
  //   //       isContextLoaded.current = false;
  //   //       lastAuthUserId.current = null;
  //   //       return;
  //   //     }
  //   //     if (event === "SIGNED_IN") {
  //   //       if (lastAuthUserId.current !== authId) {
  //   //         isContextLoaded.current = false;
  //   //         await loadUserContext();
  //   //       }
  //   //     }
  //   //   },
  //   // );

  //   const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
  //     if (event === "SIGNED_IN") {
  //       // Force a re-fetch by clearing the guard refs
  //       isContextLoaded.current = false;
  //       lastAuthUserId.current = null;
  //       await loadUserContext();
  //     }

  //     if (event === "SIGNED_OUT") {
  //       resetState();
  //       isContextLoaded.current = false;
  //       lastAuthUserId.current = null;
  //     }
  //   });

  //   return () => {
  //     // listener.subscription.unsubscribe();
  //     subscription.unsubscribe();
  //   };
  // }, []);
  //timeout with console error


  useEffect(() => {
    const loadUserContext = async () => {
      setLoading(true);
      try {
        const { data: auth } = await Promise.race([
          supabase.auth.getUser(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("getUser timeout")), 30000)
          )
        ]) as any;

        const authId = auth.user?.id ?? null;

        if (isContextLoaded.current && lastAuthUserId.current === authId) {
          setLoading(false);
          return;
        }

        lastAuthUserId.current = authId;

        if (!auth?.user) {
          resetState();
          isContextLoaded.current = false;
          return;
        }

        const { data: userData, error } = await supabase
          .from("users")
          .select(
            "userId, fullName, mobile, email, gender, role, collegePublicId, collegeId, dateOfJoining, professionalExperienceYears",
          )
          .eq("auth_id", auth.user.id)
          .maybeSingle();

        if (error || !userData) {
          console.error("User fetch failed:", error);
          resetState();
          return;
        }

        setDateOfJoining(userData.dateOfJoining ?? null);
        setProfessionalExperienceYears(userData.professionalExperienceYears ?? null);
        setUserId(userData.userId);
        setFullName(userData.fullName);
        setMobile(userData.mobile);
        setEmail(userData.email);
        setGender(userData.gender);
        setRole(userData.role);
        setCollegePublicId(userData.collegePublicId);
        setCollegeId(userData.collegeId);
        setDateOfJoining(userData.dateOfJoining ?? null);
        setProfessionalExperienceYears(userData.professionalExperienceYears ?? null);

        try {
          const photoData = await getUserProfilePhoto(userData.userId);
          setProfilePhoto(photoData?.profileUrl ?? null);
        } catch { }

        const loader = roleLoaders[userData.role];
        if (loader) await loader(userData.userId);

        isContextLoaded.current = true;
      } catch (err: any) {
        // ← empty, preserve existing state
      } finally {
        setLoading(false);
      }
    };

    loadUserContext();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN") {
        isContextLoaded.current = false;
        lastAuthUserId.current = null;
        await loadUserContext();
      }

      if (event === "SIGNED_OUT") {
        resetState();
        isContextLoaded.current = false;
        lastAuthUserId.current = null;
      }
    });

    return () => subscription.unsubscribe();
  }, []);  
  //timeout but no console error


  const contextValue = useMemo<UserContextType>(
    () => ({
      userId,
      loading,
      fullName,
      setFullName,
      mobile,
      email,
      gender,
      role,
      collegePublicId,
      collegeId,
      studentId,
      adminId,
      financeManagerId,
      facultyId,
      collegeAdminId,
      parentId,
      collegeHrId,
      collegeEducationType,
      collegeBranchCode,
      collegeAcademicYear,
      collegeSection,
      profilePhoto,
      setProfilePhoto,
      dateOfJoining,
      professionalExperienceYears,
    }),
    [
      userId,
      loading,
      fullName,
      mobile,
      email,
      gender,
      role,
      collegePublicId,
      collegeId,
      studentId,
      adminId,
      financeManagerId,
      facultyId,
      collegeAdminId,
      parentId,
      collegeHrId,
      collegeEducationType,
      collegeBranchCode,
      collegeAcademicYear,
      collegeSection,
      profilePhoto,
      dateOfJoining,
      professionalExperienceYears,
    ],
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
