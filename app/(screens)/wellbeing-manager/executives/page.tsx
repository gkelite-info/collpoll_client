"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Plus } from "@phosphor-icons/react";
import WellbeingRight from "../components/WellbeingRight";
import CreateExecutiveModal from "../components/CreateExecutiveModal";
import { Pagination } from "../../admin/academic-setup/components/pagination";
import ExecutiveCard from "./components/ExecutiveCard";
import { ExecutiveShimmer, TabsShimmer } from "./components/ExecutiveShimmer";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchAllActiveWellbeingCategories } from "@/lib/helpers/wellbeingCategories/wellbeingCategoryAPI";
import { fetchPaginatedWellbeingExecutives } from "@/lib/helpers/wellbeing/wellbeingExecutiveAPI";
import type { WellbeingCategoryWithSubs } from "@/lib/helpers/wellbeingCategories/types";
import toast, { Toaster } from "react-hot-toast";

const itemsPerPage = 9;

export default function ExecutivesPage() {
  const { collegeId } = useUser();
  const [categories, setCategories] = useState<WellbeingCategoryWithSubs[]>([]);
  const [activeTab, setActiveTab] = useState<number | "All">("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [executivesList, setExecutivesList] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingExecutives, setIsLoadingExecutives] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const loadCategories = useCallback(async () => {
    if (!collegeId) return;
    try {
      setIsLoadingCategories(true);
      const data = await fetchAllActiveWellbeingCategories(collegeId);
      setCategories(data);
    } catch (err) {
      toast.error("Failed to load categories");
    } finally {
      setIsLoadingCategories(false);
    }
  }, [collegeId]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const loadExecutives = useCallback(async () => {
    if (!collegeId) return;
    try {
      setIsLoadingExecutives(true);
      const categoryId = activeTab === "All" ? null : activeTab;
      const { executives, totalCount: count } = await fetchPaginatedWellbeingExecutives(
        collegeId,
        currentPage,
        itemsPerPage,
        categoryId
      );
      setExecutivesList(executives);
      setTotalCount(count);
    } catch (err) {
      toast.error("Failed to load executives");
    } finally {
      setIsLoadingExecutives(false);
    }
  }, [collegeId, currentPage, activeTab]);

  useEffect(() => {
    loadExecutives();
  }, [loadExecutives]);

  const tabs = useMemo(() => {
    return [
      { id: "All" as const, name: "All" },
      ...categories.map((cat) => ({
        id: cat.categoryId,
        name: cat.categoryName,
      })),
    ];
  }, [categories]);

  const handleTabChange = (tabId: number | "All") => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  const getCategoryName = (categoryId: number) => {
    const cat = categories.find((c) => c.categoryId === categoryId);
    return cat ? cat.categoryName : "Unknown";
  };

  return (
    <main className="flex min-h-screen w-full flex-col lg:flex-row pb-5">
      <section className="flex w-full flex-col p-2 lg:h-full lg:w-[68%] lg:py-5">
        <div className="sticky top-0 z-20 mb-4 grid grid-cols-1 gap-3 bg-[#F4F4F4] py-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-start lg:static lg:block lg:py-0">
          {isLoadingCategories ? (
            <TabsShimmer />
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto pb-1 sm:grid-cols-3 md:grid-cols-[repeat(auto-fill,minmax(120px,1fr))] lg:flex lg:flex-row lg:overflow-x-auto lg:whitespace-nowrap lg:max-h-none lg:pb-2 custom-scrollbar">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`h-[40px] min-w-0 cursor-pointer rounded-[6px] px-3 text-[13px] font-bold transition-colors sm:h-[42px] lg:h-[32px] lg:min-w-[104px] lg:px-4 lg:shrink-0 ${
                      isActive
                        ? "bg-[#16284F] text-white"
                        : "bg-[#DEDFE3] text-[#16284F] hover:bg-[#D3D5DB]"
                    }`}
                  >
                    {tab.name}
                  </button>
                );
              })}
            </div>
          )}

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex h-[44px] w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#43C17A] px-5 text-sm font-bold text-white shadow-[0_2px_10px_rgba(67,193,122,0.25)] transition-all hover:bg-[#34A362] active:scale-95 md:w-[190px] lg:hidden animate-in fade-in duration-200"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-3 border-[#EFEFEF] text-[#EFEFEF]">
              <Plus size={12} weight="bold" />
            </span>
            <span>Add Executive</span>
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-visible rounded-[5px] ">
          {isLoadingExecutives ? (
            <ExecutiveShimmer />
          ) : executivesList.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 py-16">
              <p className="text-[15px] font-medium text-gray-400">
                No executives found for this category.
              </p>
            </div>
          ) : (
            <>
              <div className="grid auto-rows-max grid-cols-1 items-start gap-4 overflow-visible pb-0.5 pr-1 sm:grid-cols-2 lg:overflow-y-auto lg:custom-scrollbar xl:grid-cols-3">
                {executivesList.map((executive) => (
                  <ExecutiveCard
                    key={executive.wellBeingId}
                    name={executive.name}
                    email={executive.email}
                    category={getCategoryName(executive.categoryId)}
                    image={executive.image}
                  />
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalItems={totalCount}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                roundedBottom="rounded-b-md"
              />
            </>
          )}
        </div>
      </section>

      <WellbeingRight
        button
        headerActionLabel="Add Executive"
        onHeaderActionClick={() => setIsCreateModalOpen(true)}
      />

      <CreateExecutiveModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSaveSuccess={loadExecutives}
      />

      <Toaster position="top-right" containerStyle={{ zIndex: 99999 }} />
    </main>
  );
}
