'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import {
  Search, Filter, Plus, ChevronLeft, ChevronRight,
  Clock, CheckCircle2, XCircle, AlertTriangle, ArrowUpRight,
  Eye, Shield, Banknote
} from 'lucide-react';



const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  DRAFT: { label: 'Draft', color: 'var(--text-muted-dark)', bg: 'var(--bg-muted)', icon: <Clock size={12} /> },
  SUBMITTED: { label: 'Submitted', color: 'var(--indigo-text)', bg: 'var(--indigo-bg)', icon: <ArrowUpRight size={12} /> },
  KYC_REVIEW: { label: 'KYC Review', color: 'var(--purple-text)', bg: 'var(--purple-bg)', icon: <Eye size={12} /> },
  KYC_APPROVED: { label: 'KYC Approved', color: 'var(--success-text)', bg: 'var(--success-bg)', icon: <CheckCircle2 size={12} /> },
  KYC_REJECTED: { label: 'KYC Rejected', color: 'var(--error-text)', bg: 'var(--error-bg)', icon: <XCircle size={12} /> },
  CREDIT_CHECK: { label: 'Credit Check', color: 'var(--warning-text)', bg: 'var(--warning-bg)', icon: <Shield size={12} /> },
  UNDERWRITING: { label: 'Underwriting', color: 'var(--orange-text)', bg: 'var(--orange-bg)', icon: <Shield size={12} /> },
  TIER1_REVIEW: { label: 'Tier 1 Review', color: 'var(--primary)', bg: 'var(--primary-light)', icon: <Eye size={12} /> },
  TIER2_REVIEW: { label: 'Tier 2 Review', color: 'var(--purple-text)', bg: 'var(--purple-bg)', icon: <Eye size={12} /> },
  TIER3_REVIEW: { label: 'Tier 3 Review', color: 'var(--pink-text)', bg: 'var(--pink-bg)', icon: <Eye size={12} /> },
  APPROVED: { label: 'Approved', color: 'var(--success-text)', bg: 'var(--success-bg)', icon: <CheckCircle2 size={12} /> },
  AUTO_REJECTED: { label: 'Auto Rejected', color: 'var(--error-text)', bg: 'var(--error-bg)', icon: <XCircle size={12} /> },
  REJECTED: { label: 'Rejected', color: 'var(--error-text)', bg: 'var(--error-bg)', icon: <XCircle size={12} /> },
  PENDING_DISBURSEMENT: { label: 'Ready to Disburse', color: 'var(--cyan-text)', bg: 'var(--cyan-bg)', icon: <Banknote size={12} /> },
  DISBURSED: { label: 'Disbursed', color: 'var(--success-text)', bg: 'var(--success-bg)', icon: <Banknote size={12} /> },
  ACTIVE: { label: 'Active', color: 'var(--success-text)', bg: 'var(--success-bg)', icon: <CheckCircle2 size={12} /> },
  COMPLETED: { label: 'Completed', color: 'var(--text-muted)', bg: 'var(--bg-muted)', icon: <CheckCircle2 size={12} /> },
  OVERDUE: { label: 'Overdue', color: 'var(--error-text)', bg: 'var(--error-bg)', icon: <AlertTriangle size={12} /> },
  DEFAULTED: { label: 'Defaulted', color: 'var(--error-text)', bg: 'var(--error-bg)', icon: <XCircle size={12} /> },
};

const PIPELINE_STAGES = [
  { label: 'All', value: '' },
  { label: 'New', value: 'DRAFT,SUBMITTED' },
  { label: 'KYC', value: 'KYC_REVIEW,KYC_APPROVED' },
  { label: 'Credit', value: 'CREDIT_CHECK,UNDERWRITING' },
  { label: 'Approval', value: 'TIER1_REVIEW,TIER2_REVIEW,TIER3_REVIEW' },
  { label: 'Disburse', value: 'APPROVED,PENDING_DISBURSEMENT' },
  { label: 'Active', value: 'DISBURSED,ACTIVE' },
  { label: 'Closed', value: 'COMPLETED,REJECTED,AUTO_REJECTED,DEFAULTED' },
];

export default function LosQueuePage() {
  const [pipelineData, setPipelineData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchQueue = async () => {
      setIsLoading(true);
      try {
        const data = await api.get(`/los/queue`);
        const mapped = data.map((item: any) => ({
          id: item.id,
          lid: item.lid,
          name: `${item.customer.firstName} ${item.customer.lastName}`,
          khmerName: `${item.customer.khmerLastName || ''} ${item.customer.khmerFirstName || ''}`.trim(),
          phone: item.customer.phone,
          product: item.product.name,
          amount: Number(item.principalAmount),
          currency: 'USD',
          status: item.status,
          branch: 'Main Office',
          officer: item.loanOfficerId || 'System',
          dtiRatio: null,
          cbcScore: null,
          createdAt: new Date(item.createdAt).toISOString().split('T')[0],
          channel: 'WEB'
        }));
        setPipelineData(mapped);
      } catch (err) {
        console.error('Failed to fetch LOS queue', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQueue();
  }, []);

  const filteredData = pipelineData.filter((item) => {
    const matchesFilter = !activeFilter || activeFilter.split(',').includes(item.status);
    const matchesSearch = !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.khmerName && item.khmerName.includes(searchQuery));
    return matchesFilter && matchesSearch;
  });

  // Calculate pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  
  // Ensure current page is valid when filtering reduces total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [filteredData.length, totalPages, currentPage]);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  const getCounts = (statuses: string) => {
    if (!statuses) return pipelineData.length;
    return pipelineData.filter((d) => statuses.split(',').includes(d.status)).length;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.03em', margin: 0 }}>
            Loan Origination Pipeline
          </h2>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Track and manage applications through the origination workflow
          </p>
        </div>
        <Link href="/admin/loans/new" style={{ textDecoration: 'none' }}>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> New Application
          </button>
        </Link>
      </div>

      {/* Pipeline Stage Tabs - Stripe Style Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
        {PIPELINE_STAGES.map((stage) => {
          const isActive = activeFilter === stage.value;
          const count = getCounts(stage.value);
          return (
            <button
              key={stage.value}
              onClick={() => setActiveFilter(stage.value)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '99px',
                border: isActive ? 'none' : '1px solid transparent',
                backgroundColor: isActive ? 'rgba(99, 91, 255, 0.08)' : 'transparent',
                color: isActive ? '#635BFF' : 'var(--text-muted-dark)',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseOver={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-muted)'; }}
              onMouseOut={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              {stage.label}
              <span style={{
                fontSize: '0.75rem',
                padding: '0.125rem 0.5rem',
                borderRadius: '99px',
                backgroundColor: isActive ? '#635BFF' : 'var(--border-color)',
                color: isActive ? 'white' : 'var(--text-muted-dark)',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table Stripe-Style Card */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', boxShadow: '0 4px 6px rgba(50,50,93,0.11), 0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '1rem', fontWeight: '600', color: '#32325D' }}>
            {filteredData.length} Application{filteredData.length !== 1 ? 's' : ''}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={15} />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '0.5rem 0.875rem 0.5rem 2.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.8125rem', width: '240px', outline: 'none', transition: 'all var(--transition-fast)', backgroundColor: 'var(--background)' }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; e.target.style.backgroundColor = 'var(--card-bg)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = 'var(--background)'; }}
              />
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: '#8898AA', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #E3E8EE' }}>ID</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: '#8898AA', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #E3E8EE' }}>Applicant</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: '#8898AA', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #E3E8EE' }}>Product</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: '#8898AA', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #E3E8EE' }}>Amount</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: '#8898AA', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #E3E8EE' }}>Status</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: '#8898AA', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #E3E8EE' }}>DTI</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: '#8898AA', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #E3E8EE' }}>CBC Score</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: '#8898AA', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #E3E8EE' }}>Channel</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: '#8898AA', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #E3E8EE' }}>Date</th>
                <th style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid #E3E8EE' }}></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '4rem' }}>
                    <div className="animate-spin" style={{ width: '24px', height: '24px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto' }}></div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    No applications found matching your criteria.
                  </td>
                </tr>
              ) : paginatedData.map((app) => {
                const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.DRAFT;
                return (
                  <tr key={app.id} style={{ borderBottom: '1px solid #E3E8EE', transition: 'background-color 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F6F9FC'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#525F7F', fontFamily: 'monospace' }} title={app.lid || app.id}>{app.lid || `#${app.id.substring(0, 6).toUpperCase()}`}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ fontWeight: '500', fontSize: '0.9375rem', color: '#32325D' }}>
                        {app.name}
                        {app.khmerName && <span style={{ marginLeft: '0.4rem', color: '#8898AA', fontSize: '0.8125rem' }}>({app.khmerName})</span>}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#635BFF', marginTop: '0.125rem' }}>{app.phone}</div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#525F7F' }}>{app.product}</td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: '500', fontSize: '0.9375rem', color: '#32325D' }}>
                      ${app.amount.toLocaleString()}
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>{app.currency}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.25rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: statusCfg.bg,
                        color: statusCfg.color,
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                      }}>
                        {statusCfg.icon}
                        {statusCfg.label}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {app.dtiRatio !== null ? (
                        <span style={{
                          fontSize: '0.8125rem',
                          fontWeight: '600',
                          color: app.dtiRatio > 0.7 ? 'var(--error-text)' : app.dtiRatio > 0.5 ? 'var(--warning-text)' : 'var(--success-text)',
                        }}>
                          {(app.dtiRatio * 100).toFixed(0)}%
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {app.cbcScore !== null ? (
                        <span style={{
                          fontSize: '0.8125rem',
                          fontWeight: '600',
                          color: app.cbcScore < 300 ? 'var(--error-text)' : app.cbcScore < 500 ? 'var(--warning-text)' : 'var(--success-text)',
                        }}>
                          {app.cbcScore}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        fontSize: '0.6875rem',
                        padding: '0.125rem 0.5rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-muted)',
                        color: 'var(--text-muted-dark)',
                        fontWeight: '500',
                      }}>
                        {app.channel}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#8898AA' }}>{app.createdAt}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <Link href={`/admin/los/${app.id}`} style={{ textDecoration: 'none' }}>
                          <button
                            style={{
                              background: 'none',
                              border: '1px solid var(--border-color)',
                              borderRadius: 'var(--radius-md)',
                              padding: '0.375rem 0.75rem',
                              fontSize: '0.75rem',
                              color: 'var(--primary)',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all var(--transition-fast)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.375rem',
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary-light)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                          >
                            <Eye size={13} /> View
                          </button>
                        </Link>
                        {app.status === 'ACTIVE' && (
                          <Link href={`/admin/customers/repayments/${app.id}`} style={{ textDecoration: 'none' }}>
                            <button
                              style={{
                                background: 'var(--primary)',
                                border: '1px solid var(--primary)',
                                borderRadius: 'var(--radius-md)',
                                padding: '0.375rem 0.75rem',
                                fontSize: '0.75rem',
                                color: 'white',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all var(--transition-fast)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                              }}
                              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary-hover)'; }}
                              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary)'; }}
                            >
                              <Banknote size={13} /> Repayments
                            </button>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--card-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '500' }}>
              Showing <span style={{ color: 'var(--foreground)', fontWeight: '600' }}>{totalItems === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + rowsPerPage, totalItems)}</span> of <span style={{ color: 'var(--foreground)', fontWeight: '600' }}>{totalItems}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              <span>Rows per page:</span>
              <select 
                value={rowsPerPage} 
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--card-bg)',
                  fontSize: '0.8125rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{ padding: '0.375rem', minWidth: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              <ChevronLeft size={15} />
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              style={{ padding: '0.375rem', minWidth: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: currentPage === totalPages || totalPages === 0 ? 0.5 : 1, cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer' }}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
