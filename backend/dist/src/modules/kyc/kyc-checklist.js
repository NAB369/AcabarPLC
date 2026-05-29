"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CHECKLIST = exports.KYC_CHECKLISTS = void 0;
exports.getChecklist = getChecklist;
exports.KYC_CHECKLISTS = {
    'Personal Loan': [
        { type: 'NATIONAL_ID', label: 'National ID Card', required: true },
        { type: 'PASSPORT', label: 'Passport Scan', required: false },
        { type: 'FAMILY_BOOK', label: 'Family Book', required: false },
    ],
    'Salary Loan': [
        { type: 'NATIONAL_ID', label: 'National ID Card', required: true },
        { type: 'PASSPORT', label: 'Passport Scan', required: false },
        { type: 'FAMILY_BOOK', label: 'Family Book', required: false },
    ],
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
    'Agriculture Loan': [
        { type: 'NATIONAL_ID', label: 'National ID Card', required: true },
        { type: 'FAMILY_BOOK', label: 'Family Book', required: false },
        { type: 'PASSPORT', label: 'Passport Scan', required: false },
    ],
    'Micro Loan': [
        { type: 'NATIONAL_ID', label: 'National ID Card', required: true },
        { type: 'FAMILY_BOOK', label: 'Family Book', required: false },
    ],
};
exports.DEFAULT_CHECKLIST = [
    { type: 'NATIONAL_ID', label: 'National ID Card', required: false },
    { type: 'PASSPORT', label: 'Passport Scan', required: false },
    { type: 'FAMILY_BOOK', label: 'Family Book', required: false },
    {
        type: 'BUSINESS_DOC',
        label: 'Business Information / License',
        required: false,
    },
];
function getChecklist(productName) {
    return exports.KYC_CHECKLISTS[productName] || exports.DEFAULT_CHECKLIST;
}
//# sourceMappingURL=kyc-checklist.js.map