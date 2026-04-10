import type { TreatmentFacilityDto } from '@/types';

export type TreatmentFacilityUiGroup = {
  groupKey: string;
  ids: string[];
};

const CATEGORY_ORDER: readonly string[] = [
  'anesthesia',
  'ppe',
  'isolation',
  'power_equipment',
  'hand_instruments',
  'imaging',
  'restorative',
];

/**
 * Groups clinic-provider rows for the visit form. Returns null if the list is empty.
 */
export function buildTreatmentFacilityGroupsFromApi(
  rows: TreatmentFacilityDto[] | undefined,
): TreatmentFacilityUiGroup[] | null {
  if (!rows?.length) return null;

  const byCat = new Map<string, TreatmentFacilityDto[]>();
  for (const r of rows) {
    if (r.IsActive === false) continue;
    const list = byCat.get(r.CategoryKey) ?? [];
    list.push(r);
    byCat.set(r.CategoryKey, list);
  }

  const rank = (k: string) => {
    const i = CATEGORY_ORDER.indexOf(k);
    return i === -1 ? 999 : i;
  };

  const keys = Array.from(byCat.keys()).sort(
    (a, b) => rank(a) - rank(b) || a.localeCompare(b, undefined, { sensitivity: 'base' }),
  );

  return keys.map((categoryKey) => {
    const items = (byCat.get(categoryKey) ?? []).sort(
      (a, b) =>
        a.SortOrder - b.SortOrder ||
        a.FacilityCode.localeCompare(b.FacilityCode, undefined, { sensitivity: 'base' }),
    );
    return {
      groupKey: `doctor.facilitiesCatalog.groups.${categoryKey}`,
      ids: items.map((x) => x.FacilityCode),
    };
  });
}
