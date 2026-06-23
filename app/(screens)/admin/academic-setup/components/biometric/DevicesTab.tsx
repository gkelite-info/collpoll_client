"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  PencilSimple,
  Trash,
  WifiHigh,
  WifiSlash,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";
import {
  getBiometricDevices,
  upsertBiometricDevice,
  deleteBiometricDevice,
  getBiometricDeviceById,
  BiometricDevicePayload,
  BiometricDeviceRow,
  DeviceCategory,
  DeviceType,
  GateDirection,
  DeviceFilters,
  subscribeToDeviceStatusUpdates,
} from "@/lib/helpers/devices/biometricDeviceAPI";
import { decryptPassword } from "@/lib/helpers/devices/encryptionUtils";
import { Pagination } from "../pagination";
import ConfirmDeleteModal from "../../../calendar/components/ConfirmDeleteModal";
import TableComponent from "@/app/utils/table/table";
import DeviceForm, { DeviceFormState } from "./DeviceForm";

const ITEMS_PER_PAGE = 10;

const DEVICE_TYPES: { value: DeviceType; label: string }[] = [
  { value: "multi", label: "Multi-Mode" },
  { value: "facerecognition", label: "Face Recognition" },
  { value: "fingerprint", label: "Fingerprint" },
  { value: "card", label: "Card Reader" },
];

const DEVICE_CATEGORIES: { value: DeviceCategory; label: string }[] = [
  { value: "classroom", label: "Classroom" },
  { value: "gate", label: "Gate" },
];

const GATE_DIRECTIONS: { value: GateDirection; label: string }[] = [
  { value: "Standalone", label: "Standalone (Entry & Exit)" },
  { value: "In", label: "Inside (Entry Only)" },
  { value: "Out", label: "Outside (Exit Only)" },
];

const FILTER_CHIPS: { label: string; filters: DeviceFilters }[] = [
  { label: "All", filters: {} },
  { label: "Classroom", filters: { deviceCategory: "classroom" } },
  { label: "Gate", filters: { deviceCategory: "gate" } },
  { label: "Online", filters: { isOnline: true } },
  { label: "Offline", filters: { isOnline: false } },
];

const columns = [
  { title: "Device", key: "device" },
  { title: "Serial No", key: "serial" },
  { title: "IP : Port", key: "ipPort" },
  { title: "Type", key: "type" },
  { title: "Category", key: "category" },
  { title: "Status", key: "status" },
  { title: "Actions", key: "actions" },
];

const emptyForm: DeviceFormState = {
  deviceName: "",
  deviceSerialNumber: "",
  deviceIp: "",
  devicePort: "80",
  deviceUsername: "admin",
  devicePassword: "",
  deviceType: "multi",
  deviceCategory: "",
  gateDirection: "",
  deviceModel: "",
  firmwareVersion: "",
};

export default function DevicesTab() {
  const { collegeId, adminId, loading } = useUser();

  const [devices, setDevices] = useState<BiometricDeviceRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [activeFilter, setActiveFilter] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editDeviceId, setEditDeviceId] = useState<number | null>(null);
  const [form, setForm] = useState<DeviceFormState>(emptyForm);

  // Delete
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);

  const loadDevices = useCallback(
    async (page: number, filters?: DeviceFilters) => {
      if (!collegeId) return;
      try {
        setIsLoading(true);
        const f: DeviceFilters = {
          ...FILTER_CHIPS[activeFilter].filters,
          ...filters,
          search: debouncedSearchQuery || undefined,
        };
        const res = await getBiometricDevices(collegeId, page, ITEMS_PER_PAGE, f);
        if (!res.success) {
          toast.error(res.error || "Unable to load devices.");
          setDevices([]);
          setTotalItems(0);
          return;
        }
        setDevices(res.data);
        setTotalItems(res.total);
      } catch {
        toast.error("Something went wrong while loading devices.");
      } finally {
        setIsLoading(false);
      }
    },
    [collegeId, activeFilter, debouncedSearchQuery],
  );

  useEffect(() => {
    if (!collegeId) return;
    loadDevices(currentPage);
  }, [collegeId, currentPage, loadDevices]);

  // --- Realtime Subscription ---
  useEffect(() => {
    if (!collegeId) return;

    const unsubscribe = subscribeToDeviceStatusUpdates(collegeId, ({ newRow }) => {
      setDevices((prev) => {
        const index = prev.findIndex((d) => d.deviceId === newRow.deviceId);
        if (index === -1) return prev;

        const oldDevice = prev[index];

        const updatedList = [...prev];
        updatedList[index] = { 
          ...oldDevice,
          isOnline: newRow.isOnline,
          lastHeartbeat: newRow.lastHeartbeat,
        };
        return updatedList;
      });
    });

    return unsubscribe;
  }, [collegeId]);

  /* ---------- Filter ---------- */

  const handleFilterChange = (index: number) => {
    setActiveFilter(index);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  /* ---------- Form ---------- */

  const handleOpenForm = async (device?: BiometricDeviceRow) => {
    if (device) {
      setEditDeviceId(device.deviceId);
      setForm({
        deviceName: device.deviceName,
        deviceSerialNumber: device.deviceSerialNumber,
        deviceIp: device.deviceIp,
        devicePort: String(device.devicePort),
        deviceUsername: device.deviceUsername,
        devicePassword: "",
        deviceType: device.deviceType,
        deviceCategory: device.deviceCategory,
        gateDirection: device.gateDirection || "",
        deviceModel: device.deviceModel || "",
        firmwareVersion: device.firmwareVersion || "",
      });
      setShowForm(true);

      try {
        const res = await getBiometricDeviceById(device.deviceId);
        if (res.success && res.data?.devicePasswordEncrypted) {
          try {
            const decrypted = await decryptPassword(res.data.devicePasswordEncrypted);
            setForm((prev) => ({
              ...prev,
              devicePassword: decrypted,
            }));
          } catch { }
        }
      } catch { }
    } else {
      setEditDeviceId(null);
      setForm(emptyForm);
      setShowForm(true);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditDeviceId(null);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "devicePort" && value !== "" && !/^\d+$/.test(value)) return;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collegeId || !adminId) {
      toast.error("Session not fully loaded.");
      return;
    }

    // Validations
    if (!form.deviceName.trim()) return toast.error("Device name is required.");
    if (!form.deviceSerialNumber.trim()) return toast.error("Serial number is required.");
    if (!form.deviceIp.trim()) return toast.error("Device IP is required.");
    if (!form.devicePort.trim()) return toast.error("Device port is required.");
    if (!form.devicePassword.trim()) return toast.error("Device password is required.");
    if (form.devicePassword.length < 4) return toast.error("Password must be at least 4 characters.");
    if (!form.deviceCategory) return toast.error("Please select a device category.");
    if (form.deviceCategory === "gate" && !form.gateDirection)
      return toast.error("Please select a gate direction.");

    // IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(form.deviceIp.trim()))
      return toast.error("Please enter a valid IP address (e.g. 192.168.1.100).");

    setIsSubmitting(true);
    try {
      const payload: BiometricDevicePayload = {
        ...(editDeviceId && { deviceId: editDeviceId }),
        collegeId,
        deviceName: form.deviceName,
        deviceSerialNumber: form.deviceSerialNumber,
        deviceIp: form.deviceIp,
        devicePort: parseInt(form.devicePort),
        deviceUsername: form.deviceUsername,
        devicePassword: form.devicePassword || "unchanged_placeholder",
        deviceType: form.deviceType,
        deviceCategory: form.deviceCategory as DeviceCategory,
        gateDirection: form.deviceCategory === "gate" ? (form.gateDirection as GateDirection) : null,
        deviceModel: form.deviceModel || null,
        firmwareVersion: form.firmwareVersion || null,
        createdBy: adminId,
      };

      const res = await upsertBiometricDevice(payload);
      if (res.success && res.data) {
        // Automatically sync and configure device webhook via SaaS endpoint
        toast.promise(
          fetch("/api/biometric/device/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ deviceId: res.data.deviceId }),
          }).then(async (syncRes) => {
            const result = await syncRes.json();
            if (!result.success) throw new Error(result.error);
            return result.physicalName;
          }),
          {
            loading: "Testing connection and syncing device...",
            success: (name) => `Device connected! Hardware Name: ${name}`,
            error: (err) => err.message || "Device unreachable. Please verify network/IP.",
          }
        );

        setShowForm(false);
        loadDevices(currentPage);
      } else {
        toast.error(res.error || "Failed to save device.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- Delete ---------- */

  const handleDeleteClick = (id: number) => {
    setSelectedDeviceId(id);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedDeviceId) return;
    try {
      setIsDeleting(true);
      const res = await deleteBiometricDevice(selectedDeviceId);
      if (res.success) {
        toast.success("Device deleted!");
        loadDevices(currentPage);
      } else {
        toast.error(res.error || "Failed to delete.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsDeleting(false);
      setOpenDeleteModal(false);
      setSelectedDeviceId(null);
    }
  };

  /* ---------- Table ---------- */

  const tableData = devices.map((d) => ({
    device: (
      <div className="flex flex-col">
        <span className="font-semibold text-[#16284F] text-sm">{d.deviceName}</span>
        {d.deviceModel && (
          <span className="text-[10px] text-gray-400">{d.deviceModel}</span>
        )}
      </div>
    ),
    serial: (
      <span className="text-xs text-[#525252] font-mono">{d.deviceSerialNumber}</span>
    ),
    ipPort: (
      <span className="text-xs text-[#525252] font-mono">
        {d.deviceIp}:{d.devicePort}
      </span>
    ),
    type: (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 capitalize">
        {d.deviceType === "facerecognition" ? "Face" : d.deviceType}
      </span>
    ),
    category: (
      <div className="flex items-center justify-center gap-1.5">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${d.deviceCategory === "gate"
              ? "bg-amber-50 text-amber-700"
              : "bg-blue-50 text-blue-700"
            }`}
        >
          {d.deviceCategory}
        </span>
        {d.gateDirection && (
          <span className="text-[10px] text-gray-400 font-medium">
            ({d.gateDirection})
          </span>
        )}
      </div>
    ),
    status: (
      <div className="flex items-center justify-center gap-1.5">
        {d.isOnline ? (
          <>
            <WifiHigh size={14} weight="bold" className="text-green-500" />
            <span className="text-xs font-semibold text-green-600">Online</span>
          </>
        ) : (
          <>
            <WifiSlash size={14} weight="bold" className="text-red-400" />
            <span className="text-xs font-semibold text-red-400">Offline</span>
          </>
        )}
      </div>
    ),
    actions: (
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => handleOpenForm(d)}
          className="text-[#16284F] flex items-center justify-center bg-gray-100 w-8 h-8 rounded-full cursor-pointer hover:bg-gray-200 transition-colors"
          title="Edit"
        >
          <PencilSimple size={15} weight="fill" />
        </button>
        <button
          onClick={() => handleDeleteClick(d.deviceId)}
          className="text-red-500 flex items-center justify-center bg-red-50 w-8 h-8 rounded-full cursor-pointer hover:bg-red-100 transition-colors"
          title="Delete"
        >
          <Trash size={15} weight="fill" />
        </button>
      </div>
    ),
  }));

  /* ---------- Render ---------- */

  const selectedDeleteDevice = devices.find((d) => d.deviceId === selectedDeviceId);

  return (
    <div className="w-full flex flex-col">
      {!showForm ? (
        <>
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4">
            <h2 className="text-xl font-bold text-[#16284F]">Biometric Devices</h2>
            <button
              onClick={() => handleOpenForm()}
              className="flex items-center justify-center gap-2 bg-[#43C17A] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-[#3ab06e] transition-colors cursor-pointer w-full sm:w-auto whitespace-nowrap"
            >
              <Plus size={18} weight="bold" />
              <span>Add Device</span>
            </button>
          </div>

          {/* Filter + Search */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex flex-wrap gap-2">
              {FILTER_CHIPS.map((chip, i) => (
                <button
                  key={chip.label}
                  onClick={() => handleFilterChange(i)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${activeFilter === i
                      ? "bg-[#16284F] text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <MagnifyingGlass
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search devices..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#43C17A] focus:ring-1 focus:ring-[#43C17A] transition-all text-[#2D3748] placeholder-gray-400"
              />
            </div>
          </div>

          <TableComponent
            columns={columns}
            tableData={tableData}
            isLoading={isLoading || loading}
            height="auto"
          />

          {!isLoading && !loading && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      ) : (
        <DeviceForm
          form={form}
          editDeviceId={editDeviceId}
          isSubmitting={isSubmitting}
          onChange={handleFormChange}
          onSave={handleSave}
          onClose={handleCloseForm}
          deviceTypes={DEVICE_TYPES}
          deviceCategories={DEVICE_CATEGORIES}
          gateDirections={GATE_DIRECTIONS}
        />
      )}

      <ConfirmDeleteModal
        open={openDeleteModal}
        onCancel={() => {
          setOpenDeleteModal(false);
          setSelectedDeviceId(null);
        }}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="Delete"
        name="Device"
        confirmText="Yes, Delete"
        loadingText="Deleting..."
        actionType="remove"
        customDescription={
          selectedDeleteDevice && (
            <>
              Are you sure you want to delete device <span className="font-semibold text-gray-700">{selectedDeleteDevice.deviceName}</span>? This action cannot be undone and will permanently remove the data.
            </>
          )
        }
      />
    </div>
  );
}
