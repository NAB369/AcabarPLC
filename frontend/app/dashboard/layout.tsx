'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, User, Bell, ChevronLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Header */}
      <header className="glass sticky top-0 h-[72px] flex items-center justify-between px-4 md:px-10 z-30">
        <div className="flex items-center gap-3">
          <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center overflow-hidden shadow-sm">
            <img src="/acabar-logo.png" alt="Acabar Plc Logo" className="w-[38px] h-[38px] object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="text-[#1e3a8a] dark:text-white font-extrabold text-lg tracking-tight leading-tight">
              Acabar Plc
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-semibold text-[0.65rem] mt-[1px]">
              អាខាបារ ម.ក
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button className="relative w-[40px] h-[40px] flex items-center justify-center rounded-full hover:bg-[var(--bg-muted)] transition-colors">
            <Bell size={20} className="text-[var(--text-muted-dark)]" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-[36px] h-[36px] rounded-full bg-[var(--secondary)] flex items-center justify-center text-[var(--foreground)] font-semibold border-2 border-white shadow-sm">
              {user?.firstName?.[0] || 'U'}
            </div>
            <div className="hidden md:block text-sm font-semibold text-[var(--foreground)]">
              {user?.firstName || 'User'}
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
