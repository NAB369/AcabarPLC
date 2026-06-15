'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Search, RefreshCw, Calendar, ArrowUpRight, ArrowDownRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function AccountLedgerPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedCode, setSelectedCode] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(yearStart);
  const [endDate, setEndDate] = useState(today);

  useEffect(() => {
    api.get('/accounting/accounts').then((d: any[]) => { if (Array.isArray(d)) setAccounts(d.filter(a => a.isActive)); });
  }, []);

  const fetchLedger = async (code = selectedCode) => {
    if (!code) return;
    setLoading(true);
    try {
      const d = await api.get(`/accounting/reports/ledger/${code}?startDate=${startDate}&endDate=${endDate}`);
      setData(d);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleAccountChange = (code: string) => {
    setSelectedCode(code);
    setData(null);
  };

  const fmt = (v: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(v || 0);

  const TYPE_COLORS: Record<string, string> = { ASSET: '#2563eb', LIABILITY: '#d97706', EQUITY: '#16a34a', REVENUE: '#9333ea', EXPENSE: '#e11d48' };
  const acct = data?.account;

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/admin/accounting" className="hover:text-blue-700 transition-colors" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)', fontWeight: '600', fontSize: '0.875rem', marginBottom: '1rem', textDecoration: 'none' }}>
          <ChevronLeft size={16} /> Back to Accounting Hub
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.03em', margin: 0 }}>
          Account <span className="text-gradient">Sub-Ledger</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.9rem' }}>Drilldown into individual account transactions with running balance</p>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: '200px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem', color: 'var(--text-muted)' }}>SELECT ACCOUNT</label>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <select value={selectedCode} onChange={e => handleAccountChange(e.target.value)} style={{ width: '100%', paddingLeft: '2rem', padding: '0.625rem 0.75rem 0.625rem 2rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }}>
              <option value="">Choose an account...</option>
              {accounts.map(a => <option key={a.id} value={a.code}>{a.code} — {a.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem', color: 'var(--text-muted)' }}>FROM</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }} />
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem', color: 'var(--text-muted)' }}>TO</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }} />
        </div>
        <div style={{ marginTop: '1.25rem' }}>
          <button onClick={() => fetchLedger()} disabled={!selectedCode || loading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem' }}>
            <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Load Ledger
          </button>
        </div>
      </div>

      {/* Account Header */}
      {data && acct && (
        <div className="card" style={{ padding: '1.5rem 2rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '1.25rem', color: TYPE_COLORS[acct.type] }}>{acct.code}</span>
              <span style={{ fontSize: '1.25rem', fontWeight: '800' }}>{acct.name}</span>
              {acct.nameKh && <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>({acct.nameKh})</span>}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <span style={{ padding: '0.25rem 0.625rem', borderRadius: '20px', fontSize: '0.6875rem', fontWeight: '800', backgroundColor: 'var(--bg-muted)', color: TYPE_COLORS[acct.type] }}>{acct.type}</span>
              <span style={{ padding: '0.25rem 0.625rem', borderRadius: '20px', fontSize: '0.6875rem', fontWeight: '800', backgroundColor: 'var(--bg-muted)', color: 'var(--text-muted-dark)' }}>Normal: {acct.normalBal}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '2rem', textAlign: 'right' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Total Debit</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#2563eb' }}>${fmt(data.totalDebit)}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Total Credit</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#9333ea' }}>${fmt(data.totalCredit)}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Closing Balance</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: TYPE_COLORS[acct.type] }}>${fmt(Math.abs(data.closingBalance))}</div>
            </div>
          </div>
        </div>
      )}

      {/* Ledger Table */}
      {data && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Reference</th>
                <th>Description</th>
                <th>Type</th>
                <th style={{ textAlign: 'right' }}>Debit</th>
                <th style={{ textAlign: 'right' }}>Credit</th>
                <th style={{ textAlign: 'right' }}>Running Balance</th>
              </tr>
            </thead>
            <tbody>
              {data.entries?.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No transactions in this period.</td></tr>
              )}
              {data.entries?.map((e: any) => {
                const isDebit = e.debit > 0;
                return (
                  <tr key={e.id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>
                      {new Date(e.journalEntry?.date || e.createdAt).toLocaleDateString()}
                    </td>
                    <td><span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700' }}>{e.transactionReference}</span></td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted-dark)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {e.description || e.journalEntry?.memo || '—'}
                    </td>
                    <td>
                      <span style={{ padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.6875rem', fontWeight: '800', backgroundColor: 'var(--bg-muted)' }}>
                        {e.journalEntry?.type || 'SYSTEM'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '600', color: isDebit ? '#2563eb' : 'var(--text-muted)' }}>
                      {e.debit > 0 ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}><ArrowUpRight size={13} />{fmt(e.debit)}</span> : '—'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '600', color: !isDebit ? '#9333ea' : 'var(--text-muted)' }}>
                      {e.credit > 0 ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}><ArrowDownRight size={13} />{fmt(e.credit)}</span> : '—'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: TYPE_COLORS[data.account?.type] }}>
                      {fmt(Math.abs(e.runningBalance))} {e.runningBalance < 0 ? '(Cr)' : '(Dr)'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!data && !loading && (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <Search size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <p>Select an account and click "Load Ledger" to view transactions</p>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }` }} />
    </div>
  );
}
