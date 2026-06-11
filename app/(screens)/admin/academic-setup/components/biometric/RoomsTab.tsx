"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Plus, X, PencilSimple, Trash, LinkSimple, LinkBreak, MagnifyingGlass, CaretDown, Check } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";
import {
  getCollegeRooms,
  upsertCollegeRoom,
  deleteCollegeRoom,
  assignDeviceToRoom,
  unassignDeviceFromRoom,
  RoomDBPayload,
  RoomViewData,
  RoomType,
} from "@/lib/helpers/devices/collegeRoomAPI";
import { getUnassignedDevices } from "@/lib/helpers/devices/biometricDeviceAPI";
import { Pagination } from "../pagination";
import ConfirmDeleteModal from "../../../calendar/components/ConfirmDeleteModal";
import TableComponent from "@/app/utils/table/table";
import DeviceListShimmer from "./DeviceListShimmer";

const ITEMS_PER_PAGE = 10;

const ROOM_TYPES: { value: RoomType; label: string }[] = [
  { value: "classroom", label: "Classroom" },
  { value: "lab", label: "Lab" },
  { value: "auditorium", label: "Auditorium" },
  { value: "seminarhall", label: "Seminar Hall" },
  { value: "gate", label: "Gate" },
  { value: "library", label: "Library" },
  { value: "conference", label: "Conference" },
];

const columns = [
  { title: "Room No / Name", key: "roomNo" },
  { title: "Type", key: "roomType" },
  { title: "Building", key: "building" },
  { title: "Floor", key: "floor" },
  { title: "Capacity", key: "capacity" },
  { title: "Assigned Device", key: "device" },
  { title: "Actions", key: "actions" },
];

type FormState = {
  roomNo: string;
  roomType: RoomType;
  floor: string;
  building: string;
  capacity: string;
};

const emptyForm: FormState = {
  roomNo: "",
  roomType: "classroom",
  floor: "",
  building: "",
  capacity: "",
};

type UnassignedDevice = {
  deviceId: number;
  deviceName: string;
  deviceSerialNumber: string;
  deviceIp: string;
  devicePort: number;
  deviceCategory: string;
  gateDirection?: string | null;
};

export default function RoomsTab() {
  const { collegeId, adminId, loading } = useUser();

  const [rooms, setRooms] = useState<RoomViewData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
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

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editRoomId, setEditRoomId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  // Device assignment
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignRoomId, setAssignRoomId] = useState<number | null>(null);
  const [unassignedDevices, setUnassignedDevices] = useState<UnassignedDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isUnassignedLoading, setIsUnassignedLoading] = useState(false);

  const [unassignedSearchQuery, setUnassignedSearchQuery] = useState("");
  const [unassignedPage, setUnassignedPage] = useState(1);
  const [hasMoreUnassigned, setHasMoreUnassigned] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Unassign Modal state
  const [openUnassignModal, setOpenUnassignModal] = useState(false);
  const [unassignRoomId, setUnassignRoomId] = useState<number | null>(null);
  const [isUnassigning, setIsUnassigning] = useState(false);

  // Delete
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  const loadRooms = useCallback(
    async (page: number) => {
      if (!collegeId) return;
      try {
        setIsLoading(true);
        const res = await getCollegeRooms(collegeId, page, ITEMS_PER_PAGE, debouncedSearchQuery || undefined);
        if (!res.success) {
          toast.error("Unable to load rooms. Please try again.");
          setRooms([]);
          setTotalItems(0);
          return;
        }
        setRooms(res.data as RoomViewData[]);
        setTotalItems(res.total);
      } catch {
        toast.error("Unable to load rooms. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [collegeId, debouncedSearchQuery],
  );

  useEffect(() => {
    if (!collegeId) return;
    loadRooms(currentPage);
  }, [collegeId, currentPage, loadRooms]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  /* ---------- Form handlers ---------- */

  const handleOpenForm = (room?: RoomViewData) => {
    if (room) {
      setEditRoomId(room.collegeRoomId);
      setForm({
        roomNo: room.roomNo,
        roomType: room.roomType || "classroom",
        floor: room.floor || "",
        building: room.building || "",
        capacity: room.capacity ? String(room.capacity) : "",
      });
    } else {
      setEditRoomId(null);
      setForm(emptyForm);
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditRoomId(null);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "capacity" && value !== "" && (!/^\d+$/.test(value) || parseInt(value) <= 0))
      return;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collegeId || !adminId) {
      toast.error("Session not fully loaded.");
      return;
    }
    if (!form.roomNo.trim()) {
      toast.error("Room No / Name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: RoomDBPayload = {
        ...(editRoomId && { collegeRoomId: editRoomId }),
        roomNo: form.roomNo,
        roomType: form.roomType,
        floor: form.floor || null,
        building: form.building || null,
        capacity: form.capacity ? parseInt(form.capacity) : null,
        collegeId,
        createdBy: adminId,
      };
      const res = await upsertCollegeRoom(payload);
      if (res.success) {
        toast.success(editRoomId ? "Room updated!" : "Room created!");
        setShowForm(false);
        loadRooms(currentPage);
      } else {
        toast.error(res.error || "Unable to save room details. Please try again.");
      }
    } catch {
      toast.error("Unable to save room details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- Device assignment ---------- */

  const fetchUnassignedDevices = async (
    page: number,
    search: string,
    append: boolean = false,
  ) => {
    if (!collegeId) return;
    if (page === 1) {
      setIsUnassignedLoading(true);
    } else {
      setIsFetchingMore(true);
    }

    try {
      const res = await getUnassignedDevices(
        collegeId,
        "classroom",
        page,
        10,
        search,
      );
      if (res.success) {
        setUnassignedDevices((prev) =>
          append ? [...prev, ...res.data] : res.data,
        );
        setHasMoreUnassigned(res.data.length === 10);
      } else {
        toast.error("Unable to load unassigned devices. Please try again.");
      }
    } catch {
      toast.error("Unable to load unassigned devices. Please try again.");
    } finally {
      setIsUnassignedLoading(false);
      setIsFetchingMore(false);
    }
  };

  const handleOpenAssign = async (roomId: number) => {
    setAssignRoomId(roomId);
    setSelectedDeviceId(null);
    setShowAssignModal(true);
    setUnassignedSearchQuery("");
    setUnassignedPage(1);
    setHasMoreUnassigned(true);
    setUnassignedDevices([]);
    await fetchUnassignedDevices(1, "");
  };

  const handleUnassignedSearch = async (val: string) => {
    setUnassignedSearchQuery(val);
    setUnassignedPage(1);
    setHasMoreUnassigned(true);
    await fetchUnassignedDevices(1, val);
  };

  const handleModalScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isBottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 10;
    if (isBottom && !isUnassignedLoading && !isFetchingMore && hasMoreUnassigned) {
      const nextPage = unassignedPage + 1;
      setUnassignedPage(nextPage);
      fetchUnassignedDevices(nextPage, unassignedSearchQuery, true);
    }
  };

  const handleAssignDevice = async () => {
    if (!assignRoomId || !selectedDeviceId) return;
    setIsAssigning(true);
    try {
      const res = await assignDeviceToRoom(assignRoomId, selectedDeviceId);
      if (res.success) {
        toast.success("Device assigned!");
        setShowAssignModal(false);
        loadRooms(currentPage);
      } else {
        toast.error("Unable to assign device. Please try again.");
      }
    } catch {
      toast.error("Unable to assign device. Please try again.");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassignClick = (roomId: number) => {
    setUnassignRoomId(roomId);
    setOpenUnassignModal(true);
  };

  const confirmUnassign = async () => {
    if (!unassignRoomId) return;
    try {
      setIsUnassigning(true);
      const res = await unassignDeviceFromRoom(unassignRoomId);
      if (res.success) {
        toast.success("Device unassigned!");
        loadRooms(currentPage);
      } else {
        toast.error("Unable to unassign device. Please try again.");
      }
    } catch {
      toast.error("Unable to unassign device. Please try again.");
    } finally {
      setIsUnassigning(false);
      setOpenUnassignModal(false);
      setUnassignRoomId(null);
    }
  };

  /* ---------- Delete ---------- */

  const handleDeleteClick = (roomId: number) => {
    setSelectedRoomId(roomId);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedRoomId) return;
    try {
      setIsDeleting(true);
      const res = await deleteCollegeRoom(selectedRoomId);
      if (res.success) {
        toast.success("Room deleted!");
        loadRooms(currentPage);
      } else {
        toast.error("Unable to delete room. Please try again.");
      }
    } catch {
      toast.error("Unable to delete room. Please try again.");
    } finally {
      setIsDeleting(false);
      setOpenDeleteModal(false);
      setSelectedRoomId(null);
    }
  };

  /* ---------- Table data ---------- */

  const tableData = rooms.map((room) => ({
    roomNo: (
      <span className="font-semibold text-[#16284F]">{room.roomNo}</span>
    ),
    roomType: (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 capitalize">
        {room.roomType?.replace("seminarhall", "seminar hall") || "classroom"}
      </span>
    ),
    building: <span className="text-[#525252]">{room.building || "—"}</span>,
    floor: <span className="text-[#525252]">{room.floor || "—"}</span>,
    capacity: <span className="text-[#525252]">{room.capacity || "—"}</span>,
    device: room.device ? (
      <div className="flex items-center justify-center gap-2">
        <span
          className={`inline-block w-2 h-2 rounded-full ${
            room.device.isOnline ? "bg-green-500 animate-pulse" : "bg-red-400"
          }`}
        />
        <div className="flex flex-col text-left">
          <span className="text-xs font-semibold text-[#16284F] leading-tight">
            {room.device.deviceName}
          </span>
          <span className="text-[10px] text-gray-400 leading-tight">
            {room.device.deviceIp}:{room.device.devicePort}
          </span>
        </div>
        <button
          onClick={() => handleUnassignClick(room.collegeRoomId)}
          className="ml-1 text-red-400 hover:text-red-600 transition-colors cursor-pointer"
          title="Unassign device"
        >
          <LinkBreak size={14} weight="bold" />
        </button>
      </div>
    ) : (
      <button
        onClick={() => handleOpenAssign(room.collegeRoomId)}
        className="flex items-center justify-center gap-1 text-xs text-[#43C17A] hover:text-[#3ab06e] font-medium transition-colors cursor-pointer mx-auto"
      >
        <LinkSimple size={14} weight="bold" />
        Assign Device
      </button>
    ),
    actions: (
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => handleOpenForm(room)}
          className="text-[#16284F] flex items-center justify-center bg-gray-100 w-8 h-8 rounded-full cursor-pointer hover:bg-gray-200 transition-colors"
          title="Edit Room"
        >
          <PencilSimple size={15} weight="fill" />
        </button>
        <button
          onClick={() => handleDeleteClick(room.collegeRoomId)}
          className="text-red-500 flex items-center justify-center bg-red-50 w-8 h-8 rounded-full cursor-pointer hover:bg-red-100 transition-colors"
          title="Delete Room"
        >
          <Trash size={15} weight="fill" />
        </button>
      </div>
    ),
  }));

  /* ---------- Render ---------- */

  const selectedUnassignRoom = rooms.find((r) => r.collegeRoomId === unassignRoomId);
  const selectedDeleteRoom = rooms.find((r) => r.collegeRoomId === selectedRoomId);

  return (
    <div className="w-full flex flex-col">
      {!showForm ? (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-5">
            <h2 className="text-xl font-bold text-[#16284F]">Rooms Directory</h2>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <MagnifyingGlass
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search rooms..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#43C17A] focus:ring-1 focus:ring-[#43C17A] transition-all text-[#2D3748] placeholder-gray-400"
                />
              </div>
              <button
                onClick={() => handleOpenForm()}
                className="flex items-center justify-center gap-2 bg-[#43C17A] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-[#3ab06e] transition-colors cursor-pointer w-full sm:w-auto whitespace-nowrap"
              >
                <Plus size={18} weight="bold" />
                <span>Add Room</span>
              </button>
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
        <div className="w-full max-w-2xl mx-auto bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#16284F]">
              {editRoomId ? "Edit Room" : "Add New Room"}
            </h2>
            <button
              onClick={handleCloseForm}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 cursor-pointer"
            >
              <X size={20} weight="bold" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Room No / Name */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#16284F]">
                  Room No / Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="roomNo"
                  placeholder="e.g. 20, A-20, Lab, Seminar Hall"
                  value={form.roomNo}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-[#43C17A] focus:ring-1 focus:ring-[#43C17A] transition-all text-[#2D3748] placeholder-gray-400"
                  autoFocus
                />
              </div>

              {/* Room Type */}
              <CustomSelect
                label="Room Type"
                name="roomType"
                value={form.roomType}
                options={ROOM_TYPES}
                onChange={handleFormChange}
                required
              />

              {/* Building */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#16284F]">Building</label>
                <input
                  type="text"
                  name="building"
                  placeholder="e.g. Block A, Science Block"
                  value={form.building}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-[#43C17A] focus:ring-1 focus:ring-[#43C17A] transition-all text-[#2D3748] placeholder-gray-400"
                />
              </div>

              {/* Floor */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#16284F]">Floor</label>
                <input
                  type="text"
                  name="floor"
                  placeholder="e.g. Ground Floor, 2nd Floor"
                  value={form.floor}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-[#43C17A] focus:ring-1 focus:ring-[#43C17A] transition-all text-[#2D3748] placeholder-gray-400"
                />
              </div>

              {/* Capacity */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-[#16284F]">Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  placeholder="e.g. 60"
                  value={form.capacity}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-[#43C17A] focus:ring-1 focus:ring-[#43C17A] transition-all text-[#2D3748] placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleCloseForm}
                disabled={isSubmitting}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="whitespace-nowrap px-6 py-2 bg-[#43C17A] text-white rounded-lg font-medium hover:bg-[#3ab06e] transition-colors disabled:opacity-70 flex items-center justify-center min-w-[120px] cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  "Save Room"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assign Device Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-[#16284F]">Assign Device</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500 cursor-pointer"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <div className="relative mb-4">
              <MagnifyingGlass
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search unassigned devices..."
                value={unassignedSearchQuery}
                onChange={(e) => handleUnassignedSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#43C17A] focus:ring-1 focus:ring-[#43C17A] transition-all text-[#2D3748] placeholder-gray-400"
              />
            </div>

            {isUnassignedLoading ? (
              <div className="h-72">
                <DeviceListShimmer />
              </div>
            ) : unassignedDevices.length === 0 ? (
              <div className="h-72 flex items-center justify-center text-center px-4">
                <p className="text-gray-500 text-sm">
                  No unassigned classroom devices available. Add a device first in
                  the Devices tab.
                </p>
              </div>
            ) : (
              <div
                className="space-y-3 h-72 overflow-y-auto custom-scrollbar pr-1"
                onScroll={handleModalScroll}
              >
                {unassignedDevices.map((d) => (
                  <label
                    key={d.deviceId}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedDeviceId === d.deviceId
                        ? "border-[#43C17A] bg-[#E6F4EA]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="assignDevice"
                      checked={selectedDeviceId === d.deviceId}
                      onChange={() => setSelectedDeviceId(d.deviceId)}
                      className="accent-[#43C17A]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#16284F] truncate">
                        {d.deviceName}
                      </p>
                      <p className="text-xs text-gray-400">
                        SN: {d.deviceSerialNumber} · {d.deviceIp}:{d.devicePort}
                      </p>
                    </div>
                  </label>
                ))}
                {isFetchingMore && (
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 animate-pulse bg-gray-50/50">
                    <div className="w-4 h-4 rounded-full bg-gray-200 shrink-0" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignDevice}
                disabled={!selectedDeviceId || isAssigning}
                className="px-5 py-2 bg-[#43C17A] text-white rounded-lg text-sm font-medium hover:bg-[#3ab06e] disabled:opacity-60 cursor-pointer flex items-center gap-2"
              >
                {isAssigning && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        open={openDeleteModal}
        onCancel={() => {
          setOpenDeleteModal(false);
          setSelectedRoomId(null);
        }}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="Delete"
        name="Room"
        confirmText="Yes, Delete"
        loadingText="Deleting..."
        actionType="remove"
        customDescription={
          selectedDeleteRoom && (
            <>
              Are you sure you want to delete room <span className="font-semibold text-gray-700">{selectedDeleteRoom.roomNo}</span>? This action cannot be undone and will permanently remove the data.
            </>
          )
        }
      />

      <ConfirmDeleteModal
        open={openUnassignModal}
        onCancel={() => {
          setOpenUnassignModal(false);
          setUnassignRoomId(null);
        }}
        onConfirm={confirmUnassign}
        isDeleting={isUnassigning}
        title="Unassign"
        name="Device"
        confirmText="Yes, Unassign"
        loadingText="Unassigning..."
        actionType="remove"
        customDescription={
          selectedUnassignRoom && (
            <>
              Are you sure you want to unassign the device <span className="font-semibold text-gray-700">{selectedUnassignRoom.device?.deviceName}</span> from room <span className="font-semibold text-gray-700">{selectedUnassignRoom.roomNo}</span>? The device will no longer sync attendance logs for this room.
            </>
          )
        }
      />
    </div>
  );
}

interface CustomSelectProps<T extends string> {
  label: string;
  name: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  placeholder?: string;
}

function CustomSelect<T extends string>({
  label,
  name,
  value,
  options,
  onChange,
  required = false,
  placeholder,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  const handleSelect = (val: T) => {
    const event = {
      target: {
        name,
        value: val,
      },
    } as unknown as React.ChangeEvent<HTMLSelectElement>;
    onChange(event);
    setIsOpen(false);
  };

  return (
    <div className="space-y-1 w-full" ref={containerRef}>
      <label className="text-sm font-medium text-[#16284F]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full border ${
            isOpen ? "border-[#43C17A] ring-1 ring-[#43C17A]" : "border-gray-300"
          } rounded-lg px-4 py-2 pr-10 outline-none text-[#2D3748] bg-white cursor-pointer flex justify-between items-center text-left transition-all min-h-[42px] relative`}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder || "Select option"}
          </span>
          <CaretDown
            size={14}
            className="absolute right-3 top-1/2 text-gray-400 pointer-events-none transition-transform duration-200"
            style={{
              transform: `translateY(-50%) ${isOpen ? "rotate(180deg)" : "rotate(0deg)"}`,
            }}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl max-h-48 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-1 duration-150">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                  opt.value === value
                    ? "bg-[#D6F1E2] text-[#43C17A] font-semibold"
                    : "text-[#2D3748]"
                }`}
              >
                <span>{opt.label}</span>
                {opt.value === value && <Check size={14} weight="bold" className="text-[#43C17A]" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
