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
  try {
    return await callDeviceProxy({
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
  } catch (err: any) {
    if (err?.subStatusCode === "employeeNoAlreadyExist") {
      return await callDeviceProxy({
        deviceId,
        endpoint: "AccessControl/UserInfo/Modify",
        method: "PUT",
        body: {
          UserInfo: {
            employeeNo: String(userId),
            name: fullName,
            userType: "normal",
            Valid: { enable: true, beginTime: validFrom, endTime: validTo },
          },
        },
      });
    }
    throw err;
  }
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

/** Get a valid UUID for the FaceDataRecord devIndex request parameter */
export const getDeviceFaceLibIndex = async (): Promise<string> => {
  return crypto.randomUUID().toUpperCase();
};

/** Register a face template on a device (image upload) */
export const registerFaceOnDevice = async (
  deviceId: number,
  userId: number,
  imageFile: File,
) => {
  const fd = new FormData();
  fd.append(
    "data",
    JSON.stringify({
      faceLibType: "blackFD",
      FDID: "1",
      FPID: String(userId),
      FaceInfo: {
        employeeNo: String(userId),
      },
    })
  );
  fd.append("FaceDataRecord", imageFile);

  try {
    return await callDeviceProxy({
      deviceId,
      endpoint: "Intelligent/FDLib/FaceDataRecord?format=json",
      formData: fd,
    });
  } catch (e: any) {
    if (e?.subStatusCode === "faceLibraryIDError" || e?.subStatusCode === "employeeNoAlreadyExist" || e?.subStatusCode === "deviceUserAlreadyExistFace") {
      throw new Error("Face data is already registered for this user on the device, or the face limit is reached.");
    } else if (e?.subStatusCode === "faceNoFace") {
      throw new Error("No face was detected in the provided image. Please use a clearer photo.");
    } else if (e?.subStatusCode === "facePoorQuality") {
      throw new Error("The face image quality is too low or blurry. Please upload a high-quality photo.");
    } else if (e?.subStatusCode === "badJsonContent") {
      throw new Error("The device rejected the payload format. Firmware might be incompatible.");
    }
    
    // Provide a generic user-friendly fallback if the error message is too technical
    if (e?.message && (e.message.includes("proxy error") || e.message.includes("face"))) {
      throw e;
    } else {
      throw new Error(e?.message || "Failed to register face on the device.");
    }
  }
};

/** Register face using base64 data (for programmatic use) */
export const registerFaceBase64OnDevice = async (
  deviceId: number,
  userId: number,
  faceDataBase64: string,
) => {
  const fd = new FormData();
  fd.append(
    "data",
    JSON.stringify({
      faceLibType: "blackFD",
      FDID: "1",
      FPID: String(userId),
      FaceInfo: {
        employeeNo: String(userId),
      },
    })
  );

  // Convert base64 to File
  const byteString = atob(faceDataBase64.includes(",") ? faceDataBase64.split(',')[1] : faceDataBase64);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: 'image/jpeg' });
  const file = new File([blob], 'face.jpg', { type: 'image/jpeg' });
  fd.append("FaceDataRecord", file);

  try {
    return await callDeviceProxy({
      deviceId,
      endpoint: "Intelligent/FDLib/FaceDataRecord?format=json",
      formData: fd,
    });
  } catch (e: any) {
    if (e?.subStatusCode === "faceLibraryIDError" || e?.subStatusCode === "employeeNoAlreadyExist" || e?.subStatusCode === "deviceUserAlreadyExistFace") {
      throw new Error("Face data is already registered for this user on the device, or the face limit is reached.");
    } else if (e?.subStatusCode === "faceNoFace") {
      throw new Error("No face was detected in the provided image. Please use a clearer photo.");
    } else if (e?.subStatusCode === "facePoorQuality") {
      throw new Error("The face image quality is too low or blurry. Please upload a high-quality photo.");
    } else if (e?.subStatusCode === "badJsonContent") {
      throw new Error("The device rejected the payload format. Firmware might be incompatible.");
    }
    
    if (e?.message && (e.message.includes("proxy error") || e.message.includes("face"))) {
      throw e;
    } else {
      throw new Error(e?.message || "Failed to register face on the device.");
    }
  }
};

/** Fetch the dynamic true FPID of a user's face record */
const getFacePictureId = async (deviceId: number, userId: number): Promise<string | null> => {
  try {
    const res = await callDeviceProxy({
      deviceId,
      endpoint: "Intelligent/FDLib/FDSearch?format=json",
      method: "POST",
      body: {
        searchResultPosition: 0,
        maxResults: 1,
        faceLibType: "blackFD",
        FDID: "1",
        FaceInfoSearchCond: {
          searchID: "1",
          searchResultPosition: 0,
          maxResults: 1,
          EmployeeNoList: [{ employeeNo: String(userId) }],
        },
      },
    });
    const match = res?.MatchList?.[0] || res?.FaceMatchList?.[0];
    return match?.FPID || null;
  } catch (e: any) {
    // Critical: Do not swallow network errors. If device is offline, we must halt!
    if (e?.message?.toLowerCase().includes("fetch failed") || e?.message?.toLowerCase().includes("device proxy error")) {
      throw new Error(`Device offline or unreachable: ${e.message}`);
    }
    return null; // Ignore API structural errors (notSupport)
  }
};

/** Delete face data from a device */
export const deleteFaceFromDevice = async (deviceId: number, userId: number) => {
  const attemptDelete = async (endpoint: string, method: string, payload?: any) => {
    return callDeviceProxy({
      deviceId,
      endpoint,
      method: method as any,
      ...(payload ? { body: payload } : {}),
    });
  };

  let lastError: any;
  const throwOnNetworkError = (e: any) => {
    if (e?.message?.toLowerCase().includes("fetch failed") || e?.message?.toLowerCase().includes("device proxy error") || e?.message?.toLowerCase().includes("offline")) {
      throw new Error(`Device offline or unreachable: ${e.message}`);
    }
  };

  // Strategy 1: DS-K1T320EFWX specifically requires XML for this endpoint
  // Logs showed JSON returned `badXmlFormat`, so we supply a raw XML payload here.
  try {
    const xmlPayload = `
<DelFaceParamCfg version="2.0" xmlns="http://www.isapi.org/ver20/XMLSchema">
  <faceLibType>blackFD</faceLibType>
  <employeeNo>${userId}</employeeNo>
</DelFaceParamCfg>
    `.trim();
    return await attemptDelete(
      "AccessControl/DelFaceParamCfg",
      "PUT",
      xmlPayload
    );
  } catch (e: any) {
    throwOnNetworkError(e);
    lastError = e;
  }

  // Strategy 2: Standard AccessControl FaceInfo Delete (Matches Card/Fingerprint)
  try {
    return await attemptDelete(
      "AccessControl/FaceInfo/Delete?format=json",
      "PUT",
      {
        FaceInfoDelCond: {
          EmployeeNoList: [{ employeeNo: String(userId) }],
        },
      }
    );
  } catch (e: any) {
    throwOnNetworkError(e);
    lastError = e;
  }

  // Strategy 3: Standard AccessControl FaceData Delete
  try {
    return await attemptDelete(
      "AccessControl/FaceData/Delete?format=json",
      "PUT",
      {
        FaceDataDelCond: {
          EmployeeNoList: [{ employeeNo: String(userId) }],
        },
      }
    );
  } catch (e: any) {
    throwOnNetworkError(e);
    lastError = e;
  }

  // Strategy 4: User's exact payload format for FDLib
  try {
    return await attemptDelete(
      "Intelligent/FDLib/FDSearch/Delete?format=json",
      "PUT",
      {
        FaceInfoDelCond: {
          EmployeeNoList: [{ employeeNo: String(userId) }],
        },
      }
    );
  } catch (e: any) {
    throwOnNetworkError(e);
    lastError = e;
  }

  // Strategy 5: Include faceLibType and FDID (Fixes 'faceLibraryIDError')
  try {
    return await attemptDelete(
      "Intelligent/FDLib/FDSearch/Delete?format=json",
      "PUT",
      {
        FaceInfoDelCond: {
          faceLibType: "blackFD",
          FDID: "1",
          EmployeeNoList: [{ employeeNo: String(userId) }],
        },
      }
    );
  } catch (e: any) {
    throwOnNetworkError(e);
    lastError = e;
  }

  // Strategy 6: Target by FPID explicitly (Fixes 'FPID' badJsonContent error)
  try {
    return await attemptDelete(
      "Intelligent/FDLib/FDSearch/Delete?format=json",
      "PUT",
      {
        FaceInfoDelCond: {
          faceLibType: "blackFD",
          FDID: "1",
          FPID: String(userId),
        },
      }
    );
  } catch (e: any) {
    throwOnNetworkError(e);
    lastError = e;
  }

  const errorMsg = lastError?.subStatusCode === "faceLibraryIDError"
    ? "Device face library ID mismatch. Please check device configuration."
    : lastError?.subStatusCode === "notSupport" || lastError?.subStatusCode === "badJsonContent" || lastError?.errorMsg === "FPID" || lastError?.subStatusCode === "badXmlFormat"
      ? "Device firmware rejected face deletion format. Please check device compatibility."
      : (lastError?.message || "Failed to remove face from device scanner.");

  const err = new Error(errorMsg) as any;
  err.subStatusCode = lastError?.subStatusCode;
  throw err;
};

/* ------------------------------------------------------------------ */
/*  Card                                                               */
/* ------------------------------------------------------------------ */
/** Capture a card from the device reader */
export const captureCard = async (deviceId: number) => {
  const attemptCapture = async (endpoint: string, method: "PUT" | "POST" | "DELETE" | "GET", body?: any) => {
    const options: any = { deviceId, endpoint, method };
    // GET requests cannot have a body in the proxy
    if (method !== "GET" && body !== undefined) {
      options.body = body;
    }
    return callDeviceProxy(options);
  };

  // Hikvision expects ISO time WITHOUT milliseconds (e.g. YYYY-MM-DDThh:mm:ssZ)
  const formatHikTime = (date: Date) => date.toISOString().split('.')[0] + '+00:00';

  let lastError: any;

  // Strategy 1: Standard Capture endpoint
  try {
    return await attemptCapture(
      "AccessControl/CardInfo/Capture?format=json",
      "POST",
      {
        CardInfoCaptureCond: {
          enable: true,
          cardReaderNo: 1,
        },
      }
    );
  } catch (e: any) {
    lastError = e;
  }

  // Strategy 2: CaptureCardInfo GET
  try {
    return await attemptCapture(
      "AccessControl/CaptureCardInfo?format=json",
      "GET"
    );
  } catch (e: any) {
    lastError = e;
  }

  // Strategy 3: Poll recent AcsEvents (Bulletproof fallback for Face Recognition Terminals)
  try {
    // Attempt to get exact device time to avoid severe out-of-sync issues causing NO MATCH
    let devStartTimeStr = formatHikTime(new Date(Date.now() - 5000));
    try {
      const timeRes = await attemptCapture("System/time?format=json", "GET");
      if (timeRes?.Time?.localTime) {
        const devDate = new Date(timeRes.Time.localTime);
        devStartTimeStr = formatHikTime(new Date(devDate.getTime() - 5000));
      }
    } catch (e) {
      // ignore and use local server time if device blocks time fetching
    }

    const endTimeStr = formatHikTime(new Date(Date.now() + 86400000)); // 1 day in future

    for (let i = 0; i < 10; i++) {
      const res = await attemptCapture(
        "AccessControl/AcsEvent?format=json",
        "POST",
        {
          AcsEventCond: {
            searchID: "capture_card_" + Date.now(),
            searchResultPosition: 0,
            maxResults: 10,
            major: 5,
            minor: 0,
            startTime: devStartTimeStr,
            endTime: endTimeStr
          }
        }
      );

      const events = res?.AcsEvent?.InfoList || res?.AcsEventSearch?.InfoList || [];
      // Find latest valid card swipe
      const cardEvent = events.find((ev: any) => ev.cardNo && ev.cardNo.trim() !== "" && ev.cardNo !== "0000000000");

      if (cardEvent) {
        return { cardNo: cardEvent.cardNo };
      }

      // Wait 1.5 seconds before next poll
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    throw new Error("No card detected. If you tapped it and the device did not beep, this card frequency is incompatible.");
  } catch (e: any) {
    lastError = e;
  }

  throw lastError;
};

/** Register a card on a device */
export const registerCardOnDevice = async (
  deviceId: number,
  userId: number,
  cardNo: string,
) => {
  return callDeviceProxy({
    deviceId,
    endpoint: "AccessControl/CardInfo/Record?format=json",
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
    endpoint: "AccessControl/CardInfo/Delete?format=json",
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
  const attemptCapture = async (payload: any, isXml: boolean = false) => {
    return callDeviceProxy({
      deviceId,
      endpoint: `AccessControl/CaptureFingerPrint${isXml ? '' : '?format=json'}`,
      method: "POST",
      body: payload,
    });
  };

  const isRetryable = (e: any) => {
    // Retry if it's a bad request, invalid operation, or XML format issue
    return e?.subStatusCode === "invalidOperation" || e?.subStatusCode === "badRequest" || e?.message?.includes("400") || e?.message?.includes("415");
  };

  let lastError: any;

  // Strategy 1: Standard ISAPI XML (Current)
  try {
    return await attemptCapture(`
<CaptureFingerPrintCond version="2.0" xmlns="http://www.isapi.org/ver20/XMLSchema">
  <fingerNo>${fingerNo}</fingerNo>
</CaptureFingerPrintCond>
    `.trim(), true);
  } catch (e: any) {
    lastError = e;
    if (!isRetryable(e)) throw e;
  }

  // Strategy 2: JSON payload
  try {
    return await attemptCapture({
      CaptureFingerPrintCond: { fingerNo },
    });
  } catch (e: any) {
    lastError = e;
    if (!isRetryable(e)) throw e;
  }

  // Strategy 3: Hikvision Namespace XML
  try {
    return await attemptCapture(`
<CaptureFingerPrintCond version="2.0" xmlns="http://www.hikvision.com/ver20/XMLSchema">
  <fingerNo>${fingerNo}</fingerNo>
</CaptureFingerPrintCond>
    `.trim());
  } catch (e: any) {
    lastError = e;
    if (!isRetryable(e)) throw e;
  }

  // Strategy 4: Fallback to fingerNo=1 (some devices only accept 1 for the capture command itself)
  if (fingerNo !== 1) {
    try {
      return await attemptCapture(`
<CaptureFingerPrintCond version="2.0" xmlns="http://www.isapi.org/ver20/XMLSchema">
  <fingerNo>1</fingerNo>
</CaptureFingerPrintCond>
      `.trim());
    } catch (e: any) {
      lastError = e;
      if (!isRetryable(e)) throw e;
    }
  }

  // If all strategies fail, enhance the error message if it's invalidOperation
  if (lastError?.subStatusCode === "invalidOperation") {
    const errorMsg = "Device rejected capture. The fingerprint scanner might be disconnected, currently busy, or requires a device restart.";
    const enhancedError = new Error(errorMsg) as any;
    enhancedError.subStatusCode = lastError.subStatusCode;
    throw enhancedError;
  }

  throw lastError;
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
        fingerType: "normalFP",
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
  const attemptDelete = async (payload: any) => {
    return callDeviceProxy({
      deviceId,
      endpoint: "AccessControl/FingerPrint/Delete?format=json",
      method: "PUT",
      body: payload,
    });
  };

  let lastError: any;

  // Strategy 1: Standard ISAPI FingerPrintDeleteCond
  try {
    return await attemptDelete({
      FingerPrintDeleteCond: {
        EmployeeNoList: [
          {
            employeeNo: String(userId),
            fingerPrintID: fingerPrintIDs,
          },
        ],
      },
    });
  } catch (e: any) {
    lastError = e;
  }

  // Strategy 2: Legacy mode "byEmployeeNo" (Current implementation, often fails silently or errors)
  try {
    return await attemptDelete({
      FingerPrintDelete: {
        mode: "byEmployeeNo",
        EmployeeNoDetail: {
          employeeNo: String(userId),
          fingerPrintID: fingerPrintIDs,
        },
      },
    });
  } catch (e: any) {
    lastError = e;
  }

  // Strategy 3: XML format with FingerPrintDeleteCond
  try {
    const xmlPayload = `
<FingerPrintDeleteCond version="2.0" xmlns="http://www.isapi.org/ver20/XMLSchema">
  <EmployeeNoList>
    <EmployeeNoDetail>
      <employeeNo>${userId}</employeeNo>
      ${fingerPrintIDs.map(id => `<fingerPrintID>${id}</fingerPrintID>`).join('')}
    </EmployeeNoDetail>
  </EmployeeNoList>
</FingerPrintDeleteCond>
    `.trim();

    return await callDeviceProxy({
      deviceId,
      endpoint: "AccessControl/FingerPrint/Delete",
      method: "PUT",
      body: xmlPayload,
    });
  } catch (e: any) {
    lastError = e;
  }

  throw lastError;
};
