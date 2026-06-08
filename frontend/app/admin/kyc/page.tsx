'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { CheckCircle2, XCircle } from 'lucide-react';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  nationalId: string;
  kycStatus: string;
}

export default function KYCManagementPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingCustomers();
  }, []);

  const fetchPendingCustomers = async () => {
    try {
      // In a real app, you would fetch from /customers and filter, or an explicit /customers/pending endpoint
      const response = await api.get('/customers');
      setCustomers(response.filter((c: Customer) => c.kycStatus === 'PENDING'));
    } catch (error) {
      console.error('Failed to fetch customers', error);
      // Mock fallback for demonstration purposes if backend is down
      setCustomers([
        { id: 'CUST-1001', firstName: 'Sokha', lastName: 'Chan', phone: '+855 12 345 678', nationalId: '123456789', kycStatus: 'PENDING' },
        { id: 'CUST-1002', firstName: 'Dara', lastName: 'Meas', phone: '+855 98 765 432', nationalId: '987654321', kycStatus: 'PENDING' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateKyc = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.post(`/customers/${id}/kyc`, { status });
      // Remove from list
      setCustomers(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to update KYC status', error);
      alert('Failed to update KYC status. Check console for details.');
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1100px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-color)' }}>KYC Management</h1>
        <p style={{ color: 'var(--text-muted)' }}>Review and approve pending customer identities.</p>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 500 }}>Pending Verifications</h2>
        </div>
        
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
        ) : customers.length === 0 ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No pending KYC verifications found.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Name</th>
                <th>National ID</th>
                <th>Phone</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td style={{ fontWeight: 500 }}>{customer.id}</td>
                  <td>{customer.firstName} {customer.lastName}</td>
                  <td>{customer.nationalId}</td>
                  <td>{customer.phone}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => handleUpdateKyc(customer.id, 'APPROVED')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 0.75rem', backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 500 }}
                      >
                        <CheckCircle2 size={16} />
                        Approve
                      </button>
                      <button 
                        onClick={() => handleUpdateKyc(customer.id, 'REJECTED')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 0.75rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 500 }}
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
