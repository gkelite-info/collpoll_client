/**
 * Hikvision device communication helpers.
 *
 * All calls go through the Next.js API proxy `/api/biometric/device-proxy`
 * which resolves device connection details from the database and handles
 * Digest authentication.
 */

import { getBiometricValidity } from "@/lib/helpers/biometric/biometricValidity";

interface ProxyRequest {
  deviceId: number;
  endpoint: string;
  method?: "POST" | "PUT" | "DELETE" | "GET";
  body?: Record<string, unknown> | string;
  formData?: FormData;
}

async function callDeviceProxy(req: ProxyRequest) {
  const isFormData = !!req.formData;
  
  const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");

  const res = await fetch(`${baseUrl}/api/biometric/device-proxy`, {
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


export const registerUserOnDevice = async (
  deviceId: number,
  userId: number,
  fullName: string,
  validFrom?: string,
  validTo?: string,
) => {
  let beginTime = validFrom;
  let endTime = validTo;

  if (!beginTime || !endTime) {
    const defaultValidity = getBiometricValidity();
    beginTime = beginTime || defaultValidity.beginTime;
    endTime = endTime || defaultValidity.endTime;
  }

  try {
    return await callDeviceProxy({
      deviceId,
      endpoint: "AccessControl/UserInfo/Record",
      body: {
        UserInfo: {
          employeeNo: String(userId),
          name: fullName,
          userType: "normal",
          Valid: { enable: true, beginTime, endTime },
          doorRight: "1",
          RightPlan: [
            {
              doorNo: 1,
              planTemplateNo: "1"
            }
          ]
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
            Valid: { enable: true, beginTime, endTime },
            doorRight: "1",
            RightPlan: [
              {
                doorNo: 1,
                planTemplateNo: "1"
              }
            ]
          },
        },
      });
    }
    throw err;
  }
};

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


export const getDeviceFaceLibIndex = async (): Promise<string> => {
  return crypto.randomUUID().toUpperCase();
};

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
    
    if (e?.message && (e.message.includes("proxy error") || e.message.includes("face"))) {
      throw e;
    } else {
      throw new Error(e?.message || "Failed to register face on the device.");
    }
  }
};

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
    if (e?.message?.toLowerCase().includes("fetch failed") || e?.message?.toLowerCase().includes("device proxy error")) {
      throw new Error(`Device offline or unreachable: ${e.message}`);
    }
    return null; // Ignore API structural errors (notSupport)
  }
};

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

export const captureCard = async (deviceId: number) => {
  const attemptCapture = async (endpoint: string, method: "PUT" | "POST" | "DELETE" | "GET", body?: any) => {
    const options: any = { deviceId, endpoint, method };
    if (method !== "GET" && body !== undefined) {
      options.body = body;
    }
    return callDeviceProxy(options);
  };

  const formatHikTime = (date: Date) => date.toISOString().split('.')[0] + '+00:00';

  let lastError: any;

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

  try {
    return await attemptCapture(
      "AccessControl/CaptureCardInfo?format=json",
      "GET"
    );
  } catch (e: any) {
    lastError = e;
  }

  try {
    let devStartTimeStr = formatHikTime(new Date(Date.now() - 5000));
    try {
      const timeRes = await attemptCapture("System/time?format=json", "GET");
      if (timeRes?.Time?.localTime) {
        const devDate = new Date(timeRes.Time.localTime);
        devStartTimeStr = formatHikTime(new Date(devDate.getTime() - 5000));
      }
    } catch (e) {
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
      const cardEvent = events.find((ev: any) => ev.cardNo && ev.cardNo.trim() !== "" && ev.cardNo !== "0000000000");

      if (cardEvent) {
        return { cardNo: cardEvent.cardNo };
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    throw new Error("No card detected. If you tapped it and the device did not beep, this card frequency is incompatible.");
  } catch (e: any) {
    lastError = e;
  }

  throw lastError;
};

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
    return e?.subStatusCode === "invalidOperation" || e?.subStatusCode === "badRequest" || e?.message?.includes("400") || e?.message?.includes("415");
  };

  let lastError: any;

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

  try {
    return await attemptCapture({
      CaptureFingerPrintCond: { fingerNo },
    });
  } catch (e: any) {
    lastError = e;
    if (!isRetryable(e)) throw e;
  }

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

  if (lastError?.subStatusCode === "invalidOperation") {
    const errorMsg = "Device rejected capture. The fingerprint scanner might be disconnected, currently busy, or requires a device restart.";
    const enhancedError = new Error(errorMsg) as any;
    enhancedError.subStatusCode = lastError.subStatusCode;
    throw enhancedError;
  }

  throw lastError;
};

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


export const getDeviceInfo = async (deviceId: number) => {
  const result = await callDeviceProxy({
    deviceId,
    endpoint: "System/deviceInfo?format=json",
    method: "GET",
  });

  let deviceName = "Unknown Device";
  const rawXml = typeof result === "string" ? result : (result?.rawXml || "");
  
  if (rawXml) {
    const match = rawXml.match(/<[Dd]eviceName>(.*?)<\/[Dd]eviceName>/);
    if (match && match[1]) deviceName = match[1];
  } else if (result?.DeviceInfo) {
    deviceName = result.DeviceInfo.deviceName || result.DeviceInfo.DeviceName || "Unknown Device";
  }

  return { deviceName, raw: result };
};

/**
 * Configure the device to push HTTP events (scans) to our Next.js backend webhook.
 * Automatically parses the SaaS domain/IP from the provided URL, falling back to window location.
 */
export const configureDeviceWebhook = async (
  deviceId: number,
  customAppUrl?: string
) => {
  let defaultUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  if (typeof window !== "undefined" && window.location.origin) {
    defaultUrl = window.location.origin;
  }
  const appUrl = customAppUrl || defaultUrl;
  const urlObj = new URL(appUrl);
  
  const isHttps = urlObj.protocol === "https:";
  const portNo = urlObj.port ? parseInt(urlObj.port) : (isHttps ? 443 : 80);
  const host = urlObj.hostname;
  
  const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(host);
  const addressingType = isIp ? "ipaddress" : "hostname";
  const hostNode = isIp ? `<ipAddress>${host}</ipAddress>` : `<hostName>${host}</hostName>`;

  const xmlPayload = `
<HttpHostNotification version="2.0" xmlns="http://www.isapi.org/ver20/XMLSchema">
  <id>1</id>
  <url>/api/biometric/scan?deviceId=${deviceId}</url>
  <protocolType>${isHttps ? "HTTPS" : "HTTP"}</protocolType>
  <parameterFormatType>JSON</parameterFormatType>
  <addressingFormatType>${addressingType}</addressingFormatType>
  ${hostNode}
  <portNo>${portNo}</portNo>
  <userName>admin</userName>
  <httpAuthenticationMethod>none</httpAuthenticationMethod>
</HttpHostNotification>
  `.trim();

  return callDeviceProxy({
    deviceId,
    endpoint: "Event/notification/httpHosts/1",
    method: "PUT",
    body: xmlPayload,
  });
};
