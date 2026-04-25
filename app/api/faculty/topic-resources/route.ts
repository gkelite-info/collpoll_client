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

    console.log("[topic-resources][GET] Request received", {
      topicId,
      role: actor.role,
      userId: actor.userId,
      facultyId: actor.facultyId,
      adminId: actor.adminId,
      collegeId: actor.collegeId,
    });

    const topic = await getTopicInCollege(topicId, actor.collegeId);

    console.log("[topic-resources][GET] Topic authorized", topic);

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
      console.log("[topic-resources][GET] DB read failed", {
        topicId,
        error: error.message,
      });
      throw new Error(error.message);
    }

    console.log("[topic-resources][GET] Resources fetched", {
      topicId,
      count: data?.length ?? 0,
    });

    return NextResponse.json({ resources: data ?? [] });
  } catch (error: any) {
    console.log("[topic-resources][GET] Request failed", {
      error: error?.message ?? error,
    });
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

    console.log("[topic-resources][POST] Upload request received", {
      role: actor.role,
      userId: actor.userId,
      facultyId: actor.facultyId,
      adminId: actor.adminId,
      collegeId: actor.collegeId,
      topicId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });

    const topic = await getTopicInCollege(topicId, actor.collegeId);

    console.log("[topic-resources][POST] Topic lookup result", topic);
    console.log("[topic-resources][POST] Derived storage metadata", {
      collegeId: actor.collegeId,
      collegeSubjectId: topic.collegeSubjectId,
      unitNumber: topic.college_subject_units.unitNumber,
      topicId,
    });

    const storagePath = buildStoragePath({
      collegeId: actor.collegeId,
      collegeSubjectId: topic.collegeSubjectId,
      unitNumber: topic.college_subject_units.unitNumber,
      topicId,
      fileName: file.name,
    });

    console.log("[topic-resources][POST] Storage path prepared", {
      storagePath,
    });

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabaseAdmin.storage
      .from(TOPIC_RESOURCES_BUCKET)
      .upload(storagePath, arrayBuffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.log("[topic-resources][POST] Storage upload failed", {
        storagePath,
        error: uploadError.message,
      });
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    console.log("[topic-resources][POST] Storage upload succeeded", {
      storagePath,
    });

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(TOPIC_RESOURCES_BUCKET)
      .getPublicUrl(storagePath);

    console.log("[topic-resources][POST] Public URL generated", {
      publicUrl: publicUrlData.publicUrl,
    });

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

    console.log("[topic-resources][POST] Insert payload prepared", {
      role: actor.role,
      createdBy: insertPayload.createdBy,
      isAdmin: insertPayload.isAdmin,
      note: "Uses actor-based null handling: faculty => createdBy only, admin => isAdmin only.",
    });

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
      console.log("[topic-resources][POST] DB insert failed", {
        storagePath,
        error: error.message,
      });
      await supabaseAdmin.storage.from(TOPIC_RESOURCES_BUCKET).remove([storagePath]);
      throw new Error(`DB insert failed: ${error.message}`);
    }

    console.log("[topic-resources][POST] DB insert succeeded", {
      resourceId: data.collegeSubjectUnitTopicResourceId,
      storagePath,
    });

    return NextResponse.json({ resource: data });
  } catch (error: any) {
    console.log("[topic-resources][POST] Request failed", {
      error: error?.message ?? error,
    });
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

    console.log("[topic-resources][DELETE] Request received", {
      role: actor.role,
      userId: actor.userId,
      facultyId: actor.facultyId,
      adminId: actor.adminId,
      collegeId: actor.collegeId,
      resourceId,
    });

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
      console.log("[topic-resources][DELETE] Resource lookup failed", {
        resourceId,
        error: resourceError?.message,
      });
      throw new Error("Resource not found");
    }

    const storagePath = getStoragePathFromUrl(resource.resourceUrl);

    console.log("[topic-resources][DELETE] Storage path resolved", {
      resourceId,
      storagePath,
    });

    const { error: storageError } = await supabaseAdmin.storage
      .from(TOPIC_RESOURCES_BUCKET)
      .remove([storagePath]);

    if (storageError) {
      console.log("[topic-resources][DELETE] Storage delete failed", {
        resourceId,
        storagePath,
        error: storageError.message,
      });
      throw new Error(`Storage delete failed: ${storageError.message}`);
    }

    console.log("[topic-resources][DELETE] Storage delete succeeded", {
      resourceId,
      storagePath,
    });

    const { error: dbError } = await supabaseAdmin
      .from("college_subject_unit_topic_resources")
      .delete()
      .eq("collegeSubjectUnitTopicResourceId", resourceId)
      .eq("collegeId", actor.collegeId);

    if (dbError) {
      console.log("[topic-resources][DELETE] DB delete failed", {
        resourceId,
        error: dbError.message,
      });
      throw new Error(`DB delete failed: ${dbError.message}`);
    }

    console.log("[topic-resources][DELETE] DB delete succeeded", {
      resourceId,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.log("[topic-resources][DELETE] Request failed", {
      error: error?.message ?? error,
    });
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
