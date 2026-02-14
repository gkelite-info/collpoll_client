"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import QuickActions from "./quickActions";
import FeeStats from "./feeStats";
import ProfileDetails from "./profileCard";
import { PaymentSuccessModal } from "../../modals/paymentSuccessModal";
import { QRCodeSVG } from "qrcode.react";

const RecordPayment = () => {
  // --- State ---
  const [paymentMethod, setPaymentMethod] = useState("Manual UPI");
  const [selectedDate, setSelectedDate] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // --- Refs ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4 font-sans text-gray-800">
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
        <h2 className="text-gray-800 font-bold text-base mb-4">
          Offline Payment
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-500 font-semibold text-xs">
                Amount Received ₹
              </label>
              <input
                type="text"
                defaultValue="20,000"
                className="border border-gray-300 rounded px-3 py-2 text-green-600 font-bold text-sm focus:outline-none focus:border-green-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-500 font-semibold text-xs">
                Remaining Balance
              </label>
              <input
                type="text"
                readOnly
                defaultValue="4,75,630"
                className="border border-gray-300 rounded px-3 py-2 text-green-600 font-bold text-sm bg-gray-50 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-gray-500 font-semibold text-xs">
              Payment Method
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["Cash", "Bank Transfer", "Cheque", "Manual UPI"].map(
                (method) => (
                  <label
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`flex items-center gap-2 border rounded px-3 py-2 cursor-pointer transition-all ${
                      paymentMethod === method
                        ? "border-green-500 bg-green-50/30"
                        : "border-gray-300 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="relative flex items-center justify-center">
                      <div
                        className={`w-3.5 h-3.5 rounded-full border ${paymentMethod === method ? "border-green-500 border-[4px]" : "border-gray-400"}`}
                      />
                    </div>
                    <span className="text-gray-600 text-xs font-medium whitespace-nowrap">
                      {method}
                    </span>
                  </label>
                ),
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-500 font-semibold text-xs">
                Payment Date
              </label>
              <div
                className="relative cursor-pointer"
                onClick={() => dateInputRef.current?.showPicker()}
              >
                <input
                  ref={dateInputRef}
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-700 text-sm focus:outline-none focus:border-green-500"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-500 font-semibold text-xs">
                Collected By
              </label>
              <div className="flex items-center gap-2 border border-gray-300 rounded px-3 py-1.5 h-[38px]">
                <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden shrink-0">
                  <img
                    src="/rahul.png"
                    alt="User"
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </div>
                <span className="text-gray-700 font-medium text-xs">
                  Stephen Jones
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-500 font-semibold text-xs">
                Attach Proof
              </label>
              <div className="border border-gray-300 rounded p-1 flex items-center justify-between h-[38px]">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />

                {attachedFile ? (
                  <div className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-2 max-w-[70%] truncate">
                    <span className="truncate">{attachedFile.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      className="hover:text-green-900"
                    >
                      <CloseIcon size={12} />
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-400 text-xs px-2">
                    No file selected
                  </span>
                )}

                <button
                  onClick={handleUploadClick}
                  className="bg-[#34D399] hover:bg-[#10B981] text-white px-3 py-1 rounded text-xs font-bold transition-colors"
                >
                  Upload
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-500 font-semibold text-xs">
                Notes
              </label>
              <input
                className="border border-gray-300 rounded px-3 py-2 text-xs text-gray-600 h-[38px] focus:outline-none focus:border-green-500"
                defaultValue="Parent discussed fee reduction. partial amount collected today."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2    gap-4">
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 flex flex-col justify-between h-[220px]">
          <div>
            <h3 className="text-gray-800 font-bold text-base mb-4">
              Payment Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600 font-medium">
                  Amount Received
                </span>
                <span className="text-gray-900 font-bold">₹ 20,000</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600 font-medium">Payment Mode</span>
                <span className="text-green-600 font-medium">
                  {paymentMethod}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600 font-medium">
                  New Pending Amount
                </span>
                <span className="text-green-600 font-bold">₹ 4,75,630</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsSuccessModalOpen(true)}
            className="w-full bg-[#34D399] hover:bg-[#10B981] text-white py-2.5 rounded font-bold text-sm transition-colors shadow-sm mt-auto"
          >
            Record Offline Payment
          </button>
        </div>

        {/* QR Code Scan */}
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 relative h-[220px] flex flex-col items-center justify-center">
          <button className="absolute top-4 right-4 text-green-500 hover:text-green-700">
            <ShareIcon />
          </button>

          <div className="text-center mb-2">
            <h3 className="text-gray-800 font-bold text-xl leading-none">
              SCAN
            </h3>
            <p className="text-green-500 text-[10px] font-bold tracking-[0.2em]">
              TO PAY
            </p>
          </div>

          <div className="bg-white p-1">
            <div className="">
              <QRCodeSVG
                value="https://www.gkeliteinfo.com/"
                size={150}
                bgColor="transparent"
                fgColor="#000000"
                level="M"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="text-gray-800 font-bold text-base">
            Recent Offline Payments
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9fa] text-gray-500 text-xs uppercase tracking-wider font-bold">
                <th className="py-3 px-5">Amount Received</th>
                <th className="py-3 px-5">Remaining Balance</th>
                <th className="py-3 px-5">Payment Method</th>
                <th className="py-3 px-5">Payment Date</th>
                <th className="py-3 px-5">Collected By</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-xs font-medium">
              {[
                {
                  amt: "900",
                  bal: "4,75,630",
                  method: "UPI",
                  date: "09/08/2025",
                },
                {
                  amt: "23,145",
                  bal: "4,75,630",
                  method: "UPI",
                  date: "09/08/2025",
                },
              ].map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50"
                >
                  <td className="py-3 px-5">₹ {row.amt}</td>
                  <td className="py-3 px-5">₹ {row.bal}</td>
                  <td className="py-3 px-5">{row.method}</td>
                  <td className="py-3 px-5">{row.date}</td>
                  <td className="py-3 px-5">Stephen Jones</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PaymentSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        data={{
          amount: "20,000",
          payerName: "Shravani Reddy",
          newPending: "4,75,630",
        }}
      />
    </div>
  );
};

const CloseIcon = ({ size = 14 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const ShareIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
    <polyline points="16 6 12 2 8 6"></polyline>
    <line x1="12" y1="2" x2="12" y2="15"></line>
  </svg>
);

export default RecordPayment;
