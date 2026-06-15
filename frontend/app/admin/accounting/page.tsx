'use client';

import React from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  FileText, 
  BookMarked, 
  LayoutList, 
  RefreshCcw, 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  Package, 
  FileSpreadsheet, 
  ArrowRightLeft,
  DollarSign,
  Receipt,
  FileBox,
  PenLine
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function AccountingHub() {
  const { t } = useLanguage();

  const sections = [
    {
      title: 'For Accountant',
      icon: <BookOpen className="text-blue-600" size={24} />,
      iconBg: 'bg-blue-50 dark:bg-blue-900/20',
      links: [
        { label: 'New Journal Entry', icon: <FileText size={16} />, href: '/admin/accounting/journal' },
        { label: 'Single Entry', icon: <PenLine size={16} />, href: '/admin/accounting/single' },
        { label: 'Cash Transfer', icon: <ArrowRightLeft size={16} />, href: '/admin/accounting/transfer' },
        { label: 'Chart of Accounts', icon: <LayoutList size={16} />, href: '/admin/accounting/accounts' },
      ]
    },
    {
      title: 'Reports',
      icon: <FileSpreadsheet className="text-blue-600" size={24} />,
      iconBg: 'bg-blue-50 dark:bg-blue-900/20',
      links: [
        { label: 'General Ledger', icon: <BookMarked size={16} />, href: '/admin/accounting/reports/ledger' },
        { label: 'Trial Balance', icon: <FileSpreadsheet size={16} />, href: '/admin/accounting/reports' },
        { label: 'Profit & Loss', icon: <TrendingUp size={16} />, href: '/admin/accounting/reports/profit-loss' },
        { label: 'Balance Sheet', icon: <LayoutList size={16} />, href: '/admin/accounting/reports/balance-sheet' },
      ]
    },
    {
      title: 'Income',
      icon: <TrendingUp className="text-blue-600" size={24} />,
      iconBg: 'bg-blue-50 dark:bg-blue-900/20',
      links: [
        { label: 'New Sales Invoice', icon: <FileText size={16} />, href: '/admin/accounting/income' },
      ]
    },
    {
      title: 'Expense',
      icon: <TrendingDown className="text-blue-600" size={24} />,
      iconBg: 'bg-blue-50 dark:bg-blue-900/20',
      links: [
        { label: 'Enter Bill', icon: <FileText size={16} />, href: '/admin/accounting/expense' },
      ]
    }
  ];

  return (
    <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="text-blue-600 dark:text-blue-500" size={32} strokeWidth={2} />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Accounting Hub</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          Manage assets, inventory, and core accounting functions.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sections.map((section, idx) => (
          <div 
            key={idx} 
            className="bg-white dark:bg-slate-800 rounded-[20px] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] dark:shadow-none border border-slate-100 dark:border-slate-700 flex flex-col transition-transform hover:-translate-y-1 duration-300"
          >
            {/* Card Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${section.iconBg}`}>
                {section.icon}
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {section.title}
              </h2>
            </div>

            {/* Links */}
            <div className="flex flex-col gap-4 pl-2">
              {section.links.map((link, lIdx) => (
                <Link 
                  key={lIdx} 
                  href={link.href}
                  className="flex items-center gap-3 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors group"
                >
                  <span className="text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
