/**
 * Where “My profile / account” should go for the current session roles.
 * Order matters when a user has multiple roles (staff before patient).
 */
export function profileHrefForRoles(roles: string[] | undefined): string {
  const r = roles ?? [];
  if (r.includes('ADMIN')) return '/admin/profile';
  if (r.includes('DOCTOR')) return '/doctor/profile';
  if (r.includes('PATIENT')) return '/patient/profile';
  return '/patient/profile';
}
