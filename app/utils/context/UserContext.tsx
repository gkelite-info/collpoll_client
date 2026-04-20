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
import { getEmployeeEmpId, getStudentRollNo } from "@/lib/helpers/identifiers/upsertIdentifier";

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
  placementEmployeeId: number | null;
  collegeEducationType: string | null;
  collegeBranchCode: string | null;
  collegeAcademicYear: string | null;
  collegeSection: string | null;
  profilePhoto: string | null;
  setProfilePhoto: React.Dispatch<React.SetStateAction<string | null>>;
  dateOfJoining: string | null;
  professionalExperienceYears: number | null;
  identifierId: string | null;
};

type RoleLoaderMap = Record<string, (userId: number, collegeId: number) => Promise<void>>;

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
  placementEmployeeId: null,
  collegeEducationType: null,
  collegeBranchCode: null,
  collegeAcademicYear: null,
  collegeSection: null,
  profilePhoto: null,
  setProfilePhoto: () => { },
  dateOfJoining: null,
  professionalExperienceYears: null,
  identifierId: null,
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
  const [placementEmployeeId, setPlacementEmployeeId] = useState<number | null>(null);
  const [collegeEducationType, setCollegeEducationType] = useState<string | null>(null);
  const [collegeBranchCode, setCollegeBranchCode] = useState<string | null>(null);
  const [collegeAcademicYear, setCollegeAcademicYear] = useState<string | null>(null);
  const [collegeSection, setCollegeSection] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [dateOfJoining, setDateOfJoining] = useState<string | null>(null);
  const [professionalExperienceYears, setProfessionalExperienceYears] = useState<number | null>(null);
  const [identifierId, setIdentifierId] = useState<string | null>(null);

  const lastAuthUserId = useRef<string | null>(null);
  const isContextLoaded = useRef(false);

  const settersRef = useRef({
    setUserId,
    setFullName,
    setMobile,
    setEmail,
    setGender,
    setRole,
    setCollegePublicId,
    setCollegeId,
    setStudentId,
    setAdminId,
    setFinanceManagerId,
    setFacultyId,
    setCollegeAdminId,
    setParentId,
    setCollegeHrId,
    setPlacementEmployeeId,
    setCollegeEducationType,
    setCollegeBranchCode,
    setCollegeAcademicYear,
    setCollegeSection,
    setProfilePhoto,
    setDateOfJoining,
    setProfessionalExperienceYears,
    setIdentifierId,
    setLoading,
  });

  const resetStateRef = useRef(() => {
    const s = settersRef.current;
    s.setUserId(null);
    s.setFullName(null);
    s.setMobile(null);
    s.setEmail(null);
    s.setGender(null);
    s.setRole(null);
    s.setCollegePublicId(null);
    s.setCollegeId(null);
    s.setStudentId(null);
    s.setAdminId(null);
    s.setFinanceManagerId(null);
    s.setFacultyId(null);
    s.setCollegeAdminId(null);
    s.setParentId(null);
    s.setCollegeHrId(null);
    s.setPlacementEmployeeId(null);
    s.setCollegeEducationType(null);
    s.setCollegeBranchCode(null);
    s.setCollegeAcademicYear(null);
    s.setCollegeSection(null);
    s.setProfilePhoto(null);
    s.setDateOfJoining(null);
    s.setProfessionalExperienceYears(null);
    s.setIdentifierId(null);
  });

  const roleLoadersRef = useRef<RoleLoaderMap>({
    Student: async (uid, cid) => {
      const s = settersRef.current;
      const [sid, studentCtx] = await Promise.all([
        getStudentId(),
        fetchStudentContext(uid),
      ]);
      s.setStudentId(sid);
      s.setCollegeEducationType(studentCtx?.collegeEducationType ?? null);
      s.setCollegeBranchCode(studentCtx?.collegeBranchCode ?? null);
      s.setCollegeAcademicYear(studentCtx?.collegeAcademicYear ?? null);
      s.setCollegeSection(studentCtx?.collegeSections ?? null);
      if (sid) {
        const rn = await getStudentRollNo(sid, cid);
        s.setIdentifierId(rn);
      } else {
        s.setIdentifierId(null);
      }
    },

    Admin: async (uid, cid) => {
      const s = settersRef.current;
      const [adminData, adminCtx, empId] = await Promise.all([
        supabase
          .from("admins")
          .select("adminId")
          .eq("userId", uid)
          .is("deletedAt", null)
          .maybeSingle(),
        fetchAdminContext(uid),
        getEmployeeEmpId(uid, cid),
      ]);
      s.setAdminId(adminData.data?.adminId ?? null);
      s.setCollegeEducationType(adminCtx?.collegeEducationType ?? null);
      s.setIdentifierId(empId ?? null);
    },

    Finance: async (uid, cid) => {
      const s = settersRef.current;
      const [financeData, financeCtx, empId] = await Promise.all([
        supabase
          .from("finance_manager")
          .select("financeManagerId")
          .eq("userId", uid)
          .eq("is_deleted", false)
          .maybeSingle(),
        fetchFinanceManagerContext(uid),
        getEmployeeEmpId(uid, cid),
      ]);
      s.setFinanceManagerId(financeData.data?.financeManagerId ?? null);
      s.setCollegeEducationType(financeCtx?.collegeEducationType ?? null);
      s.setIdentifierId(empId ?? null);
    },

    Faculty: async (uid, cid) => {
      const s = settersRef.current;
      const [facultyData, facultyCtx, empId] = await Promise.all([
        supabase
          .from("faculty")
          .select("facultyId")
          .eq("userId", uid)
          .is("deletedAt", null)
          .maybeSingle(),
        fetchFacultyContext(uid),
        getEmployeeEmpId(uid, cid),
      ]);
      s.setFacultyId(facultyData.data?.facultyId ?? null);
      s.setCollegeEducationType(facultyCtx?.faculty_edu_type ?? null);
      s.setCollegeBranchCode(facultyCtx?.college_branch ?? null);
      s.setCollegeAcademicYear(facultyCtx?.collegeAcademicYear ?? null);
      const sections =
        facultyCtx?.sections
          ?.map((sec: any) => sec.college_sections.collegeSections)
          .join(", ") ?? null;
      s.setCollegeSection(sections);
      s.setIdentifierId(empId ?? null);
    },

    CollegeAdmin: async (uid, cid) => {
      const s = settersRef.current;
      const [{ data }, empId] = await Promise.all([
        supabase
          .from("college_admin")
          .select("collegeAdminId")
          .eq("userId", uid)
          .eq("is_deleted", false)
          .maybeSingle(),
        getEmployeeEmpId(uid, cid),
      ]);
      s.setCollegeAdminId(data?.collegeAdminId ?? null);
      s.setIdentifierId(empId ?? null);
    },

    Parent: async (uid, _cid) => {
      const s = settersRef.current;
      const { data } = await supabase
        .from("parents")
        .select("parentId")
        .eq("userId", uid)
        .eq("is_deleted", false)
        .maybeSingle();
      s.setParentId(data?.parentId ?? null);
      // Parent has no identifier — identifierId stays null
    },

    CollegeHr: async (uid, cid) => {
      const s = settersRef.current;
      const [{ data }, empId] = await Promise.all([
        supabase
          .from("college_hr")
          .select("collegeHrId")
          .eq("userId", uid)
          .eq("is_deleted", false)
          .maybeSingle(),
        getEmployeeEmpId(uid, cid),
      ]);
      s.setCollegeHrId(data?.collegeHrId ?? null);
      s.setIdentifierId(empId ?? null);
    },

    PlacementOfficer: async (uid, cid) => {
      const s = settersRef.current;
      const [{ data }, empId] = await Promise.all([
        supabase
          .from("placement_employee")
          .select("placementEmployeeId")
          .eq("userId", uid)
          .eq("is_deleted", false)
          .maybeSingle(),
        getEmployeeEmpId(uid, cid),
      ]);
      s.setPlacementEmployeeId(data?.placementEmployeeId ?? null);
      s.setIdentifierId(empId ?? null);
    },

  });

  useEffect(() => {
    const loadUserContext = async () => {
      if (!isContextLoaded.current) {
        settersRef.current.setLoading(true);
      }
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
          if (!isContextLoaded.current) resetStateRef.current();
          return;
        }
        const authId = user.id;
        if (isContextLoaded.current && lastAuthUserId.current === authId) {
          return;
        }
        lastAuthUserId.current = authId;
        const { data: userData, error } = await supabase
          .from("users")
          .select(
            "userId, fullName, mobile, email, gender, role, collegePublicId, collegeId, dateOfJoining, professionalExperienceYears"
          )
          .eq("auth_id", user.id)
          .maybeSingle();
        if (error || !userData) {
          return;
        }
        const s = settersRef.current;
        s.setUserId(userData.userId);
        s.setFullName(userData.fullName);
        s.setMobile(userData.mobile);
        s.setEmail(userData.email);
        s.setGender(userData.gender);
        s.setRole(userData.role);
        s.setCollegePublicId(userData.collegePublicId);
        s.setCollegeId(userData.collegeId);
        s.setDateOfJoining(userData.dateOfJoining ?? null);
        s.setProfessionalExperienceYears(userData.professionalExperienceYears ?? null);
        try {
          const photoData = await getUserProfilePhoto(userData.userId);
          s.setProfilePhoto(photoData?.profileUrl ?? null);
        } catch { }
        const loader = roleLoadersRef.current[userData.role];
        // if (loader) await loader(userData.userId, userData.collegeId);
        const cid = Number(userData.collegeId);
        if (loader && cid) {
          await loader(userData.userId, cid);
        }
        isContextLoaded.current = true;
      } catch (err) {
        console.error("Failed to load context");
      } finally {
        settersRef.current.setLoading(false);
      }
    };

    loadUserContext();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN") {
        const incomingAuthId = session?.user?.id ?? null;
        if (
          isContextLoaded.current &&
          lastAuthUserId.current === incomingAuthId
        ) {
          return;
        }
        isContextLoaded.current = false;
        lastAuthUserId.current = null;
        await loadUserContext();
      }
      if (event === "SIGNED_OUT") {
        resetStateRef.current();
        isContextLoaded.current = false;
        lastAuthUserId.current = null;
        settersRef.current.setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
      placementEmployeeId,
      collegeEducationType,
      collegeBranchCode,
      collegeAcademicYear,
      collegeSection,
      profilePhoto,
      setProfilePhoto,
      dateOfJoining,
      professionalExperienceYears,
      identifierId,
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
      placementEmployeeId,
      collegeEducationType,
      collegeBranchCode,
      collegeAcademicYear,
      collegeSection,
      profilePhoto,
      dateOfJoining,
      professionalExperienceYears,
      identifierId,
    ]
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);