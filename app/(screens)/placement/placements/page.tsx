"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";
import { getPlacementCompanies } from "@/lib/helpers/placements/getPlacementCompanies";
import { mapCompaniesToPlacementDrives } from "@/lib/helpers/placements/getPlacementDrives";
import {
  getPlacementResultsOffers,
  PlacementResultsOffersData,
} from "@/lib/helpers/placements/getPlacementResultsOffers";
import { deletePlacementCompany } from "@/lib/helpers/placements/createPlacementCompany";
import PlacementTabs from "./components/PlacementTabs";
import PlacementRightPanel from "./components/PlacementRightPanel";
import CompanyManagementView from "./components/CompanyManagementView";
import PlacementDrivesView from "./components/PlacementDrivesView";
import StudentApplicationsView from "./components/StudentApplicationsView";
import ResultsOffersView from "./components/ResultsOffersView";
import CreateCompanyScreen from "./components/CreateCompanyScreen";
import CreateDriveScreen from "./components/CreateDriveScreen";
import AddSelectedStudentScreen from "./components/AddSelectedStudentScreen";
import DriveStudentsScreen from "./components/DriveStudentsScreen";
import {
  placementTabs,
  PlacementTabId,
  PlacementCompany,
  PlacementDrive,
  placementTabContent,
} from "./components/mockData";
import CompanyDetailsModal from "./modal/CompanyDetailsModal";
import {
  CompanyCardsShimmer,
  PlacementRightPanelShimmer,
  PlacementTabsShimmer,
} from "./components/PlacementShimmers";

const validTabs = new Set<PlacementTabId>([
  "company-management",
  "placement-drives",
  // Hidden from UI for now. Path: app/(screens)/placement/placements/components/StudentApplicationsView.tsx
  // "student-applications",
  "results-offers",
]);

function getFileNameFromUrl(value: string) {
  const cleanValue = value.split("?")[0];
  return decodeURIComponent(cleanValue.split("/").pop() || value);
}

function splitPhone(phone: string) {
  const phoneMatch = phone.match(/^(\+\d{1,3})(\d{10})$/);
  if (!phoneMatch) return { countryCode: "+91", phone };
  return { countryCode: phoneMatch[1], phone: phoneMatch[2] };
}

function mapCompanyToInitialForm(company: PlacementCompany) {
  const phoneParts = splitPhone(company.phone === "Not provided" ? "" : company.phone);

  return {
    id: String(company.id),
    placementCompanyIds: company.placementCompanyIds ?? [company.id],
    companyName: company.name,
    email: company.email,
    ...phoneParts,
    description: company.longDescription || company.description,
    website: company.website,
    jobRole: company.role,
    jobRoleOther: "",
    requiredSkills: company.skills.join(", "),
    jobType: company.jobTypeValue || "",
    workMode: company.workModeValue || "",
    locations: company.locations.join(", "),
    annualPackage: company.packageDetails,
    driveType: company.driveTypeValue || "",
    startDate: company.startDate || "",
    endDate: company.endDate || "",
    educationType: company.collegeEducationId
      ? {
        id: company.collegeEducationId,
        label: company.educationTypeName || "Selected Education",
      }
      : null,
    branch: company.collegeBranchId
      ? {
        id: company.collegeBranchId,
        label: company.branchName || String(company.collegeBranchId),
      }
      : null,
    academicYear: company.collegeAcademicYearId
      ? {
        id: company.collegeAcademicYearId,
        label: company.academicYear || String(company.collegeAcademicYearId),
      }
      : null,
    eligibilityCriteria: company.eligibilityCriteria || "",
    existingLogoName: getFileNameFromUrl(company.logo),
    existingCertificates: company.attachments.map(getFileNameFromUrl),
  };
}

function PlacementPageFallback() {
  return (
    <section className="flex min-h-screen gap-3 overflow-hidden">
      <div className="flex min-w-11.25 flex-1 flex-col px-2">
        <div className="shrink-0">
          <div className="h-10 w-48 animate-pulse rounded-lg bg-gray-200" />
          <div className="mt-2 h-5 w-8/12 animate-pulse rounded bg-gray-200" />
          <PlacementTabsShimmer />
        </div>

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-2 pb-4">
          <CompanyCardsShimmer />
        </div>
      </div>

      <PlacementRightPanelShimmer />
    </section>
  );
}

function PlacementPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { collegeId, placementEmployeeId, loading: userLoading } = useUser();
  const [isPlacementLoading, setIsPlacementLoading] = useState(true);
  const [companies, setCompanies] = useState<PlacementCompany[]>([]);
  const [placementDrives, setPlacementDrives] = useState<PlacementDrive[]>([]);
  const [resultsOffers, setResultsOffers] =
    useState<PlacementResultsOffersData>({
      companyStats: [],
      branchStats: [],
      placedStudents: [],
    });
  const [isCompaniesLoading, setIsCompaniesLoading] = useState(true);
  const [isDrivesLoading, setIsDrivesLoading] = useState(true);
  const [isResultsOffersLoading, setIsResultsOffersLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsPlacementLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  const loadCompanies = useCallback(async () => {
    if (userLoading) return;

    if (!collegeId) {
      setCompanies([]);
      setPlacementDrives([]);
      setResultsOffers({
        companyStats: [],
        branchStats: [],
        placedStudents: [],
      });
      setIsCompaniesLoading(false);
      setIsDrivesLoading(false);
      setIsResultsOffersLoading(false);
      return;
    }

    setIsCompaniesLoading(true);
    setIsDrivesLoading(true);
    setIsResultsOffersLoading(true);
    try {
      const [fetchedCompanies, fetchedResultsOffers] = await Promise.all([
        getPlacementCompanies({
          collegeId,
          placementOfficerId: placementEmployeeId,
          includeExpired: true,
        }),
        getPlacementResultsOffers({
          collegeId,
          placementOfficerId: placementEmployeeId,
        }),
      ]);
      const fetchedDrives = await mapCompaniesToPlacementDrives(
        fetchedCompanies,
        collegeId,
      );

      setCompanies(fetchedCompanies);
      setPlacementDrives(fetchedDrives);
      setResultsOffers(fetchedResultsOffers);
    } catch {
      setCompanies([]);
      setPlacementDrives([]);
      setResultsOffers({
        companyStats: [],
        branchStats: [],
        placedStudents: [],
      });
    } finally {
      setIsCompaniesLoading(false);
      setIsDrivesLoading(false);
      setIsResultsOffersLoading(false);
    }
  }, [collegeId, placementEmployeeId, userLoading]);

  useEffect(() => {
    void loadCompanies();
  }, [loadCompanies]);

  const handleResultsOfferStatusSaved = (
    studentPlacementApplicationId: number,
    status: string,
  ) => {
    setResultsOffers((prev) => ({
      ...prev,
      placedStudents: prev.placedStudents.map((student) =>
        student.id === studentPlacementApplicationId
          ? { ...student, status }
          : student,
      ),
    }));
  };

  const activeTabParam = searchParams.get("tab");
  const activeTab: PlacementTabId =
    activeTabParam && validTabs.has(activeTabParam as PlacementTabId)
      ? (activeTabParam as PlacementTabId)
      : "company-management";

  const selectedCompanyId = Number(searchParams.get("companyId"));
  const editCompanyId = Number(searchParams.get("editCompanyId"));
  const selectedDriveId = Number(searchParams.get("driveId"));
  const isCreateCompanyOpen = searchParams.get("createCompany") === "1";
  const isCreateDriveOpen = searchParams.get("createDrive") === "1";
  const isAddStudentOpen = searchParams.get("addStudent") === "1";

  const updateQuery = (
    updates: Record<string, string | null>,
    options?: { replaceAllModalKeys?: boolean },
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    if (options?.replaceAllModalKeys) {
      params.delete("companyId");
      params.delete("editCompanyId");
      params.delete("driveId");
      params.delete("createCompany");
      params.delete("createDrive");
      params.delete("addStudent");
    }

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const handleTabChange = (tabId: PlacementTabId) => {
    updateQuery({ tab: tabId }, { replaceAllModalKeys: true });
  };

  const modalActions = {
    openCompany: (companyId: number) =>
      updateQuery(
        { tab: "company-management", companyId: String(companyId) },
        { replaceAllModalKeys: true },
      ),
    closeCompany: () => updateQuery({ companyId: null }),
    openCreateCompany: () =>
      updateQuery(
        { createCompany: "1" },
        { replaceAllModalKeys: true },
      ),
    openEditCompany: (companyId: number) =>
      updateQuery(
        { tab: "company-management", editCompanyId: String(companyId) },
        { replaceAllModalKeys: true },
      ),
    closeCreateCompany: () => {
      updateQuery({ createCompany: null, editCompanyId: null });
      void loadCompanies();
    },
    openCreateDrive: () =>
      updateQuery(
        { tab: "placement-drives", createDrive: "1" },
        { replaceAllModalKeys: true },
      ),
    closeCreateDrive: () => updateQuery({ createDrive: null }),
    openDrive: (driveId: number) =>
      updateQuery(
        { tab: "placement-drives", driveId: String(driveId) },
        { replaceAllModalKeys: true },
      ),
    closeDrive: () => updateQuery({ driveId: null }),
    openAddStudent: () =>
      updateQuery(
        { tab: "student-applications", addStudent: "1" },
        { replaceAllModalKeys: true },
      ),
    closeAddStudent: () => updateQuery({ addStudent: null }),
  };

  const handleDeleteCompany = async (company: PlacementCompany) => {
    const placementCompanyIds = company.placementCompanyIds ?? [company.id];

    try {
      await deletePlacementCompany(placementCompanyIds);
      toast.success("Company deleted successfully");
      await loadCompanies();
    } catch {
      toast.error("Failed to delete company. Please try again.");
      throw new Error("Failed to delete company");
    }
  };

  const selectedCompany =
    Number.isNaN(selectedCompanyId)
      ? null
      : companies.find(
        (company) => company.id === selectedCompanyId,
      ) ?? null;

  const editingCompany =
    Number.isNaN(editCompanyId)
      ? null
      : companies.find((company) => company.id === editCompanyId) ?? null;

  const selectedDrive =
    Number.isNaN(selectedDriveId)
      ? null
      : placementDrives.find(
        (drive) => drive.id === selectedDriveId,
      ) ?? null;

  if (isPlacementLoading) {
    return <PlacementPageFallback />;
  }

  if (isCreateCompanyOpen || editingCompany) {
    return (
      <section className="min-h-screen overflow-y-auto px-2 pb-4">
        <CreateCompanyScreen
          onCancel={modalActions.closeCreateCompany}
          initialData={
            editingCompany ? mapCompanyToInitialForm(editingCompany) : undefined
          }
        />
      </section>
    );
  }

  if (isCreateDriveOpen) {
    return (
      <section className="min-h-screen overflow-y-auto px-2 pb-4">
        <CreateDriveScreen onCancel={modalActions.closeCreateDrive} />
      </section>
    );
  }

  if (isAddStudentOpen) {
    return (
      <section className="min-h-screen overflow-y-auto px-2 pb-4">
        <AddSelectedStudentScreen onCancel={modalActions.closeAddStudent} />
      </section>
    );
  }

  if (selectedDrive) {
    return (
      <DriveStudentsScreen
        drive={selectedDrive}
        onBack={modalActions.closeDrive}
      />
    );
  }

  return (
    <>
      <section className="flex h-[88vh] gap-1 overflow-hidden">
        <div className="flex w-[68%] flex-1 flex-col px-2 h-full overflow-y-auto">
          <div className="shrink-0">
            <h1 className="text-[32px] font-semibold text-[#282828]">
              Placements
            </h1>
            <p className="mt-1 text-[16px] text-[#4F4F4F]">
              {placementTabs.find((tab) => tab.id === activeTab)?.description}
            </p>

            <PlacementTabs
              tabs={placementTabs}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </div>

          <div className="mt-4 min-h-0 flex-1 overflow-hidden">
            {activeTab === "company-management" && (
              isCompaniesLoading ? (
                <div className="h-full overflow-y-auto pr-2 pb-4">
                  <CompanyCardsShimmer />
                </div>
              ) : (
                <CompanyManagementView
                  companies={companies}
                  onCardClick={modalActions.openCompany}
                  onCreateCompany={modalActions.openCreateCompany}
                  onEditCompany={modalActions.openEditCompany}
                  onDeleteCompany={handleDeleteCompany}
                />
              )
            )}

            {activeTab === "placement-drives" && (
              <PlacementDrivesView
                drives={placementDrives}
                collegeId={collegeId}
                isLoading={isDrivesLoading}
                onCreateDrive={modalActions.openCreateDrive}
                onDriveClick={modalActions.openDrive}
              />
            )}

            {activeTab === "student-applications" && (
              <StudentApplicationsView
                students={placementTabContent.studentApplications.students}
              />
            )}

            {activeTab === "results-offers" && (
              <ResultsOffersView
                companyStats={resultsOffers.companyStats}
                branchStats={resultsOffers.branchStats}
                placedStudents={resultsOffers.placedStudents}
                isLoading={isResultsOffersLoading}
                placementEmployeeId={placementEmployeeId}
                onStatusSaved={handleResultsOfferStatusSaved}
              />
            )}
          </div>
        </div>
        <div className="w-[32%] h-full flex flex-col">
          <PlacementRightPanel />
        </div>
      </section>

      {selectedCompany && (
        <CompanyDetailsModal
          company={selectedCompany}
          onClose={modalActions.closeCompany}
        />
      )}

    </>
  );
}

export default function PlacementPage() {
  return (
    <Suspense fallback={<PlacementPageFallback />}>
      <PlacementPageContent />
    </Suspense>
  );
}
