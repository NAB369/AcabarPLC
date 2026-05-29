'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Bell, Search, Filter, ArrowRight, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

export default function PaymentNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      // Fetch the notifications using the new endpoint
      const data = await api.get('/client/wb/v1/payloan-callback/notifications');
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getStatusBadge = (status: string) => {
    if (status === '0') {
      return (
        <span className="flex items-center gap-1 w-fit bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
          <CheckCircle2 size={12} />
          Settled
        </span>
      );
    }
    if (status === '1') {
      return (
        <span className="flex items-center gap-1 w-fit bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">
          <RefreshCw size={12} />
          Waiting
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 w-fit bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
        <XCircle size={12} />
        Error
      </span>
    );
  };

  const filteredData = notifications.filter(n => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      n.payerName?.toLowerCase().includes(query) ||
      n.billNo?.toLowerCase().includes(query) ||
      n.transactionId?.toString().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Bell className="h-6 w-6 text-indigo-600" />
          Payment Webhooks
        </h1>
        <p className="text-slate-500 mt-1">
          Real-time payloan callback notifications and reconciliation status.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by payer, bill no, or transaction ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchNotifications}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Transaction Details</th>
                <th className="px-6 py-4">Payer Info</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex justify-center mb-4">
                      <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
                    </div>
                    Loading notifications...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex justify-center mb-4">
                      <Bell className="h-12 w-12 text-slate-200" />
                    </div>
                    No payment notifications found.
                  </td>
                </tr>
              ) : (
                filteredData.map((notification) => (
                  <tr key={notification.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{notification.transactionDate}</div>
                      <div className="text-slate-500 text-xs mt-1">{notification.transactionTime}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{notification.billNo}</div>
                      <div className="text-slate-500 text-xs mt-1">ID: {notification.transactionId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{notification.payerName}</div>
                      <div className="text-slate-500 text-xs mt-1">{notification.senderBankName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">
                        {notification.amount?.toLocaleString()} {notification.currencyCode}
                      </div>
                      <div className="text-slate-500 text-xs mt-1">{notification.paymentMethod}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        {getStatusBadge(notification.settlementStatus)}
                        {notification.settlementErrorMessage && (
                          <span className="text-xs text-red-500 truncate max-w-[150px]" title={notification.settlementErrorMessage}>
                            {notification.settlementErrorMessage}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
