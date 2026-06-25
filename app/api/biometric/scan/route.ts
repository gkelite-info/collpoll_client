import { NextRequest, NextResponse } from "next/server";
import {
  adminSupabase,
  validateAndLookupDevice,
  validateAndLookupDeviceById,
  validateAndLookupDeviceByIp,
  lookupUserByEmployeeNo,
  lookupUserByCredential,
  insertPendingLog,
  updateLogStatus,
  updateDeviceIp,
  insertRetryQueue,
} from "@/lib/helpers/devices/scanIngestionHelper";
import { processClassroomAttendance } from "@/lib/helpers/devices/attendanceProcessor";
import { processGateScan } from "@/lib/helpers/devices/gateScanLogAPI";

export const dynamic = "force-dynamic";

const lastScanMap = new Map<string, number>();

function isRateLimited(userId: number, collegeId: number): boolean {
  const key = `${userId}-${collegeId}`;
  const now = Date.now();
  const last = lastScanMap.get(key);
  if (last && now - last < 20000) return true;
  lastScanMap.set(key, now);

  // Prevent unbounded growth (cap at 10k entries — ~600KB worst case)
  if (lastScanMap.size > 10_000) {
    const oldest = lastScanMap.keys().next().value;
    if (oldest) lastScanMap.delete(oldest);
  }
  return false;
}



// Removed fs and path since they crash in serverless environments (e.g. Vercel)

export async function POST(req: NextRequest) {
  try {
    // 1. Parse body (Handle JSON or Hikvision Multipart)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let body: any = {};
    const contentType = req.headers.get("content-type") || "";

    // -- DEBUG LOGGING --
    const rawReqBodyBytes = await req.arrayBuffer();
    const rawReqBodyString = new TextDecoder().decode(rawReqBodyBytes);
    console.log(`[Webhook] Scan Received. Content-Type: ${contentType}`, rawReqBodyString);
    // -------------------

    if (contentType.includes("multipart/form-data")) {
      // Reconstruct Request since we consumed the body
      const reqClone = new Request(req.url, {
        method: req.method,
        headers: req.headers,
        body: rawReqBodyBytes,
        duplex: 'half'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      
      const formData = await reqClone.formData();
      const eventLogPart = formData.get("event_log") || formData.get("event_info");
      if (eventLogPart && typeof eventLogPart === "string") {
        try {
          body = JSON.parse(eventLogPart);
        } catch {
          return NextResponse.json({ error: "Invalid multipart JSON" }, { status: 400 });
        }
      }
    } else {
      try {
        // Safer and avoids NextJS req.clone() or JSON hanging bugs
        body = JSON.parse(rawReqBodyString);
      } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
      }
    }

    // 2. Normalize Hikvision payload if present
    const urlDeviceId = req.nextUrl.searchParams.get("deviceId");
    let deviceSerialNumber = body.deviceSerialNumber || body.deviceID;
    let employeeNo = body.employeeNo;
    let credentialIdentifier = body.credentialIdentifier;
    let authMethod = body.authMethod;
    let scanTimestamp = body.scanTimestamp || body.dateTime;
    const rawDeviceData = body.rawDeviceData || body;

    if (body.EventNotificationAlert?.AccessControllerEvent) {
      const evt = body.EventNotificationAlert.AccessControllerEvent;
      deviceSerialNumber = evt.serialNo || deviceSerialNumber;
      employeeNo = evt.employeeNoString || evt.EmployeeNoString || employeeNo;
      scanTimestamp = evt.time || body.EventNotificationAlert.dateTime || scanTimestamp;
      
      // Determine actual auth method using subEventType or fallback to explicit verify mode
      if (evt.subEventType === 75) authMethod = "facerecognition";
      else if (evt.subEventType === 38) authMethod = "fingerprint";
      else if (evt.subEventType === 1) authMethod = "card";
      else if (evt.currentVerifyMode === "face") authMethod = "facerecognition";
      else if (evt.currentVerifyMode === "fingerprint") authMethod = "fingerprint";
      else if (evt.currentVerifyMode === "card") authMethod = "card";
      else authMethod = "manual";

      credentialIdentifier = evt.cardNo || credentialIdentifier;
    } else if (body.AccessControllerEvent) {
      const evt = body.AccessControllerEvent;
      // In some firmwares, serialNo is the event serial, not device. Only override if deviceSerialNumber is missing.
      deviceSerialNumber = deviceSerialNumber || evt.serialNo;
      employeeNo = evt.employeeNoString || evt.EmployeeNoString || employeeNo;
      scanTimestamp = evt.time || body.dateTime || scanTimestamp;
      
      // Determine actual auth method using subEventType or fallback to explicit verify mode
      if (evt.subEventType === 75) authMethod = "facerecognition";
      else if (evt.subEventType === 38) authMethod = "fingerprint";
      else if (evt.subEventType === 1) authMethod = "card";
      else if (evt.currentVerifyMode === "face") authMethod = "facerecognition";
      else if (evt.currentVerifyMode === "fingerprint") authMethod = "fingerprint";
      else if (evt.currentVerifyMode === "card") authMethod = "card";
      else authMethod = "manual";

      credentialIdentifier = evt.cardNo || credentialIdentifier;
    }

    // 3. Validate required fields
    if ((!deviceSerialNumber && !urlDeviceId && !body.ipAddress) || (!employeeNo && !credentialIdentifier) || !scanTimestamp) {
      return NextResponse.json(
        {
          processed: false,
          reason: "MissingRequiredFields",
        },
        { status: 200 }, // Return 200 so device doesn't retry garbage data
      );
    }

    // 4. Validate & lookup device
    let device;
    if (urlDeviceId) {
      device = await validateAndLookupDeviceById(parseInt(urlDeviceId));
    }
    if (!device && deviceSerialNumber) {
      device = await validateAndLookupDevice(deviceSerialNumber);
    }
    if (!device && body.ipAddress) {
      device = await validateAndLookupDeviceByIp(body.ipAddress);
    }
    
    if (!device) {
      return NextResponse.json(
        { processed: false, reason: "DeviceNotFound" },
        { status: 200 },
      );
    }

    // Dynamic IP update: if the device payload gives us an IP and it's different from what we have, update it!
    if (body.ipAddress && device.deviceIp !== body.ipAddress && body.ipAddress !== "0.0.0.0") {
      await updateDeviceIp(device.deviceId, body.ipAddress);
    }

    // 4. Lookup user
    let userId: number | null = null;
    let isActive = false;

    if (employeeNo) {
      const empRes = await lookupUserByEmployeeNo(employeeNo, device.collegeId);
      if (empRes) {
        userId = empRes.userId;
        isActive = empRes.isActive;
      }
    }

    if (!userId && credentialIdentifier) {
      const credRes = await lookupUserByCredential(
        credentialIdentifier,
        device.collegeId,
      );
      if (credRes) {
        userId = credRes.userId;
        isActive = credRes.isActive;
      }
    }

    // 5. Determine logType based on device category
    const logType: "classattendance" | "gateentry" | "gateexit" = device.deviceCategory === "gate" ? "gateentry" : "classattendance";

    // DB strictly expects 'card', 'fingerprint', 'facerecognition', 'manual'
    let dbAuthMethod: "fingerprint" | "facerecognition" | "card" | "manual" = "manual";
    if (authMethod) {
      const am = authMethod.toLowerCase();
      if (am === "face" || am === "facerecognition") dbAuthMethod = "facerecognition";
      else if (am === "fingerprint") dbAuthMethod = "fingerprint";
      else if (am === "card") dbAuthMethod = "card";
    }

    // 6. Insert pending log (audit trail — always created)
    const deviceAttendanceLogId = await insertPendingLog({
      deviceId: device.deviceId,
      userId,
      collegeId: device.collegeId,
      logType,
      authMethod: dbAuthMethod,
      scanTimestamp: scanTimestamp,
      rawDeviceData,
    });

    // 7. Handle unknown credential
    if (!userId || !isActive) {
      if (deviceAttendanceLogId) {
        await updateLogStatus({
          deviceAttendanceLogId,
          processedStatus: "rejected",
          rejectionReason: "CredentialNotFound",
        });
      }
      return NextResponse.json(
        { processed: false, reason: "CredentialNotFound" },
        { status: 200 },
      );
    }

    // 8. Rate limit check & 20-second Debounce (SaaS Level Deduplication)
    if (isRateLimited(userId, device.collegeId)) {
      if (deviceAttendanceLogId) {
        await updateLogStatus({
          deviceAttendanceLogId,
          processedStatus: "rejected",
          rejectionReason: "DuplicateScan",
        });
      }
      return NextResponse.json(
        { processed: false, reason: "DuplicateScan" },
        { status: 200 },
      );
    }

    // DB-backed 20-second debounce across instances
    const scanTimeMs = new Date(scanTimestamp).getTime();
    const twentySecondsBefore = new Date(scanTimeMs - 20000).toISOString();
    const twentySecondsAfter = new Date(scanTimeMs + 20000).toISOString();

    const { data: duplicates } = await adminSupabase
      .from("device_attendance_logs")
      .select("deviceAttendanceLogId")
      .eq("userId", userId)
      .eq("collegeId", device.collegeId)
      // Only match older logs within the 20s window to prevent race condition deadlock
      .lt("deviceAttendanceLogId", deviceAttendanceLogId || 999999999)
      .gte("scanTimestamp", twentySecondsBefore)
      .lte("scanTimestamp", twentySecondsAfter)
      .in("processedStatus", ["accepted", "pending"])
      .limit(1);

    if (duplicates && duplicates.length > 0) {
      if (deviceAttendanceLogId) {
        await updateLogStatus({
          deviceAttendanceLogId,
          processedStatus: "rejected",
          rejectionReason: "DuplicateScan",
        });
      }
      return NextResponse.json(
        { processed: false, reason: "DuplicateScan" },
        { status: 200 },
      );
    }

    // 9. Route to appropriate processor based on device category
    try {
      if (device.deviceCategory === "classroom") {
        // ── Classroom scan → attendance_record
        if (!deviceAttendanceLogId) {
          return NextResponse.json(
            { processed: false, reason: "LogInsertFailed" },
            { status: 200 },
          );
        }

        const result = await processClassroomAttendance({
          deviceId: device.deviceId,
          userId,
          collegeId: device.collegeId,
          authMethod: dbAuthMethod,
          scanTimestamp,
          deviceAttendanceLogId,
        });

        await updateLogStatus({
          deviceAttendanceLogId,
          processedStatus: result.success ? "accepted" : "rejected",
          rejectionReason: result.success ? undefined : result.rejectionReason,
          calendarEventId: result.calendarEventId ?? null,
          deviceClassSessionId: result.deviceClassSessionId ?? null,
          attendanceRecordId: result.attendanceRecordId ?? null,
        });

        return NextResponse.json(
          {
            processed: result.success,
            alreadyMarked: result.alreadyMarked ?? false,
            attendanceRecordId: result.attendanceRecordId,
            reason: result.rejectionReason,
          },
          { status: 200 },
        );
      }

      if (device.deviceCategory === "gate") {
        // ── Gate scan → gate_scan_logs + attendance_daily (staff)
        // Hikvision sends direction in rawDeviceData.direction or similar field
        const scanType =
          device.gateDirection === "In" ? "Entry" :
          device.gateDirection === "Out" ? "Exit" :
          "Standalone";

        const scanDate = scanTimestamp.split("T")[0];

        let gateAuthMethod: "Card" | "Fingerprint" | "FaceRecognition" | "QRCode" = "FaceRecognition";
        if (dbAuthMethod === "card") gateAuthMethod = "Card";
        else if (dbAuthMethod === "fingerprint") gateAuthMethod = "Fingerprint";
        else if (dbAuthMethod === "facerecognition") gateAuthMethod = "FaceRecognition";
        else if (dbAuthMethod === "manual") gateAuthMethod = "FaceRecognition";

        const gateResult = await processGateScan({
          userId,
          collegeId: device.collegeId,
          deviceId: device.deviceId,
          scanType,
          scanTime: scanTimestamp,
          scanDate,
          authMethod: gateAuthMethod,
          deviceAttendanceLogId: deviceAttendanceLogId ?? undefined,
        });

        if (!gateResult.success) {
          console.error("Gate Process Error:", gateResult.error);
        }

        if (deviceAttendanceLogId) {
          await updateLogStatus({
            deviceAttendanceLogId,
            processedStatus: gateResult.success ? "accepted" : "rejected",
            rejectionReason: gateResult.success
              ? undefined
              : "GateProcessFailed",
            gateScanLogId: gateResult.data?.gateScanLogId ?? null,
            attendanceDailyId:
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (gateResult.data as any)?.attendanceDailyId ?? null,
          });
        }

        return NextResponse.json(
          { processed: gateResult.success },
          { status: 200 },
        );
      }

      // Unknown category
      return NextResponse.json({ processed: false, reason: "UnknownCategory" }, { status: 200 });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (processError: any) {
      console.error("[POST /api/biometric/scan] Processing Error:", processError.message);
      
      // Update pending log to error
      if (deviceAttendanceLogId) {
        await updateLogStatus({
          deviceAttendanceLogId,
          processedStatus: "error",
          rejectionReason: "SystemError-Queued",
        });
      }

      // Insert raw payload into Dead-Letter Retry Queue (only if it's not already a retry)
      if (!body.isRetry) {
        await insertRetryQueue(
          device.collegeId, 
          body, 
          processError.message || "Unknown Error"
        );
      }

      // Return 200 so device thinks it succeeded and deletes its local cache
      return NextResponse.json(
        { processed: true, queued: true, reason: processError.message || "SystemError-Queued" },
        { status: 200 }
      );
    }

  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[POST /api/biometric/scan] Critical Wrapper Error:", message);
    
    // Last ditch effort: if we somehow failed before device lookup, we can't reliably queue per college, 
    // but returning 200 prevents infinite retry loops from the device.
    return NextResponse.json(
      { processed: false, reason: "ServerError" },
      { status: 200 },
    );
  }
}
