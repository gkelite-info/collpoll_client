import React, { useState } from "react";
import { X, GraduationCap, User, Users } from "@phosphor-icons/react";

interface RolePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialData = {
  Faculty: {
    users: 60,
    permissions: {
      Attendance: true,
      Assignments: true,
      Academics: true,
      Projects: true,
      "Student Progress": true,
      Calendar: true,
      Placements: true,
      Drive: true,
      Announcements: true,
      Payments: false,
    },
  },
  Students: {
    users: 60,
    permissions: {
      Attendance: true,
      Assignments: true,
      Academics: true,
      Projects: true,
      "Student Progress": true,
      Calendar: true,
      Placements: true,
      Drive: true,
      Announcements: true,
      Payments: true,
    },
  },
  Parent: {
    users: 60,
    permissions: {
      Attendance: true,
      Assignments: false,
      Academics: true,
      Projects: false,
      "Student Progress": false,
      Calendar: false,
      Placements: false,
      Drive: false,
      Announcements: true,
      Payments: true,
    },
  },
};

type RoleType = "Faculty" | "Students" | "Parent";

const RolePermissionsModal: React.FC<RolePermissionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<RoleType>("Faculty");
  const [data, setData] = useState(initialData);

  if (!isOpen) return null;

  const handleToggle = (permission: string) => {
    setData((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        permissions: {
          ...prev[activeTab].permissions,
          [permission]:
            !prev[activeTab].permissions[
              permission as keyof typeof prev.Faculty.permissions
            ],
        },
      },
    }));
  };

  const TabButton = ({
    role,
    icon: Icon,
  }: {
    role: RoleType;
    icon: React.ElementType;
  }) => {
    const isActive = activeTab === role;
    return (
      <button
        onClick={() => setActiveTab(role)}
        className={`w-full flex items-center justify-center gap-3 py-4 px-4 rounded-lg font-medium text-[15px] transition-all shadow-sm ${
          isActive
            ? "bg-[#43C17A] text-white cursor-pointer"
            : "bg-[#ECECEC] text-[#666666] cursor-pointer hover:bg-gray-200"
        }`}
      >
        <Icon size={20} weight="fill" />
        {role}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
      <div className="bg-white w-full max-w-[700px] max-h-[90vh] rounded-xl shadow-2xl overflow-hidden font-sans border border-gray-100 flex flex-col">
        <div className="flex items-start justify-between px-8 py-6 pb-2">
          <div>
            <h2 className="text-[18px] font-medium text-[#1A1A1A]">
              Role & Permissions
            </h2>
            <p className="text-[13px] text-gray-500 mt-1">
              Manage user roles and control access across the system.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors mt-1 p-1"
          >
            <X size={24} weight="bold" />
          </button>
        </div>

        <div className="flex flex-1 p-8 pt-6 gap-8 overflow-hidden min-h-0">
          <div className="w-[180px] flex flex-col gap-3 shrink-0">
            <TabButton role="Faculty" icon={GraduationCap} />
            <TabButton role="Students" icon={User} />
            <TabButton role="Parent" icon={Users} />
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-[16px] font-medium text-[#1A1A1A]">
                {activeTab}
              </h3>
              <span className="bg-[#E7F7EE] text-[#43C17A] text-[11px] font-semibold px-2.5 py-1 rounded-full">
                {data[activeTab].users} Users
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-4 space-y-5 custom-scrollbar pb-4">
              {Object.entries(data[activeTab].permissions).map(
                ([permissionName, isEnabled]) => (
                  <div
                    key={permissionName}
                    className="flex items-center justify-between group"
                  >
                    <span className="text-[14px] text-[#4A4A4A] font-medium">
                      {permissionName}
                    </span>

                    <button
                      onClick={() => handleToggle(permissionName)}
                      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                        isEnabled ? "bg-[#43C17A]" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                          isEnabled ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolePermissionsModal;
