'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, User, Mail, Shield, Calendar, Clock, Camera, CheckCircle, AlertCircle, Loader2 
} from 'lucide-react';
import { api } from '@/services/api';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/users/me');
      setProfile(data);
    } catch (err: any) {
      console.error('Failed to fetch profile', err);
      setError('Failed to load profile information');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div style={{ 
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
      backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)', 
      zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{ 
        width: '440px', backgroundColor: 'white', borderRadius: '24px', 
        padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        position: 'relative', animation: 'slideUp 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ 
              width: '40px', height: '40px', borderRadius: '12px', 
              backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              <User size={20} color="#64748b" />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>User Profile</h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>View and manage your account information</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', 
              padding: '4px', borderRadius: '50%', transition: 'all 0.2s' 
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 className="animate-spin" size={32} color="#2563eb" />
          </div>
        ) : error ? (
          <div style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <AlertCircle size={40} color="#ef4444" />
            <p style={{ color: '#ef4444', fontWeight: '500' }}>{error}</p>
            <button onClick={fetchProfile} className="btn btn-secondary">Retry</button>
          </div>
        ) : (
          <>
            {/* Avatar Section */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <div style={{ 
                  width: '96px', height: '96px', borderRadius: '50%', 
                  backgroundColor: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '32px', fontWeight: '700', color: 'white',
                  boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)'
                }}>
                  {profile.firstName?.[0] || 'U'}
                </div>
                <button style={{ 
                  position: 'absolute', bottom: '0', right: '0',
                  width: '32px', height: '32px', borderRadius: '50%',
                  backgroundColor: 'white', border: '1px solid #e2e8f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer'
                }}>
                  <Camera size={14} color="#64748b" />
                </button>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                {profile.firstName} {profile.lastName}
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0' }}>{profile.email}</p>
            </div>

            <div style={{ height: '1px', backgroundColor: '#f1f5f9', width: '100%', marginBottom: '24px' }}></div>

            {/* Personal Information */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Personal Information</h4>
              
              <div style={{ 
                border: '1px solid #f1f5f9', borderRadius: '16px', 
                backgroundColor: '#fff', overflow: 'hidden'
              }}>
                {[
                  { icon: User, label: 'Name', value: `${profile.firstName} ${profile.lastName}` },
                  { icon: Mail, label: 'Email', value: profile.email },
                  { icon: Shield, label: 'Company ID', value: profile.branchId || 'N/A', isMono: true },
                  { icon: Shield, label: 'Roles', value: profile.roles?.[0]?.role?.name || 'User', isBadge: true },
                  { icon: Shield, label: 'Current Mode', value: 'Customer' }, // Hardcoded as per image
                  { icon: Calendar, label: 'Account Created', value: formatDate(profile.createdAt) },
                  { icon: Clock, label: 'Last Login', value: formatDate(profile.lastLoginAt) || formatDate(new Date().toISOString()) }
                ].map((item, index) => (
                  <div key={index} style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px', borderBottom: index === 6 ? 'none' : '1px solid #f1f5f9'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <item.icon size={16} color="#94a3b8" />
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>{item.label}</span>
                    </div>
                    {item.isBadge ? (
                      <span style={{ 
                        fontSize: '12px', fontWeight: '600', padding: '4px 12px',
                        backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '99px'
                      }}>
                        {item.value}
                      </span>
                    ) : (
                      <span style={{ 
                        fontSize: item.isMono ? '12px' : '14px', 
                        fontWeight: '500', color: '#64748b',
                        textAlign: 'right', maxWidth: '200px', 
                        wordBreak: 'break-all',
                        fontFamily: item.isMono ? 'monospace' : 'inherit'
                      }}>
                        {item.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button 
                onClick={onClose}
                className="btn btn-secondary"
                style={{ padding: '10px 24px', fontWeight: '600', borderRadius: '12px' }}
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
