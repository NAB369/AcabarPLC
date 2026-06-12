'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { TrendingDown, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ExpenseEntryPage() {
  const [cashAccounts, setCashAccounts] = useState<any[]>([]);
  const [expenseAccounts, setExpenseAccounts] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [entries, setEntries] = useState<any[]>([]);

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    date: today, expenseAccountCode: '', cashAccountCode: '', amount: '', currency: 'USD', exchangeRate: '1', memo: '',
  });

  useEffect(() => {
    api.get('/accounting/accounts').then((data: any[]) => {
      if (!Array.isArray(data)) return;
      setCashAccounts(data.filter(a => a.type === 'ASSET' && a.isActive));
      setExpenseAccounts(data.filter(a => a.type === 'EXPENSE' && a.isActive));
    });
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const data = await api.get('/accounting/journal-entries?type=EXPENSE');
    setEntries(Array.isArray(data) ? data : []);
  };

  const handleSubmit = async () => {
    if (!form.expenseAccountCode || !form.cashAccountCode || !form.amount) { setError('Please fill in all required fields.'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      await api.post('/accounting/expense', {
        date: form.date, expenseAccountCode: form.expenseAccountCode, cashAccountCode: form.cashAccountCode,
        amount: parseFloat(form.amount), currency: form.currency, exchangeRate: parseFloat(form.exchangeRate) || 1, memo: form.memo,
      });
      setSuccess('Expense entry posted!');
      setForm({ date: today, expenseAccountCode: '', cashAccountCode: '', amount: '', currency: 'USD', exchangeRate: '1', memo: '' });
      await loadEntries();
    } catch (e: any) { setError(e?.response?.message || e?.message || 'Failed to post expense'); }
    finally { setSaving(false); }
  };

  const selectedExp = expenseAccounts.find(a => a.code === form.expenseAccountCode);
  const selectedCash = cashAccounts.find(a => a.code === form.cashAccountCode);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.03em', margin: 0 }}>
          <span style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Expense</span> Entry
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.9rem' }}>Record paid expenses — automatically creates Dr. Expense / Cr. Cash</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #e11d48, #be123c)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown size={20} color="#fff" />
            </div>
            <div><div style={{ fontWeight: '800' }}>Record Expense</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dr. Expense Account / Cr. Cash Account</div></div>
          </div>
          {error && <div style={{ padding: '0.75rem', backgroundColor: '#fff1f2', color: '#e11d48', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem', display: 'flex', gap: '0.5rem' }}><AlertCircle size={15}/>{error}</div>}
          {success && <div style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem', display: 'flex', gap: '0.5rem' }}><CheckCircle2 size={15}/>{success}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div><label style={{ fontSize: '0.8125rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem' }}>Date *</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }} /></div>
            <div><label style={{ fontSize: '0.8125rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem' }}>Expense Account (Debit) *</label>
              <select value={form.expenseAccountCode} onChange={e => setForm(f => ({...f, expenseAccountCode: e.target.value}))} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }}>
                <option value="">Select expense account...</option>
                {expenseAccounts.map(a => <option key={a.id} value={a.code}>{a.code} — {a.name}</option>)}</select></div>
            <div><label style={{ fontSize: '0.8125rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem' }}>Cash / Bank Account (Credit) *</label>
              <select value={form.cashAccountCode} onChange={e => setForm(f => ({...f, cashAccountCode: e.target.value}))} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }}>
                <option value="">Select cash account...</option>
                {cashAccounts.map(a => <option key={a.id} value={a.code}>{a.code} — {a.name}</option>)}</select></div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
              <div><label style={{ fontSize: '0.8125rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem' }}>Amount *</label>
                <input type="number" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} placeholder="0.00" style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }} /></div>
              <div><label style={{ fontSize: '0.8125rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem' }}>Currency *</label>
                <select value={form.currency} onChange={e => setForm(f => ({...f, currency: e.target.value}))} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }}>
                  <option value="USD">USD</option><option value="KHR">KHR</option></select></div>
              <div><label style={{ fontSize: '0.8125rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem' }}>Exchange Rate *</label>
                <input type="number" value={form.exchangeRate} onChange={e => setForm(f => ({...f, exchangeRate: e.target.value}))} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }} /></div>
            </div>
            <div><label style={{ fontSize: '0.8125rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem' }}>Memo</label>
              <textarea value={form.memo} onChange={e => setForm(f => ({...f, memo: e.target.value}))} rows={2} placeholder="Description..." style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', resize: 'none', background: 'var(--background)' }} /></div>

            {form.amount && form.expenseAccountCode && form.cashAccountCode && (
              <div style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '10px', padding: '1rem', fontSize: '0.8125rem' }}>
                <div style={{ fontWeight: '800', color: '#be123c', marginBottom: '0.5rem' }}>Entry Preview</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#9f1239' }}>Dr. {selectedExp?.name || '...'}</span>
                  <span style={{ fontWeight: '700', color: '#9f1239' }}>{form.currency} {parseFloat(form.amount || '0').toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '1.5rem' }}>
                  <span style={{ color: '#9f1239' }}>Cr. {selectedCash?.name || '...'}</span>
                  <span style={{ fontWeight: '700', color: '#9f1239' }}>{form.currency} {parseFloat(form.amount || '0').toFixed(2)}</span>
                </div>
              </div>
            )}
            <button onClick={handleSubmit} disabled={saving} style={{ padding: '0.75rem', marginTop: '0.5rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #e11d48, #be123c)', color: '#fff', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}>
              {saving ? 'Posting...' : 'Post Expense Entry'}
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}><h3 style={{ margin: 0, fontWeight: '800' }}>Recent Expenses</h3></div>
          <div style={{ overflowY: 'auto', maxHeight: '480px' }}>
            {entries.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No expense entries yet.</div>
            ) : entries.map(e => (
              <div key={e.id} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{e.reference}</div>
                  <div style={{ fontWeight: '600', fontSize: '0.875rem', marginTop: '0.25rem' }}>{e.memo || 'Expense'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{new Date(e.date).toLocaleDateString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '800', color: '#e11d48', fontSize: '1rem' }}>{e.currency} {e.totalAmount?.toFixed(2)}</div>
                  <div style={{ fontSize: '0.6875rem', backgroundColor: '#fff1f2', color: '#e11d48', padding: '0.125rem 0.375rem', borderRadius: '4px', fontWeight: '700', marginTop: '0.25rem', display: 'inline-block' }}>EXPENSE</div>
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
