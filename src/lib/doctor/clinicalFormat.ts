/** Format stored DOB strings for display in doctor-facing UI */
export function formatDobDisplay(
  raw: string | undefined | null,
  intlLocale = 'en-US',
): string {
  if (!raw) return '—';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString(intlLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
