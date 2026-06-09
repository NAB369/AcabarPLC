'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/services/api';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, CheckCircle, AlertCircle, 
  User, Mail, Phone, MapPin, Building,
  CreditCard, Calendar, Save, Briefcase, FileText, Globe,
  Users, UserCheck, ShieldCheck, Upload, Trash2,
  RefreshCw, Clock, XCircle, AlertTriangle, FolderOpen
} from 'lucide-react';
import Link from 'next/link';
import { CAMBODIA_DISTRICTS, CAMBODIA_COMMUNES, CAMBODIA_VILLAGES } from '@/app/cambodia-data';

const DOC_TYPES: { type: string; label: string }[] = [
  { type: 'NATIONAL_ID',        label: 'National ID Card' },
  { type: 'PASSPORT',           label: 'Passport' },
  { type: 'FAMILY_BOOK',        label: 'Family Book' },
  { type: 'SALARY_SLIP',        label: 'Salary Slip' },
  { type: 'BANK_STATEMENT',     label: 'Bank Statement' },
  { type: 'BUSINESS_LICENSE',   label: 'Business License' },
  { type: 'PROPERTY_TITLE',     label: 'Property Title' },
  { type: 'CO_BORROWER_ID',     label: "Co-borrower ID / Passport" },
  { type: 'GUARANTOR_ID',       label: "Guarantor ID / Passport" },
  { type: 'OTHER',              label: 'Other Document' },
];

function statusBadge(status: string) {
  switch (status) {
    case 'VERIFIED':  return <span style={{ display:'inline-flex', alignItems:'center', gap:'0.25rem', padding:'0.2rem 0.6rem', borderRadius:'99px', fontSize:'0.6875rem', fontWeight:700, backgroundColor:'var(--success-bg)', color:'var(--success-text)' }}><CheckCircle size={11}/>Verified</span>;
    case 'PENDING':   return <span style={{ display:'inline-flex', alignItems:'center', gap:'0.25rem', padding:'0.2rem 0.6rem', borderRadius:'99px', fontSize:'0.6875rem', fontWeight:700, backgroundColor:'var(--warning-bg)', color:'var(--warning-text)' }}><Clock size={11}/>Pending Review</span>;
    case 'REJECTED':  return <span style={{ display:'inline-flex', alignItems:'center', gap:'0.25rem', padding:'0.2rem 0.6rem', borderRadius:'99px', fontSize:'0.6875rem', fontWeight:700, backgroundColor:'var(--error-bg)', color:'var(--error-text)' }}><XCircle size={11}/>Rejected</span>;
    default:          return <span style={{ padding:'0.2rem 0.6rem', borderRadius:'99px', fontSize:'0.6875rem', fontWeight:700, backgroundColor:'var(--bg-muted)', color:'var(--text-muted)' }}>{status}</span>;
  }
}

export default function EditCustomerPage() {
  const router  = useRouter();
  const { id }  = useParams();
  const [loading,   setLoading]   = useState(false);
  const [fetching,  setFetching]  = useState(true);
  const [branches,  setBranches]  = useState<any[]>([]);
  const [error,     setError]     = useState<string | null>(null);
  const [success,   setSuccess]   = useState(false);
  const [generatingCid, setGeneratingCid] = useState(false);
  const [autoGenerateCid, setAutoGenerateCid] = useState(false);

  // KYC document state
  const [documents,      setDocuments]      = useState<any[]>([]);
  const [docsLoading,    setDocsLoading]    = useState(true);
  const [uploadType,     setUploadType]     = useState('NATIONAL_ID');
  const [uploadFile,     setUploadFile]     = useState<File | null>(null);
  const [uploading,      setUploading]      = useState(false);
  const [uploadSuccess,  setUploadSuccess]  = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', khmerFirstName: '', khmerLastName: '', cid: '', phone: '', email: '',
    nationalId: '', passport: '', familyBook: '', dob: '', gender: '', maritalStatus: '',
    province: '',
    district: '',
    commune: '',
    village: '',
    houseNo: '',
    street: '',
    branchId: '', occupation: '', employerName: '', monthlyIncome: '', monthlyIncomeKhr: '',
    businessInfo: '', businessType: '', incomeBracket: '', dependentCount: '', incomeMaker: '', coBorrowerName: '', coBorrowerKhmerName: '', coBorrowerPhone: '',
    coBorrowerNationalId: '', guarantorName: '', guarantorKhmerName: '', guarantorPhone: '',
    guarantorNationalId: '', guarantorRelationship: '',
  });

  const fetchDocuments = async () => {
    setDocsLoading(true);
    try {
      const docs = await api.get(`/kyc/customers/${id}/documents`);
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch {
      setDocuments([]);
    } finally {
      setDocsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchesData, customerData] = await Promise.all([
          api.get('/branches'),
          api.get(`/customers/${id}`)
        ]);
        setBranches(branchesData);
        setFormData({
          firstName:            customerData.firstName || '',
          lastName:             customerData.lastName  || '',
          khmerFirstName:       customerData.khmerFirstName || '',
          khmerLastName:        customerData.khmerLastName || '',
          cid:                  customerData.cid || '',
          phone:                customerData.phone     || '',
          email:                customerData.email     || '',
          nationalId:           customerData.nationalId || '',
          passport:             customerData.passport   || '',
          familyBook:           customerData.familyBook || '',
          dob: customerData.dob ? new Date(customerData.dob).toISOString().split('T')[0] : '',
          gender:               customerData.gender    || '',
          maritalStatus:        customerData.maritalStatus || '',
          province:             '',
          district:             '',
          commune:              '',
          village:              '',
          houseNo:              '',
          street:               '',
          branchId:             customerData.branchId  || '',
          occupation:           customerData.occupation    || '',
          employerName:         customerData.employerName  || '',
          monthlyIncome:        customerData.monthlyIncome !== null && customerData.monthlyIncome !== undefined ? String(customerData.monthlyIncome) : '',
          monthlyIncomeKhr:     customerData.monthlyIncomeKhr !== null && customerData.monthlyIncomeKhr !== undefined ? String(customerData.monthlyIncomeKhr) : '',
          businessInfo:         customerData.businessInfo  || '',
          businessType:         customerData.businessType  || '',
          incomeBracket:        customerData.incomeBracket || '',
          dependentCount:       customerData.dependentCount || '',
          incomeMaker:           customerData.incomeMaker || '',
          coBorrowerName:       customerData.coBorrowerName       || '',
          coBorrowerKhmerName:  customerData.coBorrowerKhmerName  || '',
          coBorrowerPhone:      customerData.coBorrowerPhone      || '',
          coBorrowerNationalId: customerData.coBorrowerNationalId || '',
          guarantorName:        customerData.guarantorName        || '',
          guarantorKhmerName:   customerData.guarantorKhmerName   || '',
          guarantorPhone:       customerData.guarantorPhone       || '',
          guarantorNationalId:  customerData.guarantorNationalId  || '',
          guarantorRelationship:customerData.guarantorRelationship|| '',
        });
        
        // Parse existing address if possible
        const existingAddress = customerData.address || '';
        const parts = existingAddress.split(',').map((s: string) => s.trim());
        if (parts.length >= 6) {
          // Assuming format: House #X, St. Y, Z Village, W Commune, V District, U Province/City
          setFormData(prev => ({
            ...prev,
            houseNo: parts[0].replace('House #', ''),
            street: parts[1].replace('St. ', ''),
            village: parts[2].replace(' Village', ''),
            commune: parts[3].replace(' Commune', ''),
            district: parts[4].replace(' District', ''),
            province: parts[5].replace(' Province/City', ''),
          }));
        } else if (parts.length > 0 && parts[0] !== '') {
          // Fallback if not fully structured
          setFormData(prev => ({ ...prev, province: existingAddress }));
        }

      } catch (err) {
        console.error('Failed to fetch data', err);
        setError('Failed to load customer data.');
      } finally {
        setFetching(false);
      }
    };
    fetchData();
    fetchDocuments();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Construct address string
    const fullAddress = [
      formData.houseNo ? `House #${formData.houseNo}` : '',
      formData.street ? `St. ${formData.street}` : '',
      formData.village ? `${formData.village} Village` : '',
      formData.commune ? `${formData.commune} Commune` : '',
      formData.district ? `${formData.district} District` : '',
      formData.province ? `${formData.province} Province/City` : ''
    ].filter(Boolean).join(', ');

    try {
      const { province, district, commune, village, houseNo, street, ...restData } = formData;
      await api.patch(`/customers/${id}`, {
        ...restData,
        monthlyIncome: formData.monthlyIncome ? parseFloat(formData.monthlyIncome) : null,
        monthlyIncomeKhr: formData.monthlyIncomeKhr ? parseFloat(formData.monthlyIncomeKhr) : null,
        address: fullAddress || undefined,
        dob: formData.dob ? new Date(formData.dob) : undefined,
      });
      setSuccess(true);
      setTimeout(() => router.push('/admin/customers/accounts'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update customer account.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCid = async () => {
    setGeneratingCid(true);
    try {
      const response = await api.get('/customers/next-cid');
      setFormData(prev => ({ ...prev, cid: response.cid }));
    } catch (err) {
      console.error('Failed to generate CID', err);
      // Fallback in case endpoint fails
      setFormData(prev => ({ ...prev, cid: `CID-${Math.floor(100000 + Math.random() * 900000)}` }));
    } finally {
      setGeneratingCid(false);
    }
  };

  const handleToggleAutoGenerate = async () => {
    const newVal = !autoGenerateCid;
    setAutoGenerateCid(newVal);
    if (newVal) {
      await handleGenerateCid();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    setUploadSuccess(false);
    try {
      const form = new FormData();
      form.append('file', uploadFile);
      form.append('customerId', id as string);
      form.append('type', uploadType);
      await api.upload('/kyc/documents', form);
      setUploadFile(null);
      setUploadSuccess(true);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchDocuments();
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!confirm('Remove this document?')) return;
    try {
      await api.delete(`/kyc/documents/${docId}`);
      setDocuments(prev => prev.filter(d => d.id !== docId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete document');
    }
  };

  if (fetching) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}>
      <div className="animate-spin" style={{ width:'40px', height:'40px', border:'4px solid var(--border-color)', borderTopColor:'var(--primary)', borderRadius:'50%' }}></div>
    </div>
  );

  if (success) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'60vh', animation:'fadeIn 0.5s ease-out' }}>
      <div style={{ width:'80px', height:'80px', backgroundColor:'var(--success-bg)', color:'var(--success-text)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'2rem' }}>
        <CheckCircle size={40} />
      </div>
      <h2 style={{ fontSize:'2rem', fontWeight:'800', marginBottom:'1rem' }}>Update Successful!</h2>
      <p style={{ color:'var(--text-muted)' }}>Redirecting to all customers list...</p>
    </div>
  );

  return (
    <div style={{ animation:'slideUp 0.6s ease-out', maxWidth: '1100px' }}>
      {/* Back + Title */}
      <div style={{ display:'flex', alignItems:'center', gap:'1.5rem', marginBottom:'3rem' }}>
        <Link href="/admin/customers/accounts" style={{ width:'48px', height:'48px', borderRadius:'12px', backgroundColor: 'var(--card-bg)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--foreground)', border:'1px solid var(--border-color)', textDecoration:'none', transition:'all 0.2s' }}
          onMouseOver={e => e.currentTarget.style.borderColor='var(--primary)'}
          onMouseOut={e  => e.currentTarget.style.borderColor='var(--border-color)'}
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize:'2.25rem', fontWeight:'800', letterSpacing:'-0.03em', margin:0 }}>Edit <span className="text-gradient">Customer</span></h1>
          <p style={{ color:'var(--text-muted)', fontSize:'1rem' }}>Modify customer profile and institutional details</p>
        </div>
      </div>

      {error && (
        <div style={{ padding:'1rem', backgroundColor:'var(--error-bg)', color:'var(--error-text)', borderRadius:'var(--radius-md)', marginBottom:'2.5rem', display:'flex', alignItems:'center', gap:'0.75rem', border:'1px solid var(--error-border)' }}>
          <AlertCircle size={18} />{error}
        </div>
      )}

      {/* Profile Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* SECTION 1: Identity & Institutional */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <User size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>Identity & Branch Alignment</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                <span>CID No</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div 
                    onClick={handleToggleAutoGenerate}
                    style={{
                      width: '32px', height: '18px', borderRadius: '18px',
                      backgroundColor: autoGenerateCid ? 'var(--primary)' : 'var(--border-hover)',
                      position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s'
                    }}
                  >
                    <div style={{
                      width: '14px', height: '14px', borderRadius: '50%', backgroundColor: 'var(--card-bg)',
                      position: 'absolute', top: '2px', left: autoGenerateCid ? '16px' : '2px',
                      transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: autoGenerateCid ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer' }} onClick={handleToggleAutoGenerate}>Auto</span>
                </div>
              </label>
              <div style={{ position: 'relative' }}>
                <input name="cid" type="text" className="input-field" placeholder="CID Number" value={formData.cid} onChange={handleChange} disabled={autoGenerateCid} style={{ height: '42px' }} />
                {generatingCid && <div className="animate-spin" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', border: '2px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>}
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ marginBottom: '0.375rem' }}>Assigned Branch <span style={{ color: 'var(--error-text)' }}>*</span></label>
              <select required name="branchId" className="input-field" value={formData.branchId} onChange={handleChange} style={{ height: '42px' }}>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name} ({branch.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ marginBottom: '0.375rem' }}>គោត្តនាម</label>
              <input name="khmerLastName" type="text" className="input-field" placeholder="គោត្តនាម" value={formData.khmerLastName} onChange={handleChange} style={{ height: '42px' }} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ marginBottom: '0.375rem' }}>នាម</label>
              <input name="khmerFirstName" type="text" className="input-field" placeholder="នាម" value={formData.khmerFirstName} onChange={handleChange} style={{ height: '42px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ marginBottom: '0.375rem' }}>First Name <span style={{ color: 'var(--error-text)' }}>*</span></label>
              <input required name="firstName" type="text" className="input-field" placeholder="e.g. Chamnab" value={formData.firstName} onChange={handleChange} style={{ height: '42px' }} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ marginBottom: '0.375rem' }}>Last Name <span style={{ color: 'var(--error-text)' }}>*</span></label>
              <input required name="lastName" type="text" className="input-field" placeholder="e.g. KOL" value={formData.lastName} onChange={handleChange} style={{ height: '42px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ marginBottom: '0.375rem' }}>National ID</label>
              <input name="nationalId" type="text" className="input-field" placeholder="ID Number" value={formData.nationalId} onChange={handleChange} style={{ height: '42px' }} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ marginBottom: '0.375rem' }}>Passport</label>
              <input name="passport" type="text" className="input-field" placeholder="Passport Number" value={formData.passport} onChange={handleChange} style={{ height: '42px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ marginBottom: '0.375rem' }}>Family Book Reference</label>
              <input name="familyBook" type="text" className="input-field" placeholder="Ref #" value={formData.familyBook} onChange={handleChange} style={{ height: '42px' }} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ marginBottom: '0.375rem' }}>Marital Status</label>
              <select name="maritalStatus" className="input-field" value={formData.maritalStatus} onChange={handleChange} style={{ height: '42px' }}>
                <option value="">Select Status...</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: 0 }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ marginBottom: '0.375rem' }}>Gender</label>
              <select name="gender" className="input-field" value={formData.gender} onChange={handleChange} style={{ height: '42px' }}>
                <option value="">Select Gender...</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ marginBottom: '0.375rem' }}>Date of Birth <span style={{ color: 'var(--error-text)' }}>*</span></label>
              <input required name="dob" type="date" className="input-field" value={formData.dob} onChange={handleChange} style={{ height: '42px' }} />
            </div>
          </div>
        </div>

        {/* SECTION 2: Contact & Residence */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <Phone size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>Contact & Residence</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ marginBottom: '0.375rem' }}>Primary Phone <span style={{ color: 'var(--error-text)' }}>*</span></label>
              <input required name="phone" type="tel" className="input-field" placeholder="+855 ..." value={formData.phone} onChange={handleChange} style={{ height: '42px' }} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ marginBottom: '0.375rem' }}>Email Address</label>
              <input name="email" type="email" className="input-field" placeholder="example@mail.com" value={formData.email} onChange={handleChange} style={{ height: '42px' }} />
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <label className="input-label" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="var(--primary)" />
              Residential Address Details
            </label>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>Province / City <span style={{ color: 'var(--error-text)' }}>*</span></label>
                <select name="province" className="input-field" value={formData.province} onChange={handleChange} required style={{ height: '42px' }}>
                  <option value="">Select Province / City</option>
                  <optgroup label="Capital City">
                    <option value="Phnom Penh">Phnom Penh</option>
                  </optgroup>
                  <optgroup label="Provinces">
                    <option value="Banteay Meanchey">Banteay Meanchey</option>
                    <option value="Battambang">Battambang</option>
                    <option value="Kampong Cham">Kampong Cham</option>
                    <option value="Kampong Chhnang">Kampong Chhnang</option>
                    <option value="Kampong Speu">Kampong Speu</option>
                    <option value="Kampong Thom">Kampong Thom</option>
                    <option value="Kampot">Kampot</option>
                    <option value="Kandal">Kandal</option>
                    <option value="Kep">Kep</option>
                    <option value="Koh Kong">Koh Kong</option>
                    <option value="Kratie">Kratie</option>
                    <option value="Mondulkiri">Mondulkiri</option>
                    <option value="Oddar Meanchey">Oddar Meanchey</option>
                    <option value="Pailin">Pailin</option>
                    <option value="Preah Sihanouk">Preah Sihanouk</option>
                    <option value="Preah Vihear">Preah Vihear</option>
                    <option value="Pursat">Pursat</option>
                    <option value="Ratanakiri">Ratanakiri</option>
                    <option value="Siem Reap">Siem Reap</option>
                    <option value="Stung Treng">Stung Treng</option>
                    <option value="Svay Rieng">Svay Rieng</option>
                    <option value="Takeo">Takeo</option>
                    <option value="Tbong Khmum">Tbong Khmum</option>
                  </optgroup>
                </select>
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>District <span style={{ color: 'var(--error-text)' }}>*</span></label>
                <select name="district" className="input-field" value={formData.district} onChange={handleChange} required disabled={!formData.province} style={{ height: '42px' }}>
                  <option value="">Select District</option>
                  {(CAMBODIA_DISTRICTS[formData.province] || []).map(d => (
                    <option key={d.code} value={d.name}>
                      [{d.code}] {d.name} ({d.khmer})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>Commune</label>
                <select name="commune" className="input-field" value={formData.commune} onChange={handleChange} disabled={!formData.district} style={{ height: '42px' }}>
                  <option value="">Select Commune</option>
                  {(CAMBODIA_COMMUNES[formData.district] || []).map(c => (
                    <option key={c.code} value={c.name}>
                      [{c.code}] {c.name} ({c.khmer})
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>Village</label>
                <select name="village" className="input-field" value={formData.village} onChange={handleChange} disabled={!formData.commune} style={{ height: '42px' }}>
                  <option value="">Select Village</option>
                  {(CAMBODIA_VILLAGES[`${formData.district}_${formData.commune}`] || []).map(v => (
                    <option key={v.code} value={v.name}>
                      [{v.code}] {v.name} ({v.khmer})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>House #</label>
                <input name="houseNo" type="text" className="input-field" placeholder="House #" value={formData.houseNo} onChange={handleChange} style={{ height: '42px' }} />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>Street #</label>
                <input name="street" type="text" className="input-field" placeholder="Street #" value={formData.street} onChange={handleChange} style={{ height: '42px' }} />
              </div>
            </div>
          </div>
        </div>

                {/* SECTION 3: Employment & Business */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <Briefcase size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>Employment & Business</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ marginBottom: '0.375rem' }}>Occupation</label>
              <input name="occupation" type="text" className="input-field" placeholder="e.g. Sales Manager" value={formData.occupation} onChange={handleChange} style={{ height: '42px' }} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ marginBottom: '0.375rem' }}>Employer Name</label>
              <input name="employerName" type="text" className="input-field" placeholder="e.g. ACME Corp" value={formData.employerName} onChange={handleChange} style={{ height: '42px' }} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ marginBottom: '0.375rem' }}>Monthly Income (USD)</label>
              <input name="monthlyIncome" type="number" step="any" className="input-field" placeholder="e.g. 1500" value={formData.monthlyIncome} onChange={handleChange} style={{ height: '42px' }} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ marginBottom: '0.375rem' }}>Monthly Income (KHR)</label>
              <input name="monthlyIncomeKhr" type="number" step="any" className="input-field" placeholder="e.g. 6000000" value={formData.monthlyIncomeKhr} onChange={handleChange} style={{ height: '42px' }} />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ marginBottom: '0.375rem' }}>Business Type</label>
              <select name="businessType" className="input-field" value={formData.businessType} onChange={handleChange} style={{ height: '42px' }}>
                <option value="">Select Type...</option>
                <option value="NGO">NGO</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Trade & Commerce">Trade & Commerce</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Businessman">Businessman</option>
                <option value="Government Body">Government Body</option>
                <option value="Transportation">Transportation</option>
                <option value="Construction">Construction</option>
                <option value="Household/Family">Household/Family</option>
                <option value="Student">Student</option>
                <option value="Office Worker">Office Worker</option>
                <option value="Services">Services</option>
                <option value="Dresser">Dresser</option>
                <option value="Seller">Seller</option>
                <option value="Washing Car Worker">Washing Car Worker</option>
                <option value="Government Officer">Government Officer</option>
                <option value="Noodle Seller">Noodle Seller</option>
                <option value="Vegetables Seller">Vegetables Seller</option>
                <option value="Cake Seller">Cake Seller</option>
                <option value="Rice Seller">Rice Seller</option>
                <option value="Groceries Seller">Groceries Seller</option>
                <option value="Factory Worker">Factory Worker</option>
                <option value="Fisherman">Fisherman</option>
                <option value="Rice Soup Seller">Rice Soup Seller</option>
                <option value="Construction Worker">Construction Worker</option>
                <option value="Taxi Moto">Taxi Moto</option>
                <option value="Rent Generator">Rent Generator</option>
                <option value="Farmer">Farmer</option>
                <option value="Veterinarian">Veterinarian</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ marginBottom: '0.375rem' }}>Income Bracket</label>
              <select name="incomeBracket" className="input-field" value={formData.incomeBracket} onChange={handleChange} style={{ height: '42px' }}>
                <option value="">Select Bracket...</option>
                <option value="Unknown">Unknown</option>
                <option value="<= 50 USD">&lt;= 50 USD</option>
                <option value="51~200 USD">51~200 USD</option>
                <option value="201~500 USD">201~500 USD</option>
                <option value="501~1000 USD">501~1000 USD</option>
                <option value=">1,000 USD">&gt;1,000 USD</option>
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ marginBottom: '0.375rem' }}>Dependent</label>
              <select name="dependentCount" className="input-field" value={formData.dependentCount} onChange={handleChange} style={{ height: '42px' }}>
                <option value="">Select Amount...</option>
                <option value="0">0</option>
                <option value="1~2">1~2</option>
                <option value="3~4">3~4</option>
                <option value="5~6">5~6</option>
                <option value="7~8">7~8</option>
                <option value=">8">&gt;8</option>
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ marginBottom: '0.375rem' }}>Income Maker</label>
              <select name="incomeMaker" className="input-field" value={formData.incomeMaker} onChange={handleChange} style={{ height: '42px' }}>
                <option value="">Select Amount...</option>
                <option value="0">0</option>
                <option value="1~2">1~2</option>
                <option value="3~4">3~4</option>
                <option value="5~6">5~6</option>
                <option value="7~8">7~8</option>
                <option value=">8">&gt;8</option>
              </select>
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" style={{ marginBottom: '0.375rem' }}>Business Information</label>
            <textarea name="businessInfo" rows={2} className="input-field" placeholder="Details about owned business or trade" value={formData.businessInfo} onChange={handleChange}></textarea>
          </div>
        </div>

        {/* SECTION 4: Co-Borrower & Guarantor */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Co-borrower Card */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <UserCheck size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>Co-borrower Details</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="input-group">
                <label className="input-label" style={{ marginBottom: '0.375rem' }}>Co-Borrower(Khmer)</label>
                <input name="coBorrowerKhmerName" type="text" className="input-field" placeholder="e.g. សុខ គែន" value={formData.coBorrowerKhmerName} onChange={handleChange} style={{ height: '42px' }} />
              </div>
              <div className="input-group">
                <label className="input-label" style={{ marginBottom: '0.375rem' }}>Co-Borrower(English)</label>
                <input name="coBorrowerName" type="text" className="input-field" placeholder="e.g. Sok Ken" value={formData.coBorrowerName} onChange={handleChange} style={{ height: '42px' }} />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" style={{ marginBottom: '0.375rem' }}>Co-borrower Phone Number</label>
              <input name="coBorrowerPhone" type="tel" className="input-field" placeholder="+855 ..." value={formData.coBorrowerPhone} onChange={handleChange} style={{ height: '42px' }} />
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ marginBottom: '0.375rem' }}>Co-borrower National ID</label>
              <input name="coBorrowerNationalId" type="text" className="input-field" placeholder="ID Number" value={formData.coBorrowerNationalId} onChange={handleChange} style={{ height: '42px' }} />
            </div>
          </div>

          {/* Guarantor Card */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <Users size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>Guarantor Details</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="input-group">
                <label className="input-label" style={{ marginBottom: '0.375rem' }}>Guarantor(Khmer)</label>
                <input name="guarantorKhmerName" type="text" className="input-field" placeholder="e.g. សោភ័ណ កុល" value={formData.guarantorKhmerName} onChange={handleChange} style={{ height: '42px' }} />
              </div>
              <div className="input-group">
                <label className="input-label" style={{ marginBottom: '0.375rem' }}>Guarantor(English)</label>
                <input name="guarantorName" type="text" className="input-field" placeholder="e.g. Sophorn Kol" value={formData.guarantorName} onChange={handleChange} style={{ height: '42px' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ marginBottom: '0.375rem' }}>Guarantor Phone</label>
                <input name="guarantorPhone" type="tel" className="input-field" placeholder="+855 ..." value={formData.guarantorPhone} onChange={handleChange} style={{ height: '42px' }} />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ marginBottom: '0.375rem' }}>Relationship</label>
                <input name="guarantorRelationship" type="text" className="input-field" placeholder="e.g. Sibling, Parent" value={formData.guarantorRelationship} onChange={handleChange} style={{ height: '42px' }} />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 0, marginTop: '1.25rem' }}>
              <label className="input-label" style={{ marginBottom: '0.375rem' }}>Guarantor National ID</label>
              <input name="guarantorNationalId" type="text" className="input-field" placeholder="ID Number" value={formData.guarantorNationalId} onChange={handleChange} style={{ height: '42px' }} />
            </div>
          </div>
        </div>

        
        {/* SECTION 5: Supporting Documents */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <ShieldCheck size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>Supporting Documents</h3>
          </div>
          
          {/* Upload panel */}
          <div style={{ padding: '1.25rem', marginBottom: '1.25rem', border: '2px dashed var(--border-color)', borderRadius: '12px', backgroundColor: 'var(--bg-nested)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <Upload size={18} color="var(--primary)" />
              <span style={{ fontWeight: '700', fontSize: '0.9375rem' }}>Upload / Select a Document</span>
            </div>
            {uploadSuccess && <div style={{ color: 'var(--success-color)', fontSize: '0.875rem', marginBottom: '1rem' }}>✓ Document uploaded successfully</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '1.25rem', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Document Type</label>
                <select value={uploadType} onChange={e => setUploadType(e.target.value)} className="input-field" style={{ marginBottom: 0, height: '42px' }}>
                  {DOC_TYPES.map(d => <option key={d.type} value={d.type}>{d.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>File (PDF, JPG, PNG)</label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  ref={fileInputRef}
                  onChange={e => setUploadFile(e.target.files?.[0] || null)}
                  style={{ display: 'block', width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', cursor: 'pointer', backgroundColor: 'var(--card-bg)', height: '42px' }}
                />
              </div>
              <button
                type="button"
                onClick={handleUpload}
                disabled={!uploadFile || uploading}
                className={(uploadFile && !uploading) ? "btn btn-primary" : "btn"}
                style={{ 
                  height: '42px', 
                  padding: '0 1.5rem', 
                  background: (uploadFile && !uploading) ? undefined : 'var(--border-color)', 
                  color: (uploadFile && !uploading) ? 'white' : 'var(--text-muted)', 
                  border: (uploadFile && !uploading) ? 'none' : '1px solid var(--border-color)',
                  cursor: (uploadFile && !uploading) ? 'pointer' : 'not-allowed', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  transition: 'all 0.2s',
                  boxShadow: (uploadFile && !uploading) ? 'var(--shadow-sm)' : 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                <Upload size={15} /> {uploading ? 'Uploading...' : 'Add File'}
              </button>
            </div>
          </div>

          {/* Documents table */}
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'var(--background)' }}>
              <FolderOpen size={16} color="var(--text-muted)" />
              <span style={{ fontSize: '0.9375rem', fontWeight: '600' }}>Uploaded Documents</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{documents.length} file{documents.length !== 1 ? 's' : ''}</span>
            </div>

            {docsLoading ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
            ) : documents.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <FileText size={36} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p style={{ margin: 0, fontSize: '0.875rem' }}>No documents uploaded yet.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Document Type</th>
                    <th>File Name</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map(doc => (
                    <tr key={doc.id}>
                      <td>
                        <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                          {DOC_TYPES.find(d => d.type === doc.type)?.label || doc.type}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted-dark)' }}>
                        {doc.fileName || doc.id}
                      </td>
                      <td>
                        {statusBadge(doc.status)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => handleDeleteDoc(doc.id)}
                          title="Remove document"
                          style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                          onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--error-text)'; e.currentTarget.style.backgroundColor = 'var(--error-bg)'; }}
                          onMouseOut={e  => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.backgroundColor = 'var(--card-bg)'; }}
                        >
                          <Trash2 size={16} color="var(--error-text)" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <Link href="/admin/customers/accounts" style={{ textDecoration: 'none' }}>
            <button type="button" className="btn btn-secondary" style={{ padding: '0 1.5rem', height: '42px' }}>
              Discard
            </button>
          </Link>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ 
              padding: '0 2rem', 
              height: '42px',
              backgroundColor: 'var(--foreground)',
              color: 'var(--background)',
              border: 'none',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            disabled={loading}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--foreground)'; e.currentTarget.style.color = 'var(--background)'; }}
          >
            {loading ? 'Processing...' : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin    { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
      `}} />
    </div>
  );
}
