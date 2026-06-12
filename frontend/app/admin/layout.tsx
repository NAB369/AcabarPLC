'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search, Bell, FileText, Users, MessageSquare,
  Star, Gift, CreditCard, Box, Settings, ChevronDown,
  GitPullRequest, Shield, LogOut, MapPin, Webhook, FileSpreadsheet, BarChart2,
  Sun, Moon, Clock, BookOpen, LayoutList, TrendingUp, TrendingDown,
  ArrowLeftRight, PenLine, BarChart3, Scale, BookMarked, ChevronRight,
  FileCheck, Landmark, CheckSquare, Briefcase, Menu, X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import SettingsModal from '@/components/SettingsModal';
import UserProfileModal from '@/components/UserProfileModal';
import { api } from '@/services/api';
import { useLanguage } from '@/context/LanguageContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();

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
  const profileRef = useRef<HTMLDivElement>(null);

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
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
    padding: '0.625rem 0.875rem',
    borderRadius: 'var(--radius-md)',
    backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
    color: isActive ? 'var(--primary)' : 'var(--text-muted-dark)',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: isActive ? '600' : '500',
    transition: 'all 0.2s ease',
  });

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
              <span style={{ fontWeight: '500', fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', marginTop: '1px' }}>អាខាបារ ម.ក</span>
            </div>
          </div>
          <button className="md:hidden text-white/80 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {/* CUSTOMERS Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', paddingLeft: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('sectionCustomers')}</div>
            
            <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '0.25rem', boxShadow: '0 1px 2px rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {sidebarConfig['Customer'] !== false && (
                <Link href="/admin/customers/accounts" className="sidebar-link" style={navItemStyle(pathname === '/admin/customers/accounts')}>
                  <Users size={18} />
                  {t('customer')}
                </Link>
              )}

              {sidebarConfig['CBC'] !== false && (
                <Link href="/admin/cbc" className="sidebar-link" style={navItemStyle(pathname === '/admin/cbc')}>
                  <FileCheck size={18} />
                  {t('kycReview')}
                </Link>
              )}
            </div>
          </div>

          {/* LOANS Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', paddingLeft: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('sectionLoans')}</div>

            <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '0.25rem', boxShadow: '0 1px 2px rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {sidebarConfig['LOS Pipeline'] !== false && (
                <Link href="/admin/los" className="sidebar-link" style={navItemStyle(pathname === '/admin/los' || pathname?.startsWith('/admin/los/'))}>
                  <Landmark size={18} />
                  {t('loansNav')}
                </Link>
              )}

              {sidebarConfig['New Application'] !== false && (
                <Link href="/admin/loans/new" className="sidebar-link" style={navItemStyle(pathname === '/admin/loans/new')}>
                  <FileText size={18} />
                  {t('applyForLoan')}
                </Link>
              )}

              {sidebarConfig['Underwriting'] !== false && (
                <Link href="/admin/underwriting" className="sidebar-link" style={navItemStyle(pathname === '/admin/underwriting')}>
                  <CheckSquare size={18} />
                  {t('approvals')}
                </Link>
              )}

              {sidebarConfig['Loan Product'] !== false && (
                <Link href="/admin/products" className="sidebar-link" style={navItemStyle(pathname === '/admin/products')}>
                  <Box size={18} />
                  {t('loanProduct')}
                </Link>
              )}
            </div>
          </div>

          {/* OPERATIONS Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', paddingLeft: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('sectionOperations')}</div>

            <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '0.25rem', boxShadow: '0 1px 2px rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {sidebarConfig['Customer'] !== false && (
                <Link href="/admin/customers/repayments" className="sidebar-link" style={navItemStyle(pathname === '/admin/customers/repayments')}>
                  <CreditCard size={18} />
                  {t('repaymentsNav')}
                </Link>
              )}

              {sidebarConfig['Bank Statement'] !== false && (
                <Link href="/admin/bank-statement" className="sidebar-link" style={navItemStyle(pathname === '/admin/bank-statement')}>
                  <Briefcase size={18} />
                  {t('collectionsNav')}
                </Link>
              )}
            </div>
          </div>

          {/* REPORTS Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', paddingLeft: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('sectionReports')}</div>

            <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '0.25rem', boxShadow: '0 1px 2px rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {sidebarConfig['Dashboard'] !== false && (
                <Link href="/admin" className="sidebar-link" style={navItemStyle(pathname === '/admin')}>
                  <BarChart3 size={18} />
                  {t('dashboard')}
                </Link>
              )}

              {sidebarConfig['Report'] !== false && (
                <>
                  <Link href="/admin/report" className="sidebar-link" style={navItemStyle(pathname === '/admin/report')}>
                    <BarChart2 size={18} />
                    {t('analyticsMenu')}
                  </Link>
                  <Link href="/admin/report/credit-officer" className="sidebar-link" style={navItemStyle(pathname === '/admin/report/credit-officer')}>
                    <Users size={18} />
                    {t('creditOfficerPortfolio')}
                  </Link>
                </>
              )}
            </div>
          </div>

            {isAccountant && (
              <>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', marginTop: '1.5rem', paddingLeft: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('sectionAccounting')}</div>

                {/* Collapsible Accounting Menu */}
                <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', padding: '0.25rem', boxShadow: '0 1px 2px rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div
                    onClick={() => setIsAccountingOpen(!isAccountingOpen)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0.875rem', color: pathname?.startsWith('/admin/accounting') || pathname?.startsWith('/admin/period') ? 'var(--primary)' : 'var(--text-muted-dark)', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', borderRadius: '8px', backgroundColor: isAccountingOpen ? 'var(--primary-light)' : 'transparent' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <BookMarked size={18} /> {t('accountingModule')}
                    </div>
                    <ChevronDown size={14} style={{ transform: isAccountingOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                  </div>

                {isAccountingOpen && (
                  <div style={{ paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.125rem', marginTop: '0.25rem' }}>

                    {/* SOD/EOD */}
                    <Link href="/admin/period" className="sidebar-link" style={{ ...navItemStyle(pathname === '/admin/period'), paddingLeft: '0.625rem', fontSize: '0.8125rem' }}>
                      <Clock size={15} /> {t('sodEodPanel')}
                    </Link>

                    {/* Chart of Accounts */}
                    <Link href="/admin/accounting/accounts" className="sidebar-link" style={{ ...navItemStyle(pathname === '/admin/accounting/accounts'), paddingLeft: '0.625rem', fontSize: '0.8125rem' }}>
                      <LayoutList size={15} /> {t('chartOfAccounts')}
                    </Link>

                    {/* Transactions sub-section */}
                    <div style={{ fontSize: '0.6875rem', fontWeight: '800', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '0.125rem', paddingLeft: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('transactionsMenu')}</div>

                    <Link href="/admin/accounting/journal" className="sidebar-link" style={{ ...navItemStyle(pathname === '/admin/accounting/journal'), paddingLeft: '0.625rem', fontSize: '0.8125rem' }}>
                      <BookOpen size={15} /> {t('journalEntry')}
                    </Link>
                    <Link href="/admin/accounting/income" className="sidebar-link" style={{ ...navItemStyle(pathname === '/admin/accounting/income'), paddingLeft: '0.625rem', fontSize: '0.8125rem' }}>
                      <TrendingUp size={15} /> {t('incomeEntry')}
                    </Link>
                    <Link href="/admin/accounting/expense" className="sidebar-link" style={{ ...navItemStyle(pathname === '/admin/accounting/expense'), paddingLeft: '0.625rem', fontSize: '0.8125rem' }}>
                      <TrendingDown size={15} /> {t('expenseEntry')}
                    </Link>
                    <Link href="/admin/accounting/transfer" className="sidebar-link" style={{ ...navItemStyle(pathname === '/admin/accounting/transfer'), paddingLeft: '0.625rem', fontSize: '0.8125rem' }}>
                      <ArrowLeftRight size={15} /> {t('cashTransfer')}
                    </Link>
                    <Link href="/admin/accounting/single" className="sidebar-link" style={{ ...navItemStyle(pathname === '/admin/accounting/single'), paddingLeft: '0.625rem', fontSize: '0.8125rem' }}>
                      <PenLine size={15} /> {t('singleEntry')}
                    </Link>

                    {/* Reports sub-section */}
                    <div style={{ fontSize: '0.6875rem', fontWeight: '800', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '0.125rem', paddingLeft: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('sectionReports')}</div>

                    <Link href="/admin/accounting/reports" className="sidebar-link" style={{ ...navItemStyle(pathname === '/admin/accounting/reports'), paddingLeft: '0.625rem', fontSize: '0.8125rem' }}>
                      <BookOpen size={15} /> {t('trialBalance')}
                    </Link>
                    <Link href="/admin/accounting/reports/profit-loss" className="sidebar-link" style={{ ...navItemStyle(pathname === '/admin/accounting/reports/profit-loss'), paddingLeft: '0.625rem', fontSize: '0.8125rem' }}>
                      <BarChart3 size={15} /> {t('profitAndLoss')}
                    </Link>
                    <Link href="/admin/accounting/reports/balance-sheet" className="sidebar-link" style={{ ...navItemStyle(pathname === '/admin/accounting/reports/balance-sheet'), paddingLeft: '0.625rem', fontSize: '0.8125rem' }}>
                      <Scale size={15} /> {t('balanceSheet')}
                    </Link>
                    <Link href="/admin/accounting/reports/ledger" className="sidebar-link" style={{ ...navItemStyle(pathname === '/admin/accounting/reports/ledger'), paddingLeft: '0.625rem', fontSize: '0.8125rem' }}>
                      <FileText size={15} /> {t('accountLedger')}
                    </Link>
                  </div>
                )}
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
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
