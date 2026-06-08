'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search, Bell, FileText, Users, MessageSquare,
  Star, Gift, CreditCard, Box, Settings, ChevronDown,
  GitPullRequest, Shield, LogOut, MapPin, Webhook, FileSpreadsheet, BarChart2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import SettingsModal from '@/components/SettingsModal';
import UserProfileModal from '@/components/UserProfileModal';
import { api } from '@/services/api';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('Profile');
  const [isCustomerMenuOpen, setIsCustomerMenuOpen] = useState(pathname?.startsWith('/admin/customers') ?? true);

  const [sidebarConfig, setSidebarConfig] = useState<Record<string, boolean>>({});
  const [user, setUser] = useState<any>({});
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Failed to parse user from localStorage', e);
        }
      }
    }

    const fetchConfig = () => {
      api.get('/company').then(data => {
        if (data?.sidebarConfig) {
          setSidebarConfig(data.sidebarConfig);
        }
      }).catch(err => console.error('Failed to load company config', err));
    };

    fetchConfig();
    window.addEventListener('companyConfigUpdated', fetchConfig);

    return () => {
      window.removeEventListener('companyConfigUpdated', fetchConfig);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const navItemStyle = (isActive: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.625rem 0.875rem',
    borderRadius: 'var(--radius-md)',
    backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
    color: isActive ? 'var(--primary)' : '#475569',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: isActive ? '600' : '500',
    transition: 'all var(--transition-fast)',
    boxShadow: isActive ? '0 1px 2px rgba(37, 99, 235, 0.05)' : 'none',
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      {/* Sidebar */}
      <aside style={{ width: '280px', backgroundColor: 'var(--sidebar-bg)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
        {/* Logo block with Blue Gradient */}
        <div style={{ 
          height: '72px',
          padding: '0 1.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          background: 'linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          boxSizing: 'border-box'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden',
            boxShadow: '0 0 8px rgba(255, 255, 255, 0.2)',
          }}>
            <img
              src="/acabar-logo.png"
              alt="Acabar Plc Logo"
              style={{ width: '38px', height: '38px', objectFit: 'cover' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: '700', fontSize: '1.15rem', letterSpacing: '-0.03em', color: '#ffffff', lineHeight: '1.2' }}>Acabar Plc</span>
            <span style={{ fontWeight: '500', fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', marginTop: '1px' }}>ប្រព័ន្ធគ្រប់គ្រងប្រាក់កម្ចី</span>
          </div>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {sidebarConfig['Dashboard'] !== false && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8', marginBottom: '0.5rem', paddingLeft: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overview</div>
              <Link href="/admin" className="sidebar-link" style={navItemStyle(pathname === '/admin')}>
                <FileText size={18} />
                Dashboard
              </Link>
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            {sidebarConfig['Customer'] !== false && (
              <>
                <div 
                  onClick={() => setIsCustomerMenuOpen(!isCustomerMenuOpen)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0.875rem', color: pathname?.startsWith('/admin/customers') ? 'var(--primary)' : '#475569', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer', transition: 'color var(--transition-fast)' }}
                  onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
                  onMouseOut={(e) => e.currentTarget.style.color = pathname?.startsWith('/admin/customers') ? 'var(--primary)' : '#475569'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Users size={18} />
                    Customer
                  </div>
                  <ChevronDown size={14} style={{ transform: isCustomerMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </div>

                {isCustomerMenuOpen && (
                  <div style={{ paddingLeft: '2.625rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem', animation: 'fadeIn 0.2s ease-out' }}>
                    <Link href="/admin/customers/accounts" className="sidebar-link" style={{ padding: '0.375rem 0.5rem', borderRadius: '4px', color: pathname === '/admin/customers/accounts' ? 'var(--primary)' : '#64748b', textDecoration: 'none', fontSize: '0.875rem', transition: 'color var(--transition-fast)' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'} onMouseOut={(e) => e.currentTarget.style.color = pathname === '/admin/customers/accounts' ? 'var(--primary)' : '#64748b'}>All Customers</Link>
                    <Link href="/admin/customers/repayments" className="sidebar-link" style={{ padding: '0.375rem 0.5rem', borderRadius: '4px', color: pathname === '/admin/customers/repayments' ? 'var(--primary)' : '#64748b', textDecoration: 'none', fontSize: '0.875rem', transition: 'color var(--transition-fast)' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'} onMouseOut={(e) => e.currentTarget.style.color = pathname === '/admin/customers/repayments' ? 'var(--primary)' : '#64748b'}>Repayment</Link>
                  </div>
                )}
              </>
            )}

            {sidebarConfig['LOS Pipeline'] !== false && (
              <Link href="/admin/los" className="sidebar-link" style={{ ...navItemStyle(pathname === '/admin/los' || pathname?.startsWith('/admin/los/')), marginTop: sidebarConfig['Customer'] !== false ? '0.5rem' : '0' }}>
                <GitPullRequest size={18} />
                LOS Pipeline
              </Link>
            )}
            
            {sidebarConfig['Underwriting'] !== false && (
              <Link href="/admin/underwriting" className="sidebar-link" style={navItemStyle(pathname === '/admin/underwriting')}>
                <Shield size={18} />
                Underwriting
              </Link>
            )}
            
            {sidebarConfig['New Application'] !== false && (
              <Link href="/admin/loans/new" className="sidebar-link" style={navItemStyle(pathname === '/admin/loans/new')}>
                <CreditCard size={18} />
                New Application
              </Link>
            )}
            
            {sidebarConfig['Loan Product'] !== false && (
              <Link href="/admin/products" className="sidebar-link" style={navItemStyle(pathname === '/admin/products')}>
                <Box size={18} />
                Loan Product
              </Link>
            )}
            
            {sidebarConfig['CBC'] !== false && (
              <Link href="/admin/cbc" className="sidebar-link" style={navItemStyle(pathname === '/admin/cbc')}>
                <Search size={18} />
                CBC Check
              </Link>
            )}

            {sidebarConfig['Bank Statement'] !== false && (
              <Link href="/admin/bank-statement" className="sidebar-link" style={navItemStyle(pathname === '/admin/bank-statement')}>
                <FileSpreadsheet size={18} />
                Bank Statement
              </Link>
            )}

            {sidebarConfig['Report'] !== false && (
              <Link href="/admin/report" className="sidebar-link" style={navItemStyle(pathname === '/admin/report')}>
                <BarChart2 size={18} />
                Report
              </Link>
            )}

          </div>

        </nav>

        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: '#94a3b8', fontWeight: '500' }}>
          Acabar Plc Admin <span style={{ float: 'right', color: '#64748b' }}>v1.0.0</span>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header - Glassmorphism */}
        <header className="glass" style={{ position: 'sticky', top: 0, height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 2.5rem', zIndex: 5 }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>

            <button style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', transition: 'background-color var(--transition-fast)' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              <Bell size={20} color="var(--text-muted-dark)" />
              <span style={{ position: 'absolute', top: '8px', right: '10px', width: '8px', height: '8px', backgroundColor: 'var(--error-text)', borderRadius: '50%', border: '2px solid white' }}></span>
            </button>

            <div ref={profileRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '0.5rem', borderRadius: 'var(--radius-md)', transition: 'background-color var(--transition-fast)' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--secondary)', color: 'var(--foreground)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: '600', border: '2px solid white', boxShadow: 'var(--shadow-sm)' }}>
                  {user?.firstName?.[0] || 'U'}
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--foreground)' }}>
                    {user?.firstName || 'User'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ 
                      fontSize: '0.65rem', 
                      padding: '0.125rem 0.375rem', 
                      backgroundColor: user?.roles?.[0] === 'SUPER_ADMIN' ? '#fefce8' : '#f1f5f9',
                      color: user?.roles?.[0] === 'SUPER_ADMIN' ? '#a16207' : '#475569',
                      borderRadius: '4px',
                      fontWeight: '800',
                      textTransform: 'uppercase'
                    }}>
                      {user?.roles?.[0] || 'GUEST'}
                    </span>
                  </div>
                </div>
                <ChevronDown size={16} color="var(--text-muted)" style={{ transition: 'transform 0.2s', transform: isProfileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </button>

              {/* Dropdown */}
              {isProfileOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0, width: '260px', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-color)', zIndex: 50, overflow: 'hidden', animation: 'fadeIn 0.2s ease-out' }}>
                  <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#f8fafc' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--secondary)', color: 'var(--foreground)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: '600', border: '2px solid white', boxShadow: 'var(--shadow-sm)' }}>
                      CN
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', whiteSpace: 'nowrap', textOverflow: 'ellipsis', color: 'var(--foreground)' }}>Chamnab</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>chamnabkol@kreign.com.kh</div>
                    </div>
                  </div>
                  <div style={{ padding: '0.5rem' }}>
                    <button 
                      onClick={() => { setIsUserProfileOpen(true); setIsProfileOpen(false); }}
                      style={{ width: '100%', textAlign: 'left', display: 'block', padding: '0.5rem 1rem', fontSize: '0.875rem', color: 'var(--text-muted-dark)', textDecoration: 'none', borderRadius: 'var(--radius-md)', transition: 'all var(--transition-fast)', background: 'none', border: 'none', cursor: 'pointer' }} 
                      onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = 'var(--foreground)' }} 
                      onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted-dark)' }}
                    >
                      Profile
                    </button>
                    <button 
                      onClick={() => { setIsSettingsOpen(true); setSettingsTab('Security'); setIsProfileOpen(false); }}
                      style={{ width: '100%', textAlign: 'left', display: 'block', padding: '0.5rem 1rem', fontSize: '0.875rem', color: 'var(--text-muted-dark)', textDecoration: 'none', borderRadius: 'var(--radius-md)', transition: 'all var(--transition-fast)', background: 'none', border: 'none', cursor: 'pointer' }} 
                      onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = 'var(--foreground)' }} 
                      onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted-dark)' }}
                    >
                      Settings
                    </button>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border-color)', padding: '0.5rem' }}>
                    <button 
                      onClick={handleLogout}
                      style={{ width: '100%', textAlign: 'left', padding: '0.5rem 1rem', fontSize: '0.875rem', color: 'var(--error-text)', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-md)', transition: 'background-color var(--transition-fast)', display: 'flex', alignItems: 'center', gap: '0.5rem' }} 
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--error-bg)'} 
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '2.5rem' }}>
          {children}
        </main>
      </div>
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        initialTab={settingsTab} 
      />
      <UserProfileModal 
        isOpen={isUserProfileOpen} 
        onClose={() => setIsUserProfileOpen(false)} 
      />
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
