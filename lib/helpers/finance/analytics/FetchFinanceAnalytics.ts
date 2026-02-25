import { supabase } from "@/lib/supabaseClient";

export const formatShortCurrency = (value: number) => {
  if (value >= 10000000) return `₹ ${(value / 10000000).toFixed(1)} Cr`;
  if (value >= 100000) return `₹ ${(value / 100000).toFixed(1)} L`;
  if (value >= 1000) return `₹ ${(value / 1000).toFixed(1)} K`;
  return `₹ ${value.toLocaleString("en-IN")}`;
};

export async function getBranchWiseCollection(
  collegeId: number,
  educationId: number,
  year: string,
) {
  const { data: branches, error: branchError } = await supabase
    .from("college_branch")
    .select("collegeBranchId, collegeBranchCode")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", educationId);

  if (branchError || !branches) {
    console.error("Error fetching branches:", branchError);
    return { chartData: [], gridData: [], tableData: [] };
  }

  const branchMap: Record<
    string,
    {
      branch: string;
      total: number;
      collectedThisYear: number;
      collectedAllTime: number;
    }
  > = {};
  const branchIdToCode: Record<number, string> = {};

  branches.forEach((b) => {
    branchIdToCode[b.collegeBranchId] = b.collegeBranchCode;
    branchMap[b.collegeBranchCode] = {
      branch: b.collegeBranchCode,
      total: 0,
      collectedThisYear: 0,
      collectedAllTime: 0,
    };
  });

  const branchIds = branches.map((b) => b.collegeBranchId);
  if (branchIds.length === 0)
    return { chartData: [], gridData: [], tableData: [] };

  const { data: obligations, error: obError } = await supabase
    .from("student_fee_obligation")
    .select(
      `
      totalAmount,
      collegeBranchId,
      student_fee_collection (
        collectedAmount,
        createdAt
      )
    `,
    )
    .in("collegeBranchId", branchIds);

  if (obError) {
    console.error("Error fetching fee data:", obError);
    return { chartData: [], gridData: [], tableData: [], availableYears: [] };
  }

  const availableYearsSet = new Set<string>();

  obligations?.forEach((ob: any) => {
    const branchCode = branchIdToCode[ob.collegeBranchId];
    if (!branchCode) return;

    branchMap[branchCode].total += Number(ob.totalAmount) || 0;

    ob.student_fee_collection?.forEach((coll: any) => {
      const collYear = new Date(coll.createdAt).getFullYear().toString();

      availableYearsSet.add(collYear);

      const amt = Number(coll.collectedAmount) || 0;
      branchMap[branchCode].collectedAllTime += amt;

      if (collYear === year) {
        branchMap[branchCode].collectedThisYear += amt;
      }
    });
  });

  const chartData: any[] = [];
  const gridData: any[] = [];
  const tableData: any[] = [];

  Object.values(branchMap).forEach((item) => {
    const pending = Math.max(item.total - item.collectedAllTime, 0);

    chartData.push({
      branch: item.branch,
      collected: item.collectedThisYear,
      pending: pending,
    });

    gridData.push({
      branch: item.branch,
      totalFeesShort: formatShortCurrency(item.total),
      collectedShort: formatShortCurrency(item.collectedThisYear),
      pendingShort: formatShortCurrency(pending),
    });

    tableData.push({
      branch: item.branch,
      collected: `₹ ${item.collectedThisYear.toLocaleString("en-IN")}`,
      pending: `₹ ${pending.toLocaleString("en-IN")}`,
      totalFees: `₹ ${item.total.toLocaleString("en-IN")}`,
    });
  });

  const availableYears = Array.from(availableYearsSet).sort((a, b) =>
    b.localeCompare(a),
  );
  if (availableYears.length === 0) {
    availableYears.push(new Date().getFullYear().toString());
  }

  return { chartData, gridData, tableData, availableYears };
}

export async function getYearWiseDetails(
  collegeId: number,
  educationId: number,
  branchCode: string,
  transactionYear: string,
) {
  const { data: branchData, error: branchError } = await supabase
    .from("college_branch")
    .select("collegeBranchId")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", educationId)
    .eq("collegeBranchCode", branchCode)
    .maybeSingle();

  if (branchError) {
    console.error("Error fetching branch:", branchError);
    return null;
  }

  if (!branchData) {
    console.warn(`No branch found for code: ${branchCode}`);
    return { leftChart: [], rightChart: [], tableData: [] };
  }

  // 1. Fetch Obligations + newly added student_academic_history for the accurate semester
  const { data: obligations, error: obError } = await supabase
    .from("student_fee_obligation")
    .select(
      `
      studentFeeObligationId,
      totalAmount,
      college_academic_year!inner ( collegeAcademicYear ),
      students!inner (
        studentId,
        users ( fullName, email ),
        student_academic_history (
          isCurrent,
          college_semester (
            collegeSemester
          )
        )
      ),
      student_fee_collection (
        collectedAmount,
        createdAt,
        college_semester!inner ( collegeSemester )
      )
    `,
    )
    .eq("collegeBranchId", branchData.collegeBranchId);

  if (obError) {
    console.error("Error fetching year-wise data:", obError);
    return null;
  }

  const chartMap = {
    "4th Year": {
      year: "4th yr",
      oddSem: 7,
      evenSem: 8,
      oddLabel: "4-1",
      evenLabel: "4-2",
    },
    "3rd Year": {
      year: "3rd yr",
      oddSem: 5,
      evenSem: 6,
      oddLabel: "3-1",
      evenLabel: "3-2",
    },
    "2nd Year": {
      year: "2nd yr",
      oddSem: 3,
      evenSem: 4,
      oddLabel: "2-1",
      evenLabel: "2-2",
    },
    "1st Year": {
      year: "1st yr",
      oddSem: 1,
      evenSem: 2,
      oddLabel: "1-1",
      evenLabel: "1-2",
    },
  };

  const leftChartData: Record<string, any> = {};
  const rightChartData: Record<string, any> = {};
  const tableData: any[] = [];

  Object.values(chartMap).forEach((map) => {
    leftChartData[map.year] = {
      year: map.year,
      collected: 0,
      totalExpected: 0,
      label: map.oddLabel,
    };
    rightChartData[map.year] = {
      year: map.year,
      collected: 0,
      totalExpected: 0,
      label: map.evenLabel,
    };
  });

  const availableYearsSet = new Set<string>();

  obligations?.forEach((ob: any) => {
    const acYear = ob.college_academic_year?.collegeAcademicYear || "1st Year";
    const mappedYear = chartMap[acYear as keyof typeof chartMap];
    if (!mappedYear) return;

    const yearlyTotal = Number(ob.totalAmount) || 0;
    const semExpected = yearlyTotal / 2;

    leftChartData[mappedYear.year].totalExpected += semExpected;
    rightChartData[mappedYear.year].totalExpected += semExpected;

    // 🟢 Separate tracking: One for the selected year, one for overall pending calculation
    let studentPaidThisYear = 0;
    let studentPaidAllTime = 0;

    ob.student_fee_collection?.forEach((coll: any) => {
      const collYear = new Date(coll.createdAt).getFullYear().toString();

      // 🟢 ADDED: Capture every unique transaction year found in the DB
      availableYearsSet.add(collYear);

      const amount = Number(coll.collectedAmount) || 0;
      const semNum = coll.college_semester?.collegeSemester;

      // Track all time to calculate true pending amount
      studentPaidAllTime += amount;

      // Strictly filter chart and table paid amounts by the selected year
      if (collYear === transactionYear) {
        studentPaidThisYear += amount;

        // Left Chart = 1st Sem of the year (Odd numbers: 1, 3, 5, 7)
        if (semNum % 2 !== 0) {
          leftChartData[mappedYear.year].collected += amount;
        }
        // Right Chart = 2nd Sem of the year (Even numbers: 2, 4, 6, 8)
        else {
          rightChartData[mappedYear.year].collected += amount;
        }
      }
    });

    // Populate Table Data
    const studentInfo = ob.students?.users;
    const studentName = studentInfo?.fullName || "Unknown Student";
    const rollNo = ob.students?.studentId?.toString() || "N/A";

    const activeHistory = ob.students?.student_academic_history?.find(
      (history: any) => history.isCurrent === true,
    );
    const currentSemNum = activeHistory?.college_semester?.collegeSemester;
    const semesterLabel = currentSemNum ? `Sem ${currentSemNum}` : "N/A";

    tableData.push({
      studentName: studentName,
      rollNo: rollNo,
      department: branchCode,
      year: acYear,
      semester: semesterLabel,

      // 🟢 Table Paid Amount now strictly reflects the selected dropdown year
      paidAmount: studentPaidThisYear,

      // Pending Amount is what they still owe overall
      pendingAmount: Math.max(yearlyTotal - studentPaidAllTime, 0),
    });
  });

  // Format Chart Arrays
  const leftChart = Object.values(leftChartData)
    .map((d) => ({ ...d, pending: Math.max(d.totalExpected - d.collected, 0) }))
    .sort((a, b) => b.year.localeCompare(a.year));

  const rightChart = Object.values(rightChartData)
    .map((d) => ({ ...d, pending: Math.max(d.totalExpected - d.collected, 0) }))
    .sort((a, b) => b.year.localeCompare(a.year));
  const availableYears = Array.from(availableYearsSet).sort((a, b) =>
    b.localeCompare(a),
  );
  if (availableYears.length === 0) {
    availableYears.push(new Date().getFullYear().toString());
  }

  // 🟢 CHANGED: Return availableYears alongside the rest of your data
  return { leftChart, rightChart, tableData, availableYears };
}

export async function getStudentFinanceDetails(studentId: string) {
  const { data: studentData } = await supabase
    .from("students")
    .select(
      `
      studentId, collegeId, collegeEducationId, collegeBranchId, collegeSessionId,
      users ( fullName, email, mobile ),
      college_education ( collegeEducationType ),
      college_branch ( collegeBranchType ),
      student_academic_history ( isCurrent, college_academic_year ( collegeAcademicYear ) )
    `,
    )
    .eq("studentId", parseInt(studentId))
    .maybeSingle();

  if (!studentData) return null;

  const userObj: any = Array.isArray(studentData.users)
    ? studentData.users[0]
    : studentData.users;
  const educationObj: any = Array.isArray(studentData.college_education)
    ? studentData.college_education[0]
    : studentData.college_education;
  const branchObj: any = Array.isArray(studentData.college_branch)
    ? studentData.college_branch[0]
    : studentData.college_branch;
  const activeHistory = studentData.student_academic_history?.find(
    (h: any) => h.isCurrent,
  );
  const acYearObj: any = Array.isArray(activeHistory?.college_academic_year)
    ? activeHistory?.college_academic_year[0]
    : activeHistory?.college_academic_year;

  const profile = {
    name: userObj?.fullName || "Unknown",
    course: `${educationObj?.collegeEducationType || "Course"} - ${branchObj?.collegeBranchType || "Branch"}`,
    year: acYearObj?.collegeAcademicYear || "N/A",
    rollNo: studentData.studentId.toString(),
    email: userObj?.email || "N/A",
    mobile: userObj?.mobile || "N/A",
    imageUrl: "/adityamenon.png",
  };

  let feeComponents: { name: string; amount: number }[] = [];
  let baseApplicableFees = 0;
  let gstAmount = 0;

  const { data: structure } = await supabase
    .from("college_fee_structure")
    .select("feeStructureId, dueDate")
    .eq("collegeId", studentData.collegeId)
    .eq("collegeEducationId", studentData.collegeEducationId)
    .eq("collegeBranchId", studentData.collegeBranchId)
    .eq("collegeSessionId", studentData.collegeSessionId)
    .maybeSingle();

  if (structure?.feeStructureId) {
    const { data: components } = await supabase
      .from("college_fee_components")
      .select(`amount, fee_type_master ( feeTypeName )`)
      .eq("feeStructureId", structure.feeStructureId)
      .eq("isActive", true);

    if (components) {
      components.forEach((c: any) => {
        const typeData = Array.isArray(c.fee_type_master)
          ? c.fee_type_master[0]
          : c.fee_type_master;
        const name = typeData?.feeTypeName || "Fee Component";
        const amount = Number(c.amount) || 0;

        if (name.toUpperCase() === "GST") {
          gstAmount += amount;
        } else {
          feeComponents.push({ name, amount });
          baseApplicableFees += amount;
        }
      });
    }
  }

  const { data: obligations } = await supabase
    .from("student_fee_obligation")
    .select(
      `
      totalAmount,
      student_payment_transaction (
        studentPaymentTransactionId, paidAmount, paymentMode, paymentStatus, gatewayTransactionId, createdAt
      )
    `,
    )
    .eq("studentId", parseInt(studentId));

  let totalObligationAmount = 0;
  let totalPaidTillNow = 0;
  const transactions: any[] = [];
  const feeSummary: any[] = [];

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    });
  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })} ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }).toLowerCase()}`;
  };

  obligations?.forEach((ob: any) => {
    totalObligationAmount += Number(ob.totalAmount) || 0;

    ob.student_payment_transaction?.forEach((trx: any) => {
      const amount = Number(trx.paidAmount) || 0;
      if (trx.paymentStatus.toLowerCase() === "success")
        totalPaidTillNow += amount;

      transactions.push({
        id: trx.studentPaymentTransactionId,
        items: "Academic Fees",
        qty: 1,
        costCenter: "Finance Department",
        amount: amount,
        message: "-",
        gateway: trx.paymentMode || "N/A",
        trxnId: trx.gatewayTransactionId || "N/A",
        paidOn: formatDateTime(trx.createdAt),
        status:
          trx.paymentStatus.charAt(0).toUpperCase() +
          trx.paymentStatus.slice(1),
      });

      feeSummary.push({
        id: trx.studentPaymentTransactionId,
        paidAmount: amount,
        paymentMode: trx.paymentMode || "Online",
        entity: "Academic fee Payment",
        paidOn: formatDate(trx.createdAt),
        status:
          trx.paymentStatus.charAt(0).toUpperCase() +
          trx.paymentStatus.slice(1),
        comments: "-",
      });
    });
  });

  transactions.sort(
    (a, b) => new Date(b.paidOn).getTime() - new Date(a.paidOn).getTime(),
  );
  feeSummary.sort(
    (a, b) => new Date(b.paidOn).getTime() - new Date(a.paidOn).getTime(),
  );

  if (feeComponents.length === 0) {
    feeComponents.push({
      name: "Base Tuition Fee",
      amount: totalObligationAmount,
    });
    baseApplicableFees = totalObligationAmount;
  }

  if (gstAmount === 0 && baseApplicableFees > 0) {
    gstAmount = baseApplicableFees * 0.18;
  }

  const finalTotalPayable = totalObligationAmount;
  const pendingAmount = Math.max(finalTotalPayable - totalPaidTillNow, 0);

  const feePlan = {
    programName: profile.course,
    type: "Academic Fees",
    academicYear: profile.year,
    openingBalance: 0,
    components: feeComponents,
    applicableFees: baseApplicableFees,
    gstAmount: gstAmount,
    scholarship: 0,
    totalPayable: finalTotalPayable,
    paidTillNow: totalPaidTillNow,
    pendingAmount: pendingAmount,
  };

  const formatCurrency = (val: number) => `₹${val.toLocaleString("en-IN")}`;
  const dynamicDueDate = structure?.dueDate
    ? new Date(structure.dueDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not Set";

  const stats = [
    {
      label: "Total Fee",
      value: formatCurrency(finalTotalPayable),
      bg: "bg-[#E2DAFF]",
      iconColor: "text-[#6C20CA]",
    },
    {
      label: "Paid Till Now",
      value: formatCurrency(totalPaidTillNow),
      bg: "bg-[#E6FBEA]",
      iconColor: "text-[#43C17A]",
    },
    {
      label: "Pending Amount",
      value: formatCurrency(pendingAmount),
      bg: "bg-[#FFEDDA]",
      iconColor: "text-[#FFBB70]",
    },
    {
      label: "Due Date",
      value: dynamicDueDate,
      bg: "bg-[#CEE6FF]",
      iconColor: "text-[#60AEFF]",
    },
  ];

  return { profile, stats, feePlan, feeSummary, transactions };
}
