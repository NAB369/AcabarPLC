'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, Check, ShieldCheck, HeartHandshake, PhoneCall, Sun, Moon, Globe } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/context/LanguageContext';
import { pageTranslations } from './pageTranslations';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { language, setLanguage } = useLanguage();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const t = (key: keyof typeof pageTranslations.en) => {
    return pageTranslations[language as keyof typeof pageTranslations]?.[key] || pageTranslations.en[key] || key;
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted && (theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches));

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <div className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans antialiased min-h-screen transition-colors duration-300">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3.5" aria-label="Acabar Plc home">
            <img src="/acabar-logo.png" className="h-12 w-12 rounded-full object-cover" alt="Acabar PLC Logo" />
            <div className="flex flex-col justify-center leading-none">
              <span className="text-lg font-extrabold text-brand-dark dark:text-white tracking-wide">Acabar Plc</span>
              <span className="text-xs text-brand-muted dark:text-slate-400 font-medium mt-1">{t('acabarSubtitle')}</span>
            </div>
          </a>

          {/* Nav Links - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-brand-accent dark:hover:text-brand-accent transition-colors font-medium">{t('home')}</a>
            <a href="#services" className="text-slate-600 dark:text-slate-300 hover:text-brand-accent dark:hover:text-brand-accent transition-colors font-medium">{t('services')}</a>
            <a href="#advantages" className="text-slate-600 dark:text-slate-300 hover:text-brand-accent dark:hover:text-brand-accent transition-colors font-medium">{t('whyChooseUs')}</a>
            <a href="#contact" className="text-slate-600 dark:text-slate-300 hover:text-brand-accent dark:hover:text-brand-accent transition-colors font-medium">{t('contact')}</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg text-slate-500 hover:text-brand-accent dark:text-slate-400 dark:hover:text-brand-accent hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <div className="relative">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="p-2.5 flex items-center gap-1 rounded-lg text-slate-500 hover:text-brand-accent dark:text-slate-400 dark:hover:text-brand-accent hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors font-semibold text-sm"
              >
                <Globe size={18} />
                <span className="uppercase">{language}</span>
              </button>
              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 border border-slate-200 dark:border-slate-700 z-50">
                  <button onClick={() => { setLanguage('en'); setIsLangMenuOpen(false); }} className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 ${language === 'en' ? 'text-brand-accent font-semibold' : 'text-slate-700 dark:text-slate-300'}`}>English</button>
                  <button onClick={() => { setLanguage('kh'); setIsLangMenuOpen(false); }} className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 ${language === 'kh' ? 'text-brand-accent font-semibold' : 'text-slate-700 dark:text-slate-300'}`}>ខ្មែរ</button>
                  <button onClick={() => { setLanguage('ko'); setIsLangMenuOpen(false); }} className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 ${language === 'ko' ? 'text-brand-accent font-semibold' : 'text-slate-700 dark:text-slate-300'}`}>한국어</button>
                </div>
              )}
            </div>

            <Link href="/login" className="text-slate-600 dark:text-slate-300 dark:hover:text-white transition-colors font-semibold text-sm ml-2">
              {t('login')}
            </Link>
            <Link href="/register" className="inline-flex items-center justify-center px-5 py-2.5 bg-brand-accent text-white rounded-lg text-sm font-semibold hover:bg-brand-accentHover transition-all shadow-sm">
              {t('getStarted')}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={() => setLanguage(language === 'en' ? 'kh' : language === 'kh' ? 'ko' : 'en')}
              className="p-2 rounded-lg text-slate-500 hover:text-brand-accent dark:text-slate-400 dark:hover:text-brand-accent hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors uppercase text-xs font-bold flex items-center gap-1"
            >
              <Globe size={16} /> {language}
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-brand-accent dark:text-slate-400 dark:hover:text-brand-accent hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="text-slate-600 dark:text-slate-300 hover:text-brand-dark dark:hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-6 py-4 space-y-4">
            <a 
              href="#" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-700 dark:text-slate-300 hover:text-brand-accent font-medium"
            >
              {t('home')}
            </a>
            <a 
              href="#services" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-700 dark:text-slate-300 hover:text-brand-accent font-medium"
            >
              {t('services')}
            </a>
            <a 
              href="#advantages" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-700 dark:text-slate-300 hover:text-brand-accent font-medium"
            >
              {t('whyChooseUs')}
            </a>
            <a 
              href="#contact" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-700 dark:text-slate-300 hover:text-brand-accent font-medium"
            >
              {t('contact')}
            </a>
            <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800 pt-4">
              <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">{t('darkMode')}</span>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-500 hover:text-brand-accent dark:text-slate-400 dark:hover:text-brand-accent hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
            <Link 
              href="/login" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center w-full py-3 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
            >
              {t('login')}
            </Link>
            <Link 
              href="/register" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center w-full py-3 bg-brand-accent text-white rounded-lg text-sm font-semibold hover:bg-brand-accentHover transition-all"
            >
              {t('getStarted')}
            </Link>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden bg-gradient-to-b from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-7 max-w-3xl">
              <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-brand-accent dark:text-emerald-400 mb-6 border border-emerald-200/60 dark:border-emerald-800/40">
                {t('heroBadge')}
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-brand-dark dark:text-white tracking-wide leading-snug mb-6">
                {t('heroTitleLine1')} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-dark dark:from-white to-brand-accent dark:to-emerald-400">{t('heroTitleLine2')}</span>
              </h1>
              <p className="text-brand-muted dark:text-slate-400 text-sm md:text-base leading-relaxed mb-8 max-w-2xl">
                {t('heroDesc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#contact" className="inline-flex items-center justify-center px-6 py-3.5 bg-brand-accent hover:bg-brand-accentHover text-white rounded-lg text-sm font-semibold transition-all shadow-md">
                  {t('requestConsultation')}
                </a>
                <a href="#services" className="inline-flex items-center justify-center px-6 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-brand-dark dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm font-semibold transition-all">
                  {t('learnAboutServices')}
                </a>
              </div>
            </div>
            
            <div className="md:col-span-5 hidden md:block">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl relative transition-colors duration-300">
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-4">{t('highSecurity')}</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-emerald-100 dark:bg-emerald-950/50 text-brand-accent rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={14} />
                    </div>
                    <span className="text-xs text-slate-700 dark:text-slate-300">{t('legallyAuthorized')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-emerald-100 dark:bg-emerald-950/50 text-brand-accent rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={14} />
                    </div>
                    <span className="text-xs text-slate-700 dark:text-slate-300">{t('lowInterest')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-emerald-100 dark:bg-emerald-950/50 text-brand-accent rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={14} />
                    </div>
                    <span className="text-xs text-slate-700 dark:text-slate-300">{t('maintainConfidentiality')}</span>
                  </div>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 mt-6 pt-6 flex justify-between items-center">
                  <div>
                    <div className="text-sm font-bold text-brand-dark dark:text-white">+855 012778875</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">{t('contactConsultation')}</div>
                  </div>
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/50 text-brand-accent rounded-lg flex items-center justify-center">
                    <PhoneCall size={20} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-accent dark:text-emerald-400">{t('ourServices')}</span>
            <h2 className="text-2xl md:text-4xl font-bold text-brand-dark dark:text-white mt-3 mb-4">{t('creditSolutions')}</h2>
            <p className="text-brand-muted dark:text-slate-400 text-sm leading-relaxed">
              {t('servicesDesc')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg flex items-center justify-center mb-6 text-brand-accent">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 14v2m0-18a2 2 0 100 4 2 2 0 000-4zm0 18a2 2 0 100 4 2 2 0 000-4zm0-12a6 6 0 100 12 6 6 0 000-12z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-3">{t('bizLoan')}</h3>
              <p className="text-brand-muted dark:text-slate-400 text-sm leading-relaxed">
                {t('bizLoanDesc')}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg flex items-center justify-center mb-6 text-brand-accent">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" /></svg>
              </div>
              <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-3">{t('securedLoan')}</h3>
              <p className="text-brand-muted dark:text-slate-400 text-sm leading-relaxed">
                {t('securedLoanDesc')}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg flex items-center justify-center mb-6 text-brand-accent">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-3">{t('debtRestructuring')}</h3>
              <p className="text-brand-muted dark:text-slate-400 text-sm leading-relaxed">
                {t('debtRestructuringDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section id="advantages" className="py-20 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-accent dark:text-emerald-400">{t('whyChooseUs')}</span>
              <h2 className="text-2xl md:text-4xl font-bold text-brand-dark dark:text-white mt-3 mb-6">{t('mostTrusted')}</h2>
              <p className="text-brand-muted dark:text-slate-400 text-sm leading-relaxed mb-6">
                {t('whyChooseUsDesc')}
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-950/50 text-brand-accent rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-dark dark:text-slate-200 text-sm">{t('legalTransparent')}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{t('legalTransparentDesc')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-950/50 text-brand-accent rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-dark dark:text-slate-200 text-sm">{t('lowInterest')}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{t('lowInterestDesc')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-950/50 text-brand-accent rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-dark dark:text-slate-200 text-sm">{t('freeDiscussion')}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{t('freeDiscussionDesc')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-8 rounded-xl shadow-sm transition-colors duration-300">
              <div className="text-center max-w-sm mx-auto">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/50 text-brand-accent rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-3">{t('dataSecurity')}</h3>
                <p className="text-brand-muted dark:text-slate-400 text-xs leading-relaxed mb-6">
                  {t('dataSecurityDesc')}
                </p>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-6 flex justify-around">
                  <div>
                    <div className="text-xl font-bold text-brand-dark dark:text-white">100%</div>
                    <div className="text-slate-400 dark:text-slate-500 text-[10px] uppercase mt-1">{t('legal')}</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-brand-dark dark:text-white">24/7</div>
                    <div className="text-slate-400 dark:text-slate-500 text-[10px] uppercase mt-1">{t('support')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section id="contact" className="py-20 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 md:p-12 shadow-xl transition-colors duration-300">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-brand-dark dark:text-white tracking-tight mb-3">{t('connectExperts')}</h2>
              <p className="text-brand-muted dark:text-slate-400 text-sm">
                {t('formDesc')}
              </p>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">{t('fullName')}</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-accent transition-colors" 
                    placeholder={t('fullNamePlaceholder')} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">{t('phone')}</label>
                  <input 
                    type="tel" 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-accent transition-colors" 
                    placeholder={t('phonePlaceholder')} 
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">{t('companyName')}</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-accent transition-colors" 
                    placeholder={t('companyPlaceholder')} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">{t('serviceInterest')}</label>
                  <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-brand-accent transition-colors text-slate-500 dark:text-slate-200">
                    <option>{t('bizLoan')}</option>
                    <option>{t('securedLoan')}</option>
                    <option>{t('debtRestructuring')}</option>
                    <option>{t('otherServices')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">{t('describeNeeds')}</label>
                <textarea 
                  rows={4} 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-accent transition-colors" 
                  placeholder={t('describeNeedsPlaceholder')}
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="w-full py-4 bg-brand-dark dark:bg-brand-accent dark:hover:bg-brand-accentHover text-white rounded-lg font-semibold hover:bg-slate-800 transition-all text-sm shadow-md"
              >
                {t('submitRequest')}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-dark dark:bg-slate-950 text-slate-400 dark:text-slate-500 text-xs py-12 border-t border-slate-800 dark:border-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3.5 mb-4">
                <img src="/acabar-logo.png" className="h-10 w-10 rounded-full object-cover" alt="Acabar PLC Logo" />
                <div className="flex flex-col justify-center leading-none">
                  <span className="text-base font-extrabold text-white tracking-wide">Acabar Plc</span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1.5">{t('acabarSubtitle')}</span>
                </div>
              </div>
              <p className="leading-relaxed">
                {t('heroDesc')}
              </p>
            </div>
            <div>
              <h4 className="text-white dark:text-slate-300 font-semibold uppercase tracking-wider mb-3">{t('regulations')}</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white dark:hover:text-slate-300 transition-colors">{t('legalFramework')}</a></li>
                <li><a href="#" className="hover:text-white dark:hover:text-slate-300 transition-colors">{t('finCompliance')}</a></li>
                <li><a href="#" className="hover:text-white dark:hover:text-slate-300 transition-colors">{t('customerProtection')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white dark:text-slate-300 font-semibold uppercase tracking-wider mb-3">{t('officeLocation')}</h4>
              <p className="leading-relaxed">
                {t('address')}<br />
                {t('phoneFooter')}<br />
                {t('emailFooter')}
              </p>
            </div>
          </div>
          <div className="border-t border-slate-800 dark:border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 dark:text-slate-600">
            <p>{t('allRightsReserved')}</p>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-slate-400 dark:hover:text-slate-300 transition-colors">{t('privacyPolicy')}</a>
              <a href="#" className="hover:text-slate-400 dark:hover:text-slate-300 transition-colors">{t('termsOfUse')}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
