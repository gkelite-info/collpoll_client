import React from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";

type AiTopicSelectorProps = {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  availableTopics: string[];
  selectedTopics: string[];
  setSelectedTopics: React.Dispatch<React.SetStateAction<string[]>>;
  isLoadingTopics: boolean;
  topicsError: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showSearch: boolean;
  setShowSearch: (show: boolean) => void;
  selectAll: boolean;
  setSelectAll: (all: boolean) => void;
  searchState: { type: "empty" | "selected" | "available" | "new" };
  filteredAvailableTopics: string[];
  isInvalidUnit: boolean;
};

export function AiTopicSelector({
  formData,
  setFormData,
  availableTopics,
  selectedTopics,
  setSelectedTopics,
  isLoadingTopics,
  topicsError,
  searchQuery,
  setSearchQuery,
  showSearch,
  setShowSearch,
  selectAll,
  setSelectAll,
  searchState,
  filteredAvailableTopics,
  isInvalidUnit,
}: AiTopicSelectorProps) {
  if (!formData.unitName) {
    return null;
  }

  return (
    <div className="mt-3 border border-[#BBF7D0] bg-[#F0FDF4] rounded-lg p-3 col-span-2 min-h-[160px]">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-[#43C17A]">
          AI Suggested Topics
        </p>

        {!isInvalidUnit && (
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs font-medium text-[#43C17A] cursor-pointer">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setSelectAll(checked);

                  if (checked) {
                    const validAvailable = availableTopics.filter(
                      (t) => t !== "The unit name does not match the selected subject."
                    );
                    setSelectedTopics((prev) => [
                      ...new Set([...prev, ...validAvailable]),
                    ]);
                  } else {
                    setSelectedTopics([]);
                  }
                }}
                className="accent-[#43C17A] cursor-pointer"
              />
              Select All
            </label>

            <button
              type="button"
              onClick={() => setShowSearch(!showSearch)}
              className="p-1 rounded-md hover:bg-white/70"
            >
              <MagnifyingGlass
                size={16}
                className="text-[#43C17A]"
              />
            </button>
          </div>
        )}
      </div>

      {isLoadingTopics && (
        <div className="flex items-center gap-2 py-2 text-xs text-[#43C17A]">
          <svg className="animate-spin h-4 w-4 text-[#43C17A]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Generating AI topics...
        </div>
      )}

      {!isLoadingTopics && topicsError && (
        <div className="flex items-start gap-2 mt-1 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
          <span className="shrink-0">💡</span>
          <span>AI couldn't suggest topics for this unit. You can type and add topics manually using the search box above.</span>
        </div>
      )}

      <input
        type="text"
        placeholder="Search or add custom topic..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full rounded-lg px-3 py-2 text-xs border border-[#BBF7D0] bg-white text-[#065F46] placeholder:text-gray-400 focus:ring-2 focus:ring-[#43C17A] outline-none mb-2"
      />

      {searchQuery && searchState.type === "new" && (
        <button
          type="button"
          onClick={() => {
            const newTopic = searchQuery.trim();
            if (!newTopic) return;
            setSelectedTopics((prev) =>
              prev.includes(newTopic) ? prev : [...prev, newTopic]
            );
            setSearchQuery("");
            setSelectAll(false);
          }}
          className="mt-2 text-xs font-semibold text-[#43C17A] flex items-center gap-1 cursor-pointer"
        >
          + Add "{searchQuery}"
        </button>
      )}

      {selectedTopics.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedTopics.map((topic) => (
            <div
              key={topic}
              className="flex items-center gap-2 bg-white border border-[#D1FAE5] rounded-full px-3 py-1 text-xs text-[#065F46]"
            >
              <span>{topic}</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedTopics((prev) =>
                    prev.filter((t) => t !== topic)
                  );
                  setSelectAll(false);
                }}
                className="text-red-500 font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-3">
        {filteredAvailableTopics.map((topic) => {
          const isInvalidMessage = topic === "The unit name does not match the selected subject.";
          return (
            <div
              key={topic}
              className={`flex items-center gap-2 border rounded-full px-3 py-1 text-xs ${
                isInvalidMessage
                  ? "bg-yellow-50 border-yellow-300 text-yellow-700"
                  : "bg-white border-[#D1FAE5] text-[#065F46]"
              }`}
            >
              <span>{topic}</span>
              {!isInvalidMessage && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTopics((prev) => [...prev, topic]);
                    setSelectAll(false);
                  }}
                  className="text-[#43C17A] font-bold"
                >
                  +
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
