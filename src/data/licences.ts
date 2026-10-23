import { isPublic } from "./public";

/**
 * Licences and certifications. Numbers are "[ADD]" until the client supplies them; nothing is
 * shown publicly for an entry without a confirmed number (use publicLicences).
 */
export interface Licence {
  id: string;
  name: string;
  /** Licence or certificate number. */
  number: string;
}

export const licences: Licence[] = [
  { id: "fssai", name: "FSSAI", number: "[ADD]" },
  { id: "iso-22000", name: "ISO 22000:2018", number: "[ADD]" },
];

export const publicLicences: Licence[] = licences.filter((l) => isPublic(l.number));
