'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { ArrowLeftRight, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'KHR', symbol: '₭', name: 'Cambodian Riel' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
];

export default function CashTransferPage() {
  const [assetAccounts, setAssetAccounts] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [entries, setEntries] = useState<any[]>([]);

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    date: today, fromAccountCode: '', toAccountCode: '', amount: '',
    fromCurrency: 'USD', toCurrency: 'USD', exchangeRate: '1', memo: '',
  });

  const toAmount = parseFloat(form.amount || '0') * (parseFloat(form.exchangeRate) || 1);
  const fromAcct = assetAccounts.find(a => a.code === form.fromAccountCode);
  const toAcct = assetAccounts.find(a => a.code === form.toAccountCode);

  useEffect(() => {
    api.get('/accounting/accounts').then((data: any[]) => {
      if (!Array.isArray(data)) return;
      setAssetAccounts(data.filter(a => a.type === 'ASSET' && a.isActive));
    });
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const data = await api.get('/accounting/journal-entries?type=TRANSFER');
    setEntries(Array.isArray(data) ? data : []);
  };

  const handleSubmit = async () => {
    if (!form.fromAccountCode || !form.toAccountCode || !form.amount) { setError('Please fill all required fields.'); return; }
    if (form.fromAccountCode === form.toAccountCode) { setError('From and To accounts must be different.'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      await api.post('/accounting/transfer', {
        date: form.date, fromAccountCode: form.fromAccountCode, toAccountCode: form.toAccountCode,
        amount: parseFloat(form.amount), fromCurrency: form.fromCurrency, toCurrency: form.toCurrency,
        exchangeRate: parseFloat(form.exchangeRate) || 1, memo: form.memo,
      });
      setSuccess('Transfer posted successfully!');
      setForm({ date: today, fromAccountCode: '', toAccountCode: '', amount: '', fromCurrency: 'USD', toCurrency: 'USD', exchangeRate: '1', memo: '' });
      await loadEntries();
    } catch (e: any) { setError(e?.response?.message || e?.message || 'Failed to post transfer'); }
    finally { setSaving(false); }
  };

  const swap = () => setForm(f => ({ ...f, fromAccountCode: f.toAccountCode, toAccountCode: f.fromAccountCode, fromCurrency: f.toCurrency, toCurrency: f.fromCurrency }));

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.03em', margin: 0 }}>
          Cash Transfer & <span className="text-gradient">Receive</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.9rem' }}>Transfer funds between accounts with multi-currency exchange rate support</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeftRight size={20} color="#fff" />
            </div>
            <div><div style={{ fontWeight: '800' }}>Fund Transfer</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Move cash between accounts or currencies</div></div>
          </div>
          {error && <div style={{ padding: '0.75rem', backgroundColor: '#fff1f2', color: '#e11d48', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem', display: 'flex', gap: '0.5rem' }}><AlertCircle size={15}/>{error}</div>}
          {success && <div style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem', display: 'flex', gap: '0.5rem' }}><CheckCircle2 size={15}/>{success}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div><label style={{ fontSize: '0.8125rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem' }}>Date *</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }} /></div>

            {/* From / To with swap */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-muted)' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>FROM ACCOUNT</label>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <select value={form.fromAccountCode} onChange={e => setForm(f => ({...f, fromAccountCode: e.target.value}))} style={{ padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }}>
                    <option value="">Select account...</option>
                    {assetAccounts.map(a => <option key={a.id} value={a.code}>{a.code} — {a.name}</option>)}</select>
                  <select value={form.fromCurrency} onChange={e => setForm(f => ({...f, fromCurrency: e.target.value}))} style={{ padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }}>
                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}</select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem', backgroundColor: 'var(--background)', borderBottom: '1px solid var(--border-color)' }}>
                <button onClick={swap} style={{ background: 'var(--primary)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }} title="Swap accounts">
                  <RefreshCw size={14} />
                </button>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-muted)' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TO ACCOUNT</label>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <select value={form.toAccountCode} onChange={e => setForm(f => ({...f, toAccountCode: e.target.value}))} style={{ padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }}>
                    <option value="">Select account...</option>
                    {assetAccounts.map(a => <option key={a.id} value={a.code}>{a.code} — {a.name}</option>)}</select>
                  <select value={form.toCurrency} onChange={e => setForm(f => ({...f, toCurrency: e.target.value}))} style={{ padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }}>
                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}</select>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
              <div><label style={{ fontSize: '0.8125rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem' }}>Amount ({form.fromCurrency}) *</label>
                <input type="number" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} placeholder="0.00" style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }} /></div>
              <div><label style={{ fontSize: '0.8125rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem' }}>Exchange Rate</label>
                <input type="number" value={form.exchangeRate} onChange={e => setForm(f => ({...f, exchangeRate: e.target.value}))} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }} /></div>
            </div>

            {form.amount && form.fromAccountCode && form.toAccountCode && (
              <div style={{ backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '10px', padding: '1rem', fontSize: '0.8125rem' }}>
                <div style={{ fontWeight: '800', color: '#7c3aed', marginBottom: '0.5rem' }}>Transfer Preview</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>Cr. {fromAcct?.name || '...'}</span>
                  <span style={{ fontWeight: '700' }}>{form.fromCurrency} {parseFloat(form.amount || '0').toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '1rem' }}>
                  <span>Dr. {toAcct?.name || '...'}</span>
                  <span style={{ fontWeight: '700' }}>{form.toCurrency} {toAmount.toFixed(2)}</span>
                </div>
                {form.fromCurrency !== form.toCurrency && <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#7c3aed', borderTop: '1px dashed #ddd6fe', paddingTop: '0.5rem' }}>Rate: 1 {form.fromCurrency} = {parseFloat(form.exchangeRate) || 1} {form.toCurrency}</div>}
              </div>
            )}

            <div><label style={{ fontSize: '0.8125rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem' }}>Memo</label>
              <textarea value={form.memo} onChange={e => setForm(f => ({...f, memo: e.target.value}))} rows={2} placeholder="Reason for transfer..." style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', resize: 'none', background: 'var(--background)' }} /></div>

            <button onClick={handleSubmit} disabled={saving} style={{ padding: '0.75rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}>
              {saving ? 'Processing...' : 'Post Transfer'}
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}><h3 style={{ margin: 0, fontWeight: '800' }}>Transfer History</h3></div>
          <div style={{ overflowY: 'auto', maxHeight: '520px' }}>
            {entries.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No transfers yet.</div>
            ) : entries.map(e => (
              <div key={e.id} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{e.reference}</div>
                  <div style={{ fontWeight: '600', fontSize: '0.875rem', marginTop: '0.25rem' }}>{e.memo || 'Transfer'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{new Date(e.date).toLocaleDateString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '800', color: '#7c3aed', fontSize: '1rem' }}>{e.currency} {e.totalAmount?.toFixed(2)}</div>
                  <div style={{ fontSize: '0.6875rem', backgroundColor: '#f5f3ff', color: '#7c3aed', padding: '0.125rem 0.375rem', borderRadius: '4px', fontWeight: '700', marginTop: '0.25rem', display: 'inline-block' }}>TRANSFER</div>
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
