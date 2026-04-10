/** Maps auth API role codes to i18n keys under `admin.roles.*`. */
const ROLE_I18N_KEY: Record<string, string> = {
  ADMIN: 'admin.roles.ADMIN',
  DOCTOR: 'admin.roles.DOCTOR',
  PATIENT: 'admin.roles.PATIENT',
};

export function formatAuthRolesLabel(
  t: (key: string) => string,
  roles: string[] | undefined,
): string {
  if (!roles?.length) return '';
  return roles.map((r) => (ROLE_I18N_KEY[r] ? t(ROLE_I18N_KEY[r]) : r)).join(', ');
}
