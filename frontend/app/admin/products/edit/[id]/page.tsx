'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, CheckCircle, AlertCircle, 
  Briefcase, Percent, DollarSign, Calendar,
  FileText, Info, Save, Trash2
} from 'lucide-react';
import Link from 'next/link';

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await api.get(`/loans/products/${id}`);
        setFormData({
          name: data.name,
          description: data.description || '',
          minAmount: data.minAmount.toString(),
          maxAmount: data.maxAmount.toString(),
          baseInterestRate: data.baseInterestRate.toString(),
          interestType: data.interestType,
        });
      } catch (err: any) {
        setError(err.message || 'Failed to fetch product.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await api.patch(`/loans/products/${id}`, formData);
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/products');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update product.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', animation: 'fadeIn 0.5s ease-out' }}>
        <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
          <CheckCircle size={40} />
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>Changes Saved!</h2>
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
            Configure <span className="text-gradient">{formData.name || 'Product'}</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Modify the operational parameters of this instrument</p>
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
                <input 
                  required 
                  name="baseInterestRate" 
                  type="number" 
                  step="0.1"
                  className="input-field" 
                  value={formData.baseInterestRate}
                  onChange={handleChange}
                />
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
              <strong>Note:</strong> Updating product parameters will only affect future loan applications. Active loans using this product will maintain their original terms.
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
              disabled={saving}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--foreground)'; e.currentTarget.style.color = 'var(--background)'; }}
            >
              {saving ? 'Saving...' : (
                <>
                  <Save size={20} />
                  Update Product
                </>
              )}
            </button>
            
            <button 
              type="button" 
              className="btn" 
              style={{ 
                width: '100%', 
                padding: '1rem', 
                height: '56px',
                backgroundColor: 'var(--error-bg)',
                color: 'var(--error-text)',
                border: '1px solid var(--error-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontWeight: '600'
              }}
              onClick={async () => {
                if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
                  try {
                    await api.delete(`/loans/products/${id}`);
                    router.push('/admin/products');
                  } catch (err: any) {
                    setError(err.message || 'Failed to delete product.');
                  }
                }
              }}
            >
              <Trash2 size={20} />
              Delete Product
            </button>

            <Link href="/admin/products" style={{ textDecoration: 'none' }}>
              <button type="button" className="btn btn-secondary" style={{ width: '100%', padding: '1rem', height: '56px' }}>
                Cancel Changes
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
