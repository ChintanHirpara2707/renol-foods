export interface FAQItem {
  id: string;
  category: "Ordering" | "Product Specs" | "Logistics & Export" | "Packaging";
  question: string;
  answer: string;
  isPlaceholder?: boolean;
}

export const faqs: FAQItem[] = [
  {
    id: "faq-moq",
    category: "Ordering",
    question: "What is the Minimum Order Quantity (MOQ) for production batches?",
    answer:
      "Our standard minimum order quantity is [ADD: confirm answer with Renol - e.g. 100 kg per product or 500 kg for custom runs]. Trial batch quantities may be evaluated upon request with our sales desk.",
    isPlaceholder: true,
  },
  {
    id: "faq-shelf-life",
    category: "Product Specs",
    question: "What is the expected shelf life of Renol food powders?",
    answer:
      "Commercial shelf life is [ADD: confirm answer with Renol - e.g. 12 to 24 months] from manufacture date when stored in unopened original packaging under recommended conditions.",
    isPlaceholder: true,
  },
  {
    id: "faq-storage",
    category: "Product Specs",
    question: "What storage conditions are recommended for food powders?",
    answer:
      "Powders should be stored in a cool, dry area below [ADD: confirm answer with Renol - e.g. 22°C - 25°C] with controlled humidity. Bags should be securely re-sealed after opening to prevent moisture uptake.",
    isPlaceholder: true,
  },
  {
    id: "faq-lead-time",
    category: "Logistics & Export",
    question: "What is the typical dispatch lead time for domestic and export orders?",
    answer:
      "Lead times depend on quantity and production schedule: [ADD: confirm answer with Renol - e.g. 3 to 5 business days for ready stock, or 2 to 3 weeks for planned production runs].",
    isPlaceholder: true,
  },
  {
    id: "faq-custom-blends",
    category: "Product Specs",
    question: "Can Renol adjust particle size (mesh) or provide custom formulations?",
    answer:
      "Particle size specifications and custom formulation requirements can be evaluated based on volume. [ADD: confirm answer with Renol on custom batch volume thresholds].",
    isPlaceholder: true,
  },
  {
    id: "faq-export-docs",
    category: "Logistics & Export",
    question: "What documentation is provided with shipments?",
    answer:
      "Standard commercial shipping documents are provided. Additional technical or export documentation depends on destination requirements: [ADD: confirm answer with Renol - e.g. Certificate of Analysis, Certificate of Origin, Phytosanitary certificates if applicable].",
    isPlaceholder: true,
  },
  {
    id: "faq-packaging",
    category: "Packaging",
    question: "What are your standard industrial packaging options?",
    answer:
      "Default packaging options include [ADD: confirm answer with Renol - e.g. 20 kg or 25 kg poly-lined kraft bags or fiber drums]. Custom packaging options may be discussed upon inquiry.",
    isPlaceholder: true,
  },
];

/** FAQ entries whose answers are confirmed; placeholders never reach public pages. */
export const publicFaqs: FAQItem[] = faqs.filter(
  (f) => !f.isPlaceholder && !/\[(ADD|CONFIRM)/i.test(f.answer),
);
