interface NamedUser {
  email: string;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
}

/** «Имя Фамилия» → name → email */
export function userDisplayName(u: NamedUser): string {
  const full = [u.first_name, u.last_name].filter(Boolean).join(' ');
  return full || u.name || u.email;
}

/** Инициалы для аватара: «ИФ» или первая буква email */
export function userInitials(u: NamedUser): string {
  const parts = [u.first_name, u.last_name].filter(Boolean) as string[];
  if (parts.length)
    return parts
      .map((p) => p[0])
      .join('')
      .toUpperCase();
  return (u.name || u.email).slice(0, 1).toUpperCase();
}
