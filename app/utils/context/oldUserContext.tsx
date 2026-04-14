// "use client";

// import {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   useMemo,
//   useRef,
// } from "react";
// import { supabase } from "@/lib/supabaseClient";
// import { getStudentId } from "@/lib/helpers/studentAPI";
// import { fetchStudentContext } from "./student/studentContextAPI";
// import { getUserProfilePhoto } from "@/lib/helpers/profile/profileInfo";
// import { fetchFacultyContext } from "./faculty/facultyContextAPI";
// import { fetchAdminContext } from "./admin/adminContextAPI";
// import { fetchFinanceManagerContext } from "./financeManager/financeManagerContextAPI";
// import { getEmployeeEmpId, getStudentRollNo } from "@/lib/helpers/identifiers/upsertIdentifier";

// type UserContextType = {
//   userId: number | null;
//   loading: boolean;
//   fullName: string | null;
//   setFullName: React.Dispatch<React.SetStateAction<string | null>>;
//   mobile: string | null;
//   email: string | null;
//   gender: string | null;
//   role: string | null;
//   collegePublicId: string | null;
//   collegeId: number | null;
//   studentId: number | null;
//   adminId: number | null;
//   financeManagerId: number | null;
//   facultyId: number | null;
//   collegeAdminId: number | null;
//   parentId: number | null;
//   collegeHrId: number | null;
//   collegeEducationType: string | null;
//   collegeBranchCode: string | null;
//   collegeAcademicYear: string | null;
//   collegeSection: string | null;
//   profilePhoto: string | null;
//   setProfilePhoto: React.Dispatch<React.SetStateAction<string | null>>;
//   dateOfJoining: string | null;
//   professionalExperienceYears: number | null;
//   identifierId: string | null;
// };

// const UserContext = createContext<UserContextType>({
//   userId: null,
//   loading: true,
//   fullName: null,
//   setFullName: () => { },
//   mobile: null,
//   email: null,
//   gender: null,
//   role: null,
//   collegePublicId: null,
//   collegeId: null,
//   studentId: null,
//   adminId: null,
//   financeManagerId: null,
//   facultyId: null,
//   collegeAdminId: null,
//   parentId: null,
//   collegeHrId: null,
//   collegeEducationType: null,
//   collegeBranchCode: null,
//   collegeAcademicYear: null,
//   collegeSection: null,
//   profilePhoto: null,
//   setProfilePhoto: () => { },
//   dateOfJoining: null,
//   professionalExperienceYears: null,
//   identifierId: null,
// });

// export const UserProvider = ({ children }: { children: React.ReactNode }) => {
//   const [userId, setUserId] = useState<number | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [fullName, setFullName] = useState<string | null>(null);
//   const [mobile, setMobile] = useState<string | null>(null);
//   const [email, setEmail] = useState<string | null>(null);
//   const [gender, setGender] = useState<string | null>(null);
//   const [role, setRole] = useState<string | null>(null);
//   const [collegePublicId, setCollegePublicId] = useState<string | null>(null);
//   const [collegeId, setCollegeId] = useState<number | null>(null);
//   const [studentId, setStudentId] = useState<number | null>(null);
//   const [adminId, setAdminId] = useState<number | null>(null);
//   const [financeManagerId, setFinanceManagerId] = useState<number | null>(null);
//   const [facultyId, setFacultyId] = useState<number | null>(null);
//   const [collegeAdminId, setCollegeAdminId] = useState<number | null>(null);
//   const [parentId, setParentId] = useState<number | null>(null);
//   const [collegeHrId, setCollegeHrId] = useState<number | null>(null);
//   const [collegeEducationType, setCollegeEducationType] = useState<string | null>(null);
//   const [collegeBranchCode, setCollegeBranchCode] = useState<string | null>(null);
//   const [collegeAcademicYear, setCollegeAcademicYear] = useState<string | null>(null);
//   const [collegeSection, setCollegeSection] = useState<string | null>(null);
//   const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
//   const [dateOfJoining, setDateOfJoining] = useState<string | null>(null);
//   const [professionalExperienceYears, setProfessionalExperienceYears] = useState<number | null>(null);
//   const [identifierId, setIdentifierId] = useState<string | null>(null);
//   const lastAuthUserId = useRef<string | null>(null);
//   const isContextLoaded = useRef(false);

//   const resetState = () => {
//     setUserId(null);
//     setFullName(null);
//     setMobile(null);
//     setEmail(null);
//     setGender(null);
//     setRole(null);
//     setCollegePublicId(null);
//     setCollegeId(null);
//     setStudentId(null);
//     setAdminId(null);
//     setFinanceManagerId(null);
//     setFacultyId(null);
//     setCollegeAdminId(null);
//     setParentId(null);
//     setCollegeHrId(null);
//     setCollegeEducationType(null);
//     setCollegeBranchCode(null);
//     setCollegeAcademicYear(null);
//     setCollegeSection(null);
//     setProfilePhoto(null);
//     setDateOfJoining(null);
//     setProfessionalExperienceYears(null);
//     setIdentifierId(null)
//   };

//   const roleLoaders: Record<string, (userId: number, collegeId: number) => Promise<void>> = {
//     Student: async (uid, cid) => {
//       const [sid, studentCtx] = await Promise.all([
//         getStudentId(),
//         fetchStudentContext(uid),
//       ]);
//       setStudentId(sid);
//       setCollegeEducationType(studentCtx?.collegeEducationType ?? null);
//       setCollegeBranchCode(studentCtx?.collegeBranchCode ?? null);
//       setCollegeAcademicYear(studentCtx?.collegeAcademicYear ?? null);
//       setCollegeSection(studentCtx?.collegeSections ?? null);
//       if (sid) {
//         const rn = await getStudentRollNo(sid, cid);
//         setIdentifierId(rn);
//       }
//     },

//     Admin: async (uid, cid) => {
//       const [adminData, adminCtx, empId] = await Promise.all([
//         supabase
//           .from("admins")
//           .select("adminId")
//           .eq("userId", uid)
//           .is("deletedAt", null)
//           .maybeSingle(),
//         fetchAdminContext(uid),
//         getEmployeeEmpId(uid, cid),
//       ]);
//       setAdminId(adminData.data?.adminId ?? null);
//       setCollegeEducationType(adminCtx?.collegeEducationType ?? null);
//       setIdentifierId(empId);
//     },

//     Finance: async (uid, cid) => {
//       const [financeData, financeCtx, empId] = await Promise.all([
//         supabase
//           .from("finance_manager")
//           .select("financeManagerId")
//           .eq("userId", uid)
//           .eq("is_deleted", false)
//           .maybeSingle(),
//         fetchFinanceManagerContext(uid),
//         getEmployeeEmpId(uid, cid),
//       ]);
//       setFinanceManagerId(financeData.data?.financeManagerId ?? null);
//       setCollegeEducationType(financeCtx?.collegeEducationType ?? null);
//       setIdentifierId(empId);
//     },

//     Faculty: async (uid, cid) => {
//       const [facultyData, facultyCtx, empId] = await Promise.all([
//         supabase
//           .from("faculty")
//           .select("facultyId")
//           .eq("userId", uid)
//           .is("deletedAt", null)
//           .maybeSingle(),
//         fetchFacultyContext(uid),
//         getEmployeeEmpId(uid, cid),
//       ]);
//       setFacultyId(facultyData.data?.facultyId ?? null);
//       setCollegeEducationType(facultyCtx?.faculty_edu_type ?? null);
//       setCollegeBranchCode(facultyCtx?.college_branch ?? null);
//       setCollegeAcademicYear(facultyCtx?.collegeAcademicYear ?? null);
//       const sections =
//         facultyCtx?.sections
//           ?.map((s: any) => s.college_sections.collegeSections)
//           .join(", ") ?? null;
//       setCollegeSection(sections);
//       setIdentifierId(empId);
//     },

//     // CollegeAdmin: async (uid, cid) => {
//     //   const { data } = await supabase
//     //     .from("college_admin")
//     //     .select("collegeAdminId")
//     //     .eq("userId", uid)
//     //     .eq("is_deleted", false)
//     //     .maybeSingle();
//     //   setCollegeAdminId(data?.collegeAdminId ?? null);
//     // },

//     CollegeAdmin: async (uid, cid) => {
//       const [{ data }, empId] = await Promise.all([
//         supabase
//           .from("college_admin")
//           .select("collegeAdminId")
//           .eq("userId", uid)
//           .eq("is_deleted", false)
//           .maybeSingle(),
//         getEmployeeEmpId(uid, cid),
//       ]);
//       setCollegeAdminId(data?.collegeAdminId ?? null);
//       setIdentifierId(empId);
//     },

//     Parent: async (uid, _cid) => {
//       const { data } = await supabase
//         .from("parents")
//         .select("parentId")
//         .eq("userId", uid)
//         .eq("is_deleted", false)
//         .maybeSingle();
//       setParentId(data?.parentId ?? null);
//     },

//     // CollegeHR: async (uid) => {
//     //   const { data } = await supabase
//     //     .from("college_hr")
//     //     .select("collegeHrId")
//     //     .eq("userId", uid)
//     //     .eq("is_deleted", false)
//     //     .maybeSingle();
//     //   setCollegeHrId(data?.collegeHrId ?? null);
//     // },

//     CollegeHR: async (uid, cid) => {
//       const [{ data }, empId] = await Promise.all([
//         supabase
//           .from("college_hr")
//           .select("collegeHrId")
//           .eq("userId", uid)
//           .eq("is_deleted", false)
//           .maybeSingle(),
//         getEmployeeEmpId(uid, cid),
//       ]);
//       setCollegeHrId(data?.collegeHrId ?? null);
//       setIdentifierId(empId);
//     },
//   };

//   useEffect(() => {
//     const loadUserContext = async () => {
//       if (!isContextLoaded.current) {
//         setLoading(true);
//       }

//       try {
//         const { data: { user }, error: userError } = await supabase.auth.getUser();

//         if (userError || !user) {
//           if (!isContextLoaded.current) resetState();
//           return;
//         }

//         const authId = user.id;

//         if (isContextLoaded.current && lastAuthUserId.current === authId) {
//           return;
//         }

//         lastAuthUserId.current = authId;

//         const { data: userData, error } = await supabase
//           .from("users")
//           .select("userId, fullName, mobile, email, gender, role, collegePublicId, collegeId, dateOfJoining, professionalExperienceYears")
//           .eq("auth_id", user.id)
//           .maybeSingle();

//         if (error || !userData) {
//           return;
//         }

//         setUserId(userData.userId);
//         setFullName(userData.fullName);
//         setMobile(userData.mobile);
//         setEmail(userData.email);
//         setGender(userData.gender);
//         setRole(userData.role);
//         setCollegePublicId(userData.collegePublicId);
//         setCollegeId(userData.collegeId);
//         setDateOfJoining(userData.dateOfJoining ?? null);
//         setProfessionalExperienceYears(userData.professionalExperienceYears ?? null);

//         try {
//           const photoData = await getUserProfilePhoto(userData.userId);
//           setProfilePhoto(photoData?.profileUrl ?? null);
//         } catch { }

//         const loader = roleLoaders[userData.role];
//         if (loader) await loader(userData.userId, userData.collegeId);

//         isContextLoaded.current = true;
//       } catch (err) {
//         console.error("Failed to load context");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadUserContext();

//     const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {

//       if (event === "SIGNED_IN") {
//         const incomingAuthId = session?.user?.id ?? null;

//         if (isContextLoaded.current && lastAuthUserId.current === incomingAuthId) {
//           return;
//         }

//         isContextLoaded.current = false;
//         lastAuthUserId.current = null;
//         await loadUserContext();
//       }

//       if (event === "SIGNED_OUT") {
//         resetState();
//         isContextLoaded.current = false;
//         lastAuthUserId.current = null;
//         setLoading(false);
//       }
//     });


//     return () => {
//       subscription.unsubscribe();
//     };
//   }, []);

//   const contextValue = useMemo<UserContextType>(
//     () => ({
//       userId,
//       loading,
//       fullName,
//       setFullName,
//       mobile,
//       email,
//       gender,
//       role,
//       collegePublicId,
//       collegeId,
//       studentId,
//       adminId,
//       financeManagerId,
//       facultyId,
//       collegeAdminId,
//       parentId,
//       collegeHrId,
//       collegeEducationType,
//       collegeBranchCode,
//       collegeAcademicYear,
//       collegeSection,
//       profilePhoto,
//       setProfilePhoto,
//       dateOfJoining,
//       professionalExperienceYears,
//       identifierId
//     }),
//     [
//       userId,
//       loading,
//       fullName,
//       mobile,
//       email,
//       gender,
//       role,
//       collegePublicId,
//       collegeId,
//       studentId,
//       adminId,
//       financeManagerId,
//       facultyId,
//       collegeAdminId,
//       parentId,
//       collegeHrId,
//       collegeEducationType,
//       collegeBranchCode,
//       collegeAcademicYear,
//       collegeSection,
//       profilePhoto,
//       dateOfJoining,
//       professionalExperienceYears,
//       identifierId
//     ]
//   );

//   return (
//     <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
//   );
// };

// export const useUser = () => useContext(UserContext);