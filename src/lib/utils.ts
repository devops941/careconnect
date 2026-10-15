import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  const maskedName =
    name.length > 2
      ? `${name[0]}${"*".repeat(name.length - 2)}${name[name.length - 1]}`
      : `${name[0]}*`;
  return `${maskedName}@${domain}`;
}
