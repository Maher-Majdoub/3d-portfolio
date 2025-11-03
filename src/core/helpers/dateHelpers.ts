export function formatDateTime(dateTime: Date = new Date()): string {
  const day = dateTime.toLocaleDateString("en-US", { weekday: "short" });
  const date = dateTime.getDate();
  const month = dateTime.toLocaleDateString("en-US", { month: "short" });
  const time = dateTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${day} ${date} ${month} ${time}`;
}
