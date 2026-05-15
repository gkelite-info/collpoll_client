"use client";
import {
  CaretRight,
  CaretDown,
  SignOut,
  ArrowLeft,
  EnvelopeSimple,
  Phone,
  Headset,
  Key,
  ClipboardText,
} from "@phosphor-icons/react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "../utils/context/UserContext";
import ConfirmLogoutModal from "../components/modals/logoutModal";
import { logoutUser } from "@/lib/helpers/logoutUser";
import toast from "react-hot-toast";
import { extractAcademicYearNumber } from "../utils/academicYear";
import { useFaculty } from "../utils/context/faculty/useFaculty";

type Props = {
  open: boolean;
  onClose: () => void;
  onOpenTerms: () => void;
};

interface ProfileOptions {
  id: string;
  name: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

export default function ProfileDrawer({ open, onClose, onOpenTerms }: Props) {
  const [showThemes, setShowThemes] = useState<boolean>(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const {
    fullName,
    mobile,
    email,
    role,
    userId,
    collegeEducationType,
    collegeBranchCode,
    collegeAcademicYear,
    profilePhoto,
    identifierId,
    parentId,
    studentId,
    facultyId,
    adminId,
    financeManagerId,
    collegeAdminId,
    collegeHrId,
    placementEmployeeId,
    wellBeingId
  } = useUser();
  const { college_branch, faculty_edu_type } = useFaculty();
  const [loading, setLoading] = useState(false);
  const academicYear = extractAcademicYearNumber(collegeAcademicYear);
  const roleIdMap: Record<string, number | null> = {
    Student: studentId,
    Faculty: facultyId,
    Admin: adminId,
    Finance: financeManagerId,
    FinanceManager: financeManagerId,
    CollegeAdmin: collegeAdminId,
    CollegeHr: collegeHrId,
    Parent: parentId,
    PlacementOfficer: placementEmployeeId,
    WellbeingExecutive: wellBeingId,
    WellbeingManager: wellBeingId,
    SuperAdmin: userId,
  };
  const displayRoleMap: Record<string, string> = {
    FinanceManager: "Finance Manager",
    CollegeAdmin: "College Admin",
    CollegeHr: "College HR",
    PlacementOfficer: "Placement Officer",
    WellbeingExecutive: "Wellbeing Executive",
    WellbeingManager: "Wellbeing Manager",
    SuperAdmin: "Super Admin",
  };
  const displayRole = role ? displayRoleMap[role] ?? role : "";
  const displayId = identifierId || (role ? roleIdMap[role] : null) || userId;
  const profileOptions: ProfileOptions[] = [
    {
      id: "terms",
      name: "Terms And Conditions",
      icon: (
        <ClipboardText
          size={30}
          className="rounded-full bg-[#43C17A1F] text-[#43C17A] p-1.5"
        />
      ),
      onClick: onOpenTerms,
    },
    {
      id: "support",
      name: "Tekton Campus Support",
      icon: (
        <Headset
          size={30}
          className="rounded-full bg-[#43C17A1F] text-[#43C17A] p-1.5"
        />
      ),
    },
    {
      id: "change-password",
      name: "Change Password",
      icon: (
        <Key
          size={30}
          className="rounded-full bg-[#43C17A1F] text-[#43C17A] p-1.5"
        />
      ),
      onClick: () => {
        onClose();
        const basePath = "/" + pathname.split("/")[1];
        router.push(`${basePath}/settings?current-password`);
      },
    },
    // { id: "colour-themes", name: "Colour Themes", icon: <Palette size={30} className="rounded-full bg-[#43C17A1F] text-[#43C17A] p-1.5" /> },
  ];

  if (!open) return null;

  const handleLogout = async () => {
    try {
      setLoading(true);

      const timeout = setTimeout(() => {
        window.location.assign("/login");
      }, 3500);

      const res = await logoutUser();

      if (res.success) {
        clearTimeout(timeout);
        setShowLogoutModal(false);
        onClose();
        toast.success("Loggedout successfully");
        // router.replace("/login");
        window.location.assign("/login");
      } else {
        toast.error("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-120" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full w-[85%] md:w-[50%] lg:w-[33%] bg-white z-150 shadow-xl flex flex-col overflow-y-auto">
        <div className="flex justify-between items-center gap-3 px-4 py-4">
          <button onClick={onClose} className="cursor-pointer text-[#282828]">
            <ArrowLeft size={22} />
          </button>
          {/* <button className="cursor-pointer text-[#282828]">
                        <PencilSimple size={22} />
                    </button> */}
        </div>
        <h2 className="text-base font-medium pl-4 text-[#282828]">Profile</h2>
        <div
          onClick={(e) => {
            e.stopPropagation();
            onClose();
            router.push("/profile?profile=profile&Step=1");
          }}
          className="m-4 p-4 cursor-pointer rounded-xl bg-[#43C17A26] flex gap-3 items-center"
        >
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt="profile"
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          )}

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-md text-[#282828] truncate" title={fullName || ""}>{fullName}</p>
              <div className="flex gap-2 items-center shrink-0">
                <span className="text-xs text-[#282828] whitespace-nowrap">
                  ID - {displayId || "-"}
                </span>
              </div>
              <div className="hidden gap-2 items-center">
                {role === "Student" && (
                  <span className="text-xs text-[#282828]">
                    ID - {identifierId}
                  </span>
                )}
                {role === "Faculty" && (
                  <span className="text-xs text-[#282828]">
                    ID - {identifierId}
                  </span>
                )}
                {role === "Admin" && (
                  <span className="text-xs text-[#282828]">ID - {identifierId}</span>
                )}
                {role === "Finance" && (
                  <span className="text-xs text-[#282828]">
                    ID - {identifierId}
                  </span>
                )}
                {role === "FinanceManager" && (
                  <span className="text-xs text-[#282828]">
                    ID - {identifierId}
                  </span>
                )}
                {role === "CollegeAdmin" && (
                  <span className="text-xs text-[#282828]">
                    ID - {identifierId}
                  </span>
                )}
                {role === "Parent" && (
                  <span className="text-xs text-[#282828]">
                    ID - {identifierId || parentId}
                  </span>
                )}
                {(role === "WellbeingExecutive" || role === "WellbeingManager") && (
                  <span className="text-xs text-[#282828]">
                    ID - {identifierId}
                  </span>
                )}
                {/* {role === "Student" && (
                                    <CaretRight size={20} className="text-[#000000] cursor-pointer" onClick={(e) => {
                                        e.stopPropagation();
                                        onOpenQuickMenu();
                                    }} />
                                )} */}
                {/* <CaretRight
                                    size={20}
                                    className="text-[#000000] cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onClose();
                                        router.push("/profile?profile=personal-details&Step=1");
                                    }}
                                /> */}
              </div>
            </div>
            {role === "Student" && (
              <>
                <p className="text-xs text-[#282828] font-medium">
                  {collegeEducationType ? `${collegeEducationType}` : "—"}{" "}
                  {collegeBranchCode ? `${collegeBranchCode}` : "—"} -{" "}
                  {academicYear ? `${academicYear}` : "—"}
                </p>
              </>
            )}
            {role === "Faculty" && (
              <>
                <p className="text-xs text-[#282828] font-medium">
                  {faculty_edu_type ? `${faculty_edu_type}` : "—"}{" "}
                  {college_branch ? `${college_branch}` : "—"}
                </p>
              </>
            )}
            {role === "Finance" && (
              <p className="text-xs text-[#282828] font-medium">{role}</p>
            )}
            {role === "FinanceManager" && (
              <p className="text-xs text-[#282828] font-medium">Finance Manager</p>
            )}
            {role === "Admin" && (
              <p className="text-xs text-[#282828] font-medium">Admin</p>
            )}
            {role === "CollegeAdmin" && (
              <p className="text-xs text-[#282828] font-medium">College Admin</p>
            )}
            {role === "CollegeHr" && (
              <p className="text-xs text-[#282828] font-medium">College HR</p>
            )}
            {role === "Parent" && (
              <p className="text-xs text-[#282828] font-medium">Parent</p>
            )}
            {role === "PlacementOfficer" && (
              <p className="text-xs text-[#282828] font-medium">Placement Officer</p>
            )}
            {(role === "WellbeingExecutive" || role === "WellbeingManager") && (
              <p className="text-xs text-[#282828] font-medium">
                {displayRole || role}
              </p>
            )}
            {role === "SuperAdmin" && (
              <p className="text-xs text-[#282828] font-medium">Super Admin</p>
            )}
            <div className="flex gap-3 flex-wrap">
              <div className="flex items-center gap-2 mt-2">
                <EnvelopeSimple
                  size={22}
                  className="bg-[#43C17A] rounded-full p-1 text-white"
                />
                <span className="text-xs text-[#282828]">{email}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Phone
                  size={22}
                  className="bg-[#43C17A] rounded-full p-1 text-white"
                />
                <span className="text-xs text-[#282828]">{mobile}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-2 flex-1">
          {profileOptions.map((item) =>
            item.id === "colour-themes" ? (
              <div key={item.id}>
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 cursor-pointer"
                  onClick={() => setShowThemes(!showThemes)}
                >
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span className="text-sm text-[#282828] font-medium">
                      {item.name}
                    </span>
                  </div>

                  {showThemes ? (
                    <CaretDown size={18} className="text-gray-400" />
                  ) : (
                    <CaretRight size={18} className="text-gray-400" />
                  )}
                </div>
                {showThemes && (
                  <div className="px-6 pb-3 mt-2 ml-8">
                    <div className="flex gap-2 bg-[#43C17A36] w-fit px-3 py-2 rounded-sm justify-center items-center">
                      {["#6C63FF", "#FFA726", "#29B6F6", "#43C17A"].map((c) => (
                        <div
                          key={c}
                          className="w-8 h-8 rounded-md cursor-pointer"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                key={item.id}
                onClick={item.onClick}
                className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="text-sm text-[#282828] font-medium">
                    {item.name}
                  </span>
                </div>
                <CaretRight size={18} className="text-gray-400" />
              </div>
            ),
          )}

          <div className="px-4.5 py-4">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-2 text-[#EB0000] font-medium cursor-pointer text-sm"
            >
              <SignOut
                size={30}
                className="rounded-full bg-[#EB00001A] text-[#EB0000] p-1.5"
              />
              Log Out
            </button>
          </div>
        </div>
        {showLogoutModal && (
          <ConfirmLogoutModal
            loading={loading}
            onCancel={() => setShowLogoutModal(false)}
            onConfirm={() => {
              handleLogout();
            }}
          />
        )}
      </div>
    </>
  );
}



