'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { TrendingUp, TrendingDown, DollarSign, RefreshCw, Calendar, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProfitLossPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(yearStart);
  const [endDate, setEndDate] = useState(today);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const d = await api.get(`/accounting/reports/profit-loss?startDate=${startDate}&endDate=${endDate}`);
      setData(d);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReport(); }, []);

  const fmt = (v: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v || 0);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/admin/accounting" className="hover:text-blue-700 transition-colors" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)', fontWeight: '600', fontSize: '0.875rem', textDecoration: 'none' }}>
          <ChevronLeft size={16} /> Back to Accounting Hub
        </Link>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.03em', margin: 0 }}>
            Profit & <span className="text-gradient">Loss</span> Statement
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.9rem' }}>Income versus expenses for the selected period</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Calendar size={16} color="var(--text-muted)" />
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: '0.5rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }} />
            <span style={{ color: 'var(--text-muted)' }}>to</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ padding: '0.5rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }} />
          </div>
          <button onClick={fetchReport} disabled={loading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem' }}>
            <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Apply
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="card" style={{ padding: '1.5rem 2rem', borderLeft: '4px solid #16a34a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <TrendingUp size={20} color="#16a34a" />
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Revenue</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#16a34a' }}>${fmt(data.totalRevenue)}</div>
            </div>
            <div className="card" style={{ padding: '1.5rem 2rem', borderLeft: '4px solid #e11d48' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <TrendingDown size={20} color="#e11d48" />
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Expenses</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#e11d48' }}>${fmt(data.totalExpenses)}</div>
            </div>
            <div className="card" style={{ padding: '1.5rem 2rem', borderLeft: `4px solid ${data.netIncome >= 0 ? '#2563eb' : '#e11d48'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <DollarSign size={20} color={data.netIncome >= 0 ? '#2563eb' : '#e11d48'} />
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net {data.netIncome >= 0 ? 'Income' : 'Loss'}</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: data.netIncome >= 0 ? '#2563eb' : '#e11d48' }}>{data.netIncome < 0 ? '-' : ''}${fmt(Math.abs(data.netIncome))}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Revenue */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <TrendingUp size={18} color="#16a34a" />
                <h3 style={{ margin: 0, fontWeight: '800', color: '#15803d' }}>Revenue Accounts</h3>
              </div>
              <table className="data-table">
                <thead><tr><th>Code</th><th>Account Name</th><th style={{ textAlign: 'right' }}>Balance</th></tr></thead>
                <tbody>
                  {data.revenue?.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No revenue recorded</td></tr>}
                  {data.revenue?.map((r: any) => (
                    <tr key={r.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: '700', color: '#9333ea' }}>{r.code}</td>
                      <td>{r.name}</td>
                      <td style={{ textAlign: 'right', fontWeight: '700', color: '#16a34a' }}>${fmt(r.balance)}</td>
                    </tr>
                  ))}
                  <tr style={{ backgroundColor: '#f0fdf4', fontWeight: '800', borderTop: '2px solid var(--border-color)' }}>
                    <td colSpan={2} style={{ padding: '0.875rem 1rem' }}>TOTAL REVENUE</td>
                    <td style={{ textAlign: 'right', padding: '0.875rem 1rem', color: '#16a34a', fontSize: '1rem' }}>${fmt(data.totalRevenue)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Expenses */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: '#fff1f2', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <TrendingDown size={18} color="#e11d48" />
                <h3 style={{ margin: 0, fontWeight: '800', color: '#be123c' }}>Expense Accounts</h3>
              </div>
              <table className="data-table">
                <thead><tr><th>Code</th><th>Account Name</th><th style={{ textAlign: 'right' }}>Balance</th></tr></thead>
                <tbody>
                  {data.expenses?.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No expenses recorded</td></tr>}
                  {data.expenses?.map((e: any) => (
                    <tr key={e.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: '700', color: '#e11d48' }}>{e.code}</td>
                      <td>{e.name}</td>
                      <td style={{ textAlign: 'right', fontWeight: '700', color: '#e11d48' }}>${fmt(e.balance)}</td>
                    </tr>
                  ))}
                  <tr style={{ backgroundColor: '#fff1f2', fontWeight: '800', borderTop: '2px solid var(--border-color)' }}>
                    <td colSpan={2} style={{ padding: '0.875rem 1rem' }}>TOTAL EXPENSES</td>
                    <td style={{ textAlign: 'right', padding: '0.875rem 1rem', color: '#e11d48', fontSize: '1rem' }}>${fmt(data.totalExpenses)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Net Income Line */}
          <div className="card" style={{ marginTop: '1.5rem', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: data.netIncome >= 0 ? '#eff6ff' : '#fff1f2', border: `1px solid ${data.netIncome >= 0 ? '#bfdbfe' : '#fecdd3'}` }}>
            <div style={{ fontWeight: '800', fontSize: '1.125rem', color: data.netIncome >= 0 ? '#1d4ed8' : '#be123c' }}>
              {data.netIncome >= 0 ? '✅ Net Income (Profit)' : '❌ Net Loss'}
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: data.netIncome >= 0 ? '#1d4ed8' : '#be123c' }}>
              {data.netIncome < 0 ? '(' : ''} ${fmt(Math.abs(data.netIncome))} {data.netIncome < 0 ? ')' : ''}
            </div>
          </div>
        </>
      )}

      {loading && <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Generating report...</div>}
      <style dangerouslySetInnerHTML={{ __html: `@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }` }} />
    </div>
  );
}
