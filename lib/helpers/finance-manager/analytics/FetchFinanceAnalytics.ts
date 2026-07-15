import { supabase } from "@/lib/supabaseClient";

type FilterOption = {
  id: number;
  label: string;
  branchId?: number;
  academicYearId?: number;
};

const formatCleanShortCurrency = (value: number) => {
  if (value >= 10000000) return `\u20B9 ${(value / 10000000).toFixed(1)} Cr`;
  if (value >= 100000) return `\u20B9 ${(value / 100000).toFixed(1)} L`;
  if (value >= 1000) return `\u20B9 ${(value / 1000).toFixed(1)} K`;
  return `\u20B9 ${value.toLocaleString("en-IN")}`;
};

const formatCleanCurrency = (value: number) =>
  `\u20B9 ${Math.round(value).toLocaleString("en-IN")}`;

const getFirst = <T,>(value: T | T[] | null | undefined): T | null => {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
};

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

// export async function getYearWiseDetails(
//   collegeId: number,
//   educationId: number,
//   branchCode: string,
//   transactionYear: string,
// ) {
//   const { data: branchData, error: branchError } = await supabase
//     .from("college_branch")
//     .select("collegeBranchId")
//     .eq("collegeId", collegeId)
//     .eq("collegeEducationId", educationId)
//     .eq("collegeBranchCode", branchCode)
//     .maybeSingle();

//   if (branchError) {
//     console.error("Error fetching branch:", branchError);
//     return null;
//   }

//   if (!branchData) {
//     console.warn(`No branch found for code: ${branchCode}`);
//     return { leftChart: [], rightChart: [], tableData: [] };
//   }

//   // 1. Fetch Obligations + newly added student_academic_history for the accurate semester
//   const { data: obligations, error: obError } = await supabase
//     .from("student_fee_obligation")
//     .select(
//       `
//       studentFeeObligationId,
//       totalAmount,
//       college_academic_year!inner ( collegeAcademicYear ),
//       students!inner (
//         studentId,
//         users ( fullName, email ),
//         student_academic_history (
//           isCurrent,
//           college_semester (
//             collegeSemester
//           )
//         )
//       ),
//       student_fee_collection (
//         collectedAmount,
//         createdAt,
//         college_semester!inner ( collegeSemester )
//       )
//     `,
//     )
//     .eq("collegeBranchId", branchData.collegeBranchId);

//   if (obError) {
//     console.error("Error fetching year-wise data:", obError);
//     return null;
//   }

//   const chartMap = {
//     "4th Year": {
//       year: "4th yr",
//       oddSem: 7,
//       evenSem: 8,
//       oddLabel: "4-1",
//       evenLabel: "4-2",
//     },
//     "3rd Year": {
//       year: "3rd yr",
//       oddSem: 5,
//       evenSem: 6,
//       oddLabel: "3-1",
//       evenLabel: "3-2",
//     },
//     "2nd Year": {
//       year: "2nd yr",
//       oddSem: 3,
//       evenSem: 4,
//       oddLabel: "2-1",
//       evenLabel: "2-2",
//     },
//     "1st Year": {
//       year: "1st yr",
//       oddSem: 1,
//       evenSem: 2,
//       oddLabel: "1-1",
//       evenLabel: "1-2",
//     },
//   };

//   const leftChartData: Record<string, any> = {};
//   const rightChartData: Record<string, any> = {};
//   const tableData: any[] = [];

//   Object.values(chartMap).forEach((map) => {
//     leftChartData[map.year] = {
//       year: map.year,
//       collected: 0,
//       totalExpected: 0,
//       label: map.oddLabel,
//     };
//     rightChartData[map.year] = {
//       year: map.year,
//       collected: 0,
//       totalExpected: 0,
//       label: map.evenLabel,
//     };
//   });

//   const availableYearsSet = new Set<string>();

//   obligations?.forEach((ob: any) => {
//     const acYear = ob.college_academic_year?.collegeAcademicYear || "1st Year";
//     const mappedYear = chartMap[acYear as keyof typeof chartMap];
//     if (!mappedYear) return;

//     const yearlyTotal = Number(ob.totalAmount) || 0;
//     const semExpected = yearlyTotal / 2;

//     leftChartData[mappedYear.year].totalExpected += semExpected;
//     rightChartData[mappedYear.year].totalExpected += semExpected;

//     // 🟢 Separate tracking: One for the selected year, one for overall pending calculation
//     let studentPaidThisYear = 0;
//     let studentPaidAllTime = 0;

//     ob.student_fee_collection?.forEach((coll: any) => {
//       const collYear = new Date(coll.createdAt).getFullYear().toString();

//       // 🟢 ADDED: Capture every unique transaction year found in the DB
//       availableYearsSet.add(collYear);

//       const amount = Number(coll.collectedAmount) || 0;
//       const semNum = coll.college_semester?.collegeSemester;

//       // Track all time to calculate true pending amount
//       studentPaidAllTime += amount;

//       // Strictly filter chart and table paid amounts by the selected year
//       if (collYear === transactionYear) {
//         studentPaidThisYear += amount;

//         // Left Chart = 1st Sem of the year (Odd numbers: 1, 3, 5, 7)
//         if (semNum % 2 !== 0) {
//           leftChartData[mappedYear.year].collected += amount;
//         }
//         // Right Chart = 2nd Sem of the year (Even numbers: 2, 4, 6, 8)
//         else {
//           rightChartData[mappedYear.year].collected += amount;
//         }
//       }
//     });

//     // Populate Table Data
//     const studentInfo = ob.students?.users;
//     const studentName = studentInfo?.fullName || "Unknown Student";
//     const rollNo = ob.students?.studentId?.toString() || "N/A";

//     const activeHistory = ob.students?.student_academic_history?.find(
//       (history: any) => history.isCurrent === true,
//     );
//     const currentSemNum = activeHistory?.college_semester?.collegeSemester;
//     const semesterLabel = currentSemNum ? `Sem ${currentSemNum}` : "N/A";

//     tableData.push({
//       studentName: studentName,
//       rollNo: rollNo,
//       department: branchCode,
//       year: acYear,
//       semester: semesterLabel,

//       // 🟢 Table Paid Amount now strictly reflects the selected dropdown year
//       paidAmount: studentPaidThisYear,

//       // Pending Amount is what they still owe overall
//       pendingAmount: Math.max(yearlyTotal - studentPaidAllTime, 0),
//     });
//   });

//   // Format Chart Arrays
//   const leftChart = Object.values(leftChartData)
//     .map((d) => ({ ...d, pending: Math.max(d.totalExpected - d.collected, 0) }))
//     .sort((a, b) => b.year.localeCompare(a.year));

//   const rightChart = Object.values(rightChartData)
//     .map((d) => ({ ...d, pending: Math.max(d.totalExpected - d.collected, 0) }))
//     .sort((a, b) => b.year.localeCompare(a.year));
//   const availableYears = Array.from(availableYearsSet).sort((a, b) =>
//     b.localeCompare(a),
//   );
//   if (availableYears.length === 0) {
//     availableYears.push(new Date().getFullYear().toString());
//   }

//   // 🟢 CHANGED: Return availableYears alongside the rest of your data
//   return { leftChart, rightChart, tableData, availableYears };
// }

export async function getYearWiseDetails(
  collegeId: number,
  educationId: number,
  branchCode: string,
  transactionYear: string,
  page: number = 1,
  limit: number = 10,
  searchQuery?: string,
  semesterFilter?: string,
) {
  // 1. Get Branch ID
  const { data: branchData, error: branchError } = await supabase
    .from("college_branch")
    .select("collegeBranchId")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", educationId)
    .eq("collegeBranchCode", branchCode)
    .maybeSingle();

  if (branchError || !branchData) return null;

  const { data: allObligations } = await supabase
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
          college_semester ( collegeSemester )
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
  const availableSemestersSet = new Set<string>();

  allObligations?.forEach((ob: any) => {
    const acYear = ob.college_academic_year?.collegeAcademicYear || "1st Year";
    const mappedYear = chartMap[acYear as keyof typeof chartMap];

    const activeHistory = ob.students?.student_academic_history?.find(
      (h: any) => h.isCurrent,
    );
    if (activeHistory?.college_semester?.collegeSemester) {
      availableSemestersSet.add(
        `Sem ${activeHistory.college_semester.collegeSemester}`,
      );
    }

    if (!mappedYear) return;

    const yearlyTotal = Number(ob.totalAmount) || 0;
    const semExpected = yearlyTotal / 2;

    leftChartData[mappedYear.year].totalExpected += semExpected;
    rightChartData[mappedYear.year].totalExpected += semExpected;

    ob.student_fee_collection?.forEach((coll: any) => {
      const collYear = new Date(coll.createdAt).getFullYear().toString();
      availableYearsSet.add(collYear);

      const amount = Number(coll.collectedAmount) || 0;
      const semNum = coll.college_semester?.collegeSemester;

      if (collYear === transactionYear) {
        if (semNum % 2 !== 0)
          leftChartData[mappedYear.year].collected += amount;
        else rightChartData[mappedYear.year].collected += amount;
      }
    });
  });

  const leftChart = Object.values(leftChartData)
    .map((d) => ({ ...d, pending: Math.max(d.totalExpected - d.collected, 0) }))
    .sort((a, b) => b.year.localeCompare(a.year));

  const rightChart = Object.values(rightChartData)
    .map((d) => ({ ...d, pending: Math.max(d.totalExpected - d.collected, 0) }))
    .sort((a, b) => b.year.localeCompare(a.year));

  const availableYears = Array.from(availableYearsSet).sort((a, b) =>
    b.localeCompare(a),
  );
  if (availableYears.length === 0)
    availableYears.push(new Date().getFullYear().toString());

  const availableSemesters = Array.from(availableSemestersSet).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, "")) || 0;
    const numB = parseInt(b.replace(/\D/g, "")) || 0;
    return numA - numB;
  });

  // 3. 🟢 DB-LEVEL SEARCH & FILTER PREPARATION FOR TABLE
  let validStudentIds: number[] | null = null;

  if (searchQuery) {
    const [{ data: usersMatch }, { data: pinsMatch }] = await Promise.all([
      supabase
        .from("users")
        .select("userId")
        .ilike("fullName", `%${searchQuery}%`),
      supabase
        .from("student_pins")
        .select("studentId")
        .eq("isActive", true)
        .is("deletedAt", null)
        .ilike("pinNumber", `%${searchQuery}%`),
    ]);
    const matchedUserIds = usersMatch?.map((u) => u.userId) || [];
    const matchedPinStudentIds = pinsMatch?.map((p) => p.studentId) || [];

    let stuQuery = supabase
      .from("students")
      .select("studentId")
      .eq("collegeBranchId", branchData.collegeBranchId);

    if (matchedUserIds.length || matchedPinStudentIds.length) {
      const uIds = matchedUserIds.length ? matchedUserIds.join(",") : "0";
      const pinIds = matchedPinStudentIds.length
        ? matchedPinStudentIds.join(",")
        : "0";
      stuQuery = stuQuery.or(`userId.in.(${uIds}),studentId.in.(${pinIds})`);
    } else {
      stuQuery = stuQuery.in("studentId", [0]);
    }

    const { data: stuMatch } = await stuQuery;
    validStudentIds = stuMatch?.map((s) => s.studentId) || [];
  }

  if (semesterFilter && semesterFilter !== "All Semesters") {
    const semNum = semesterFilter.replace(/\D/g, ""); // Extract number
    const { data: semMatch } = await supabase
      .from("student_academic_history")
      .select("studentId, college_semester!inner(collegeSemester)")
      .eq("isCurrent", true)
      .eq("college_semester.collegeSemester", semNum);

    const semStudentIds = semMatch?.map((s) => s.studentId) || [];

    if (validStudentIds === null) {
      validStudentIds = semStudentIds;
    } else {
      validStudentIds = validStudentIds.filter((id) =>
        semStudentIds.includes(id),
      );
    }
  }

  // 4. 🟢 PAGINATED TABLE FETCH
  let tableQuery = supabase
    .from("student_fee_obligation")
    .select(
      `
      studentFeeObligationId,
      totalAmount,
      college_academic_year!inner ( collegeAcademicYear ),
      students!inner (
        studentId,
        student_pins ( pinNumber ),
        users ( fullName, email ),
        student_academic_history (
          isCurrent,
          college_semester ( collegeSemester )
        )
      ),
      student_fee_collection (
        collectedAmount,
        createdAt,
        college_semester ( collegeSemester )
      )
    `,
      { count: "exact" },
    )
    .eq("collegeBranchId", branchData.collegeBranchId);

  if (validStudentIds !== null) {
    if (validStudentIds.length > 0) {
      tableQuery = tableQuery.in("studentId", validStudentIds);
    } else {
      tableQuery = tableQuery.in("studentId", [0]); // Force empty
    }
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data: pagedObligations, count } = await tableQuery.range(from, to);

  // 5. 🟢 BUILD PAGINATED TABLE DATA
  const tableData: any[] = [];

  pagedObligations?.forEach((ob: any) => {
    let studentPaidThisYear = 0;
    let studentPaidAllTime = 0;

    ob.student_fee_collection?.forEach((coll: any) => {
      const collYear = new Date(coll.createdAt).getFullYear().toString();
      const amount = Number(coll.collectedAmount) || 0;

      studentPaidAllTime += amount;
      if (collYear === transactionYear) {
        studentPaidThisYear += amount;
      }
    });

    const studentInfo = ob.students?.users;
    const studentName = studentInfo?.fullName || "Unknown Student";
    const pinData = Array.isArray(ob.students?.student_pins)
      ? ob.students?.student_pins[0]
      : ob.students?.student_pins;
    const rollNo = pinData?.pinNumber || "N/A";
    const acYear = ob.college_academic_year?.collegeAcademicYear || "N/A";

    const activeHistory = ob.students?.student_academic_history?.find(
      (h: any) => h.isCurrent === true,
    );
    const currentSemNum = activeHistory?.college_semester?.collegeSemester;
    const semesterLabel = currentSemNum ? `Sem ${currentSemNum}` : "N/A";
    const yearlyTotal = Number(ob.totalAmount) || 0;

    tableData.push({
      studentId: ob.students?.studentId,
      studentName: studentName,
      rollNo: rollNo,
      department: branchCode,
      year: acYear,
      semester: semesterLabel,
      paidAmount: studentPaidThisYear,
      pendingAmount: Math.max(yearlyTotal - studentPaidAllTime, 0),
    });
  });

  return {
    leftChart,
    rightChart,
    tableData,
    availableYears,
    availableSemesters,
    totalCount: count ?? 0,
  };
}

export async function fetchRecentOfflinePayments(
  studentFeeObligationId: number,
  page: number = 1,
  limit: number = 5,
) {
  try {
    // 1. Prevents Supabase crash if ID is missing on initial render
    if (!studentFeeObligationId) {
      return { success: true, data: [], totalCount: 0 };
    }

    // 2. Safe parsing prevents NaN crashes in .range()
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.max(1, Number(limit) || 5);
    const from = (safePage - 1) * safeLimit;
    const to = from + safeLimit - 1;

    const { data, error, count } = await supabase
      .from("student_payment_transaction")
      .select(`paidAmount, paymentMode, paymentDate`, { count: "exact" })
      .eq("studentFeeObligationId", studentFeeObligationId)
      .eq("paymentType", "offline")
      .order("createdAt", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return { success: true, data: data || [], totalCount: count || 0 };
  } catch (error: any) {
    console.error("fetchRecentOfflinePayments error:", error);
    return { success: false, error };
  }
}

export async function getFinanceAnalyticsOverview(
  collegeId: number,
  collegeEducationId: number,
) {
  const [
    { data: education },
    { data: obligations, error: obligationError },
    { count: studentCount },
    { count: managerCount },
    { data: collegeRevenue, error: collegeRevenueError },
  ] = await Promise.all([
    supabase
      .from("college_education")
      .select("collegeEducationType")
      .eq("collegeEducationId", collegeEducationId)
      .maybeSingle(),
    supabase
      .from("student_fee_obligation")
      .select(
        `
        totalAmount,
        studentId,
        student_fee_collection ( collectedAmount )
      `,
      )
      .eq("collegeEducationId", collegeEducationId)
      .eq("isActive", true)
      .is("deletedAt", null),
    supabase
      .from("students")
      .select(
        `
        studentId,
        users!inner (
          role,
          collegeId,
          isActive,
          is_deleted,
          deletedAt
        ),
        student_academic_history!inner ( isCurrent )
      `,
        { count: "exact", head: true },
      )
      .eq("collegeId", collegeId)
      .eq("collegeEducationId", collegeEducationId)
      .eq("status", "Active")
      .eq("isActive", true)
      .is("deletedAt", null)
      .eq("users.role", "Student")
      .eq("users.collegeId", collegeId)
      .eq("users.isActive", true)
      .eq("users.is_deleted", false)
      .is("users.deletedAt", null)
      .eq("student_academic_history.isCurrent", true),
    supabase
      .from("finance_manager_education_types")
      .select(`
        FinanceManagerEducationId,
        finance_manager!inner(
          collegeId,
          type,
          isActive,
          is_deleted,
          deletedAt
        )
      `, { count: "exact", head: true })
      .eq("collegeEducationId", collegeEducationId)
      .eq("finance_manager.collegeId", collegeId)
      .eq("finance_manager.type", "executive")
      .eq("finance_manager.isActive", true)
      .eq("finance_manager.is_deleted", false)
      .is("finance_manager.deletedAt", null)
      .eq("isActive", true)
      .eq("is_deleted", false)
      .is("deletedAt", null),
    supabase
      .from("college_revenue_records")
      .select("amount")
      .eq("collegeId", collegeId)
      .eq("collegeEducationId", collegeEducationId)
      .eq("isActive", true)
      .eq("is_deleted", false)
      .is("deletedAt", null),
  ]);

  if (obligationError) throw obligationError;
  if (collegeRevenueError) throw collegeRevenueError;

  let totalFees = 0;
  let collected = 0;
  const obligatedStudents = new Set<number>();

  obligations?.forEach((ob: any) => {
    totalFees += Number(ob.totalAmount) || 0;
    if (ob.studentId) obligatedStudents.add(ob.studentId);
    ob.student_fee_collection?.forEach((collection: any) => {
      collected += Number(collection.collectedAmount) || 0;
    });
  });

  const pending = Math.max(totalFees - collected, 0);
  const otherRevenue = (collegeRevenue ?? []).reduce(
    (total, revenue) => total + Number(revenue.amount ?? 0),
    0,
  );
  const educationType = education?.collegeEducationType || "Education";

  return {
    summaryCards: [
      {
        label: "Total Revenue Collected",
        value: formatCleanShortCurrency(collected + otherRevenue),
      },
      { label: "Total Pending Fees", value: formatCleanShortCurrency(pending) },
      {
        label: "Total Students",
        value: (studentCount ?? obligatedStudents.size).toLocaleString("en-IN"),
      },
      {
        label: "Active Finance Managers",
        value: String(managerCount ?? 0).padStart(2, "0"),
      },
    ],
    programCards: [
      {
        title: educationType,
        educationId: collegeEducationId,
        amount: formatCleanShortCurrency(totalFees),
        collected: formatCleanShortCurrency(collected),
        pending: formatCleanShortCurrency(pending),
      },
    ],
    chartData: [{ program: educationType, collected, pending }],
  };
}

export async function getBranchWiseCollectionDynamic(
  collegeId: number,
  collegeEducationId: number,
  academicYearId?: number | null,
  semesterId?: number | null,
) {
  const [
    { data: branches, error: branchError },
    { data: academicYears, error: yearError },
    { data: semesters, error: semesterError },
  ] = await Promise.all([
    supabase
      .from("college_branch")
      .select("collegeBranchId, collegeBranchCode, collegeBranchType")
      .eq("collegeId", collegeId)
      .eq("collegeEducationId", collegeEducationId)
      .eq("isActive", true)
      .is("deletedAt", null),
    supabase
      .from("college_academic_year")
      .select("collegeAcademicYearId, collegeAcademicYear, collegeBranchId")
      .eq("collegeId", collegeId)
      .eq("collegeEducationId", collegeEducationId)
      .eq("isActive", true)
      .is("deletedAt", null),
    supabase
      .from("college_semester")
      .select("collegeSemesterId, collegeSemester, collegeAcademicYearId")
      .eq("collegeId", collegeId)
      .eq("collegeEducationId", collegeEducationId)
      .eq("isActive", true)
      .is("deletedAt", null),
  ]);

  if (branchError) throw branchError;
  if (yearError) throw yearError;
  if (semesterError) throw semesterError;

  const branchIds = (branches ?? []).map((branch) => branch.collegeBranchId);
  if (branchIds.length === 0) {
    return {
      chartData: [],
      gridData: [],
      tableData: [],
      academicYears: [] as FilterOption[],
      semesters: [] as FilterOption[],
    };
  }

  const selectedYearLabel = academicYearId
    ? academicYears?.find((year) => year.collegeAcademicYearId === academicYearId)
      ?.collegeAcademicYear
    : null;
  const selectedYearIds = new Set(
    (academicYears ?? [])
      .filter((year) =>
        selectedYearLabel ? year.collegeAcademicYear === selectedYearLabel : true,
      )
      .map((year) => year.collegeAcademicYearId),
  );
  const selectedSemesterNumber = semesterId
    ? semesters?.find((semester) => semester.collegeSemesterId === semesterId)
      ?.collegeSemester
    : null;
  const selectedSemesterIds = new Set(
    (semesters ?? [])
      .filter((semester) =>
        selectedSemesterNumber
          ? semester.collegeSemester === selectedSemesterNumber &&
          (selectedYearIds.size
            ? selectedYearIds.has(semester.collegeAcademicYearId)
            : true)
          : false,
      )
      .map((semester) => semester.collegeSemesterId),
  );

  let obligationQuery = supabase
    .from("student_fee_obligation")
    .select(
      `
      studentFeeObligationId,
      totalAmount,
      collegeBranchId,
      collegeAcademicYearId,
      student_fee_collection (
        collectedAmount,
        collegeSemesterId
      )
    `,
    )
    .eq("collegeEducationId", collegeEducationId)
    .in("collegeBranchId", branchIds)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (selectedYearLabel && selectedYearIds.size > 0) {
    obligationQuery = obligationQuery.in(
      "collegeAcademicYearId",
      Array.from(selectedYearIds),
    );
  }

  const { data: obligations, error: obligationError } = await obligationQuery;
  if (obligationError) throw obligationError;

  const branchMap = new Map<
    number,
    { branch: string; branchId: number; total: number; collected: number }
  >();

  (branches ?? []).forEach((branch) => {
    branchMap.set(branch.collegeBranchId, {
      branch: branch.collegeBranchCode || branch.collegeBranchType,
      branchId: branch.collegeBranchId,
      total: 0,
      collected: 0,
    });
  });

  const semesterCountByYear = new Map<number, number>();
  (semesters ?? []).forEach((semester) => {
    semesterCountByYear.set(
      semester.collegeAcademicYearId,
      (semesterCountByYear.get(semester.collegeAcademicYearId) ?? 0) + 1,
    );
  });

  obligations?.forEach((ob: any) => {
    const metric = branchMap.get(ob.collegeBranchId);
    if (!metric) return;

    const totalAmount = Number(ob.totalAmount) || 0;
    const semesterCount = semesterCountByYear.get(ob.collegeAcademicYearId) || 2;
    const expectedAmount = semesterId ? totalAmount / semesterCount : totalAmount;
    let collectedAmount = 0;

    ob.student_fee_collection?.forEach((collection: any) => {
      if (semesterId && !selectedSemesterIds.has(collection.collegeSemesterId)) {
        return;
      }
      collectedAmount += Number(collection.collectedAmount) || 0;
    });

    metric.total += expectedAmount;
    metric.collected += collectedAmount;
  });

  const rows = Array.from(branchMap.values()).map((metric) => ({
    ...metric,
    pending: Math.max(metric.total - metric.collected, 0),
  }));

  const sortedYears = Array.from(
    new Map(
      (academicYears ?? []).map((year) => [
        year.collegeAcademicYear,
        {
          id: year.collegeAcademicYearId,
          label: year.collegeAcademicYear,
          branchId: year.collegeBranchId,
        },
      ]),
    ).values(),
  )
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));

  const filteredSemesters = Array.from(
    new Map(
      (semesters ?? [])
        .filter((semester) =>
          selectedYearLabel && selectedYearIds.size > 0
            ? selectedYearIds.has(semester.collegeAcademicYearId)
            : true,
        )
        .map((semester) => [
          semester.collegeSemester,
          {
            id: semester.collegeSemesterId,
            label: `Semester ${semester.collegeSemester}`,
            academicYearId: semester.collegeAcademicYearId,
          },
        ]),
    ).values(),
  )
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));

  return {
    chartData: rows.map((row) => ({
      branch: row.branch,
      collected: row.collected,
      pending: row.pending,
    })),
    gridData: rows.map((row) => ({
      branch: row.branch,
      totalFeesShort: formatCleanShortCurrency(row.total),
      collectedShort: formatCleanShortCurrency(row.collected),
      pendingShort: formatCleanShortCurrency(row.pending),
    })),
    tableData: rows.map((row) => ({
      branch: row.branch,
      branchId: row.branchId,
      collected: formatCleanCurrency(row.collected),
      pending: formatCleanCurrency(row.pending),
      totalFees: formatCleanCurrency(row.total),
    })),
    academicYears: sortedYears,
    semesters: filteredSemesters,
  };
}

export async function getYearWiseDetailsDynamic(
  collegeId: number,
  collegeEducationId: number,
  branchCode: string,
  academicYearId?: number | null,
  semesterId?: number | null,
  page: number = 1,
  limit: number = 10,
  searchQuery?: string,
  options: { includeCharts?: boolean } = {},
) {
  const includeCharts = options.includeCharts ?? true;
  const { data: branchData, error: branchError } = await supabase
    .from("college_branch")
    .select("collegeBranchId, collegeBranchCode")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("collegeBranchCode", branchCode)
    .maybeSingle();

  if (branchError) throw branchError;
  if (!branchData) return null;

  const [{ data: academicYears }, { data: semesters }] = await Promise.all([
    supabase
      .from("college_academic_year")
      .select("collegeAcademicYearId, collegeAcademicYear")
      .eq("collegeId", collegeId)
      .eq("collegeEducationId", collegeEducationId)
      .eq("collegeBranchId", branchData.collegeBranchId)
      .eq("isActive", true)
      .is("deletedAt", null),
    supabase
      .from("college_semester")
      .select("collegeSemesterId, collegeSemester, collegeAcademicYearId")
      .eq("collegeId", collegeId)
      .eq("collegeEducationId", collegeEducationId)
      .eq("isActive", true)
      .is("deletedAt", null),
  ]);

  const availableYears = (academicYears ?? [])
    .map((year) => ({
      id: year.collegeAcademicYearId,
      label: year.collegeAcademicYear,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));

  const branchAcademicYearIds = new Set(
    (academicYears ?? []).map((year) => year.collegeAcademicYearId),
  );

  const availableSemesters = Array.from(
    new Map(
      (semesters ?? [])
        .filter((semester) =>
          academicYearId
            ? semester.collegeAcademicYearId === academicYearId
            : branchAcademicYearIds.has(semester.collegeAcademicYearId),
        )
        .map((semester) => [
          semester.collegeSemester,
          {
            id: semester.collegeSemesterId,
            label: `Semester ${semester.collegeSemester}`,
            academicYearId: semester.collegeAcademicYearId,
          },
        ]),
    ).values(),
  )
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));

  const selectedSemesterNumber = semesterId
    ? semesters?.find((semester) => semester.collegeSemesterId === semesterId)
      ?.collegeSemester
    : null;

  const selectedSemesterIds = new Set(
    (semesters ?? [])
      .filter((semester) =>
        selectedSemesterNumber
          ? semester.collegeSemester === selectedSemesterNumber &&
          (academicYearId
            ? semester.collegeAcademicYearId === academicYearId
            : branchAcademicYearIds.has(semester.collegeAcademicYearId))
          : false,
      )
      .map((semester) => semester.collegeSemesterId),
  );

  let validStudentIds: number[] | null = null;
  if (searchQuery) {
    const [{ data: usersMatch }, { data: pinsMatch }] = await Promise.all([
      supabase
        .from("users")
        .select("userId")
        .eq("collegeId", collegeId)
        .eq("role", "Student")
        .eq("isActive", true)
        .eq("is_deleted", false)
        .is("deletedAt", null)
        .ilike("fullName", `%${searchQuery}%`),
      supabase
        .from("student_pins")
        .select("studentId")
        .eq("isActive", true)
        .is("deletedAt", null)
        .ilike("pinNumber", `%${searchQuery}%`),
    ]);

    const userIds = usersMatch?.map((user) => user.userId) ?? [];
    const pinStudentIds = pinsMatch?.map((pin) => pin.studentId) ?? [];

    let studentQuery = supabase
      .from("students")
      .select("studentId")
      .eq("collegeId", collegeId)
      .eq("collegeEducationId", collegeEducationId)
      .eq("collegeBranchId", branchData.collegeBranchId);

    if (userIds.length || pinStudentIds.length) {
      studentQuery = studentQuery.or(
        `userId.in.(${userIds.length ? userIds.join(",") : "0"}),studentId.in.(${pinStudentIds.length ? pinStudentIds.join(",") : "0"})`,
      );
    } else {
      studentQuery = studentQuery.in("studentId", [0]);
    }

    const { data: matchedStudents } = await studentQuery;
    validStudentIds = matchedStudents?.map((student) => student.studentId) ?? [];
  }

  if (selectedSemesterNumber) {
    let semesterStudentQuery = supabase
      .from("student_academic_history")
      .select("studentId, college_semester!inner(collegeSemester)")
      .eq("isCurrent", true)
      .is("deletedAt", null)
      .eq("college_semester.collegeSemester", selectedSemesterNumber);

    if (academicYearId) {
      semesterStudentQuery = semesterStudentQuery.eq(
        "collegeAcademicYearId",
        academicYearId,
      );
    } else if (branchAcademicYearIds.size > 0) {
      semesterStudentQuery = semesterStudentQuery.in(
        "collegeAcademicYearId",
        Array.from(branchAcademicYearIds),
      );
    }

    const { data: semesterStudents } = await semesterStudentQuery;
    const semesterStudentIds =
      semesterStudents?.map((student) => student.studentId) ?? [];

    validStudentIds =
      validStudentIds === null
        ? semesterStudentIds
        : validStudentIds.filter((studentId) =>
          semesterStudentIds.includes(studentId),
        );
  }

  const obligationSelect = `
      studentFeeObligationId,
      studentId,
      totalAmount,
      collegeAcademicYearId,
      college_academic_year ( collegeAcademicYear ),
      students!inner (
        studentId,
        student_pins ( pinNumber ),
        users ( fullName, email ),
        student_academic_history (
          isCurrent,
          collegeSemesterId,
          college_semester ( collegeSemester )
        )
      ),
      student_fee_collection (
        collectedAmount,
        collegeSemesterId
      )
    `;

  let chartObligations: any[] = [];
  if (includeCharts) {
    let chartQuery = supabase
      .from("student_fee_obligation")
      .select(obligationSelect)
      .eq("collegeEducationId", collegeEducationId)
      .eq("collegeBranchId", branchData.collegeBranchId)
      .eq("isActive", true)
      .is("deletedAt", null);

    if (academicYearId) chartQuery = chartQuery.eq("collegeAcademicYearId", academicYearId);

    const { data, error: chartError } = await chartQuery;
    if (chartError) throw chartError;
    chartObligations = data ?? [];
  }

  const studentSelect = `
      studentId,
      collegeSessionId,
      users!inner (
        fullName,
        email,
        role,
        collegeId,
        is_deleted,
        isActive,
        deletedAt
      ),
      student_pins ( pinNumber ),
      student_academic_history!inner (
        isCurrent,
        collegeAcademicYearId,
        collegeSemesterId,
        college_academic_year ( collegeAcademicYear ),
        college_semester ( collegeSemester )
      )
    `;

  let tableQuery = supabase
    .from("students")
    .select(studentSelect, { count: "exact" })
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("collegeBranchId", branchData.collegeBranchId)
    .eq("isActive", true)
    .is("deletedAt", null)
    .eq("users.collegeId", collegeId)
    .eq("users.role", "Student")
    .eq("users.isActive", true)
    .eq("users.is_deleted", false)
    .is("users.deletedAt", null)
    .eq("student_academic_history.isCurrent", true);

  if (academicYearId) {
    tableQuery = tableQuery.eq(
      "student_academic_history.collegeAcademicYearId",
      academicYearId,
    );
  } else if (branchAcademicYearIds.size > 0) {
    tableQuery = tableQuery.in(
      "student_academic_history.collegeAcademicYearId",
      Array.from(branchAcademicYearIds),
    );
  }

  if (validStudentIds !== null) {
    tableQuery = tableQuery.in(
      "studentId",
      validStudentIds.length ? validStudentIds : [0],
    );
  }

  const from = (Math.max(1, page) - 1) * limit;
  const to = from + limit - 1;
  const { data: pagedStudents, count, error: studentError } =
    await tableQuery.range(from, to);
  if (studentError) throw studentError;

  const pagedStudentIds = pagedStudents?.map((student) => student.studentId) ?? [];

  let tableObligationsQuery = supabase
    .from("student_fee_obligation")
    .select(
      `
      studentFeeObligationId,
      studentId,
      totalAmount,
      collegeAcademicYearId,
      student_fee_collection (
        collectedAmount,
        collegeSemesterId
      )
    `,
    )
    .eq("collegeEducationId", collegeEducationId)
    .eq("collegeBranchId", branchData.collegeBranchId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (pagedStudentIds.length > 0) {
    tableObligationsQuery = tableObligationsQuery.in("studentId", pagedStudentIds);
  } else {
    tableObligationsQuery = tableObligationsQuery.in("studentId", [0]);
  }

  if (academicYearId) {
    tableObligationsQuery = tableObligationsQuery.eq(
      "collegeAcademicYearId",
      academicYearId,
    );
  } else if (branchAcademicYearIds.size > 0) {
    tableObligationsQuery = tableObligationsQuery.in(
      "collegeAcademicYearId",
      Array.from(branchAcademicYearIds),
    );
  }

  const { data: tableObligations, error: tableObligationError } =
    await tableObligationsQuery;
  if (tableObligationError) throw tableObligationError;

  const obligationByStudentYear = new Map<string, any>();
  tableObligations?.forEach((obligation: any) => {
    obligationByStudentYear.set(
      `${obligation.studentId}-${obligation.collegeAcademicYearId}`,
      obligation,
    );
  });

  const semesterCountByYear = new Map<number, number>();
  (semesters ?? []).forEach((semester) => {
    semesterCountByYear.set(
      semester.collegeAcademicYearId,
      (semesterCountByYear.get(semester.collegeAcademicYearId) ?? 0) + 1,
    );
  });

  const formatYearShortLabel = (year: string) =>
    year.replace(/\s*Year$/i, " yr");

  const getYearOrdinal = (year: string) => {
    const number = Number(year.match(/\d+/)?.[0] ?? 0);
    return Number.isFinite(number) && number > 0 ? number : 0;
  };

  const buildSemesterChartLabel = (year: string, semesterNumber: number) => {
    const yearNumber = getYearOrdinal(year);
    return yearNumber ? `${yearNumber}-${semesterNumber}` : `Sem ${semesterNumber}`;
  };

  const chartAcademicYears = Array.from(
    new Map(
      (academicYears ?? [])
        .filter((year) =>
          academicYearId ? year.collegeAcademicYearId === academicYearId : true,
        )
        .map((year) => [year.collegeAcademicYear, year]),
    ).values(),
  );

  const buildEmptyChartRows = (semesterNumber: number) =>
    chartAcademicYears
      .map((year) => ({
        year: formatYearShortLabel(year.collegeAcademicYear),
        sortOrder: getYearOrdinal(year.collegeAcademicYear),
        label: buildSemesterChartLabel(year.collegeAcademicYear, semesterNumber),
        collected: 0,
        pending: 0,
      }));

  const leftChartMap = new Map(
    buildEmptyChartRows(1).map((row) => [row.sortOrder || row.year, row]),
  );
  const rightChartMap = new Map(
    buildEmptyChartRows(2).map((row) => [row.sortOrder || row.year, row]),
  );

  const tableData: any[] = [];

  if (includeCharts) chartObligations.forEach((ob: any) => {
    const yearObj: any = getFirst(ob.college_academic_year);
    const academicYearLabel = yearObj?.collegeAcademicYear || "N/A";
    const yearOrder = getYearOrdinal(academicYearLabel);
    const studentObj: any = getFirst(ob.students);
    const activeHistory = studentObj?.student_academic_history?.find(
      (history: any) => history.isCurrent,
    );
    const currentSemesterObj: any = getFirst(activeHistory?.college_semester);
    const currentSemesterNumber = Number(currentSemesterObj?.collegeSemester);
    const semesterBuckets = new Map<number, number>();
    ob.student_fee_collection?.forEach((collection: any) => {
      const semesterNumber =
        semesters?.find(
          (semester) => semester.collegeSemesterId === collection.collegeSemesterId,
        )?.collegeSemester ?? 0;

      if (!semesterNumber) return;

      semesterBuckets.set(
        semesterNumber,
        (semesterBuckets.get(semesterNumber) ?? 0) +
        (Number(collection.collectedAmount) || 0),
      );
    });

    const paidSemesterNumbers = Array.from(semesterBuckets.keys()).filter(
      (semesterNumber) => [1, 2].includes(semesterNumber),
    );
    const pendingSemesterNumber = paidSemesterNumbers[0] ??
      ([1, 2].includes(currentSemesterNumber) ? currentSemesterNumber : 1);
    const targetMap = pendingSemesterNumber === 1 ? leftChartMap : rightChartMap;
    const chartRow = targetMap.get(yearOrder || formatYearShortLabel(academicYearLabel));
    if (!chartRow) return;

    const collected = paidSemesterNumbers.reduce(
      (sum, semesterNumber) => sum + (semesterBuckets.get(semesterNumber) ?? 0),
      0,
    );
    const totalAmount = Number(ob.totalAmount) || 0;
    chartRow.collected += collected;
    chartRow.pending += Math.max(totalAmount - collected, 0);
  });

  pagedStudents?.forEach((student: any) => {
    const activeHistory = student.student_academic_history?.find(
      (history: any) => history.isCurrent,
    );
    const yearObj: any = getFirst(activeHistory?.college_academic_year);
    const semesterObj: any = getFirst(activeHistory?.college_semester);
    const academicYearIdForStudent = activeHistory?.collegeAcademicYearId;
    const obligation = obligationByStudentYear.get(
      `${student.studentId}-${academicYearIdForStudent}`,
    );
    const academicYearLabel = yearObj?.collegeAcademicYear || "N/A";
    const semCount = semesterCountByYear.get(academicYearIdForStudent) || 2;
    const expected = semesterId
      ? (Number(obligation?.totalAmount) || 0) / semCount
      : Number(obligation?.totalAmount) || 0;

    let paid = 0;
    obligation?.student_fee_collection?.forEach((collection: any) => {
      if (semesterId && !selectedSemesterIds.has(collection.collegeSemesterId)) {
        return;
      }
      paid += Number(collection.collectedAmount) || 0;
    });

    const semesterLabel = semesterId
      ? availableSemesters.find((semester) => semester.id === semesterId)?.label ||
      "N/A"
      : semesterObj?.collegeSemester
        ? `Semester ${semesterObj.collegeSemester}`
        : "N/A";

    const userObj: any = getFirst(student.users);
    const pinObj: any = getFirst(student.student_pins);
    tableData.push({
      studentId: student.studentId,
      studentName: userObj?.fullName || "Unknown Student",
      rollNo: pinObj?.pinNumber || "N/A",
      branch: branchCode,
      year: academicYearLabel,
      semester: semesterLabel,
      paidAmount: paid,
      pendingAmount: Math.max(expected - paid, 0),
      feeAssigned: Boolean(obligation),
    });
  });

  const sortChartRows = (
    rows: Array<{
      year: string;
      sortOrder: number;
      label: string;
      collected: number;
      pending: number;
    }>,
  ) =>
    rows
      .sort((a, b) => b.sortOrder - a.sortOrder)
      .map((row) => ({
        year: row.year,
        label: row.label,
        collected: row.collected,
        pending: row.pending,
      }));

  return {
    leftChart: includeCharts ? sortChartRows(Array.from(leftChartMap.values())) : [],
    rightChart: includeCharts ? sortChartRows(Array.from(rightChartMap.values())) : [],
    tableData,
    availableYears,
    availableSemesters,
    totalCount: count ?? 0,
  };
}

export async function getStudentFinanceDetails(
  studentIdentifier: string,
  collegeId?: number | null,
) {
  const normalizedIdentifier = String(studentIdentifier || "").trim();
  let resolvedStudentId = Number(normalizedIdentifier);

  if (normalizedIdentifier) {
    let pinQuery = supabase
      .from("student_pins")
      .select("studentId")
      .eq("pinNumber", normalizedIdentifier)
      .eq("isActive", true)
      .is("deletedAt", null);

    if (collegeId) {
      pinQuery = pinQuery.eq("collegeId", collegeId);
    }

    const { data: pinData } = await pinQuery.limit(1);
    const pinRow = Array.isArray(pinData) ? pinData[0] : pinData;

    if (pinRow?.studentId) {
      resolvedStudentId = pinRow.studentId;
    }
  }

  if (!Number.isFinite(resolvedStudentId)) return null;

  const { data: studentData } = await supabase
    .from("students")
    .select(
      `
      studentId, collegeId, collegeEducationId, collegeBranchId, collegeSessionId,
      student_pins ( pinNumber ),
      users ( fullName, email, mobile, user_profile ( profileUrl ) ),
      college_education ( collegeEducationType ),
      college_branch ( collegeBranchType ),
      student_academic_history ( isCurrent, college_academic_year ( collegeAcademicYear ) )
    `,
    )
    .eq("studentId", resolvedStudentId)
    .maybeSingle();

  if (!studentData) return null;

  const userObj: any = Array.isArray(studentData.users)
    ? studentData.users[0]
    : studentData.users;

  const userProfileObj: any = Array.isArray(userObj?.user_profile)
    ? userObj?.user_profile[0]
    : userObj?.user_profile;

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
  const pinObj: any = Array.isArray((studentData as any).student_pins)
    ? (studentData as any).student_pins[0]
    : (studentData as any).student_pins;

  const profile = {
    studentId: studentData.studentId,
    name: userObj?.fullName || "Unknown",
    course: `${educationObj?.collegeEducationType || "Course"} - ${branchObj?.collegeBranchType || "Branch"}`,
    year: acYearObj?.collegeAcademicYear || "N/A",
    rollNo: pinObj?.pinNumber || "N/A",
    email: userObj?.email || "N/A",
    mobile: userObj?.mobile || "N/A",
    imageUrl: userProfileObj?.profileUrl || null,
  };

  const feeComponents: { name: string; amount: number }[] = [];
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
    .eq("studentId", resolvedStudentId);

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
