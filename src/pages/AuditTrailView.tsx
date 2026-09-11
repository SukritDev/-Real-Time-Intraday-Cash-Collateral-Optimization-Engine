import React, { useState } from 'react';
import { useTreasury } from '../context/TreasuryContext';
import { ShieldCheck, Search, Filter, Clock, User, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

export const AuditTrailView: React.FC = () => {
  const { state } = useTreasury();
  const [searchTerm, setSearchTerm] = useState('');

  if (!state) return null;

  const filteredLogs = state.auditLogs.filter(log => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(term) ||
      log.details.toLowerCase().includes(term) ||
      log.user.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-white tracking-wide uppercase">
            Institutional Audit Trail &amp; Governance Ledger
          </h2>
          <p className="text-xs text-slate-400">
            Cryptographically timestamped record of solver executions, manual overrides, shocks, and parameter shifts.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search action or operator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
            />
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Operator / Agent</th>
                <th className="py-3.5 px-4">Action Event</th>
                <th className="py-3.5 px-4">Execution Details &amp; Telemetry</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{log.time}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-sans font-semibold text-slate-300 whitespace-nowrap">
                    <div className="flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-blue-400" />
                      <span>{log.user}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-blue-300 border border-slate-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-300 max-w-xl">
                    {log.details}
                  </td>
                  <td className="py-3 px-4 text-center font-sans whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      log.status === 'CRITICAL'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : log.status === 'WARNING'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {log.status || 'SUCCESS'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
