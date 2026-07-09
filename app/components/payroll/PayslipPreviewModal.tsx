import { useEffect, useState, useRef } from "react";
import { X, DownloadSimple, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { getPayrollEntryDetails } from "@/lib/helpers/Hr/payroll/payrollAPI";
import { formatExactNumber } from "@/app/utils/numberFormat";
import { ModalDetailShimmer } from "@/app/(screens)/admin/my-attendance/payroll/components/shimmers";
import toast from "react-hot-toast";

// @ts-ignore
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PayslipPreviewModalProps {
  entryId: number | null;
  onClose: () => void;
}

const getBase64ImageFromUrl = async (imageUrl: string): Promise<string> => {
  try {
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);

    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const size = Math.min(img.width, img.height) > 0 ? Math.min(img.width, img.height) : 512;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
           resolve("");
           return;
        }

        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        ctx.fillStyle = "#F9FAFB";
        ctx.fillRect(0, 0, size, size);

        const scale = Math.max(size / img.width, size / img.height);
        const x = (size / 2) - (img.width / 2) * scale;
        const y = (size / 2) - (img.height / 2) * scale;
        
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        
        const dataUrl = canvas.toDataURL("image/png");
        URL.revokeObjectURL(objectUrl);
        resolve(dataUrl);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve("");
      };
      img.src = objectUrl;
    });
  } catch (error) {
    return "";
  }
};

export default function PayslipPreviewModal({ entryId, onClose }: PayslipPreviewModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const payslipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!entryId) return;
    let isMounted = true;
    const fetchDetails = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await getPayrollEntryDetails(entryId);
        
        // Parse the exact breakdown of leaves, holidays, weekoffs
        if (result && result.payroll_runs) {
          const month = result.payroll_runs.payrollMonth;
          const year = result.payroll_runs.payrollYear;
          const startDate = new Date(year, month - 1, 1);
          const endDate = new Date(year, month, 0);
          
          const allHolidays = result.holidaysInMonth || [];
          const explicitWeekoffDates = new Set(
            allHolidays
              .filter((h: any) => h.holidayType === 'weekly_off')
              .map((h: any) => h.holidayDate)
          );
          
          const holidayDates = new Set(
            allHolidays
              .filter((h: any) => h.holidayType !== 'weekly_off')
              .map((h: any) => h.holidayDate)
          );
          
          let actualHolidays = 0;
          let actualWeekoffs = 0;
          
          for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split("T")[0];
            const isWeekoff = explicitWeekoffDates.has(dateStr) || (explicitWeekoffDates.size === 0 && d.getDay() === 0);
            const isHoliday = holidayDates.has(dateStr);
            
            if (isWeekoff) actualWeekoffs++;
            else if (isHoliday) actualHolidays++;
          }

          result.parsedBreakdown = {
            holidays: actualHolidays,
            weekoffs: actualWeekoffs,
          };
        }

        if (isMounted) setData(result);
      } catch (err: any) {
        if (isMounted) setError(err.message || "Failed to load payslip details");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetails();
    return () => { isMounted = false; };
  }, [entryId]);

  if (!entryId) return null;

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthName = data ? monthNames[data.payroll_runs.payrollMonth - 1] : "";
  const year = data ? data.payroll_runs.payrollYear : "";

  // Safe compliance mapping
  const compliances = data?.user?.employee_pay_profiles?.[0]?.employee_payroll_compliance_values || [];
  const earnings = [
    { label: "Basic Pay / Gross Salary", amount: Number(data?.grossEarnings || 0) }
  ];
  
  const deductions: any[] = [];
  compliances.forEach((c: any) => {
    const title = c.payroll_compliance_types?.title?.toUpperCase() || "";
    if (title === "PF" || title.includes("PROVIDENT FUND")) deductions.push({ label: "Provident Fund (PF)", amount: Number(c.amount || 0) });
    else if (title === "EF" || title === "ESI" || title.includes("EMPLOYEE FUND")) deductions.push({ label: "ESI", amount: Number(c.amount || 0) });
    else if (title === "PT" || title === "TDS" || title.includes("TAX")) deductions.push({ label: "Professional Tax / TDS", amount: Number(c.amount || 0) });
  });

  const lopAmount = (Number(data?.lopDays || 0) * Number(data?.perDayRate || 0)) + (Number(data?.halfDays || 0) * Number(data?.perDayRate || 0) * 0.5);
  if (lopAmount > 0) {
    deductions.push({ label: "Loss of Pay (LOP)", amount: lopAmount });
  }

  const logoUrl = data?.collegeMedia?.logoUrl;
  const bucketUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/college-media/` : "";
  const fullLogoUrl = logoUrl ? (logoUrl.startsWith("http") ? logoUrl : `${bucketUrl}${logoUrl}`) : null;
  
  const rawDate = data?.payroll_runs?.createdAt;
  const formattedDate = rawDate ? new Date(rawDate).toLocaleDateString('en-GB') : "N/A";
  const totalDeductionsCalc = deductions.reduce((sum, d) => sum + d.amount, 0);

  const handleDownload = async () => {
    if (!data) return;
    setIsDownloading(true);
    const toastId = toast.loading("Generating PDF...");
    
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let currentY = margin;

      // Header Box Background (Optional, light grey)
      // pdf.setFillColor(250, 250, 250);
      // pdf.rect(margin, currentY, pageWidth - margin * 2, 35, "F");

      // 1. Logo and Header
      if (fullLogoUrl) {
        const logoBase64 = await getBase64ImageFromUrl(fullLogoUrl);
        if (logoBase64) {
          pdf.addImage(logoBase64, "PNG", margin, currentY, 20, 20);
        }
      } else {
        pdf.setFillColor(67, 193, 122, 0.1);
        pdf.rect(margin, currentY, 20, 20, "F");
        pdf.setTextColor(67, 193, 122);
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text("CO", margin + 10, currentY + 12, { align: "center" });
      }

      pdf.setTextColor(15, 23, 42); // slate-900
      pdf.setFontSize(22);
      pdf.setFont("helvetica", "bold");
      pdf.text("PAYSLIP", margin + 25, currentY + 8);
      
      pdf.setTextColor(100, 116, 139); // slate-500
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`For the month of ${monthName} ${year}`, margin + 25, currentY + 14);

      // Status Badge
      const statusText = (data.status || "PENDING").toUpperCase();
      const statusWidth = pdf.getTextWidth(statusText) + 12; // Add a bit more padding
      const statusX = pageWidth - margin - statusWidth;
      
      pdf.setFillColor(data.status === 'paid' ? 220 : 255, data.status === 'paid' ? 252 : 237, data.status === 'paid' ? 231 : 213);
      pdf.roundedRect(statusX, currentY + 3, statusWidth, 6, 3, 3, "F");
      pdf.setTextColor(data.status === 'paid' ? 21 : 154, data.status === 'paid' ? 128 : 52, data.status === 'paid' ? 61 : 18);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.text(statusText, statusX + (statusWidth / 2), currentY + 6.2, { align: "center", baseline: "middle" });

      pdf.setTextColor(148, 163, 184); // slate-400
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Generated on ${formattedDate}`, pageWidth - margin, currentY + 14, { align: "right" });

      currentY += 30;
      pdf.setDrawColor(241, 245, 249);
      pdf.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 8;

      // 2. Employee Details
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(margin, currentY, pageWidth - margin * 2, 45, 3, 3, "F");
      pdf.setDrawColor(241, 245, 249);
      pdf.roundedRect(margin, currentY, pageWidth - margin * 2, 45, 3, 3, "S");

      currentY += 10;
      pdf.setFontSize(7);
      pdf.setTextColor(148, 163, 184);
      pdf.setFont("helvetica", "bold");
      
      // Row 1 Headings
      pdf.text("EMPLOYEE NAME", margin + 5, currentY);
      pdf.text("EMPLOYEE ID", margin + 65, currentY);
      pdf.text("EMAIL", margin + 125, currentY);

      currentY += 5;
      pdf.setFontSize(10);
      pdf.setTextColor(15, 23, 42);
      pdf.text(data.user?.fullName || "N/A", margin + 5, currentY);
      pdf.text(data.user?.employee_ids?.employeeId || "N/A", margin + 65, currentY);
      pdf.text(data.user?.email || "N/A", margin + 125, currentY);

      currentY += 12;
      pdf.setFontSize(7);
      pdf.setTextColor(148, 163, 184);
      pdf.setFont("helvetica", "bold");
      
      // Row 2 Headings
      pdf.text("TOTAL MONTH DAYS", margin + 5, currentY);
      pdf.text("LOSS OF PAY (DAYS)", margin + 65, currentY);
      pdf.text("PAID DAYS", margin + 125, currentY);

      currentY += 5;
      pdf.setFontSize(10);
      pdf.setTextColor(15, 23, 42);
      pdf.text(String(data.payroll_runs.totalCalendarDays || 30), margin + 5, currentY);
      pdf.setTextColor(220, 38, 38);
      pdf.text(String(data.lopDays || 0), margin + 65, currentY);
      pdf.setTextColor(67, 193, 122);
      pdf.text(String(data.totalPayableDays), margin + 125, currentY);

      currentY += 25;

      // 3. Salary Breakdown Tables
      // Left side: Earnings, Right side: Deductions
      const colWidth = (pageWidth - margin * 2 - 10) / 2;
      
      // Table configuration
      const getTableBody = (items: any[]) => items.length > 0 ? items.map(i => [i.label, `Rs ${formatExactNumber(i.amount)}`]) : [["No items", ""]];
      
      autoTable(pdf, {
        startY: currentY,
        margin: { left: margin },
        tableWidth: colWidth,
        head: [["EARNINGS", "AMOUNT"]],
        body: getTableBody(earnings),
        foot: [["Total Earnings", `Rs ${formatExactNumber(Number(data.grossEarnings || 0))}`]],
        theme: "plain",
        headStyles: { fontStyle: "bold", textColor: [15, 23, 42], fontSize: 8, cellPadding: { top: 2, bottom: 2 }, lineWidth: { bottom: 0.5 }, lineColor: [15, 23, 42] },
        bodyStyles: { textColor: [71, 85, 105], fontSize: 9, cellPadding: { top: 4, bottom: 4 } },
        footStyles: { fontStyle: "bold", textColor: [15, 23, 42], fontSize: 10, cellPadding: { top: 6, bottom: 6 }, valign: 'middle', lineWidth: { top: 0.5 }, lineColor: [226, 232, 240] },
        columnStyles: { 0: { halign: "left" }, 1: { halign: "right", fontStyle: "bold", textColor: [15, 23, 42] } }
      });

      // @ts-ignore
      autoTable(pdf, {
        startY: currentY,
        margin: { left: margin + colWidth + 10 },
        tableWidth: colWidth,
        head: [["DEDUCTIONS", "AMOUNT"]],
        body: getTableBody(deductions),
        foot: [["Total Deductions", `Rs ${formatExactNumber(totalDeductionsCalc)}`]],
        theme: "plain",
        headStyles: { fontStyle: "bold", textColor: [15, 23, 42], fontSize: 8, cellPadding: { top: 2, bottom: 2 }, lineWidth: { bottom: 0.5 }, lineColor: [15, 23, 42] },
        bodyStyles: { textColor: [71, 85, 105], fontSize: 9, cellPadding: { top: 4, bottom: 4 } },
        footStyles: { fontStyle: "bold", textColor: [220, 38, 38], fontSize: 10, cellPadding: { top: 6, bottom: 6 }, valign: 'middle', lineWidth: { top: 0.5 }, lineColor: [226, 232, 240] },
        columnStyles: { 0: { halign: "left" }, 1: { halign: "right", fontStyle: "bold", textColor: [220, 38, 38] } }
      });

      // @ts-ignore
      currentY = Math.max((pdf as any).lastAutoTable.finalY, currentY) + 20;

      // 4. Net Payable Box
      pdf.setFillColor(240, 253, 244);
      pdf.roundedRect(margin, currentY, pageWidth - margin * 2, 25, 3, 3, "F");
      pdf.setDrawColor(187, 247, 208);
      pdf.roundedRect(margin, currentY, pageWidth - margin * 2, 25, 3, 3, "S");

      pdf.setTextColor(21, 128, 61);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text("NET PAYABLE SALARY", margin + 8, currentY + 10);
      
      pdf.setTextColor(34, 197, 94);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text("Amount transferred to employee's bank account", margin + 8, currentY + 15.5);

      pdf.setTextColor(67, 193, 122);
      pdf.setFontSize(22);
      pdf.setFont("helvetica", "bold");
      pdf.text(`Rs ${formatExactNumber(Number(data.netPay || 0))}`, pageWidth - margin - 8, currentY + 16, { align: "right" });

      // Footer Note
      pdf.setTextColor(148, 163, 184);
      pdf.setFontSize(6);
      pdf.setFont("helvetica", "bold");
      pdf.text("THIS IS A COMPUTER-GENERATED DOCUMENT AND REQUIRES NO SIGNATURE.", pageWidth / 2, pageHeight - 15, { align: "center" });

      pdf.save(`Payslip_${data.user?.fullName}_${monthName}_${year}.pdf`.replace(/\s+/g, "_"));
      
      toast.success("Payslip downloaded successfully", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF", { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col mx-2 sm:mx-0 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-gray-50/80 sticky top-0 z-10">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate pr-2">Payslip Preview</h2>
          <div className="flex items-center gap-3 shrink-0">
            {data && (
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center gap-2 bg-[#43C17A] hover:bg-[#38A166] text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isDownloading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <DownloadSimple size={18} weight="bold" />
                )}
                <span className="hidden sm:inline">{isDownloading ? "Generating PDF..." : "Download PDF"}</span>
              </button>
            )}
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-200 cursor-pointer bg-white border border-gray-200"
            >
              <X size={18} weight="bold" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-100/50 p-4 sm:p-8">
          {loading ? (
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <ModalDetailShimmer />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-red-500">
              <WarningCircle size={48} weight="duotone" />
              <p className="font-medium text-lg">{error}</p>
            </div>
          ) : data ? (
            <div className="max-w-3xl mx-auto">
              {/* THE PAYSLIP CONTAINER TO BE CAPTURED BY HTML2CANVAS */}
              <div 
                ref={payslipRef}
                className="bg-white p-8 sm:p-12 rounded-xl shadow-[0px_4px_30px_rgba(0,0,0,0.04)] border border-gray-200"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b-2 border-gray-100 pb-6 mb-8">
                  <div className="flex items-center gap-4">
                    {fullLogoUrl ? (
                      <img src={fullLogoUrl} alt="College Logo" className="h-16 w-auto object-contain" crossOrigin="anonymous" />
                    ) : (
                      <div className="h-16 w-16 bg-[#43C17A]/10 rounded-lg flex items-center justify-center">
                        <span className="text-[#43C17A] font-black text-2xl">CO</span>
                      </div>
                    )}
                    <div>
                      <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">PAYSLIP</h1>
                      <p className="text-gray-500 font-medium">For the month of {monthName} {year}</p>
                    </div>
                  </div>
                  
                  <div className="text-right flex flex-col items-start sm:items-end w-full sm:w-auto">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      data.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {data.status === 'paid' && <CheckCircle size={14} weight="fill" />}
                      {data.status}
                    </span>
                    <p className="text-sm text-gray-400 mt-2">Generated on {formattedDate}</p>
                  </div>
                </div>

                {/* Employee Details Grid */}
                <div className="bg-gray-50/80 rounded-xl p-5 mb-8 border border-gray-100">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-5 gap-x-8">
                    <div>
                      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Employee Name</p>
                      <p className="font-bold text-gray-900 text-sm">{data.user?.fullName}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Employee ID</p>
                      <p className="font-bold text-gray-900 text-sm">{data.user?.employee_ids?.employeeId || "N/A"}</p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Email</p>
                      <p className="font-bold text-gray-900 text-sm truncate">{data.user?.email}</p>
                    </div>
                    
                    <div>
                      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Total Month Days</p>
                      <p className="font-bold text-gray-900 text-sm">{data.payroll_runs.totalCalendarDays || 30}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Loss of Pay (Days)</p>
                      <p className="font-bold text-red-600 text-sm">{data.lopDays || 0}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Paid Days</p>
                      <p className="font-bold text-[#43C17A] text-sm">{data.totalPayableDays}</p>
                    </div>
                  </div>
                </div>

                {/* Salary Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Earnings Column */}
                  <div>
                    <h3 className="font-bold text-gray-900 border-b-2 border-gray-900 pb-2 mb-4 uppercase tracking-wider text-sm">Earnings</h3>
                    <div className="flex flex-col gap-3">
                      {earnings.map((e, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 font-medium">{e.label}</span>
                          <span className="font-semibold text-gray-900">₹{formatExactNumber(e.amount)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-6 pt-3 border-t border-gray-200">
                      <span className="font-bold text-gray-900">Total Earnings</span>
                      <span className="font-bold text-gray-900 text-lg">₹{formatExactNumber(Number(data.grossEarnings || 0))}</span>
                    </div>
                  </div>

                  {/* Deductions Column */}
                  <div>
                    <h3 className="font-bold text-gray-900 border-b-2 border-gray-900 pb-2 mb-4 uppercase tracking-wider text-sm">Deductions</h3>
                    <div className="flex flex-col gap-3">
                      {deductions.length > 0 ? (
                        deductions.map((d, i) => (
                          <div key={i} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 font-medium">{d.label}</span>
                            <span className="font-semibold text-red-600">₹{formatExactNumber(d.amount)}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400 italic">No deductions</p>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-6 pt-3 border-t border-gray-200">
                      <span className="font-bold text-gray-900">Total Deductions</span>
                      <span className="font-bold text-red-600 text-lg">
                        ₹{formatExactNumber(deductions.reduce((sum, d) => sum + d.amount, 0))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Net Pay Box */}
                <div className="bg-gradient-to-r from-[#43C17A]/10 to-[#43C17A]/5 border border-[#43C17A]/20 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
                  <div>
                    <h3 className="font-black text-[#2e8855] uppercase tracking-wider">Net Payable Salary</h3>
                    <p className="text-sm text-[#38A166] mt-1 font-medium">Amount transferred to employee's bank account</p>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-black text-[#43C17A]">
                      ₹{formatExactNumber(Number(data.netPay || 0))}
                    </span>
                  </div>
                </div>
                
                {/* Footer Note */}
                <div className="mt-12 text-center border-t border-gray-100 pt-6">
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">This is a computer-generated document and requires no signature.</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
