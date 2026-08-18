import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getClassResultDetails } from "@/lib/helpers/faculty/results/getClassResultDetails";
import { getFacultyResultsOverview } from "@/lib/helpers/faculty/results/getFacultyResultsOverview";

export async function GET(req: Request) {
  try {
    const data = await getClassResultDetails(
      2, // collegeId
      3, // collegeEducationId
      null, // collegeBranchId
      2, // sectionId
      1, // academicYearId
      "6th Class", // yearName
      "Biology", // subjectName
      null, // targetSubjectId
      1, // semesterId
      1,
      20
    );
    
    // Also test getFacultyResultsOverview just in case
    const overview = await getFacultyResultsOverview({
        collegeId: 2,
        collegeEducationId: 3,
        collegeBranchId: null,
        facultyId: 1, // I don't know the facultyId, but it shouldn't matter if it's not strictly checked or if I can just use a dummy
        isSchool: true,
        subjectName: "Biology",
        sectionName: "A",
        page: 1,
        pageSize: 20
    });

    return NextResponse.json({ success: true, data, overview });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, stack: err.stack });
  }
}
