"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Trash,
  Fingerprint,
  IdentificationCard,
  UserCircle,
  MagnifyingGlass,
  Camera,
  PencilSimple,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useUser } from "@/app/utils/context/UserContext";
import {
  getUserDeviceCredentials,
  deleteUserCredential,
  upsertUserCredential,
  CredentialType,
  UserCredentialRow,
} from "@/lib/helpers/devices/userDeviceCredentialAPI";
import {
  getBiometricDevices,
} from "@/lib/helpers/devices/biometricDeviceAPI";
import {
  deleteFaceFromDevice,
  deleteCardFromDevice,
  deleteFingerprintFromDevice,
  registerCardOnDevice,
} from "@/lib/helpers/devices/hikvisionAPI";
import { Pagination } from "../pagination";
import ConfirmDeleteModal from "../../../calendar/components/ConfirmDeleteModal";
import TableComponent from "@/app/utils/table/table";
import EnrollmentWizard from "./EnrollmentWizard";

const ITEMS_PER_PAGE = 10;

const CRED_TYPES: {
  value: CredentialType | "";
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "", label: "All Types", icon: null },
  { value: "FaceTemplate", label: "Face", icon: <Camera size={14} /> },
  { value: "Card", label: "Card", icon: <IdentificationCard size={14} /> },
  {
    value: "Fingerprint",
    label: "Fingerprint",
    icon: <Fingerprint size={14} />,
  },
];

const FINGER_NAMES = [
  "Left Thumb",
  "Left Index",
  "Left Middle",
  "Left Ring",
  "Left Little",
  "Right Thumb",
  "Right Index",
  "Right Middle",
  "Right Ring",
  "Right Little",
];

const columns = [
  { title: "User", key: "user" },
  { title: "Role", key: "role" },
  { title: "Credential Type", key: "credentialType" },
  { title: "Identifier", key: "identifier" },
  { title: "Status", key: "status" },
  { title: "Enrolled At", key: "enrolledAt" },
  { title: "Actions", key: "actions" },
];

export default function CredentialsTab() {
  const { collegeId, adminId, loading } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [credentials, setCredentials] = useState<UserCredentialRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const initialFilter = (searchParams.get("credFilter") as CredentialType | "") || "";
  const [filterType, setFilterType] = useState<CredentialType | "">(initialFilter);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const initialEnroll = searchParams.get("enroll") === "true";
  const [showEnroll, setShowEnroll] = useState(initialEnroll);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (filterType !== "") {
      params.set("credFilter", filterType);
    } else {
      params.delete("credFilter");
    }
    if (showEnroll) {
      params.set("enroll", "true");
    } else {
      params.delete("enroll");
    }
    const newUrl = `${pathname}?${params.toString()}`;
    if (newUrl !== `${pathname}?${searchParams.toString()}`) {
      router.replace(newUrl, { scroll: false });
    }
  }, [filterType, showEnroll, pathname, router, searchParams]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);


  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteCredentialId, setDeleteCredentialId] = useState<number | null>(null);
  const [deleteCredential, setDeleteCredential] = useState<UserCredentialRow | null>(null);

  const [openEditModal, setOpenEditModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editCredential, setEditCredential] = useState<UserCredentialRow | null>(null);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editCardId, setEditCardId] = useState("");


  const loadCredentials = useCallback(
    async (page: number) => {
      if (!collegeId) return;
      try {
        setIsLoading(true);
        const res = await getUserDeviceCredentials(collegeId, page, ITEMS_PER_PAGE, {
          credentialType: filterType || undefined,
          search: debouncedSearchQuery || undefined,
        });
        if (!res.success) {
          toast.error(res.error || "Unable to load credentials.");
          setCredentials([]);
          setTotalItems(0);
          return;
        }
        setCredentials(res.data);
        setTotalItems(res.total);
      } catch {
        toast.error("Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    },
    [collegeId, filterType, debouncedSearchQuery],
  );

  useEffect(() => {
    if (!collegeId) return;
    loadCredentials(currentPage);
  }, [collegeId, currentPage, loadCredentials]);


  const handleDeleteClick = (cred: UserCredentialRow) => {
    setDeleteCredentialId(cred.userDeviceCredentialId);
    setDeleteCredential(cred);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteCredentialId || !deleteCredential) return;
    try {
      setIsDeleting(true);

      try {
        const deviceRes = await getBiometricDevices(collegeId!, 1, 50);
        const activeDevices = deviceRes.data.filter(d => d.isActive);
        
        if (activeDevices.length > 0) {
          await Promise.all(
            activeDevices.map(async (device) => {
              try {
                if (deleteCredential.credentialType === "FaceTemplate") {
                  await deleteFaceFromDevice(device.deviceId, deleteCredential.userId);
                } else if (deleteCredential.credentialType === "Card") {
                  await deleteCardFromDevice(device.deviceId, deleteCredential.credentialIdentifier);
                } else if (deleteCredential.credentialType === "Fingerprint") {
                  await deleteFingerprintFromDevice(
                    device.deviceId,
                    deleteCredential.userId,
                    [deleteCredential.fingerIndex ?? 1],
                  );
                }
              } catch (e: any) {
                throw new Error(e.message || "Device rejected deletion");
              }
            })
          );
        }
      } catch (deviceError: any) {
        toast.error(deviceError?.message || "Failed to remove credential from the scanner. Please make sure the device is online before deleting.");
        return;
      }

      const res = await deleteUserCredential(deleteCredentialId);
      if (res.success) {
        toast.success("Credential deleted!");
        loadCredentials(currentPage);
      } else {
        toast.error(res.error || "Failed to delete.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsDeleting(false);
      setOpenDeleteModal(false);
      setDeleteCredentialId(null);
      setDeleteCredential(null);
    }
  };


  const handleEditClick = (cred: UserCredentialRow) => {
    setEditCredential(cred);
    setEditIsActive(cred.isActive ?? true);
    setEditCardId(cred.credentialIdentifier);
    setOpenEditModal(true);
  };

  const confirmEdit = async () => {
    if (!editCredential) return;

    try {
      setIsEditing(true);

      const res = await upsertUserCredential({
        userDeviceCredentialId: editCredential.userDeviceCredentialId,
        userId: editCredential.userId,
        collegeId: editCredential.collegeId,
        credentialType: editCredential.credentialType,
        credentialIdentifier: editCredential.credentialIdentifier,
        fingerIndex: editCredential.fingerIndex,
        enrolledBy: editCredential.enrolledBy,
        isActive: editIsActive,
      });
      if (res.success) {
        toast.success("Credential updated!");
        loadCredentials(currentPage);
      } else {
        toast.error(res.error || "Failed to update.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsEditing(false);
      setOpenEditModal(false);
      setEditCredential(null);
    }
  };


  const credTypeIcon = (type: CredentialType) => {
    switch (type) {
      case "FaceTemplate":
        return <Camera size={14} className="text-indigo-500" />;
      case "Card":
        return <IdentificationCard size={14} className="text-amber-600" />;
      case "Fingerprint":
        return <Fingerprint size={14} className="text-teal-600" />;
      default:
        return <UserCircle size={14} className="text-gray-500" />;
    }
  };


  const tableData = credentials.map((c) => ({
    user: (
      <div className="flex flex-col">
        <span className="font-semibold text-[#16284F] text-sm">
          {c.user?.fullName || `User #${c.userId}`}
        </span>
        <span className="text-[10px] text-gray-400">{c.user?.email || ""}</span>
      </div>
    ),
    role: (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
          c.user?.role === "Student"
            ? "bg-blue-50 text-blue-700"
            : "bg-violet-50 text-violet-700"
        }`}
      >
        {c.user?.role || "—"}
      </span>
    ),
    credentialType: (
      <div className="flex items-center justify-center gap-1.5 w-full">
        {credTypeIcon(c.credentialType)}
        <span className="text-xs font-medium text-[#525252]">
          {c.credentialType === "FaceTemplate" ? "Face" : c.credentialType}
        </span>
        {c.fingerIndex != null && (
          <span className="text-[10px] text-gray-400">
            ({FINGER_NAMES[c.fingerIndex - 1] || `#${c.fingerIndex}`})
          </span>
        )}
      </div>
    ),
    identifier: (
      <span className="text-xs text-[#525252] font-mono truncate max-w-[120px] inline-block">
        {c.credentialIdentifier.length > 20
          ? `${c.credentialIdentifier.slice(0, 20)}...`
          : c.credentialIdentifier}
      </span>
    ),
    status: c.isActive ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E6F4EA] text-[#1E8E3E]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#1E8E3E]" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500">
        Inactive
      </span>
    ),
    enrolledAt: (
      <span className="text-xs text-gray-500">
        {c.updatedAt || c.createdAt
          ? new Date(c.updatedAt || c.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—"}
      </span>
    ),
    actions: (
      <div className="flex items-center justify-center w-full">
        <button
          onClick={() => handleDeleteClick(c)}
          className="text-red-500 flex items-center justify-center bg-red-50 w-8 h-8 rounded-full cursor-pointer hover:bg-red-100 transition-colors"
          title="Delete"
        >
          <Trash size={15} weight="fill" />
        </button>
      </div>
    ),
  }));


  if (showEnroll && collegeId && adminId) {
    return (
      <EnrollmentWizard
        collegeId={collegeId}
        adminId={adminId}
        onClose={() => setShowEnroll(false)}
        onSuccess={() => loadCredentials(currentPage)}
      />
    );
  }

  return (
    <div className="w-full flex flex-col">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4">
        <h2 className="text-xl font-bold text-[#16284F]">User Credentials</h2>
        <button
          onClick={() => setShowEnroll(true)}
          className="flex items-center justify-center gap-2 bg-[#43C17A] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-[#3ab06e] transition-colors cursor-pointer w-full sm:w-auto whitespace-nowrap"
        >
          <Plus size={18} weight="bold" />
          <span>Enroll User</span>
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex flex-wrap gap-2">
          {CRED_TYPES.map((ct) => (
            <button
              key={ct.value}
              onClick={() => {
                setFilterType(ct.value as CredentialType | "");
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                filterType === ct.value
                  ? "bg-[#16284F] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {ct.icon}
              {ct.label}
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
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
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

      <ConfirmDeleteModal
        open={openDeleteModal}
        onCancel={() => {
          setOpenDeleteModal(false);
          setDeleteCredentialId(null);
          setDeleteCredential(null);
        }}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="Delete"
        name="Credential"
        confirmText="Yes, Delete"
        loadingText="Deleting..."
        actionType="remove"
        customDescription={
          deleteCredential && (
            <>
              Are you sure you want to delete the <span className="font-semibold text-gray-700">{deleteCredential.credentialType === "FaceTemplate" ? "Face" : deleteCredential.credentialType}</span> credential for <span className="font-semibold text-gray-700">{deleteCredential.user?.fullName || `User #${deleteCredential.userId}`}</span>? This action cannot be undone and will permanently remove the data.
            </>
          )
        }
      />

      {openEditModal && editCredential && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm animate-in fade-in zoom-in-95 duration-200 p-6">
            <h3 className="text-lg font-bold text-[#16284F] mb-4">Edit Credential</h3>
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2 mb-2 bg-gray-50 p-2 rounded-lg">
                <div className="text-[#43C17A] bg-white p-1.5 rounded shadow-sm">
                  {credTypeIcon(editCredential.credentialType)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-700">{editCredential.user?.fullName}</span>
                  <span className="text-[10px] text-gray-500">{editCredential.credentialType !== "Card" && editCredential.credentialIdentifier}</span>
                </div>
              </div>



              <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#43C17A] accent-[#43C17A] rounded cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700">Credential is Active</span>
              </label>
              <p className="text-xs text-gray-500">
                If unchecked, the user will temporarily not be able to use this credential to access devices.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpenEditModal(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmEdit}
                disabled={isEditing}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#43C17A] rounded-lg hover:bg-[#3ab06e] transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-2"
              >
                {isEditing ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
