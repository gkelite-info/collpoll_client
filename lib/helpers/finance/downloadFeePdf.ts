// lib/helpers/downloadFeePdf.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const downloadFeePdf = (data: any, collegeName: string) => {
  const doc = new jsPDF();

  // 1. Header
  doc.setFontSize(20);
  doc.setTextColor(31, 47, 86); // #1F2F56
  doc.text(collegeName, 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Fee Structure Document", 14, 28);

  // 2. Info Block (Branch, Year, etc.)
  doc.setFontSize(11);
  doc.setTextColor(0);

  const infoX = 14;
  let infoY = 40;

  doc.text(`Academic Year: ${data.academicYear}`, infoX, infoY);
  doc.text(`Branch: ${data.branchName}`, infoX, infoY + 6);

  if (data.dueDate) {
    const d = new Date(data.dueDate);
    const dateStr = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    doc.text(`Due Date: ${dateStr}`, 140, infoY);
  }

  doc.text(`Late Fee Rule: Rs. ${data.lateFeePerDay}/day`, 140, infoY + 6);

  // 3. Table of Components
  const tableBody = data.components.map((comp: any) => [
    comp.label,
    `Rs. ${Number(comp.amount).toLocaleString("en-IN")}`,
  ]);

  // Add GST row if it exists separately or as part of logic
  // (Your components array already has GST if it was saved as a row)

  autoTable(doc, {
    startY: 55,
    head: [["Fee Component", "Amount"]],
    body: tableBody,
    theme: "grid",
    headStyles: { fillColor: [31, 47, 86] }, // #1F2F56
    styles: { fontSize: 11 },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 50, halign: "right" },
    },
  });

  // 4. Total & Footer
  // @ts-ignore (autoTable adds lastAutoTable property)
  const finalY = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(
    `Total Fee: Rs. ${Number(data.totalAmount).toLocaleString("en-IN")}`,
    14,
    finalY,
  );

  if (data.gstPercentage > 0) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`(Includes ${data.gstPercentage}% GST)`, 14, finalY + 6);
  }

  if (data.remarks) {
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(`Remarks: ${data.remarks}`, 14, finalY + 15);
  }

  // 5. Save
  doc.save(`${collegeName}_Fee_Structure_${data.academicYear}.pdf`);
};
