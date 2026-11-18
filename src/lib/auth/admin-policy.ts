export interface AdminCandidate {
  id?: string;
  email?: string | null;
  emailConfirmedAt?: string | null;
}

export interface AdminPolicy {
  email: string;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLocaleLowerCase("es");
}

export function isAdminUser(
  user: AdminCandidate | null | undefined,
  policy: AdminPolicy | null
): boolean {
  if (!user?.email || !policy?.email) {
    return false;
  }
  if (!user.emailConfirmedAt) {
    return false;
  }

  return normalizeEmail(user.email) === normalizeEmail(policy.email);
}
