const STATUS_BY_TEMPLATE = {
  congratulate: "Selected",
  verification: "Verification",
  regret: "Regret",
  pending: "Pending",
};

export function resolveAdmissionsSender(configuredSender) {
  return configuredSender || "Achievers Admissions <admissions@gkeliteinfo.com>";
}

export function resolveAchieversServiceKey(dedicatedKey, backendServiceKey) {
  return dedicatedKey || backendServiceKey;
}

export async function completeAdmissionsEmailSend({
  recipients,
  templateType,
  deliver,
  updateAjcStatus,
  updateCollegeStatus,
}) {
  const status = STATUS_BY_TEMPLATE[templateType];
  if (!status) {
    throw new Error("Unsupported admission email template.");
  }

  await deliver();

  const ajcApplicationNumbers = recipients
    .map((recipient) => recipient.applicationNumber)
    .filter((applicationNumber) =>
      typeof applicationNumber === "string" && applicationNumber.startsWith("AJC-"),
    );
  const collegeApplicationIds = recipients
    .filter(
      (recipient) =>
        typeof recipient.applicationNumber !== "string" ||
        !recipient.applicationNumber.startsWith("AJC-"),
    )
    .map((recipient) => recipient.applicationId)
    .filter((applicationId) => typeof applicationId === "number");

  if (ajcApplicationNumbers.length > 0) {
    await updateAjcStatus(ajcApplicationNumbers, status);
  }
  if (collegeApplicationIds.length > 0) {
    await updateCollegeStatus(collegeApplicationIds, status);
  }

  return { count: recipients.length, status };
}
