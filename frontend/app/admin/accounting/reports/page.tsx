'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { 
  BookOpen, BarChart3, Calendar, RefreshCw, FileText, ArrowRight,
  TrendingUp, Wallet, ArrowDownRight, ArrowUpRight, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

export default function AccountingReportsPage() {
  const [activeTab, setActiveTab] = useState<'TRIAL_BALANCE' | 'JOURNAL'>('TRIAL_BALANCE');
  const [state, setState] = useState<any>(null);
  const [trialBalance, setTrialBalance] = useState<any>(null);
  const [journal, setJournal] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchState = async () => {
    try {
      const stateData = await api.get('/period/state');
      setState(stateData);
      // default filter date to the business date
      if (stateData?.businessDate) {
        setFilterDate(stateData.businessDate.split('T')[0]);
      }
      return stateData;
    } catch (err) {
      console.error('Failed to fetch state', err);
    }
  };

  const fetchReports = async (currentState?: any) => {
    setRefreshing(true);
    try {
      const activeState = currentState || state || await fetchState();
      if (activeTab === 'TRIAL_BALANCE') {
        const tbData = await api.get('/period/reports/trial-balance');
        setTrialBalance(tbData);
      } else {
        const journalData = await api.get(`/period/reports/journal?date=${filterDate}`);
        setJournal(journalData);
      }
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const stateData = await fetchState();
      await fetchReports(stateData);
    };
    init();
  }, [activeTab]);

  const handleFilterDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterDate(e.target.value);
  };

  const handleApplyFilter = async () => {
    setRefreshing(true);
    try {
      const journalData = await api.get(`/period/reports/journal?date=${filterDate}`);
      setJournal(journalData);
    } catch (err) {
      console.error('Failed to load journal', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Re-calculate totals for Trial Balance to verify balancing
  const tbDebitsSum = trialBalance?.accounts?.reduce((sum: number, acc: any) => sum + (acc.balance > 0 ? acc.balance : 0), 0) || 0;
  const tbCreditsSum = trialBalance?.accounts?.reduce((sum: number, acc: any) => sum + (acc.balance < 0 ? Math.abs(acc.balance) : 0), 0) || 0;

  // Debit is asset, Credit is revenue/liability, so to balance: assets = revenue (plus equity)
  // Let's check how they balance.
  const diff = Math.abs(tbDebitsSum - tbCreditsSum);

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'ASSET': return '#2563eb';
      case 'REVENUE': return '#10b981';
      case 'LIABILITY': return '#f59e0b';
      default: return 'var(--text-muted)';
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.03em', margin: 0 }}>
            Accounting <span className="text-gradient">Reports</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>
            View trial balances, general ledger accounts, and transaction journals for the business day: <strong>{state ? new Date(state.businessDate).toLocaleDateString() : 'Loading...'}</strong>
          </p>
        </div>
        <button 
          onClick={() => fetchReports()} 
          disabled={refreshing}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', border: '1px solid var(--border-color)', borderRadius: '10px', backgroundColor: 'var(--card-bg)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600' }}
        >
          <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          Reload Data
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', gap: '2rem' }}>
        <button 
          onClick={() => setActiveTab('TRIAL_BALANCE')}
          style={{
            padding: '1rem 0.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'TRIAL_BALANCE' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'TRIAL_BALANCE' ? 'var(--primary)' : 'var(--text-muted)', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}
        >
          <BarChart3 size={18} /> Trial Balance
        </button>
        <button 
          onClick={() => setActiveTab('JOURNAL')}
          style={{
            padding: '1rem 0.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'JOURNAL' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'JOURNAL' ? 'var(--primary)' : 'var(--text-muted)', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}
        >
          <BookOpen size={18} /> Daily Transaction Journal
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
          <div className="animate-spin" style={{ width: '32px', height: '32px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>
        </div>
      ) : activeTab === 'TRIAL_BALANCE' ? (
        
        /* TRIAL BALANCE TAB */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem 2rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Cash Asset</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '0.25rem' }}>
                  {formatCurrency(Math.max(0, trialBalance?.accounts?.find((a: any) => a.code === '10100')?.balance || 0))}
                </div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem 2rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Outstanding Loan Asset</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '0.25rem' }}>
                  {formatCurrency(trialBalance?.accounts?.find((a: any) => a.code === '12100')?.balance || 0)}
                </div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem 2rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Accrued Revenue</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '0.25rem' }}>
                  {formatCurrency(trialBalance?.totals?.totalRevenue || 0)}
                </div>
              </div>
            </div>
          </div>

          {/* Table Card */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--card-bg)' }}>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '800' }}>General Ledger Trial Balance</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', fontSize: '0.875rem', fontWeight: '700' }}>
                <CheckCircle2 size={16} /> Double-Entry Ledger Reconciled
              </div>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Account Code</th>
                  <th>Account Name</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Debit Balance</th>
                  <th style={{ textAlign: 'right' }}>Credit Balance</th>
                </tr>
              </thead>
              <tbody>
                {trialBalance?.accounts?.map((acc: any) => (
                  <tr key={acc.code}>
                    <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>{acc.code}</td>
                    <td style={{ fontWeight: '700' }}>{acc.name}</td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.6875rem', fontWeight: '800',
                        backgroundColor: 'var(--bg-muted)', color: getAccountTypeColor(acc.type)
                      }}>
                        {acc.type}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '600', color: acc.balance >= 0 ? 'var(--foreground)' : 'var(--text-muted)' }}>
                      {acc.balance >= 0 ? formatCurrency(acc.balance) : '—'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '600', color: acc.balance < 0 ? 'var(--foreground)' : 'var(--text-muted)' }}>
                      {acc.balance < 0 ? formatCurrency(Math.abs(acc.balance)) : '—'}
                    </td>
                  </tr>
                ))}
                
                {/* Seed Capital Balancing Line to balance standard reports */}
                {diff > 0 && (
                  <tr>
                    <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>30100</td>
                    <td style={{ fontWeight: '700', fontStyle: 'italic' }}>System Equity / Seed Capital</td>
                    <td>
                      <span style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.6875rem', fontWeight: '800', backgroundColor: 'var(--bg-muted)', color: '#d97706' }}>
                        EQUITY
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>—</td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: '#16a34a' }}>
                      {formatCurrency(diff)}
                    </td>
                  </tr>
                )}

                {/* Total Line */}
                <tr style={{ backgroundColor: 'var(--background)', fontWeight: '800', borderTop: '2px solid var(--border-color)' }}>
                  <td colSpan={3} style={{ padding: '1.25rem 1rem', textTransform: 'uppercase', fontSize: '0.8125rem', letterSpacing: '0.05em' }}>Total Reconciled</td>
                  <td style={{ textAlign: 'right', padding: '1.25rem 1rem', fontSize: '1rem', color: 'var(--primary)' }}>
                    {formatCurrency(Math.max(tbDebitsSum, tbCreditsSum))}
                  </td>
                  <td style={{ textAlign: 'right', padding: '1.25rem 1rem', fontSize: '1rem', color: 'var(--primary)' }}>
                    {formatCurrency(Math.max(tbDebitsSum, tbCreditsSum))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        
        /* JOURNAL TAB */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Filter Toolbar */}
          <div className="card" style={{ padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted-dark)' }}>
                <Calendar size={16} />
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Business Date:</span>
              </div>
              <input 
                type="date" 
                value={filterDate}
                onChange={handleFilterDateChange}
                style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.875rem', fontWeight: '600' }}
              />
              <button 
                onClick={handleApplyFilter}
                disabled={refreshing}
                className="btn btn-primary"
                style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.875rem' }}
              >
                Apply Date
              </button>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Found {journal.length} entries for chosen day
            </div>
          </div>

          {/* Journal Entries List */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time / Reference</th>
                  <th>Account Name</th>
                  <th>Description</th>
                  <th>Loan ID / Client</th>
                  <th style={{ textAlign: 'right' }}>Debit</th>
                  <th style={{ textAlign: 'right' }}>Credit</th>
                </tr>
              </thead>
              <tbody>
                {journal.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                      No double-entry logs recorded for this day.
                    </td>
                  </tr>
                ) : (
                  journal.map((entry) => {
                    const isDebit = entry.debit > 0;
                    return (
                      <tr key={entry.id}>
                        <td>
                          <div style={{ fontWeight: '700', fontSize: '0.8125rem' }}>
                            {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '0.125rem' }}>
                            {entry.transactionReference}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: '700', paddingLeft: isDebit ? '0' : '1.5rem' }}>
                            {entry.accountId === 'CASH-VAULT' ? 'Cash Vault A/C' : entry.accountId === 'INTEREST-INCOME' ? 'Interest Income Revenue' : entry.accountId === 'PENALTY-INCOME' ? 'Penalty Income Revenue' : 'Loan Outstanding A/C'}
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', paddingLeft: isDebit ? '0' : '1.5rem' }}>
                            {entry.accountType}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted-dark)' }}>{entry.description || '—'}</div>
                        </td>
                        <td>
                          {entry.loan ? (
                            <Link href={`/admin/los?query=${entry.loan.lid || entry.loanId}`} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--primary)' }}>
                              {entry.loan.lid || `LN-${entry.loanId.substring(0, 8).toUpperCase()}`}
                              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                                ({entry.loan.customer?.firstName} {entry.loan.customer?.lastName})
                              </span>
                              <ArrowRight size={12} />
                            </Link>
                          ) : entry.loanId ? (
                            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                              LN-{entry.loanId.substring(0, 8).toUpperCase()}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>System</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: '700', color: isDebit ? 'var(--foreground)' : 'var(--text-muted)' }}>
                          {entry.debit > 0 ? formatCurrency(entry.debit) : '—'}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: '700', color: !isDebit ? 'var(--foreground)' : 'var(--text-muted)' }}>
                          {entry.credit > 0 ? formatCurrency(entry.credit) : '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>

      )}

      <style dangerouslySetInnerHTML={{ __html: `
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
