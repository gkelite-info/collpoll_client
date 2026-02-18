"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Bank,
  QrCode,
  CaretLeft,
  CheckCircle,
  ShieldCheck,
} from "@phosphor-icons/react";
import toast, { Toaster } from "react-hot-toast";

export interface FeeComponent {
  label: string;
  amount: number;
}

export interface FeePlan {
  programName: string;
  type: string;
  academicYear: string;
  openingBalance: number;
  components: FeeComponent[];
  gstAmount: number;
  gstPercent: number;
  applicableFees: number;
  scholarship: number;
  totalPayable: number;
  paidTillNow: number;
  pendingAmount: number;
}

interface PaymentConfirmProps {
  plan: FeePlan;
  onBack: () => void;
}

const PaymentConfirm = ({ plan, onBack }: PaymentConfirmProps) => {
  const [selectedMethod, setSelectedMethod] = useState<
    "card" | "upi" | "netbanking"
  >("card");

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(val);

  const handleBack = () => {
    onBack();
  };

  const handlePayment = async () => {
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: plan.pendingAmount,
          studentId: 123, // replace with real studentId later
        }),
      });

      const data = await res.json();

      window.location.href = data.url;
    } catch (err) {
      toast.error("Payment initialization failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <Toaster position="top-right" />
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 cursor-pointer text-gray-500 hover:text-gray-800 transition-colors font-medium text-sm"
      >
        <CaretLeft size={16} weight="bold" />
        Back to Fee Details
      </button>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* LEFT COLUMN: ORDER SUMMARY (The Fee Data) */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                Payment Summary
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Review your fee breakdown before proceeding.
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Header Info */}
              <div className="flex justify-between items-start pb-4 border-b border-gray-100">
                <div>
                  <h3 className="font-semibold text-gray-800 text-base">
                    {plan.programName}
                  </h3>
                  <span className="inline-block bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded mt-1 font-medium">
                    {plan.type}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Academic Year</p>
                  <p className="font-medium text-gray-800">
                    {plan.academicYear}
                  </p>
                </div>
              </div>

              {/* Fee Breakdown */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Opening Balance</span>
                  <span className="text-gray-900 font-medium">
                    {formatCurrency(plan.openingBalance)}
                  </span>
                </div>

                {/* Dynamic Components */}
                {plan.components.map((comp, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-gray-600">{comp.label}</span>
                    <span className="text-gray-900 font-medium">
                      {formatCurrency(comp.amount)}
                    </span>
                  </div>
                ))}

                {/* GST */}
                {plan.gstAmount > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">
                      GST ({plan.gstPercent}%)
                    </span>
                    <span className="text-gray-900 font-medium">
                      {formatCurrency(plan.gstAmount)}
                    </span>
                  </div>
                )}

                {/* Scholarship */}
                {plan.scholarship > 0 && (
                  <div className="flex justify-between items-center text-sm text-emerald-600">
                    <span>Scholarship Applied</span>
                    <span>- {formatCurrency(plan.scholarship)}</span>
                  </div>
                )}

                <div className="border-t border-dashed border-gray-200 my-2"></div>

                {/* Paid */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Paid Amount</span>
                  <span className="text-emerald-600 font-medium">
                    - {formatCurrency(plan.paidTillNow)}
                  </span>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-base font-bold text-gray-800">
                    Total Payable
                  </span>
                  <span className="text-xl font-bold text-emerald-600">
                    {formatCurrency(plan.pendingAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
            <ShieldCheck size={16} weight="fill" className="text-gray-300" />
            <span>Payments are secure and encrypted.</span>
          </div>
        </div>

        {/* RIGHT COLUMN: PAYMENT METHODS */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6">
              Choose Payment Mode
            </h2>

            <div className="space-y-3">
              {/* Card Option */}
              <div
                onClick={() => setSelectedMethod("card")}
                className={`
                        relative p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 group
                        ${
                          selectedMethod === "card"
                            ? "border-emerald-500 bg-emerald-50/30"
                            : "border-gray-100 hover:border-gray-200 bg-white"
                        }
                    `}
              >
                <div
                  className={`p-2 rounded-lg ${selectedMethod === "card" ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-500"}`}
                >
                  <CreditCard
                    size={24}
                    weight={selectedMethod === "card" ? "fill" : "regular"}
                  />
                </div>
                <div className="flex-1">
                  <h4
                    className={`font-semibold text-sm ${selectedMethod === "card" ? "text-emerald-900" : "text-gray-700"}`}
                  >
                    Credit / Debit Card
                  </h4>
                  <p className="text-xs text-gray-500">
                    Visa, Mastercard, Rupay
                  </p>
                </div>
                {selectedMethod === "card" && (
                  <CheckCircle
                    size={20}
                    weight="fill"
                    className="text-emerald-500"
                  />
                )}
              </div>

              {/* UPI Option */}
              <div
                onClick={() => setSelectedMethod("upi")}
                className={`
                        relative p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 group
                        ${
                          selectedMethod === "upi"
                            ? "border-emerald-500 bg-emerald-50/30"
                            : "border-gray-100 hover:border-gray-200 bg-white"
                        }
                    `}
              >
                <div
                  className={`p-2 rounded-lg ${selectedMethod === "upi" ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-500"}`}
                >
                  <QrCode
                    size={24}
                    weight={selectedMethod === "upi" ? "fill" : "regular"}
                  />
                </div>
                <div className="flex-1">
                  <h4
                    className={`font-semibold text-sm ${selectedMethod === "upi" ? "text-emerald-900" : "text-gray-700"}`}
                  >
                    UPI
                  </h4>
                  <p className="text-xs text-gray-500">
                    Google Pay, PhonePe, Paytm
                  </p>
                </div>
                {selectedMethod === "upi" && (
                  <CheckCircle
                    size={20}
                    weight="fill"
                    className="text-emerald-500"
                  />
                )}
              </div>

              {/* Net Banking Option */}
              {/* <div
                onClick={() => setSelectedMethod("netbanking")}
                className={`
                        relative p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 group
                        ${
                          selectedMethod === "netbanking"
                            ? "border-emerald-500 bg-emerald-50/30"
                            : "border-gray-100 hover:border-gray-200 bg-white"
                        }
                    `}
              >
                <div
                  className={`p-2 rounded-lg ${selectedMethod === "netbanking" ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-500"}`}
                >
                  <Bank
                    size={24}
                    weight={
                      selectedMethod === "netbanking" ? "fill" : "regular"
                    }
                  />
                </div>
                <div className="flex-1">
                  <h4
                    className={`font-semibold text-sm ${selectedMethod === "netbanking" ? "text-emerald-900" : "text-gray-700"}`}
                  >
                    Net Banking
                  </h4>
                  <p className="text-xs text-gray-500">All Indian Banks</p>
                </div>
                {selectedMethod === "netbanking" && (
                  <CheckCircle
                    size={20}
                    weight="fill"
                    className="text-emerald-500"
                  />
                )}
              </div> */}
            </div>

            {/* Pay Button */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
                <span>Total to pay</span>
                <span className="font-bold text-gray-900">
                  {formatCurrency(plan.pendingAmount)}
                </span>
              </div>
              <button
                onClick={handlePayment}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition-all active:scale-[0.98] flex justify-center items-center gap-2"
              >
                Pay {formatCurrency(plan.pendingAmount)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirm;
