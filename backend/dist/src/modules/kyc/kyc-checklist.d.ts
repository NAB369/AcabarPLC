export interface DocumentRequirement {
    type: string;
    label: string;
    required: boolean;
}
export declare const KYC_CHECKLISTS: Record<string, DocumentRequirement[]>;
export declare const DEFAULT_CHECKLIST: DocumentRequirement[];
export declare function getChecklist(productName: string): DocumentRequirement[];
