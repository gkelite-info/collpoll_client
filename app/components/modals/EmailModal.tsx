"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { EnvelopeSimpleIcon } from "@phosphor-icons/react";
import EmailDetailModal from "./EmailDetailModal";
import { EmailItem } from "../types/email";


type Props = {
  isOpen: boolean;
  mail: EmailItem;
  onClose: () => void;
};

const emails:Array<EmailItem> = [
  {
    initials: "AP",
    color: "#E9B8F3",
    sender: "Ahaan Pandey",
    email: "ahaan.pandey@gmail.com",
    subject: "Assignment 3 Submission Reminder",
    Subject: "This is a reminder to attend the Curriculum Review Meeting",
    desc: "Please upload your Data Structures assignment before Nov 5.",
    time: "9:43 AM",
    date: "Oct 30, 2025",
    body:
     ` This meeting will cover:
• Completing all coding questions from Unit–2  
• Solving the two algorithm-based problems  
• Uploading your code and report to the portal  
• Submitting before the due date: **Nov 5**

Please ensure your submission follows the required format.

Regards,  
Prof. Ramesh K.  
CSE Department
`
  },
  {
    initials: "CG",
    color: "#FFD6C9",
    sender: "Chinmayi Guptha",
    email: "ahaan.pandey@gmail.com",
    subject: "Infosys Test Results Released",
    Subject: "Your Infosys test results are now available in the portal",
    desc: "Check your results and feedback in the placement portal.",
    time: "9:43 AM",
    date: "Oct 30, 2025",
    body:`
Your Infosys test results are now available in the placement portal.

The result update includes:
• Your score and performance insights  
• Section-wise breakdown  
• Strength and improvement areas  
• Eligibility status for the next round  

Please log in to the placement portal to check the complete report.

Regards,  
Placement Coordination Cell
`
  },
  {
    initials: "AA",
    color: "#DCE2FF",
    sender: "Allu Arjun",
    email: "chinmayi.guptha@gmail.com",
    subject: "Audition Call – TechFest 2025",
    Subject: "Invitation for music and dance auditions for TechFest 2025",
    desc: "Register your name for the music and dance auditions.",
    time: "9:43 AM",
    date: "Oct 30, 2025",
    body:`
We are inviting registrations for music and dance auditions for TechFest 2025.

Auditions will include:
• Solo singing  
• Group dance  
• Instrumental performance  
• Free-style / open category  

Interested students must register before Nov 3.

Regards,  
Cultural Committee
`
  },
  {
    initials: "AP",
    color: "#E9B8F3",
    sender: "Ahaan Pandey",
    email: "ahaan.pandey@gmail.com",
    subject: "Assignment 3 Submission Reminder",
    Subject: "Agenda for the upcoming syllabus and performance review meeting",
    desc: "Please upload your Data Structures assignment before Nov 5.",
    time: "9:43 AM",
    date: "Oct 30, 2025",
    body:`
The meeting will cover:

• Review of current semester course outcomes  
• Updates to lesson plans and teaching methods  
• Discussion on student performance trends  
• Finalizing internal assessment weightages  
• Planning for next semester’s syllabus structure  

Regards,  
Prof. Rhea Verma  
Department of Computer Science
`
  },
  {
    initials: "CG",
    color: "#FFD6C9",
    sender: "Chinmayi Guptha",
    email: "chinmayi.guptha@gmail.com",
    subject: "Infosys Test Results Released",
    Subject: "Your final results for the Infosys placement exam are available",
    desc: "Check your results and feedback in the placement portal.",
    time: "9:43 AM",
    date: "Oct 30, 2025",
    body:`
Please check your score for the Infosys placement exam.

Result information includes:
• Overall score  
• Logical reasoning performance  
• Coding round evaluation  
• Next round eligibility  

Login to the placement portal for details.

Regards,  
Training & Placement Cell
`
  },
  {
    initials: "AA",
    color: "#DCE2FF",
    sender: "Allu Arjun",
    email: "chinmayi.guptha@gmail.com",
    subject: "Audition Call – TechFest 2025",
    Subject: "Registrations open for TechFest 2025 cultural auditions",
    desc: "Register your name for the music and dance auditions.",
    time: "9:43 AM",
    date: "Oct 30, 2025",
    body:`
Students are invited to participate in TechFest auditions.

Audition categories:
• Classical singing  
• Western dance  
• Band performance  
• Creative stage acts  

Please register before the deadline.

Regards,  
Cultural Committee
`
  },
];

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

export default function EmailModal({ isOpen, onClose }: Props) {
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
  if (!isOpen) return null;

  return (
    <Portal>
      {/* Backdrop for main modal */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[999] bg-black/20 backdrop-blur-[3px]"
      />

      {/* Email List Modal */}
      <div
        className="
          fixed bottom-10 right-10 z-1000
          top-20 translate-x-6
          w-[400px]
          bg-white
          rounded-md
          border border-[#E5E7EB]
          shadow-xl
          overflow-hidden
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <EnvelopeSimpleIcon
            size={25}
              weight="fill"
              color="#43C17A"
            />
            <h2 className="text-[16px] font-semibold text-[#282828]">Email</h2>
          </div>
          <button onClick={onClose}>
            <X size={18} className="text-[#6B7280]" />
          </button>
        </div>

        {/* Email List */}
        <div className="max-h-[500px] overflow-y-auto">
          {emails.map((mail, i) => (
            <div key={i}>
              <div
                className="flex gap-3 px-5 py-4 cursor-pointer"
                onClick={() => setSelectedEmail(mail)} // <-- open subtab
              >
                {/* Avatar */}
                <div
                  className="flex items-center justify-center rounded-full text-[14px] font-medium text-[#414141]"
                  style={{ width: 36, height: 36, backgroundColor: mail.color }}
                >
                  {mail.initials}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="text-[13px] font-normal text-[#414141] leading-[13px]">
                      {mail.sender}
                    </p>
                    <span className="text-[12px] text-[#6B7280]">
                      {mail.time}
                    </span>
                  </div>
                  <p className="mt-[2px] text-[16.25px] font-medium text-[#111827] leading-[100%]">
                    {mail.subject}
                  </p>
                  <p className="mt-[2px] text-[12.5px] font-regular text-[#414141] leading-[13px]">
                    {mail.desc}
                  </p>
                </div>
              </div>
              <hr className="w-[90%] ms-[5%] my-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Email Detail Modal (Subtab) */}
      {selectedEmail && (
        <EmailDetailModal
          mail={selectedEmail}
          onClose={() => setSelectedEmail(null)}
        />
      )}
    </Portal>
  );
}
