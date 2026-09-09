// Shared date formatting so the dashboard, runs list, and EV list all
// render dates the same way (and all treat stored dates as UTC-only,
// matching how they're stored as plain DATE columns).

export const FULL_DATE: Intl.DateTimeFormatOptions = {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
};

export const SHORT_DATE: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
};

export function formatDate(date: string | Date, opts: Intl.DateTimeFormatOptions = SHORT_DATE) {
  return new Date(date).toLocaleDateString("en-US", { timeZone: "UTC", ...opts });
}
