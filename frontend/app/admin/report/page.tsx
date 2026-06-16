'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';

export default function ReportPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await api.get('/dashboard/reports/recent-payments');
        setPayments(data);
      } catch (err) {
        console.error('Failed to fetch payments', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  return (
    <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.03em', margin: 0 }}>Reports</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>Recent Payments & Revenue</p>
        </div>
      </div>
      
      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem' }}>Recent Payment Ledger Entries</h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
        ) : payments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No recent payments found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Date</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Reference</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Customer</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Loan ID</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'right' }}>Total Collected</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'right' }}>Principal</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'right' }}>Interest (Rev)</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'right' }}>Penalty (Rev)</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => (
                  <tr key={payment.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem' }}>{new Date(payment.date).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>{payment.reference}</td>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{payment.customerName}</td>
                    <td style={{ padding: '1rem', color: 'var(--primary-color)' }}>{payment.loanId}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>${payment.amount.toFixed(2)}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-muted)' }}>${payment.principal.toFixed(2)}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--success-text)' }}>${payment.interest.toFixed(2)}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--warning-text)' }}>${payment.penalty.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
