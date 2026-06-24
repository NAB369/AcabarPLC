'use client';

import { useState } from 'react';
import { api } from '@/services/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, ArrowRight, ShieldCheck, CreditCard, ChevronLeft, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { pageTranslations } from '../pageTranslations';

export default function RegisterPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = (key: keyof typeof pageTranslations.en) => {
    return pageTranslations[language as keyof typeof pageTranslations]?.[key] || pageTranslations.en[key] || key;
  };
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [requestedRole, setRequestedRole] = useState('CUSTOMER');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await api.post('/auth/register', { 
        firstName, 
        lastName, 
        email, 
        password,
        requestedRole
      });
      
      setSuccess(true);
      // Removed auto-login redirect because account requires admin approval.
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>

      {/* Right Side: Registration Form */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '2rem',
        position: 'relative'
      }}>
        <Link href="/login" style={{ position: 'absolute', top: '2rem', left: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '500' }} className="hover-primary">
          <ChevronLeft size={16} />
          {t('backToLogin')}
        </Link>

        <div style={{ width: '100%', maxWidth: '420px' }} className="animate-slide-up">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>{t('createAccount')}</h1>
            <p style={{ color: 'var(--text-muted)' }}>{t('joinNetwork')}</p>
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

          {success && (
            <div style={{ 
              backgroundColor: 'var(--success-bg)', 
              color: 'var(--success-text)', 
              padding: '1rem', 
              borderRadius: 'var(--radius-md)', 
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              border: '1px solid var(--success-border)'
            }}>
              <ShieldCheck size={18} />
              {t('regSuccess')}
            </div>
          )}

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="input-group" style={{ marginBottom: 0, flex: 1 }}>
                <label className="input-label">{t('firstName')}</label>
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                  <input 
                    type="text" 
                    className="input-field" 
                    style={{ paddingLeft: '2.75rem', width: '100%' }}
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required 
                  />
                </div>
              </div>
              <div className="input-group" style={{ marginBottom: 0, flex: 1 }}>
                <label className="input-label">{t('lastName')}</label>
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                  <input 
                    type="text" 
                    className="input-field" 
                    style={{ paddingLeft: '2.75rem', width: '100%' }}
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required 
                  />
                </div>
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">{t('emailAddress')}</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                <input 
                  type="email" 
                  className="input-field" 
                  style={{ paddingLeft: '2.75rem', width: '100%' }}
                  placeholder="name@company.com"
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
                  type="password" 
                  className="input-field" 
                  style={{ paddingLeft: '2.75rem', width: '100%' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{t('min8Chars')}</p>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">{t('requestedRole')}</label>
              <div style={{ position: 'relative' }}>
                <select 
                  className="input-field" 
                  style={{ width: '100%' }}
                  value={requestedRole}
                  onChange={(e) => setRequestedRole(e.target.value)}
                  required
                >
                  <option value="CUSTOMER">{t('roleCustomer')}</option>
                  <option value="CREDIT_OFFICER">{t('roleCreditOfficer')}</option>
                  <option value="ACCOUNTANT">{t('roleAccountant')}</option>
                  <option value="BRANCH_MANAGER">{t('roleBranchManager')}</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', marginTop: '1rem', height: '52px' }}
              disabled={isLoading || success}
            >
              {isLoading ? t('creatingAccount') : (
                <>
                  {t('createAccount')}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {t('alreadyHaveAccount')} <Link href="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>{t('signInInstead')}</Link>
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
        .animate-slide-up {
          animation: slideUp 0.6s ease-out forwards;
        }
      `}} />
    </div>
  );
}
