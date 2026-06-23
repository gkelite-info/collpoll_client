"use client";

import { useState } from "react";
import { X, Eye, EyeSlash } from "@phosphor-icons/react";
import { BiometricDevicePayload, DeviceCategory, DeviceType, GateDirection } from "@/lib/helpers/devices/biometricDeviceAPI";
import CustomSelect from "./ui/CustomSelect";

export type DeviceFormState = {
  deviceName: string;
  deviceSerialNumber: string;
  deviceIp: string;
  devicePort: string;
  deviceUsername: string;
  devicePassword: string;
  deviceType: DeviceType;
  deviceCategory: DeviceCategory | "";
  gateDirection: GateDirection | "";
  deviceModel: string;
  firmwareVersion: string;
};

interface DeviceFormProps {
  form: DeviceFormState;
  editDeviceId: number | null;
  isSubmitting: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
  deviceTypes: { value: DeviceType; label: string }[];
  deviceCategories: { value: DeviceCategory; label: string }[];
  gateDirections: { value: GateDirection; label: string }[];
}

export default function DeviceForm({
  form,
  editDeviceId,
  isSubmitting,
  onChange,
  onSave,
  onClose,
  deviceTypes,
  deviceCategories,
  gateDirections,
}: DeviceFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl p-3 sm:p-6 shadow-sm animate-in fade-in zoom-in-95 duration-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-[#16284F]">
          {editDeviceId ? "Edit Device" : "Register New Device"}
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 cursor-pointer"
        >
          <X size={20} weight="bold" />
        </button>
      </div>

      <form onSubmit={onSave} className="space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-[#16284F] mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#43C17A] text-white text-[10px] inline-flex items-center justify-center font-bold leading-none">
              1
            </span>
            Device Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16284F]">
                Device Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="deviceName"
                placeholder="e.g. Main Gate Entry, Lab-201 Scanner"
                value={form.deviceName}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-[#43C17A] focus:ring-1 focus:ring-[#43C17A] transition-all text-[#2D3748] placeholder-gray-400"
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16284F]">
                Serial Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="deviceSerialNumber"
                placeholder="e.g. DS-K1T671MF-12345"
                value={form.deviceSerialNumber}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-[#43C17A] focus:ring-1 focus:ring-[#43C17A] transition-all text-[#2D3748] placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#16284F] mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#43C17A] text-white text-[10px] inline-flex items-center justify-center font-bold leading-none">
              2
            </span>
            Network Settings
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16284F]">
                IP Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="deviceIp"
                placeholder="192.168.1.100"
                value={form.deviceIp}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-[#43C17A] focus:ring-1 focus:ring-[#43C17A] transition-all text-[#2D3748] placeholder-gray-400 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16284F]">
                Port <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="devicePort"
                placeholder="80"
                value={form.devicePort}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-[#43C17A] focus:ring-1 focus:ring-[#43C17A] transition-all text-[#2D3748] placeholder-gray-400 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16284F]">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="deviceUsername"
                placeholder="admin"
                value={form.deviceUsername}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-[#43C17A] focus:ring-1 focus:ring-[#43C17A] transition-all text-[#2D3748] placeholder-gray-400"
              />
            </div>
          </div>
          <div className="mt-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16284F]">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="devicePassword"
                  placeholder="Device password (min. 4 characters)"
                  value={form.devicePassword}
                  onChange={onChange}
                  className="w-full border border-gray-300 rounded-lg pl-4 pr-10 py-2 outline-none focus:border-[#43C17A] focus:ring-1 focus:ring-[#43C17A] transition-all text-[#2D3748] placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#16284F] transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Password is securely encrypted and stored.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#16284F] mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#43C17A] text-white text-[10px] inline-flex items-center justify-center font-bold leading-none">
              3
            </span>
            Classification
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomSelect
              label="Device Type"
              name="deviceType"
              value={form.deviceType}
              options={deviceTypes}
              onChange={(val, name) => onChange({ target: { name, value: val } } as any)}
              required
            />
            <CustomSelect
              label="Category"
              name="deviceCategory"
              value={form.deviceCategory}
              options={deviceCategories}
              onChange={(val, name) => onChange({ target: { name, value: val } } as any)}
              required
              placeholder="Select category"
            />
            {form.deviceCategory === "gate" && (
              <CustomSelect
                label="Gate Direction"
                name="gateDirection"
                value={form.gateDirection}
                options={gateDirections}
                onChange={(val, name) => onChange({ target: { name, value: val } } as any)}
                required
                placeholder="Select direction"
              />
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#16284F] mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-gray-300 text-white text-[10px] inline-flex items-center justify-center font-bold leading-none">
              4
            </span>
            Optional Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16284F]">Model</label>
              <input
                type="text"
                name="deviceModel"
                placeholder="e.g. DS-K1T671MF"
                value={form.deviceModel}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-[#43C17A] focus:ring-1 focus:ring-[#43C17A] transition-all text-[#2D3748] placeholder-gray-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16284F]">Firmware Version</label>
              <input
                type="text"
                name="firmwareVersion"
                placeholder="e.g. V2.3.97"
                value={form.firmwareVersion}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-[#43C17A] focus:ring-1 focus:ring-[#43C17A] transition-all text-[#2D3748] placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto whitespace-nowrap px-6 py-2.5 bg-[#43C17A] text-white rounded-lg font-medium hover:bg-[#3ab06e] transition-colors disabled:opacity-70 flex items-center justify-center min-w-0 sm:min-w-[140px] cursor-pointer text-center"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2 justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : editDeviceId ? (
              "Update Device"
            ) : (
              "Register Device"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}


