'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import {
  Shield, AlertTriangle, CheckCircle2, XCircle,
  Clock, Eye
} from 'lucide-react';
import Link from 'next/link';

export default function UnderwritingDashboardPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const queue = await api.get('/los/queue');
        setApplications(queue);
      } catch (err) {
        console.error('Failed to fetch underwriting queue', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQueue();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>
      </div>
    );
  }

  // --- Derived lists ---
  const pendingReviews = applications.filter((app: any) =>
    ['CREDIT_CHECK', 'UNDERWRITING', 'TIER1_REVIEW', 'TIER2_REVIEW', 'TIER3_REVIEW'].includes(app.status)
  ).map((app: any) => {
    const riskFlags: string[] = [];
    if (app.dtiRatio && app.dtiRatio > 0.5) riskFlags.push('DTI ratio above 50%');
    if (app.cbcScore && app.cbcScore < 500) riskFlags.push('CBC score below recommended (500)');
    return {
      id: app.id,
      name: `${app.customer.firstName} ${app.customer.lastName}`,
      amount: Number(app.principalAmount),
      dtiRatio: app.dtiRatio || 0,
      cbcScore: app.cbcScore || 0,
      tier: app.status.startsWith('TIER') ? app.status : 'UNDERWRITING',
      product: app.product.name,
      riskFlags
    };
  });

  const APPROVED_STATUSES = ['APPROVED', 'PENDING_DISBURSEMENT', 'DISBURSED', 'ACTIVE', 'COMPLETED'];
  const REJECTED_STATUSES = ['REJECTED', 'AUTO_REJECTED'];

  const recentDecisions = applications.filter((app: any) =>
    [...APPROVED_STATUSES, ...REJECTED_STATUSES].includes(app.status)
  ).map((app: any) => {
    const reasons: string[] = [];
    if (app.cbcScore) reasons.push(`CBC: ${app.cbcScore}`);
    if (app.dtiRatio) reasons.push(`DTI: ${(app.dtiRatio * 100).toFixed(0)}%`);
    if (app.rejectionReason) reasons.push(app.rejectionReason);
    if (reasons.length === 0) reasons.push('Standard approval criteria met');
    return {
      id: app.id,
      name: `${app.customer.firstName} ${app.customer.lastName}`,
      decision: app.status,
      reasons,
      date: new Date(app.updatedAt || app.createdAt).toISOString().split('T')[0]
    };
  });

  // --- Metric counts ---
  const pendingCount = pendingReviews.length;
  const approvedCount = applications.filter((app: any) => APPROVED_STATUSES.includes(app.status)).length;
  const autoRejectedCount = applications.filter((app: any) => app.status === 'AUTO_REJECTED').length;
  const cbcScores = applications.map((app: any) => app.cbcScore).filter((s: any) => s !== null && s !== undefined && s > 0);
  const avgCbcScore = cbcScores.length > 0
    ? Math.round(cbcScores.reduce((sum: number, s: number) => sum + s, 0) / cbcScores.length)
    : null;

  // --- Card definitions ---
  const cards = [
    { key: 'pending',       label: 'Pending Reviews',      value: String(pendingCount),                              icon: <Clock size={18} />,       color: 'var(--warning-text)', bg: 'var(--warning-bg)' },
    { key: 'approved',      label: 'Approved (This Week)', value: String(approvedCount),                             icon: <CheckCircle2 size={18} />, color: 'var(--success-text)', bg: 'var(--success-bg)' },
    { key: 'auto_rejected', label: 'Auto-Rejected',        value: String(autoRejectedCount),                         icon: <XCircle size={18} />,      color: 'var(--error-text)', bg: 'var(--error-bg)' },
    { key: 'cbc',           label: 'Avg. CBC Score',       value: avgCbcScore !== null ? String(avgCbcScore) : '—',  icon: <Shield size={18} />,       color: 'var(--primary)', bg: 'var(--primary-light)' },
  ];

  // --- Filtered data based on active card ---
  const filteredPending =
    activeFilter === 'pending'        ? pendingReviews :
    activeFilter === 'approved' || activeFilter === 'auto_rejected' ? [] :
    pendingReviews;

  const filteredDecisions =
    activeFilter === 'approved'      ? recentDecisions.filter(d => APPROVED_STATUSES.includes(d.decision)) :
    activeFilter === 'auto_rejected' ? recentDecisions.filter(d => REJECTED_STATUSES.includes(d.decision)) :
    activeFilter === 'pending'       ? [] :
    recentDecisions;

  const pendingTableTitle =
    activeFilter === 'pending'       ? 'Pending Credit Reviews (Filtered)' :
    activeFilter === 'approved' || activeFilter === 'auto_rejected' ? 'Pending Credit Reviews (Filtered — no match)' :
    'Pending Credit Reviews';

  const decisionsTitle =
    activeFilter === 'approved'      ? 'Recent Decisions — Approved Only' :
    activeFilter === 'auto_rejected' ? 'Recent Decisions — Auto-Rejected Only' :
    activeFilter === 'pending'       ? 'Recent Decisions (Filtered — no match)' :
    'Recent Decisions';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.03em', margin: 0 }}>
          Underwriting Dashboard
        </h2>
        <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Credit analysis and automated decisioning overview
          {activeFilter && (
            <span style={{ marginLeft: '0.75rem', padding: '0.125rem 0.625rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '600' }}>
              Filtered by: {cards.find(c => c.key === activeFilter)?.label}
              <button
                onClick={() => setActiveFilter(null)}
                style={{ background: 'none', border: 'none', marginLeft: '0.375rem', cursor: 'pointer', color: 'var(--text-muted)', fontWeight: '700', lineHeight: 1, padding: 0 }}
                title="Clear filter"
              >×</button>
            </span>
          )}
        </p>
      </div>

      {/* Summary Cards — clickable */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1.25rem' }}>
        {cards.map((card) => {
          const isActive = activeFilter === card.key;
          const isClickable = card.key !== 'cbc';
          return (
            <div
              key={card.key}
              className="card"
              onClick={() => isClickable && setActiveFilter(isActive ? null : card.key)}
              style={{
                position: 'relative',
                overflow: 'hidden',
                cursor: isClickable ? 'pointer' : 'default',
                backgroundColor: 'var(--card-bg)',
                borderRadius: '1rem',
                border: '1px solid var(--border-color)',
                boxShadow: isActive ? `0 8px 24px ${card.bg}` : '0 4px 12px rgba(0,0,0,0.03)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isActive ? 'translateY(-4px)' : undefined,
                padding: '1.25rem'
              }}
              onMouseOver={(e) => { if (isClickable && !isActive) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)'; } }}
              onMouseOut={(e) => { if (!isActive) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'; } }}
            >
              {/* Colored left edge accent */}
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', backgroundColor: isActive ? card.color : 'transparent', transition: 'background-color 0.3s ease' }} />
              
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: `radial-gradient(circle, ${card.bg} 0%, transparent 70%)`, opacity: isActive ? 1 : 0.4, transition: 'opacity 0.3s ease' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  backgroundColor: isActive ? card.color : card.bg,
                  color: isActive ? 'white' : card.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}>
                  {card.icon}
                </div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted-dark)', fontWeight: '500' }}>{card.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.75rem', fontWeight: '700', letterSpacing: '-0.03em', color: isActive ? card.color : undefined }}>
                  {card.value}
                </span>
              </div>
              {isClickable && (
                <div style={{ fontSize: '0.6875rem', color: isActive ? card.color : 'var(--text-muted)', marginTop: '0.375rem', fontWeight: '600' }}>
                  {isActive ? '✓ Filtering table below' : 'Click to filter'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pending Reviews Table */}
      <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '1rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--card-bg)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0, color: 'var(--foreground)' }}>{pendingTableTitle}</h3>
          <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--warning-bg)', color: 'var(--warning-text)', padding: '0.375rem 0.875rem', borderRadius: '99px', fontWeight: '700' }}>
            {filteredPending.length} awaiting
          </span>
        </div>

        <div style={{ overflowX: 'auto', padding: '0 0.5rem 0.5rem 0.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
            <thead>
              <tr>
                <th style={{ padding: '0 1rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>Application</th>
                <th style={{ padding: '0 1rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>Product</th>
                <th style={{ padding: '0 1rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>Amount</th>
                <th style={{ padding: '0 1rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>DTI Ratio</th>
                <th style={{ padding: '0 1rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>CBC Score</th>
                <th style={{ padding: '0 1rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>Approval Tier</th>
                <th style={{ padding: '0 1rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>Risk Flags</th>
                <th style={{ padding: '0 1rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredPending.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    {activeFilter && activeFilter !== 'pending'
                      ? `No pending reviews match the "${cards.find(c => c.key === activeFilter)?.label}" filter.`
                      : 'No pending credit reviews found.'}
                  </td>
                </tr>
              ) : (
                filteredPending.map((review) => (
                  <tr key={review.id} style={{ transition: 'all 0.2s ease', backgroundColor: 'var(--background)' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <td style={{ padding: '1rem', borderTopLeftRadius: '0.5rem', borderBottomLeftRadius: '0.5rem' }}>
                      <div style={{ fontWeight: '700', fontSize: '0.875rem' }}>{review.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: '500', marginTop: '2px' }}>#{review.id.substring(0, 8).toUpperCase()}</div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.8125rem', color: 'var(--text-muted-dark)', fontWeight: '500' }}>{review.product}</td>
                    <td style={{ padding: '1rem', fontWeight: '700', fontSize: '0.875rem' }}>${review.amount.toLocaleString()}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '60px', height: '6px', borderRadius: '3px', backgroundColor: 'var(--border-color)', overflow: 'hidden' }}>
                          <div style={{
                            width: `${Math.min(review.dtiRatio * 100, 100)}%`,
                            height: '100%', borderRadius: '3px',
                            backgroundColor: review.dtiRatio > 0.7 ? 'var(--error-text)' : review.dtiRatio > 0.5 ? 'var(--warning-text)' : 'var(--success-text)',
                          }} />
                        </div>
                        <span style={{
                          fontSize: '0.8125rem', fontWeight: '600',
                          color: review.dtiRatio > 0.7 ? 'var(--error-text)' : review.dtiRatio > 0.5 ? 'var(--warning-text)' : 'var(--success-text)',
                        }}>
                          {(review.dtiRatio * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        fontSize: '0.875rem', fontWeight: '700',
                        color: review.cbcScore < 300 ? 'var(--error-text)' : review.cbcScore < 500 ? 'var(--warning-text)' : 'var(--success-text)',
                      }}>
                        {review.cbcScore || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        fontSize: '0.6875rem', fontWeight: '600', padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-full)',
                        backgroundColor: review.tier === 'TIER3_REVIEW' ? 'var(--pink-bg)' : review.tier === 'TIER2_REVIEW' ? 'var(--purple-bg)' : 'var(--primary-light)',
                        color: review.tier === 'TIER3_REVIEW' ? 'var(--pink-text)' : review.tier === 'TIER2_REVIEW' ? 'var(--purple-text)' : 'var(--primary)',
                      }}>
                        {review.tier.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {review.riskFlags.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {review.riskFlags.map((flag: string, i: number) => (
                            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem', color: 'var(--warning-text)' }}>
                              <AlertTriangle size={10} /> {flag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--success-text)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <CheckCircle2 size={12} /> Clean
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', borderTopRightRadius: '0.5rem', borderBottomRightRadius: '0.5rem' }}>
                      <Link href={`/admin/los/${review.id}`} style={{ textDecoration: 'none' }}>
                        <button style={{
                          background: 'none', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
                          padding: '0.375rem 0.75rem', fontSize: '0.75rem', color: 'var(--primary)',
                          fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem',
                          transition: 'all var(--transition-fast)',
                        }}
                          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary-light)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                        >
                          <Eye size={13} /> Review
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Decisions */}
      <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '1rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1.25rem', color: 'var(--foreground)' }}>{decisionsTitle}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredDecisions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '0.75rem', backgroundColor: 'var(--bg-muted)' }}>
              {activeFilter === 'pending'
                ? 'No recent decisions match the "Pending Reviews" filter.'
                : 'No recent decisions recorded.'}
            </div>
          ) : (
            filteredDecisions.map((d) => {
              const isApproved = APPROVED_STATUSES.includes(d.decision);
              const iconBg    = isApproved ? 'var(--success-bg)' : 'var(--error-bg)';
              const iconColor = isApproved ? 'var(--success-text)' : 'var(--error-text)';
              const label     = d.decision.replace(/_/g, ' ');
              return (
                <div key={d.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '1rem 1.25rem', borderRadius: '0.75rem',
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border-color)',
                  transition: 'transform 0.2s ease',
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: iconBg, color: iconColor,
                    }}>
                      {isApproved ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                        {d.name} <span style={{ color: 'var(--text-muted)', fontWeight: '400', fontFamily: 'monospace', fontSize: '0.75rem' }}>(#{d.id.substring(0, 8).toUpperCase()})</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.reasons.join(' • ')}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      fontSize: '0.6875rem', fontWeight: '600', padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-full)',
                      backgroundColor: iconBg, color: iconColor,
                    }}>
                      {label}
                    </span>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{d.date}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
