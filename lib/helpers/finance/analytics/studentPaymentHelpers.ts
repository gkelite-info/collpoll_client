import { supabase } from "@/lib/supabaseClient";

export async function fetchStudentFeeDetails(studentFeeObligationId: number) {
  try {
    const { data: obData, error: obError } = await supabase
      .from("student_fee_obligation")
      .select(
        `
        totalAmount,
        students!inner (
          users!inner ( fullName )
        ),
        student_fee_collection ( collectedAmount )
      `,
      )
      .eq("studentFeeObligationId", studentFeeObligationId)
      .single();

    if (obError) throw obError;

    const studentData = Array.isArray(obData.students)
      ? obData.students[0]
      : obData.students;
    const userData = Array.isArray(studentData?.users)
      ? studentData?.users[0]
      : studentData?.users;

    const fullName = userData?.fullName || "Unknown Student";

    const alreadyPaid =
      obData.student_fee_collection?.reduce(
        (sum: number, item: any) => sum + (Number(item.collectedAmount) || 0),
        0,
      ) || 0;

    const totalAmount = Number(obData.totalAmount) || 0;
    const remainingBalance = Math.max(0, totalAmount - alreadyPaid);

    return {
      success: true,
      data: {
        fullName,
        totalAmount,
        alreadyPaid,
        remainingBalance,
      },
    };
  } catch (error: any) {
    console.error("fetchStudentFeeDetails error:", error);
    return { success: false, error };
  }
}

export async function fetchRecentOfflinePayments(
  studentFeeObligationId: number,
  page: number = 1,
  limit: number = 5,
) {
  try {
    if (!studentFeeObligationId || isNaN(studentFeeObligationId)) {
      return { success: true, data: [], totalCount: 0 };
    }

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

    if (error) {
      console.error("Supabase Query Error:", error);
      throw error;
    }

    return { success: true, data: data || [], totalCount: count || 0 };
  } catch (error: any) {
    const errorMsg =
      JSON.stringify(error) !== "{}"
        ? JSON.stringify(error)
        : error.message || "Unknown error";
    console.error("fetchRecentOfflinePayments error:", errorMsg);
    return { success: false, error };
  }
}

export async function fetchActiveObligationByStudent(studentId: number) {
  try {
    const { data, error } = await supabase
      .from("student_fee_obligation")
      .select("studentFeeObligationId, collegeAcademicYearId")
      .eq("studentId", studentId)
      .eq("isActive", true)
      .order("createdAt", { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    const { data: semData } = await supabase
      .from("college_semester")
      .select("collegeSemesterId")
      .eq("collegeAcademicYearId", data.collegeAcademicYearId)
      .order("collegeSemester", { ascending: true })
      .limit(1)
      .single();

    return {
      success: true,
      obligationId: data.studentFeeObligationId,
      semesterId: semData?.collegeSemesterId,
    };
  } catch (error: any) {
    console.error("fetchActiveObligationByStudent error:", error);
    return { success: false, error };
  }
}
