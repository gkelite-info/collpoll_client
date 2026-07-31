"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { supabase } from "@/lib/supabaseClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUserFullProfile } from "@/app/utils/context/userContextAPI";

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
  collegeCode: string | null;
  studentId: number | null;
  adminId: number | null;
  financeManagerId: number | null;
  accountantId: number | null;
  facultyId: number | null;
  collegeAdminId: number | null;
  parentId: number | null;
  collegeHrId: number | null;
  placementEmployeeId: number | null;
  wellBeingId: number | null;
  wellBeingIds: number[];
  wellBeingRegistrationTypes: string[];
  wellBeingCategoryId: number | null;
  wellBeingCategoryIds: number[];
  wellBeingCategoryName: string | null;
  wellBeingCategoryNames: string[];
  collegeEducationId: number | null;
  collegeEducationType: string | null;
  collegeBranchCode: string | null;
  collegeAcademicYear: string | null;
  collegeSection: string | null;
  profilePhoto: string | null;
  setProfilePhoto: React.Dispatch<React.SetStateAction<string | null>>;
  dateOfJoining: string | null;
  professionalExperienceYears: number | null;
  identifierId: string | null;
  refreshUserContext: () => Promise<void>;
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
  collegeCode: null,
  studentId: null,
  adminId: null,
  financeManagerId: null,
  accountantId: null,
  facultyId: null,
  collegeAdminId: null,
  parentId: null,
  collegeHrId: null,
  placementEmployeeId: null,
  wellBeingId: null,
  wellBeingIds: [],
  wellBeingRegistrationTypes: [],
  wellBeingCategoryId: null,
  wellBeingCategoryIds: [],
  wellBeingCategoryName: null,
  wellBeingCategoryNames: [],
  collegeEducationId: null,
  collegeEducationType: null,
  collegeBranchCode: null,
  collegeAcademicYear: null,
  collegeSection: null,
  profilePhoto: null,
  setProfilePhoto: () => { },
  dateOfJoining: null,
  professionalExperienceYears: null,
  identifierId: null,
  refreshUserContext: async () => { },
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();

  const { data: userData, isLoading: queryLoading, isError } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => fetchUserFullProfile(queryClient),
    staleTime: Infinity,
    retry: false,
  });

  const [localOverrides, setLocalOverrides] = useState<{
    fullName?: string | null;
    profilePhoto?: string | null;
  }>({});

  const setFullName = useCallback((name: React.SetStateAction<string | null>) => {
    setLocalOverrides(prev => {
      const currentVal = prev.fullName !== undefined ? prev.fullName : (userData?.fullName ?? null);
      const newVal = typeof name === 'function' ? name(currentVal) : name;
      return { ...prev, fullName: newVal };
    });
  }, [userData]);

  const setProfilePhoto = useCallback((photo: React.SetStateAction<string | null>) => {
    setLocalOverrides(prev => {
      const currentVal = prev.profilePhoto !== undefined ? prev.profilePhoto : (userData?.profilePhoto ?? null);
      const newVal = typeof photo === 'function' ? photo(currentVal) : photo;
      return { ...prev, profilePhoto: newVal };
    });
  }, [userData]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      }
      if (event === "SIGNED_OUT") {
        queryClient.setQueryData(["userProfile"], null);
        queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const refreshUserContext = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["userProfile"] });
  }, [queryClient]);

  const contextValue = useMemo<UserContextType>(() => {
    const loading = queryLoading || (!userData && !isError);
    if (!userData) {
      return {
        loading,
        userId: null,
        fullName: null,
        setFullName,
        mobile: null,
        email: null,
        gender: null,
        role: null,
        collegePublicId: null,
        collegeId: null,
        collegeCode: null,
        studentId: null,
        adminId: null,
        financeManagerId: null,
        accountantId: null,
        facultyId: null,
        collegeAdminId: null,
        parentId: null,
        collegeHrId: null,
        placementEmployeeId: null,
        wellBeingId: null,
        wellBeingIds: [],
        wellBeingRegistrationTypes: [],
        wellBeingCategoryId: null,
        wellBeingCategoryIds: [],
        wellBeingCategoryName: null,
        wellBeingCategoryNames: [],
        collegeEducationId: null,
        collegeEducationType: null,
        collegeBranchCode: null,
        collegeAcademicYear: null,
        collegeSection: null,
        profilePhoto: null,
        setProfilePhoto,
        dateOfJoining: null,
        professionalExperienceYears: null,
        identifierId: null,
        refreshUserContext,
      };
    }

    return {
      loading: false,
      userId: userData.userId ?? null,
      fullName: localOverrides.fullName !== undefined ? localOverrides.fullName : (userData.fullName ?? null),
      setFullName,
      mobile: userData.mobile ?? null,
      email: userData.email ?? null,
      gender: userData.gender ?? null,
      role: userData.role ?? null,
      collegePublicId: userData.collegePublicId ?? null,
      collegeId: userData.collegeId ?? null,
      collegeCode: userData.collegeCode ?? null,
      studentId: userData.studentId ?? null,
      adminId: userData.adminId ?? null,
      financeManagerId: userData.financeManagerId ?? null,
      accountantId: userData.accountantId ?? null,
      facultyId: userData.facultyId ?? null,
      collegeAdminId: userData.collegeAdminId ?? null,
      parentId: userData.parentId ?? null,
      collegeHrId: userData.collegeHrId ?? null,
      placementEmployeeId: userData.placementEmployeeId ?? null,
      wellBeingId: userData.wellBeingId ?? null,
      wellBeingIds: userData.wellBeingIds ?? [],
      wellBeingRegistrationTypes: userData.wellBeingRegistrationTypes ?? [],
      wellBeingCategoryId: userData.wellBeingCategoryId ?? null,
      wellBeingCategoryIds: userData.wellBeingCategoryIds ?? [],
      wellBeingCategoryName: userData.wellBeingCategoryName ?? null,
      wellBeingCategoryNames: userData.wellBeingCategoryNames ?? [],
      collegeEducationId: userData.collegeEducationId ?? null,
      collegeEducationType: userData.collegeEducationType ?? null,
      collegeBranchCode: userData.collegeBranchCode ?? null,
      collegeAcademicYear: userData.collegeAcademicYear ?? null,
      collegeSection: userData.collegeSection ?? null,
      profilePhoto: localOverrides.profilePhoto !== undefined ? localOverrides.profilePhoto : (userData.profilePhoto ?? null),
      setProfilePhoto,
      dateOfJoining: userData.dateOfJoining ?? null,
      professionalExperienceYears: userData.professionalExperienceYears ?? null,
      identifierId: userData.identifierId ?? null,
      refreshUserContext,
    };
  }, [userData, queryLoading, isError, localOverrides, setFullName, setProfilePhoto, refreshUserContext]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
