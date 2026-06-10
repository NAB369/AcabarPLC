'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { 
  Play, StopCircle, RefreshCw, Calendar, 
  CheckCircle, AlertTriangle, ShieldAlert, Clock
} from 'lucide-react';

export default function PeriodPanelPage() {
  const [state, setState] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [stateData, logsData] = await Promise.all([
        api.get('/period/state'),
        api.get('/period/logs'),
      ]);
      setState(stateData);
      setLogs(logsData);
    } catch (err: any) {
      console.error('Failed to load period panel data', err);
      setError('Failed to load period panel data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStartOfDay = async () => {
    if (!confirm('Are you sure you want to perform Start of Day (SOD)? This will advance the business date by 1 day.')) return;
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.post('/period/sod', {});
      setSuccess('Start of Day completed successfully. Business day is now OPEN.');
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Start of Day operation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndOfDay = async () => {
    if (!confirm('Are you sure you want to perform End of Day (EOD)? This will close the day, accrue daily interest, and process late penalties.')) return;
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.post('/period/eod', {});
      setSuccess(`End of Day completed successfully. Accrued $${res.interestAccrued.toFixed(2)} interest on active loans, updated penalties for ${res.penaltiesRecalculated} accounts.`);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'End of Day operation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading && !state) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="animate-spin" style={{ width: '32px', height: '32px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.6s ease-out', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.03em', margin: 0 }}>
            Periodic <span className="text-gradient">Operations</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>
            Manage core banking business dates, Start of Day (SOD), and End of Day (EOD) closing
          </p>
        </div>
        <button 
          onClick={fetchData} 
          disabled={actionLoading}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', border: '1px solid var(--border-color)', borderRadius: '10px', backgroundColor: 'var(--card-bg)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600' }}
        >
          <RefreshCw size={16} /> Refresh Panel
        </button>
      </div>

      {success && (
        <div style={{ padding: '1rem 1.5rem', backgroundColor: 'var(--success-bg)', border: '1px solid #bbf7d0', borderRadius: '12px', color: '#166534', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <CheckCircle size={20} style={{ flexShrink: 0 }} /> {success}
        </div>
      )}

      {error && (
        <div style={{ padding: '1rem 1.5rem', backgroundColor: 'var(--error-bg)', border: '1px solid #fecaca', borderRadius: '12px', color: 'var(--error-text)', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <ShieldAlert size={20} style={{ flexShrink: 0 }} /> {error}
        </div>
      )}

      {/* Main Panel grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem', alignItems: 'start' }}>
        
        {/* Left Side: System status & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', top: 0, right: 0, width: '6px', height: '100%',
              backgroundColor: state?.isOpen ? '#10b981' : '#ef4444'
            }} />
            
            <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Current System State
            </h3>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '16px',
                backgroundColor: state?.isOpen ? '#ecfdf5' : '#fef2f2',
                color: state?.isOpen ? '#10b981' : '#ef4444',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Calendar size={32} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--foreground)' }}>
                  {formatDate(state?.businessDate)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <span style={{
                    display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%',
                    backgroundColor: state?.isOpen ? '#10b981' : '#ef4444'
                  }} />
                  <span style={{
                    fontSize: '0.875rem', fontWeight: '700',
                    color: state?.isOpen ? '#10b981' : '#ef4444'
                  }}>
                    System is {state?.isOpen ? 'OPEN' : 'CLOSED'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '2.5rem', paddingTop: '2rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '700' }}>Operations Control</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                {state?.isOpen 
                  ? 'The business day is currently active. Transactions (disbursements and repayments) are open. When the bank operations close, run End of Day to post interest accruals and close the books.'
                  : 'The business day is closed. Repayments and disbursements are locked. Run Start of Day to advance to the next calendar date and open the bank.'}
              </p>

              <div style={{ display: 'flex', gap: '1rem' }}>
                {state?.isOpen ? (
                  <button 
                    onClick={handleEndOfDay}
                    disabled={actionLoading}
                    className="btn"
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                      backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '0.875rem',
                      fontWeight: '600', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {actionLoading ? <RefreshCw className="animate-spin" size={18} /> : <StopCircle size={18} />}
                    Run End of Day (EOD)
                  </button>
                ) : (
                  <button 
                    onClick={handleStartOfDay}
                    disabled={actionLoading}
                    className="btn"
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                      backgroundColor: '#10b981', color: 'white', border: 'none', padding: '0.875rem',
                      fontWeight: '600', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {actionLoading ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
                    Run Start of Day (SOD)
                  </button>
                )}
              </div>
            </div>
          </div>

          <div style={{ padding: '1.5rem', border: '1px dashed #f59e0b', backgroundColor: '#fffbeb', color: '#b45309', borderRadius: '16px', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <AlertTriangle size={24} style={{ flexShrink: 0 }} />
            <div>
              <h5 style={{ margin: 0, fontWeight: '700', fontSize: '0.875rem' }}>Banking Compliance Rule</h5>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', lineHeight: '1.4' }}>
                Interest accruals and penalty calculations are irreversible. Running SOD/EOD shifts the accounting period. Ensure all teller balances are reconciled before ending the business day.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Periodic Log History */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '580px', overflow: 'hidden' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} color="var(--primary)" /> Operation Audit Log
          </h3>

          <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {logs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No operations logs found.
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      padding: '0.25rem 0.625rem', borderRadius: '6px', fontSize: '0.6875rem', fontWeight: '800',
                      backgroundColor: log.action === 'SOD' ? '#ecfdf5' : '#fef2f2',
                      color: log.action === 'SOD' ? '#10b981' : '#ef4444',
                    }}>
                      {log.action}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--foreground)' }}>
                    Business Date: {new Date(log.businessDate).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted-dark)', lineHeight: '1.4' }}>
                    {log.details}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

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
