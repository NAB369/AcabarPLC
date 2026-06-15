'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Users, PieChart, ShieldAlert, BarChart3, Briefcase, ChevronRight, Printer, Search } from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface OfficerReport {
  officerId: string;
  officerName: string;
  officerEmail: string;
  totalLoans: number;
  totalVolume: number;
  overdueCount: number;
  riskBands: {
    A: number;
    B: number;
    C: number;
    D: number;
    Unscored: number;
  };
}

export default function CreditOfficerReportPage() {
  const [reports, setReports] = useState<OfficerReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await api.get('/dashboard/reports/credit-officers');
        setReports(data || []);
      } catch (error) {
        console.error('Failed to fetch officer reports', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '400px' }}>
        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>
      </div>
    );
  }

  const sortedReports = [...reports].sort((a, b) => b.totalVolume - a.totalVolume);

  const filteredReports = sortedReports.filter(report => 
    report.officerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    report.officerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .card { border: 1px solid #e5e7eb; box-shadow: none; break-inside: avoid; margin-bottom: 20px; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Users size={32} color="var(--primary)" />
            Credit Officer <span className="text-gradient">Portfolio</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Monitor performance and loan distribution across your underwriting team.</p>
        </div>
        <button className="btn btn-secondary no-print" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Printer size={18} /> Print Report
        </button>
      </div>

      {sortedReports.length > 0 && (
        <div className="card" style={{ marginBottom: '2.5rem', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={18} color="var(--primary)" /> Portfolio Volume Comparison
          </h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedReports} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="officerName" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(val) => '$' + (val/100).toLocaleString()} stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }} 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                  formatter={(val: any) => ['$' + ((Number(val) || 0)/100).toLocaleString(), 'Total Volume']} 
                />
                <Bar dataKey="totalVolume" radius={[4, 4, 0, 0]}>
                  {sortedReports.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--primary)' : 'var(--primary-light)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.9375rem', fontWeight: '600' }}>
            {filteredReports.length} Credit Officer{filteredReports.length !== 1 ? 's' : ''}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={15} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '0.5rem 0.875rem 0.5rem 2.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.8125rem', width: '280px', outline: 'none', transition: 'all var(--transition-fast)', backgroundColor: 'var(--background)' }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; e.target.style.backgroundColor = 'var(--card-bg)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = 'var(--background)'; }}
              />
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Credit Officer</th>
                <th>Total Loans</th>
                <th>Total Volume</th>
                <th>Risk Distribution (A/B/C/D/U)</th>
                <th>Overdue</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.officerId} style={{ transition: 'background-color 0.2s', cursor: 'default' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td>
                    <div style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--foreground)' }}>
                      {report.officerName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{report.officerEmail}</div>
                  </td>
                  <td style={{ fontWeight: '600' }}>{report.totalLoans}</td>
                  <td style={{ fontWeight: '700', color: 'var(--primary)' }}>${(report.totalVolume / 100).toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', fontWeight: '600' }}>
                      <span style={{ color: 'var(--success-text)' }}>{report.riskBands.A || 0}</span>/
                      <span style={{ color: 'var(--success-text)' }}>{report.riskBands.B || 0}</span>/
                      <span style={{ color: 'var(--warning-text)' }}>{report.riskBands.C || 0}</span>/
                      <span style={{ color: 'var(--error-text)' }}>{report.riskBands.D || 0}</span>/
                      <span style={{ color: 'var(--text-muted)' }}>{report.riskBands.Unscored || 0}</span>
                    </div>
                    <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', marginTop: '0.5rem', width: '120px', backgroundColor: 'var(--bg-muted)' }}>
                      {report.riskBands.A > 0 && <div style={{ flex: report.riskBands.A, backgroundColor: 'var(--success-text)', opacity: 0.9 }}></div>}
                      {report.riskBands.B > 0 && <div style={{ flex: report.riskBands.B, backgroundColor: 'var(--success-bg)', border: '1px solid var(--success-text)' }}></div>}
                      {report.riskBands.C > 0 && <div style={{ flex: report.riskBands.C, backgroundColor: 'var(--warning-text)', opacity: 0.9 }}></div>}
                      {report.riskBands.D > 0 && <div style={{ flex: report.riskBands.D, backgroundColor: 'var(--error-text)', opacity: 0.9 }}></div>}
                      {report.riskBands.Unscored > 0 && <div style={{ flex: report.riskBands.Unscored, backgroundColor: 'var(--text-muted-dark)' }}></div>}
                    </div>
                  </td>
                  <td>
                    {report.overdueCount > 0 ? (
                      <span className="badge badge-rejected" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <ShieldAlert size={12} /> {report.overdueCount}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>None</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link href={`/admin/report/credit-officer/${report.officerId}`} style={{ textDecoration: 'none' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }} onClick={(e) => e.stopPropagation()}>
                        View Details <ChevronRight size={14} />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredReports.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No officers match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
