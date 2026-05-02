import jsPDF from "jspdf";

// Helper for Indian Rupee to Words Conversion
const amountToWords = (num: number): string => {
  if (num === 0) return "Zero Only";
  const a = [
    "",
    "One ",
    "Two ",
    "Three ",
    "Four ",
    "Five ",
    "Six ",
    "Seven ",
    "Eight ",
    "Nine ",
    "Ten ",
    "Eleven ",
    "Twelve ",
    "Thirteen ",
    "Fourteen ",
    "Fifteen ",
    "Sixteen ",
    "Seventeen ",
    "Eighteen ",
    "Nineteen ",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const numStr = num.toString();
  if (numStr.length > 9) return "Overflow";
  const n = ("000000000" + numStr)
    .substr(-9)
    .match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return "";
  let str = "";
  str +=
    n[1] != "00"
      ? (a[Number(n[1])] || b[Number(n[1][0])] + " " + a[Number(n[1][1])]) +
        "Crore "
      : "";
  str +=
    n[2] != "00"
      ? (a[Number(n[2])] || b[Number(n[2][0])] + " " + a[Number(n[2][1])]) +
        "Lakh "
      : "";
  str +=
    n[3] != "00"
      ? (a[Number(n[3])] || b[Number(n[3][0])] + " " + a[Number(n[3][1])]) +
        "Thousand "
      : "";
  str +=
    n[4] != "0"
      ? (a[Number(n[4])] || b[Number(n[4][0])] + " " + a[Number(n[4][1])]) +
        "Hundred "
      : "";
  str +=
    n[5] != "00"
      ? (str != "" ? "and " : "") +
        (a[Number(n[5])] || b[Number(n[5][0])] + " " + a[Number(n[5][1])]) +
        "Only"
      : "Only";
  return str.trim();
};

export const generateSemesterReceipt = (
  plan: any,
  sem: any,
  profile: any,
  summary: any[],
) => {
  const doc = new jsPDF("p", "mm", "a4");
  const formatCurrency = (val: number) =>
    `Rs. ${val.toLocaleString("en-IN")}.00`;
  const pageWidth = doc.internal.pageSize.getWidth();

  const yourBase64Logo =
    "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";
  // --- 1.  HEADER & LOGO ---
  // Placeholder for Logo (Replace the rect below with doc.addImage)
  // Example: doc.addImage(yourBase64Logo, 'PNG', 15, 15, 30, 30);
  doc.setFillColor(230, 230, 230);
  //   doc.addImage(yourBase64Logo, "PNG", 15, 15, 30, 30);
  doc.rect(15, 15, 25, 25, "F");
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text("LOGO", 27, 28, { align: "center" });

  // College Name & Header
  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFont("helvetica", "bold");
  doc.text("GKElite Info", 45, 24);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text("360B Meridian Plaza, Ameerpet, Hyderabad - 560001", 45, 30);
  doc.text("Email: accounts@college.edu | Phone: +91 98765 43210", 45, 35);

  // Colored Receipt Title Band
  doc.setFillColor(59, 130, 246); // blue-500
  doc.rect(15, 45, pageWidth - 30, 10, "F");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("FEE PAYMENT RECEIPT", pageWidth / 2, 52, { align: "center" });

  // --- 2. STUDENT & RECEIPT DETAILS ---
  const receiptNo = `REC-${new Date().getFullYear()}${new Date().getMonth() + 1}-${Math.floor(1000 + Math.random() * 9000)}`;
  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);

  // Left Column (Student Info)
  doc.setFont("helvetica", "bold");
  doc.text("Student Name:", 15, 65);
  doc.text("Roll / Reg No:", 15, 72);
  doc.text("Program:", 15, 79);
  doc.text("Semester:", 15, 86);

  doc.setFont("helvetica", "normal");
  doc.text(profile?.name?.toUpperCase() || "NOT PROVIDED", 45, 65);
  doc.text(profile?.rollNo?.toUpperCase() || "NOT PROVIDED", 45, 72);
  doc.text(plan.programName || "N/A", 45, 79);
  doc.text(sem.localSemesterName || `Semester ${sem.semesterNumber}`, 45, 86);

  // Right Column (Receipt Info)
  doc.setFont("helvetica", "bold");
  doc.text("Receipt No:", 135, 65);
  doc.text("Date:", 135, 72);
  doc.text("Status:", 135, 79);

  doc.setFont("helvetica", "normal");
  doc.text(receiptNo, 160, 65);
  doc.text(dateStr, 160, 72);

  if (sem.status === "PAID")
    doc.setTextColor(16, 185, 129); // emerald-500
  else if (sem.status === "PARTIAL")
    doc.setTextColor(245, 158, 11); // amber-500
  else doc.setTextColor(239, 68, 68); // red-500
  doc.setFont("helvetica", "bold");
  doc.text(sem.status, 160, 79);

  // --- 3. FEE BREAKDOWN TABLE ---
  let startY = 95;
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(15, startY, pageWidth - 30, 8, "F");

  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.text("Fee Particulars", 20, startY + 5);
  doc.text("Amount", pageWidth - 20, startY + 5, { align: "right" });

  startY += 8;
  doc.setFont("helvetica", "normal");

  plan.components?.forEach((comp: any) => {
    doc.text(comp.label, 20, startY + 6);
    doc.text(formatCurrency(comp.amount), pageWidth - 20, startY + 6, {
      align: "right",
    });
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(15, startY + 9, pageWidth - 15, startY + 9);
    startY += 9;
  });

  if (plan.gstAmount > 0) {
    doc.text(`GST (${plan.gstPercent}%)`, 20, startY + 6);
    doc.text(formatCurrency(plan.gstAmount), pageWidth - 20, startY + 6, {
      align: "right",
    });
    doc.line(15, startY + 9, pageWidth - 15, startY + 9);
    startY += 9;
  }

  // Subtotal
  doc.setFont("helvetica", "bold");
  doc.text("Total Required Fee:", 130, startY + 7);
  doc.text(formatCurrency(sem.requiredAmount), pageWidth - 20, startY + 7, {
    align: "right",
  });

  // --- 4. TRANSACTION DETAILS (THE CRUCIAL PART) ---
  startY += 20;
  doc.setFillColor(241, 245, 249);
  doc.rect(15, startY, pageWidth - 30, 8, "F");

  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.text("Transaction Details (Successful Payments)", 20, startY + 5);

  startY += 12;
  doc.setFontSize(9);
  doc.text("Date", 15, startY);
  doc.text("Transaction ID", 45, startY);
  doc.text("Mode", 130, startY);
  doc.text("Amount", pageWidth - 15, startY, { align: "right" });

  doc.setDrawColor(200);
  doc.line(15, startY + 2, pageWidth - 15, startY + 2);
  startY += 7;

  doc.setFont("helvetica", "normal");

  // Filter for successful transactions from the summary prop
  const successfulTxns =
    summary?.filter(
      (tx) =>
        tx.status.toLowerCase() === "success" ||
        tx.status.toLowerCase() === "succeeded",
    ) || [];

  if (successfulTxns.length === 0) {
    doc.setTextColor(150);
    doc.setFont("helvetica", "italic");
    doc.text("No successful transactions found for this account.", 15, startY);
    startY += 7;
  } else {
    doc.setTextColor(50);
    successfulTxns.forEach((tx) => {
      doc.text(tx.paidOn, 15, startY);
      doc.text(tx.gatewayTransactionId || tx.id.toString(), 45, startY);
      doc.text(tx.paymentMode || "Online", 130, startY);
      doc.text(formatCurrency(tx.paidAmount), pageWidth - 15, startY, {
        align: "right",
      });
      startY += 7;
    });
  }

  // --- 5. FINAL SUMMARY & AMOUNT IN WORDS ---
  startY += 10;
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);

  doc.setFont("helvetica", "bold");
  doc.text("Total Amount Paid:", 130, startY);
  doc.setTextColor(16, 185, 129); // emerald-500
  doc.text(formatCurrency(sem.paidAmount), pageWidth - 15, startY, {
    align: "right",
  });

  doc.setTextColor(30, 41, 59);
  doc.text("Balance Due:", 130, startY + 7);
  doc.setTextColor(239, 68, 68); // red-500
  doc.text(formatCurrency(sem.pendingAmount), pageWidth - 15, startY + 7, {
    align: "right",
  });

  startY += 20;
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.setFont("helvetica", "normal");
  doc.text("Amount in Words (Total Paid):", 15, startY);

  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.text(`Rupees ${amountToWords(sem.paidAmount)}`, 15, startY + 6);

  // --- 6. FOOTER & SIGNATURE ---
  doc.setDrawColor(200);
  doc.line(pageWidth - 70, 260, pageWidth - 15, 260); // Signature line
  doc.setFontSize(10);
  doc.text("Authorized Signatory", pageWidth - 15, 265, { align: "right" });

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(
    "This is a system generated receipt and does not require a physical signature.",
    pageWidth / 2,
    280,
    { align: "center" },
  );

  // Save PDF
  doc.save(
    `Fee_Receipt_${profile?.rollNo || "Student"}_Sem${sem.semesterNumber}.pdf`,
  );
};
