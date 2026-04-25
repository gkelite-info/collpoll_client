import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

import { createClient as createAuthClient } from "@/app/utils/supabase/server";

const TOPIC_RESOURCES_BUCKET = "topic-resources";

const supabaseAdmin = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

function getStoragePathFromUrl(resourceUrl: string) {
  const marker = `/storage/v1/object/public/${TOPIC_RESOURCES_BUCKET}/`;
  const index = resourceUrl.indexOf(marker);

  if (index === -1) {
    throw new Error("Invalid topic resource URL");
  }

  return decodeURIComponent(resourceUrl.slice(index + marker.length));
}

async function getAuthorizedStudent() {
  const authClient = await createAuthClient();
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const { data: appUser, error: userError } = await supabaseAdmin
    .from("users")
    .select("userId, role")
    .eq("auth_id", user.id)
    .maybeSingle();

  if (userError || !appUser || appUser.role !== "Student") {
    throw new Error("Forbidden");
  }

  const { data: student, error: studentError } = await supabaseAdmin
    .from("students")
    .select("studentId, collegeId")
    .eq("userId", appUser.userId)
    .is("deletedAt", null)
    .maybeSingle();

  if (studentError || !student) {
    throw new Error("Student context not found");
  }

  return student;
}

async function getTopicInCollege(topicId: number, collegeId: number) {
  const { data: topic, error } = await supabaseAdmin
    .from("college_subject_unit_topics")
    .select("collegeSubjectUnitTopicId, collegeId")
    .eq("collegeSubjectUnitTopicId", topicId)
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .is("deletedAt", null)
    .maybeSingle();

  if (error || !topic) {
    throw new Error("Topic not found");
  }

  return topic;
}

export async function GET(req: Request) {
  try {
    const student = await getAuthorizedStudent();
    const { searchParams } = new URL(req.url);
    const topicId = Number(searchParams.get("topicId"));
    const resourceId = Number(searchParams.get("resourceId"));
    const shouldDownload = searchParams.get("download") === "1";

    if (resourceId && shouldDownload) {
      const { data: resource, error: resourceError } = await supabaseAdmin
        .from("college_subject_unit_topic_resources")
        .select(
          `
          collegeSubjectUnitTopicResourceId,
          resourceName,
          resourceUrl,
          collegeId,
          collegeSubjectUnitTopicId
        `,
        )
        .eq("collegeSubjectUnitTopicResourceId", resourceId)
        .eq("collegeId", student.collegeId)
        .eq("isActive", true)
        .maybeSingle();

      if (resourceError || !resource) {
        throw new Error("Resource not found");
      }

      await getTopicInCollege(resource.collegeSubjectUnitTopicId, student.collegeId);

      const storagePath = getStoragePathFromUrl(resource.resourceUrl);
      const { data: fileData, error: downloadError } = await supabaseAdmin.storage
        .from(TOPIC_RESOURCES_BUCKET)
        .download(storagePath);

      if (downloadError || !fileData) {
        throw new Error(downloadError?.message || "Failed to download resource");
      }

      return new NextResponse(fileData, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(resource.resourceName)}"`,
          "Cache-Control": "no-store",
        },
      });
    }

    if (!topicId) {
      return NextResponse.json({ error: "topicId is required" }, { status: 400 });
    }

    await getTopicInCollege(topicId, student.collegeId);

    const { data, error } = await supabaseAdmin
      .from("college_subject_unit_topic_resources")
      .select(
        `
        collegeSubjectUnitTopicResourceId,
        resourceType,
        resourceName,
        resourceUrl,
        collegeSubjectUnitTopicId,
        collegeId,
        createdBy,
        isAdmin,
        isActive,
        createdAt,
        updatedAt
      `,
      )
      .eq("collegeSubjectUnitTopicId", topicId)
      .eq("collegeId", student.collegeId)
      .eq("isActive", true)
      .order("createdAt", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ resources: data ?? [] });
  } catch (error: any) {
    const status =
      error?.message === "Unauthorized"
        ? 401
        : error?.message === "Forbidden"
          ? 403
          : error?.message === "topicId is required"
            ? 400
            : 500;

    return NextResponse.json(
      { error: error?.message || "Failed to load resources" },
      { status },
    );
  }
}
