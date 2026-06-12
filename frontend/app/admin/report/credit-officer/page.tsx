'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Users, PieChart, ShieldAlert, BarChart3, Briefcase, ChevronRight, Printer } from 'lucide-react';
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
                  formatter={(val: number) => ['$' + (val/100).toLocaleString(), 'Total Volume']} 
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
        {sortedReports.map((report) => (
          <div key={report.officerId} className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--card-bg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: '800', fontSize: '1.25rem' }}>
                  {report.officerName.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '800', margin: 0 }}>{report.officerName}</h3>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{report.officerEmail}</div>
                </div>
              </div>
            </div>

            <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ backgroundColor: 'var(--background)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Briefcase size={14} /> Total Loans
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{report.totalLoans}</div>
              </div>
              <div style={{ backgroundColor: 'var(--background)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BarChart3 size={14} /> Total Volume
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>
                  ${(report.totalVolume / 100).toLocaleString()}
                </div>
              </div>
            </div>

            <div style={{ padding: '0 1.5rem 1.5rem' }}>
               <h4 style={{ fontSize: '0.875rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <PieChart size={16} /> Risk Distribution
               </h4>
               <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                 <div style={{ flex: report.riskBands.A || 0.1, backgroundColor: 'var(--success-text)', opacity: 0.9 }}></div>
                 <div style={{ flex: report.riskBands.B || 0.1, backgroundColor: 'var(--success-bg)', border: '1px solid var(--success-text)' }}></div>
                 <div style={{ flex: report.riskBands.C || 0.1, backgroundColor: 'var(--warning-text)', opacity: 0.9 }}></div>
                 <div style={{ flex: report.riskBands.D || 0.1, backgroundColor: 'var(--error-text)', opacity: 0.9 }}></div>
                 <div style={{ flex: report.riskBands.Unscored || 0.1, backgroundColor: 'var(--text-muted-dark)' }}></div>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                 <span>A: {report.riskBands.A}</span>
                 <span>B: {report.riskBands.B}</span>
                 <span>C: {report.riskBands.C}</span>
                 <span>D: {report.riskBands.D}</span>
                 <span>Unscored: {report.riskBands.Unscored}</span>
               </div>
            </div>

            {report.overdueCount > 0 && (
              <div style={{ padding: '1rem 1.5rem', backgroundColor: 'var(--error-bg)', borderTop: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--error-text)' }}>
                <ShieldAlert size={18} />
                <span style={{ fontSize: '0.875rem', fontWeight: '700' }}>{report.overdueCount} Overdue Account(s)</span>
              </div>
            )}
            
          </div>
        ))}

        {reports.length === 0 && !loading && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', backgroundColor: 'var(--card-bg)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
            <Briefcase size={48} color="var(--text-muted)" style={{ margin: '0 auto 1.5rem', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem' }}>No Data Available</h3>
            <p style={{ color: 'var(--text-muted)' }}>Loans have not been assigned to Credit Officers yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
