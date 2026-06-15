'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { RefreshCw, Building2, Scale, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function BalanceSheetPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try { const d = await api.get('/accounting/reports/balance-sheet'); setData(d); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const fmt = (v: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v || 0);

  const Section = ({ title, accounts, total, color, bg }: any) => (
    <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.5rem' }}>
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: bg, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontWeight: '800', color, fontSize: '1rem' }}>{title}</h3>
        <span style={{ fontWeight: '800', color, fontSize: '1rem' }}>${fmt(total)}</span>
      </div>
      <table className="data-table">
        <tbody>
          {accounts?.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>No entries</td></tr>}
          {accounts?.map((a: any) => (
            <tr key={a.id}>
              <td style={{ fontFamily: 'monospace', fontWeight: '700', width: '80px', color }}>{a.code}</td>
              <td>{a.name}{a.nameKh && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>({a.nameKh})</span>}</td>
              <td style={{ textAlign: 'right', fontWeight: '700', color }}>${fmt(a.balance)}</td>
            </tr>
          ))}
          <tr style={{ backgroundColor: bg, fontWeight: '800', borderTop: '2px solid var(--border-color)' }}>
            <td colSpan={2} style={{ padding: '0.875rem 1rem', color }}>TOTAL {title.toUpperCase()}</td>
            <td style={{ textAlign: 'right', padding: '0.875rem 1rem', color, fontSize: '1rem' }}>${fmt(total)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const isBalanced = data && Math.abs(data.totalAssets - (data.totalLiabilities + data.totalEquity)) < 0.01;

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
            Balance <span className="text-gradient">Sheet</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.9rem' }}>Assets = Liabilities + Equity — as of today</p>
        </div>
        <button onClick={fetch} disabled={loading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem' }}>
          <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      {/* Summary Banner */}
      {data && (
        <div className="card" style={{ padding: '1.25rem 2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: isBalanced ? '#eff6ff' : '#fff1f2', border: `1px solid ${isBalanced ? '#bfdbfe' : '#fecdd3'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Scale size={22} color={isBalanced ? '#2563eb' : '#e11d48'} />
            <span style={{ fontWeight: '800', color: isBalanced ? '#1d4ed8' : '#be123c' }}>
              {isBalanced ? '✅ Balance Sheet is Balanced' : '⚠️ Balance Sheet Imbalance Detected'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '2rem', fontSize: '0.875rem', fontWeight: '700' }}>
            <span style={{ color: '#2563eb' }}>Assets: ${fmt(data.totalAssets)}</span>
            <span style={{ color: '#d97706' }}>Liabilities: ${fmt(data.totalLiabilities)}</span>
            <span style={{ color: '#16a34a' }}>Equity: ${fmt(data.totalEquity)}</span>
          </div>
        </div>
      )}

      {loading && <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Generating balance sheet...</div>}

      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={14} /> Left Side — Assets
            </div>
            <Section title="Assets" accounts={data.assets} total={data.totalAssets} color="#1d4ed8" bg="#eff6ff" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              Right Side — Liabilities & Equity
            </div>
            <Section title="Liabilities" accounts={data.liabilities} total={data.totalLiabilities} color="#b45309" bg="#fef3c7" />
            <Section title="Equity" accounts={data.equity} total={data.totalEquity} color="#15803d" bg="#f0fdf4" />
            <div className="card" style={{ padding: '1.25rem 2rem', backgroundColor: isBalanced ? '#eff6ff' : '#fff1f2', border: `1px solid ${isBalanced ? '#bfdbfe' : '#fecdd3'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', fontSize: '1.125rem', color: isBalanced ? '#1d4ed8' : '#be123c' }}>
                <span>Total Liabilities + Equity</span>
                <span>${fmt(data.totalLiabilities + data.totalEquity)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }` }} />
    </div>
  );
}
