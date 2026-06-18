import { supabase } from "../supabaseClient";
import { getTestingSession } from "./testingAuth";
 
export const getStudentId = async (passedUserId?: number) => {
  let finalUserId = passedUserId;

  if (!finalUserId) {
    /*
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return null;
   
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("userId, role")
      .eq("auth_id", auth.user.id)
      .single();
   
    if (userError || !user) {
      console.error("User not found", userError);
      return null;
    }
    finalUserId = user.userId;
    */
    const testEmail = await getTestingSession();
    if (!testEmail) return null;

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("userId, role")
      .eq("email", testEmail)
      .single();

    if (userError || !user) {
      console.error("User not found", userError);
      return null;
    }
    finalUserId = user.userId;
  }
 
  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("studentId")
    .eq("userId", finalUserId)
    .single();

  if (studentError || !student) {
    console.error("Student not found", studentError);
    return null;
  }

  return student.studentId;
};