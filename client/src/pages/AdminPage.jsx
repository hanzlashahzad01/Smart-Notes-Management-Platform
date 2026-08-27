import React, { useEffect, useState } from 'react';
import { Shield, Users, FileText, HardDrive, AlertTriangle, Check, Trash2 } from 'lucide-react';
import api from '../services/api';

const AdminPage = () => {
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, totalNotes: 0, pendingReports: 0, storageUsedMB: 0 });
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // users or reports

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const statsRes = await api.get('/admin/stats');
        setStats(statsRes.data.stats || {});

        const usersRes = await api.get('/admin/users');
        setUsers(usersRes.data.users || []);

        const reportsRes = await api.get('/admin/reports');
        setReports(reportsRes.data.reports || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAdminData();
  }, []);

  const handleToggleUser = async (id) => {
    try {
      const res = await api.patch(`/admin/users/${id}/toggle-status`);
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, isVerified: res.data.user.isVerified } : u)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveReport = async (id, status) => {
    try {
      await api.patch(`/admin/reports/${id}`, { status });
      setReports((prev) => prev.map((r) => (r._id === id ? { ...r, status } : r)));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-500" />
          <span>System Administration Dashboard</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage system users, global stats, and moderation reports.
        </p>
      </div>

      {/* Admin System Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-1">
          <p className="text-xs font-bold text-slate-400">Total System Users</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{stats.totalUsers}</p>
        </div>
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-1">
          <p className="text-xs font-bold text-slate-400">Active Notes</p>
          <p className="text-2xl font-extrabold text-indigo-600">{stats.totalNotes}</p>
        </div>
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-1">
          <p className="text-xs font-bold text-slate-400">Pending Reports</p>
          <p className="text-2xl font-extrabold text-rose-600">{stats.pendingReports}</p>
        </div>
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-1">
          <p className="text-xs font-bold text-slate-400">Storage Consumption</p>
          <p className="text-2xl font-extrabold text-emerald-600">{stats.storageUsedMB} MB</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeTab === 'users' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'
          }`}
        >
          User Management ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
            activeTab === 'reports' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'
          }`}
        >
          Moderation Reports ({reports.length})
        </button>
      </div>

      {activeTab === 'users' ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Notes</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-4 font-bold text-slate-900 dark:text-slate-100">
                    <div>{u.name}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{u.email}</div>
                  </td>
                  <td className="p-4 font-semibold">{u.role}</td>
                  <td className="p-4 font-bold">{u.noteCount || 0}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        u.isVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {u.isVerified ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="p-4 space-x-2">
                    <button
                      onClick={() => handleToggleUser(u._id)}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 font-semibold rounded-lg hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      {u.isVerified ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u._id)}
                      className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold">
              <tr>
                <th className="p-4">Reported By</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {reports.map((rep) => (
                <tr key={rep._id}>
                  <td className="p-4 font-bold">{rep.reportedBy?.name || 'User'}</td>
                  <td className="p-4 text-rose-600 font-bold">{rep.reason}</td>
                  <td className="p-4 font-bold">{rep.status}</td>
                  <td className="p-4 space-x-2">
                    <button
                      onClick={() => handleResolveReport(rep._id, 'RESOLVED')}
                      className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => handleResolveReport(rep._id, 'REJECTED')}
                      className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 font-bold rounded-lg"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
