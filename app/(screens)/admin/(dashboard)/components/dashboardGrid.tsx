import React, { useState } from "react";
import {
  UsersThree,
  CaretRight,
  ArrowsClockwise,
  EnvelopeSimple,
  Bell,
  ShieldCheck,
  Calendar,
  Circle,
} from "@phosphor-icons/react";
import { dashboardData } from "../data";
import RolePermissionsModal from "./modal/rolePermissionsModal";
import { useRouter, useSearchParams } from "next/navigation";
import PolicyManagement from "./policyManagement";

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div
    className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col ${className}`}
  >
    {children}
  </div>
);

const RowItem: React.FC<{
  label: string;
  value?: string | number;
  icon?: React.ReactNode;
  hasArrow?: boolean;
  valueClassName?: string;
  onClick?: () => void;
}> = ({
  label,
  value,
  icon,
  hasArrow,
  valueClassName = "text-gray-500",
  onClick,
}) => (
  <div className="flex items-center justify-between py-1">
    <div className="flex items-center gap-2.5">
      {icon && (
        <div className="w-8 h-8 rounded-lg bg-[#EAF7F1] flex items-center justify-center text-[#4BB583]">
          {React.isValidElement(icon)
            ? React.cloneElement(icon as React.ReactElement<{ size: number }>, {
                size: 18,
              })
            : icon}
        </div>
      )}
      <span className="text-gray-700 font-medium text-[13px]">{label}</span>
    </div>
    <div className="flex cursor-pointer items-center gap-1.5">
      <span
        onClick={onClick}
        className={`text-[13px]  font-semibold ${valueClassName}`}
      >
        {value}
      </span>
      {hasArrow && <CaretRight size={12} className="text-gray-400" />}
    </div>
  </div>
);

const Toggle: React.FC<{
  checked?: boolean;
  onChange?: (val: boolean) => void;
}> = ({ checked = true, onChange }) => (
  <div
    onClick={() => onChange?.(!checked)}
    className={`w-8 h-4 rounded-full relative transition-colors cursor-pointer ${
      checked ? "bg-[#4BB583]" : "bg-gray-200"
    }`}
  >
    <div
      className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-200 ${
        checked ? "translate-x-4.5" : "translate-x-0.5"
      }`}
      style={{ left: 0 }}
    />
  </div>
);

const UserManagementSummary: React.FC<{
  data: typeof dashboardData.summary;
}> = ({ data }) => {
  const router = useRouter();
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-800">
          User Management Summary
        </h2>
      </div>
      <div className="space-y-2">
        <RowItem
          label="Total Users"
          value={data.totalUsers}
          hasArrow
          icon={<UsersThree weight="fill" />}
        />
        <RowItem
          label="Pending User Registration"
          value={data.pendingRegistrations}
          hasArrow
          icon={<UsersThree weight="fill" />}
          onClick={() => router.push("?view=pending-registration")}
        />
      </div>
    </Card>
  );
};

const ActiveAutomations: React.FC<{
  data: typeof dashboardData.automations;
}> = ({ data }) => {
  const [items, setItems] = useState(data);

  const handleToggle = (index: number) => {
    const newItems = [...items];
    newItems[index].checked = !newItems[index].checked;
    setItems(newItems);
  };

  const getIcon = (label: string) => {
    if (label.includes("Backup")) return <ArrowsClockwise />;
    if (label.includes("Email")) return <EnvelopeSimple />;
    if (label.includes("Attendance")) return <Bell />;
    if (label.includes("Security")) return <ShieldCheck />;
    return <Calendar />;
  };

  return (
    <Card className="flex-grow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-800">Active Automations</h2>
        <CaretRight size={14} className="text-gray-400" />
      </div>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#EAF7F1] flex items-center justify-center text-[#4BB583]">
                {React.cloneElement(
                  getIcon(item.label) as React.ReactElement<{ size: number }>,
                  { size: 18 }
                )}
              </div>
              <span className="text-gray-700 font-medium text-[13px]">
                {item.label}
              </span>
            </div>
            <Toggle checked={item.checked} onChange={() => handleToggle(idx)} />
          </div>
        ))}
      </div>
    </Card>
  );
};

const BackupRetention: React.FC<{ data: typeof dashboardData.backup }> = ({
  data,
}) => (
  <Card>
    <div className="mb-3.5">
      <h2 className="text-sm font-bold text-gray-800">
        Backup & Data Retention
      </h2>
    </div>
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold text-gray-700">
          last Backup
        </span>
        <span className="text-[12px] font-medium text-gray-400 tracking-tight">
          {data.lastBackup}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold text-gray-700">
          Storage Used
        </span>
        <span className="text-[12px] font-medium text-gray-400">
          {data.storageUsed}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold text-gray-700">
          Auto Backup
        </span>
        <div className="flex items-center gap-1 bg-[#EAF7F1] text-[#4BB583] px-1.5 py-0.5 rounded text-[10px] font-bold border border-[#D5F0E5]">
          {data.autoBackup ? "Enabled" : "Disabled"}
          <CaretRight size={10} className="rotate-90" />
        </div>
      </div>
    </div>
  </Card>
);

const SystemHealth: React.FC<{ data: typeof dashboardData.health }> = ({
  data,
}) => (
  <Card>
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-bold text-gray-800">System Health</h2>
      <CaretRight size={14} className="text-gray-400" />
    </div>
    <div className="space-y-3.5">
      <div>
        <div className="flex justify-between text-[12px] mb-1.5">
          <span className="font-semibold text-gray-700">Storage Usage</span>
          <span className="font-medium text-gray-400">
            {data.storagePercentage}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <div className="w-full bg-[#E6FBEA] rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-[#43C17A] h-full rounded-full"
              style={{ width: `${data.storagePercentage}%` }}
            />
          </div>
          <span className="text-[11px] w-15 text-right font-bold text-gray-800">
            {data.totalStorage}
          </span>
        </div>
      </div>
      <div className="flex justify-between text-[12px] py-1 border-t border-gray-50 pt-2.5">
        <span className="font-semibold text-gray-700">Server Uptime</span>
        <span className="font-medium text-gray-400">{data.uptime}</span>
      </div>
      <div className="flex justify-between text-[12px] py-0.5">
        <span className="font-semibold text-gray-700">Response Time</span>
        <span className="font-medium text-gray-400">{data.responseTime}</span>
      </div>
      <div className="flex justify-between text-[12px] py-0.5">
        <span className="font-semibold text-gray-700">System Health</span>
        <div className="flex items-center gap-1.5 font-bold text-[#4BB583] text-[11px]">
          <Circle weight="fill" size={6} />
          {data.status}
        </div>
      </div>
    </div>
  </Card>
);

const RolesPermissions: React.FC<{
  data: typeof dashboardData.roles;
  onConfigure: () => void;
}> = ({ data, onConfigure }) => (
  <Card className="flex-grow">
    <div className="mb-4">
      <h2 className="text-sm font-bold text-gray-800">Roles & Permissions</h2>
    </div>
    <div className="space-y-4 flex-grow">
      {data.map((role) => (
        <div key={role.label} className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-gray-700">
            {role.label}
          </span>
          <span className="bg-[#E3E1FF] text-[#6C20CA] py-0.5 rounded font-bold text-[10px] min-w-[32px] text-center">
            {role.value}
          </span>
        </div>
      ))}
    </div>
    <div
      onClick={onConfigure}
      className="pt-3.5 border-t border-gray-50 flex items-center justify-between text-[#4BB583] text-[12px] font-bold cursor-pointer"
    >
      Configure Roles <CaretRight size={12} />
    </div>
  </Card>
);

const PolicySetup: React.FC<{ data: any }> = ({ data }) => {
  const router = useRouter();

  const handleManagePolicies = () => {
    router.push("?view=policy-setup");
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-800">Policy Setup</h2>
        <button
          onClick={handleManagePolicies}
          className="bg-[#16284F] hover:bg-[#1a3161] transition-colors text-white text-[12px] px-3 py-1 mb-1 rounded-md flex items-center gap-1 tracking-wider"
        >
          Manage Policies <CaretRight size={8} weight="bold" />
        </button>
      </div>
      <div className="space-y-3.5">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-700 text-[12px]">
            Attendance Policy
          </span>
          <span className="text-gray-400 font-medium text-[12px]">
            {data.attendance}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-700 text-[12px]">
            Assignment Window
          </span>
          <span className="text-gray-400 font-medium text-[12px]">
            {data.assignment}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-700 text-[12px]">
            Leave Limit
          </span>
          <span className="text-gray-400 font-medium text-[12px]">
            {data.leave}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default PolicySetup;

interface DashboardGridProps {
  data: typeof dashboardData;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ data }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentView = searchParams.get("view");

  const handleBack = () => router.push("/dashboard");

  if (currentView === "policy-setup") {
    return <PolicyManagement onBack={handleBack} />;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full items-stretch">
      <div className="flex flex-col gap-3">
        <UserManagementSummary data={data.summary} />
        <ActiveAutomations data={data.automations} />
        <BackupRetention data={data.backup} />
      </div>

      <div className="flex flex-col gap-3">
        <SystemHealth data={data.health} />
        <RolesPermissions
          data={data.roles}
          onConfigure={() => setIsModalOpen(true)}
        />
        <PolicySetup data={data.policies} />
      </div>

      <RolePermissionsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
