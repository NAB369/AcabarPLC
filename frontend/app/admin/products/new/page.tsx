'use client';

import React, { useState } from 'react';
import { api } from '@/services/api';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, CheckCircle, AlertCircle, 
  Briefcase, Percent, DollarSign, Calendar,
  FileText, Info, Save
} from 'lucide-react';
import Link from 'next/link';

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    minAmount: '',
    maxAmount: '',
    baseInterestRate: '',
    interestType: 'REDUCING',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/loans/products', formData);
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/products');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create product.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (success) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', animation: 'fadeIn 0.5s ease-out' }}>
        <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
          <CheckCircle size={40} />
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>Product Created!</h2>
        <p style={{ color: 'var(--text-muted)' }}>Redirecting you back to the catalog...</p>
      </div>
    );
  }

  return (
    <div style={{ animation: 'slideUp 0.6s ease-out', maxWidth: '1000px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
        <Link href="/admin/products" style={{ 
          width: '48px', 
          height: '48px', 
          borderRadius: '12px', 
          backgroundColor: 'var(--card-bg)', 
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
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.03em', margin: 0 }}>
            New <span className="text-gradient">Loan Product</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Define the parameters for a new financial instrument</p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: 'var(--error-bg)', color: 'var(--error-text)', borderRadius: 'var(--radius-md)', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid var(--error-border)' }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
        {/* Left Column: Basic Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <FileText size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>General Information</h3>
            </div>

            <div className="input-group">
              <label className="input-label">Product Name</label>
              <input 
                required 
                name="name" 
                type="text" 
                className="input-field" 
                placeholder="e.g. SME Business Growth Loan"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Description</label>
              <textarea 
                required 
                name="description" 
                rows={4} 
                className="input-field" 
                style={{ resize: 'none', height: 'auto' }}
                placeholder="Briefly describe the product's purpose and target audience..."
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Percent size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>Interest Configuration</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Base Rate (%)</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    required 
                    name="baseInterestRate" 
                    type="number" 
                    step="0.1"
                    className="input-field" 
                    placeholder="7.5"
                    value={formData.baseInterestRate}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Interest Type</label>
                <select 
                  name="interestType" 
                  className="input-field"
                  value={formData.interestType}
                  onChange={handleChange}
                >
                  <option value="REDUCING">Reducing Balance</option>
                  <option value="FLAT">Flat Rate</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Limits & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <DollarSign size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>Loan Limits (USD)</h3>
            </div>

            <div className="input-group">
              <label className="input-label">Minimum Amount</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: '700' }}>$</span>
                <input 
                  required 
                  name="minAmount" 
                  type="number" 
                  className="input-field" 
                  style={{ paddingLeft: '2.25rem' }}
                  placeholder="1,000"
                  value={formData.minAmount}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Maximum Amount</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: '700' }}>$</span>
                <input 
                  required 
                  name="maxAmount" 
                  type="number" 
                  className="input-field" 
                  style={{ paddingLeft: '2.25rem' }}
                  placeholder="100,000"
                  value={formData.maxAmount}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div style={{ 
            backgroundColor: 'var(--primary-light)', 
            padding: '1.5rem', 
            borderRadius: 'var(--radius-lg)', 
            border: '1px solid rgba(37, 99, 235, 0.1)',
            display: 'flex',
            gap: '1rem'
          }}>
            <Info size={24} color="var(--primary)" />
            <p style={{ fontSize: '0.875rem', color: 'var(--primary)', margin: 0, lineHeight: 1.5 }}>
              <strong>Tip:</strong> New products will be instantly available for loan origination. Ensure the interest rate aligns with NBC guidelines.
            </p>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ 
                width: '100%', 
                padding: '1rem', 
                fontSize: '1.125rem', 
                height: '56px',
                backgroundColor: 'var(--foreground)',
                color: 'var(--background)',
                border: 'none',
                boxShadow: 'var(--shadow-lg)'
              }}
              disabled={loading}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--foreground)'; e.currentTarget.style.color = 'var(--background)'; }}
            >
              {loading ? 'Creating...' : (
                <>
                  <Save size={20} />
                  Publish Product
                </>
              )}
            </button>
            <Link href="/admin/products" style={{ textDecoration: 'none' }}>
              <button type="button" className="btn btn-secondary" style={{ width: '100%', padding: '1rem', height: '56px' }}>
                Discard Changes
              </button>
            </Link>
          </div>
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
