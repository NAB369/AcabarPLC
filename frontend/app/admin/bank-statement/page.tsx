'use client';

import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, ArrowUpRight, ArrowDownRight, TrendingUp, AlertTriangle, CheckCircle, Info, Sparkles } from 'lucide-react';

interface Transaction {
  date: string;
  description: string;
  category: string;
  amount: number;
  balance: number;
  flag?: string;
}

interface StatementAnalysis {
  bankName: string;
  accountHolder: string;
  avgMonthlyIncome: number;
  avgMonthlyExpense: number;
  netSavingsRate: number;
  dtiRatio: number;
  dscr: number;
  stabilityScore: number;
  transactions: Transaction[];
}

const mockStatements: Record<string, StatementAnalysis> = {
  aba: {
    bankName: 'ABA Bank',
    accountHolder: 'Kimsour Sophea',
    avgMonthlyIncome: 3500,
    avgMonthlyExpense: 2200,
    netSavingsRate: 37.1,
    dtiRatio: 24.5,
    dscr: 2.4,
    stabilityScore: 95,
    transactions: [
      { date: '2026-05-01', description: 'SALARY / SOVANN CO., LTD.', category: 'Salary', amount: 3500, balance: 4200 },
      { date: '2026-05-03', description: 'RENT Repayment - Condo Room', category: 'Housing', amount: -600, balance: 3600 },
      { date: '2026-05-05', description: 'EDC ELECTRICITY PAYMENT', category: 'Utilities', amount: -85, balance: 3515 },
      { date: '2026-05-10', description: 'PPWSA WATER SUPPLY', category: 'Utilities', amount: -20, balance: 3495 },
      { date: '2026-05-12', description: 'LUCKY SUPERMARKET', category: 'Groceries', amount: -150, balance: 3345 },
      { date: '2026-05-15', description: 'ABA CREDIT CARD BILL', category: 'Debt Repayment', amount: -320, balance: 3025 },
      { date: '2026-05-18', description: 'BROWN COFFEE IJC', category: 'Discretionary', amount: -12.5, balance: 3012.5 },
      { date: '2026-05-22', description: 'TRANSFER FROM MOM', category: 'Transfer', amount: 150, balance: 3162.5 }
    ]
  },
  acleda: {
    bankName: 'ACLEDA Bank',
    accountHolder: 'Chea Samnang',
    avgMonthlyIncome: 1800,
    avgMonthlyExpense: 1750,
    netSavingsRate: 2.7,
    dtiRatio: 48.2,
    dscr: 1.1,
    stabilityScore: 68,
    transactions: [
      { date: '2026-05-01', description: 'SALARY TRANSFER', category: 'Salary', amount: 1800, balance: 1950 },
      { date: '2026-05-02', description: 'APARTMENT RENT', category: 'Housing', amount: -400, balance: 1550 },
      { date: '2026-05-05', description: 'LOAN REPAYMENT INSTALLMENT', category: 'Debt Repayment', amount: -750, balance: 800, flag: 'High Debt Ratio' },
      { date: '2026-05-08', description: 'CASH DEPOSIT', category: 'Cash Deposit', amount: 300, balance: 1100 },
      { date: '2026-05-12', description: 'NON-SUFFICIENT FUNDS FEE', category: 'Bank Fees', amount: -25, balance: 1075, flag: 'NSF Alert' },
      { date: '2026-05-15', description: 'AEON MALL PURCHASE', category: 'Discretionary', amount: -280, balance: 795 },
      { date: '2026-05-20', description: 'FOOD OUTLET', category: 'Discretionary', amount: -110, balance: 685 }
    ]
  }
};

export default function BankStatementPage() {
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [analysis, setAnalysis] = useState<StatementAnalysis | null>(null);

  const simulateAnalysis = (key: string) => {
    setLoading(true);
    setAnalysis(null);
    setLoadingStep(0);

    const interval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev < 3) return prev + 1;
        clearInterval(interval);
        setLoading(false);
        setAnalysis(mockStatements[key]);
        return 3;
      });
    }, 650);
  };

  const getDtiColor = (ratio: number) => {
    if (ratio < 30) return '#10b981'; // Green
    if (ratio < 45) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const steps = [
    'Parsing uploaded statement and reading metadata...',
    'Performing OCR parsing on transaction table lines...',
    'Categorizing income streams and structural expenses...',
    'Calculating DTI, DSCR, and compiling financial dashboard...'
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
        <div style={{ padding: '1rem', backgroundColor: '#3b82f6', color: 'white', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}>
          <FileSpreadsheet size={28} />
        </div>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.03em', margin: 0, color: 'var(--foreground)' }}>
            Bank Statement <span style={{ color: '#3b82f6' }}>Analyzer</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>
            Upload customer bank statements to automatically audit income, debt metrics, and transaction risk markers
          </p>
        </div>
      </div>

      {/* Upload Zone & Samples */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Upload Zone */}
        <div className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #cbd5e1', cursor: 'pointer', textAlign: 'center' }}>
          <UploadCloud size={48} color="#3b82f6" style={{ marginBottom: '1rem' }} />
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>Upload Bank Statement PDF</h3>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.5rem', maxWidth: '300px' }}>Drag and drop files here, or click to browse. Supports standard PDF export formats.</p>
        </div>

        {/* Sample Selection */}
        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="#3b82f6" /> Quick Test Samples
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>Select a pre-configured sample statement to verify DTI and automated transaction parsing.</p>
          
          <button className="btn btn-secondary" onClick={() => simulateAnalysis('aba')} style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderRadius: '12px', width: '100%', border: '1px solid #e2e8f0', textAlign: 'left' }}>
            <div>
              <div style={{ fontWeight: '700', color: '#0f172a' }}>ABA Bank - Sophea</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Regular salary, stable savings, DTI 24.5%</div>
            </div>
            <ArrowUpRight size={20} color="#3b82f6" />
          </button>

          <button className="btn btn-secondary" onClick={() => simulateAnalysis('acleda')} style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderRadius: '12px', width: '100%', border: '1px solid #e2e8f0', textAlign: 'left' }}>
            <div>
              <div style={{ fontWeight: '700', color: '#0f172a' }}>ACLEDA Bank - Samnang</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Tight margins, NSF fees, DTI 48.2%</div>
            </div>
            <ArrowUpRight size={20} color="#3b82f6" />
          </button>
        </div>

      </div>

      {/* Loading Steps */}
      {loading && (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid #cbd5e1', borderTopColor: '#3b82f6', borderRadius: '50%' }}></div>
          <div style={{ fontWeight: '700', fontSize: '1.25rem', color: '#1e293b' }}>
            {steps[loadingStep]}
          </div>
          <div style={{ width: '300px', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${(loadingStep + 1) * 25}%`, height: '100%', backgroundColor: '#3b82f6', transition: 'width 0.4s ease' }}></div>
          </div>
        </div>
      )}

      {/* Analysis Output */}
      {analysis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.4s ease' }}>
          
          {/* Metadata & Key Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Avg Monthly Inflow</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                ${analysis.avgMonthlyIncome.toLocaleString()}
                <ArrowUpRight size={20} color="#10b981" />
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>Identified recurring salaries</div>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Avg Monthly Outflow</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                ${analysis.avgMonthlyExpense.toLocaleString()}
                <ArrowDownRight size={20} color="#ef4444" />
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>Savings margin: {analysis.netSavingsRate}%</div>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Debt-To-Income (DTI)</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: getDtiColor(analysis.dtiRatio), marginTop: '0.25rem' }}>
                {analysis.dtiRatio}%
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                {analysis.dtiRatio < 36 ? 'Healthy Credit Load' : 'High Debt Burden'}
              </div>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Income Stability</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', marginTop: '0.25rem' }}>
                {analysis.stabilityScore}%
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                {analysis.stabilityScore > 80 ? 'Highly Reliable' : 'Volatile Cash Flows'}
              </div>
            </div>

          </div>

          {/* Statement Account Information */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Account Holder</div>
                <div style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0f172a', marginTop: '0.25rem' }}>{analysis.accountHolder}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Banking Institution</div>
                <div style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0f172a', marginTop: '0.25rem' }}>{analysis.bankName}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Debt Service Coverage (DSCR)</div>
                <div style={{ fontSize: '1.125rem', fontWeight: '700', color: analysis.dscr > 1.5 ? '#10b981' : '#f59e0b', marginTop: '0.25rem' }}>{analysis.dscr}x</div>
              </div>
            </div>
          </div>

          {/* Parsed Transactions Grid */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>Parsed Statement Transactions</h3>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700' }}>
                    <th style={{ padding: '1rem 0.5rem' }}>Date</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Description</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Category</th>
                    <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Amount</th>
                    <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Balance</th>
                    <th style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>Audit Flag</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.transactions.map((tx, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.9375rem', color: '#1e293b' }}>
                      <td style={{ padding: '1rem 0.5rem', whiteSpace: 'nowrap' }}>{tx.date}</td>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: '600' }}>{tx.description}</td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <span style={{ padding: '0.25rem 0.625rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#f1f5f9', color: '#475569' }}>
                          {tx.category}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem', textAlign: 'right', fontWeight: '700', color: tx.amount > 0 ? '#10b981' : '#0f172a' }}>
                        {tx.amount > 0 ? `+$${tx.amount.toLocaleString()}` : `-$${Math.abs(tx.amount).toLocaleString()}`}
                      </td>
                      <td style={{ padding: '1rem 0.5rem', textAlign: 'right', color: '#64748b' }}>${tx.balance.toLocaleString()}</td>
                      <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                        {tx.flag ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.625rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: '#fff3cd', color: '#664d03' }}>
                            <AlertTriangle size={12} />
                            {tx.flag}
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.625rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: '#ecfdf5', color: '#047857' }}>
                            <CheckCircle size={12} />
                            Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Placeholder State */}
      {!analysis && !loading && (
        <div style={{ textAlign: 'center', padding: '6rem 2rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <UploadCloud size={64} style={{ opacity: 0.4 }} />
          <div>
            <h3 style={{ margin: 0, color: '#64748b', fontSize: '1.25rem', fontWeight: '700' }}>No Statement Uploaded</h3>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.9375rem' }}>Upload a PDF statement or click one of our quick test samples to analyze client bank transactions.</p>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
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
