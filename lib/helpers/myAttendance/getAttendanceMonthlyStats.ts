import { supabase } from "@/lib/supabaseClient";

interface Props {
  userId: number;
  month: number;
  year: number;
}

export async function getAttendanceMonthlyStats({
  userId,
  month,
  year,
}: Props) {

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  // const endDate = new Date(year, month, 0).toISOString().split("T")[0];
  const endDate =
    `${year}-${String(month).padStart(2, "0")}-${String(
      new Date(year, month, 0).getDate()
    ).padStart(2, "0")}`;
  const today = new Date().toISOString().split("T")[0];

  const [
    { data: todayRow, error: todayError },
    { count: workingDays, error: countError }
  ] =
    await Promise.all([
      supabase
        .from("attendance_daily")
        .select("status")
        .eq("userId", userId)
        .eq("attendanceDate", today)
        .maybeSingle(),
      supabase
        .from("attendance_daily")
        .select("*", { count: "exact", head: true })
        .eq("userId", userId)
        .gte("attendanceDate", startDate)
        .lte("attendanceDate", endDate)
        .in("status", ["PRESENT", "LATE"])
    ]);

  if (todayError) throw todayError;
  if (countError) throw countError;

  return {
    todayStatus:
      todayRow?.status ?? "Not Marked",

    totalWorkingDays:
      workingDays ?? 0,
  };

}



// import { supabase } from "@/lib/supabaseClient";

// interface Props {
//   userId: number;
//   month: number;
//   year: number;
// }

// export async function getAttendanceMonthlyStats({
//   userId,
//   month,
//   year,
// }: Props) {

//   const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
//   const endDate = new Date(year, month, 0).toISOString().split("T")[0];
//   const today = new Date().toISOString().split("T")[0];

//   /* -------------------- CHANGED: parallel queries -------------------- */

//   const [

//     /* today status */
//     { data: todayRow, error: todayError },

//     /* user working days */
//     { count: userWorkingDays, error: userWorkingError },

//     /* NEW: fetch ONLY attendanceDate column */
//     { data: collegeDates, error: collegeError } // CHANGED

//   ] = await Promise.all([

//     /* today status */
//     supabase
//       .from("attendance_daily")
//       .select("status")
//       .eq("userId", userId)
//       .eq("attendanceDate", today)
//       .maybeSingle(),

//     /* user working days */
//     supabase
//       .from("attendance_daily")
//       .select("*", { count: "exact", head: true })
//       .eq("userId", userId)
//       .gte("attendanceDate", startDate)
//       .lte("attendanceDate", endDate)
//       .in("status", ["PRESENT", "LATE"]),

//     /* -------------------- NEW --------------------
//        fetch only 1 column (very small payload)
//        indexed column → fast
//     */
//     supabase
//       .from("attendance_daily")
//       .select("attendanceDate")
//       .gte("attendanceDate", startDate)
//       .lte("attendanceDate", endDate)

//   ]);

//   if (todayError) throw todayError;
//   if (userWorkingError) throw userWorkingError;
//   if (collegeError) throw collegeError;

//   /* -------------------- NEW --------------------
//      count DISTINCT dates in JS
//      payload small because only 1 column fetched
//   */

//   const collegeWorkingDays =
//     new Set(
//       collegeDates?.map(d => d.attendanceDate)
//     ).size;


//   return {

//     todayStatus:
//       todayRow?.status ?? "Not Marked",

//     totalWorkingDays:
//       userWorkingDays ?? 0,

//     collegeWorkingDays,

//     attendancePercentage:
//       collegeWorkingDays === 0
//         ? 0
//         : Math.round(
//             ((userWorkingDays ?? 0) / collegeWorkingDays) * 100
//           )
//   };
// }