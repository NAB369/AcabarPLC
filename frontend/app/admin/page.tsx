'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, Filter, Plus, ChevronLeft, ChevronRight, ArrowRight, FileText, TrendingUp, AlertCircle, CheckCircle2, MoreHorizontal, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/services/api';
import { useLanguage } from '@/context/LanguageContext';

export default function AdminDashboardPage() {
  const { t } = useLanguage();
  const [applications, setApplications] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [chartDataState, setChartDataState] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeChartTab, setActiveChartTab] = useState<'VOLUME' | 'GROWTH'>('VOLUME');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const itemsPerPage = 5;

  const getStatusBadge = (status: string) => {
    const statusText = t(`status_${status}`) !== `status_${status}` ? t(`status_${status}`) : status;
    switch (status) {
      case 'PENDING': return <span className="badge badge-pending">{statusText}</span>;
      case 'DISBURSED': return <span className="badge badge-disbursed">{statusText}</span>;
      case 'UNDERWRITING': return <span className="badge badge-review">{statusText}</span>;
      case 'APPROVED': return <span className="badge badge-approved">{statusText}</span>;
      case 'REJECTED': return <span className="badge badge-rejected">{statusText}</span>;
      case 'ACTIVE': return <span className="badge badge-disbursed">{statusText}</span>;
      case 'COMPLETED': return <span className="badge badge-approved">{statusText}</span>;
      case 'OVERDUE': return <span className="badge badge-rejected">{statusText}</span>;
      case 'TIER1_REVIEW': return <span className="badge badge-review">{statusText}</span>;
      case 'TIER2_REVIEW': return <span className="badge badge-review">{statusText}</span>;
      case 'TIER3_REVIEW': return <span className="badge badge-review">{statusText}</span>;
      default: return <span className="badge">{statusText}</span>;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appsData, metricsData] = await Promise.all([
          api.get('/los/queue'),
          api.get('/dashboard/metrics')
        ]);
        setApplications(appsData);
        setMetrics(metricsData.overview);
        setChartDataState(metricsData.chartData);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute values for Total Volume or Growth Tracking (Cumulative)
  const processedChartData = (() => {
    if (activeChartTab === 'VOLUME') {
      return chartDataState;
    }
    // Cumulative growth
    let sum = 0;
    return chartDataState.map(d => {
      sum += d.value;
      return { ...d, value: sum };
    });
  })();

  // Filtering logic
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch = (app.customer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             app.customer?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             app.id.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchTerm, statusFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.6s ease-out' }}>

      {/* Top Section: Chart and Stats */}
      <div className="flex flex-col xl:flex-row gap-8 items-stretch">

        {/* Chart Card */}
        <div className="card flex-1 flex flex-col">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div 
                onClick={() => setActiveChartTab('VOLUME')}
                style={{ 
                  fontWeight: activeChartTab === 'VOLUME' ? '600' : '500', 
                  fontSize: '0.875rem', 
                  borderBottom: activeChartTab === 'VOLUME' ? '2px solid var(--primary)' : '2px solid transparent', 
                  paddingBottom: '0.75rem', 
                  color: activeChartTab === 'VOLUME' ? 'var(--foreground)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {t('totalVolume')}
              </div>
              <div 
                onClick={() => setActiveChartTab('GROWTH')}
                style={{ 
                  fontWeight: activeChartTab === 'GROWTH' ? '600' : '500', 
                  fontSize: '0.875rem', 
                  borderBottom: activeChartTab === 'GROWTH' ? '2px solid var(--primary)' : '2px solid transparent', 
                  paddingBottom: '0.75rem', 
                  color: activeChartTab === 'GROWTH' ? 'var(--foreground)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {t('growthTracking')}
              </div>
            </div>
            <div style={{ textAlign: 'right', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '0.75rem 1.25rem', backgroundColor: 'var(--background)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted-dark)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                {activeChartTab === 'VOLUME' ? t('annualVolume') : t('totalCumulative')}
              </div>
              <div style={{ fontWeight: '700', fontSize: '1.25rem', color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
                ${(activeChartTab === 'VOLUME' 
                  ? (metrics?.totalVolume || 0) 
                  : (processedChartData[processedChartData.length - 1]?.value || 0)
                ).toLocaleString()} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>USD</span>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processedChartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" strokeOpacity={0.6} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={(value) => `$${value / 1000}K`} dx={-10} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)', backgroundColor: 'var(--card-bg)', backdropFilter: 'blur(8px)', padding: '12px 16px' }}
                  itemStyle={{ color: 'var(--foreground)', fontWeight: '600' }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, activeChartTab === 'VOLUME' ? 'Monthly Volume' : 'Cumulative Growth']}
                  labelStyle={{ color: 'var(--text-muted)', marginBottom: '4px', fontSize: '0.875rem' }}
                />
                <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--primary)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="w-full xl:w-80 flex flex-col gap-8">
          <div className="card" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'radial-gradient(circle, var(--success-bg) 0%, transparent 70%)', opacity: 0.6, pointerEvents: 'none' }}></div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted-dark)', display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem', fontWeight: '500' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={16} color="var(--success-text)" />
              </div>
              {t('totalPortfolio')}
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', letterSpacing: '-0.03em', color: 'var(--foreground)' }}>
              ${(metrics?.totalVolume || 0).toLocaleString()} <span style={{ fontSize: '0.8125rem', color: 'var(--success-text)', fontWeight: '600', marginLeft: '0.5rem', backgroundColor: 'var(--success-bg)', padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-full)' }}>{t('realTime')}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--success-text)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '500' }}>
              <TrendingUp size={12} /> {t('changeFromLastMonth')}
            </div>
          </div>

          <div className="card" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'radial-gradient(circle, var(--error-bg) 0%, transparent 70%)', opacity: 0.6, pointerEvents: 'none' }}></div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted-dark)', display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem', fontWeight: '500' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--error-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertCircle size={16} color="var(--error-text)" />
              </div>
              {t('overdueAccounts')}
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', letterSpacing: '-0.03em', color: 'var(--foreground)' }}>
              {metrics?.overdueCount || 0} <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '500', marginLeft: '0.5rem' }}>{t('loans')}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '500' }}>
              <ArrowRight size={12} /> {t('noChangeFromLastWeek')}
            </div>
          </div>
        </div>

        <div className="w-full xl:w-80 flex flex-col gap-8">
          <div className="card" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'radial-gradient(circle, var(--primary-light) 0%, transparent 70%)', opacity: 0.8, pointerEvents: 'none' }}></div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted-dark)', display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem', fontWeight: '500' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={16} color="var(--primary)" />
              </div>
              {t('settledLoans')}
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', letterSpacing: '-0.03em', color: 'var(--foreground)' }}>
              {metrics?.completedCount || 0} <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '500', marginLeft: '0.5rem' }}>{t('accounts')}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--success-text)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '500' }}>
              <TrendingUp size={12} /> {t('settledThisWeek')}
            </div>
          </div>

          <div className="card" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'radial-gradient(circle, var(--warning-bg) 0%, transparent 70%)', opacity: 0.8, pointerEvents: 'none' }}></div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted-dark)', display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem', fontWeight: '500' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={16} color="var(--warning-text)" />
              </div>
              {t('avgTicketSize')}
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', letterSpacing: '-0.03em', color: 'var(--foreground)' }}>
              ${(metrics?.avgLoanValue || 0).toLocaleString()} <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '500', marginLeft: '0.5rem' }}>USD</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '500' }}>
              <TrendingUp size={12} /> {t('avgSteady')}
            </div>
          </div>
        </div>

      </div>

      {/* Table Section */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--card-bg)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.02em' }}>{t('liveLoanPipeline')}</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>

          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar flex flex-col md:flex-row gap-4">
          <div className="relative w-full md:w-[300px]">
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder={t('searchPlaceholderAdmin')}
              className="input-field" 
              style={{ paddingLeft: '2.5rem', marginBottom: 0 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="toolbar-actions">
            <select 
              className="select-field" 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">{t('filter_ALL')}</option>
              <option value="ACTIVE">{t('filter_ACTIVE')}</option>
              <option value="PENDING">{t('filter_PENDING')}</option>
              <option value="UNDERWRITING">{t('filter_UNDERWRITING')}</option>
              <option value="APPROVED">{t('filter_APPROVED')}</option>
              <option value="DISBURSED">{t('filter_DISBURSED')}</option>
              <option value="REJECTED">{t('filter_REJECTED')}</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ cursor: 'pointer' }}>{t('tableHeaderID')} <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: '4px' }}/></th>
                <th style={{ cursor: 'pointer' }}>{t('tableHeaderName')} <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: '4px' }}/></th>
                <th>{t('tableHeaderProduct')}</th>
                <th style={{ cursor: 'pointer' }}>{t('tableHeaderAmount')} <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: '4px' }}/></th>
                <th>{t('tableHeaderSentDate')}</th>
                <th>{t('tableHeaderStatus')}</th>
                <th style={{ textAlign: 'right' }}>{t('tableHeaderActions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '4rem' }}>
                  <div className="animate-spin" style={{ width: '24px', height: '24px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto' }}></div>
                </td></tr>
              ) : paginatedApplications.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>No active applications in the pipeline.</td></tr>
              ) : paginatedApplications.map((app) => (
                <tr 
                  key={app.id} 
                  onClick={() => window.location.href = `/admin/los/${app.id}`}
                  style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: '600' }}>#{app.id.substring(0, 6).toUpperCase()}</td>
                  <td style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--foreground)' }}>{app.customer?.firstName} {app.customer?.lastName}</td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted-dark)', fontWeight: '500' }}>{app.product?.name || 'Standard Loan'}</td>
                  <td style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--primary)' }}>${Number(app.principalAmount).toLocaleString()}</td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted-dark)' }}>{new Date(app.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td>{getStatusBadge(app.status)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.25rem', border: 'none', background: 'transparent' }} onClick={(e) => { e.stopPropagation(); /* Handle action */ }}>
                      <MoreHorizontal size={16} color="var(--text-muted)" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--background)' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '500' }}>
            Displaying <span style={{ color: 'var(--foreground)', fontWeight: '700' }}>{paginatedApplications.length}</span> of <span style={{ color: 'var(--foreground)', fontWeight: '700' }}>{filteredApplications.length}</span> active records
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn btn-secondary" 
              style={{ 
                padding: '0.375rem', 
                minWidth: '36px', 
                height: '36px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                opacity: currentPage === 1 ? 0.5 : 1, 
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer' 
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages || 1, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="btn btn-secondary" 
              style={{ 
                padding: '0.375rem', 
                minWidth: '36px', 
                height: '36px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                opacity: (currentPage === totalPages || totalPages === 0) ? 0.5 : 1, 
                cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer' 
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
