import { supabase } from "@/lib/supabaseClient";

type FinanceCollectionFilters = {
  collegeId: number;
  collegeEducationId: number;
  collegeBranchId?: number;
  selectedYear?: string;
};

export async function getFinanceYearSemesterCollectionSummary(
  filters: FinanceCollectionFilters
) {
  const {
    collegeId,
    collegeEducationId,
    collegeBranchId,
    selectedYear,
  } = filters;

  console.log("🔎 Filters:", filters);

  /* 1️⃣ Get Active Students */

  let studentQuery = supabase
    .from("students")
    .select("studentId")
    .eq("collegeId", collegeId)
    .eq("collegeEducationId", collegeEducationId)
    .eq("status", "Active")
    .eq("isActive", true)
    .is("deletedAt", null);

  if (collegeBranchId) {
    studentQuery = studentQuery.eq("collegeBranchId", collegeBranchId);
  }

  const { data: students } = await studentQuery;

  if (!students?.length) return emptyYearResponse();

  const studentIds = students.map((s) => s.studentId);

  /* 2️⃣ Get Obligations */

  const { data: obligations } = await supabase
    .from("student_fee_obligation")
    .select("studentFeeObligationId")
    .in("studentId", studentIds)
    .eq("collegeEducationId", collegeEducationId)
    .eq("isActive", true)
    .is("deletedAt", null);

  if (!obligations?.length) return emptyYearResponse();

  const obligationIds = obligations.map(
    (o) => o.studentFeeObligationId
  );

  /* 3️⃣ Get SUCCESS Transactions */

  const { data: transactions } = await supabase
    .from("student_payment_transaction")
    .select("studentPaymentTransactionId")
    .in("studentFeeObligationId", obligationIds)
    .eq("paymentStatus", "success");

  if (!transactions?.length) return emptyYearResponse();

  const transactionIds = transactions.map(
    (t) => t.studentPaymentTransactionId
  );
  /* 4️⃣ Get Semester-wise Collection (Correct Source) */

  const { data: collections } = await supabase
    .from("student_fee_collection")
    .select(`
    collectedAmount,
    collegeSemesterId,
    studentPaymentTransactionId,
    createdAt
  `)
    .in("studentPaymentTransactionId", transactionIds);

  if (!collections?.length) return emptyYearResponse();

  /* 5️⃣ Get All Semesters (for mapping) */

  const { data: semesters } = await supabase
    .from("college_semester")
    .select("collegeSemesterId, collegeSemester");

  const semesterMap = new Map(
    semesters?.map((s) => [
      s.collegeSemesterId,
      s.collegeSemester,
    ]) || []
  );

  /* 6️⃣ Filter by Payment Year */

  let filteredCollections = collections;

  if (selectedYear && /^\d{4}$/.test(selectedYear)) {
    filteredCollections = collections.filter((c: any) => {
      const year = new Date(c.createdAt)
        .getFullYear()
        .toString();
      return year === selectedYear;
    });
  }

  /* 7️⃣ Group by Study Year */

  let academicYearTotal = 0;

  const yearMap = new Map<
    number,
    { sem1: number; sem2: number; total: number }
  >();

  filteredCollections.forEach((c: any) => {
    const amount = Number(c.collectedAmount) || 0;
    academicYearTotal += amount;

    const semesterId = c.collegeSemesterId;
    if (!semesterId) return;

    const semesterNumber = semesterMap.get(semesterId);
    if (!semesterNumber) return;

    const studyYear = Math.ceil(semesterNumber / 2);

    if (!yearMap.has(studyYear)) {
      yearMap.set(studyYear, {
        sem1: 0,
        sem2: 0,
        total: 0,
      });
    }

    const entry = yearMap.get(studyYear)!;

    if (semesterNumber % 2 === 1) {
      entry.sem1 += amount;
    } else {
      entry.sem2 += amount;
    }

    entry.total += amount;
  });

  const yearWiseData = [1, 2, 3, 4].map((year) => {
    const data = yearMap.get(year) || {
      sem1: 0,
      sem2: 0,
      total: 0,
    };

    return {
      year:
        year === 1
          ? "1st Year"
          : year === 2
            ? "2nd Year"
            : year === 3
              ? "3rd Year"
              : "4th Year",
      sem1: data.sem1,
      sem2: data.sem2,
      total: data.total,
    };
  });

  console.log("✅ Final Result:", yearWiseData);

  return {
    academicYearTotal,
    yearWiseData,
  };
}

function emptyYearResponse() {
  return {
    academicYearTotal: 0,
    yearWiseData: [1, 2, 3, 4].map((year) => ({
      year:
        year === 1
          ? "1st Year"
          : year === 2
            ? "2nd Year"
            : year === 3
              ? "3rd Year"
              : "4th Year",
      sem1: 0,
      sem2: 0,
      total: 0,
    })),
  };
}