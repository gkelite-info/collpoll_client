import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

import { createClient as createAuthClient } from "@/app/utils/supabase/server";

const TOPIC_RESOURCES_BUCKET = "topic-resources";

const supabaseAdmin = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

type AuthorizedActor =
  | {
    role: "Faculty";
    userId: number;
    collegeId: number;
    facultyId: number;
    adminId: null;
  }
  | {
    role: "Admin";
    userId: number;
    collegeId: number;
    facultyId: null;
    adminId: number;
  };

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function buildStoragePath(params: {
  collegeId: number;
  collegeSubjectId: number;
  unitNumber: number;
  topicId: number;
  fileName: string;
}) {
  const timestamp = Date.now();
  const safeName = sanitizeFileName(params.fileName);
  return `college-${params.collegeId}/subject-${params.collegeSubjectId}/unit-${params.unitNumber}/topic-${params.topicId}/${timestamp}-${safeName}`;
}

function getStoragePathFromUrl(resourceUrl: string) {
  const marker = `/storage/v1/object/public/${TOPIC_RESOURCES_BUCKET}/`;
  const index = resourceUrl.indexOf(marker);

  if (index === -1) {
    throw new Error("Invalid topic resource URL.");
  }

  return decodeURIComponent(resourceUrl.slice(index + marker.length));
}

async function getAuthorizedActor(): Promise<AuthorizedActor> {
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
    .select("userId, role, collegeId")
    .eq("auth_id", user.id)
    .maybeSingle();

  if (userError || !appUser) {
    throw new Error("Unable to resolve user");
  }

  if (appUser.role === "Faculty") {
    const { data: faculty, error: facultyError } = await supabaseAdmin
      .from("faculty")
      .select("facultyId, collegeId")
      .eq("userId", appUser.userId)
      .is("deletedAt", null)
      .maybeSingle();

    if (facultyError || !faculty) {
      throw new Error("Faculty context not found");
    }

    return {
      role: "Faculty",
      userId: appUser.userId,
      collegeId: faculty.collegeId,
      facultyId: faculty.facultyId,
      adminId: null,
    };
  }

  if (appUser.role === "Admin") {
    const { data: admin, error: adminError } = await supabaseAdmin
      .from("admins")
      .select("adminId, collegeId")
      .eq("userId", appUser.userId)
      .is("deletedAt", null)
      .maybeSingle();

    if (adminError || !admin) {
      throw new Error("Admin context not found");
    }

    return {
      role: "Admin",
      userId: appUser.userId,
      collegeId: admin.collegeId,
      facultyId: null,
      adminId: admin.adminId,
    };
  }

  throw new Error("Forbidden");
}

async function getTopicInCollege(topicId: number, collegeId: number) {
  const { data: topic, error } = await supabaseAdmin
    .from("college_subject_unit_topics")
    .select(
      `
      collegeSubjectUnitTopicId,
      collegeId,
      collegeSubjectId,
      collegeSubjectUnitId,
      college_subject_units!collegeSubjectUnitId (
        unitNumber
      )
    `,
    )
    .eq("collegeSubjectUnitTopicId", topicId)
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .maybeSingle();

  if (error || !topic) {
    throw new Error("Topic not found");
  }

  const unitJoin = Array.isArray(topic.college_subject_units)
    ? topic.college_subject_units[0]
    : topic.college_subject_units;

  if (!unitJoin?.unitNumber) {
    throw new Error("Unit metadata not found");
  }

  return {
    ...topic,
    college_subject_units: unitJoin,
  };
}

export async function GET(req: Request) {
  try {
    const actor = await getAuthorizedActor();
    const { searchParams } = new URL(req.url);
    const topicId = Number(searchParams.get("topicId"));

    if (!topicId) {
      return NextResponse.json(
        { error: "topicId is required" },
        { status: 400 },
      );
    }

    await getTopicInCollege(topicId, actor.collegeId);

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
          : 500;

    return NextResponse.json(
      { error: error?.message || "Failed to load resources" },
      { status },
    );
  }
}

export async function POST(req: Request) {
  try {
    const actor = await getAuthorizedActor();
    const formData = await req.formData();
    const file = formData.get("file");
    const topicId = Number(formData.get("topicId"));
    const replaceExisting = formData.get("replaceExisting") === "true";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (!topicId) {
      return NextResponse.json({ error: "topicId is required" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 },
      );
    }

    const topic = await getTopicInCollege(topicId, actor.collegeId);

    const { data: existingResources, error: existingResourcesError } =
      replaceExisting
        ? await supabaseAdmin
          .from("college_subject_unit_topic_resources")
          .select(
            `
              collegeSubjectUnitTopicResourceId,
              resourceUrl
            `,
          )
          .eq("collegeSubjectUnitTopicId", topicId)
          .eq("resourceName", file.name)
          .eq("resourceType", "PDF")
          .eq("isActive", true)
        : { data: [], error: null };

    if (existingResourcesError) {
      throw new Error(`Existing resource lookup failed: ${existingResourcesError.message}`);
    }

    const storagePath = buildStoragePath({
      collegeId: actor.collegeId,
      collegeSubjectId: topic.collegeSubjectId,
      unitNumber: topic.college_subject_units.unitNumber,
      topicId,
      fileName: file.name,
    });

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabaseAdmin.storage
      .from(TOPIC_RESOURCES_BUCKET)
      .upload(storagePath, arrayBuffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(TOPIC_RESOURCES_BUCKET)
      .getPublicUrl(storagePath);

    const now = new Date().toISOString();
    const insertPayload = {
      resourceType: "PDF",
      resourceName: file.name,
      resourceUrl: publicUrlData.publicUrl,
      collegeSubjectUnitTopicId: topicId,
      collegeId: actor.collegeId,
      createdBy: actor.facultyId,
      isAdmin: actor.adminId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const { data, error } = await supabaseAdmin
      .from("college_subject_unit_topic_resources")
      .insert(insertPayload)
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
      .single();

    if (error) {
      await supabaseAdmin.storage.from(TOPIC_RESOURCES_BUCKET).remove([storagePath]);
      throw new Error(`DB insert failed: ${error.message}`);
    }

    if (replaceExisting && existingResources?.length) {
      const oldResourceIds = existingResources.map(
        (resource) => resource.collegeSubjectUnitTopicResourceId,
      );
      const oldStoragePaths = existingResources.flatMap((resource) => {
        try {
          return [getStoragePathFromUrl(resource.resourceUrl)];
        } catch {
          return [];
        }
      });

      const { error: deactivateError } = await supabaseAdmin
        .from("college_subject_unit_topic_resources")
        .update({
          isActive: false,
          updatedAt: now,
        })
        .in("collegeSubjectUnitTopicResourceId", oldResourceIds);

      if (oldStoragePaths.length) {
        const { error: removeOldError } = await supabaseAdmin.storage
          .from(TOPIC_RESOURCES_BUCKET)
          .remove(oldStoragePaths);

      }
    }

    return NextResponse.json({ resource: data });
  } catch (error: any) {
    const status =
      error?.message === "Unauthorized"
        ? 401
        : error?.message === "Forbidden"
          ? 403
          : 500;

    return NextResponse.json(
      { error: error?.message || "Failed to upload resource" },
      { status },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const actor = await getAuthorizedActor();
    const { searchParams } = new URL(req.url);
    const resourceId = Number(searchParams.get("resourceId"));

    if (!resourceId) {
      return NextResponse.json(
        { error: "resourceId is required" },
        { status: 400 },
      );
    }

    const { data: resource, error: resourceError } = await supabaseAdmin
      .from("college_subject_unit_topic_resources")
      .select(
        `
        collegeSubjectUnitTopicResourceId,
        resourceUrl,
        collegeId,
        collegeSubjectUnitTopicId
      `,
      )
      .eq("collegeSubjectUnitTopicResourceId", resourceId)
      .eq("collegeId", actor.collegeId)
      .maybeSingle();

    if (resourceError || !resource) {
      throw new Error("Resource not found");
    }

    const storagePath = getStoragePathFromUrl(resource.resourceUrl);

    const { error: storageError } = await supabaseAdmin.storage
      .from(TOPIC_RESOURCES_BUCKET)
      .remove([storagePath]);

    if (storageError) {
      throw new Error(`Storage delete failed: ${storageError.message}`);
    }

    const { error: dbError } = await supabaseAdmin
      .from("college_subject_unit_topic_resources")
      .delete()
      .eq("collegeSubjectUnitTopicResourceId", resourceId)
      .eq("collegeId", actor.collegeId);

    if (dbError) {
      throw new Error(`DB delete failed: ${dbError.message}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const status =
      error?.message === "Unauthorized"
        ? 401
        : error?.message === "Forbidden"
          ? 403
          : 500;

    return NextResponse.json(
      { error: error?.message || "Failed to delete resource" },
      { status },
    );
  }
}
