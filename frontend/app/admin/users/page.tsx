'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { CheckCircle, XCircle, ShieldCheck, Clock, UserCheck, Shield } from 'lucide-react';

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await api.get('/users');
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string, requestedRole: string) => {
    if (!window.confirm(`Approve user and assign role: ${requestedRole || 'None'}?`)) return;
    
    setActionLoading(userId);
    try {
      await api.patch(`/users/${userId}/approve`, { roleName: requestedRole });
      await fetchUsers(); // refresh list
    } catch (err: any) {
      alert(err.message || 'Failed to approve user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: string) => {
    if (!window.confirm(`Are you sure you want to reject this user registration?`)) return;
    
    setActionLoading(userId);
    try {
      await api.delete(`/users/${userId}`);
      await fetchUsers(); // refresh list
    } catch (err: any) {
      alert(err.message || 'Failed to reject user');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[var(--text-muted)]">Loading users...</div>;
  }

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
          <Shield className="text-[var(--primary)]" />
          User Management & Approvals
        </h1>
        <p className="text-[var(--text-muted)] mt-1">
          Review and approve pending user registrations and manage roles.
        </p>
      </div>

      {error && (
        <div className="bg-[var(--error-bg)] text-[var(--error-text)] p-4 rounded-md border border-[var(--error-border)] mb-6">
          {error}
        </div>
      )}

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-muted)]/30">
                <th className="p-4 text-sm font-semibold text-[var(--text-muted-dark)]">User</th>
                <th className="p-4 text-sm font-semibold text-[var(--text-muted-dark)]">Requested Role</th>
                <th className="p-4 text-sm font-semibold text-[var(--text-muted-dark)]">Current Roles</th>
                <th className="p-4 text-sm font-semibold text-[var(--text-muted-dark)]">Status</th>
                <th className="p-4 text-sm font-semibold text-[var(--text-muted-dark)]">Registered Date</th>
                <th className="p-4 text-sm font-semibold text-[var(--text-muted-dark)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-muted)]/20 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-[var(--foreground)]">{user.firstName} {user.lastName}</div>
                    <div className="text-sm text-[var(--text-muted)]">{user.email}</div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-medium px-2 py-1 bg-[var(--bg-muted)] rounded-md border border-[var(--border-color)]">
                      {user.requestedRole || 'None'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1 flex-wrap">
                      {user.roles?.length > 0 ? (
                        user.roles.map((ur: any) => (
                          <span key={ur.role.id} className="text-xs px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full border border-[var(--primary)]/20">
                            {ur.role.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-[var(--text-muted)] italic">No roles</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    {user.isApproved ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--success-bg)] text-[var(--success-text)] border border-[var(--success-border)]">
                        <CheckCircle size={14} /> Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--warning-bg)] text-[var(--warning-text)] border border-[var(--warning-border)]">
                        <Clock size={14} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-[var(--text-muted)]">
                    {new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(user.createdAt))}
                  </td>
                  <td className="p-4 text-right">
                    {!user.isApproved && (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleApprove(user.id, user.requestedRole)}
                          disabled={actionLoading === user.id}
                          className="btn btn-primary inline-flex items-center gap-1.5 py-1.5 px-3 text-sm h-auto"
                        >
                          {actionLoading === user.id ? 'Approving...' : (
                            <>
                              <UserCheck size={16} /> Approve
                            </>
                          )}
                        </button>
                        <button 
                          onClick={() => handleReject(user.id)}
                          disabled={actionLoading === user.id}
                          className="btn btn-secondary inline-flex items-center gap-1.5 py-1.5 px-3 text-sm h-auto text-[var(--error-text)] border-[var(--error-border)]"
                        >
                          {actionLoading === user.id ? '...' : (
                            <>
                              <XCircle size={16} /> Reject
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--text-muted)]">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
