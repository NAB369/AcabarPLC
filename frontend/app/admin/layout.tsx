'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search, Bell, FileText, Users, MessageSquare,
  Star, Gift, CreditCard, Box, Settings, ChevronDown,
  GitPullRequest, Shield, LogOut, MapPin, Webhook, FileSpreadsheet, BarChart2,
  Sun, Moon, Clock, BookOpen, LayoutList, TrendingUp, TrendingDown,
  ArrowLeftRight, PenLine, BarChart3, Scale, BookMarked, ChevronRight, ChevronLeft,
  FileCheck, Landmark, CheckSquare, Briefcase, Menu, X, ShieldCheck, Globe
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import SettingsModal from '@/components/SettingsModal';
import UserProfileModal from '@/components/UserProfileModal';
import { api } from '@/services/api';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from 'next-themes';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('Profile');
  const [isCustomerMenuOpen, setIsCustomerMenuOpen] = useState(pathname?.startsWith('/admin/customers') ?? true);
  const [isAccountingOpen, setIsAccountingOpen] = useState(pathname?.startsWith('/admin/accounting') || pathname?.startsWith('/admin/period'));
  const [isAcctReportsOpen, setIsAcctReportsOpen] = useState(pathname?.startsWith('/admin/accounting/reports'));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [sidebarConfig, setSidebarConfig] = useState<Record<string, boolean>>({});
  const [user, setUser] = useState<any>({});

  const isAccountant = user?.roles?.includes('ACCOUNTANT') || user?.roles?.includes('SUPER_ADMIN');
  const isLoanOfficer = user?.roles?.includes('LOAN_OFFICER') || user?.roles?.includes('CREDIT_OFFICER') || user?.roles?.includes('SUPER_ADMIN');
  const isAdmin = user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPER_ADMIN');
  const isTeller = user?.roles?.includes('TELLER') || user?.roles?.includes('CASHIER') || isAccountant || isLoanOfficer;
  const canViewReports = user?.roles?.includes('SUPER_ADMIN') || user?.roles?.includes('BRANCH_MANAGER') || user?.roles?.includes('ACCOUNTANT') || user?.roles?.includes('AUDITOR');
  const profileRef = useRef<HTMLDivElement>(null);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted && (theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches));

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

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
    padding: '0.75rem 1rem',
    borderRadius: '24px',
    backgroundColor: 'var(--nav-bg, #ffffff)',
    color: isActive ? 'var(--nav-text-active, #16a34a)' : 'var(--nav-text, #475569)',
    borderTop: '1px solid var(--nav-border, #e2e8f0)',
    borderRight: '1px solid var(--nav-border, #e2e8f0)',
    borderBottom: '1px solid var(--nav-border, #e2e8f0)',
    borderLeft: '4px solid #22c55e',
    boxShadow: 'var(--nav-shadow, 0 1px 3px rgba(0,0,0,0.04))',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: isActive ? '700' : '500',
    transition: 'all 0.2s ease',
    marginBottom: '0.5rem',
    position: 'relative' as any,
  });

  const NavChevron = ({ isActive }: { isActive: boolean }) => null;

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-[var(--sidebar-bg)] border-r border-[var(--border-color)] flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo block with Green Gradient */}
        <div style={{ 
          height: '72px',
          padding: '0 1.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          backgroundColor: 'transparent',
          borderBottom: '1px solid var(--border-color)',
          boxSizing: 'border-box'
        }}>
          <div className="flex-1 flex items-center gap-3">
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            }}>
              <img
                src="/acabar-logo.png"
                alt="Acabar Plc Logo"
                style={{ width: '38px', height: '38px', objectFit: 'cover' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="text-[#1e3a8a] dark:text-white" style={{ fontWeight: '800', fontSize: '1.15rem', letterSpacing: '-0.03em', lineHeight: '1.2' }}>Acabar Plc</span>
              <span className="text-slate-500 dark:text-slate-400" style={{ fontWeight: '600', fontSize: '0.65rem', marginTop: '1px' }}>អាខាបារ ម.ក</span>
            </div>
          </div>
          <button className="md:hidden text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          
          {/* OVERVIEW Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {sidebarConfig['Dashboard'] !== false && (
                <Link href="/admin" className={`sidebar-link ${(pathname === '/admin') ? "active" : ""}`} style={navItemStyle(pathname === '/admin')}>
                  <BarChart3 size={18} />
                  {t('dashboard')}
                  <NavChevron isActive={pathname === '/admin'} />
                </Link>
              )}
            </div>
          </div>

          {/* CUSTOMERS Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', paddingLeft: '0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('sectionCustomers')}</div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {sidebarConfig['Customer'] !== false && (
                <Link href="/admin/customers/accounts" className={`sidebar-link ${(pathname === '/admin/customers/accounts') ? "active" : ""}`} style={navItemStyle(pathname === '/admin/customers/accounts')}>
                  <Users size={18} />
                  {t('customer')}
                  <NavChevron isActive={pathname === '/admin/customers/accounts'} />
                </Link>
              )}

              {sidebarConfig['CBC'] !== false && isAdmin && (
                <Link href="/admin/cbc" className={`sidebar-link ${(pathname === '/admin/cbc') ? "active" : ""}`} style={navItemStyle(pathname === '/admin/cbc')}>
                  <FileCheck size={18} />
                  {t('kycReview')}
                  <NavChevron isActive={pathname === '/admin/cbc'} />
                </Link>
              )}
            </div>
          </div>

          {/* LOANS Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', paddingLeft: '0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('sectionLoans')}</div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {sidebarConfig['LOS Pipeline'] !== false && (
                <Link href="/admin/los" className={`sidebar-link ${(pathname === '/admin/los' || pathname?.startsWith('/admin/los/')) ? "active" : ""}`} style={navItemStyle(pathname === '/admin/los' || pathname?.startsWith('/admin/los/'))}>
                  <Landmark size={18} />
                  {t('loansNav')}
                  <NavChevron isActive={pathname === '/admin/los' || pathname?.startsWith('/admin/los/')} />
                </Link>
              )}

              {sidebarConfig['New Application'] !== false && isLoanOfficer && (
                <Link href="/admin/loans/new" className={`sidebar-link ${(pathname === '/admin/loans/new') ? "active" : ""}`} style={navItemStyle(pathname === '/admin/loans/new')}>
                  <FileText size={18} />
                  {t('applyForLoan')}
                  <NavChevron isActive={pathname === '/admin/loans/new'} />
                </Link>
              )}

              {sidebarConfig['Underwriting'] !== false && isAdmin && (
                <Link href="/admin/underwriting" className={`sidebar-link ${(pathname === '/admin/underwriting') ? "active" : ""}`} style={navItemStyle(pathname === '/admin/underwriting')}>
                  <CheckSquare size={18} />
                  {t('approvals')}
                  <NavChevron isActive={pathname === '/admin/underwriting'} />
                </Link>
              )}

              {sidebarConfig['Reminders'] !== false && isLoanOfficer && (
                <Link href="/admin/alerts" className={`sidebar-link ${(pathname === '/admin/alerts') ? "active" : ""}`} style={navItemStyle(pathname === '/admin/alerts')}>
                  <Bell size={18} />
                  Reminders
                  <NavChevron isActive={pathname === '/admin/alerts'} />
                </Link>
              )}

              {sidebarConfig['Loan Product'] !== false && isAdmin && (
                <Link href="/admin/products" className={`sidebar-link ${(pathname === '/admin/products') ? "active" : ""}`} style={navItemStyle(pathname === '/admin/products')}>
                  <Box size={18} />
                  {t('loanProduct')}
                  <NavChevron isActive={pathname === '/admin/products'} />
                </Link>
              )}
            </div>
          </div>

          {/* OPERATIONS Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', paddingLeft: '0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('sectionOperations')}</div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {sidebarConfig['Customer'] !== false && isTeller && (
                <Link href="/admin/customers/repayments" className={`sidebar-link ${(pathname === '/admin/customers/repayments') ? "active" : ""}`} style={navItemStyle(pathname === '/admin/customers/repayments')}>
                  <CreditCard size={18} />
                  {t('repaymentsNav')}
                  <NavChevron isActive={pathname === '/admin/customers/repayments'} />
                </Link>
              )}


            </div>
          </div>

          {/* REPORTS Section */}
          {canViewReports && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', paddingLeft: '0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('sectionReports')}</div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>

                {sidebarConfig['Report'] !== false && (
                  <>
                    <Link href="/admin/report" className={`sidebar-link ${(pathname === '/admin/report') ? "active" : ""}`} style={navItemStyle(pathname === '/admin/report')}>
                      <BarChart2 size={18} />
                      {t('analyticsMenu')}
                      <NavChevron isActive={pathname === '/admin/report'} />
                    </Link>
                    <Link href="/admin/report/credit-officer" className={`sidebar-link ${(pathname === '/admin/report/credit-officer') ? "active" : ""}`} style={navItemStyle(pathname === '/admin/report/credit-officer')}>
                      <Users size={18} />
                      {t('creditOfficerPortfolio')}
                      <NavChevron isActive={pathname === '/admin/report/credit-officer'} />
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}

            {isAccountant && (
              <>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', marginTop: '1.5rem', paddingLeft: '0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('sectionAccounting')}</div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Accounting Hub */}
                  <Link href="/admin/accounting" className={`sidebar-link ${pathname === '/admin/accounting' ? 'active' : ''}`} style={{ ...navItemStyle(pathname === '/admin/accounting') }}>
                    <BookOpen size={18} /> Accounting Hub
                    <NavChevron isActive={pathname === '/admin/accounting'} />
                  </Link>

                  {/* SOD/EOD */}
                  <Link href="/admin/period" className={`sidebar-link ${pathname === '/admin/period' ? 'active' : ''}`} style={{ ...navItemStyle(pathname === '/admin/period') }}>
                    <Clock size={18} /> {t('sodEodPanel')}
                    <NavChevron isActive={pathname === '/admin/period'} />
                  </Link>
                </div>
              </>
            )}


        </nav>

        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>
          Acabar Plc Admin <span style={{ float: 'right', color: 'var(--text-muted)' }}>v1.0.0</span>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header - Glassmorphism */}
        <header className="glass sticky top-0 h-[72px] flex items-center justify-between md:justify-end px-4 md:px-10 z-30">
          
          <button 
            className="md:hidden p-2 rounded-md hover:bg-[var(--bg-muted)] text-[var(--text-muted-dark)]"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>

            <button
              onClick={() => setLanguage(language === 'en' ? 'kh' : language === 'kh' ? 'ko' : 'en')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40px', padding: '0 0.5rem', borderRadius: '8px', transition: 'background-color var(--transition-fast)', gap: '0.375rem' }} 
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-muted)'} 
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Switch language"
            >
              <Globe size={20} color="var(--text-muted-dark)" />
              <span style={{ color: 'var(--text-muted-dark)', fontSize: '0.875rem', fontWeight: '700', textTransform: 'uppercase' }}>{language}</span>
            </button>

            <button 
              onClick={toggleTheme}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', transition: 'background-color var(--transition-fast)' }} 
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-muted)'} 
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Toggle theme"
            >
              {isDarkMode ? <Sun size={20} color="var(--text-muted-dark)" /> : <Moon size={20} color="var(--text-muted-dark)" />}
            </button>

            <button style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', transition: 'background-color var(--transition-fast)' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-muted)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              <Bell size={20} color="var(--text-muted-dark)" />
              <span style={{ position: 'absolute', top: '8px', right: '10px', width: '8px', height: '8px', backgroundColor: 'var(--error-text)', borderRadius: '50%', border: '2px solid white' }}></span>
            </button>

            <div ref={profileRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '0.5rem', borderRadius: 'var(--radius-md)', transition: 'background-color var(--transition-fast)' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-muted)'}
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
                      backgroundColor: user?.roles?.[0] === 'SUPER_ADMIN' ? 'var(--warning-bg)' : 'var(--bg-muted)',
                      color: user?.roles?.[0] === 'SUPER_ADMIN' ? 'var(--warning-text)' : 'var(--text-muted-dark)',
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
                <div style={{ position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0, width: '260px', backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-color)', zIndex: 50, overflow: 'hidden', animation: 'fadeIn 0.2s ease-out' }}>
                  <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--background)' }}>
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
                      onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-muted)'; e.currentTarget.style.color = 'var(--foreground)' }} 
                      onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted-dark)' }}
                    >
                      {t('profile')}
                    </button>
                    <button 
                      onClick={() => { setIsSettingsOpen(true); setSettingsTab('Security'); setIsProfileOpen(false); }}
                      style={{ width: '100%', textAlign: 'left', display: 'block', padding: '0.5rem 1rem', fontSize: '0.875rem', color: 'var(--text-muted-dark)', textDecoration: 'none', borderRadius: 'var(--radius-md)', transition: 'all var(--transition-fast)', background: 'none', border: 'none', cursor: 'pointer' }} 
                      onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-muted)'; e.currentTarget.style.color = 'var(--foreground)' }} 
                      onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted-dark)' }}
                    >
                      {t('settings')}
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
                      {t('signOut')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
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
        :root {
          --nav-bg: #ffffff;
          --nav-text: #475569;
          --nav-text-active: #16a34a;
          --nav-border: #e2e8f0;
          --nav-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .dark {
          --nav-bg: #1e293b;
          --nav-text: #94a3b8;
          --nav-text-active: #22c55e;
          --nav-border: #334155;
          --nav-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .sidebar-link:hover {
          background-color: var(--nav-bg) !important;
          opacity: 0.9;
          color: var(--nav-text-active) !important;
        }
        .sidebar-link > svg {
          color: #22c55e;
        }
        .sidebar-link.active {
          color: var(--nav-text-active) !important;
          font-weight: 700 !important;
        }
        .sidebar-link.active > svg {
          color: var(--nav-text-active) !important;
        }
      `}} />
    </div>
  );
}
