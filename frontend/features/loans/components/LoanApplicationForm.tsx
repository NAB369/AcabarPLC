'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../../services/api';
import { 
  User, Briefcase, DollarSign, Calendar, 
  Search, CheckCircle, AlertCircle, X,
  FileText, ArrowRight, Info, Phone, Mail, CreditCard, Globe, ShieldCheck,
  MapPin, CircleUser, UserCheck, Percent, Banknote, Clock, RefreshCw
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  baseInterestRate: number;
  interestType: string;
  minAmount: number;
  maxAmount: number;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  khmerFirstName?: string;
  khmerLastName?: string;
  email: string;
  phone: string;
  nationalId?: string;
  passport?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  cid?: string;
}

interface CreditOfficer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  branch?: { name: string };
  roles: { role: { name: string } }[];
}

export default function LoanApplicationForm() {
  const searchParams = useSearchParams();
  const preSelectedProductId = searchParams.get('productId');
  const preSelectedCustomerId = searchParams.get('customerId');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdLoanId, setCreatedLoanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [creditOfficers, setCreditOfficers] = useState<CreditOfficer[]>([]);
  const [selectedOfficer, setSelectedOfficer] = useState<CreditOfficer | null>(null);
  const [officerSearch, setOfficerSearch] = useState('');
  const [officerDropdownOpen, setOfficerDropdownOpen] = useState(false);
  const officerRef = useRef<HTMLDivElement>(null);
  
  const [customerSearch, setCustomerSearch] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const [amount, setAmount] = useState<number>(0);
  const [duration, setDuration] = useState<number>(12);

  // New extended loan term fields
  const [currency, setCurrency] = useState<'USD' | 'KHR'>('USD');
  const [disbursementDate, setDisbursementDate] = useState('');
  const [repaymentType, setRepaymentType] = useState<'DAILY' | 'WEEKLY' | 'TWO_WEEKLY' | 'MONTHLY'>('MONTHLY');
  const [firstInstallmentDate, setFirstInstallmentDate] = useState('');
  const [numberOfInstallments, setNumberOfInstallments] = useState<number>(12);
  const [interestRate, setInterestRate] = useState<number>(0);
  const [penaltyRate, setPenaltyRate] = useState<number>(0);
  const [adminFeeRate, setAdminFeeRate] = useState<number>(0);
  const [collectionFeeType, setCollectionFeeType] = useState<'RATE' | 'AMOUNT'>('RATE');
  const [collectionFeeValue, setCollectionFeeValue] = useState<number>(0);
  const [gracePeriod, setGracePeriod] = useState<number>(0);
  const [refinanceFeeAmt, setRefinanceFeeAmt] = useState<number>(0);

  // Additional Fields
  const [loanCycle, setLoanCycle] = useState('New');
  const [recommenderType, setRecommenderType] = useState('OFFICE');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [reasonOfCredit, setReasonOfCredit] = useState('');
  const [loanNote, setLoanNote] = useState('Normal Loan');
  const [memoReasonOfCredit, setMemoReasonOfCredit] = useState('');
  const [collaterals, setCollaterals] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { id: 1, label: 'Customer & Officer' },
    { id: 2, label: 'Loan Terms' },
    { id: 3, label: 'Details & Collaterals' }
  ];

  const handleNextStep1 = () => {
    if (!selectedCustomer) {
      setError('Please select a customer before proceeding.');
      return;
    }
    setError(null);
    setCurrentStep(2);
  };

  const handleNextStep2 = () => {
    if (!selectedProduct) {
      setError('Please select a product before proceeding.');
      return;
    }
    if (amount <= 0) {
      setError('Please enter a valid loan amount before proceeding.');
      return;
    }
    setError(null);
    setCurrentStep(3);
  };

  const [cbcChecked, setCbcChecked] = useState(false);
  const [checkingCbc, setCheckingCbc] = useState(false);
  const [cbcScore, setCbcScore] = useState<{score: number, status: string} | null>(null);

  const runCbcCheck = () => {
    setCheckingCbc(true);
    setTimeout(() => {
      // Mock CBC verification
      setCbcScore({ score: 742, status: 'Excellent' });
      setCbcChecked(true);
      setCheckingCbc(false);
    }, 1500);
  };

  const [lid, setLid] = useState('');
  const [autoGenerateLid, setAutoGenerateLid] = useState(true);
  const [generatingLid, setGeneratingLid] = useState(false);

  const handleGenerateLid = async () => {
    setGeneratingLid(true);
    try {
      const response = await api.get('/los/next-lid');
      setLid(response.lid);
    } catch (err) {
      console.error('Failed to generate LID', err);
      // Fallback
      setLid(`LID-${Math.floor(100000 + Math.random() * 900000)}`);
    } finally {
      setGeneratingLid(false);
    }
  };

  const handleToggleAutoGenerateLid = async () => {
    const newVal = !autoGenerateLid;
    setAutoGenerateLid(newVal);
    if (newVal) {
      await handleGenerateLid();
    }
  };

  // Initialize LID on mount if auto-generate is true
  useEffect(() => {
    if (autoGenerateLid) {
      handleGenerateLid();
    }
  }, []);

  // Fetch credit officers and branches on mount
  useEffect(() => {
    api.get('/users/credit-officers')
      .then((data: CreditOfficer[]) => setCreditOfficers(data))
      .catch(() => { /* non-blocking */ });

    api.get('/branches')
      .then((data: any[]) => setBranches(data))
      .catch(() => { /* non-blocking */ });
  }, []);

  // Close officer dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (officerRef.current && !officerRef.current.contains(e.target as Node)) {
        setOfficerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.get('/loans/products');
        setProducts(data);

        // Handle pre-selection
        if (preSelectedProductId) {
          const prod = data.find((p: Product) => p.id === preSelectedProductId);
          if (prod) {
            setSelectedProduct(prod);
            setAmount(prod.minAmount);
          }
        }
      } catch (err) {
        console.error('Failed to fetch products', err);
      }
    };
    fetchProducts();
  }, [preSelectedProductId]);

  // Pre-select customer if customerId is passed via URL (from client profile page)
  useEffect(() => {
    if (!preSelectedCustomerId) return;
    const fetchPreSelectedCustomer = async () => {
      try {
        const data = await api.get(`/customers/${preSelectedCustomerId}`);
        setSelectedCustomer(data);
        setCustomerSearch(`${data.firstName} ${data.lastName}`);
      } catch (err) {
        console.error('Failed to pre-load customer', err);
      }
    };
    fetchPreSelectedCustomer();
  }, [preSelectedCustomerId]);

  // Search customers when input changes
  useEffect(() => {
    const searchCustomers = async () => {
      if (customerSearch.length < 2) {
        setCustomers([]);
        return;
      }
      setIsSearching(true);
      try {
        const data = await api.get(`/customers/search?query=${encodeURIComponent(customerSearch)}`);
        setCustomers(data);
      } catch (err) {
        console.error('Search failed', err);
        setError('Failed to search customers. Please try again.');
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(searchCustomers, 300);
    return () => clearTimeout(timer);
  }, [customerSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !selectedProduct) {
      setError('Please select a customer and a product.');
      return;
    }
    if (amount <= 0) {
      setError('Please enter a valid loan amount.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Use LOS draft endpoint so the loan enters the proper pipeline as DRAFT
      const loan = await api.post('/los/draft', {
        customerId: selectedCustomer.id,
        productId: selectedProduct.id,
        principalAmount: amount,
        durationMonths: duration,
        applicationChannel: 'WEB',
        lid: lid || undefined,
        loanOfficerId: selectedOfficer?.id || undefined,
        currency,
        disbursementDate: disbursementDate || undefined,
        repaymentType,
        firstInstallmentDate: firstInstallmentDate || undefined,
        numberOfInstallments,
        interestRate,
        penaltyRate,
        adminFeeRate,
        collectionFeeType,
        collectionFeeValue,
        gracePeriod,
        refinanceFeeAmt,
        loanCycle,
        recommenderType,
        branchId: selectedBranch || undefined,
        reasonOfCredit,
        loanNote,
        memoReasonOfCredit,
        collaterals,
      });
      setCreatedLoanId(loan.id);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create application.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="card animate-fade-in" style={{ textAlign: 'center', padding: '4rem 2rem', border: 'none', boxShadow: 'var(--shadow-xl)' }}>
        <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
          <CheckCircle size={40} />
        </div>
        <h3 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--foreground)' }}>Draft Created!</h3>
        <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 0.75rem' }}>
          A loan application draft for <strong>{selectedCustomer?.firstName} {selectedCustomer?.lastName}</strong> has been created.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '420px', margin: '0 auto 2.5rem' }}>
          Open the application in the LOS Pipeline and click <strong>"Submit Application"</strong> to begin the review process.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={() => window.location.href = '/admin/los'}>
            View Pipeline
          </button>
          {createdLoanId && (
            <button className="btn btn-primary" onClick={() => window.location.href = `/admin/los/${createdLoanId}`}>
              Open Application →
            </button>
          )}
          <button className="btn btn-secondary" onClick={() => {
            setSuccess(false);
            setCreatedLoanId(null);
            setSelectedCustomer(null);
            setSelectedProduct(null);
            setAmount(0);
          }}>
            New Application
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="card animate-slide-up" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)', maxWidth: '760px', width: '100%' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--foreground)', marginBottom: '0.25rem' }}>Create Loan Application</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Complete the steps below to initiate the loan origination process.</p>
      </div>

      {/* Stepper Progress Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        {steps.map((step, idx) => (
          <React.Fragment key={step.id}>
            {idx > 0 && (
              <div style={{ flex: 1, height: '2px', backgroundColor: currentStep > idx ? 'var(--primary)' : '#e2e8f0', margin: '0 0.75rem' }} />
            )}
            <div 
              onClick={() => {
                if (step.id < currentStep) {
                  setCurrentStep(step.id);
                } else if (step.id === 2 && currentStep === 1) {
                  handleNextStep1();
                } else if (step.id === 3 && currentStep === 2) {
                  handleNextStep2();
                } else if (step.id === 3 && currentStep === 1) {
                  if (!selectedCustomer) {
                    setError('Please select a customer first.');
                    return;
                  }
                  if (!selectedProduct || amount <= 0) {
                    setError('Please select a product and enter a valid loan amount first.');
                    setCurrentStep(2);
                    return;
                  }
                  setError(null);
                  setCurrentStep(3);
                }
              }}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                cursor: (step.id <= currentStep || (step.id === 2 && selectedCustomer) || (step.id === 3 && selectedCustomer && selectedProduct && amount > 0)) ? 'pointer' : 'not-allowed',
                opacity: currentStep === step.id ? 1 : 0.6
              }}
            >
              <div style={{ 
                width: '26px', 
                height: '26px', 
                borderRadius: '50%', 
                backgroundColor: currentStep === step.id ? 'var(--foreground)' : (currentStep > step.id ? 'var(--primary)' : '#f1f5f9'), 
                color: currentStep === step.id ? 'white' : (currentStep > step.id ? 'white' : 'var(--text-muted)'),
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontWeight: '700',
                fontSize: '0.75rem',
                border: currentStep === step.id ? 'none' : (currentStep > step.id ? 'none' : '1px solid var(--border-color)')
              }}>
                {currentStep > step.id ? '✓' : step.id}
              </div>
              <span style={{ 
                fontSize: '0.8125rem', 
                fontWeight: currentStep === step.id ? '700' : '500', 
                color: currentStep === step.id ? 'var(--foreground)' : 'var(--text-muted)' 
              }}>
                {step.label}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>

      {error && (
        <div style={{ 
          padding: '0.75rem 1rem', 
          backgroundColor: 'var(--error-bg)', 
          color: 'var(--error-text)', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          border: '1px solid var(--error-border)',
          fontSize: '0.8125rem'
        }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Step 1: Customer & Officer */}
        {currentStep === 1 && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Top row: Loan ID & Credit Officer side-by-side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', alignItems: 'start' }}>
              {/* Loan ID */}
              <div className="input-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                  <label className="input-label" style={{ fontSize: '0.8125rem', marginBottom: 0 }}>Loan ID <span style={{ color: '#ef4444' }}>*</span></label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <div 
                      onClick={handleToggleAutoGenerateLid}
                      style={{ 
                        width: '32px', height: '18px', 
                        backgroundColor: autoGenerateLid ? 'var(--primary)' : '#cbd5e1',
                        borderRadius: '20px', position: 'relative', cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <div style={{
                        width: '14px', height: '14px', backgroundColor: 'white', borderRadius: '50%',
                        position: 'absolute', top: '2px', left: autoGenerateLid ? '16px' : '2px',
                        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }} />
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '500' }}>Auto</span>
                  </div>
                </div>
                <input 
                  required 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. LID-000001"
                  value={lid}
                  onChange={(e) => setLid(e.target.value)}
                  disabled={autoGenerateLid || generatingLid}
                  style={{ 
                    height: '42px',
                    fontSize: '0.875rem',
                    backgroundColor: autoGenerateLid ? '#f8fafc' : 'white',
                    cursor: autoGenerateLid ? 'not-allowed' : 'text',
                    opacity: generatingLid ? 0.7 : 1
                  }}
                />
              </div>

              {/* Credit Officer */}
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', marginBottom: '0.375rem' }}>
                  <UserCheck size={14} color="var(--primary)" />
                  Credit Officer <span style={{ color: 'var(--text-muted)', fontWeight: '400', fontSize: '0.7rem', marginLeft: '0.25rem' }}>(In Charge)</span>
                </label>

                <div ref={officerRef} style={{ position: 'relative' }}>
                  {selectedOfficer ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0 0.75rem',
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: 'var(--radius-md)',
                      height: '42px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', fontWeight: '700', fontSize: '0.75rem', flexShrink: 0 }}>
                          {selectedOfficer.firstName[0]}{selectedOfficer.lastName[0]}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: '700', fontSize: '0.8125rem', color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {selectedOfficer.firstName} {selectedOfficer.lastName}
                          </div>
                          {selectedOfficer.branch && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedOfficer.branch.name}</div>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setSelectedOfficer(null); setOfficerSearch(''); }}
                        style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'white', border: '1px solid #bbf7d0', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={14} />
                        <input
                          type="text"
                          className="input-field"
                          style={{ paddingLeft: '2.25rem', height: '42px', width: '100%', fontSize: '0.875rem' }}
                          placeholder="Search credit officer by name..."
                          value={officerSearch}
                          onChange={(e) => { setOfficerSearch(e.target.value); setOfficerDropdownOpen(true); }}
                          onFocus={() => setOfficerDropdownOpen(true)}
                        />
                      </div>

                      {officerDropdownOpen && (
                        <div style={{
                          position: 'absolute', top: '100%', left: 0, right: 0,
                          backgroundColor: 'white', borderRadius: 'var(--radius-md)',
                          boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-color)',
                          zIndex: 25, marginTop: '0.25rem', overflow: 'hidden', maxHeight: '200px', overflowY: 'auto'
                        }}>
                          {creditOfficers
                            .filter(o => `${o.firstName} ${o.lastName}`.toLowerCase().includes(officerSearch.toLowerCase()))
                            .map(o => (
                              <div
                                key={o.id}
                                onClick={() => { setSelectedOfficer(o); setOfficerDropdownOpen(false); setOfficerSearch(''); }}
                                style={{ padding: '0.625rem 0.75rem', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.15s' }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                              >
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: '700', fontSize: '0.75rem', flexShrink: 0 }}>
                                  {o.firstName[0]}{o.lastName[0]}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontWeight: '700', fontSize: '0.8125rem', color: 'var(--foreground)' }}>{o.firstName} {o.lastName}</div>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.email}{o.branch ? ` · ${o.branch.name}` : ''}</div>
                                </div>
                              </div>
                            ))}
                          {creditOfficers.filter(o => `${o.firstName} ${o.lastName}`.toLowerCase().includes(officerSearch.toLowerCase())).length === 0 && (
                            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                              No officers found
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Information (Full Width) */}
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}>
                <User size={14} color="var(--primary)" />
                Customer Information <span style={{ color: '#ef4444' }}>*</span>
              </label>
              
              {!selectedCustomer ? (
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
                    <input 
                      type="text" 
                      className="input-field" 
                      style={{ paddingLeft: '2.25rem', width: '100%', height: '42px', fontSize: '0.875rem' }}
                      placeholder="Search customer by name, CID No, phone or email..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                    />
                    {isSearching && (
                      <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}>
                        <div className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>
                      </div>
                    )}
                  </div>
                  
                  {customers.length > 0 ? (
                    <div style={{ 
                      position: 'absolute', 
                      top: '100%', 
                      left: 0, 
                      right: 0, 
                      backgroundColor: 'white', 
                      borderRadius: 'var(--radius-md)', 
                      boxShadow: 'var(--shadow-xl)', 
                      border: '1px solid var(--border-color)', 
                      zIndex: 20, 
                      marginTop: '0.25rem',
                      overflow: 'hidden'
                    }}>
                      {customers.map(c => (
                        <div 
                          key={c.id} 
                          onClick={() => {
                            setSelectedCustomer(c);
                            setCustomers([]);
                            setCustomerSearch('');
                          }}
                          style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', transition: 'background-color 0.15s' }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--foreground)' }}>
                                {c.firstName} {c.lastName}
                                {(c.khmerLastName || c.khmerFirstName) && <span style={{ marginLeft: '0.4rem', color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.75rem' }}>({c.khmerLastName} {c.khmerFirstName})</span>}
                              </div>
                              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginTop: '0.125rem' }}>
                                {c.cid && <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', backgroundColor: '#eff6ff', color: '#3b82f6', padding: '0.05rem 0.3rem', borderRadius: '4px', fontWeight: '600' }}>{c.cid}</span>}
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.phone} · {c.email || 'No email'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    customerSearch.length >= 2 && !isSearching && (
                      <div style={{ 
                        position: 'absolute', 
                        top: '100%', 
                        left: 0, 
                        right: 0, 
                        backgroundColor: 'white', 
                        borderRadius: 'var(--radius-md)', 
                        boxShadow: 'var(--shadow-lg)', 
                        border: '1px solid var(--border-color)', 
                        zIndex: 20, 
                        marginTop: '0.25rem',
                        padding: '1rem',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        fontSize: '0.8125rem'
                      }}>
                        <div style={{ marginBottom: '0.25rem' }}>
                          <AlertCircle size={20} style={{ margin: '0 auto', opacity: 0.5 }} />
                        </div>
                        No customers found matching &quot;{customerSearch}&quot;
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div style={{ 
                  padding: '1rem', 
                  backgroundColor: 'var(--primary-light)', 
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(37, 99, 235, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: '700', fontSize: '0.875rem', boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(37, 99, 235, 0.1)' }}>
                        {selectedCustomer.firstName[0]}{selectedCustomer.lastName[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--foreground)' }}>
                          {selectedCustomer.firstName} {selectedCustomer.lastName}
                        </div>
                        {(selectedCustomer.khmerLastName || selectedCustomer.khmerFirstName) && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600', marginTop: '-0.1rem' }}>
                            {selectedCustomer.khmerLastName} {selectedCustomer.khmerFirstName}
                          </div>
                        )}
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setSelectedCustomer(null)}
                      style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'white', border: '1px solid var(--border-color)', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                      onMouseOver={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fecdd3'; }}
                      onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                    >
                      <X size={12} />
                    </button>
                  </div>

                  <div style={{ backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 'var(--radius-md)', padding: '0.625rem 0.75rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem 0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.05rem', minWidth: 0 }}>
                      <span style={{ fontSize: '0.6rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>LastName / FirstName</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {selectedCustomer.lastName} / {selectedCustomer.firstName}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.05rem', minWidth: 0 }}>
                      <span style={{ fontSize: '0.6rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Phone</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', fontWeight: '600', color: 'var(--foreground)' }}>
                        <Phone size={10} color="var(--primary)" />
                        <span>{selectedCustomer.phone}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.05rem', minWidth: 0 }}>
                      <span style={{ fontSize: '0.6rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', fontWeight: '600', color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <Mail size={10} color="var(--primary)" />
                        <span>{selectedCustomer.email || 'N/A'}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.05rem', minWidth: 0 }}>
                      <span style={{ fontSize: '0.6rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>National ID</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', fontWeight: '600', color: 'var(--foreground)' }}>
                        <CreditCard size={10} color="var(--primary)" />
                        <span>{selectedCustomer.nationalId || 'N/A'}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.05rem', minWidth: 0 }}>
                      <span style={{ fontSize: '0.6rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Gender</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', fontWeight: '600', color: 'var(--foreground)' }}>
                        <CircleUser size={10} color="var(--primary)" />
                        <span>{selectedCustomer.gender || 'N/A'}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.05rem', minWidth: 0 }}>
                      <span style={{ fontSize: '0.6rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Date of Birth</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', fontWeight: '600', color: 'var(--foreground)' }}>
                        <Calendar size={10} color="var(--primary)" />
                        <span>
                          {selectedCustomer.dateOfBirth
                            ? new Date(selectedCustomer.dateOfBirth).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                    {selectedCustomer.address && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.05rem', gridColumn: '1 / -1', minWidth: 0 }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Address</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', fontWeight: '600', color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <MapPin size={10} color="var(--primary)" style={{ flexShrink: 0 }} />
                          <span>{selectedCustomer.address}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* CBC Check Section */}
            <div style={{ 
              padding: '0.75rem 1rem', 
              backgroundColor: cbcChecked ? '#f0fdf4' : '#f8fafc', 
              borderRadius: 'var(--radius-md)', 
              border: `1px solid ${cbcChecked ? '#bbf7d0' : 'var(--border-color)'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ padding: '0.375rem', backgroundColor: cbcChecked ? '#dcfce7' : '#e2e8f0', borderRadius: '6px', color: cbcChecked ? '#16a34a' : 'var(--text-muted)', transition: 'all 0.3s ease' }}>
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.8125rem', fontWeight: '700', margin: 0, color: 'var(--foreground)' }}>Credit Bureau Cambodia (CBC)</h3>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verify credit history before origination.</p>
                  </div>
                </div>
                
                {!cbcChecked && (
                  <button 
                    type="button" 
                    onClick={runCbcCheck}
                    disabled={!selectedCustomer || checkingCbc}
                    className="btn"
                    style={{ 
                      backgroundColor: (!selectedCustomer || checkingCbc) ? '#e2e8f0' : '#1e293b', 
                      color: (!selectedCustomer || checkingCbc) ? '#94a3b8' : 'white',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '6px',
                      fontWeight: '600',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      cursor: (!selectedCustomer || checkingCbc) ? 'not-allowed' : 'pointer',
                      border: 'none',
                      transition: 'all 0.2s ease',
                      height: '32px'
                    }}
                  >
                    {checkingCbc ? (
                      <>
                        <div className="animate-spin" style={{ width: '12px', height: '12px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                        Checking...
                      </>
                    ) : 'Run CBC Check'}
                  </button>
                )}
              </div>
              
              {cbcChecked && cbcScore && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '0.5rem 0.75rem', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #bbf7d0', animation: 'fadeIn 0.3s ease-out' }}>
                  <div>
                    <div style={{ fontSize: '0.6rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.1rem' }}>CBC Score</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: '800', color: '#16a34a', lineHeight: 1 }}>{cbcScore.score}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.6rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.1rem' }}>Risk Level</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#16a34a' }}>{cbcScore.status}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#16a34a', fontSize: '0.75rem', fontWeight: '700', backgroundColor: '#dcfce7', padding: '0.2rem 0.4rem', borderRadius: '20px' }}>
                    <CheckCircle size={12} /> Verified
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Loan Terms */}
        {currentStep === 2 && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div style={{ padding: '0.625rem 1rem', backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Banknote size={14} color="var(--primary)" />
                <span style={{ fontWeight: '700', fontSize: '0.8125rem', color: 'var(--foreground)' }}>Loan Terms</span>
              </div>

              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Row 1: Loan Product | Currency Type */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                      <Briefcase size={13} color="var(--primary)" /> Loan Product <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select required className="input-field"
                      style={{ height: '42px', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%2394a3b8%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.875rem center', backgroundSize: '0.9em' }}
                      value={selectedProduct?.id || ''}
                      onChange={(e) => { const p = products.find(x => x.id === e.target.value); setSelectedProduct(p || null); if (p) setInterestRate(p.baseInterestRate); }}>
                      <option value="" disabled>Choose a product</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                      <DollarSign size={13} color="var(--primary)" /> Currency Type
                    </label>
                    <div style={{ display: 'flex', height: '42px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                      {(['USD', 'KHR'] as const).map((c, i) => (
                        <button key={c} type="button" onClick={() => setCurrency(c)} style={{
                          flex: 1, border: 'none', borderLeft: i > 0 ? '1px solid var(--border-color)' : 'none',
                          cursor: 'pointer', fontWeight: '600', fontSize: '0.8125rem',
                          backgroundColor: currency === c ? '#dbeafe' : '#f8fafc',
                          color: currency === c ? '#1d4ed8' : '#94a3b8',
                          transition: 'all 0.18s',
                        }}>
                          {c === 'USD' ? '$ USD' : '៛ KHR'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Row 2: Loan Amount | Disbursement Date */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                      <DollarSign size={13} color="var(--primary)" /> Loan Amount <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontWeight: '700', color: '#64748b', fontSize: '0.8125rem', userSelect: 'none', pointerEvents: 'none' }}>
                        {currency === 'USD' ? '$' : '៛'}
                      </span>
                      <input required type="number" className="input-field"
                        style={{ paddingLeft: '1.75rem', height: '42px', fontWeight: '600' }}
                        placeholder="0.00" value={amount || ''}
                        onChange={(e) => setAmount(Number(e.target.value))} />
                    </div>
                    {selectedProduct && (
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Min: {currency === 'USD' ? '$' : '៛'}{selectedProduct.minAmount.toLocaleString()}</span>
                        <span>Max: {currency === 'USD' ? '$' : '៛'}{selectedProduct.maxAmount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                      <Calendar size={13} color="var(--primary)" /> Disbursement Date
                    </label>
                    <input type="date" className="input-field" style={{ height: '42px' }}
                      value={disbursementDate} onChange={(e) => setDisbursementDate(e.target.value)} />
                  </div>
                </div>

                <div style={{ borderTop: '1px dashed #e2e8f0', margin: '0.25rem 0' }} />

                {/* Row 3: Repayment Type | First Installment | No. of Installments */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                      <RefreshCw size={13} color="var(--primary)" /> Repayment Type
                    </label>
                    <select className="input-field"
                      style={{ height: '42px', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%2394a3b8%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.875rem center', backgroundSize: '0.9em' }}
                      value={repaymentType} onChange={(e) => setRepaymentType(e.target.value as any)}>
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="TWO_WEEKLY">Two Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                    </select>
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                      <Calendar size={13} color="var(--primary)" /> First Installment
                    </label>
                    <input type="date" className="input-field" style={{ height: '42px' }}
                      value={firstInstallmentDate} onChange={(e) => setFirstInstallmentDate(e.target.value)} />
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                      <FileText size={13} color="var(--primary)" /> Installments <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input required type="number" min={1} className="input-field" style={{ height: '42px' }}
                      placeholder="12" value={numberOfInstallments || ''}
                      onChange={(e) => { const v = Number(e.target.value); setNumberOfInstallments(v); setDuration(v); }} />
                  </div>
                </div>

                <div style={{ borderTop: '1px dashed #e2e8f0', margin: '0.25rem 0' }} />

                {/* Row 4: Interest Rate | Penalty Rate | Admin Fee Rate */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  {[
                    { label: 'Interest Rate', icon: <Percent size={13} color="var(--primary)" />, val: interestRate, set: setInterestRate },
                    { label: 'Penalty Rate', icon: <AlertCircle size={13} color="var(--primary)" />, val: penaltyRate, set: setPenaltyRate },
                    { label: 'Admin Fee Rate', icon: <Percent size={13} color="var(--primary)" />, val: adminFeeRate, set: setAdminFeeRate },
                  ].map(({ label, icon, val, set }) => (
                    <div key={label} className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                        {icon} {label}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input type="number" step="0.01" min={0} className="input-field"
                          style={{ height: '42px', paddingRight: '1.75rem' }}
                          placeholder="0.00" value={val || ''}
                          onChange={(e) => set(Number(e.target.value))} />
                        <span style={{ position: 'absolute', right: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1', fontWeight: '600', fontSize: '0.75rem', pointerEvents: 'none' }}>%</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px dashed #e2e8f0', margin: '0.25rem 0' }} />

                {/* Row 5: Collection Fee | Grace Period | Refinance Fee */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  {/* Collection Fee */}
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                      <Banknote size={13} color="var(--primary)" /> Collection Fee
                    </label>
                    <div style={{ display: 'flex', height: '42px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: 'white' }}>
                      <input type="number" step="0.01" min={0}
                        style={{ flex: 1, border: 'none', outline: 'none', padding: '0 0.5rem', fontSize: '0.875rem', color: 'var(--foreground)', background: 'transparent', minWidth: 0 }}
                        placeholder="0.00" value={collectionFeeValue || ''}
                        onChange={(e) => setCollectionFeeValue(Number(e.target.value))} />
                      <div style={{ display: 'flex', borderLeft: '1px solid var(--border-color)', flexShrink: 0 }}>
                        <button type="button" onClick={() => setCollectionFeeType('RATE')}
                          style={{ width: '28px', height: '100%', border: 'none', borderRight: '1px solid var(--border-color)', cursor: 'pointer', fontWeight: '700', fontSize: '0.7rem',
                            backgroundColor: collectionFeeType === 'RATE' ? '#dbeafe' : '#f8fafc',
                            color: collectionFeeType === 'RATE' ? '#1d4ed8' : '#94a3b8',
                            transition: 'all 0.15s' }}>%</button>
                        <button type="button" onClick={() => setCollectionFeeType('AMOUNT')}
                          style={{ width: '28px', height: '100%', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.7rem',
                            backgroundColor: collectionFeeType === 'AMOUNT' ? '#dbeafe' : '#f8fafc',
                            color: collectionFeeType === 'AMOUNT' ? '#1d4ed8' : '#94a3b8',
                            transition: 'all 0.15s' }}>{currency === 'USD' ? '$' : '៛'}</button>
                      </div>
                    </div>
                  </div>

                  {/* Grace Period */}
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                      <Clock size={13} color="var(--primary)" /> Grace Period
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input type="number" min={0} className="input-field"
                        style={{ height: '42px', paddingRight: '2.5rem' }}
                        placeholder="0" value={gracePeriod || ''}
                        onChange={(e) => setGracePeriod(Number(e.target.value))} />
                      <span style={{ position: 'absolute', right: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1', fontWeight: '500', fontSize: '0.68rem', pointerEvents: 'none' }}>days</span>
                    </div>
                  </div>

                  {/* Refinance Fee */}
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                      <RefreshCw size={13} color="var(--primary)" /> Refinance Fee
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontWeight: '700', color: '#64748b', fontSize: '0.8125rem', userSelect: 'none', pointerEvents: 'none' }}>
                        {currency === 'USD' ? '$' : '៛'}
                      </span>
                      <input type="number" step="0.01" min={0} className="input-field"
                        style={{ height: '42px', paddingLeft: '1.75rem' }}
                        placeholder="0.00" value={refinanceFeeAmt || ''}
                        onChange={(e) => setRefinanceFeeAmt(Number(e.target.value))} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details (Conditional) */}
            {selectedProduct && (
              <div style={{ 
                padding: '0.875rem 1rem', 
                backgroundColor: '#f9fafb', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid #f3f4f6',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Info size={14} color="var(--primary)" />
                  <span style={{ fontWeight: '700', fontSize: '0.8125rem' }}>Product Specifications</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Interest Rate</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '800', color: 'var(--foreground)' }}>{selectedProduct.baseInterestRate}% <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>p.a.</span></span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Interest Method</span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--foreground)' }}>{selectedProduct.interestType}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Details & Collaterals */}
        {currentStep === 3 && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Quick Context Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '0.75rem 1rem', backgroundColor: 'var(--primary-light)', borderRadius: '8px', border: '1px solid rgba(37, 99, 235, 0.08)' }}>
              <div>
                <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Customer Profile</span>
                <div style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--foreground)', marginTop: '0.125rem' }}>
                  {selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : 'No Customer Selected'}
                  {selectedCustomer?.cid && <span style={{ marginLeft: '0.4rem', fontSize: '0.7rem', fontFamily: 'monospace', backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '0.05rem 0.3rem', borderRadius: '4px' }}>{selectedCustomer.cid}</span>}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Loan Product & Amount</span>
                <div style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--foreground)', marginTop: '0.125rem' }}>
                  {selectedProduct?.name || 'No Product Selected'} — <strong>{currency === 'USD' ? '$' : '៛'}{amount.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* Application Details */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div style={{ padding: '0.625rem 1rem', backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={14} color="var(--primary)" />
                <span style={{ fontWeight: '700', fontSize: '0.8125rem', color: 'var(--foreground)' }}>Application Details</span>
              </div>
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: '0.8125rem', marginBottom: '0.25rem' }}>Loan Cycle</label>
                    <select className="input-field" value={loanCycle} onChange={(e) => setLoanCycle(e.target.value)} style={{ height: '42px', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%2394a3b8%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.875rem center', backgroundSize: '0.9em' }}>
                      <option value="New">New</option>
                      <option value="Old">Old</option>
                    </select>
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: '0.8125rem', marginBottom: '0.25rem' }}>Recommender</label>
                    <select className="input-field" value={recommenderType} onChange={(e) => setRecommenderType(e.target.value)} style={{ height: '42px', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%2394a3b8%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.875rem center', backgroundSize: '0.9em' }}>
                      <option value="OFFICE">OFFICE</option>
                      <option value="Credit Officer">Credit Officer</option>
                      <option value="Customer Relation Office">Customer Relation Office</option>
                      <option value="Other Recommender">Other Recommender</option>
                    </select>
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: '0.8125rem', marginBottom: '0.25rem' }}>Branch</label>
                    <select className="input-field" value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} style={{ height: '42px', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%2394a3b8%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.875rem center', backgroundSize: '0.9em' }}>
                      <option value="">Select Branch</option>
                      {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: '0.8125rem', marginBottom: '0.25rem' }}>Reason of Credit</label>
                    <input type="text" className="input-field" value={reasonOfCredit} onChange={(e) => setReasonOfCredit(e.target.value)} placeholder="e.g. Business Expansion" style={{ height: '42px' }} />
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: '0.8125rem', marginBottom: '0.25rem' }}>Loan Note</label>
                    <select className="input-field" value={loanNote} onChange={(e) => setLoanNote(e.target.value)} style={{ height: '42px', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%2394a3b8%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.875rem center', backgroundSize: '0.9em' }}>
                      <option value="Normal Loan">Normal Loan</option>
                      <option value="Restructure Loan">Restructure Loan</option>
                      <option value="Reschedule Loan">Reschedule Loan</option>
                    </select>
                  </div>
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" style={{ fontSize: '0.8125rem', marginBottom: '0.25rem' }}>Memo Reason of Credit</label>
                  <textarea className="input-field" value={memoReasonOfCredit} onChange={(e) => setMemoReasonOfCredit(e.target.value)} rows={2} placeholder="Additional details..." style={{ fontSize: '0.875rem' }} />
                </div>
              </div>
            </div>

            {/* Collaterals Section */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div style={{ padding: '0.625rem 1rem', backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={14} color="var(--primary)" />
                  <span style={{ fontWeight: '700', fontSize: '0.8125rem', color: 'var(--foreground)' }}>Collaterals</span>
                </div>
                <button type="button" onClick={() => setCollaterals([...collaterals, { type: 'Property', description: '', estimatedValue: 0, currency: 'USD' }])} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', fontSize: '0.8125rem', cursor: 'pointer' }}>+ Add Collateral</button>
              </div>
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {collaterals.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem', padding: '0.5rem' }}>No collaterals added.</div>
                ) : (
                  collaterals.map((c, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1fr 40px', gap: '0.75rem', alignItems: 'end', paddingBottom: '0.75rem', borderBottom: i < collaterals.length - 1 ? '1px dashed #e2e8f0' : 'none' }}>
                      <div className="input-group" style={{ marginBottom: 0 }}>
                        <label className="input-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Type</label>
                        <select className="input-field" value={c.type} onChange={(e) => { const nc = [...collaterals]; nc[i].type = e.target.value; setCollaterals(nc); }} style={{ height: '38px', fontSize: '0.8125rem' }}>
                          <option value="Property">Property</option>
                          <option value="Vehicle">Vehicle</option>
                          <option value="Land">Land</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="input-group" style={{ marginBottom: 0 }}>
                        <label className="input-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Description</label>
                        <input type="text" className="input-field" value={c.description} onChange={(e) => { const nc = [...collaterals]; nc[i].description = e.target.value; setCollaterals(nc); }} style={{ height: '38px', fontSize: '0.8125rem' }} placeholder="e.g. 2019 Toyota Prius" />
                      </div>
                      <div className="input-group" style={{ marginBottom: 0 }}>
                        <label className="input-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Est. Value ($)</label>
                        <input type="number" min={0} className="input-field" value={c.estimatedValue || ''} onChange={(e) => { const nc = [...collaterals]; nc[i].estimatedValue = Number(e.target.value); setCollaterals(nc); }} style={{ height: '38px', fontSize: '0.8125rem' }} placeholder="0.00" />
                      </div>
                      <button type="button" onClick={() => { const nc = [...collaterals]; nc.splice(i, 1); setCollaterals(nc); }} style={{ height: '38px', width: '38px', border: '1px solid #ef4444', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <X size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step Buttons */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            {currentStep > 1 ? (
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ padding: '0.625rem 1.5rem', height: '42px' }}
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                ← Back
              </button>
            ) : (
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ padding: '0.625rem 1.5rem', height: '42px' }}
                onClick={() => window.history.back()}
              >
                Cancel
              </button>
            )}
          </div>
          <div>
            {currentStep === 1 && (
              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ padding: '0.625rem 1.75rem', minWidth: '180px', height: '42px', backgroundColor: 'var(--foreground)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                onClick={handleNextStep1}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--foreground)'}
              >
                Next: Loan Terms →
              </button>
            )}
            {currentStep === 2 && (
              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ padding: '0.625rem 1.75rem', minWidth: '180px', height: '42px', backgroundColor: 'var(--foreground)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                onClick={handleNextStep2}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--foreground)'}
              >
                Next: Details & Collaterals →
              </button>
            )}
            {currentStep === 3 && (
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ padding: '0.625rem 1.75rem', minWidth: '180px', height: '42px', backgroundColor: loading ? '#94a3b8' : 'var(--foreground)', color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600' }}
                disabled={loading}
                onMouseOver={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--primary)' }}
                onMouseOut={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--foreground)' }}
              >
                {loading ? 'Processing...' : (
                  <>
                    Initiate Origination
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

