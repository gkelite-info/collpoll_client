export const registerUserToHikvision = async (userId: number, fullName: string) => {
  const payload = {
    UserInfo: [
      {
        employeeNo: String(userId),
        name: fullName,
        Valid: {
          beginTime: "2026-01-01T00:00:00",
          endTime: "2027-12-31T23:59:59",
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