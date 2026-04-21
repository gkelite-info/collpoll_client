"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  "student-applications",
  "results-offers",
]);

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
  const [isPlacementLoading, setIsPlacementLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsPlacementLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  const activeTabParam = searchParams.get("tab");
  const activeTab: PlacementTabId =
    activeTabParam && validTabs.has(activeTabParam as PlacementTabId)
      ? (activeTabParam as PlacementTabId)
      : "company-management";

  const selectedCompanyId = Number(searchParams.get("companyId"));
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
    closeCreateCompany: () => updateQuery({ createCompany: null }),
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

  const selectedCompany =
    Number.isNaN(selectedCompanyId)
      ? null
      : placementTabContent.companyManagement.companies.find(
          (company) => company.id === selectedCompanyId,
        ) ?? null;

  const selectedDrive =
    Number.isNaN(selectedDriveId)
      ? null
      : placementTabContent.placementDrives.drives.find(
          (drive) => drive.id === selectedDriveId,
        ) ?? null;

  if (isPlacementLoading) {
    return <PlacementPageFallback />;
  }

  if (isCreateCompanyOpen) {
    return (
      <section className="min-h-screen overflow-y-auto px-2 pb-4">
        <CreateCompanyScreen onCancel={modalActions.closeCreateCompany} />
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
      <section className="flex min-h-screen gap-3 overflow-hidden">
        <div className="flex min-w-11.25 flex-1 flex-col px-2 ">
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

          <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-2 pb-4">
            {activeTab === "company-management" && (
              <CompanyManagementView
                companies={placementTabContent.companyManagement.companies}
                onCardClick={modalActions.openCompany}
                onCreateCompany={modalActions.openCreateCompany}
              />
            )}

            {activeTab === "placement-drives" && (
              <PlacementDrivesView
                stats={placementTabContent.placementDrives.stats}
                drives={placementTabContent.placementDrives.drives}
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
                companyStats={placementTabContent.resultsOffers.companyStats}
                branchStats={placementTabContent.resultsOffers.branchStats}
                placedStudents={placementTabContent.resultsOffers.placedStudents}
              />
            )}
          </div>
        </div>

        <PlacementRightPanel />
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
