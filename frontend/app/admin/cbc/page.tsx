'use client';

import React, { useState } from 'react';
import { Search, ShieldCheck, AlertCircle, Info, RefreshCw, FileText, CheckCircle, Clock } from 'lucide-react';

interface Contract {
  institution: string;
  type: string;
  amount: number;
  outstanding: number;
  monthlyPayment: number;
  status: string;
  openedDate: string;
}

interface CBCReport {
  score: number;
  riskGrade: string;
  totalLoans: number;
  activeLoans: number;
  totalOutstanding: number;
  totalMonthlyObligation: number;
  delinquencies: {
    pd30: number;
    pd60: number;
    pd90: number;
  };
  contracts: Contract[];
  inquiries: { date: string; institution: string; purpose: string }[];
}

const mockData: Record<string, CBCReport> = {
  sophea: {
    score: 724,
    riskGrade: 'Low Risk',
    totalLoans: 4,
    activeLoans: 2,
    totalOutstanding: 12400,
    totalMonthlyObligation: 320,
    delinquencies: { pd30: 0, pd60: 0, pd90: 0 },
    contracts: [
      { institution: 'Acabar Plc', type: 'Micro Loan', amount: 5000, outstanding: 3400, monthlyPayment: 120, status: 'Normal', openedDate: '2025-08-14' },
      { institution: 'ABA Bank', type: 'Credit Card', amount: 10000, outstanding: 9000, monthlyPayment: 200, status: 'Normal', openedDate: '2026-01-10' }
    ],
    inquiries: [
      { date: '2026-05-27', institution: 'Acabar Plc', purpose: 'Loan Application' },
      { date: '2026-01-08', institution: 'ABA Bank', purpose: 'Credit Card Application' },
      { date: '2025-08-10', institution: 'Acabar Plc', purpose: 'Loan Inquiry' }
    ]
  },
  samnang: {
    score: 590,
    riskGrade: 'Medium Risk',
    totalLoans: 6,
    activeLoans: 3,
    totalOutstanding: 28500,
    totalMonthlyObligation: 850,
    delinquencies: { pd30: 1, pd60: 0, pd90: 0 },
    contracts: [
      { institution: 'Sathapana Bank', type: 'Business Loan', amount: 20000, outstanding: 17200, monthlyPayment: 500, status: '30 Days Overdue', openedDate: '2024-11-05' },
      { institution: 'ABA Bank', type: 'Personal Loan', amount: 8000, outstanding: 6300, monthlyPayment: 250, status: 'Normal', openedDate: '2025-03-20' },
      { institution: 'Canadia Bank', type: 'Credit Card', amount: 5000, outstanding: 5000, monthlyPayment: 100, status: 'Normal', openedDate: '2025-06-15' }
    ],
    inquiries: [
      { date: '2026-05-20', institution: 'Acabar Plc', purpose: 'Micro Loan Application' },
      { date: '2025-03-15', institution: 'ABA Bank', purpose: 'Personal Loan Inquiry' }
    ]
  },
  bopa: {
    score: 410,
    riskGrade: 'High Risk',
    totalLoans: 3,
    activeLoans: 2,
    totalOutstanding: 9800,
    totalMonthlyObligation: 420,
    delinquencies: { pd30: 0, pd60: 2, pd90: 1 },
    contracts: [
      { institution: 'Chip Mong Bank', type: 'Consumer Loan', amount: 5000, outstanding: 4200, monthlyPayment: 180, status: '90+ Days Overdue', openedDate: '2024-05-12' },
      { institution: 'Hattha Bank', type: 'Agricultural Loan', amount: 6000, outstanding: 5600, monthlyPayment: 240, status: '60 Days Overdue', openedDate: '2024-09-18' }
    ],
    inquiries: [
      { date: '2026-05-25', institution: 'Acabar Plc', purpose: 'Emergency Loan Inquiry' },
      { date: '2025-09-10', institution: 'Hattha Bank', purpose: 'Agri Loan Assessment' }
    ]
  }
};

export default function CbcPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [report, setReport] = useState<CBCReport | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    setReport(null);
    setLoadingStep(0);

    const steps = [
      'Establishing secure connection with CBC Cambodia Gateway...',
      'Retrieving client biometric & registration identity match...',
      'Querying active bank credit and loan contracts...',
      'Compiling K-Score credit report and generating analysis...'
    ];

    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current < steps.length) {
        setLoadingStep(current);
      } else {
        clearInterval(interval);
        setLoading(false);
        const nameKey = query.toLowerCase().replace(/[^a-z]/g, '');
        const matched = Object.keys(mockData).find(key => nameKey.includes(key));
        if (matched) {
          setReport(mockData[matched]);
        } else {
          // Default clean score if not matched
          setReport({
            score: 795,
            riskGrade: 'Excellent',
            totalLoans: 1,
            activeLoans: 0,
            totalOutstanding: 0,
            totalMonthlyObligation: 0,
            delinquencies: { pd30: 0, pd60: 0, pd90: 0 },
            contracts: [],
            inquiries: [{ date: '2026-05-27', institution: 'Acabar Plc', purpose: 'Standard Credit Inquiry' }]
          });
        }
      }
    }, 600);
  };

  const getScoreColor = (score: number) => {
    if (score >= 700) return 'var(--success-text)'; // Green
    if (score >= 550) return 'var(--amber-text)'; // Amber
    return 'var(--error-text)'; // Red
  };

  const getStatusStyle = (status: string) => {
    if (status === 'Normal') return { color: 'var(--success-text)', backgroundColor: 'var(--success-bg)' };
    if (status.includes('30 Days')) return { color: 'var(--warning-text)', backgroundColor: 'var(--warning-bg)' };
    return { color: 'var(--error-text)', backgroundColor: 'var(--error-bg)' };
  };

  const steps = [
    'Establishing secure connection with CBC Cambodia Gateway...',
    'Retrieving client biometric & registration identity match...',
    'Querying active bank credit and loan contracts...',
    'Compiling K-Score credit report and generating analysis...'
  ];

  return (
    <div style={{ animation: 'fadeIn 0.5s ease', maxWidth: '1200px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
        <div style={{ padding: '1rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.2)' }}>
          <ShieldCheck size={28} />
        </div>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.03em', margin: 0, color: 'var(--foreground)' }}>
            CBC <span className="text-gradient">Inquiry Simulator</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>
            Check real-time credit status and K-Scores registered in Credit Bureau Cambodia (CBC)
          </p>
        </div>
      </div>

      {/* Inquiry Form */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Customer Name (e.g. Sophea, Samnang, Bopa)"
              style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '1rem', color: 'var(--foreground)', backgroundColor: 'var(--card-bg)' }}
            />
          </div>
          <button className="btn btn-primary" type="submit" style={{ padding: '0 2.5rem', fontWeight: '600' }}>
            Query Bureau
          </button>
        </form>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', alignItems: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <Info size={16} />
          <span>Type: <b>Sophea</b> (Low Risk), <b>Samnang</b> (Medium Risk Overdue), or <b>Bopa</b> (High Risk Delinquent) for simulated reports.</span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <RefreshCw size={48} className="animate-spin" color="var(--primary)" />
          <div style={{ fontWeight: '700', fontSize: '1.25rem', color: 'var(--foreground)' }}>
            {steps[loadingStep]}
          </div>
          <div style={{ width: '300px', height: '6px', backgroundColor: 'var(--bg-muted)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${(loadingStep + 1) * 25}%`, height: '100%', backgroundColor: 'var(--primary)', transition: 'width 0.4s ease' }}></div>
          </div>
        </div>
      )}

      {/* Results */}
      {report && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '2rem', animation: 'fadeIn 0.4s ease' }}>
          
          {/* Left Column: Credit Score Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="card" style={{ padding: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>K-Score & Risk Profile</h3>
              
              {/* Dial Chart */}
              <div style={{ position: 'relative', width: '180px', height: '180px' }}>
                <svg width="180" height="180" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border-color)" strokeWidth="8" strokeDasharray="188 251" strokeLinecap="round" transform="rotate(-210 50 50)" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke={getScoreColor(report.score)} strokeWidth="8" 
                    strokeDasharray={`${(report.score / 800) * 188} 251`} 
                    strokeLinecap="round" transform="rotate(-210 50 50)" 
                    style={{ transition: 'stroke-dasharray 1s ease' }}
                  />
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '2.25rem', fontWeight: '900', color: 'var(--foreground)' }}>{report.score}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>of 800</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: getScoreColor(report.score) }}>{report.riskGrade}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Based on CBC Rating algorithms</div>
              </div>
            </div>

            {/* Delinquency Counter */}
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Delinquency Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', textAlign: 'center' }}>
                <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px', backgroundColor: report.delinquencies.pd30 > 0 ? 'var(--warning-bg)' : 'var(--background)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: report.delinquencies.pd30 > 0 ? 'var(--warning-text)' : 'var(--foreground)' }}>{report.delinquencies.pd30}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>30+ DPD</div>
                </div>
                <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px', backgroundColor: report.delinquencies.pd60 > 0 ? 'var(--error-bg)' : 'var(--background)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: report.delinquencies.pd60 > 0 ? 'var(--error-text)' : 'var(--foreground)' }}>{report.delinquencies.pd60}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>60+ DPD</div>
                </div>
                <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px', backgroundColor: report.delinquencies.pd90 > 0 ? 'var(--error-bg)' : 'var(--background)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: report.delinquencies.pd90 > 0 ? 'var(--error-text)' : 'var(--foreground)' }}>{report.delinquencies.pd90}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>90+ DPD</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Bureau Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Key Figures */}
            <div className="card" style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Loan Contracts</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--foreground)', marginTop: '0.25rem' }}>{report.activeLoans} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>of {report.totalLoans} total</span></div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Outstanding Obligations</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--foreground)', marginTop: '0.25rem' }}>${report.totalOutstanding.toLocaleString()}</div>
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Monthly Repayment Sum</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--foreground)', marginTop: '0.25rem' }}>${report.totalMonthlyObligation.toLocaleString()}</div>
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Inquiries (30 Days)</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--foreground)', marginTop: '0.25rem' }}>{report.inquiries.length}</div>
              </div>
            </div>

            {/* Credit Contracts details */}
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.125rem', fontWeight: '800', color: 'var(--foreground)' }}>Active Credit Contracts</h3>
              
              {report.contracts.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed #cbd5e1', borderRadius: '12px' }}>
                  No active credit contracts reported in the registry.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {report.contracts.map((c, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                      <div>
                        <div style={{ fontWeight: '700', color: 'var(--foreground)' }}>{c.institution}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Type: {c.type} | Opened: {c.openedDate}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '800', color: 'var(--foreground)' }}>${c.outstanding.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-muted)' }}>of ${c.amount.toLocaleString()}</span></div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>${c.monthlyPayment}/mo</span>
                          <span style={{ padding: '0.125rem 0.5rem', borderRadius: '6px', fontSize: '0.6875rem', fontWeight: '700', ...getStatusStyle(c.status) }}>{c.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Inquiries */}
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.125rem', fontWeight: '800', color: 'var(--foreground)' }}>Inquiry History</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {report.inquiries.map((inq, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', borderBottom: '1px dashed var(--border-color)', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--foreground)', fontWeight: '600' }}>
                      <Clock size={16} color="var(--text-muted)" />
                      {inq.institution}
                    </div>
                    <div style={{ color: 'var(--text-muted)' }}>Purpose: {inq.purpose} | {inq.date}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Default placeholder instructions */}
      {!report && !loading && (
        <div style={{ textAlign: 'center', padding: '6rem 2rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <FileText size={64} style={{ opacity: 0.4 }} />
          <div>
            <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1.25rem', fontWeight: '700' }}>Ready for Inquiry</h3>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.9375rem' }}>Enter a customer name above to query the Credit Bureau Cambodia registry.</p>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .text-gradient {
          color: var(--foreground);
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
