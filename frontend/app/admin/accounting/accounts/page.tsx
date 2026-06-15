'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Plus, Edit2, ToggleLeft, ToggleRight, Search, BookOpen, ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const ACCOUNT_TYPES = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'];
const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  ASSET:     { bg: '#eff6ff', color: '#2563eb' },
  LIABILITY: { bg: '#fef3c7', color: '#d97706' },
  EQUITY:    { bg: '#f0fdf4', color: '#16a34a' },
  REVENUE:   { bg: '#fdf4ff', color: '#9333ea' },
  EXPENSE:   { bg: '#fff1f2', color: '#e11d48' },
};

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [form, setForm] = useState({ code: '', name: '', nameKh: '', type: 'ASSET', normalBal: 'DEBIT', parentCode: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const data = await api.get('/accounting/accounts');
      setAccounts(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const filtered = accounts.filter(a => {
    const matchType = filterType === 'ALL' || a.type === filterType;
    const matchSearch = search === '' || a.name.toLowerCase().includes(search.toLowerCase()) || a.code.includes(search);
    return matchType && matchSearch;
  });

  const openCreate = () => {
    setEditTarget(null);
    setForm({ code: '', name: '', nameKh: '', type: 'ASSET', normalBal: 'DEBIT', parentCode: '', description: '' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (acct: any) => {
    setEditTarget(acct);
    setForm({ code: acct.code, name: acct.name, nameKh: acct.nameKh || '', type: acct.type, normalBal: acct.normalBal, parentCode: acct.parentCode || '', description: acct.description || '' });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      if (editTarget) {
        await api.put(`/accounting/accounts/${editTarget.id}`, form);
      } else {
        await api.post('/accounting/accounts', form);
      }
      setShowModal(false);
      await fetchAccounts();
    } catch (e: any) {
      setError(e?.response?.message || e?.message || 'Failed to save account');
    } finally { setSaving(false); }
  };

  const handleToggle = async (acct: any) => {
    try {
      await api.put(`/accounting/accounts/${acct.id}/toggle`, {});
      await fetchAccounts();
    } catch (e) { console.error(e); }
  };

  const grouped: Record<string, any[]> = {};
  for (const type of ACCOUNT_TYPES) {
    grouped[type] = filtered.filter(a => a.type === type);
  }

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/admin/accounting" className="hover:text-blue-700 transition-colors" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)', fontWeight: '600', fontSize: '0.875rem', textDecoration: 'none' }}>
          <ChevronLeft size={16} /> Back to Accounting Hub
        </Link>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.03em', margin: 0 }}>
            Chart of <span className="text-gradient">Accounts</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
            Manage your general ledger account structure — {accounts.length} accounts defined
          </p>
        </div>
        <button
          onClick={openCreate}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem' }}
        >
          <Plus size={18} /> Add Account
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search accounts..."
            style={{ width: '100%', paddingLeft: '2.25rem', padding: '0.5rem 0.75rem 0.5rem 2.25rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem', background: 'var(--background)' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['ALL', ...ACCOUNT_TYPES].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              style={{
                padding: '0.375rem 0.875rem', borderRadius: '20px', border: '1px solid',
                borderColor: filterType === t ? 'var(--primary)' : 'var(--border-color)',
                backgroundColor: filterType === t ? 'var(--primary)' : 'transparent',
                color: filterType === t ? '#fff' : 'var(--text-muted-dark)',
                fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
              }}
            >{t}</button>
          ))}
        </div>
      </div>

      {/* Account Groups */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading accounts...</div>
      ) : (
        ACCOUNT_TYPES.map(type => {
          const accts = grouped[type];
          if (filterType !== 'ALL' && filterType !== type) return null;
          const colors = TYPE_COLORS[type];
          return (
            <div key={type} className="card" style={{ marginBottom: '1.5rem', overflow: 'hidden', padding: 0 }}>
              <div style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: colors.bg }}>
                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', backgroundColor: colors.color, color: '#fff', fontSize: '0.75rem', fontWeight: '800' }}>{type}</span>
                <span style={{ fontWeight: '700', fontSize: '1rem' }}>
                  {type === 'ASSET' ? 'Assets' : type === 'LIABILITY' ? 'Liabilities' : type === 'EQUITY' ? 'Equity' : type === 'REVENUE' ? 'Revenue (Income)' : 'Expenses'}
                </span>
                <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: colors.color, fontWeight: '600' }}>{accts.length} accounts</span>
              </div>
              {accts.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No accounts in this category</div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Account Name</th>
                      <th>Name (Khmer)</th>
                      <th>Normal Balance</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accts.map(acct => (
                      <tr key={acct.id} style={{ opacity: acct.isActive ? 1 : 0.5 }}>
                        <td><span style={{ fontFamily: 'monospace', fontWeight: '700', color: colors.color }}>{acct.code}</span></td>
                        <td style={{ fontWeight: '600' }}>{acct.name}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{acct.nameKh || '—'}</td>
                        <td>
                          <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.6875rem', fontWeight: '800', backgroundColor: acct.normalBal === 'DEBIT' ? '#eff6ff' : '#fdf4ff', color: acct.normalBal === 'DEBIT' ? '#2563eb' : '#9333ea' }}>
                            {acct.normalBal}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acct.description || '—'}</td>
                        <td>
                          <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.6875rem', fontWeight: '800', backgroundColor: acct.isActive ? '#f0fdf4' : '#f3f4f6', color: acct.isActive ? '#16a34a' : '#6b7280' }}>
                            {acct.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => openEdit(acct)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }} title="Edit">
                              <Edit2 size={15} />
                            </button>
                            <button onClick={() => handleToggle(acct)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: acct.isActive ? '#16a34a' : '#6b7280', padding: '0.25rem' }} title={acct.isActive ? 'Deactivate' : 'Activate'}>
                              {acct.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '540px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', animation: 'fadeIn 0.2s ease-out' }}>
            <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem', fontWeight: '800' }}>{editTarget ? 'Edit Account' : 'Add New Account'}</h3>
            {error && <div style={{ padding: '0.75rem', backgroundColor: '#fff1f2', color: '#e11d48', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem' }}>Account Code *</label>
                <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} disabled={!!editTarget} placeholder="e.g. 10100" style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: editTarget ? 'var(--bg-muted)' : 'var(--background)' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem' }}>Account Type *</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value, normalBal: ['ASSET','EXPENSE'].includes(e.target.value) ? 'DEBIT' : 'CREDIT' }))} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }}>
                  {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem' }}>Account Name (English) *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Cash Vault" style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem' }}>Account Name (Khmer)</label>
              <input value={form.nameKh} onChange={e => setForm(f => ({ ...f, nameKh: e.target.value }))} placeholder="ប្រាក់សុទ្ធ" style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem' }}>Normal Balance</label>
                <select value={form.normalBal} onChange={e => setForm(f => ({ ...f, normalBal: e.target.value }))} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }}>
                  <option value="DEBIT">DEBIT</option>
                  <option value="CREDIT">CREDIT</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem' }}>Parent Account Code</label>
                <input value={form.parentCode} onChange={e => setForm(f => ({ ...f, parentCode: e.target.value }))} placeholder="Optional" style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', background: 'var(--background)' }} />
              </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: '700', display: 'block', marginBottom: '0.375rem' }}>Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Optional description" style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', resize: 'vertical', background: 'var(--background)' }} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '0.625rem 1.25rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'transparent', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ padding: '0.625rem 1.5rem' }}>
                {saving ? 'Saving...' : editTarget ? 'Update Account' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }` }} />
    </div>
  );
}
