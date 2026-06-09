"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import RoomsTab from "./biometric/RoomsTab";
import DevicesTab from "./biometric/DevicesTab";
import CredentialsTab from "./biometric/CredentialsTab";


type BiometricTab = "rooms" | "devices" | "credentials";

const tabs: { id: BiometricTab; label: string }[] = [
  { id: "rooms", label: "Rooms" },
  { id: "devices", label: "Devices" },
  { id: "credentials", label: "Credentials" },
];

export default function BiometricStructure() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const queryBiotab = searchParams.get("biotab") as BiometricTab | null;
  const activeTab: BiometricTab = (queryBiotab === "rooms" || queryBiotab === "devices" || queryBiotab === "credentials")
    ? queryBiotab
    : "rooms";

  const setActiveTab = (tab: BiometricTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("biotab", tab);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="w-full relative min-h-[40vh] flex flex-col">
      <Toaster position="top-right" />

      {/* Sub-tab navigation */}
      <div className="flex justify-center mb-6">
        <div className="relative flex items-center bg-gray-100 p-1 rounded-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative cursor-pointer px-3 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-semibold z-10 transition-colors duration-200 ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="biometric-pill"
                  className="absolute inset-0 rounded-full -z-10 shadow-[0_2px_8px_rgba(16,185,129,0.35)]"
                  style={{
                    background:
                      "linear-gradient(180deg, #34D399 0%, #10B981 100%)",
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1">
        {activeTab === "rooms" && <RoomsTab />}
        {activeTab === "devices" && <DevicesTab />}
        {activeTab === "credentials" && <CredentialsTab />}
      </div>
    </div>
  );
}
