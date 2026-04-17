export function formatChatDateTime(dateString: string) {
  const date = new Date(dateString);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const inputDateOnly = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const time = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  if (inputDateOnly.getTime() === today.getTime()) {
    return `Today ${time}`;
  }
  if (inputDateOnly.getTime() === yesterday.getTime()) {
    return `Yesterday ${time}`;
  }
  const formattedDate = date.toLocaleDateString("en-GB");
  return `${formattedDate} ${time}`;
}