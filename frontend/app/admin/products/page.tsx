'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import Link from 'next/link';
import { 
  Home, Car, Briefcase, User, GraduationCap, 
  Leaf, HardHat, Smartphone, Plus, Info, 
  TrendingUp, Calendar, DollarSign, Percent, ArrowRight, CheckCircle2
} from 'lucide-react';

interface LoanProduct {
  id: string;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  baseInterestRate: number;
  interestType: string;
}

const productIcons: Record<string, React.ReactNode> = {
  'Home Loan': <Home size={32} />,
  'Auto Loan': <Car size={32} />,
  'Business Loan': <Briefcase size={32} />,
  'Personal Loan': <User size={32} />,
  'Education Loan': <GraduationCap size={32} />,
  'Agriculture Loan': <Leaf size={32} />,
  'Construction Loan': <HardHat size={32} />,
  'Digital / Instant Loan': <Smartphone size={32} />,
};

export default function LoanProductsPage() {
  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.get('/loans/products');
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Loan <span className="text-gradient">Products</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Manage and monitor all available financial instruments</p>
        </div>
        <Link href="/admin/products/new" style={{ textDecoration: 'none' }}>
          <button className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', height: 'auto', gap: '0.75rem', boxShadow: 'var(--shadow-glow)' }}>
            <Plus size={20} />
            Create New Product
          </button>
        </Link>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
        gap: '2rem' 
      }}>
        {products.map((product) => (
          <div key={product.id} className="card product-card" style={{ 
            padding: 0, 
            overflow: 'hidden', 
            display: 'flex', 
            flexDirection: 'column',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-md)',
            backgroundColor: 'white',
            borderRadius: 'var(--radius-lg)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
            e.currentTarget.style.borderColor = 'var(--secondary)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            e.currentTarget.style.borderColor = 'var(--border-color)';
          }}
          >
            {/* Minimalist Header */}
            <div style={{ 
              padding: '1.5rem', 
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                backgroundColor: 'var(--primary-light)', 
                borderRadius: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--primary)',
                border: '1px solid rgba(37, 99, 235, 0.1)'
              }}>
                {productIcons[product.name] || <TrendingUp size={24} />}
              </div>
              <div style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: 'var(--secondary)', 
                color: 'var(--foreground)', 
                borderRadius: 'var(--radius-full)',
                fontWeight: '800',
                fontSize: '1.25rem',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                {product.baseInterestRate}%
                <span style={{ fontSize: '0.75rem', fontWeight: '600', opacity: 0.7 }}>p.a.</span>
              </div>
            </div>

            {/* Content Area - "Form Design" */}
            <div style={{ padding: '1.5rem', flex: 1, position: 'relative' }}>
              <div className="product-content" style={{ transition: 'all 0.3s ease' }}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--foreground)', marginBottom: '0.25rem' }}>{product.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5, minHeight: '3rem' }}>
                    {product.description}
                  </p>
                </div>

                {/* Form Grid */}
                <div style={{ 
                  backgroundColor: '#f9fafb', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '1rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '1rem',
                  border: '1px solid #f3f4f6'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Interest Type</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--foreground)' }}>{product.interestType}</span>
                  </div>
                  <div style={{ height: '1px', backgroundColor: '#e5e7eb' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Min Amount</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--primary)' }}>${product.minAmount.toLocaleString()}</span>
                  </div>
                  <div style={{ height: '1px', backgroundColor: '#e5e7eb' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Max Amount</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--primary)' }}>${product.maxAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Hover Requirements Overlay */}
              <div 
                className="requirements-overlay"
                style={{
                  position: 'absolute',
                  top: '1.5rem', left: '1.5rem', right: '1.5rem', bottom: '1.5rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(6px)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  opacity: 0,
                  transform: 'translateY(10px)',
                  transition: 'all 0.3s ease',
                  pointerEvents: 'none',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.25rem', color: 'var(--foreground)' }}>Requirement Structure:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {['National ID / Passport', 'Proof of Income Amount', 'Clean CBC Record', 'Valid Bank Account'].map((req, i) => (
                    <div key={i} className="req-item" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: 'var(--text-muted-dark)' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle2 size={13} color="var(--success-text)" />
                      </div>
                      <span style={{ fontSize: '0.875rem', fontWeight: '700' }}>{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link href={`/admin/loans/new?productId=${product.id}`} style={{ textDecoration: 'none' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ 
                    width: '100%', 
                    padding: '0.875rem', 
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    boxShadow: 'var(--shadow-glow)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  Apply Now
                  <ArrowRight size={16} />
                </button>
              </Link>
              
              <Link href={`/admin/products/edit/${product.id}`} style={{ textDecoration: 'none' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ 
                    width: '100%', 
                    padding: '0.875rem', 
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-color)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                  }}
                >
                  Configure Product
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .product-card:hover .requirements-overlay {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        .product-card:hover .product-content {
          opacity: 0.05;
          filter: blur(4px);
        }
        .req-item {
          opacity: 0;
          transform: translateX(-15px);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .product-card:hover .req-item:nth-child(1) { opacity: 1; transform: translateX(0); transition-delay: 0.1s; }
        .product-card:hover .req-item:nth-child(2) { opacity: 1; transform: translateX(0); transition-delay: 0.2s; }
        .product-card:hover .req-item:nth-child(3) { opacity: 1; transform: translateX(0); transition-delay: 0.3s; }
        .product-card:hover .req-item:nth-child(4) { opacity: 1; transform: translateX(0); transition-delay: 0.4s; }
      `}} />
    </div>
  );
}
