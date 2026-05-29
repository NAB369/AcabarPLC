'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, User, Phone, Mail, MapPin, 
  CreditCard, Globe, FileText, Briefcase, 
  Building, Calendar, ShieldCheck, Clock,
  ExternalLink, Edit, DollarSign, Users, UserCheck, AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function CustomerProfilePage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const [customerData, docsData] = await Promise.all([
          api.get(`/customers/${id}`),
          api.get(`/kyc/customers/${id}/documents`).catch(() => [])
        ]);
        setCustomer(customerData);
        setDocuments(docsData);
      } catch (err) {
        console.error('Failed to fetch customer data', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCustomerData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>
      </div>
    );
  }

  if (!customer) {
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
          color: '#ef4444',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '2rem',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.05)'
        }}>
          <AlertCircle size={36} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--foreground)' }}>Customer Profile Not Found</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2.5rem', maxWidth: '380px' }}>
          We couldn't locate the customer profile you requested. The customer ID may be invalid, or the database was recently reset.
        </p>
        <Link href="/admin/customers/accounts" className="btn btn-primary" style={{
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
          <ArrowLeft size={18} /> Back to Customers List
        </Link>
      </div>
    );
  }

  const InfoCard = ({ title, icon: Icon, children }: any) => (
    <div className="card" style={{ padding: '1.5rem', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.75rem' }}>
        <div style={{ color: 'var(--primary)' }}><Icon size={20} /></div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>{title}</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {children}
      </div>
    </div>
  );

  const InfoRow = ({ label, value, icon: Icon }: any) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.025em' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', fontSize: '0.9375rem', color: 'var(--foreground)' }}>
        {Icon && <Icon size={15} style={{ opacity: 0.5 }} />}
        {value || 'Not provided'}
      </div>
    </div>
  );

  return (
    <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link href="/admin/customers/accounts" style={{ 
            width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'white', border: '1px solid var(--border-color)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textDecoration: 'none'
          }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>{customer.firstName} {customer.lastName}</h1>
              <span className={`badge ${customer.kycStatus === 'APPROVED' ? 'badge-approved' : 'badge-pending'}`} style={{ fontSize: '0.75rem' }}>
                {customer.kycStatus === 'APPROVED' ? 'Verified' : 'Pending Verification'}
              </span>
            </div>
            {(customer.khmerLastName || customer.khmerFirstName) && <div style={{ fontSize: '1.25rem', color: 'var(--primary)', fontWeight: '600', marginTop: '0.25rem' }}>{customer.khmerLastName} {customer.khmerFirstName}</div>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href={`/admin/customers/edit/${customer.id}`} style={{ textDecoration: 'none' }}>
            <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Edit size={16} /> Edit Profile
            </button>
          </Link>
          <Link href={`/admin/loans/new?customerId=${customer.id}`} style={{ textDecoration: 'none' }}>
            <button className="btn btn-primary" style={{ backgroundColor: 'var(--foreground)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              New Loan Application
            </button>
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
        {/* Identity & Basic Info */}
        <InfoCard title="Identity Details" icon={User}>
          <InfoRow label="Gender" value={customer.gender ? customer.gender.charAt(0) + customer.gender.slice(1).toLowerCase() : null} icon={User} />
          <InfoRow label="National ID" value={customer.nationalId} icon={CreditCard} />
          <InfoRow label="Passport" value={customer.passport} icon={Globe} />
          <InfoRow label="Family Book Ref" value={customer.familyBook} icon={FileText} />
          <InfoRow label="Date of Birth" value={customer.dob ? new Date(customer.dob).toLocaleDateString() : null} icon={Calendar} />
        </InfoCard>

        {/* Contact & Location */}
        <InfoCard title="Contact & Residence" icon={Phone}>
          <InfoRow label="Phone Number" value={customer.phone} icon={Phone} />
          <InfoRow label="Email Address" value={customer.email} icon={Mail} />
          <InfoRow label="Residential Address" value={customer.address} icon={MapPin} />
        </InfoCard>

        {/* Employment & Work */}
        <InfoCard title="Work & Financials" icon={Briefcase}>
          <InfoRow label="Occupation" value={customer.occupation} icon={Briefcase} />
          <InfoRow label="Employer" value={customer.employerName} icon={Building} />
          <InfoRow label="Monthly Income (USD)" value={customer.monthlyIncome ? `$${customer.monthlyIncome.toLocaleString()}` : null} icon={DollarSign} />
          <InfoRow label="Monthly Income (KHR)" value={customer.monthlyIncomeKhr ? `៛${customer.monthlyIncomeKhr.toLocaleString()}` : null} icon={DollarSign} />
          <InfoRow label="Dependent" value={customer.dependentCount} icon={Users} />
          <InfoRow label="Income Maker" value={customer.incomeMaker} icon={Briefcase} />
          <div style={{ marginTop: '0.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Business Information</span>
            <p style={{ fontSize: '0.875rem', margin: '0.5rem 0 0', lineHeight: 1.5 }}>{customer.businessInfo || 'No business details provided.'}</p>
          </div>
        </InfoCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        {/* Co-borrower Details Card */}
        <InfoCard title="Co-borrower Details" icon={UserCheck}>
          <InfoRow label="Co-Borrower(Khmer)" value={customer.coBorrowerKhmerName} icon={User} />
          <InfoRow label="Co-Borrower(English)" value={customer.coBorrowerName} icon={User} />
          <InfoRow label="Phone Number" value={customer.coBorrowerPhone} icon={Phone} />
          <InfoRow label="National ID" value={customer.coBorrowerNationalId} icon={CreditCard} />
        </InfoCard>

        {/* Guarantor Details Card */}
        <InfoCard title="Guarantor Details" icon={Users}>
          <InfoRow label="Guarantor(Khmer)" value={customer.guarantorKhmerName} icon={User} />
          <InfoRow label="Guarantor(English)" value={customer.guarantorName} icon={User} />
          <InfoRow label="Phone Number" value={customer.guarantorPhone} icon={Phone} />
          <InfoRow label="National ID" value={customer.guarantorNationalId} icon={CreditCard} />
          <InfoRow label="Relationship" value={customer.guarantorRelationship} icon={Briefcase} />
        </InfoCard>
      </div>

      {/* Account Overview & History */}
      <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Loan Portfolio</h3>
            <Link href="/admin/los" style={{ textDecoration: 'none' }}>
              <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>View History</button>
            </Link>
          </div>
          
          {customer.loans && customer.loans.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {customer.loans.map((loan: any) => (
                <Link key={loan.id} href={`/admin/los/${loan.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-lg)', border: '1px solid #f1f5f9', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.backgroundColor = 'var(--primary-light)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', boxShadow: 'var(--shadow-sm)' }}>
                        <DollarSign size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--foreground)' }}>${Number(loan.principalAmount).toLocaleString()}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {loan.id.substring(0, 8).toUpperCase()} • {loan.durationMonths} Months</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span className={`badge ${loan.status === 'ACTIVE' || loan.status === 'DISBURSED' ? 'badge-approved' : loan.status === 'REJECTED' ? 'badge-rejected' : 'badge-pending'}`} style={{ fontSize: '0.7rem' }}>{loan.status.replace(/_/g, ' ')}</span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{new Date(loan.createdAt).toLocaleDateString()}</div>
                      </div>
                      <ExternalLink size={16} color="var(--text-muted)" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-color)' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}><Clock size={32} /></div>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>No loan history recorded for this customer.</p>
            </div>
          )}

          {/* Supporting Documents Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '2.5rem', marginBottom: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '2.5rem' }}>
            <FileText size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Supporting Documents</h3>
          </div>

          {documents && documents.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {documents.map((doc: any) => {
                const labelMap: Record<string, string> = {
                  NATIONAL_ID: 'National ID Card',
                  PASSPORT: 'Passport Scan',
                  FAMILY_BOOK: 'Family Book',
                  BUSINESS_DOC: 'Business Information / License',
                  CO_BORROWER_ID: 'Co-Borrower ID / Document',
                  GUARANTOR_ID: 'Guarantor ID / Document',
                };
                
                const getDocIcon = (type: string) => {
                  switch(type) {
                    case 'NATIONAL_ID': return <CreditCard size={18} />;
                    case 'PASSPORT': return <Globe size={18} />;
                    case 'FAMILY_BOOK': return <FileText size={18} />;
                    case 'BUSINESS_DOC': return <Briefcase size={18} />;
                    case 'CO_BORROWER_ID': return <UserCheck size={18} />;
                    case 'GUARANTOR_ID': return <Users size={18} />;
                    default: return <FileText size={18} />;
                  }
                };

                return (
                  <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-lg)', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {getDocIcon(doc.type)}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: '700', fontSize: '0.875rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{labelMap[doc.type] || doc.type}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '180px' }}>{doc.fileName}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      <span className={`badge ${doc.status === 'APPROVED' ? 'badge-approved' : doc.status === 'REJECTED' ? 'badge-rejected' : 'badge-pending'}`} style={{ fontSize: '0.7rem' }}>
                        {doc.status}
                      </span>
                      <a href={`http://localhost:4000${doc.filePath}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#e2e8f0', color: 'var(--text-color)', transition: 'all 0.2s' }}>
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-color)', color: 'var(--text-muted)' }}>
              No supporting documents uploaded for this customer.
            </div>
          )}
        </div>

        <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--foreground)', color: 'white', border: 'none' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem', color: 'white' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button className="btn" style={{ width: '100%', justifyContent: 'flex-start', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white', border: 'none', textAlign: 'left' }}>
              <ShieldCheck size={18} style={{ marginRight: '0.75rem' }} /> Verify Identity
            </button>
            <button className="btn" style={{ width: '100%', justifyContent: 'flex-start', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white', border: 'none', textAlign: 'left' }}>
              <Mail size={18} style={{ marginRight: '0.75rem' }} /> Send Notification
            </button>
            <button className="btn" style={{ width: '100%', justifyContent: 'flex-start', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white', border: 'none', textAlign: 'left' }}>
              <ExternalLink size={18} style={{ marginRight: '0.75rem' }} /> Credit Report (CBC)
            </button>
          </div>
          
          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Info size={16} />
              <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Administrative Note</span>
            </div>
            <p style={{ fontSize: '0.75rem', opacity: 0.7, lineHeight: 1.6, margin: 0 }}>
              This customer profile was last updated on {new Date(customer.updatedAt || customer.createdAt).toLocaleDateString()}. Ensure all KYC documents are verified before loan disbursement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Info icon since it wasn't in the main imports but used in Note
function Info({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
  );
}
