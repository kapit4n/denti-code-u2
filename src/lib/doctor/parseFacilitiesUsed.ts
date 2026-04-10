export function parseFacilityIdsFromApi(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const v = JSON.parse(value) as unknown;
    if (!Array.isArray(v)) return [];
    return v.filter((x): x is string => typeof x === 'string');
  } catch {
    return [];
  }
}
