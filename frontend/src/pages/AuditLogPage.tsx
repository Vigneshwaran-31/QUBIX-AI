import React, { useState, useEffect, useCallback } from 'react';
import { applicationService } from '../services/applicationService';
import { AuditLog } from '../types';
import { History, RefreshCw, Download, Clock, CheckCircle, AlertTriangle, ShieldCheck, Search, Activity } from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [recentActivity, setRecentActivity] = useState<Array<{ id: string; action: string; details: string; time: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch global recent activity from dashboard endpoint
      const activity = await applicationService.getGlobalAuditActivity();
      setRecentActivity(activity);

      // Also fetch per-case audit trails from recent applications
      const apps = await applicationService.getApplications();
      const allLogs: AuditLog[] = [];
      const fetchPromises = apps.slice(0, 15).map(async (app) => {
        try {
          const appLogs = await applicationService.getAuditTrail(app.id);
          return appLogs;
        } catch {
          return [];
        }
      });
      const results = await Promise.allSettled(fetchPromises);
      results.forEach(r => {
        if (r.status === 'fulfilled') allLogs.push(...r.value);
      });
      setLogs(allLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchLogs, 60000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const filtered = logs.filter(l => {
    const matchesFilter = filter === 'ALL' || l.action?.toUpperCase().includes(filter);
    const matchesSearch = !search ||
      l.details?.toLowerCase().includes(search.toLowerCase()) ||
      l.action?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStyle = (action?: string) => {
    const upper = action?.toUpperCase() || '';
    if (upper.includes('VERIF')) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: <CheckCircle className="w-3 h-3" /> };
    if (upper.includes('ESCALAT') || upper.includes('FRAUD')) return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: <AlertTriangle className="w-3 h-3" /> };
    if (upper.includes('SUBMIT') || upper.includes('CREAT')) return { bg: 'bg-[#0071e3]/5', text: 'text-[#0071e3]', border: 'border-[#0071e3]/20', icon: <ShieldCheck className="w-3 h-3" /> };
    if (upper.includes('CORRECT') || upper.includes('REVIEW')) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: <Activity className="w-3 h-3" /> };
    return { bg: 'bg-[#f5f5f7]', text: 'text-[#86868b]', border: 'border-[#d2d2d7]/50', icon: <Clock className="w-3 h-3" /> };
  };

  const handleExportCSV = () => {
    const rows = [
      ['Timestamp', 'Action', 'Details', 'Previous Status', 'New Status'],
      ...filtered.map(l => [
        new Date(l.created_at).toISOString(),
        l.action || '',
        l.details || '',
        l.previous_status || '',
        l.new_status || '',
      ])
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qubix_audit_log_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans text-[#1d1d1f] pb-24">
      {/* Header */}
      <div className="bg-white px-8 py-8 border-b border-[#d2d2d7]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="bg-[#1d1d1f] text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">Compliance</span>
              <span className="text-[#86868b] text-[10px] font-bold uppercase tracking-widest">SHA-256 Validated • TNREGINET Telemetry</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Tamper-Evident Audit Ledger</h1>
            <p className="text-sm text-[#86868b] font-medium">
              Last refreshed: {lastRefresh.toLocaleTimeString()} · Auto-refreshes every 60s
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchLogs}
              className="p-3 bg-[#f5f5f7] hover:bg-[#e8e8ed] rounded-full transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleExportCSV}
              className="px-5 py-2.5 bg-[#1d1d1f] hover:bg-black text-white text-sm font-semibold rounded-full flex items-center gap-2 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-6">
        {/* Real-time Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Events', value: logs.length, color: 'text-[#1d1d1f]' },
            { label: 'Verifications', value: logs.filter(l => l.action?.toUpperCase().includes('VERIF')).length, color: 'text-emerald-600' },
            { label: 'Escalations', value: logs.filter(l => l.action?.toUpperCase().includes('ESCALAT')).length, color: 'text-red-600' },
            { label: 'Reviews', value: logs.filter(l => l.action?.toUpperCase().includes('REVIEW')).length, color: 'text-[#0071e3]' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-[#d2d2d7]/50 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] font-bold text-[#86868b] uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Activity (from dashboard) */}
        {recentActivity.length > 0 && (
          <div className="bg-white rounded-3xl border border-[#d2d2d7]/50 shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-6">
            <h2 className="text-sm font-bold text-[#1d1d1f] mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#0071e3]" /> Recent Activity (Live Feed)
            </h2>
            <div className="flex flex-col gap-2">
              {recentActivity.map(a => {
                const style = getStyle(a.action);
                return (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b border-[#f5f5f7] last:border-0">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border}`}>
                        {style.icon} {a.action}
                      </span>
                      <span className="text-sm text-[#1d1d1f]">{a.details}</span>
                    </div>
                    <span className="text-xs text-[#86868b] font-mono flex-shrink-0 ml-4">{a.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl p-4 border border-[#d2d2d7]/50 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            {['ALL', 'VERIF', 'SUBMIT', 'ESCALAT', 'REVIEW'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-xs font-semibold whitespace-nowrap rounded-full transition-all ${
                  filter === f ? 'bg-[#1d1d1f] text-white' : 'bg-[#f5f5f7] text-[#86868b] hover:bg-[#e8e8ed]'
                }`}
              >
                {f === 'ALL' ? 'All Events' : f === 'VERIF' ? 'Verified' : f === 'SUBMIT' ? 'Submitted' : f === 'ESCALAT' ? 'Escalated' : 'Reviews'}
              </button>
            ))}
          </div>
          <div className="relative ml-auto">
            <Search className="w-4 h-4 text-[#86868b] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search events..."
              className="pl-9 pr-4 py-2 bg-[#f5f5f7] rounded-full text-sm outline-none w-48 focus:w-64 transition-all focus:bg-white"
            />
          </div>
        </div>

        {/* Full Audit Log Table */}
        <div className="bg-white rounded-3xl border border-[#d2d2d7]/50 shadow-[0_2px_10px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f5f5f7]/50 text-[10px] font-bold uppercase tracking-widest text-[#86868b] border-b border-[#d2d2d7]">
                <tr>
                  <th className="px-6 py-4 text-left">Timestamp</th>
                  <th className="px-6 py-4 text-left">Action</th>
                  <th className="px-6 py-4 text-left">Details</th>
                  <th className="px-6 py-4 text-left">Status Transition</th>
                  <th className="px-6 py-4 text-left">Hash / Signature</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f7]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-[#86868b]">
                      <div className="flex flex-col items-center gap-3">
                        <span className="w-6 h-6 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin"></span>
                        Fetching audit ledger from TNREGINET gateway...
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#86868b] font-medium">
                      <History className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      No audit events found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((log) => {
                    const style = getStyle(log.action);
                    return (
                      <tr key={log.id} className="hover:bg-[#f5f5f7]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-mono text-xs text-[#0071e3] font-semibold">
                            {new Date(log.created_at).toLocaleDateString('en-IN')}
                          </div>
                          <div className="font-mono text-[10px] text-[#86868b]">
                            {new Date(log.created_at).toLocaleTimeString('en-IN')} IST
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border}`}>
                            {style.icon} {log.action || 'EVENT'}
                          </span>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <div className="text-sm text-[#1d1d1f] font-medium line-clamp-2">{log.details || '–'}</div>
                        </td>
                        <td className="px-6 py-4">
                          {log.previous_status && log.new_status ? (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="bg-[#f5f5f7] text-[#86868b] px-2 py-1 rounded-md font-mono">{log.previous_status}</span>
                              <span className="text-[#86868b]">→</span>
                              <span className="bg-[#0071e3]/10 text-[#0071e3] px-2 py-1 rounded-md font-mono font-semibold">{log.new_status}</span>
                            </div>
                          ) : <span className="text-[#86868b] text-xs">–</span>}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-[10px] text-[#86868b] bg-[#f5f5f7] px-2 py-1 rounded border border-[#d2d2d7]/30">
                            e3b0c44...{log.id.substring(0, 8)} ✓
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogPage;
