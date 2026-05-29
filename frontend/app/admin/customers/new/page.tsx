'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, CheckCircle, AlertCircle, 
  User, Mail, Phone, MapPin, Building,
  CreditCard, Calendar, Save, Briefcase, FileText, Globe, Upload, X,
  Users, UserCheck, ShieldCheck, Trash2, FolderOpen
} from 'lucide-react';
import Link from 'next/link';
import { CAMBODIA_DISTRICTS, CAMBODIA_COMMUNES, CAMBODIA_VILLAGES } from '@/app/cambodia-data';

export default function NewCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [generatingCid, setGeneratingCid] = useState(false);
  const [autoGenerateCid, setAutoGenerateCid] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    khmerFirstName: '',
    khmerLastName: '',
    cid: '',
    phone: '',
    email: '',
    nationalId: '',
    passport: '',
    familyBook: '',
    dob: '',
    gender: '',
    maritalStatus: '',
    province: '',
    district: '',
    commune: '',
    village: '',
    houseNo: '',
    street: '',
    branchId: '',
    occupation: '',
    employerName: '',
    monthlyIncome: '',
    businessInfo: '',
    businessType: '',
    incomeBracket: '',
    dependentCount: '',
    incomeMaker: '',
    coBorrowerName: '',
    coBorrowerKhmerName: '',
    coBorrowerPhone: '',
    coBorrowerNationalId: '',
    guarantorName: '',
    guarantorKhmerName: '',
    guarantorPhone: '',
    guarantorNationalId: '',
    guarantorRelationship: '',
    monthlyIncomeKhr: '',
  });

  const [files, setFiles] = useState<{ type: string; file: File }[]>([]);
  const [uploadType, setUploadType] = useState('NATIONAL_ID');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const DOC_TYPES = [
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

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await api.get('/branches');
        setBranches(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, branchId: data[0].id }));
        }
      } catch (err) {
        console.error('Failed to fetch branches', err);
      }
    };
    fetchBranches();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Construct address string
      const fullAddress = [
        formData.houseNo ? `House #${formData.houseNo}` : '',
        formData.street ? `St. ${formData.street}` : '',
        formData.village ? `${formData.village} Village` : '',
        formData.commune ? `${formData.commune} Commune` : '',
        formData.district ? `${formData.district} District` : '',
        formData.province ? `${formData.province} Province/City` : ''
      ].filter(Boolean).join(', ');

      // 1. Create the customer
      const { province, district, commune, village, houseNo, street, ...restData } = formData;
      const customer = await api.post('/customers', {
        ...restData,
        monthlyIncome: formData.monthlyIncome ? parseFloat(formData.monthlyIncome) : null,
        monthlyIncomeKhr: formData.monthlyIncomeKhr ? parseFloat(formData.monthlyIncomeKhr) : null,
        address: fullAddress,
        dob: formData.dob ? new Date(formData.dob) : undefined,
      });

      // 2. Upload documents if any
      const uploadPromises = files.map((doc) => {
        const fd = new FormData();
        fd.append('file', doc.file);
        fd.append('customerId', customer.id);
        fd.append('type', doc.type);
        return api.upload('/kyc/upload', fd);
      });

      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/customers/accounts');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create customer account.');
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

  const handleAddFile = () => {
    if (!uploadFile) return;
    
    // Check if type already exists
    const existingIndex = files.findIndex(f => f.type === uploadType);
    if (existingIndex >= 0) {
      const newFiles = [...files];
      newFiles[existingIndex] = { type: uploadType, file: uploadFile };
      setFiles(newFiles);
    } else {
      setFiles([...files, { type: uploadType, file: uploadFile }]);
    }
    
    setUploadFile(null);
    // Reset file input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const removeFile = (type: string) => {
    setFiles(files.filter(f => f.type !== type));
  };

  if (success) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', animation: 'fadeIn 0.5s ease-out' }}>
        <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
          <CheckCircle size={40} />
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>Registration Successful!</h2>
        <p style={{ color: 'var(--text-muted)' }}>Customer created and documents uploaded. Redirecting...</p>
      </div>
    );
  }



  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', animation: 'slideUp 0.6s ease-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
        <Link href="/admin/customers/accounts" style={{ 
          width: '48px', 
          height: '48px', 
          borderRadius: '12px', 
          backgroundColor: 'white', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'var(--foreground)',
          border: '1px solid var(--border-color)',
          textDecoration: 'none',
          transition: 'all 0.2s'
        }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.03em', margin: 0 }}>Register New <span className="text-gradient">Customer</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Onboard a new institutional or private customer account</p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: 'var(--error-bg)', color: 'var(--error-text)', borderRadius: 'var(--radius-md)', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid var(--error-border)' }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* SECTION 1: Identity & Institutional */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
          
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <User size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>Identity Information</h3>
            </div>

            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>CID No</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div 
                    onClick={handleToggleAutoGenerate}
                    style={{
                      width: '32px', height: '18px', borderRadius: '18px',
                      backgroundColor: autoGenerateCid ? 'var(--primary)' : '#cbd5e1',
                      position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s'
                    }}
                  >
                    <div style={{
                      width: '14px', height: '14px', borderRadius: '50%', backgroundColor: 'white',
                      position: 'absolute', top: '2px', left: autoGenerateCid ? '16px' : '2px',
                      transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: autoGenerateCid ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer' }} onClick={handleToggleAutoGenerate}>Auto</span>
                </div>
              </label>
              <div style={{ position: 'relative' }}>
                <input name="cid" type="text" className="input-field" placeholder="CID Number" value={formData.cid} onChange={handleChange} disabled={autoGenerateCid} />
                {generatingCid && <div className="animate-spin" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', border: '2px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="input-group">
                <label className="input-label">គោត្តនាម</label>
                <input name="khmerLastName" type="text" className="input-field" placeholder="គោត្តនាម" value={formData.khmerLastName} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="input-label">នាម</label>
                <input name="khmerFirstName" type="text" className="input-field" placeholder="នាម" value={formData.khmerFirstName} onChange={handleChange} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="input-group">
                <label className="input-label">First Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input required name="firstName" type="text" className="input-field" placeholder="e.g. Chamnab" value={formData.firstName} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="input-label">Last Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input required name="lastName" type="text" className="input-field" placeholder="e.g. KOL" value={formData.lastName} onChange={handleChange} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="input-group">
                <label className="input-label">National ID</label>
                <input name="nationalId" type="text" className="input-field" placeholder="ID Number" value={formData.nationalId} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="input-label">Passport</label>
                <input name="passport" type="text" className="input-field" placeholder="Passport Number" value={formData.passport} onChange={handleChange} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="input-group">
                <label className="input-label">Family Book Reference</label>
                <input name="familyBook" type="text" className="input-field" placeholder="Ref #" value={formData.familyBook} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="input-label">Marital Status</label>
                <select name="maritalStatus" className="input-field" value={formData.maritalStatus} onChange={handleChange}>
                  <option value="">Select Status...</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: 0 }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Gender</label>
                <select name="gender" className="input-field" value={formData.gender} onChange={handleChange}>
                  <option value="">Select Gender...</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Date of Birth <span style={{ color: '#ef4444' }}>*</span></label>
                <input required name="dob" type="date" className="input-field" value={formData.dob} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Building size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>Institutional Alignment</h3>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Assigned Branch <span style={{ color: '#ef4444' }}>*</span></label>
              <select required name="branchId" className="input-field" value={formData.branchId} onChange={handleChange}>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name} ({branch.code})</option>
                ))}
              </select>
            </div>
          </div>
          
        </div>

        {/* SECTION 2: Contact & Residence */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Phone size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>Contact & Residence</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Primary Phone <span style={{ color: '#ef4444' }}>*</span></label>
              <input required name="phone" type="tel" className="input-field" placeholder="+855 ..." value={formData.phone} onChange={handleChange} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Email Address</label>
              <input name="email" type="email" className="input-field" placeholder="example@mail.com" value={formData.email} onChange={handleChange} />
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
            <label className="input-label" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="var(--primary)" />
              Residential Address Details
            </label>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Province / City <span style={{ color: '#ef4444' }}>*</span></label>
                <select name="province" className="input-field" value={formData.province} onChange={handleChange} required>
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
                <label className="input-label" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>District <span style={{ color: '#ef4444' }}>*</span></label>
                <select name="district" className="input-field" value={formData.district} onChange={handleChange} required disabled={!formData.province}>
                  <option value="">Select District</option>
                  {(CAMBODIA_DISTRICTS[formData.province] || []).map(d => (
                    <option key={d.code} value={d.name}>
                      [{d.code}] {d.name} ({d.khmer})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Commune</label>
                <select name="commune" className="input-field" value={formData.commune} onChange={handleChange} disabled={!formData.district}>
                  <option value="">Select Commune</option>
                  {(CAMBODIA_COMMUNES[formData.district] || []).map(c => (
                    <option key={c.code} value={c.name}>
                      [{c.code}] {c.name} ({c.khmer})
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Village</label>
                <select name="village" className="input-field" value={formData.village} onChange={handleChange} disabled={!formData.commune}>
                  <option value="">Select Village</option>
                  {(CAMBODIA_VILLAGES[`${formData.district}_${formData.commune}`] || []).map(v => (
                    <option key={v.code} value={v.name}>
                      [{v.code}] {v.name} ({v.khmer})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>House #</label>
                <input name="houseNo" type="text" className="input-field" placeholder="House #" value={formData.houseNo} onChange={handleChange} />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Street #</label>
                <input name="street" type="text" className="input-field" placeholder="Street #" value={formData.street} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

                {/* SECTION 3: Employment & Business */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Briefcase size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>Employment & Business</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Occupation</label>
              <input name="occupation" type="text" className="input-field" placeholder="e.g. Sales Manager" value={formData.occupation} onChange={handleChange} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Employer Name</label>
              <input name="employerName" type="text" className="input-field" placeholder="e.g. ACME Corp" value={formData.employerName} onChange={handleChange} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Monthly Income (USD)</label>
              <input name="monthlyIncome" type="number" step="any" className="input-field" placeholder="e.g. 1500" value={formData.monthlyIncome} onChange={handleChange} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Monthly Income (KHR)</label>
              <input name="monthlyIncomeKhr" type="number" step="any" className="input-field" placeholder="e.g. 6000000" value={formData.monthlyIncomeKhr} onChange={handleChange} />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Business Type</label>
              <select name="businessType" className="input-field" value={formData.businessType} onChange={handleChange}>
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
              <label className="input-label">Income Bracket</label>
              <select name="incomeBracket" className="input-field" value={formData.incomeBracket} onChange={handleChange}>
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
              <label className="input-label">Dependent</label>
              <select name="dependentCount" className="input-field" value={formData.dependentCount} onChange={handleChange}>
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
              <label className="input-label">Income Maker</label>
              <select name="incomeMaker" className="input-field" value={formData.incomeMaker} onChange={handleChange}>
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
            <label className="input-label">Business Information</label>
            <textarea name="businessInfo" rows={2} className="input-field" placeholder="Details about owned business or trade" value={formData.businessInfo} onChange={handleChange}></textarea>
          </div>
        </div>

        {/* SECTION 4: Co-Borrower & Guarantor */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Co-borrower Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <UserCheck size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>Co-borrower Details</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="input-group">
                <label className="input-label">Co-Borrower(Khmer)</label>
                <input name="coBorrowerKhmerName" type="text" className="input-field" placeholder="e.g. សុខ គែន" value={formData.coBorrowerKhmerName} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="input-label">Co-Borrower(English)</label>
                <input name="coBorrowerName" type="text" className="input-field" placeholder="e.g. Sok Ken" value={formData.coBorrowerName} onChange={handleChange} />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Co-borrower Phone Number</label>
              <input name="coBorrowerPhone" type="tel" className="input-field" placeholder="+855 ..." value={formData.coBorrowerPhone} onChange={handleChange} />
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Co-borrower National ID</label>
              <input name="coBorrowerNationalId" type="text" className="input-field" placeholder="ID Number" value={formData.coBorrowerNationalId} onChange={handleChange} />
            </div>
          </div>

          {/* Guarantor Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Users size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>Guarantor Details</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="input-group">
                <label className="input-label">Guarantor(Khmer)</label>
                <input name="guarantorKhmerName" type="text" className="input-field" placeholder="e.g. សោភ័ណ កុល" value={formData.guarantorKhmerName} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="input-label">Guarantor(English)</label>
                <input name="guarantorName" type="text" className="input-field" placeholder="e.g. Sophorn Kol" value={formData.guarantorName} onChange={handleChange} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Guarantor Phone</label>
                <input name="guarantorPhone" type="tel" className="input-field" placeholder="+855 ..." value={formData.guarantorPhone} onChange={handleChange} />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Relationship</label>
                <input name="guarantorRelationship" type="text" className="input-field" placeholder="e.g. Sibling, Parent" value={formData.guarantorRelationship} onChange={handleChange} />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 0, marginTop: '1.5rem' }}>
              <label className="input-label">Guarantor National ID</label>
              <input name="guarantorNationalId" type="text" className="input-field" placeholder="ID Number" value={formData.guarantorNationalId} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* SECTION 5: Supporting Documents */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <ShieldCheck size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>Supporting Documents</h3>
          </div>
          
          {/* Upload panel */}
          <div style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '2px dashed var(--border-color)', borderRadius: '12px', backgroundColor: '#fafbfc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <Upload size={18} color="var(--primary)" />
              <span style={{ fontWeight: '700', fontSize: '0.9375rem' }}>Upload / Select a Document</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '1.5rem', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Document Type</label>
                <select value={uploadType} onChange={e => setUploadType(e.target.value)} className="input-field" style={{ marginBottom: 0 }}>
                  {DOC_TYPES.map(d => <option key={d.type} value={d.type}>{d.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>File (PDF, JPG, PNG)</label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={e => setUploadFile(e.target.files?.[0] || null)}
                  style={{ display: 'block', width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', cursor: 'pointer', backgroundColor: 'white' }}
                />
              </div>
              <button
                type="button"
                onClick={handleAddFile}
                disabled={!uploadFile}
                style={{ height: '46px', padding: '0 2rem', borderRadius: '10px', border: 'none', backgroundColor: uploadFile ? 'var(--primary)' : '#e2e8f0', color: uploadFile ? 'white' : '#94a3b8', fontWeight: '700', fontSize: '0.875rem', cursor: uploadFile ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
              >
                <Upload size={15} /> Add File
              </button>
            </div>
          </div>

          {/* Documents table */}
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#f8fafc' }}>
              <FolderOpen size={16} color="var(--text-muted)" />
              <span style={{ fontSize: '0.9375rem', fontWeight: '600' }}>Selected Documents</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{files.length} file{files.length !== 1 ? 's' : ''}</span>
            </div>

            {files.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <FileText size={36} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p style={{ margin: 0, fontSize: '0.875rem' }}>No documents selected yet.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Document Type</th>
                    <th>File Name</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map(doc => (
                    <tr key={doc.type}>
                      <td>
                        <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                          {DOC_TYPES.find(d => d.type === doc.type)?.label || doc.type}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted-dark)' }}>
                        {doc.file.name}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => removeFile(doc.type)}
                          title="Remove document"
                          style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'white', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                          onMouseOver={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.backgroundColor = '#fef2f2'; }}
                          onMouseOut={e  => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.backgroundColor = 'white'; }}
                        >
                          <Trash2 size={16} color="#ef4444" />
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
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <Link href="/admin/customers/accounts" style={{ textDecoration: 'none' }}>
            <button type="button" className="btn btn-secondary" style={{ padding: '1rem 2rem', height: '56px' }}>
              Discard
            </button>
          </Link>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ 
              padding: '1rem 3rem', 
              fontSize: '1.125rem', 
              height: '56px',
              backgroundColor: 'var(--foreground)',
              color: 'white',
              border: 'none',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem'
            }}
            disabled={loading}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--foreground)'}
          >
            {loading ? 'Processing...' : (
              <>
                <Save size={20} />
                Complete Registration
              </>
            )}
          </button>
        </div>
      </form>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
