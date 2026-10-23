import { isPublic } from "./public";

/**
 * Licences and certifications. The text badges are always shown (LicenceBadges); the number or
 * certificate is "[ADD]" until the client supplies it and is shown only when it is not a placeholder.
 */
export interface Licence {
  id: string;
  name: string;
  /** Text badge. No official logos until the client supplies them. */
  label: string;
  /** Licence or certificate number. */
  number: string;
}

export const licences: Licence[] = [
  { id: "fssai", name: "FSSAI", label: "FSSAI Licensed", number: "[ADD]" },
  { id: "iso-22000", name: "ISO 22000:2018", label: "ISO 22000:2018 Certified", number: "[ADD]" },
];

export const publicLicences: Licence[] = licences.filter((l) => isPublic(l.number));
