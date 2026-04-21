import { PlacementTab, PlacementTabId } from "./mockData";

type PlacementTabsProps = {
  tabs: PlacementTab[];
  activeTab: PlacementTabId;
  onTabChange: (tabId: PlacementTabId) => void;
};

export default function PlacementTabs({
  tabs,
  activeTab,
  onTabChange,
}: PlacementTabsProps) {
  return (
    <div className="mt-2 inline-flex max-w-full overflow-x-auto rounded-full bg-[#E6E6E6] px-2 py-1">
      <div className="flex items-center gap-2 py-1">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`h-8 px-4  cursor-pointer whitespace-nowrap rounded-full text-sm text-center font-semibold transition ${
                isActive
                  ? "bg-[#49C77F] text-white"
                  : "bg-[#D8D8D8] text-[#1A3765]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
