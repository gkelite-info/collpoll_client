import { supabase } from "@/lib/supabaseClient";


export async function downloadAssignmentFile(assignmentId: number, fileName: string) {
  try {
    const filePath = `assignments/${assignmentId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from("student_submissions")
      .download(filePath);

    if (error) {
      console.error("DOWNLOAD ERROR:", error);
      return;
    }

    // Trigger browser download
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("ERROR:", err);
  }
}



export async function updateAssignmentFile(
  assignmentId: number,
  oldFileName: string,
  newFile: File
) {
  try {
    const filePath = `assignments/${assignmentId}/${oldFileName}`;

    const { data, error } = await supabase.storage
      .from("student_submissions")
      .upload(filePath, newFile, {
        upsert: true, // REPLACE the existing file
      });

    if (error) {
      console.error("UPDATE ERROR:", error);
      return;
    }

    console.log("File updated:", data);

    return true;
  } catch (err) {
    console.error("ERROR:", err);
    return false;
  }
}
