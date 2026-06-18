import { getBiometricValidity } from "./biometricValidity";

export const registerUserToHikvision = async (userId: number, fullName: string, role?: string, educationType?: string | null) => {
  const { beginTime, endTime } = getBiometricValidity(role, educationType);
  const payload = {
    UserInfo: [
      {
        employeeNo: String(userId),
        name: fullName,
        Valid: {
          beginTime,
          endTime,
        },
      },
    ],
  };

  const response = await fetch("/api/biometric/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Biometric registration failed: ${JSON.stringify(data)}`);
  }

  return data;
};