export const getBiometricValidity = (role?: string, educationType?: string | null) => {
  const now = new Date();
  
  const pad = (n: number) => n.toString().padStart(2, '0');
  const beginTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  
  let endYear = now.getFullYear() + 20; // Default fallback for staff/others

  const userRole = role?.toLowerCase() || '';

  if (userRole === "student" && educationType) {
    const edu = educationType.toLowerCase();
    if (edu.includes("b.tech")) endYear = now.getFullYear() + 6;
    else if (edu.includes("mba")) endYear = now.getFullYear() + 4;
    else if (edu.includes("m.tech")) endYear = now.getFullYear() + 4;
    else if (edu.includes("degree")) endYear = now.getFullYear() + 5;
    else if (edu.includes("diploma")) endYear = now.getFullYear() + 5;
    else if (edu.includes("inter")) endYear = now.getFullYear() + 4;
    else endYear = now.getFullYear() + 6; // default fallback for student
  } else if (userRole === "parent") {
    endYear = now.getFullYear() + 6; // parents get 6 years just like btech
  }

  // Hikvision 32-bit embedded systems have a Y2K38 limit (Max year 2037)
  if (endYear > 2037) {
    endYear = 2037;
  }

  const endTime = `${endYear}-12-31T23:59:59`;
  return { beginTime, endTime };
};
