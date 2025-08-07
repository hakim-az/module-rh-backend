export function countBusinessDays(startDate: Date, endDate: Date): number {
  const holidays = new Set([
    "2025-01-01",
    "2025-04-21",
    "2025-05-01",
    "2025-05-08",
    "2025-05-29",
    "2025-06-09",
    "2025-07-14",
    "2025-08-15",
    "2025-11-01",
    "2025-11-11",
    "2025-12-25",
  ]);

  let count = 0;
  const current = new Date(startDate);

  while (current <= endDate) {
    const day = current.getDay();
    const iso = current.toISOString().split("T")[0];

    // Exclude Saturday (6), Sunday (0), and holidays
    if (day !== 0 && day !== 6 && !holidays.has(iso)) {
      count++;
    }

    // Move to next day
    current.setDate(current.getDate() + 1);
  }

  return count;
}
