'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, User, Shield, Building, Globe, 
  Camera, CheckCircle, AlertCircle, Save, Loader2, Edit, List,
  Users, ShieldCheck, Trash2
} from 'lucide-react';
import { api } from '@/services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
}

export default function SettingsModal({ isOpen, onClose, initialTab = 'Profile' }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Profile State
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    roles: [],
    branch: null as any
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [company, setCompany] = useState({
    name: '',
    industry: '',
    size: '',
    website: '',
    address: '',
    phone: '',
    email: '',
    sidebarConfig: {} as Record<string, boolean>
  });
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [companyForm, setCompanyForm] = useState({...company});

  // User Management & Roles State
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [allPermissions, setAllPermissions] = useState<any[]>([]);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  
  // Language State
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('preferred_language') || 'en';
    }
    return 'en';
  });
  const fetchUsersAndRoles = async () => {
    setLoading(true);
    try {
      const [userData, roleData] = await Promise.all([
        api.get('/users'),
        api.get('/users/roles')
      ]);
      setUsers(userData);
      setRoles(roleData);
    } catch (err) {
      console.error('Failed to fetch users and roles', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRolesAndPermissions = async () => {
    setLoading(true);
    try {
      const [roleData, permData] = await Promise.all([
        api.get('/users/roles'),
        api.get('/users/permissions')
      ]);
      setRoles(roleData);
      setAllPermissions(permData);
    } catch (err) {
      console.error('Failed to fetch roles and permissions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'Users') {
        fetchUsersAndRoles();
      } else if (activeTab === 'Roles') {
        fetchRolesAndPermissions();
      }
    }
  }, [activeTab, isOpen]);

  const handleUpdateRolePerms = async () => {
    if (!editingRole) return;
    setLoading(true);
    try {
      await api.patch(`/users/roles/${editingRole.id}/permissions`, {
        permissionIds: selectedPermissions
      });
      setEditingRole(null);
      fetchRolesAndPermissions();
      setSuccess('Permissions updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to update permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async () => {
    if (!editingUser) return;
    setLoading(true);
    try {
      await api.post(`/users/${editingUser.id}/roles`, {
        roleId: selectedRole
      });
      setEditingUser(null);
      fetchUsersAndRoles();
      setSuccess('User role updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to update user role');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setLoading(true);
      try {
        await api.delete(`/users/${userId}`);
        fetchUsersAndRoles();
        setSuccess('User deleted successfully');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError('Failed to delete user');
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
      fetchCompany();
      setActiveTab(initialTab);
      setSuccess(null);
      setError(null);
      setIsEditingCompany(false);
    }
  }, [isOpen, initialTab]);

  const fetchProfile = async () => {
    try {
      const data = await api.get('/users/me');
      setProfile(data);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

  const fetchCompany = async () => {
    try {
      const data = await api.get('/company');
      setCompany(data);
      setCompanyForm(data);
    } catch (err) {
      console.error('Failed to fetch company', err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      const updated = await api.patch('/users/me', {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email
      });
      setProfile(prev => ({ ...prev, ...updated }));
      
      // Update localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...user, ...updated }));
      
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      await api.patch('/users/me/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Password updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      const { id, createdAt, updatedAt, ...updateData } = companyForm as any;
      const updated = await api.patch('/company', updateData);
      setCompany(updated);
      setIsEditingCompany(false);
      setSuccess('Settings updated successfully');
      window.dispatchEvent(new Event('companyConfigUpdated'));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isSuperAdmin = profile.roles?.some((r: any) => r === 'SUPER_ADMIN' || r.role?.name === 'SUPER_ADMIN');
  const tabs = [
    { id: 'Profile', icon: User, label: 'Profile' },
    ...(isSuperAdmin ? [
      { id: 'Company', icon: Building, label: 'Company' },
      { id: 'Navigation', icon: List, label: 'Navigation' },
      { id: 'Users', icon: Users, label: 'User Management' },
      { id: 'Roles', icon: ShieldCheck, label: 'Roles & Permissions' }
    ] : []),
    { id: 'Security', icon: Shield, label: 'Security' },
    { id: 'Language', icon: Globe, label: 'Language' },
  ];

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease-out' }}>
      <div style={{ width: '900px', height: '640px', backgroundColor: 'white', borderRadius: '24px', display: 'flex', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.1)', animation: 'slideUp 0.3s ease-out' }}>
        
        {/* Sidebar */}
        <div style={{ width: '260px', backgroundColor: '#f8fafc', borderRight: '1px solid #e2e8f0', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ padding: '0 1rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '32px', height: '32px', backgroundColor: '#0f172a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={18} color="white" />
              </div>
              Settings
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.5rem' }}>Manage your account settings and preferences.</p>
          </div>

          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSuccess(null); setError(null); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 1.25rem', borderRadius: '12px', border: 'none', 
                backgroundColor: activeTab === tab.id ? '#2563eb' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#475569',
                fontSize: '0.9375rem', fontWeight: activeTab === tab.id ? '600' : '500',
                cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
              }}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
            <X size={24} />
          </button>

          <div style={{ padding: '3rem', flex: 1, overflowY: 'auto' }}>
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                {activeTab === 'Users' ? 'User Management' : activeTab === 'Roles' ? 'Roles & Permissions' : activeTab}
              </h3>
              <p style={{ fontSize: '0.9375rem', color: '#64748b', marginTop: '0.25rem' }}>
                {activeTab === 'Profile' && 'Update your personal information and profile picture.'}
                {activeTab === 'Security' && 'Manage your account security settings.'}
                {activeTab === 'Company' && 'View and manage company-wide information.'}
                {activeTab === 'Navigation' && 'Configure which sidebar menu items are visible across the system.'}
                {activeTab === 'Language' && 'Select your preferred language and region.'}
                {activeTab === 'Users' && 'Manage system users and their assigned security roles.'}
                {activeTab === 'Roles' && 'Manage access roles and granular permissions.'}
              </p>
            </div>

            {success && (
              <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', color: '#166534', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', animation: 'fadeIn 0.2s ease-out' }}>
                <CheckCircle size={18} /> {success}
              </div>
            )}

            {error && (
              <div style={{ padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#991b1b', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', animation: 'fadeIn 0.2s ease-out' }}>
                <AlertCircle size={18} /> {error}
              </div>
            )}

            {activeTab === 'Profile' && (
              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '32px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: '700', color: '#1e293b', border: '4px solid white', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                      {profile.firstName?.[0] || 'U'}
                    </div>
                    <button type="button" style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '36px', height: '36px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                      <Camera size={18} />
                    </button>
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700' }}>Your Photo</h4>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#64748b' }}>Allowed format JPG, GIF or PNG. Max size 2MB.</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="input-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>First Name</label>
                    <input 
                      type="text" 
                      value={profile.firstName}
                      onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                      style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', transition: 'all 0.2s', fontSize: '0.9375rem' }} 
                      onFocus={(e) => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  <div className="input-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Last Name</label>
                    <input 
                      type="text" 
                      value={profile.lastName}
                      onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                      style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', transition: 'all 0.2s', fontSize: '0.9375rem' }} 
                      onFocus={(e) => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Email Address</label>
                  <input 
                    type="email" 
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', transition: 'all 0.2s', fontSize: '0.9375rem' }} 
                    onFocus={(e) => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                  <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.875rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'Security' && (
              <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                   <div style={{ backgroundColor: '#fff', padding: '0.75rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', color: '#2563eb' }}>
                      <Shield size={24} />
                   </div>
                   <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>Password Settings</h4>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#64748b' }}>Change your password regularly to keep your account secure.</p>
                   </div>
                </div>

                <div className="input-group">
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Current Password</label>
                  <input 
                    type="password" 
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', transition: 'all 0.2s', fontSize: '0.9375rem' }} 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="input-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>New Password</label>
                    <input 
                      type="password" 
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', transition: 'all 0.2s', fontSize: '0.9375rem' }} 
                    />
                  </div>
                  <div className="input-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Confirm New Password</label>
                    <input 
                      type="password" 
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', transition: 'all 0.2s', fontSize: '0.9375rem' }} 
                    />
                  </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.875rem 2rem', fontWeight: '600' }}>
                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'Update Password'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'Company' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {!isEditingCompany ? (
                  <>
                    {/* Info Card */}
                    <div style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '16px', position: 'relative' }}>
                      <button 
                        onClick={() => setIsEditingCompany(true)}
                        style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#475569', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}
                      >
                        <Edit size={16} /> Edit
                      </button>
                      <h4 style={{ margin: '0 0 1.5rem', fontSize: '1.125rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Building size={20} color="#2563eb" /> Company Information
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Company Name</div>
                          <div style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#1e293b' }}>{company.name || 'N/A'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Industry</div>
                          <div style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#1e293b' }}>{company.industry || 'N/A'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Company Size</div>
                          <div style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#1e293b' }}>{company.size || 'N/A'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Website</div>
                          <div style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#2563eb' }}>{company.website || 'N/A'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Card */}
                    <div style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
                      <h4 style={{ margin: '0 0 1.5rem', fontSize: '1.125rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <User size={20} color="#2563eb" /> Contact Information
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Address</div>
                          <div style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#1e293b' }}>{company.address || 'N/A'}</div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Phone</div>
                            <div style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#1e293b' }}>{company.phone || 'N/A'}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Email</div>
                            <div style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#1e293b' }}>{company.email || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <form onSubmit={handleUpdateCompany} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div className="input-group">
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Company Name</label>
                        <input 
                          type="text" 
                          value={companyForm.name}
                          onChange={(e) => setCompanyForm({...companyForm, name: e.target.value})}
                          style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }} 
                        />
                      </div>
                      <div className="input-group">
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Industry</label>
                        <input 
                          type="text" 
                          value={companyForm.industry}
                          onChange={(e) => setCompanyForm({...companyForm, industry: e.target.value})}
                          style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }} 
                        />
                      </div>
                      <div className="input-group">
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Company Size</label>
                        <input 
                          type="text" 
                          value={companyForm.size}
                          onChange={(e) => setCompanyForm({...companyForm, size: e.target.value})}
                          style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }} 
                        />
                      </div>
                      <div className="input-group">
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Website</label>
                        <input 
                          type="text" 
                          value={companyForm.website}
                          onChange={(e) => setCompanyForm({...companyForm, website: e.target.value})}
                          style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }} 
                        />
                      </div>
                    </div>
                    <div className="input-group">
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Address</label>
                      <input 
                        type="text" 
                        value={companyForm.address}
                        onChange={(e) => setCompanyForm({...companyForm, address: e.target.value})}
                        style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }} 
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div className="input-group">
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Phone</label>
                        <input 
                          type="text" 
                          value={companyForm.phone}
                          onChange={(e) => setCompanyForm({...companyForm, phone: e.target.value})}
                          style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }} 
                        />
                      </div>
                      <div className="input-group">
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Email</label>
                        <input 
                          type="text" 
                          value={companyForm.email}
                          onChange={(e) => setCompanyForm({...companyForm, email: e.target.value})}
                          style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }} 
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.875rem 2rem' }}>
                        {loading ? <Loader2 className="animate-spin" size={18} /> : 'Save Changes'}
                      </button>
                      <button type="button" onClick={() => setIsEditingCompany(false)} className="btn btn-secondary" style={{ padding: '0.875rem 2rem' }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {activeTab === 'Navigation' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                   <div style={{ backgroundColor: '#fff', padding: '0.75rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', color: '#2563eb' }}>
                      <List size={24} />
                   </div>
                   <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>Sidebar Menus</h4>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#64748b' }}>Toggle the visibility of main navigation modules for all admin users.</p>
                   </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {['Dashboard', 'Customer', 'LOS Pipeline', 'Underwriting', 'New Application', 'Loan Product', 'CBC', 'Bank Statement', 'Report'].map(item => {
                    const isVisible = companyForm.sidebarConfig?.[item] !== false; // Default true
                    return (
                      <div key={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                        <span style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#1e293b' }}>{item}</span>
                        <button 
                          onClick={async () => {
                            const newVisible = !isVisible;
                            const newSidebarConfig = {
                              ...(companyForm.sidebarConfig || {}),
                              [item]: newVisible
                            };
                            
                            // Optimistic UI update
                            setCompanyForm(prev => ({ ...prev, sidebarConfig: newSidebarConfig }));
                            
                            try {
                              const { id, createdAt, updatedAt, ...updateData } = companyForm as any;
                              updateData.sidebarConfig = newSidebarConfig;
                              const updated = await api.patch('/company', updateData);
                              setCompany(updated);
                              window.dispatchEvent(new Event('companyConfigUpdated'));
                            } catch (err) {
                              console.error('Failed to save config', err);
                              // Revert on failure
                              setCompanyForm(prev => ({ 
                                ...prev, 
                                sidebarConfig: { ...newSidebarConfig, [item]: isVisible } 
                              }));
                            }
                          }}
                          style={{
                            width: '44px', height: '24px', borderRadius: '12px',
                            backgroundColor: isVisible ? '#2563eb' : '#cbd5e1',
                            border: 'none', position: 'relative', cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                        >
                          <div style={{
                            width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white',
                            position: 'absolute', top: '2px', left: isVisible ? '22px' : '2px',
                            transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                          }} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'Language' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                   <div style={{ backgroundColor: '#fff', padding: '0.75rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', color: '#2563eb' }}>
                      <Globe size={24} />
                   </div>
                   <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>Display Language</h4>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#64748b' }}>Select your preferred language for the admin dashboard interface.</p>
                   </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { id: 'en', name: 'English', flag: '🇬🇧' },
                    { id: 'km', name: 'Khmer (ខ្មែរ)', flag: '🇰🇭' },
                    { id: 'ko', name: 'Korean (한국어)', flag: '🇰🇷' }
                  ].map(lang => (
                    <label 
                      key={lang.id} 
                      style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                        padding: '1.25rem 1.5rem', border: selectedLanguage === lang.id ? '2px solid #2563eb' : '1px solid #e2e8f0', 
                        borderRadius: '12px', cursor: 'pointer', backgroundColor: selectedLanguage === lang.id ? '#f0f9ff' : '#ffffff',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>{lang.flag}</span>
                        <span style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>{lang.name}</span>
                      </div>
                      <input 
                        type="radio" 
                        name="language" 
                        value={lang.id} 
                        checked={selectedLanguage === lang.id}
                        onChange={(e) => {
                          setSelectedLanguage(e.target.value);
                          localStorage.setItem('preferred_language', e.target.value);
                          setSuccess('Language preference updated successfully');
                          setTimeout(() => setSuccess(null), 3000);
                        }}
                        style={{ width: '1.25rem', height: '1.25rem', accentColor: '#2563eb', cursor: 'pointer' }}
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'Users' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                      <div className="animate-spin" style={{ width: '24px', height: '24px', border: '3px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', margin: '0 auto' }}></div>
                    </div>
                  ) : users.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>No accounts registered in the database.</div>
                  ) : (
                    users.map((user) => {
                      const isAdmin = user.roles.some((ur: any) => ur.role.name === 'SUPER_ADMIN');
                      return (
                        <div key={user.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'white' }}>
                          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                            <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: isAdmin ? '#fefce8' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: '700', color: isAdmin ? '#a16207' : 'inherit' }}>
                              {user.firstName[0]}{user.lastName[0]}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ fontWeight: '700', fontSize: '1.125rem' }}>{user.firstName} {user.lastName}</span>
                                <span style={{ padding: '0.125rem 0.625rem', backgroundColor: isAdmin ? '#fefce8' : '#f1f5f9', color: isAdmin ? '#a16207' : '#475569', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: '800', border: isAdmin ? '1px solid #fef08a' : 'none' }}>
                                  {user.roles[0]?.role.name}
                                </span>
                              </div>
                              <div style={{ color: '#64748b', fontSize: '0.875rem' }}>{user.email}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.75rem' }}>
                            {!isAdmin && (
                              <>
                                <button 
                                  className="btn btn-secondary" 
                                  onClick={() => { setEditingUser(user); setSelectedRole(user.roles[0]?.roleId); }}
                                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}
                                >
                                  <Edit size={16} /> Role
                                </button>
                                <button 
                                  className="btn btn-secondary" 
                                  onClick={() => handleDeleteUser(user.id)}
                                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#dc2626', borderColor: '#fecaca', cursor: 'pointer' }}
                                >
                                  <Trash2 size={16} /> Delete
                                </button>
                              </>
                            )}
                            {isAdmin && (
                               <div style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #e2e8f0' }}>
                                  System Account
                               </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {activeTab === 'Roles' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {loading ? (
                      <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <div className="animate-spin" style={{ width: '24px', height: '24px', border: '3px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', margin: '0 auto' }}></div>
                      </div>
                    ) : (
                      roles.map((role) => (
                        <div key={role.id} style={{ padding: '1.5rem', border: editingRole?.id === role.id ? '2px solid #2563eb' : '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: 'white' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                            <div>
                              <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700' }}>{role.name}</h4>
                              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#64748b' }}>{role.description}</p>
                            </div>
                            {role.name !== 'SUPER_ADMIN' && (
                              <button 
                                style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer' }}
                                onClick={() => {
                                  setEditingRole(role);
                                  setSelectedPermissions(role.permissions.map((p: any) => p.permissionId));
                                }}
                              >
                                <Edit size={20} />
                              </button>
                            )}
                          </div>
                          
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {role.permissions.map((rp: any) => (
                              <span key={rp.permission.id} style={{ padding: '0.25rem 0.625rem', backgroundColor: '#f1f5f9', borderRadius: '8px', fontSize: '0.6875rem', fontWeight: '600', color: '#475569' }}>
                                {rp.permission.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Role Modal */}
      {editingRole && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setEditingRole(null)}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', width: '90%', maxWidth: '600px', padding: '2rem' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
               <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>Edit Permissions: {editingRole.name}</h3>
               <button onClick={() => setEditingRole(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X /></button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxHeight: '400px', overflowY: 'auto', padding: '0.5rem' }}>
               {allPermissions.map((perm) => (
                 <label key={perm.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer' }}>
                   <input 
                     type="checkbox" 
                     checked={selectedPermissions.includes(perm.id)}
                     onChange={(e) => {
                       if (e.target.checked) setSelectedPermissions([...selectedPermissions, perm.id]);
                       else setSelectedPermissions(selectedPermissions.filter(id => id !== perm.id));
                     }}
                   />
                   <div>
                     <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{perm.name}</div>
                     <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{perm.description}</div>
                   </div>
                 </label>
               ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
               <button className="btn btn-primary" style={{ flex: 1, padding: '0.875rem 2rem', fontWeight: '600' }} onClick={handleUpdateRolePerms}><Save size={18} /> Save Changes</button>
               <button className="btn btn-secondary" style={{ flex: 1, padding: '0.875rem 2rem', fontWeight: '600' }} onClick={() => setEditingRole(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Role Modal */}
      {editingUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setEditingUser(null)}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', width: '90%', maxWidth: '400px', padding: '2rem' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1.5rem', marginTop: 0, fontSize: '1.25rem', fontWeight: '800' }}>Change Role: {editingUser.firstName}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               {roles.map((role) => (
                 <button 
                   key={role.id} 
                   onClick={() => setSelectedRole(role.id)}
                   style={{ 
                     textAlign: 'left', padding: '1rem', borderRadius: '12px', border: selectedRole === role.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                     backgroundColor: selectedRole === role.id ? '#eff6ff' : 'white', cursor: 'pointer'
                   }}
                 >
                   <div style={{ fontWeight: '700', fontSize: '0.9375rem' }}>{role.name}</div>
                   <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>{role.description}</div>
                 </button>
               ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
               <button className="btn btn-primary" style={{ flex: 1, padding: '0.875rem 2rem', fontWeight: '600' }} onClick={handleUpdateUserRole}>Confirm Change</button>
               <button className="btn btn-secondary" style={{ flex: 1, padding: '0.875rem 2rem', fontWeight: '600' }} onClick={() => setEditingUser(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
