'use client';

import React, { Suspense } from 'react';
import LoanApplicationForm from '../../../../features/loans/components/LoanApplicationForm';

export default function NewLoanPage() {
  return (
    <div style={{ width: '100%', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--foreground)', margin: 0, lineHeight: 1.2 }}>New Application</h1>
        <p style={{ color: 'var(--text-muted)', margin: 0, marginTop: '0.375rem', fontSize: '0.875rem' }}>Create a new loan application and generate the repayment schedule.</p>
      </div>

      <Suspense fallback={<div>Loading form...</div>}>
        <LoanApplicationForm />
      </Suspense>
    </div>
  );
}
