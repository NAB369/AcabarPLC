'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Plus, Trash2, CheckCircle2, AlertCircle, Calendar, FileText } from 'lucide-react';

export default function JournalEntriesPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState<'FORM' | 'LIST'>('FORM');

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    date: today, memo: '', currency: 'USD', exchangeRate: 1,
    lines: [
      { accountCode: '', debit: '', credit: '', description: '' },
      { accountCode: '', debit: '', credit: '', description: '' },
    ],
  });

  const totalDebit = form.lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
  const totalCredit = form.lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  useEffect(() => {
    api.get('/accounting/accounts').then(d => setAccounts(Array.isArray(d) ? d : [])).catch(() => {});
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const data = await api.get('/accounting/journal-entries?type=JOURNAL');
      setEntries(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const addLine = () => setForm(f => ({ ...f, lines: [...f.lines, { accountCode: '', debit: '', credit: '', description: '' }] }));
  const removeLine = (i: number) => setForm(f => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }));
  const updateLine = (i: number, field: string, value: string) => {
    setForm(f => {
      const lines = [...f.lines];
      lines[i] = { ...lines[i], [field]: value };
      return { ...f, lines };
    });
  };

  const handleSubmit = async () => {
    if (!isBalanced) { setError('Entry must balance: Total Debits must equal Total Credits'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      const payload = {
        date: form.date, memo: form.memo, currency: form.currency, exchangeRate: Number(form.exchangeRate),
        lines: form.lines.filter(l => l.accountCode).map(l => ({
          accountCode: l.accountCode,
          debit: parseFloat(l.debit) || 0,
          credit: parseFloat(l.credit) || 0,
          description: l.description,
        })),
      };
      await api.post('/accounting/journal-entries', payload);
      setSuccess('Journal entry posted successfully!');
      setForm({ date: today, memo: '', currency: 'USD', exchangeRate: 1, lines: [{ accountCode: '', debit: '', credit: '', description: '' }, { accountCode: '', debit: '', credit: '', description: '' }] });
      await loadEntries();
    } catch (e: any) {
      setError(e?.response?.message || e?.message || 'Failed to post journal entry');
    } finally { setSaving(false); }
  };

  const formatCurrency = (v: number, cur = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency: cur === 'USD' ? 'USD' : 'USD', maximumFractionDigits: 2 }).format(v).replace('$', cur === 'KHR' ? '₭' : '$');

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.03em', margin: 0 }}>
            Journal <span className="text-gradient">Entries</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.9rem' }}>Post double-entry journal transactions to the general ledger</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {['FORM', 'LIST'].map(v => (
            <button key={v} onClick={() => setActiveView(v as any)}
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: activeView === v ? 'var(--primary)' : 'transparent', color: activeView === v ? '#fff' : 'var(--text-muted-dark)', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer' }}>
              {v === 'FORM' ? 'New Entry' : 'View Entries'}
            </button>
          ))}
        </div>
      </div>

      {activeView === 'FORM' ? (
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ margin: '0 0 1.5rem', fontWeight: '800' }}>New Journal Entry</h3>
          {error && <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fff1f2', color: '#e11d48', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><AlertCircle size={16}/>{error}</div>}
          {success && <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle2 size={16}/>{success}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem' }}>Date *</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem' }}>Memo / Description</label>
              <input value={form.memo} onChange={e => setForm(f => ({ ...f, memo: e.target.value }))} placeholder="Transaction memo..." style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem' }}>Currency</label>
              <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }}>
                <option value="USD">USD ($)</option>
                <option value="KHR">KHR (₭)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem' }}>Exchange Rate</label>
              <input type="number" value={form.exchangeRate} onChange={e => setForm(f => ({ ...f, exchangeRate: parseFloat(e.target.value) || 1 }))} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }} />
            </div>
          </div>

          {/* Journal Lines */}
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 1.5fr 2fr 40px', gap: 0, padding: '0.75rem 1rem', backgroundColor: 'var(--bg-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              <div>Account</div><div style={{ textAlign: 'right' }}>Debit</div><div style={{ textAlign: 'right' }}>Credit</div><div>Description</div><div />
            </div>
            {form.lines.map((line, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 1.5fr 2fr 40px', gap: 0, padding: '0.5rem 1rem', borderTop: '1px solid var(--border-color)', alignItems: 'center' }}>
                <select value={line.accountCode} onChange={e => updateLine(i, 'accountCode', e.target.value)} style={{ padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.8125rem', background: 'var(--background)', marginRight: '0.5rem' }}>
                  <option value="">Select account...</option>
                  {accounts.map(a => <option key={a.id} value={a.code}>{a.code} — {a.name}</option>)}
                </select>
                <input type="number" value={line.debit} onChange={e => updateLine(i, 'debit', e.target.value)} placeholder="0.00" style={{ padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.8125rem', textAlign: 'right', background: 'var(--background)', marginRight: '0.5rem' }} />
                <input type="number" value={line.credit} onChange={e => updateLine(i, 'credit', e.target.value)} placeholder="0.00" style={{ padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.8125rem', textAlign: 'right', background: 'var(--background)', marginRight: '0.5rem' }} />
                <input value={line.description} onChange={e => updateLine(i, 'description', e.target.value)} placeholder="Line description..." style={{ padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.8125rem', background: 'var(--background)' }} />
                <button onClick={() => removeLine(i)} disabled={form.lines.length <= 2} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e11d48', opacity: form.lines.length <= 2 ? 0.3 : 1 }}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            {/* Totals Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 1.5fr 2fr 40px', padding: '0.875rem 1rem', borderTop: '2px solid var(--border-color)', backgroundColor: isBalanced ? '#f0fdf4' : '#fff1f2', alignItems: 'center' }}>
              <div style={{ fontWeight: '800', fontSize: '0.875rem', color: isBalanced ? '#16a34a' : '#e11d48', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isBalanced ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {isBalanced ? 'Balanced' : 'Not Balanced'}
              </div>
              <div style={{ textAlign: 'right', fontWeight: '800', color: isBalanced ? '#16a34a' : '#e11d48' }}>{totalDebit.toFixed(2)}</div>
              <div style={{ textAlign: 'right', fontWeight: '800', color: isBalanced ? '#16a34a' : '#e11d48' }}>{totalCredit.toFixed(2)}</div>
              <div style={{ fontSize: '0.75rem', color: isBalanced ? '#16a34a' : '#e11d48', fontWeight: '600' }}>
                {!isBalanced && `Difference: ${Math.abs(totalDebit - totalCredit).toFixed(2)}`}
              </div>
              <div />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={addLine} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1px dashed var(--border-color)', borderRadius: '8px', background: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-muted-dark)', fontWeight: '600' }}>
              <Plus size={15} /> Add Line
            </button>
            <button onClick={handleSubmit} disabled={saving || !isBalanced} className="btn btn-primary" style={{ padding: '0.75rem 2rem', opacity: !isBalanced ? 0.6 : 1 }}>
              {saving ? 'Posting...' : 'Post Journal Entry'}
            </button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontWeight: '800' }}>Posted Journal Entries</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{entries.length} entries</span>
          </div>
          <table className="data-table">
            <thead><tr><th>Reference</th><th>Date</th><th>Memo</th><th>Currency</th><th>Total</th><th>Lines</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>Loading...</td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No journal entries posted yet.</td></tr>
              ) : entries.map(e => (
                <tr key={e.id}>
                  <td><span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--primary)' }}>{e.reference}</span></td>
                  <td>{new Date(e.date).toLocaleDateString()}</td>
                  <td style={{ color: 'var(--text-muted-dark)' }}>{e.memo || '—'}</td>
                  <td><span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.6875rem', fontWeight: '800', backgroundColor: 'var(--bg-muted)' }}>{e.currency}</span></td>
                  <td style={{ fontWeight: '700' }}>{formatCurrency(e.totalAmount, e.currency)}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{e.lines?.length || 0} lines</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }` }} />
    </div>
  );
}
