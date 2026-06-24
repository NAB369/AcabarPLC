'use client';

import React, { useEffect, useState, use } from 'react';
import { api } from '@/services/api';
import { Users, ArrowLeft, ShieldAlert, CheckCircle2, ChevronRight, Eye } from 'lucide-react';
import Link from 'next/link';

interface OfficerReport {
  officerId: string;
  officerName: string;
  officerEmail: string;
  totalLoans: number;
  totalVolume: number;
  overdueCount: number;
  riskBands: any;
}

export default function CreditOfficerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const officerId = resolvedParams.id;
  
  const [officer, setOfficer] = useState<OfficerReport | null>(null);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [reports, queue] = await Promise.all([
          api.get('/dashboard/reports/credit-officers'),
          api.get('/los/queue')
        ]);
        
        const foundOfficer = reports.find((r: OfficerReport) => r.officerId === officerId);
        setOfficer(foundOfficer || null);

        const assignedLoans = queue.filter((item: any) => item.loanOfficerId === officerId);
        setLoans(assignedLoans);
      } catch (error) {
        console.error('Failed to fetch officer details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [officerId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '400px' }}>
        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>
      </div>
    );
  }

  if (!officer) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Credit Officer not found</h2>
        <Link href="/admin/report/credit-officer" className="btn btn-secondary mt-4" style={{ display: 'inline-flex' }}>
          <ArrowLeft size={16} className="mr-2" /> Back to Portfolio
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <Link href="/admin/report/credit-officer" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', textDecoration: 'none', fontWeight: '500' }}>
          <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} /> Back
        </Link>
        <span style={{ color: 'var(--border-color)' }}>|</span>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Users size={24} color="var(--primary)" />
          {officer.officerName}
        </h1>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{officer.officerEmail}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--card-bg)' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted-dark)', fontWeight: '600', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Total Assigned Loans</div>
          <div style={{ fontSize: '2rem', fontWeight: '800' }}>{officer.totalLoans}</div>
        </div>
        <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--card-bg)' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted-dark)', fontWeight: '600', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Total Managed Volume</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>${(officer.totalVolume / 100).toLocaleString()}</div>
        </div>
        <div className="card" style={{ padding: '1.5rem', backgroundColor: officer.overdueCount > 0 ? 'var(--error-bg)' : 'var(--card-bg)' }}>
          <div style={{ fontSize: '0.8125rem', color: officer.overdueCount > 0 ? 'var(--error-text)' : 'var(--text-muted-dark)', fontWeight: '600', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Overdue Accounts</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: officer.overdueCount > 0 ? 'var(--error-text)' : 'var(--foreground)' }}>
            {officer.overdueCount}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--background)' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>Assigned Loan Applications</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date Assigned</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loans.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No loans assigned to this officer.
                  </td>
                </tr>
              ) : (
                loans.map((app) => (
                  <tr key={app.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '600' }}>#{app.lid || app.id.substring(0, 6).toUpperCase()}</td>
                    <td style={{ fontWeight: '700', fontSize: '0.875rem' }}>{app.customer?.firstName} {app.customer?.lastName}</td>
                    <td style={{ fontWeight: '700', color: 'var(--primary)' }}>${Number(app.principalAmount).toLocaleString()}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-muted-dark)' }}>{app.status}</span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <Link href={`/admin/los/${app.id}`} style={{ textDecoration: 'none' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                          <Eye size={14} /> View
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
