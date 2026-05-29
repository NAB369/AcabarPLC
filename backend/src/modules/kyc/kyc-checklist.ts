/**
 * KYC Document Checklist
 *
 * Defines required documents per loan product type.
 * Used by KycService to validate completeness before
 * allowing a SUBMITTED → KYC_REVIEW transition.
 */

export interface DocumentRequirement {
  type: string;
  label: string;
  required: boolean;
}

export const KYC_CHECKLISTS: Record<string, DocumentRequirement[]> = {
  // Personal Loan
  'Personal Loan': [
    { type: 'NATIONAL_ID', label: 'National ID Card', required: true },
    { type: 'PASSPORT', label: 'Passport Scan', required: false },
    { type: 'FAMILY_BOOK', label: 'Family Book', required: false },
  ],

  // Salary Loan (common product name)
  'Salary Loan': [
    { type: 'NATIONAL_ID', label: 'National ID Card', required: true },
    { type: 'PASSPORT', label: 'Passport Scan', required: false },
    { type: 'FAMILY_BOOK', label: 'Family Book', required: false },
  ],

  // SME Business Loan
  'SME Business Loan': [
    { type: 'NATIONAL_ID', label: 'National ID Card', required: true },
    { type: 'PASSPORT', label: 'Passport Scan', required: false },
    {
      type: 'BUSINESS_DOC',
      label: 'Business Information / License',
      required: true,
    },
    { type: 'FAMILY_BOOK', label: 'Family Book', required: false },
  ],

  // Agriculture Loan
  'Agriculture Loan': [
    { type: 'NATIONAL_ID', label: 'National ID Card', required: true },
    { type: 'FAMILY_BOOK', label: 'Family Book', required: false },
    { type: 'PASSPORT', label: 'Passport Scan', required: false },
  ],

  // Micro Loan
  'Micro Loan': [
    { type: 'NATIONAL_ID', label: 'National ID Card', required: true },
    { type: 'FAMILY_BOOK', label: 'Family Book', required: false },
  ],
};

/**
 * Default checklist for unknown product types — no required docs,
 * so new product types don't block submission.
 */
export const DEFAULT_CHECKLIST: DocumentRequirement[] = [
  { type: 'NATIONAL_ID', label: 'National ID Card', required: false },
  { type: 'PASSPORT', label: 'Passport Scan', required: false },
  { type: 'FAMILY_BOOK', label: 'Family Book', required: false },
  {
    type: 'BUSINESS_DOC',
    label: 'Business Information / License',
    required: false,
  },
];

export function getChecklist(productName: string): DocumentRequirement[] {
  return KYC_CHECKLISTS[productName] || DEFAULT_CHECKLIST;
}
