'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, Check, ShieldCheck, HeartHandshake, PhoneCall, Sun, Moon } from 'lucide-react';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Sync state with DOM on mount
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
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

  return (
    <div className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans antialiased min-h-screen transition-colors duration-300">
      {/* Header / មេនុយចម្បង */}
      <header className="fixed top-0 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3.5" aria-label="Acabar Plc home">
            <img src="/acabar-logo.png" className="h-12 w-12 rounded-full object-cover" alt="Acabar PLC Logo" />
            <div className="flex flex-col justify-center leading-none">
              <span className="text-lg font-extrabold text-brand-dark dark:text-white tracking-wide">Acabar Plc</span>
              <span className="text-xs text-brand-muted dark:text-slate-400 font-medium mt-1">អាខាបារ ម.ក</span>
            </div>
          </a>

          {/* Nav Links - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-brand-accent dark:hover:text-brand-accent transition-colors font-medium">ទំព័រដើម</a>
            <a href="#services" className="text-slate-600 dark:text-slate-300 hover:text-brand-accent dark:hover:text-brand-accent transition-colors font-medium">សេវាកម្ម</a>
            <a href="#advantages" className="text-slate-600 dark:text-slate-300 hover:text-brand-accent dark:hover:text-brand-accent transition-colors font-medium">ហេតុអ្វីជ្រើសរើសយើង</a>
            <a href="#contact" className="text-slate-600 dark:text-slate-300 hover:text-brand-accent dark:hover:text-brand-accent transition-colors font-medium">ទំនាក់ទំនង</a>
          </nav>

          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg text-slate-500 hover:text-brand-accent dark:text-slate-400 dark:hover:text-brand-accent hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <a href="/login" className="text-slate-600 dark:text-slate-300 dark:hover:text-white transition-colors font-semibold text-sm">
              ចូលប្រើប្រាស់ / Login
            </a>
            <a href="/register" className="inline-flex items-center justify-center px-5 py-2.5 bg-brand-accent text-white rounded-lg text-sm font-semibold hover:bg-brand-accentHover transition-all shadow-sm">
              ចាប់ផ្តើម / Get Started
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-4">
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
              ទំព័រដើម
            </a>
            <a 
              href="#services" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-700 dark:text-slate-300 hover:text-brand-accent font-medium"
            >
              សេវាកម្ម
            </a>
            <a 
              href="#advantages" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-700 dark:text-slate-300 hover:text-brand-accent font-medium"
            >
              ហេតុអ្វីជ្រើសរើសយើង
            </a>
            <a 
              href="#contact" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-700 dark:text-slate-300 hover:text-brand-accent font-medium"
            >
              ទំនាក់ទំនង
            </a>
            <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800 pt-4">
              <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">របៀបយប់ / Dark Mode</span>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-500 hover:text-brand-accent dark:text-slate-400 dark:hover:text-brand-accent hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
            <a 
              href="/login" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center w-full py-3 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
            >
              ចូលប្រើប្រាស់ / Login
            </a>
            <a 
              href="/register" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center w-full py-3 bg-brand-accent text-white rounded-lg text-sm font-semibold hover:bg-brand-accentHover transition-all"
            >
              ចាប់ផ្តើម / Get Started
            </a>
          </div>
        )}
      </header>

      {/* Hero Section / ផ្នែកណែនាំដំបូង */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden bg-gradient-to-b from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-7 max-w-3xl">
              <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-brand-accent dark:text-emerald-400 mb-6 border border-emerald-200/60 dark:border-emerald-800/40">
                សេវាកម្មឥណទាន និងដំណោះស្រាយហិរញ្ញវត្ថុស្របច្បាប់
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-brand-dark dark:text-white tracking-wide leading-snug mb-6">
                ពង្រីកអាជីវកម្មរបស់អ្នក <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-dark dark:from-white to-brand-accent dark:to-emerald-400">ជាមួយដំណោះស្រាយឥណទានដ៏ល្អបំផុត</span>
              </h1>
              <p className="text-brand-muted dark:text-slate-400 text-sm md:text-base leading-relaxed mb-8 max-w-2xl">
                យើងខ្ញុំជាស្ថាប័នប្រឹក្សាយោបល់ហិរញ្ញវត្ថុ និងឥណទានស្របច្បាប់ ដែលជួយសម្រួលការរៀបចំកញ្ចប់ថវិកា និងយុទ្ធសាស្ត្រគ្រប់គ្រងហានិភ័យប្រកបដោយទំនួលខុសត្រូវខ្ពស់។
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#contact" className="inline-flex items-center justify-center px-6 py-3.5 bg-brand-accent hover:bg-brand-accentHover text-white rounded-lg text-sm font-semibold transition-all shadow-md">
                  ស្នើសុំការប្រឹក្សាឥណទាន
                </a>
                <a href="#services" className="inline-flex items-center justify-center px-6 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-brand-dark dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm font-semibold transition-all">
                  ស្វែងយល់ពីសេវាកម្ម
                </a>
              </div>
            </div>
            
            {/* Visual Card on Right Column */}
            <div className="md:col-span-5 hidden md:block">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl relative transition-colors duration-300">
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-4">សុវត្ថិភាពខ្ពស់ និងស្របច្បាប់</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-emerald-100 dark:bg-emerald-950/50 text-brand-accent rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={14} />
                    </div>
                    <span className="text-xs text-slate-700 dark:text-slate-300">ទទួលបានការអនុញ្ញាតស្របច្បាប់</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-emerald-100 dark:bg-emerald-950/50 text-brand-accent rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={14} />
                    </div>
                    <span className="text-xs text-slate-700 dark:text-slate-300">អត្រាការប្រាក់ទាប និងសមរម្យ</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-emerald-100 dark:bg-emerald-950/50 text-brand-accent rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={14} />
                    </div>
                    <span className="text-xs text-slate-700 dark:text-slate-300">រក្សាការសម្ងាត់ព័ត៌មានអតិថិជន</span>
                  </div>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 mt-6 pt-6 flex justify-between items-center">
                  <div>
                    <div className="text-sm font-bold text-brand-dark dark:text-white">+855 012778875</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">ទំនាក់ទំនងប្រឹក្សាយោបល់ឥតគិតថ្លៃ</div>
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

      {/* Services Section / សេវាកម្មរបស់យើង */}
      <section id="services" className="py-20 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-accent dark:text-emerald-400">សេវាកម្មរបស់យើង</span>
            <h2 className="text-2xl md:text-4xl font-bold text-brand-dark dark:text-white mt-3 mb-4">ដំណោះស្រាយឥណទាន និងហិរញ្ញវត្ថុ</h2>
            <p className="text-brand-muted dark:text-slate-400 text-sm leading-relaxed">
              យើងផ្តល់ជូននូវសេវាកម្មប្រឹក្សាយោបល់ហិរញ្ញវត្ថុដ៏សម្បូរបែប ដើម្បីឆ្លើយតបទៅនឹងតម្រូវការអាជីវកម្ម និងផ្ទាល់ខ្លួនរបស់លោកអ្នក។
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg flex items-center justify-center mb-6 text-brand-accent">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 14v2m0-18a2 2 0 100 4 2 2 0 000-4zm0 18a2 2 0 100 4 2 2 0 000-4zm0-12a6 6 0 100 12 6 6 0 000-12z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-3">ឥណទានអាជីវកម្ម (Business Loan)</h3>
              <p className="text-brand-muted dark:text-slate-400 text-sm leading-relaxed">
                ជួយជម្រុញលំហូរទុនបង្វិល និងពង្រីកទំហំអាជីវកម្មរបស់អ្នកខ្នាតតូច និងមធ្យម ជាមួយអត្រាការប្រាក់សមរម្យ និងលក្ខខណ្ឌងាយស្រួល។
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg flex items-center justify-center mb-6 text-brand-accent">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" /></svg>
              </div>
              <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-3">ឥណទានមានទ្រព្យធានា (Secured Loan)</h3>
              <p className="text-brand-muted dark:text-slate-400 text-sm leading-relaxed">
                ទទួលបានទំហំកម្ចីធំ និងរយៈពេលវែងសម្រាប់ការវិនិយោគលើអចលនទ្រព្យ ឬគម្រោងអភិវឌ្ឍន៍ធំៗ ដោយប្រើប្រាស់ប្លង់ដី ឬផ្ទះជាទ្រព្យធានា។
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg flex items-center justify-center mb-6 text-brand-accent">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-3">រៀបចំរចនាសម្ព័ន្ធបំណុលឡើងវិញ (Debt Restructuring)</h3>
              <p className="text-brand-muted dark:text-slate-400 text-sm leading-relaxed">
                ជួយសម្រាលបន្ទុកសងប្រាក់ប្រចាំខែ និងពន្យារពេលសងប្រាក់ ដើម្បីជួយសម្រួលលំហូរសាច់ប្រាក់របស់លោកអ្នកឱ្យមានស្ថិរភាពឡើងវិញ។
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Advantages Section / ហេតុអ្វីជ្រើសរើសយើង */}
      <section id="advantages" className="py-20 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-accent dark:text-emerald-400">ហេតុអ្វីជ្រើសរើសយើង</span>
              <h2 className="text-2xl md:text-4xl font-bold text-brand-dark dark:text-white mt-3 mb-6">ស្ថាប័នប្រឹក្សាឥណទានដែលគួរឱ្យទុកចិត្តបំផុត</h2>
              <p className="text-brand-muted dark:text-slate-400 text-sm leading-relaxed mb-6">
                យើងផ្តល់ជូននូវសេវាកម្មប្រឹក្សាយោបល់ប្រកបដោយវិជ្ជាជីវៈ សុចរិតភាព និងទំនួលខុសត្រូវខ្ពស់ ដើម្បីធានាថាអតិថិជនរបស់យើងទទួលបាននូវដំណោះស្រាយឥណទានដ៏ល្អបំផុត និងសមស្របបំផុត។
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-950/50 text-brand-accent rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-dark dark:text-slate-200 text-sm">សេវាកម្មស្របច្បាប់ និងមានតម្លាភាព</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">រាល់កិច្ចសន្យា និងលក្ខខណ្ឌទាំងអស់ត្រូវបានអនុវត្តស្របតាមច្បាប់ និងមានតម្លាភាពបំផុត។</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-950/50 text-brand-accent rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-dark dark:text-slate-200 text-sm">អត្រាការប្រាក់ទាប និងសមរម្យ</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">ជួយស្វែងរកប្រភពទុនដែលមានអត្រាការប្រាក់ទាប ដើម្បីកាត់បន្ថយការចំណាយរបស់លោកអ្នក។</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-950/50 text-brand-accent rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-dark dark:text-slate-200 text-sm">ការពិភាក្សា និងប្រឹក្សាយោបល់ឥតគិតថ្លៃ</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">លោកអ្នកអាចពិភាក្សាជាមួយអ្នកជំនាញរបស់យើងដោយមិនគិតថ្លៃសេវាបឋមឡើយ។</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-8 rounded-xl shadow-sm transition-colors duration-300">
              <div className="text-center max-w-sm mx-auto">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/50 text-brand-accent rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-3">សុវត្ថិភាពទិន្នន័យ ១០០%</h3>
                <p className="text-brand-muted dark:text-slate-400 text-xs leading-relaxed mb-6">
                  រាល់ព័ត៌មានផ្ទាល់ខ្លួន និងហិរញ្ញវត្ថុរបស់លោកអ្នកត្រូវបានការពារដោយបច្ចេកវិទ្យាកូដនីយកម្មកម្រិតខ្ពស់បំផុត និងការសម្ងាត់យ៉ាងម៉ត់ចត់។
                </p>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-6 flex justify-around">
                  <div>
                    <div className="text-xl font-bold text-brand-dark dark:text-white">១០០%</div>
                    <div className="text-slate-400 dark:text-slate-500 text-[10px] uppercase mt-1">ស្របច្បាប់</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-brand-dark dark:text-white">២៤/៧</div>
                    <div className="text-slate-400 dark:text-slate-500 text-[10px] uppercase mt-1">គាំទ្រអតិថិជន</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section / ភ្ជាប់ទំនាក់ទំនងជាមួយអ្នកជំនាញ */}
      <section id="contact" className="py-20 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 md:p-12 shadow-xl transition-colors duration-300">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-brand-dark dark:text-white tracking-tight mb-3">ភ្ជាប់ទំនាក់ទំនងជាមួយអ្នកជំនាញ</h2>
              <p className="text-brand-muted dark:text-slate-400 text-sm">
                សូមបំពេញព័ត៌មានខាងក្រោមដើម្បីទទួលបានការប្រឹក្សាយោបល់បឋមដោយឥតគិតថ្លៃ។ រាល់ព័ត៌មានរបស់លោកអ្នកនឹងត្រូវបានរក្សាការសម្ងាត់យ៉ាងម៉ត់ចត់បំផុតស្របតាមស្តង់ដារស្ថាប័ន។
              </p>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">នាមត្រកូល និងនាមខ្លួន</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-accent transition-colors" 
                    placeholder="ឧ. កុល ចំរើន" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">លេខទូរស័ព្ទ</label>
                  <input 
                    type="tel" 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-accent transition-colors" 
                    placeholder="ឧ. ០១២ ៣៤៥ ៦៧៨" 
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">ឈ្មោះក្រុមហ៊ុន ឬអាជីវកម្ម (បើមាន)</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-accent transition-colors" 
                    placeholder="ឧ. ក្រុមហ៊ុន វីរៈ ត្រេឌីង" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">ប្រភេទសេវាកម្មដែលលោកអ្នកចាប់អារម្មណ៍</label>
                  <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-brand-accent transition-colors text-slate-500 dark:text-slate-200">
                    <option>ឥណទានអាជីវកម្ម (Business Loan)</option>
                    <option>ឥណទានមានទ្រព្យធានា (Secured Loan)</option>
                    <option>រៀបចំរចនាសម្ព័ន្ធបំណុលឡើងវិញ</option>
                    <option>សេវាកម្មប្រឹក្សាយោបល់ផ្សេងៗ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">ពណ៌នា សង្ខេបអំពីតម្រូវការ ឬទំហំឥណទានដែលចង់ស្នើសុំ</label>
                <textarea 
                  rows={4} 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-accent transition-colors" 
                  placeholder="សូមបញ្ជាក់ពីគោលបំណង ឬទំហំកម្ចីដែលលោកអ្នកត្រូវការ..."
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="w-full py-4 bg-brand-dark dark:bg-brand-accent dark:hover:bg-brand-accentHover text-white rounded-lg font-semibold hover:bg-slate-800 transition-all text-sm shadow-md"
              >
                ផ្ញើព័ត៌មានស្នើសុំ
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer / ផ្នែកខាងក្រោមបង្អស់ */}
      <footer className="bg-brand-dark dark:bg-slate-950 text-slate-400 dark:text-slate-500 text-xs py-12 border-t border-slate-800 dark:border-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3.5 mb-4">
                <img src="/acabar-logo.png" className="h-10 w-10 rounded-full object-cover" alt="Acabar PLC Logo" />
                <div className="flex flex-col justify-center leading-none">
                  <span className="text-base font-extrabold text-white tracking-wide">Acabar Plc</span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1.5">អាខាបារ ម.ក</span>
                </div>
              </div>
              <p className="leading-relaxed">
                ស្ថាប័នប្រឹក្សាយោបល់ហិរញ្ញវត្ថុ និងឥណទានស្របច្បាប់ ជួយសម្រួលការរៀបចំកញ្ចប់ថវិកា និងយុទ្ធសាស្ត្រគ្រប់គ្រងហានិភ័យប្រកបដោយទំនួលខុសត្រូវ។
              </p>
            </div>
            <div>
              <h4 className="text-white dark:text-slate-300 font-semibold uppercase tracking-wider mb-3">បទប្បញ្ញត្តិ</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white dark:hover:text-slate-300 transition-colors">ក្របខណ្ឌច្បាប់</a></li>
                <li><a href="#" className="hover:text-white dark:hover:text-slate-300 transition-colors">ការអនុលោមភាពហិរញ្ញវត្ថុ</a></li>
                <li><a href="#" className="hover:text-white dark:hover:text-slate-300 transition-colors">គោលការណ៍ការពារអតិថិជន</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white dark:text-slate-300 font-semibold uppercase tracking-wider mb-3">ទីតាំងការិយាល័យ</h4>
              <p className="leading-relaxed">
                អាសយដ្ឋាន៖ ផ្ទះលេខ A31, ផ្លូវជាតិលេខ១, សង្កាត់ Phum Thum, ខណ្ឌ Kien Svay, រាជធានីភ្នំពេញ, កម្ពុជា<br />
                ទូរស័ព្ទ៖ +855 012778875<br />
                អ៊ីមែល៖ acabar858@gmail.com
              </p>
            </div>
          </div>
          <div className="border-t border-slate-800 dark:border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 dark:text-slate-600">
            <p>&copy; 2026 Acabar PLC. រក្សាសិទ្ធិគ្រប់យ៉ាង។</p>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-slate-400 dark:hover:text-slate-300 transition-colors">គោលការណ៍ឯកជនភាព</a>
              <a href="#" className="hover:text-slate-400 dark:hover:text-slate-300 transition-colors">លក្ខខណ្ឌប្រើប្រាស់</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
