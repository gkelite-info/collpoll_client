"use client";

import { useEffect, useState } from "react";
import {
  ArrowSquareDown,
  CheckCircle,
  FilePdf,
  SpinnerGap,
  X,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";

import {
  getStudentTopicResources,
  type StudentTopicResource,
} from "@/lib/helpers/student/academics/topicResources";
import { useTranslations } from "next-intl";
import { useInView } from "react-intersection-observer";

const RESOURCES_PER_PAGE = 3;

type TopicPdfViewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  unitLabel: string;
  unitTitle: string;
  topicTitle: string;
  topicId: number;
};

function ModalShimmer() {
  return (
    <div className="flex flex-col flex-1 min-h-0 animate-pulse">
      <div className="flex flex-col gap-5 p-6 overflow-y-auto flex-1 min-h-0">
        <div className="space-y-3 pr-6">
          <div className="h-5 w-3/4 rounded bg-gray-200" />
          <div className="h-4 w-1/2 rounded bg-gray-100" />
        </div>

        <div className="flex flex-col gap-2">
          <div className="h-4 w-24 rounded bg-gray-200" />
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`student-resource-shimmer-${index}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="h-9 w-9 rounded-lg bg-gray-200 shrink-0" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3.5 w-3/4 rounded bg-gray-200" />
                  <div className="h-2.5 w-1/3 rounded bg-gray-100" />
                </div>
              </div>
              <div className="h-8 w-24 rounded-lg bg-gray-200 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 px-6 pb-6 pt-3 border-t border-gray-100 flex-shrink-0">
        <div className="h-11 flex-1 rounded-lg bg-gray-200" />
      </div>
    </div>
  );
}

export function TopicPdfViewModal({
  isOpen,
  onClose,
  unitLabel,
  unitTitle,
  topicTitle,
  topicId,
}: TopicPdfViewModalProps) {
  const t = useTranslations("Academics.student");
  const [resources, setResources] = useState<StudentTopicResource[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [selectedResourceIds, setSelectedResourceIds] = useState<number[]>([]);
  const [visibleResourceCount, setVisibleResourceCount] = useState(RESOURCES_PER_PAGE);
  const { ref: loadMoreRef, inView } = useInView({ rootMargin: "80px" });

  useEffect(() => {
    if (!isOpen || !topicId) return;
    let cancelled = false;

    async function loadResources() {
      setLoadingResources(true);
      try {
        const data = await getStudentTopicResources(topicId);
        if (!cancelled) {
          setResources(data);
          setVisibleResourceCount(RESOURCES_PER_PAGE);
          setSelectedResourceIds(
            data.length > 0 ? [data[0].collegeSubjectUnitTopicResourceId] : [],
          );
        }
      } catch (err: unknown) {
        if (!cancelled) {
          toast.error(
            err instanceof Error ? err.message : t("Failed to load PDFs"),
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingResources(false);
        }
      }
    }

    loadResources();

    return () => {
      cancelled = true;
    };
  }, [isOpen, topicId, t]);

  useEffect(() => {
    if (inView && visibleResourceCount < resources.length) {
      setVisibleResourceCount((count) =>
        Math.min(count + RESOURCES_PER_PAGE, resources.length),
      );
    }
    // Reveal one resource page each time the sentinel enters the modal viewport.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, resources.length]);

  const toggleSelectedResource = (resourceId: number) => {
    setSelectedResourceIds((prev) =>
      prev.includes(resourceId)
        ? prev.filter((id) => id !== resourceId)
        : [...prev, resourceId],
    );
  };

  const handleDownload = async (resource: StudentTopicResource) => {
    try {
      setDownloadingId(resource.collegeSubjectUnitTopicResourceId);
      const response = await fetch(
        `/api/student/topic-resources?resourceId=${resource.collegeSubjectUnitTopicResourceId}&download=1`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error(t("Failed to download file"));
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = resource.resourceName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : t("Failed to download file"),
      );
    } finally {
      setDownloadingId(null);
    }
  };

  if (!isOpen) return null;

  const selectedResources = resources.filter((resource) =>
    selectedResourceIds.includes(resource.collegeSubjectUnitTopicResourceId),
  );
  const visibleResources = resources.slice(0, visibleResourceCount);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 h-[720px] max-h-[90vh] overflow-hidden flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition z-10 cursor-pointer"
        >
          <X size={20} weight="bold" />
        </button>

        {loadingResources ? (
          <ModalShimmer />
        ) : (
          <>
            <div className="flex flex-col gap-5 p-6 overflow-hidden flex-1 min-h-0">
              <h2 className="text-base font-semibold text-gray-800 flex flex-wrap items-center gap-1 pr-6">
                <span className="text-[#7E5DFF]">{unitLabel}</span>
                <span className="text-gray-400">→</span>
                <span className="text-gray-700">{unitTitle}</span>
                <span className="text-gray-400">→</span>
                <span className="text-gray-700">{topicTitle}</span>
              </h2>

              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-gray-700">
                  {t("Uploaded PDFs")}
                </p>

                {resources.length > 0 ? (
                  <div
                    className="custom-scrollbar h-[280px] overflow-y-scroll pr-2 [scrollbar-gutter:stable]"
                    style={{ scrollbarWidth: "thin", scrollbarColor: "#43C17A #E5E7EB" }}
                  >
                  <ul className="flex flex-col gap-2">
                    {visibleResources.map((resource) => {
                      const isDownloading =
                        downloadingId ===
                        resource.collegeSubjectUnitTopicResourceId;
                      const isSelected = selectedResourceIds.includes(
                        resource.collegeSubjectUnitTopicResourceId,
                      );

                      return (
                        <li
                          key={resource.collegeSubjectUnitTopicResourceId}
                          onClick={() =>
                            toggleSelectedResource(
                              resource.collegeSubjectUnitTopicResourceId,
                            )
                          }
                          className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 border transition cursor-pointer ${
                            isSelected
                              ? "bg-[#F0FBF5] border-[#43C17A]"
                              : "bg-gray-50 border-gray-100 hover:border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <CheckCircle
                              size={18}
                              weight={isSelected ? "fill" : "regular"}
                              className={
                                isSelected ? "text-[#43C17A]" : "text-gray-300"
                              }
                            />
                            <div className="bg-red-100 rounded-lg p-1.5 flex-shrink-0">
                              <FilePdf
                                size={20}
                                weight="duotone"
                                className="text-red-500"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-700 truncate">
                                {resource.resourceName}
                              </p>
                              <p className="text-xs text-gray-400 capitalize">
                                {resource.resourceType ?? "PDF"}
                              </p>
                            </div>
                          </div>

                          {isDownloading && isSelected ? (
                            <div className="shrink-0 inline-flex items-center gap-2 text-xs font-semibold text-[#43C17A]">
                              <SpinnerGap size={14} className="animate-spin" />
                              {t("Downloading")}
                            </div>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                  {visibleResourceCount < resources.length && (
                    <div ref={loadMoreRef} className="animate-pulse space-y-2 pt-2">
                      {[1, 2, 3].map((row) => (
                        <div
                          key={row}
                          className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                        >
                          <div className="h-9 w-9 shrink-0 rounded-lg bg-gray-200" />
                          <div className="h-3 flex-1 rounded bg-gray-200" />
                        </div>
                      ))}
                    </div>
                  )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-8 text-center text-sm text-gray-400">
                    {t("No PDFs uploaded for this topic yet")}
                  </div>
                )}

              </div>
            </div>

            <div className="flex gap-3 px-6 pb-6 pt-3 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                {t("Close")}
              </button>
              <button
                type="button"
                onClick={async () => {
                  for (const resource of selectedResources) {
                    await handleDownload(resource);
                  }
                }}
                disabled={
                  selectedResources.length === 0 || downloadingId !== null
                }
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition flex items-center justify-center gap-2 cursor-pointer ${
                  selectedResources.length === 0 || downloadingId !== null
                    ? "bg-[#43C17A]/50 cursor-not-allowed"
                    : "bg-[#43C17A] hover:bg-[#3aad6c]"
                }`}
              >
                {downloadingId !== null ? (
                  <>
                    <SpinnerGap size={16} className="animate-spin" />
                    {t("Downloading")}...
                  </>
                ) : (
                  <>
                    <ArrowSquareDown size={16} />
                    {selectedResources.length > 0
                      ? `${t("Download File")}${selectedResources.length > 1 ? "s" : ""}`
                      : t("Select File(s)")}
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
