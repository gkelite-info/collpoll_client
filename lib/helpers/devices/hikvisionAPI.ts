/**
 * Hikvision device communication helpers.
 *
 * All calls go through the Next.js API proxy `/api/biometric/device-proxy`
 * which resolves device connection details from the database and handles
 * Digest authentication.
 */

/* ------------------------------------------------------------------ */
/*  Core proxy call                                                    */
/* ------------------------------------------------------------------ */

interface ProxyRequest {
  deviceId: number;
  /** ISAPI endpoint path (after /ISAPI/) e.g. "AccessControl/UserInfo/Record" */
  endpoint: string;
  method?: "POST" | "PUT" | "DELETE" | "GET";
  body?: Record<string, unknown> | string;
  /** For multipart (face image upload) */
  formData?: FormData;
}

async function callDeviceProxy(req: ProxyRequest) {
  const isFormData = !!req.formData;

  const res = await fetch("/api/biometric/device-proxy", {
    method: "POST",
    ...(isFormData
      ? {
          body: (() => {
            const fd = req.formData!;
            fd.append("_deviceId", String(req.deviceId));
            fd.append("_endpoint", req.endpoint);
            fd.append("_method", req.method || "POST");
            return fd;
          })(),
        }
      : {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deviceId: req.deviceId,
            endpoint: req.endpoint,
            method: req.method || "POST",
            payload: req.body || {},
          }),
        }),
  });

  const data = await res.json();
  
  let isAppError = false;
  let subCode = data?.subStatusCode;
  let errMsg = data?.error || data?.errorMsg || data?.statusString;

  if (data?.statusCode && data.statusCode !== 1) {
    isAppError = true;
  } else if (data?.rawXml) {
    const codeMatch = data.rawXml.match(/<statusCode>(.*?)<\/statusCode>/);
    if (codeMatch && codeMatch[1] !== "1") {
      isAppError = true;
      const subMatch = data.rawXml.match(/<subStatusCode>(.*?)<\/subStatusCode>/);
      if (subMatch) subCode = subMatch[1];
      const errMatch = data.rawXml.match(/<statusString>(.*?)<\/statusString>/);
      if (errMatch) errMsg = errMatch[1];
    }
  }

  if (!res.ok || isAppError) {
    const err = new Error(errMsg || `Device proxy error (${res.status})`) as any;
    err.subStatusCode = subCode;
    throw err;
  }

  return data;
}

/* ------------------------------------------------------------------ */
/*  User Management                                                    */
/* ------------------------------------------------------------------ */

/** Register / update a user on a Hikvision device */
export const registerUserOnDevice = async (
  deviceId: number,
  userId: number,
  fullName: string,
  validFrom = "2026-01-01T00:00:00",
  validTo = "2030-12-31T23:59:59",
) => {
  return callDeviceProxy({
    deviceId,
    endpoint: "AccessControl/UserInfo/Record",
    body: {
      UserInfo: {
        employeeNo: String(userId),
        name: fullName,
        userType: "normal",
        Valid: { enable: true, beginTime: validFrom, endTime: validTo },
      },
    },
  });
};

/** Search a specific user on a device */
export const searchUserOnDevice = async (deviceId: number, userId: number) => {
  return callDeviceProxy({
    deviceId,
    endpoint: "AccessControl/UserInfo/Search",
    body: {
      UserInfoSearchCond: {
        searchID: crypto.randomUUID(),
        searchResultPosition: 0,
        maxResults: 1,
        EmployeeNoList: [{ employeeNo: String(userId) }],
      },
    },
  });
};

/** Search all persons on a device */
export const searchAllUsersOnDevice = async (
  deviceId: number,
  position = 0,
  maxResults = 30,
) => {
  return callDeviceProxy({
    deviceId,
    endpoint: "AccessControl/UserInfo/Search",
    body: {
      UserInfoSearchCond: {
        searchID: crypto.randomUUID(),
        searchResultPosition: position,
        maxResults,
      },
    },
  });
};

/** Delete a user from a device */
export const deleteUserFromDevice = async (deviceId: number, userId: number) => {
  return callDeviceProxy({
    deviceId,
    endpoint: "AccessControl/UserInfo/Delete",
    method: "PUT",
    body: {
      UserInfoDelCond: {
        EmployeeNoList: [{ employeeNo: String(userId) }],
      },
    },
  });
};

/* ------------------------------------------------------------------ */
/*  Face                                                               */
/* ------------------------------------------------------------------ */

/** Register a face template on a device (image upload) */
export const registerFaceOnDevice = async (
  deviceId: number,
  userId: number,
  imageFile: File,
) => {
  const fd = new FormData();
  // Hikvision ISAPI expects JSON metadata + image in multipart
  fd.append(
    "FaceDataRecord",
    JSON.stringify({ faceLibType: "blackFD", FDID: "1", FPID: String(userId) }),
  );
  fd.append("img", imageFile);

  // Alternative simpler endpoint many Hikvision models support:
  return callDeviceProxy({
    deviceId,
    endpoint: `AccessControl/FaceInfo/Record?format=json`,
    formData: fd,
    body: { FaceInfo: { employeeNo: String(userId) } },
  });
};

/** Register face using base64 data (for programmatic use) */
export const registerFaceBase64OnDevice = async (
  deviceId: number,
  userId: number,
  faceDataBase64: string,
) => {
  return callDeviceProxy({
    deviceId,
    endpoint: "AccessControl/FaceInfo/Record",
    body: {
      FaceInfo: {
        employeeNo: String(userId),
        faceData: faceDataBase64,
      },
    },
  });
};

/** Delete face data from a device */
export const deleteFaceFromDevice = async (deviceId: number, userId: number) => {
  return callDeviceProxy({
    deviceId,
    endpoint: "AccessControl/FaceInfo/Delete",
    method: "PUT",
    body: {
      FaceInfoDelCond: {
        EmployeeNoList: [{ employeeNo: String(userId) }],
      },
    },
  });
};

/* ------------------------------------------------------------------ */
/*  Card                                                               */
/* ------------------------------------------------------------------ */

/** Register a card on a device */
export const registerCardOnDevice = async (
  deviceId: number,
  userId: number,
  cardNo: string,
) => {
  return callDeviceProxy({
    deviceId,
    endpoint: "AccessControl/CardInfo/Record",
    body: {
      CardInfo: {
        employeeNo: String(userId),
        cardNo,
        cardType: "normalCard",
      },
    },
  });
};

/** Delete a card from a device */
export const deleteCardFromDevice = async (deviceId: number, cardNo: string) => {
  return callDeviceProxy({
    deviceId,
    endpoint: "AccessControl/CardInfo/Delete",
    method: "PUT",
    body: {
      CardInfoDelCond: {
        CardNoList: [{ cardNo }],
      },
    },
  });
};

/* ------------------------------------------------------------------ */
/*  Fingerprint                                                        */
/* ------------------------------------------------------------------ */

/** Capture fingerprint from device (device enters capture mode) */
export const captureFingerprint = async (deviceId: number, fingerNo: number) => {
  const xmlPayload = `
<CaptureFingerPrintCond version="2.0" xmlns="http://www.isapi.org/ver20/XMLSchema">
  <fingerNo>${fingerNo}</fingerNo>
</CaptureFingerPrintCond>
  `.trim();

  return callDeviceProxy({
    deviceId,
    endpoint: "AccessControl/CaptureFingerPrint",
    method: "POST",
    body: xmlPayload,
  });
};

/** Register fingerprint data on a device */
export const registerFingerprintOnDevice = async (
  deviceId: number,
  userId: number,
  fingerPrintID: number,
  fingerData: string,
) => {
  return callDeviceProxy({
    deviceId,
    endpoint: "AccessControl/FingerPrint/SetUp",
    method: "POST",
    body: {
      FingerPrintCfg: {
        employeeNo: String(userId),
        enableCardReader: [1],
        fingerPrintID,
        fingerData,
      },
    },
  });
};

/** Delete fingerprint(s) from a device */
export const deleteFingerprintFromDevice = async (
  deviceId: number,
  userId: number,
  fingerPrintIDs: number[],
) => {
  const xmlPayload = `
<FingerPrintDelete version="2.0" xmlns="http://www.isapi.org/ver20/XMLSchema">
  <EmployeeNoDetail>
    <employeeNo>${userId}</employeeNo>
    ${fingerPrintIDs.map(id => `<fingerPrintID>${id}</fingerPrintID>`).join("")}
  </EmployeeNoDetail>
</FingerPrintDelete>
  `.trim();

  return callDeviceProxy({
    deviceId,
    endpoint: "AccessControl/FingerPrint/Delete",
    method: "PUT",
    body: xmlPayload,
  });
};
