export interface ProcessStep {
  stepNumber: number;
  id: string;
  title: string;
  subtitle: string;
  description: string;
  keyControlPoint: string;
}

export const manufacturingProcess: ProcessStep[] = [
  {
    stepNumber: 1,
    id: "sourcing",
    title: "Sourcing",
    subtitle: "Raw Material Selection",
    description:
      "Selection of sound fruits, vegetables, and botanical raw materials with appropriate maturity and dry solids content.",
    keyControlPoint: "Visual inspection and physical grading of incoming produce.",
  },
  {
    stepNumber: 2,
    id: "washing",
    title: "Washing",
    subtitle: "Surface Cleaning",
    description:
      "Thorough washing and rinsing to remove field dust, surface soil, and foreign matter from incoming raw material.",
    keyControlPoint: "Water washing cycles tailored to produce skin and texture.",
  },
  {
    stepNumber: 3,
    id: "extraction",
    title: "Extraction",
    subtitle: "Pulping & Crushing",
    description:
      "Mechanical pulping, crushing, or pressing of prepared fruits and vegetables to obtain juice, puree, or slurry for drying.",
    keyControlPoint: "Separation of seeds, skins, and insoluble fiber where required.",
  },
  {
    stepNumber: 4,
    id: "spray-drying",
    title: "Spray Drying",
    subtitle: "Moisture Evaporation",
    description:
      "Atomization of liquid feed into a heated drying chamber, evaporating water to form fine dry powder particles.",
    keyControlPoint: "Controlled drying air temperatures to safeguard powder consistency.",
  },
  {
    stepNumber: 5,
    id: "quality-testing",
    title: "Quality Testing",
    subtitle: "Parameter Evaluation",
    description:
      "Standard quality checks covering moisture, particle size, bulk density, and organoleptic characteristics.",
    keyControlPoint: "Verification against target product specifications before dispatch.",
  },
  {
    stepNumber: 6,
    id: "packing",
    title: "Packing",
    subtitle: "Protective Packaging",
    description:
      "Filling into food-grade bags or containers to protect powder from ambient humidity during storage and transport.",
    keyControlPoint: "Sealed packaging with batch labeling for product traceability.",
  },
];
