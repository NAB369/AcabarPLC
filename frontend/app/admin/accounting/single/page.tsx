'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SingleEntryPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [entries, setEntries] = useState<any[]>([]);

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ date: today, accountCode: '', side: 'DEBIT', amount: '', currency: 'USD', memo: '' });

  const selectedAcct = accounts.find(a => a.code === form.accountCode);

  useEffect(() => {
    api.get('/accounting/accounts').then((d: any[]) => { if (Array.isArray(d)) setAccounts(d.filter(a => a.isActive)); });
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const data = await api.get('/accounting/journal-entries?type=SINGLE');
    setEntries(Array.isArray(data) ? data : []);
  };

  const handleSubmit = async () => {
    if (!form.accountCode || !form.amount) { setError('Please fill in all required fields.'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      await api.post('/accounting/single-entry', { date: form.date, accountCode: form.accountCode, side: form.side, amount: parseFloat(form.amount), currency: form.currency, memo: form.memo });
      setSuccess('Single entry posted!');
      setForm({ date: today, accountCode: '', side: 'DEBIT', amount: '', currency: 'USD', memo: '' });
      await loadEntries();
    } catch (e: any) { setError(e?.response?.message || e?.message || 'Failed to post entry'); }
    finally { setSaving(false); }
  };

  const TYPE_COLORS: Record<string, string> = { ASSET: '#2563eb', LIABILITY: '#d97706', EQUITY: '#16a34a', REVENUE: '#9333ea', EXPENSE: '#e11d48' };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.03em', margin: 0 }}>
          Single <span className="text-gradient">Entry</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.9rem' }}>Post a one-sided ledger entry for adjustments, opening balances, or petty cash</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} color="#fff" />
            </div>
            <div><div style={{ fontWeight: '800' }}>Single Entry</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Use for opening balances, corrections</div></div>
          </div>

          {error && <div style={{ padding: '0.75rem', backgroundColor: '#fff1f2', color: '#e11d48', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem', display: 'flex', gap: '0.5rem' }}><AlertCircle size={15}/>{error}</div>}
          {success && <div style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem', display: 'flex', gap: '0.5rem' }}><CheckCircle2 size={15}/>{success}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div><label style={{ fontSize: '0.8125rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem' }}>Date *</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }} /></div>
            <div><label style={{ fontSize: '0.8125rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem' }}>Account *</label>
              <select value={form.accountCode} onChange={e => setForm(f => ({...f, accountCode: e.target.value}))} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }}>
                <option value="">Select account...</option>
                {accounts.map(a => <option key={a.id} value={a.code}>{a.code} — {a.name}</option>)}</select>
              {selectedAcct && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: TYPE_COLORS[selectedAcct.type], fontWeight: '700' }}>
                  {selectedAcct.type} · Normal Balance: {selectedAcct.normalBal}
                </div>
              )}
            </div>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem' }}>Entry Side *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {['DEBIT', 'CREDIT'].map(side => (
                  <button key={side} onClick={() => setForm(f => ({...f, side}))}
                    style={{ padding: '0.75rem', borderRadius: '10px', border: '2px solid', borderColor: form.side === side ? (side === 'DEBIT' ? '#2563eb' : '#9333ea') : 'var(--border-color)', backgroundColor: form.side === side ? (side === 'DEBIT' ? '#eff6ff' : '#fdf4ff') : 'transparent', color: form.side === side ? (side === 'DEBIT' ? '#2563eb' : '#9333ea') : 'var(--text-muted)', fontWeight: '800', fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                    {side}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
              <div><label style={{ fontSize: '0.8125rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem' }}>Amount *</label>
                <input type="number" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} placeholder="0.00" style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }} /></div>
              <div><label style={{ fontSize: '0.8125rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem' }}>Currency</label>
                <select value={form.currency} onChange={e => setForm(f => ({...f, currency: e.target.value}))} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }}>
                  <option value="USD">USD</option><option value="KHR">KHR</option></select></div>
            </div>
            <div><label style={{ fontSize: '0.8125rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem' }}>Memo *</label>
              <textarea value={form.memo} onChange={e => setForm(f => ({...f, memo: e.target.value}))} rows={3} placeholder="Explain the purpose of this entry..." style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', resize: 'none', background: 'var(--background)' }} /></div>
            <button onClick={handleSubmit} disabled={saving} style={{ padding: '0.75rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}>
              {saving ? 'Posting...' : 'Post Single Entry'}
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}><h3 style={{ margin: 0, fontWeight: '800' }}>Single Entry History</h3></div>
          <div style={{ overflowY: 'auto', maxHeight: '520px' }}>
            {entries.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No single entries posted yet.</div>
            ) : entries.map(e => (
              <div key={e.id} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{e.reference}</div>
                  <div style={{ fontWeight: '600', fontSize: '0.875rem', marginTop: '0.25rem' }}>{e.memo || 'Entry'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                    {e.lines?.[0] ? `${e.lines[0].debit > 0 ? 'DEBIT' : 'CREDIT'} · ${e.lines[0].accountCode || e.lines[0].accountId}` : '—'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(e.date).toLocaleDateString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '800', color: '#0ea5e9', fontSize: '1rem' }}>{e.currency} {e.totalAmount?.toFixed(2)}</div>
                  <div style={{ fontSize: '0.6875rem', backgroundColor: '#f0f9ff', color: '#0ea5e9', padding: '0.125rem 0.375rem', borderRadius: '4px', fontWeight: '700', marginTop: '0.25rem', display: 'inline-block' }}>SINGLE</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }` }} />
    </div>
  );
}
