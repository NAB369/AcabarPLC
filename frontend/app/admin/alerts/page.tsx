'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Calendar, Phone, CheckCircle, Clock } from 'lucide-react';

interface Alert {
  id: string;
  type: string;
  message: string;
  status: string;
  targetDate: string;
  createdAt: string;
  loan: { lid: string; principalAmount: number; currency: string };
  customer: { firstName: string; lastName: string; phone: string };
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const data = await api.get('/alerts');
      setAlerts(data);
    } catch (err) {
      console.error('Failed to load alerts', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkContacted = async (id: string) => {
    try {
      await api.patch(`/alerts/${id}/status`, { status: 'CONTACTED' });
      fetchAlerts();
    } catch (err) {
      console.error('Failed to update alert', err);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--foreground)', margin: 0, lineHeight: 1.2 }}>Repayment Reminders</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, marginTop: '0.375rem', fontSize: '0.875rem' }}>View upcoming repayments that require a client reminder.</p>
        </div>
      </div>

      <div className="card animate-fade-in" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Date Due</th>
              <th>Customer</th>
              <th>Loan ID</th>
              <th>Message</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Loading alerts...</td></tr>
            ) : alerts.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No pending alerts</td></tr>
            ) : (
              alerts.map(a => (
                <tr key={a.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: '500' }}>
                      <Calendar size={14} color="var(--primary)" />
                      {new Date(a.targetDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{a.customer.firstName} {a.customer.lastName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Phone size={10} /> {a.customer.phone}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '500', fontFamily: 'monospace', color: 'var(--primary)' }}>{a.loan.lid}</div>
                  </td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{a.message}</td>
                  <td>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      backgroundColor: a.status === 'PENDING' ? '#fef3c7' : '#dcfce7',
                      color: a.status === 'PENDING' ? '#92400e' : '#166534',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      {a.status === 'PENDING' ? <Clock size={12} /> : <CheckCircle size={12} />}
                      {a.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {a.status === 'PENDING' && (
                      <button
                        className="btn btn-primary"
                        style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', height: 'auto' }}
                        onClick={() => handleMarkContacted(a.id)}
                      >
                        Mark Contacted
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
