'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/services/api';
import {
  ArrowLeft, CheckCircle2, XCircle, Clock, Shield, User, FileText,
  Banknote, AlertTriangle, ChevronRight, Eye, Download, Info,
  Phone, Mail, MapPin, Briefcase, Building, DollarSign, Loader2
} from 'lucide-react';

const STAGES = [
  { id: 'DRAFT', label: 'Draft', statuses: ['DRAFT', 'SUBMITTED'] },
  { id: 'KYC', label: 'KYC Review', statuses: ['KYC_REVIEW', 'KYC_APPROVED', 'KYC_REJECTED'] },
  { id: 'CREDIT', label: 'Credit Check', statuses: ['CREDIT_CHECK', 'UNDERWRITING'] },
  { id: 'APPROVAL', label: 'Approval', statuses: ['TIER1_REVIEW', 'TIER2_REVIEW', 'TIER3_REVIEW'] },
  { id: 'DISBURSE', label: 'Disbursement', statuses: ['APPROVED', 'PENDING_DISBURSEMENT', 'DISBURSED'] },
  { id: 'ACTIVE', label: 'Active', statuses: ['ACTIVE', 'COMPLETED'] },
];

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewDecision, setReviewDecision] = useState<'APPROVED' | 'REJECTED' | 'ESCALATED'>('APPROVED');
  const [reviewComments, setReviewComments] = useState('');
  const [user, setUser] = useState<any>(null);
  const [kycCompleteness, setKycCompleteness] = useState<any>(null);
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userData);
    }
  }, []);

  const fetchApplication = async () => {
    try {
      const data = await api.get(`/los/${id}`);
      setApplication(data);
      if (data?.customerId && data?.product?.name) {
        try {
          const completeness = await api.get(`/kyc/customers/${data.customerId}/completeness/${data.product.name}`);
          setKycCompleteness(completeness);
        } catch (completenessErr) {
          console.warn('Failed to fetch KYC completeness:', completenessErr);
        }
      }
      try {
        const timeline = await api.get(`/los/${id}/timeline`);
        if (timeline && timeline.auditLogs) {
          setAuditLogs(timeline.auditLogs);
        }
      } catch (timelineErr) {
        console.warn('Failed to fetch application timeline:', timelineErr);
      }
    } catch (err) {
      console.warn('Failed to fetch application:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && id !== 'undefined' && id !== '[id]') {
      fetchApplication();
    } else {
      setLoading(false);
    }
  }, [id]);

  const handleAction = async (endpoint: string, method: 'POST' | 'PATCH' = 'PATCH', body: any = {}) => {
    setIsActionLoading(true);
    setActionError(null);
    try {
      await (api as any)[method.toLowerCase()](`/los/${id}/${endpoint}`, body);
      await fetchApplication();
      setShowReviewModal(false);
      setReviewComments('');
    } catch (err: any) {
      // Parse structured error from backend (e.g. KYC incomplete)
      let msg = err.message || 'Action failed';
      try {
        const parsed = err.response?.data || (typeof err.message === 'string' ? JSON.parse(err.message) : err.message);
        if (parsed?.message) {
          msg = parsed.message;
          if (parsed.missing?.length > 0) {
            msg += '\n\nMissing documents: ' + parsed.missing.map((m: any) => m.label).join(', ');
          }
          if (parsed.pendingVerification?.length > 0) {
            msg += '\n\nPending verification: ' + parsed.pendingVerification.map((m: any) => m.label).join(', ');
          }
        }
      } catch (_) {}
      setActionError(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  const openReviewModal = (decision: 'APPROVED' | 'REJECTED' | 'ESCALATED') => {
    setReviewDecision(decision);
    setShowReviewModal(true);
  };

  const handleVerifyDocument = async (docId: string) => {
    setIsActionLoading(true);
    setActionError(null);
    try {
      await api.patch(`/kyc/documents/${docId}/verify`, { status: 'VERIFIED' });
      await fetchApplication();
    } catch (err: any) {
      alert('Verification failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRejectDocument = async (docId: string, reason: string) => {
    if (!reason.trim()) {
      alert('Rejection reason is required');
      return;
    }
    setIsActionLoading(true);
    setActionError(null);
    try {
      await api.patch(`/kyc/documents/${docId}/verify`, { status: 'REJECTED', rejectionReason: reason });
      setRejectingDocId(null);
      setRejectionReason('');
      await fetchApplication();
    } catch (err: any) {
      alert('Rejection failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUploadDocument = async (type: string, file: File) => {
    setIsActionLoading(true);
    setActionError(null);
    try {
      const formData = new FormData();
      formData.append('customerId', application.customerId);
      formData.append('type', type);
      formData.append('file', file);
      await api.upload('/kyc/upload', formData);
      await fetchApplication();
    } catch (err: any) {
      alert('Upload failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDownloadDocument = async (docId: string, fileName: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/v1/kyc/documents/${docId}/download`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        throw new Error('Failed to download document');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Download failed: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader2 className="animate-spin" size={40} color="var(--primary)" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="card animate-fade-in" style={{
        maxWidth: '500px',
        margin: '4rem auto',
        padding: '3rem 2rem',
        textAlign: 'center',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: 'var(--error-text)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '2rem',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.05)'
        }}>
          <AlertTriangle size={36} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--foreground)' }}>Application Not Found</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2.5rem', maxWidth: '380px' }}>
          We couldn't locate the loan application you requested. It might have been deleted, or the system database was reset.
        </p>
        <Link href="/admin/los" className="btn btn-primary" style={{
          textDecoration: 'none',
          padding: '0.75rem 2rem',
          borderRadius: '10px',
          fontWeight: '700',
          fontSize: '0.95rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: 'var(--shadow-md)'
        }}>
          <ArrowLeft size={18} /> Back to Pipeline
        </Link>
      </div>
    );
  }

  const currentStageIndex = STAGES.findIndex(s => s.statuses.includes(application.status));

  const getStatusStyle = (status: string) => {
    const map: Record<string, { color: string; bg: string }> = {
      DRAFT: { color: 'var(--text-muted-dark)', bg: 'var(--bg-muted)' },
      SUBMITTED: { color: 'var(--indigo-text)', bg: 'var(--indigo-bg)' },
      KYC_REVIEW: { color: 'var(--purple-text)', bg: 'var(--purple-bg)' },
      TIER3_REVIEW: { color: 'var(--pink-text)', bg: 'var(--pink-bg)' },
      APPROVED: { color: 'var(--success-text)', bg: 'var(--success-bg)' },
      REJECTED: { color: 'var(--error-text)', bg: 'var(--error-bg)' },
      VERIFIED: { color: 'var(--success-text)', bg: 'var(--success-bg)' },
      PENDING: { color: 'var(--warning-text)', bg: 'var(--warning-bg)' },
      ACTIVE: { color: 'var(--success-text)', bg: 'var(--success-bg)' },
    };
    return map[status] || { color: 'var(--text-muted-dark)', bg: 'var(--bg-muted)' };
  };

  const statusStyle = getStatusStyle(application.status);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Process Stepper */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
          {/* Progress Bar Background */}
          <div style={{ position: 'absolute', top: '14px', left: '40px', right: '40px', height: '2px', backgroundColor: 'var(--border-color)', zIndex: 0 }} />
          {/* Active Progress Bar */}
          <div style={{ 
            position: 'absolute', top: '14px', left: '40px', 
            width: `${(currentStageIndex / (STAGES.length - 1)) * (100 - 80)}%`, // Simplified calc
            height: '2px', backgroundColor: 'var(--primary)', zIndex: 0,
            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
          }} />
          
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isActive = idx === currentStageIndex;
            return (
              <div key={stage.id} style={{ zIndex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '80px' }}>
                <div style={{ 
                  width: '30px', height: '30px', borderRadius: '50%', 
                  backgroundColor: isCompleted ? 'var(--primary)' : isActive ? 'var(--card-bg)' : 'var(--card-bg)',
                   border: isCompleted ? 'none' : isActive ? '2px solid var(--primary)' : '2px solid var(--border-color)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isCompleted ? 'white' : isActive ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: '700', fontSize: '0.75rem',
                  boxShadow: isActive ? '0 0 0 4px rgba(37, 99, 235, 0.1)' : 'none',
                  transition: 'all 0.3s'
                }}>
                  {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                </div>
                <span style={{ fontSize: '0.6875rem', fontWeight: isActive ? '700' : '600', color: isActive ? 'var(--foreground)' : 'var(--text-muted)' }}>
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Error Banner */}
      {actionError && (
        <div style={{ backgroundColor: 'var(--error-bg)', border: '1px solid #fecaca', borderRadius: 'var(--radius-lg)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <AlertTriangle size={20} color="var(--error-text)" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '700', color: 'var(--error-text)', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>Action Failed</div>
            <div style={{ color: 'var(--error-text)', fontSize: '0.875rem', whiteSpace: 'pre-line' }}>{actionError}</div>
          </div>
          <button onClick={() => setActionError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error-text)', padding: '0.25rem', borderRadius: '4px', display: 'flex' }}>
            <XCircle size={18} />
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/admin/los" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', color: 'var(--text-muted-dark)', backgroundColor: 'var(--card-bg)' }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, fontFamily: 'monospace' }} title={application.id}>#{application.id.substring(0, 6).toUpperCase()}</h2>
              <span style={{ padding: '0.3rem 1rem', borderRadius: 'var(--radius-full)', backgroundColor: statusStyle.bg, color: statusStyle.color, fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.02em' }}>
                {application.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
               <span style={{ fontWeight: '700', color: 'var(--foreground)' }}>{application.customer.firstName} {application.customer.lastName}</span>
               {(application.customer.khmerLastName || application.customer.khmerFirstName) && <span style={{ color: 'var(--primary)', fontWeight: '600' }}>({application.customer.khmerLastName} {application.customer.khmerFirstName})</span>}
               <span style={{ color: 'var(--text-muted)' }}>•</span>
               <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{application.product.name}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {application.status === 'DRAFT' && (
            <button onClick={() => handleAction('submit')} disabled={isActionLoading} className="btn btn-primary">
              {isActionLoading ? <Loader2 className="animate-spin" size={16} /> : 'Submit Application'}
            </button>
          )}
          {application.status === 'SUBMITTED' && (
            <button onClick={() => handleAction('kyc-review')} disabled={isActionLoading} className="btn btn-primary">
              Start KYC Review
            </button>
          )}
          {application.status === 'KYC_REVIEW' && (
            <>
              <button onClick={() => handleAction('kyc-decision', 'PATCH', { approved: false })} disabled={isActionLoading} className="btn btn-secondary" style={{ color: 'var(--error-text)' }}>Reject KYC</button>
              <button onClick={() => handleAction('kyc-decision', 'PATCH', { approved: true })} disabled={isActionLoading} className="btn btn-primary">Approve KYC</button>
            </>
          )}
          {application.status === 'KYC_APPROVED' && (
            <button onClick={() => handleAction('credit-check', 'POST')} disabled={isActionLoading} className="btn btn-primary">Run Credit Check</button>
          )}
          {application.status === 'UNDERWRITING' && (
             <button onClick={() => handleAction('review', 'PATCH', { decision: 'APPROVED' })} disabled={isActionLoading} className="btn btn-primary">Approve Loan</button>
          )}
          
          {/* Review Tiers - Super Admin and Branch Manager */}
          {['TIER1_REVIEW', 'TIER2_REVIEW', 'TIER3_REVIEW'].includes(application.status) && (
            <>
              {(user?.roles?.includes('SUPER_ADMIN') || user?.roles?.includes('BRANCH_MANAGER')) && (
                <>
                  <button onClick={() => openReviewModal('REJECTED')} disabled={isActionLoading} className="btn btn-secondary" style={{ color: 'var(--error-text)' }}>Reject</button>
                  {application.status !== 'TIER3_REVIEW' && (
                    <button onClick={() => openReviewModal('ESCALATED')} disabled={isActionLoading} className="btn btn-secondary">Escalate</button>
                  )}
                  <button onClick={() => openReviewModal('APPROVED')} disabled={isActionLoading} className="btn btn-primary">Approve Application</button>
                </>
              )}
            </>
          )}

          {application.status === 'APPROVED' && (
            <button onClick={() => handleAction('prepare-disbursement')} disabled={isActionLoading} className="btn btn-primary">Prepare Disbursement</button>
          )}
          {application.status === 'PENDING_DISBURSEMENT' && (
            <button onClick={() => handleAction('disburse', 'POST')} disabled={isActionLoading} className="btn btn-primary">Disburse Funds</button>
          )}
          {(application.status === 'DISBURSED' || application.status === 'ACTIVE' || application.status === 'COMPLETED' || application.status === 'OVERDUE') && (
            <Link href={`/admin/customers/repayments/${application.id}`} style={{ textDecoration: 'none' }}>
              <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Banknote size={16} /> View Repayment Schedule
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s' }}>
          <div className="card" style={{ width: '450px', padding: '2rem', animation: 'slideUp 0.3s' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {reviewDecision === 'APPROVED' && <CheckCircle2 color="var(--success-text)" />}
              {reviewDecision === 'REJECTED' && <XCircle color="var(--error-text)" />}
              {reviewDecision === 'ESCALATED' && <Shield color="var(--primary)" />}
              {reviewDecision.charAt(0) + reviewDecision.slice(1).toLowerCase()} Application
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Please provide your comments for this decision. This will be recorded in the audit trail.
            </p>
            <div className="input-group">
              <label className="input-label">Comments / Rationale</label>
              <textarea 
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                placeholder="Enter review notes..."
                style={{ width: '100%', height: '120px', padding: '0.875rem', borderRadius: '12px', border: '1px solid var(--border-color)', outline: 'none', resize: 'none', fontSize: '0.875rem' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button onClick={() => setShowReviewModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button 
                onClick={() => handleAction('review', 'PATCH', { decision: reviewDecision, comments: reviewComments })} 
                disabled={isActionLoading || (reviewDecision === 'REJECTED' && !reviewComments)} 
                className="btn btn-primary" 
                style={{ flex: 1, backgroundColor: reviewDecision === 'REJECTED' ? 'var(--error-text)' : undefined }}
              >
                {isActionLoading ? <Loader2 className="animate-spin" size={18} /> : `Confirm ${reviewDecision === 'ESCALATED' ? 'Escalation' : reviewDecision.charAt(0) + reviewDecision.slice(1).toLowerCase()}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border-color)' }}>
        {['Overview', 'Documents', 'Timeline', 'Schedule'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '1rem 0.5rem', border: 'none', background: 'none',
              fontSize: '0.9375rem', fontWeight: activeTab === tab ? '700' : '500',
              color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted-dark)',
              borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
              cursor: 'pointer', marginBottom: '-1px'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ minHeight: '400px' }}>
        {activeTab === 'Overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Client Info Card */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={18} color="var(--primary)" /> Applicant Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <InfoItem label="Full Name" value={`${application.customer.firstName} ${application.customer.lastName}`} />
                  <InfoItem label="Khmer Name" value={`${application.customer.khmerLastName || ''} ${application.customer.khmerFirstName || ''}`.trim() || 'N/A'} />
                  <InfoItem label="Phone" value={application.customer.phone} icon={Phone} />
                  <InfoItem label="Email" value={application.customer.email} icon={Mail} />
                  <InfoItem label="National ID" value={application.customer.nationalId} icon={Shield} />
                  <InfoItem label="Occupation" value={application.customer.occupation} icon={Briefcase} />
                </div>
              </div>

              {/* Loan Config Card */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <DollarSign size={18} color="var(--primary)" /> Loan Configuration
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <InfoItem label="Loan Amount" value={`$${Number(application.principalAmount).toLocaleString()}`} highlight />
                  <InfoItem label="Interest Rate" value={`${application.interestRate}% p.a.`} />
                  <InfoItem label="Duration" value={`${application.durationMonths} Months`} />
                  <InfoItem label="Product" value={application.product.name} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               {/* Financial Health */}
               <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0 }}>Credit Summary</h3>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                    onClick={async () => {
                      try {
                        await api.post(`/loans/${application.id}/credit-score`, {});
                        fetchApplication();
                      } catch (e) {
                        alert('Failed to calculate credit score');
                      }
                    }}
                  >
                    Calculate Score
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                   <div>
                     <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary)' }}>{application.cbcScore || '—'}</div>
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>CBC SCORE</div>
                   </div>
                   <div style={{ width: '1px', backgroundColor: 'var(--border-color)' }} />
                   <div>
                     <div style={{ fontSize: '1.75rem', fontWeight: '800', color: application.dtiRatio > 0.6 ? 'var(--error-text)' : 'var(--success-text)' }}>
                       {application.dtiRatio ? `${(application.dtiRatio * 100).toFixed(0)}%` : '—'}
                     </div>
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>DTI RATIO</div>
                   </div>
                   <div style={{ width: '1px', backgroundColor: 'var(--border-color)' }} />
                   <div>
                     <div style={{ fontSize: '1.75rem', fontWeight: '800', color: application.creditRiskBand?.startsWith('A') || application.creditRiskBand?.startsWith('B') ? 'var(--success-text)' : application.creditRiskBand?.startsWith('C') ? 'var(--warning-text)' : 'var(--error-text)' }}>
                       {application.internalCreditScore || '—'}
                     </div>
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                       INTERNAL SCORE {application.creditRiskBand ? `(${application.creditRiskBand.charAt(0)})` : ''}
                     </div>
                   </div>
                </div>
               </div>

               {/* Collateral & Guarantors */}
               <div className="card" style={{ padding: '1.5rem' }}>
                 <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.25rem' }}>Collateral & Guarantors</h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {application.collaterals?.length > 0 ? application.collaterals.map((c: any) => (
                      <div key={c.id} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--background)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ color: 'var(--primary)' }}><MapPin size={16} /></div>
                        <div>
                          <div style={{ fontSize: '0.8125rem', fontWeight: '700' }}>{c.type}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.description} • ${c.estimatedValue.toLocaleString()}</div>
                        </div>
                      </div>
                    )) : <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center' }}>No collateral linked.</p>}
                 </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'Documents' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Status Summary Banner */}
            <div className="card" style={{ padding: '1.5rem', backgroundColor: kycCompleteness?.complete ? 'var(--success-bg)' : 'var(--warning-bg)', borderLeft: `4px solid ${kycCompleteness?.complete ? '#22c55e' : '#f59e0b'}`, display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div>
                {kycCompleteness?.complete ? (
                  <CheckCircle2 size={32} color="var(--success-text)" />
                ) : (
                  <AlertTriangle size={32} color="var(--warning-text)" />
                )}
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0, color: kycCompleteness?.complete ? 'var(--success-text)' : 'var(--warning-text)' }}>
                  {kycCompleteness?.complete ? 'KYC Complete' : 'KYC Documents Pending Verification or Upload'}
                </h3>
                <p style={{ fontSize: '0.875rem', color: kycCompleteness?.complete ? 'var(--success-text)' : 'var(--warning-text)', margin: '0.25rem 0 0 0' }}>
                  {kycCompleteness?.complete 
                    ? 'All required documents have been uploaded and successfully verified.' 
                    : `Please review and verify all uploaded documents. Current issues: ${kycCompleteness?.missing?.length || 0} missing, ${kycCompleteness?.pendingVerification?.length || 0} pending verification.`
                  }
                </p>
              </div>
            </div>

            {/* Checklist Grid */}
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '800', marginBottom: '1.5rem' }}>Document Verification Checklist</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {(kycCompleteness?.checklist || [
                  { type: 'NATIONAL_ID', label: 'National ID Card', required: true },
                  { type: 'BUSINESS_DOC', label: 'Business Information / License', required: true },
                  { type: 'HOUSE_PHOTO', label: 'House / Office Location Photo', required: false },
                  { type: 'INCOME_PROOF', label: 'Proof of Income / Salary Slip', required: false },
                ]).map((item: any) => {
                  const doc = application.documents?.find((d: any) => d.type === item.type);
                  return (
                    <div 
                      key={item.type} 
                      style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1.2fr 1.5fr 1fr', 
                        gap: '1.5rem', 
                        padding: '1.25rem', 
                        backgroundColor: 'var(--background)', 
                        borderRadius: '12px', 
                        alignItems: 'center',
                        border: doc?.status === 'REJECTED' ? '1px solid var(--error-text)' : 'none'
                      }}
                    >
                      {/* Col 1: Doc Type & Requirements */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: '800', fontSize: '0.9375rem' }}>{item.label}</span>
                          {item.required && (
                            <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.375rem', backgroundColor: 'var(--error-bg)', color: 'var(--error-text)', borderRadius: '4px', fontWeight: '700' }}>
                              Required
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          Code: {item.type}
                        </div>
                      </div>

                      {/* Col 2: Uploaded File Info */}
                      <div>
                        {doc ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ 
                                fontSize: '0.75rem', 
                                padding: '0.25rem 0.5rem', 
                                borderRadius: '6px', 
                                fontWeight: '700',
                                backgroundColor: 
                                  doc.status === 'VERIFIED' ? 'var(--success-bg)' : 
                                  doc.status === 'REJECTED' ? 'var(--error-bg)' : 'var(--warning-bg)',
                                color: 
                                  doc.status === 'VERIFIED' ? 'var(--success-text)' : 
                                  doc.status === 'REJECTED' ? 'var(--error-text)' : 'var(--warning-text)'
                              }}>
                                {doc.status === 'VERIFIED' && '✓ Verified'}
                                {doc.status === 'REJECTED' && '✗ Rejected'}
                                {doc.status === 'PENDING' && '⏳ Pending Review'}
                              </span>
                              <span 
                                style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                onClick={() => handleDownloadDocument(doc.id, doc.fileName)}
                              >
                                <Download size={14} /> Download File
                              </span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                              Filename: {doc.fileName}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Size: {(doc.sizeBytes / 1024).toFixed(1)} KB • Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                            </div>
                            {doc.status === 'REJECTED' && doc.rejectionReason && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--error-text)', marginTop: '0.25rem', backgroundColor: 'var(--error-bg)', padding: '0.5rem', borderRadius: '6px' }}>
                                <strong>Reason:</strong> {doc.rejectionReason}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            No file uploaded yet
                          </span>
                        )}
                      </div>

                      {/* Col 3: Review Actions & Upload */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem' }}>
                        {/* If in KYC REVIEW stage, let BM/Admin verify/reject PENDING docs */}
                        {application.status === 'KYC_REVIEW' && doc && doc.status === 'PENDING' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                            {rejectingDocId === doc.id ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                                <textarea
                                  placeholder="Enter rejection reason..."
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  style={{ width: '100%', fontSize: '0.75rem', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-hover)' }}
                                  rows={2}
                                />
                                <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                                  <button 
                                    onClick={() => { setRejectingDocId(null); setRejectionReason(''); }}
                                    className="btn btn-secondary" 
                                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                  >
                                    Cancel
                                  </button>
                                  <button 
                                    onClick={() => handleRejectDocument(doc.id, rejectionReason)}
                                    className="btn btn-primary" 
                                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: 'var(--error-text)' }}
                                    disabled={isActionLoading}
                                  >
                                    Confirm Reject
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => setRejectingDocId(doc.id)}
                                  className="btn btn-secondary"
                                  style={{ color: 'var(--error-text)', fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                                  disabled={isActionLoading}
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => handleVerifyDocument(doc.id)}
                                  className="btn btn-primary"
                                  style={{ backgroundColor: '#22c55e', fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                                  disabled={isActionLoading}
                                >
                                  Verify
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Upload button when missing or rejected */}
                        {(!doc || doc.status === 'REJECTED') && (
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.875rem', backgroundColor: 'var(--bg-muted)', border: '1px solid var(--border-hover)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--foreground)' }}>
                            <span>Upload Document</span>
                            <input
                              type="file"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUploadDocument(item.type, file);
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Schedule' && (
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '800', marginBottom: '1.5rem' }}>Repayment Schedule</h3>
            {application.repaymentSchedules?.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: '700' }}>
                      <th style={{ padding: '1rem 0.5rem' }}>INSTALLMENT</th>
                      <th style={{ padding: '1rem 0.5rem' }}>DUE DATE</th>
                      <th style={{ padding: '1rem 0.5rem' }}>PRINCIPAL</th>
                      <th style={{ padding: '1rem 0.5rem' }}>INTEREST</th>
                      <th style={{ padding: '1rem 0.5rem' }}>TOTAL DUE</th>
                      <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {application.repaymentSchedules.map((item: any) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                        <td style={{ padding: '1rem 0.5rem', fontWeight: '700' }}>#{item.installmentNumber}</td>
                        <td style={{ padding: '1rem 0.5rem' }}>{new Date(item.dueDate).toLocaleDateString()}</td>
                        <td style={{ padding: '1rem 0.5rem' }}>${item.principalComponent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td style={{ padding: '1rem 0.5rem' }}>${item.interestComponent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td style={{ padding: '1rem 0.5rem', fontWeight: '700', color: 'var(--primary)' }}>${item.amountDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            padding: '0.25rem 0.5rem', 
                            borderRadius: '6px', 
                            fontWeight: '700',
                            backgroundColor: 
                              item.status === 'PAID' ? 'var(--success-bg)' : 
                              item.status === 'PARTIALLY_PAID' || item.status === 'PARTIAL' ? 'var(--warning-bg)' : 'var(--error-bg)',
                            color: 
                              item.status === 'PAID' ? 'var(--success-text)' : 
                              item.status === 'PARTIALLY_PAID' || item.status === 'PARTIAL' ? 'var(--warning-text)' : 'var(--error-text)'
                          }}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1.5rem', backgroundColor: 'var(--background)', borderRadius: '12px' }}>
                <Banknote size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.25rem' }}>No Repayment Schedule Generated</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>
                  The schedule will be generated automatically once this loan application is approved and disbursed.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Timeline' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>


            {/* System Audit Trail (Moved below the Approval Line) */}
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} color="var(--primary)" /> System Audit Trail
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {(!auditLogs || auditLogs.length === 0) ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic' }}>No audit trail records logged yet.</div>
                ) : (
                  auditLogs.map((log: any, idx: number) => (
                    <div key={log.id || idx} style={{ display: 'flex', gap: '1rem', borderBottom: idx < auditLogs.length - 1 ? '1px solid var(--border-color)' : 'none', paddingBottom: '1rem' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700', flexShrink: 0 }}>
                        {log.user ? `${log.user.firstName[0]}${log.user.lastName[0]}` : 'S'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <span style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--foreground)' }}>
                              {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                            </span>
                            {log.user?.roles?.[0]?.role?.name && (
                              <span style={{ marginLeft: '0.5rem', padding: '0.125rem 0.375rem', backgroundColor: 'var(--bg-muted)', color: 'var(--text-muted-dark)', borderRadius: '4px', fontSize: '0.625rem', fontWeight: '700' }}>
                                {log.user.roles[0].role.name}
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                        
                        <div style={{ marginTop: '0.25rem' }}>
                          <span className="badge" style={{ 
                            padding: '0.125rem 0.5rem', 
                            borderRadius: '4px', 
                            fontSize: '0.625rem', 
                            fontWeight: '800',
                            backgroundColor: log.action.includes('FAILURE') || log.action.includes('REJECT') ? 'var(--error-bg)' : 'var(--success-bg)',
                            color: log.action.includes('FAILURE') || log.action.includes('REJECT') ? 'var(--error-text)' : '#166534',
                          }}>
                            {log.action}
                          </span>
                        </div>

                        {log.details && (
                          <pre style={{ 
                            margin: '0.5rem 0 0 0', 
                            padding: '0.5rem 0.75rem', 
                            borderRadius: '6px', 
                            backgroundColor: 'var(--background)', 
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-muted-dark)', 
                            fontSize: '0.75rem', 
                            fontFamily: 'monospace', 
                            overflowX: 'auto',
                            whiteSpace: 'pre-wrap'
                          }}>
                            {JSON.stringify(log.details)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}

function InfoItem({ label, value, icon: Icon, highlight }: any) {
  return (
    <div>
      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: highlight ? '1.125rem' : '0.875rem', color: highlight ? 'var(--primary)' : 'var(--foreground)' }}>
        {Icon && <Icon size={14} style={{ opacity: 0.6 }} />}
        {value}
      </div>
    </div>
  );
}
