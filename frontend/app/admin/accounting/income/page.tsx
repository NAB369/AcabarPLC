'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { TrendingUp, CheckCircle2, AlertCircle, DollarSign, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function IncomeEntryPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [cashAccounts, setCashAccounts] = useState<any[]>([]);
  const [incomeAccounts, setIncomeAccounts] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [entries, setEntries] = useState<any[]>([]);

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    date: today, incomeAccountCode: '', cashAccountCode: '', amount: '', currency: 'USD', exchangeRate: '1', memo: '',
  });

  useEffect(() => {
    api.get('/accounting/accounts').then((data: any[]) => {
      if (!Array.isArray(data)) return;
      setAccounts(data);
      setCashAccounts(data.filter(a => a.type === 'ASSET' && a.isActive));
      setIncomeAccounts(data.filter(a => a.type === 'REVENUE' && a.isActive));
    });
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const data = await api.get('/accounting/journal-entries?type=INCOME');
    setEntries(Array.isArray(data) ? data : []);
  };

  const handleSubmit = async () => {
    if (!form.incomeAccountCode || !form.cashAccountCode || !form.amount) {
      setError('Please fill in all required fields.'); return;
    }
    setSaving(true); setError(''); setSuccess('');
    try {
      await api.post('/accounting/income', {
        date: form.date, incomeAccountCode: form.incomeAccountCode,
        cashAccountCode: form.cashAccountCode, amount: parseFloat(form.amount),
        currency: form.currency, exchangeRate: parseFloat(form.exchangeRate) || 1, memo: form.memo,
      });
      setSuccess('Income entry posted!');
      setForm({ date: today, incomeAccountCode: '', cashAccountCode: '', amount: '', currency: 'USD', exchangeRate: '1', memo: '' });
      await loadEntries();
    } catch (e: any) {
      setError(e?.response?.message || e?.message || 'Failed to post income');
    } finally { setSaving(false); }
  };

  const selectedIncome = incomeAccounts.find(a => a.code === form.incomeAccountCode);
  const selectedCash = cashAccounts.find(a => a.code === form.cashAccountCode);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/admin/accounting" className="hover:text-blue-700 transition-colors" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)', fontWeight: '600', fontSize: '0.875rem', marginBottom: '1rem', textDecoration: 'none' }}>
          <ChevronLeft size={16} /> Back to Accounting Hub
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.03em', margin: 0 }}>
          <span className="text-gradient">Income</span> Entry
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.9rem' }}>Record received income — automatically creates Dr. Cash / Cr. Income</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Form */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #16a34a, #15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} color="#fff" />
            </div>
            <div><div style={{ fontWeight: '800', fontSize: '1rem' }}>Record Income</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dr. Cash Account / Cr. Income Account</div></div>
          </div>

          {error && <div style={{ padding: '0.75rem', backgroundColor: '#fff1f2', color: '#e11d48', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem', display: 'flex', gap: '0.5rem' }}><AlertCircle size={15}/>{error}</div>}
          {success && <div style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem', display: 'flex', gap: '0.5rem' }}><CheckCircle2 size={15}/>{success}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem' }}>Date *</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem' }}>Income Account (Credit) *</label>
              <select value={form.incomeAccountCode} onChange={e => setForm(f => ({...f, incomeAccountCode: e.target.value}))} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }}>
                <option value="">Select income account...</option>
                {incomeAccounts.map(a => <option key={a.id} value={a.code}>{a.code} — {a.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem' }}>Cash / Bank Account (Debit) *</label>
              <select value={form.cashAccountCode} onChange={e => setForm(f => ({...f, cashAccountCode: e.target.value}))} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }}>
                <option value="">Select cash account...</option>
                {cashAccounts.map(a => <option key={a.id} value={a.code}>{a.code} — {a.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem' }}>Amount *</label>
                <input type="number" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} placeholder="0.00" style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem' }}>Currency *</label>
                <select value={form.currency} onChange={e => setForm(f => ({...f, currency: e.target.value}))} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }}>
                  <option value="USD">USD</option><option value="KHR">KHR</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem' }}>Exchange Rate *</label>
                <input type="number" value={form.exchangeRate} onChange={e => setForm(f => ({...f, exchangeRate: e.target.value}))} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem' }}>Memo / Notes</label>
              <textarea value={form.memo} onChange={e => setForm(f => ({...f, memo: e.target.value}))} rows={2} placeholder="Description of income..." style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', resize: 'none', background: 'var(--background)' }} />
            </div>

            {/* Preview */}
            {form.amount && form.incomeAccountCode && form.cashAccountCode && (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '1rem', fontSize: '0.8125rem' }}>
                <div style={{ fontWeight: '800', color: '#15803d', marginBottom: '0.5rem' }}>Entry Preview</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#166534' }}>Dr. {selectedCash?.name || '...'}</span>
                  <span style={{ fontWeight: '700', color: '#166534' }}>{form.currency} {parseFloat(form.amount || '0').toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '1.5rem' }}>
                  <span style={{ color: '#166534' }}>Cr. {selectedIncome?.name || '...'}</span>
                  <span style={{ fontWeight: '700', color: '#166534' }}>{form.currency} {parseFloat(form.amount || '0').toFixed(2)}</span>
                </div>
              </div>
            )}

            <button onClick={handleSubmit} disabled={saving} className="btn btn-primary" style={{ padding: '0.75rem', marginTop: '0.5rem' }}>
              {saving ? 'Posting...' : 'Post Income Entry'}
            </button>
          </div>
        </div>

        {/* Recent Income Entries */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: 0, fontWeight: '800' }}>Recent Income Entries</h3>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: '480px' }}>
            {entries.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No income entries yet.</div>
            ) : entries.map(e => (
              <div key={e.id} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{e.reference}</div>
                  <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{e.memo || 'Income'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{new Date(e.date).toLocaleDateString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '800', color: '#16a34a', fontSize: '1rem' }}>{e.currency} {e.totalAmount?.toFixed(2)}</div>
                  <div style={{ fontSize: '0.6875rem', backgroundColor: '#f0fdf4', color: '#16a34a', padding: '0.125rem 0.375rem', borderRadius: '4px', fontWeight: '700', marginTop: '0.25rem', display: 'inline-block' }}>INCOME</div>
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
