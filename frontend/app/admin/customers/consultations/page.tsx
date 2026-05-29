'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { 
  Calendar as CalendarIcon, Clock, User, 
  MessageSquare, ChevronRight, CheckCircle2, 
  AlertCircle, Filter, Plus, X, AlignLeft, Info
} from 'lucide-react';

export default function ConsultationsPage() {
  // State for consultations list
  const [consultations, setConsultations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'PAST'>('UPCOMING');
  const [selectedConsultation, setSelectedConsultation] = useState<any | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // New Consultation Form State
  const [newCustomer, setNewCustomer] = useState('');
  const [customCustomerName, setCustomCustomerName] = useState('');
  const [newType, setNewType] = useState('Loan Advice');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Fetch consultations
  const fetchConsultations = async () => {
    try {
      const data = await api.get('/consultations');
      setConsultations(data.map((c: any) => ({
        ...c,
        customer: c.customer ? `${c.customer.firstName} ${c.customer.lastName}` : 'Unknown Customer'
      })));
    } catch (err) {
      console.error('Failed to fetch consultations', err);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  // Fetch customers for the dropdown selector
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await api.get('/customers');
        setCustomers(data);
      } catch (err) {
        console.error('Failed to fetch customers', err);
      }
    };
    fetchCustomers();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <span className="badge badge-approved">Completed</span>;
      case 'PENDING': return <span className="badge badge-pending">Upcoming</span>;
      case 'CANCELLED': return <span className="badge badge-rejected">Cancelled</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  // Filter consultations based on selected tab and type filter
  const filteredConsultations = consultations.filter((item) => {
    const matchesTab = activeTab === 'UPCOMING'
      ? item.status === 'PENDING'
      : (item.status === 'COMPLETED' || item.status === 'CANCELLED');
    const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
    return matchesTab && matchesType;
  });

  // Calculate dynamic metrics
  const totalSessions = consultations.length;
  const completedSessions = consultations.filter(c => c.status === 'COMPLETED').length;
  const pendingSessions = consultations.filter(c => c.status === 'PENDING').length;
  const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 100;

  // Handle scheduling new session
  const handleScheduleSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer || !newDate || !newTime) {
      alert('Please fill out all required fields.');
      return;
    }

    // In a real scenario, the 'newCustomer' would be the customer ID from the select.
    // If they choose 'CUSTOM' we would need to create a new customer first or just not support it here.
    // Since backend requires customerId, if it's CUSTOM we can't easily proceed without creating a customer.
    // Assuming newCustomer is the customer ID (except when 'CUSTOM').
    if (newCustomer === 'CUSTOM') {
      alert('Please select an existing customer to schedule a consultation.');
      return;
    }

    const scheduledAt = new Date(`${newDate}T${newTime}:00`).toISOString();

    try {
      await api.post('/consultations', {
        customerId: newCustomer,
        type: newType,
        scheduledAt,
        notes: newNotes
      });
      
      // Refresh list
      await fetchConsultations();
      
      // Reset Form
      setNewCustomer('');
      setCustomCustomerName('');
      setNewType('Loan Advice');
      setNewDate('');
      setNewTime('');
      setNewNotes('');
      setShowScheduleModal(false);
    } catch (error) {
      console.error('Failed to schedule session', error);
      alert('Failed to schedule session');
    }
  };

  // Update session status (Complete / Cancel)
  const updateSessionStatus = async (id: string, newStatus: 'COMPLETED' | 'CANCELLED') => {
    try {
      await api.patch(`/consultations/${id}`, { status: newStatus });
      setConsultations(prev => prev.map(item => 
        item.id === id ? { ...item, status: newStatus } : item
      ));
      setSelectedConsultation(null);
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.03em', margin: 0 }}>Expert <span className="text-gradient">Consultations</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>Schedule and manage financial advisory sessions</p>
        </div>
        <button 
          onClick={() => setShowScheduleModal(true)}
          className="btn btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'var(--foreground)', color: 'white' }}
        >
          <Plus size={18} /> Schedule Session
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2.5rem' }}>
        
        {/* Left: Consultation List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white' }}>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div 
                onClick={() => setActiveTab('UPCOMING')}
                style={{ 
                  fontWeight: activeTab === 'UPCOMING' ? '700' : '500', 
                  fontSize: '0.875rem', 
                  borderBottom: activeTab === 'UPCOMING' ? '2px solid var(--primary)' : '2px solid transparent', 
                  paddingBottom: '0.5rem',
                  color: activeTab === 'UPCOMING' ? 'var(--foreground)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Upcoming
              </div>
              <div 
                onClick={() => setActiveTab('PAST')}
                style={{ 
                  fontWeight: activeTab === 'PAST' ? '700' : '500', 
                  fontSize: '0.875rem', 
                  borderBottom: activeTab === 'PAST' ? '2px solid var(--primary)' : '2px solid transparent', 
                  paddingBottom: '0.5rem',
                  color: activeTab === 'PAST' ? 'var(--foreground)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Past Sessions
              </div>
            </div>
            
            {/* Filter Dropdown */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="btn btn-secondary" 
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'white' }}
              >
                <Filter size={15} /> {typeFilter === 'ALL' ? 'Filter' : typeFilter}
              </button>
              {showFilterDropdown && (
                <div style={{
                  position: 'absolute', right: 0, top: '100%', marginTop: '0.5rem',
                  backgroundColor: 'white', border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
                  padding: '0.5rem', zIndex: 10, minWidth: '180px',
                  display: 'flex', flexDirection: 'column', gap: '0.25rem'
                }}>
                  {['ALL', 'Loan Advice', 'Debt Restructuring', 'General Inquiry', 'Credit Assessment'].map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setTypeFilter(type);
                        setShowFilterDropdown(false);
                      }}
                      style={{
                        padding: '0.5rem 1rem', textAlign: 'left', background: 'none', border: 'none',
                        fontSize: '0.8125rem', cursor: 'pointer', borderRadius: '4px',
                        color: typeFilter === type ? 'var(--primary)' : 'var(--text-muted-dark)',
                        backgroundColor: typeFilter === type ? 'var(--primary-light)' : 'transparent',
                        fontWeight: typeFilter === type ? '600' : '500',
                        width: '100%'
                      }}
                    >
                      {type === 'ALL' ? 'All Types' : type}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {filteredConsultations.length === 0 ? (
            <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No consultations found for this selection.
            </div>
          ) : (
            filteredConsultations.map((item) => (
              <div 
                key={item.id} 
                className="card" 
                onClick={() => setSelectedConsultation(item)}
                style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '2rem', transition: 'all 0.2s', cursor: 'pointer' }} 
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} 
                onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CalendarIcon size={24} color="var(--primary)" />
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>{item.type}</h3>
                    {getStatusBadge(item.status)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: 'var(--text-muted-dark)', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={14} /> {item.customer}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={14} /> {new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--foreground)', marginBottom: '0.25rem' }}>
                    {new Date(item.scheduledAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                  <ChevronRight size={20} color="var(--text-muted)" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Quick Stats & Calendar View (Simplified) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} color="#10b981" /> Efficiency
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: '700' }}>Completion Rate</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>{completionRate}%</div>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' }}>
                  <div style={{ width: `${completionRate}%`, height: '100%', backgroundColor: '#10b981', borderRadius: '3px', transition: 'width 0.5s ease-out' }}></div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted-dark)', fontWeight: '600' }}>Pending Requests</div>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700' }}>
                  {pendingSessions}
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--foreground)', color: 'white' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} color="var(--secondary)" /> Advice Note
            </h3>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, opacity: 0.8, margin: 0 }}>
              Prepare the **Q2 Financial Statement** templates before each consultation to ensure accurate advice on debt ratios.
            </p>
          </div>
        </div>
      </div>

      {/* Schedule Session Modal */}
      {showScheduleModal && (
        <div className="modal-backdrop" onClick={() => setShowScheduleModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Schedule Advisory Session</h2>
              <button 
                onClick={() => setShowScheduleModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleScheduleSession} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-muted-dark)' }}>Customer Name</label>
                <select
                  required
                  value={newCustomer}
                  onChange={(e) => setNewCustomer(e.target.value)}
                  className="input-field"
                  style={{ marginBottom: newCustomer === 'CUSTOM' ? '0.75rem' : '0' }}
                >
                  <option value="">Select a customer...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} {(c.khmerLastName || c.khmerFirstName) ? `(${c.khmerLastName || ''} ${c.khmerFirstName || ''})`.trim() : ''}
                    </option>
                  ))}
                  <option value="CUSTOM">+ New Prospect</option>
                </select>
                
                {newCustomer === 'CUSTOM' && (
                  <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.875rem', color: '#b91c1c' }}>
                    Please create a new customer record first before scheduling a consultation.
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-muted-dark)' }}>Consultation Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="input-field"
                >
                  <option value="Loan Advice">Loan Advice</option>
                  <option value="Debt Restructuring">Debt Restructuring</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Credit Assessment">Credit Assessment</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-muted-dark)' }}>Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-muted-dark)' }}>Time</label>
                  <input
                    type="time"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-muted-dark)' }}>Notes</label>
                <textarea
                  placeholder="Describe consultation topic or customer request..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="input-field"
                  rows={3}
                  style={{ height: 'auto', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowScheduleModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  Schedule Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Consultation Detail Modal */}
      {selectedConsultation && (
        <div className="modal-backdrop" onClick={() => setSelectedConsultation(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Consultation Details</h2>
              <button 
                onClick={() => setSelectedConsultation(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                  <CalendarIcon size={20} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontSize: '1.125rem', fontWeight: '800', color: 'var(--foreground)' }}>{selectedConsultation.type}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.125rem' }}>
                    {getStatusBadge(selectedConsultation.status)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <User size={16} color="var(--text-muted-dark)" />
                  <span style={{ fontSize: '0.9375rem', fontWeight: '700' }}>{selectedConsultation.customer}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Clock size={16} color="var(--text-muted-dark)" />
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted-dark)' }}>
                    {new Date(selectedConsultation.scheduledAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at{' '}
                    {new Date(selectedConsultation.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </span>
                </div>
              </div>

              {selectedConsultation.notes && (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <AlignLeft size={16} color="var(--text-muted-dark)" style={{ marginTop: '0.125rem' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Discussion Notes</div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted-dark)', margin: 0, lineHeight: 1.5 }}>
                      {selectedConsultation.notes}
                    </p>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <div>
                  {selectedConsultation.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => updateSessionStatus(selectedConsultation.id, 'CANCELLED')}
                        className="btn btn-secondary"
                        style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                      >
                        Cancel Session
                      </button>
                      <button
                        onClick={() => updateSessionStatus(selectedConsultation.id, 'COMPLETED')}
                        className="btn"
                        style={{ backgroundColor: '#10b981', color: 'white' }}
                      >
                        Mark as Completed
                      </button>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setSelectedConsultation(null)}
                  className="btn btn-secondary"
                >
                  Close
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
