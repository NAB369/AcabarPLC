'use client';

import { useState } from 'react';
import { api } from '@/services/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, CreditCard, ChevronLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { pageTranslations } from '../pageTranslations';

export default function LoginPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = (key: keyof typeof pageTranslations.en) => {
    return pageTranslations[language as keyof typeof pageTranslations]?.[key] || pageTranslations.en[key] || key;
  };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const data = await api.post('/auth/login', { email, password });
      
      if (data.mfaRequired) {
        setMfaRequired(true);
        setMfaToken(data.mfaToken);
        setIsLoading(false);
        return;
      }

      saveAuth(data);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await api.post('/auth/verify-mfa', { code: otpCode }, {
        headers: { Authorization: `Bearer ${mfaToken}` }
      });
      saveAuth(data);
    } catch (err: any) {
      setError(err.message || 'Invalid OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveAuth = (data: any) => {
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    const roles = data.user.roles || [];
    if (roles.includes('SUPER_ADMIN') || roles.includes('LOAN_OFFICER') || roles.includes('BRANCH_MANAGER') || roles.includes('CREDIT_OFFICER') || roles.includes('ACCOUNTANT')) {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>

      {/* Right Side: Login Form */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '2rem',
        position: 'relative'
      }}>
        <Link href="/" style={{ position: 'absolute', top: '2rem', left: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '500' }} className="hover-primary">
          <ChevronLeft size={16} />
          {t('backToHome')}
        </Link>

        <div style={{ width: '100%', maxWidth: '420px' }} className="animate-slide-up">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Acabar Plc</h1>
            <p style={{ color: 'var(--text-muted)' }}>{t('enterCredentials')}</p>
          </div>

          {error && (
            <div style={{ 
              backgroundColor: 'var(--error-bg)', 
              color: 'var(--error-text)', 
              padding: '1rem', 
              borderRadius: 'var(--radius-md)', 
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              border: '1px solid var(--error-border)'
            }}>
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {!mfaRequired ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">{t('emailAddress')}</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                  <input 
                    type="email" 
                    className="input-field" 
                    style={{ paddingLeft: '2.75rem', width: '100%' }}
                    placeholder=""
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">{t('password')}</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    className="input-field" 
                    style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem', width: '100%' }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ accentColor: 'var(--primary)' }} />
                  {t('keepSignedIn')}
                </label>
                <Link href="#" style={{ fontSize: '0.875rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>
                  {t('forgotPassword')}
                </Link>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', marginTop: '1rem', height: '52px' }}
                disabled={isLoading}
              >
                {isLoading ? t('authenticating') : (
                  <>
                    {t('login')}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleMfaVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                   <ShieldCheck size={32} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>{t('twoStepVerif')}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{t('enterCode')}</p>
              </div>

              <div className="input-group">
                <input 
                  type="text" 
                  className="input-field" 
                  style={{ textAlign: 'center', fontSize: '2rem', letterSpacing: '0.5em', height: '64px' }}
                  placeholder="000000"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  autoFocus
                  required 
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', height: '52px' }}
                disabled={isLoading}
              >
                {isLoading ? t('verifying') : t('verifyContinue')}
              </button>

              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ width: '100%' }}
                onClick={() => setMfaRequired(false)}
              >
                {t('cancel')}
              </button>
            </form>
          )}

          <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {t('needAccount')} <Link href="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>{t('requestAccess')}</Link>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @media (max-width: 1024px) {
          .hide-on-mobile { display: none !important; }
        }
        .hover-primary:hover { color: var(--primary) !important; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}

// Simple helper component for errors
function AlertCircle({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  );
}
