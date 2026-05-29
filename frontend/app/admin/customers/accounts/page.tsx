'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import { 
  Search, Filter, UserPlus, 
  Mail, Phone, Calendar, ArrowUpRight,
  Edit, Trash2, ChevronDown, X, Eye, RefreshCw, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

const KYC_FILTER_OPTIONS = [
  { label: 'All Statuses', value: '' },
  { label: 'Verified',     value: 'APPROVED' },
  { label: 'Pending',      value: 'PENDING' },
  { label: 'Rejected',     value: 'REJECTED' },
];

export default function CustomerAccountsPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [kycFilter, setKycFilter] = useState('');
  const [incomeMin, setIncomeMin] = useState('');
  const [incomeMax, setIncomeMax] = useState('');
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<{ updated: number } | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const data = await api.get(`/customers/search?query=${encodeURIComponent(searchQuery)}`);
        setCustomers(data);
      } catch (err) {
        console.error('Failed to fetch customers', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, [searchQuery]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete customer ${name}?`)) return;
    try {
      await api.delete(`/customers/${id}`);
      setCustomers(customers.filter(c => c.id !== id));
      alert('Customer deleted successfully');
    } catch (err: any) {
      alert(err.message || 'Failed to delete customer');
    }
  };

  const handleSyncKyc = async () => {
    setSyncLoading(true);
    setSyncResult(null);
    try {
      const result = await api.post('/customers/sync-kyc', {});
      setSyncResult({ updated: result.updated });
      // Re-fetch the customer list to reflect the updated KYC statuses
      const data = await api.get(`/customers/search?query=${encodeURIComponent(searchQuery)}`);
      setCustomers(data);
    } catch (err: any) {
      alert(err.message || 'Failed to sync KYC statuses');
    } finally {
      setSyncLoading(false);
    }
  };

  const getKycBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return <span className="badge badge-approved">Verified</span>;
      case 'PENDING':  return <span className="badge badge-pending">Pending</span>;
      case 'REJECTED': return <span className="badge badge-rejected">Rejected</span>;
      default:         return <span className="badge">{status}</span>;
    }
  };

  const activeFilterCount = [kycFilter, incomeMin, incomeMax].filter(Boolean).length;

  const clearFilters = () => {
    setKycFilter('');
    setIncomeMin('');
    setIncomeMax('');
  };

  // Client-side filter on top of search results
  const filtered = customers.filter(c => {
    if (kycFilter && c.kycStatus !== kycFilter) return false;
    const income = Number(c.monthlyIncome) || 0;
    if (incomeMin && income < Number(incomeMin)) return false;
    if (incomeMax && income > Number(incomeMax)) return false;
    return true;
  });

  return (
    <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.03em', margin: 0 }}>All <span className="text-gradient">Customers</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>Manage and verify your institutional customer base</p>
          {syncResult !== null && (
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.8125rem', color: syncResult.updated > 0 ? '#059669' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <ShieldCheck size={14} />
              {syncResult.updated > 0
                ? `✓ ${syncResult.updated} customer${syncResult.updated > 1 ? 's' : ''} KYC status updated to Verified`
                : 'All KYC statuses are already up to date'}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleSyncKyc}
            disabled={syncLoading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', borderRadius: '10px', border: '1px solid #d1fae5', backgroundColor: '#ecfdf5', color: '#059669', fontWeight: '600', fontSize: '0.875rem', cursor: syncLoading ? 'not-allowed' : 'pointer', opacity: syncLoading ? 0.7 : 1, transition: 'all 0.2s' }}
            onMouseOver={e => { if (!syncLoading) { e.currentTarget.style.backgroundColor = '#d1fae5'; } }}
            onMouseOut={e => { e.currentTarget.style.backgroundColor = '#ecfdf5'; }}
            title="Auto-approve KYC for customers whose loans have been disbursed"
          >
            <RefreshCw size={15} style={{ animation: syncLoading ? 'spin 1s linear infinite' : 'none' }} />
            {syncLoading ? 'Syncing...' : 'Sync KYC from Loans'}
          </button>
          <Link href="/admin/customers/new" style={{ textDecoration: 'none' }}>
            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'var(--foreground)', color: 'white' }}>
              <UserPlus size={18} /> Add New Customer
            </button>
          </Link>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff' }}>
          <div style={{ position: 'relative', width: '320px' }}>
            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email or phone..." 
              className="input-field" 
              style={{ paddingLeft: '2.75rem', marginBottom: 0, backgroundColor: '#f8fafc' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', fontSize: '0.75rem', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', backgroundColor: '#fef2f2', cursor: 'pointer', fontWeight: '600' }}
              >
                <X size={12} /> Clear filters ({activeFilterCount})
              </button>
            )}
            <button
              onClick={() => setShowFilters(prev => !prev)}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: showFilters ? '#eff6ff' : undefined, borderColor: showFilters ? 'var(--primary)' : undefined, color: showFilters ? 'var(--primary)' : undefined }}
            >
              <Filter size={16} /> Filters
              {activeFilterCount > 0 && (
                <span style={{ backgroundColor: 'var(--primary)', color: 'white', borderRadius: '99px', padding: '0 6px', fontSize: '0.625rem', fontWeight: '700', lineHeight: '16px', minWidth: '16px', textAlign: 'center' }}>
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown size={14} style={{ transform: showFilters ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div style={{ padding: '1.25rem 2rem', backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1.5rem', alignItems: 'flex-end', animation: 'fadeIn 0.2s ease' }}>
            {/* KYC Status */}
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>KYC Status</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {KYC_FILTER_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setKycFilter(opt.value)}
                    style={{
                      padding: '0.375rem 0.875rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer',
                      border: kycFilter === opt.value ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      backgroundColor: kycFilter === opt.value ? '#eff6ff' : 'white',
                      color: kycFilter === opt.value ? 'var(--primary)' : 'var(--text-muted-dark)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Monthly Income Range */}
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Monthly Income (USD)</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={incomeMin}
                  onChange={e => setIncomeMin(e.target.value)}
                  style={{ width: '100px', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8125rem', outline: 'none' }}
                />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={incomeMax}
                  onChange={e => setIncomeMax(e.target.value)}
                  style={{ width: '100px', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8125rem', outline: 'none' }}
                />
              </div>
            </div>

            {/* Result count */}
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', paddingBottom: '0.25rem' }}>
              {filtered.length} of {customers.length} customer{customers.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Contact Details</th>
                <th>KYC Status</th>
                <th>Monthly Income</th>
                <th>Joined Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '4rem' }}>
                  <div className="animate-spin" style={{ width: '24px', height: '24px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto' }}></div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                  {customers.length === 0 ? 'No customers found.' : 'No customers match the current filters.'}
                </td></tr>
              ) : filtered.map((customer) => (
                <tr key={customer.id}>
                  {/* Name */}
                  <td>
                    <Link href={`/admin/customers/accounts/${customer.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.875rem', flexShrink: 0 }}>
                        {customer.firstName[0]}{customer.lastName[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: 'var(--foreground)' }}>
                          {customer.firstName} {customer.lastName}
                          {(customer.khmerLastName || customer.khmerFirstName) && <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.875rem' }}>({customer.khmerLastName} {customer.khmerFirstName})</span>}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {customer.cid ? customer.cid : `#${customer.id.substring(0, 8).toUpperCase()}`}
                        </div>
                      </div>
                    </Link>
                  </td>

                  {/* Contact */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted-dark)' }}>
                        <Mail size={14} /> {customer.email || 'N/A'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted-dark)' }}>
                        <Phone size={14} /> {customer.phone}
                      </div>
                    </div>
                  </td>

                  {/* KYC */}
                  <td>{getKycBadge(customer.kycStatus)}</td>

                  {/* Income */}
                  <td>
                    <div style={{ fontWeight: '600', color: 'var(--foreground)' }}>
                      ${customer.monthlyIncome?.toLocaleString() || '0.00'}
                    </div>
                    {customer.monthlyIncomeKhr && (
                      <div style={{ fontWeight: '600', color: 'var(--foreground)', marginTop: '4px' }}>
                        ៛{customer.monthlyIncomeKhr.toLocaleString()}
                      </div>
                    )}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Per Month</div>
                  </td>

                  {/* Date */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted-dark)' }}>
                      <Calendar size={14} />
                      {new Date(customer.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      {/* View detail */}
                      <Link href={`/admin/customers/accounts/${customer.id}`} style={{ textDecoration: 'none' }}>
                        <button
                          title="View Profile"
                          style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'white', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.backgroundColor = '#eff6ff'; }}
                          onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.backgroundColor = 'white'; }}
                        >
                          <Eye size={15} color="var(--primary)" />
                        </button>
                      </Link>

                      {/* Edit */}
                      <Link href={`/admin/customers/edit/${customer.id}`} style={{ textDecoration: 'none' }}>
                        <button
                          title="Edit Customer"
                          style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'white', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          onMouseOver={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.backgroundColor = '#fffbeb'; }}
                          onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.backgroundColor = 'white'; }}
                        >
                          <Edit size={15} color="#f59e0b" />
                        </button>
                      </Link>

                      {/* Delete */}
                      <button 
                        title="Delete Customer"
                        onClick={() => handleDelete(customer.id, `${customer.firstName} ${customer.lastName}`)}
                        style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'white', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                        onMouseOver={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.backgroundColor = '#fef2f2'; }} 
                        onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.backgroundColor = 'white'; }}
                      >
                        <Trash2 size={15} color="#ef4444" />
                      </button>

                      {/* View LOS applications */}
                      <Link href={`/admin/los?customerId=${customer.id}`} style={{ textDecoration: 'none' }}>
                        <button
                          title="View Loan Applications"
                          style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'white', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.backgroundColor = '#eff6ff'; }}
                          onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.backgroundColor = 'white'; }}
                        >
                          <ArrowUpRight size={15} color="var(--text-muted-dark)" />
                        </button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
