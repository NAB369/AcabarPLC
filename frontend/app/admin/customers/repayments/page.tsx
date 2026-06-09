'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { 
  Search, Calendar, Clock, 
  ArrowRight, TrendingUp, CreditCard, Filter
} from 'lucide-react';
import Link from 'next/link';

export default function CustomerRepaymentsPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedDateRange, setSelectedDateRange] = useState('THIS_MONTH');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const data = await api.get(`/los/queue`);
        // Filter for disbursed/active loans
        const activeLoans = data.filter((l: any) => 
          ['DISBURSED', 'ACTIVE', 'OVERDUE', 'PENDING_DISBURSEMENT'].includes(l.status)
        );
        setLoans(activeLoans);
      } catch (err) {
        console.error('Failed to fetch loans', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLoans();
  }, []);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await api.get('/branches');
        setBranches(data);
      } catch (err) {
        console.error('Failed to fetch branches', err);
      }
    };
    fetchBranches();
  }, []);

  const dateRange = (() => {
    const now = new Date();
    if (selectedDateRange === 'THIS_MONTH') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return { start, end };
    }
    if (selectedDateRange === 'LAST_MONTH') {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { start, end };
    }
    if (selectedDateRange === 'NEXT_MONTH') {
      const start = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59, 999);
      return { start, end };
    }
    return null; // ALL
  })();

  const getStatusBadge = (schedule: any) => {
    if (!schedule) {
      return <span style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-muted)', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '700', border: '1px solid var(--border-hover)' }}>Fully Paid</span>;
    }

    if (schedule.status === 'PAID') {
      return <span style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '700', border: '1px solid #bbf7d0' }}>Paid</span>;
    }

    const isOverdue = schedule.status === 'OVERDUE' || new Date(schedule.dueDate) < new Date();
    if (isOverdue) {
      return <span style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error-text)', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '700', border: '1px solid #fecdd3' }}>Overdue</span>;
    }

    return <span style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '700', border: '1px solid #bfdbfe' }}>Upcoming</span>;
  };

  const filteredLoans = loans.filter((loan) => {
    // 1. Search Query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const fullName = `${loan.customer?.firstName || ''} ${loan.customer?.lastName || ''}`.toLowerCase();
      const khmerName = (`${loan.customer?.khmerLastName || ''} ${loan.customer?.khmerFirstName || ''}`).toLowerCase();
      const loanId = loan.id.toLowerCase();
      const phone = (loan.customer?.phone || '').toLowerCase();
      if (!fullName.includes(query) && !khmerName.includes(query) && !loanId.includes(query) && !phone.includes(query)) {
        return false;
      }
    }

    // 2. Region / Branch Filter
    if (selectedBranch !== 'ALL') {
      if (loan.customer?.branchId !== selectedBranch) {
        return false;
      }
    }

    // 3. Date Range Filter
    if (dateRange) {
      const schedules = loan.repaymentSchedules || [];
      const hasInstallmentInRange = schedules.some((s: any) => {
        const d = new Date(s.dueDate);
        return d >= dateRange.start && d <= dateRange.end;
      });
      if (!hasInstallmentInRange) {
        return false;
      }
    }

    return true;
  });

  // Calculate dynamic Collection Rate
  let totalPaid = 0;
  let totalDue = 0;
  filteredLoans.forEach((loan) => {
    (loan.repaymentSchedules || []).forEach((sched: any) => {
      const dueDate = new Date(sched.dueDate);
      if (dateRange) {
        if (dueDate < dateRange.start || dueDate > dateRange.end) {
          return;
        }
      }
      if (sched.status === 'PAID') {
        totalPaid += sched.amountDue;
        totalDue += sched.amountDue;
      } else if (sched.status === 'OVERDUE' || dueDate <= new Date()) {
        totalDue += sched.amountDue;
      }
    });
  });
  const collectionRate = totalDue > 0 ? (totalPaid / totalDue) * 100 : 100.0;

  return (
    <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.03em', margin: 0 }}>Portfolio <span className="text-gradient">Repayments</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>Monitor collection efficiency and repayment schedules</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="card" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}>
             <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={20} />
             </div>
             <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Collection Rate</div>
                <div style={{ fontSize: '1.125rem', fontWeight: '800' }}>{collectionRate.toFixed(1)}%</div>
             </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--card-bg)' }}>
          <div style={{ position: 'relative', width: '320px' }}>
            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
            <input 
              type="text" 
              placeholder="Search customer repayments..." 
              className="input-field" 
              style={{ paddingLeft: '2.75rem', marginBottom: 0, backgroundColor: 'var(--background)' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Filter size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted-dark)', pointerEvents: 'none' }} />
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                style={{
                  padding: '0.5rem 1.75rem 0.5rem 2.25rem',
                  fontSize: '0.8125rem',
                  fontWeight: '600',
                  color: 'var(--text-muted-dark)',
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
              >
                <option value="ALL">All Regions</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Calendar size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted-dark)', pointerEvents: 'none' }} />
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                style={{
                  padding: '0.5rem 1.75rem 0.5rem 2.25rem',
                  fontSize: '0.8125rem',
                  fontWeight: '600',
                  color: 'var(--text-muted-dark)',
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
              >
                <option value="THIS_MONTH">This Month</option>
                <option value="LAST_MONTH">Last Month</option>
                <option value="NEXT_MONTH">Next Month</option>
                <option value="ALL">All Time</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer / Loan ID</th>
                <th>Next Installment</th>
                <th>Principal + Interest</th>
                <th>Status</th>
                <th>Due Date</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '4rem' }}>
                  <div className="animate-spin" style={{ width: '24px', height: '24px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto' }}></div>
                </td></tr>
              ) : filteredLoans.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>No records found.</td></tr>
              ) : filteredLoans.map((loan) => {
                const activeSchedule = (() => {
                  const schedules = loan.repaymentSchedules || [];
                  if (dateRange) {
                    return schedules.find((s: any) => {
                      const d = new Date(s.dueDate);
                      return d >= dateRange.start && d <= dateRange.end;
                    });
                  } else {
                    const unpaid = [...schedules]
                      .filter((s: any) => s.status !== 'PAID')
                      .sort((a: any, b: any) => a.installmentNumber - b.installmentNumber);
                    return unpaid[0] || null;
                  }
                })();

                const nextInstallmentText = activeSchedule 
                  ? `#${activeSchedule.installmentNumber} of ${loan.durationMonths}` 
                  : 'Fully Paid';

                const nextAmount = activeSchedule ? activeSchedule.amountDue : 0;
                
                const nextDueDateText = activeSchedule
                  ? new Date(activeSchedule.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                  : '—';

                return (
                  <tr key={loan.id}>
                    <td>
                      <Link href={`/admin/customers/repayments/${loan.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'var(--purple-bg)', color: 'var(--purple-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                          <CreditCard size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: 'var(--foreground)' }}>{loan.customer?.firstName} {loan.customer?.lastName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{loan.lid || `LN-${loan.id.substring(0, 8).toUpperCase()}`}</div>
                        </div>
                      </Link>
                    </td>
                    <td>
                      <div style={{ fontWeight: '700' }}>{nextInstallmentText}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '700', color: 'var(--primary)' }}>${nextAmount.toFixed(2)}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Installment Due</div>
                    </td>
                    <td>{getStatusBadge(activeSchedule)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                        <Clock size={14} color="var(--text-muted)" />
                        {nextDueDateText}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link href={`/admin/customers/repayments/${loan.id}`} style={{ textDecoration: 'none', display: 'inline-block' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-color)' }}>
                          Collect Payment <ArrowRight size={14} />
                        </button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
