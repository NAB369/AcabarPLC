'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { 
  Star, MessageCircle, TrendingUp, Users, 
  Filter, ArrowRight, ThumbsUp, X, BarChart3, ShieldAlert
} from 'lucide-react';

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const data = await api.get('/feedback');
        setFeedbacks(data.map((f: any) => ({
          ...f,
          customerName: f.customer ? `${f.customer.firstName} ${f.customer.lastName}` : 'Unknown Customer',
          date: new Date(f.createdAt).toLocaleDateString(),
          isHelpful: false,
          helpfulCount: Math.floor(Math.random() * 10) // mock helpful count for now since it's not in db
        })));
      } catch (err) {
        console.error('Failed to fetch feedback', err);
      }
    };
    fetchFeedback();
  }, []);

  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const toggleHelpful = (id: string) => {
    setFeedbacks(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          isHelpful: !item.isHelpful,
          helpfulCount: item.isHelpful ? item.helpfulCount - 1 : item.helpfulCount + 1
        };
      }
      return item;
    }));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={16} fill={i < rating ? "var(--secondary)" : "none"} color={i < rating ? "var(--secondary)" : "#e2e8f0"} />
    ));
  };

  const filteredFeedbacks = feedbacks.filter(item => 
    categoryFilter === 'ALL' || item.category === categoryFilter
  );

  const averageRating = feedbacks.length ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1) : '0.0';
  const promoters = feedbacks.filter(f => f.rating >= 4).length;
  const detractors = feedbacks.filter(f => f.rating <= 2).length;
  const nps = feedbacks.length ? Math.round(((promoters - detractors) / feedbacks.length) * 100) : 0;
  
  return (
    <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.03em', margin: 0 }}>Customer <span className="text-gradient">Sentiment</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>Analyze customer satisfaction and operational feedback</p>
        </div>
      </div>

      {/* Top Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', marginBottom: '3rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: '700' }}>Overall Rating</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: '800' }}>{averageRating}</div>
            {feedbacks.length > 0 && <div style={{ color: 'var(--success-text)', fontSize: '0.875rem', fontWeight: '600' }}>Out of 5</div>}
          </div>
          <div style={{ display: 'flex', gap: '2px', marginTop: '0.5rem' }}>
            {renderStars(Math.round(parseFloat(averageRating)) || 0)}
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: '700' }}>NPS Score</div>
          <div style={{ fontSize: '2rem', fontWeight: '800' }}>{nps > 0 ? `+${nps}` : nps}</div>
          <div style={{ fontSize: '0.75rem', color: nps > 50 ? 'var(--success-text)' : 'var(--text-muted-dark)', fontWeight: '600', marginTop: '0.5rem' }}>
            {nps > 50 ? 'Excellent Performance' : 'Needs Improvement'}
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: '700' }}>Total Responses</div>
          <div style={{ fontSize: '2rem', fontWeight: '800' }}>{feedbacks.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted-dark)', marginTop: '0.5rem' }}>All time</div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: '700' }}>Promoters</div>
          <div style={{ fontSize: '2rem', fontWeight: '800' }}>{feedbacks.length ? Math.round((promoters / feedbacks.length) * 100) : 0}%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600', marginTop: '0.5rem' }}>Rating 4 or 5</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2.5rem' }}>
        {/* Recent Feedback */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>Recent Testimonials</h3>
            
            {/* Filter Dropdown */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="btn btn-secondary" 
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'white' }}
              >
                <Filter size={15} /> {categoryFilter === 'ALL' ? 'Filter' : categoryFilter}
              </button>
              {showFilterDropdown && (
                <div style={{
                  position: 'absolute', right: 0, top: '100%', marginTop: '0.5rem',
                  backgroundColor: 'white', border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
                  padding: '0.5rem', zIndex: 10, minWidth: '150px',
                  display: 'flex', flexDirection: 'column', gap: '0.25rem'
                }}>
                  {['ALL', 'Process', 'Service', 'Product'].map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setCategoryFilter(category);
                        setShowFilterDropdown(false);
                      }}
                      style={{
                        padding: '0.5rem 1rem', textAlign: 'left', background: 'none', border: 'none',
                        fontSize: '0.8125rem', cursor: 'pointer', borderRadius: '4px',
                        color: categoryFilter === category ? 'var(--primary)' : 'var(--text-muted-dark)',
                        backgroundColor: categoryFilter === category ? 'var(--primary-light)' : 'transparent',
                        fontWeight: categoryFilter === category ? '600' : '500',
                        width: '100%'
                      }}
                    >
                      {category === 'ALL' ? 'All Categories' : category}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filteredFeedbacks.length === 0 ? (
              <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No feedback reviews found for this category.
              </div>
            ) : (
              filteredFeedbacks.map((item) => (
                <div key={item.id} className="card" style={{ padding: '1.5rem 2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.75rem' }}>
                        {item.customerName[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.875rem' }}>{item.customerName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.date}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {renderStars(item.rating)}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--text-muted-dark)', margin: '0 0 1rem 0' }}>
                    "{item.comment}"
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '600' }}>{item.category}</span>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button 
                        onClick={() => toggleHelpful(item.id)}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.375rem', 
                          color: item.isHelpful ? 'var(--primary)' : 'var(--text-muted)', 
                          fontSize: '0.8125rem',
                          fontWeight: item.isHelpful ? '600' : '500',
                          transition: 'color 0.2s'
                        }}
                      >
                        <ThumbsUp size={14} fill={item.isHelpful ? "var(--primary)" : "none"} /> Helpful {item.helpfulCount > 0 ? `(${item.helpfulCount})` : ''}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1.5rem' }}>Sentiment Trends</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted-dark)' }}>Approval Speed</span>
                  <span style={{ fontWeight: '700' }}>92% Positive</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px' }}>
                  <div style={{ width: '92%', height: '100%', backgroundColor: 'var(--success-text)', borderRadius: '3px' }}></div>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted-dark)' }}>Customer Support</span>
                  <span style={{ fontWeight: '700' }}>85% Positive</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px' }}>
                  <div style={{ width: '85%', height: '100%', backgroundColor: 'var(--success-text)', borderRadius: '3px' }}></div>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted-dark)' }}>Interest Rates</span>
                  <span style={{ fontWeight: '700' }}>78% Positive</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px' }}>
                  <div style={{ width: '78%', height: '100%', backgroundColor: 'var(--primary)', borderRadius: '3px' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '2rem', background: 'linear-gradient(135deg, var(--foreground) 0%, #1e293b 100%)', color: 'white' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="var(--secondary)" /> Insight of the Month
            </h3>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, opacity: 0.8, marginBottom: '1.5rem' }}>
              Customers are highlighting **Approval Speed** as the primary reason for choosing Acabar Plc over competitors.
            </p>
            <button 
              onClick={() => setShowReportModal(true)}
              className="btn btn-primary" 
              style={{ width: '100%', backgroundColor: 'var(--secondary)', color: 'var(--foreground)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              View Detailed Report <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Report Modal */}
      {showReportModal && (
        <div className="modal-backdrop" onClick={() => setShowReportModal(false)}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={20} color="var(--primary)" /> Sentiment Analysis Report
              </h2>
              <button 
                onClick={() => setShowReportModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Star breakdown */}
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-muted-dark)', textTransform: 'uppercase', marginBottom: '1rem' }}>Reviews Star Distribution</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { stars: 5, percent: 78 },
                    { stars: 4, percent: 14 },
                    { stars: 3, percent: 5 },
                    { stars: 2, percent: 2 },
                    { stars: 1, percent: 1 }
                  ].map(item => (
                    <div key={item.stars} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: '600', width: '45px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        {item.stars} <Star size={12} fill="var(--secondary)" color="var(--secondary)" />
                      </span>
                      <div style={{ flex: 1, height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${item.percent}%`, height: '100%', backgroundColor: 'var(--secondary)', borderRadius: '4px' }}></div>
                      </div>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '600', width: '30px', textAlign: 'right' }}>
                        {item.percent}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <hr style={{ border: 0, borderTop: '1px solid var(--border-color)', margin: 0 }} />

              {/* Mention trends */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--success-text)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Positive Mentions</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[
                      { topic: 'Approval Speed', score: '92%' },
                      { topic: 'Staff Helpful', score: '88%' },
                      { topic: 'Digital Flow', score: '85%' },
                      { topic: 'Low Interest', score: '78%' }
                    ].map(t => (
                      <div key={t.topic} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', padding: '0.375rem 0.75rem', backgroundColor: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0', color: '#16a34a', fontWeight: '600' }}>
                        <span>{t.topic}</span>
                        <span>{t.score}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#dc2626', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Areas of Concern</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[
                      { topic: 'Documentation Req.', score: '15%' },
                      { topic: 'System Downtime', score: '5%' },
                      { topic: 'App Load Speed', score: '4%' },
                      { topic: 'Notification Delay', score: '3%' }
                    ].map(t => (
                      <div key={t.topic} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', padding: '0.375rem 0.75rem', backgroundColor: '#fef2f2', borderRadius: '6px', border: '1px solid #fecdd3', color: '#dc2626', fontWeight: '600' }}>
                        <span>{t.topic}</span>
                        <span>{t.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button 
                  onClick={() => setShowReportModal(false)}
                  className="btn btn-secondary"
                >
                  Close Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeInBackdrop 0.25s ease-out;
        }
        .modal-content {
          background-color: white;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-2xl);
          width: 90%;
          max-width: 500px;
          padding: 2rem;
          animation: slideUpModal 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes fadeInBackdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUpModal {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}} />
    </div>
  );
}
