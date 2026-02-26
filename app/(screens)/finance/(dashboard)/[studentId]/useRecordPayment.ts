import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import { createOfflinePayment } from "@/app/api/payments/offline/actions";
import { useFinanceManager } from "@/app/utils/context/financeManager/useFinanceManager";
import {
  fetchRecentOfflinePayments,
  fetchStudentFeeDetails,
} from "@/lib/helpers/finance/analytics/studentPaymentHelpers";

interface UseRecordPaymentProps {
  studentFeeObligationId: number;
  collegeSemesterId: number;
}

export function useRecordPayment({
  studentFeeObligationId,
  collegeSemesterId,
}: UseRecordPaymentProps) {
  const { financeManagerId, userId, loading: fmLoading } = useFinanceManager();

  const [studentName, setStudentName] = useState("Student");
  const [remainingBalance, setRemainingBalance] = useState<number>(0);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [financeManagerName, setFinanceManagerName] =
    useState("Finance Manager");

  const [paymentMethod, setPaymentMethod] = useState("Manual UPI");
  const [selectedDate, setSelectedDate] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [amountReceived, setAmountReceived] = useState("");
  const [notes, setNotes] = useState("");

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [modalData, setModalData] = useState({
    amount: "0",
    payerName: "",
    newPending: "0",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchFmName() {
      if (!userId) return;
      const { data, error } = await supabase
        .from("users")
        .select("fullName")
        .eq("userId", userId)
        .single();

      if (data && !error) {
        setFinanceManagerName(data.fullName);
      }
    }
    fetchFmName();
  }, [userId]);

  const fetchData = async () => {
    setIsLoadingData(true);

    const [detailsResult, recentPaymentsResult] = await Promise.all([
      fetchStudentFeeDetails(studentFeeObligationId),
      fetchRecentOfflinePayments(studentFeeObligationId),
    ]);

    if (detailsResult.success && detailsResult.data) {
      setStudentName(detailsResult.data.fullName);
      setRemainingBalance(detailsResult.data.remainingBalance);
    } else {
      toast.error("Failed to fetch student fee details.");
    }

    if (recentPaymentsResult.success && recentPaymentsResult.data) {
      setRecentPayments(recentPaymentsResult.data);
    }

    setIsLoadingData(false);
  };

  useEffect(() => {
    if (studentFeeObligationId) fetchData();
  }, [studentFeeObligationId]);

  // --- Handlers ---
  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setAttachedFile(e.target.files[0]);
  };

  const removeFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRecordPayment = async () => {
    try {
      if (!financeManagerId) {
        toast.error("Finance Manager session missing. Please reload.");
        return;
      }

      const numericAmount = Number(amountReceived.replace(/,/g, ""));

      if (!numericAmount || numericAmount <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      if (numericAmount > remainingBalance) {
        toast.error("Amount exceeds remaining balance");
        return;
      }

      setIsSubmitting(true);
      let proofPath: string | null = null;

      if (attachedFile) {
        const fileExt = attachedFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${studentFeeObligationId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("offline-payment-proofs")
          .upload(filePath, attachedFile);

        if (uploadError) throw new Error("Proof upload failed");
        proofPath = filePath;
      }

      const result = await createOfflinePayment({
        studentFeeObligationId,
        collegeSemesterId,
        amount: numericAmount,
        paymentMode: paymentMethod,
        collectedBy: financeManagerId,
        paymentDate: selectedDate || new Date().toISOString().split("T")[0],
        notes,
        proof: proofPath || undefined,
      });

      //   if (result.success) {
      //     toast.success("Payment recorded successfully!");
      //     setIsSuccessModalOpen(true);
      //     fetchData();
      //     setAmountReceived("");
      //     setNotes("");
      //     removeFile();
      //   }

      if (result.success) {
        toast.success("Payment recorded successfully!");

        setModalData({
          amount: numericAmount.toLocaleString("en-IN"),
          payerName: studentName,
          newPending: (remainingBalance - numericAmount).toLocaleString(
            "en-IN",
          ),
        });

        setIsSuccessModalOpen(true);
        fetchData();

        setAmountReceived("");
        setNotes("");
        removeFile();
      }
    } catch (err: any) {
      toast.error(err.message || "Payment failed to record");
    } finally {
      setIsSubmitting(false);
    }
  };

  const numericInputAmount = Number(amountReceived.replace(/,/g, "")) || 0;
  const newPendingAmount = Math.max(0, remainingBalance - numericInputAmount);

  return {
    studentName,
    remainingBalance,
    recentPayments,
    isLoadingData: isLoadingData || fmLoading,
    paymentMethod,
    setPaymentMethod,
    selectedDate,
    setSelectedDate,
    attachedFile,
    amountReceived,
    setAmountReceived,
    notes,
    setNotes,
    isSuccessModalOpen,
    setIsSuccessModalOpen,
    isSubmitting,
    numericInputAmount,
    newPendingAmount,
    financeManagerId,
    financeManagerName,
    fileInputRef,
    dateInputRef,
    handleUploadClick,
    handleFileChange,
    removeFile,
    handleRecordPayment,
    modalData,
  };
}
