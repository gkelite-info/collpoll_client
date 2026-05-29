"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import WellbeingRight from "../components/WellbeingRight";
import CategoryCard from "./components/CategoryCard";
import SubCategoryCard from "./components/SubCategoryCard";
import { CaretDown, Plus } from "@phosphor-icons/react";
import CreateCategoryModal from "../components/CreateCategoryModal";
import type { CategoryEditData } from "../components/CreateCategoryModal";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";
import toast, { Toaster } from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";
import { supabase } from "@/lib/supabaseClient";
import {
  fetchWellbeingCategories,
  createWellbeingCategory,
  updateWellbeingCategory,
  deleteWellbeingCategory,
} from "@/lib/helpers/wellbeingCategories/wellbeingCategoryAPI";
import type {
  AppliesToEnum,
  WellbeingCategoryWithSubs,
} from "@/lib/helpers/wellbeingCategories/types";
import { CategoryShimmer, SubCategoryShimmer } from "./components/cardsShimmer";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";

const dummyExecutives = [
  { id: 1, name: "Rahul Sharma", staffId: "ID-28939", role: "Executive", image: "https://i.pravatar.cc/150?img=11" },
  { id: 2, name: "Shreya Patel", staffId: "ID-28939", role: "Executive", image: "https://i.pravatar.cc/150?img=47" },
  { id: 3, name: "Sameer Rathod", staffId: "ID-28939", role: "Executive", image: "https://i.pravatar.cc/150?img=12" },
];

const itemsPerpage = 6;

function CategoriesContent() {
  const { collegeId, wellBeingId } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<CategoryEditData>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<WellbeingCategoryWithSubs | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [categoriesList, setCategoriesList] = useState<WellbeingCategoryWithSubs[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterAppliesTo, setFilterAppliesTo] = useState<"all" | AppliesToEnum>("all");
  const [totalItems, setTotalItems] = useState(0);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = searchParams.get("tab") === "executives" ? "executives" : "categories";
  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  const setCurrentPage = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, router]);

  const handleTabChange = useCallback((tab: "categories" | "executives") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, router]);

  const loadCategories = useCallback(async () => {
    if (!collegeId) return;
    try {
      setIsLoading(true);
      const { categories, totalCount } = await fetchWellbeingCategories(
        collegeId,
        currentPage,
        itemsPerpage,
        filterAppliesTo
      );
      setCategoriesList(categories);
      setTotalItems(totalCount);
    } catch (err) {
      toast.error("Failed to load categories.");
    } finally {
      setIsLoading(false);
    }
  }, [collegeId, currentPage, filterAppliesTo]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const refreshCategories = useCallback(async (resetPage = false) => {
    if (resetPage && currentPage !== 1) {
      setCurrentPage(1);
    } else {
      await loadCategories();
    }
  }, [currentPage, setCurrentPage, loadCategories]);

  const handleEditCategory = (cat: WellbeingCategoryWithSubs) => {
    setCategoryToEdit({
      categoryId: cat.categoryId,
      title: cat.categoryName,
      subCategories: cat.wellbeing_sub_categories.map((s) => s.subCategoryName),
      appliesTo:
        cat.appliesTo === "college"
          ? "College"
          : cat.appliesTo === "hostel"
            ? "Hostel"
            : "Both",
    });
    setIsModalOpen(true);
  };

  const handleSave = async (
    updatedCatName: string,
    subCats: string[],
    applies: string,
  ) => {
    if (!collegeId || !wellBeingId) {
      toast.error("User context is not ready. Please try again.");
      throw new Error("Missing context");
    }

    const trimmedCatName = updatedCatName.trim();
    const lowercaseCatName = trimmedCatName.toLowerCase();

    // Check database for duplicate category name
    const { data: existingCategories, error: checkError } = await supabase
      .from("wellbeing_categories")
      .select("categoryId, categoryName")
      .eq("collegeId", collegeId)
      .eq("isActive", true)
      .eq("is_deleted", false);

    if (checkError) {
      console.error("Error checking duplicate category name:", checkError);
    } else if (existingCategories) {
      const isDuplicate = existingCategories.some(
        (cat) =>
          cat.categoryName.trim().toLowerCase() === lowercaseCatName &&
          cat.categoryId !== categoryToEdit?.categoryId
      );
      if (isDuplicate) {
        toast.error(`Category "${trimmedCatName}" already exists.`);
        throw new Error("Category already exists");
      }
    }

    const appliesToValue = applies.toLowerCase() as AppliesToEnum;

    if (categoryToEdit?.categoryId) {
      const result = await updateWellbeingCategory({
        categoryId: categoryToEdit.categoryId,
        categoryName: trimmedCatName,
        appliesTo: appliesToValue,
        subCategories: subCats,
      });

      if (!result.success) {
        toast.error("Failed to update category.");
        throw new Error("Update failed");
      }

      toast.success("Category updated successfully");
    } else {
      const result = await createWellbeingCategory({
        categoryName: trimmedCatName,
        appliesTo: appliesToValue,
        collegeId,
        createdBy: wellBeingId,
        subCategories: subCats,
      });

      if (!result.success) {
        toast.error("Failed to create category.");
        throw new Error("Create failed");
      }

      toast.success("Category created successfully");
    }

    setIsModalOpen(false);
    setCategoryToEdit(null);
    await refreshCategories(!categoryToEdit?.categoryId);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      const result = await deleteWellbeingCategory(categoryToDelete.categoryId);
      if (!result.success) {
        toast.error("Failed to delete category.");
        return;
      }
      toast.success("Category deleted successfully");

      if (categoriesList.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        await loadCategories();
      }
    } catch {
      toast.error("Something went wrong while deleting.");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <main className="flex flex-col lg:flex-row w-full min-h-screen pb-5">

      <div className="w-full lg:w-[68%] p-4 md:p-6 lg:p-2 lg:pb-4 flex flex-col lg:h-screen">
        <div className="mb-4 mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-[20px] md:text-[24px] font-bold select-none shrink-0">
            <button
              onClick={() => handleTabChange("categories")}
              className={`transition-colors cursor-pointer ${activeTab === "categories" ? "text-[#43C17A]" : "text-[#16284F] hover:text-gray-600"
                }`}
            >
              Categories
            </button>
            <span className="text-[#16284F] opacity-35 font-medium">/</span>
            <button
              onClick={() => handleTabChange("executives")}
              className={`transition-colors cursor-pointer ${activeTab === "executives" ? "text-[#43C17A]" : "text-[#16284F] hover:text-gray-600"
                }`}
            >
              Executives
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            <div className="relative inline-flex items-center w-fit shrink-0">
              <select
                value={filterAppliesTo}
                onChange={(e) => {
                  setFilterAppliesTo(e.target.value as "all" | AppliesToEnum);
                  setCurrentPage(1);
                }}
                className="cursor-pointer appearance-none bg-[#16284F] text-[#ffffff] py-1.5 pl-3 pr-8 rounded-md outline-none text-[13px] md:text-sm font-medium h-[34px]"
              >
                <option value="all">All</option>
                <option value="college">College</option>
                <option value="hostel">Hostel</option>
              </select>
              <CaretDown size={14} weight="bold" className="absolute right-2.5 text-white pointer-events-none" />
            </div>

            <button
              onClick={() => {
                setCategoryToEdit(null);
                setIsModalOpen(true);
              }}
              className="flex lg:hidden cursor-pointer px-4 items-center justify-center gap-2 bg-[#43C17A] hover:bg-[#34A362] text-white py-2 rounded-full text-sm font-bold transition-all shadow-[0_2px_10px_rgba(67,193,122,0.25)] active:scale-95 group shrink-0"
            >
              <div className="flex items-center justify-center border-3 border-[#EFEFEF] text-[#EFEFEF] rounded-full p-[2px] group-hover:rotate-90 transition-transform duration-300">
                <Plus size={12} weight="bold" />
              </div>
              Create Category
            </button>
          </div>
        </div>

        {isLoading ? (
          activeTab === "categories" ? <SubCategoryShimmer /> : <CategoryShimmer />
        ) : categoriesList.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <p className="text-[15px] font-medium text-gray-400">
              No categories found. Create your first category to get started.
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 items-start content-start lg:overflow-y-auto custom-scrollbar pr-1 pb-4">
              {categoriesList.map((cat) => {
                if (activeTab === "categories") {
                  return (
                    <SubCategoryCard
                      key={cat.categoryId}
                      title={cat.categoryName}
                      subCategoriesCount={cat.wellbeing_sub_categories.length}
                      subCategories={cat.wellbeing_sub_categories.map((sub) => ({
                        subCategoryId: sub.subCategoryId,
                        subCategoryName: sub.subCategoryName,
                      }))}
                      onEdit={() => handleEditCategory(cat)}
                      onDelete={() => {
                        setCategoryToDelete(cat);
                        setIsDeleteModalOpen(true);
                      }}
                    />
                  );
                } else {
                  return (
                    <CategoryCard
                      key={cat.categoryId}
                      title={cat.categoryName}
                      executivesAssigned={dummyExecutives.length}
                      executives={dummyExecutives}
                      onEdit={() => handleEditCategory(cat)}
                      onDelete={() => {
                        setCategoryToDelete(cat);
                        setIsDeleteModalOpen(true);
                      }}
                    />
                  );
                }
              })}
            </div>
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerpage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </>
        )}

      </div>

      <WellbeingRight
        button={true}
        headerActionLabel="Create Category"
        onHeaderActionClick={() => {
          setCategoryToEdit(null);
          setIsModalOpen(true);
        }}
      />

      <CreateCategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCategoryToEdit(null);
        }}
        categoryData={categoryToEdit}
        onSave={handleSave}
      />

      <ConfirmDeleteModal
        open={isDeleteModalOpen}
        title="Delete"
        name={`${categoryToDelete?.categoryName ?? ""} category`}
        onConfirm={handleDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setCategoryToDelete(null);
        }}
        isDeleting={isDeleting}
        confirmText="Yes, Delete"
        actionType="remove"
      />
      <Toaster position="top-right" />
    </main>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col lg:flex-row w-full min-h-screen pb-5">
        <div className="w-full lg:w-[68%] p-4 md:p-6 lg:p-2 lg:pb-4 flex flex-col lg:h-screen">
          <div className="mb-4 mt-4 flex items-center justify-between gap-4 animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="h-8 w-24 bg-gray-200 rounded" />
          </div>
          <SubCategoryShimmer />
        </div>
        <div className="w-full lg:w-[32%] hidden lg:block" />
      </div>
    }>
      <CategoriesContent />
    </Suspense>
  );
}