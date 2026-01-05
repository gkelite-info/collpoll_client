import { CaretLeft, Circle, FilePdf, Plus, X } from "@phosphor-icons/react";
import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

import FacultyCard from "../utils/facultyDetailCard";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import WorkWeekCalendar from "@/app/utils/workWeekCalendar";
import AddUserModal from "./modal/addUserModal";
import { RequestData as TableRequestData } from "./tables/pendingApprovalsTable";
import DocumentPreviewModal from "./modal/documentPreviewModal";

export interface FacultyData {
  name: string;
  subject: string;
  role: string;
  id: string;
  department: string;
  phone: string;
  email: string;
  address: string;
  experience: string;
  qualification: string;
  avatar: string;
}

interface Attachment {
  name: string;
  url: string;
}

interface RequestDetailProps {
  selectedRequest: TableRequestData;
  onBack: () => void;
}

interface ActionData {
  id: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
}

const ApprovalRequest: React.FC<{
  description: string;
  attachments: Attachment[];
}> = ({ description, attachments }) => {
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

  return (
    <div className="w-full space-y-5 text-[#374151]">
      <section>
        <h3 className="text-xl font-medium mb-3">Request Description</h3>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 min-h-[160px]">
          <p className="text-md leading-relaxed text-gray-700">{description}</p>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-medium mb-3 ">Attachments</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-lg">
          {attachments.map((file, index) => (
            <button
              key={index}
              onClick={() => setSelectedPdf(file.url)}
              className="flex items-center gap-3 bg-white rounded-lg px-4 py-4 hover:border-emerald-400 transition-all group w-full text-left"
            >
              <div className="flex items-center gap-3 border border-[#C4C4C4] hover:border-emerald-400 cursor-pointer rounded-lg w-full px-3 py-3 ">
                <FilePdf
                  size={28}
                  weight="fill"
                  className="text-gray-800 group-hover:text-emerald-500"
                />
                <span className="text-md text-gray-800">{file.name}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {selectedPdf && (
        <DocumentPreviewModal
          isOpen={!!selectedPdf}
          pdfUrl={selectedPdf}
          onClose={() => setSelectedPdf(null)}
        />
      )}
    </div>
  );
};

const ActionCard: React.FC<{ data: ActionData }> = ({ data }) => {
  const handleAction = (type: "Approve" | "Reject") => {
    if (type === "Approve") {
      toast.success("Request Approved", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
          fontSize: "14px",
        },
      });
    } else {
      toast.error("Request Rejected", {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
          fontSize: "14px",
        },
      });
    }
  };

  return (
    <div>
      <Toaster position="top-left" reverseOrder={false} />

      <div className="bg-white rounded-2xl space-y-3 p-5 mb-5">
        <h3 className="text-lg font-bold text-gray-800 mb-4 ">
          Request Details
        </h3>
        <div className="bg-[#E7F7EE] rounded-xl p-3">
          <p className="text-gray-500 text-sm font-medium mb-1">Request ID</p>
          <p className="text-base  text-gray-800">ID - {data.id}</p>
        </div>

        <div className="bg-[#E7F7EE] rounded-xl p-3">
          <p className="text-gray-500 text-sm font-medium mb-1">Request on</p>
          <p className="text-base  text-gray-800">{data.date}</p>
        </div>

        <div className="bg-[#E7F7EE] rounded-xl p-3">
          <p className="text-gray-500 text-sm font-medium mb-1">Status</p>
          <div className="flex items-center gap-2">
            <Circle size={12} weight="fill" className="text-orange-400" />
            <p className="text-base  text-gray-800">{data.status}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => handleAction("Approve")}
          className="flex-1 bg-[#43C17A] cursor-pointer hover:bg-emerald-600 text-white text-sm font-semibold py-4 rounded-md transition-colors shadow-sm"
        >
          Approve Request
        </button>
        <button
          onClick={() => handleAction("Reject")}
          className="flex-1 bg-[#FF2020] cursor-pointer hover:bg-red-600 text-white text-sm font-semibold py-4 rounded-md transition-colors shadow-sm"
        >
          Reject Request
        </button>
      </div>
    </div>
  );
};

const Right: React.FC<{ actionData: ActionData }> = ({ actionData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="w-[32%] pl-4 flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4 w-full items-center">
          <span
            onClick={() => setIsModalOpen(true)}
            className="bg-[#3EAD6F] font-medium cursor-pointer rounded-lg h-[54px] flex items-center justify-around gap-1 text-[#EFEFEF] px-4"
          >
            <Plus size={24} />
            <p className="text-lg">Add User</p>
          </span>

          <CourseScheduleCard isVisibile={false} fullWidth={true} />
        </div>

        <WorkWeekCalendar style="mt-0" />

        <ActionCard data={actionData} />
      </div>

      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

const RequestDetail: React.FC<RequestDetailProps> = ({
  selectedRequest,
  onBack,
}) => {
  const facultyData: FacultyData = {
    name: selectedRequest.name,
    subject: "N/A",
    role: selectedRequest.type,
    id: selectedRequest.requestId,
    department: "Computer Science",
    phone: "+91 00000 00000",
    email: "email@university.edu",
    address: "Hyderabad",
    experience: "N/A",
    qualification: "N/A",
    avatar: selectedRequest.photo,
  };

  const description = selectedRequest.details || "No description provided";
  const attachments = [
    { name: "Resume.Pdf", url: "/sample-pdf.pdf" },
    { name: "Faculty ID Proof.Pdf", url: "/sample-pdf.pdf" },
  ];

  const actionData: ActionData = {
    id: selectedRequest.requestId,
    date: selectedRequest.requestedOn,
    status: "Pending",
  };

  return (
    <div className="flex w-full min-h-screen p-3">
      <div className="flex-1">
        <div className="mb-3">
          <div className="flex items-center gap-2 group w-fit">
            <CaretLeft
              onClick={onBack}
              size={24}
              weight="bold"
              className="text-[#2D3748] cursor-pointer group-hover:-translate-x-1 transition-transform"
            />
            <h1 className="text-2xl font-bold text-[#282828]">
              Request Details
            </h1>
          </div>
          <p className="text-[#282828] mt-1 ml-8 text-sm">
            Review this request and take action.
          </p>
        </div>

        <div className="mb-6">
          <FacultyCard data={facultyData} />
        </div>

        <ApprovalRequest description={description} attachments={attachments} />
      </div>

      <Right actionData={actionData} />
    </div>
  );
};

export default RequestDetail;
