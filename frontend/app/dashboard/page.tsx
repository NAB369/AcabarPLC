'use client';

import { useEffect, useState } from 'react';

interface User {
  firstName: string;
  lastName: string;
  wallet?: {
    balance: number;
  };
}

interface Loan {
  id: string;
  status: string;
  principalAmount: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // KHQR Modal State
  const [qrData, setQrData] = useState<{ image: string, data: string, loanId: string, amount: number } | null>(null);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      try {
        const userRes = await fetch('http://localhost:4000/api/v1/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        } else {
          window.location.href = '/login';
          return;
        }

        const loansRes = await fetch('http://localhost:4000/api/v1/loans', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (loansRes.ok) {
          const loansData = await loansRes.json();
          setLoans(loansData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApplyLoan = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const res = await fetch('http://localhost:4000/api/v1/loans', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          principalAmount: 5000,
          interestRate: 10,
          interestType: 'FLAT',
          durationMonths: 12
        })
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayViaKHQR = async (loanId: string, amount: number = 100) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('http://localhost:4000/api/v1/payments/qr/generate', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ loanId, amount })
      });
      if (res.ok) {
        const data = await res.json();
        setQrData({ image: data.qrImage, data: data.qrData, loanId, amount });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const simulateBankWebhook = async () => {
    if (!qrData) return;
    setIsSimulatingPayment(true);
    try {
      const res = await fetch('http://localhost:4000/api/v1/payments/qr/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loanId: qrData.loanId,
          amount: qrData.amount,
          status: 'SUCCESS',
          transactionId: `TXN_${Date.now()}`
        })
      });
      if (res.ok) {
        alert('Payment Success! Webhook verified.');
        setQrData(null);
        window.location.reload(); // Refresh data
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulatingPayment(false);
    }
  };

  if (isLoading) return <div className="py-[var(--spacing-xl)] text-center">Loading your vault...</div>;
  if (!user) return null;

  return (
    <div className="py-[var(--spacing-xl)] animate-fade-in">
      <div className="flex justify-between items-center mb-[var(--spacing-2xl)] flex-wrap gap-4">
        <div>
          <h2 className="mb-[var(--spacing-xs)]">Hello, <span className="text-gradient">{user.firstName} {user.lastName}</span></h2>
          <p>Welcome back to your financial dashboard.</p>
        </div>
        <div className="glass-panel" style={{ padding: 'var(--spacing-md) var(--spacing-xl)' }}>
          <div className="text-[0.875rem] text-[rgba(255,255,255,0.7)] mb-[var(--spacing-xs)]">Wallet Balance</div>
          <div className="text-2xl font-bold text-gradient">${Number(user.wallet?.balance || 0).toFixed(2)}</div>
        </div>
      </div>

      <div className="flex gap-8 flex-wrap">
        <div className="flex-1 min-w-[300px]">
          <h3 className="mb-[var(--spacing-lg)]">Your Active Loans</h3>
          <div className="flex flex-col gap-4">
            {loans.length === 0 ? (
              <div className="text-[rgba(255,255,255,0.5)]">No active loans. Apply for one to get started.</div>
            ) : loans.map((loan) => (
              <div key={loan.id} className="glass-panel hover:transform-none" style={{ padding: 'var(--spacing-lg)' }}>
                <div className="flex justify-between items-center mb-[var(--spacing-md)]">
                  <div className="font-bold">{loan.id.split('-')[0]}...</div>
                  <div className={`text-[0.875rem] px-[0.75rem] py-[0.25rem] rounded-full ${
                    loan.status === 'ACTIVE' ? 'bg-[#10b98120] text-[#10b981]' : 
                    loan.status === 'PENDING' ? 'bg-[#f59e0b20] text-[#f59e0b]' :
                    'bg-[#ef444420] text-[#ef4444]'
                  }`}>
                    {loan.status}
                  </div>
                </div>
                <div className="flex justify-between mb-[var(--spacing-md)]">
                  <div>
                    <div className="text-[0.875rem] opacity-70">Principal</div>
                    <div className="font-bold">${Number(loan.principalAmount).toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[0.875rem] opacity-70">Next EMI</div>
                    <div className="font-bold">Pending Schedule</div>
                  </div>
                </div>
                {loan.status !== 'PENDING' && (
                  <button onClick={() => handlePayViaKHQR(loan.id, 100)} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
                    Pay $100 via KHQR
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-[300px]">
          <h3 className="mb-[var(--spacing-lg)]">Quick Actions</h3>
          <div className="glass-panel flex flex-col gap-4">
            <button onClick={handleApplyLoan} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
              <span className="text-[1.5rem] mr-[var(--spacing-sm)]">📄</span> Apply for a new loan ($5k)
            </button>
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
              <span className="text-[1.5rem] mr-[var(--spacing-sm)]">💳</span> Top up wallet
            </button>
          </div>
        </div>
      </div>

      {qrData && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel text-center animate-slide-up" style={{ minWidth: 350 }}>
            <h3 className="mb-[var(--spacing-md)]">Scan KHQR to Pay</h3>
            <div className="bg-white p-4 rounded-lg inline-block mb-[var(--spacing-lg)]">
              <img src={qrData.image} alt="KHQR" width="200" height="200" />
            </div>
            <p className="text-[0.875rem] opacity-70 mb-[var(--spacing-lg)]">Amount: ${qrData.amount}</p>
            
            <div className="flex flex-col gap-2">
              <button onClick={simulateBankWebhook} disabled={isSimulatingPayment} className="btn btn-primary">
                {isSimulatingPayment ? 'Processing...' : 'Simulate Bank App Payment'}
              </button>
              <button onClick={() => setQrData(null)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
