import React from 'react';
import { useTreasury } from '../context/TreasuryContext';
import { formatTimeIST } from '../utils/dateUtils';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  RefreshCw,
  Send,
  Zap,
  Activity,
  ArrowRight
} from 'lucide-react';

export const SettlementControlTower: React.FC = () => {
  const { state, approveRecommendation } = useTreasury();

  if (!state) return null;

  const formatRemainingTime = (sec: number) => {
    if (sec <= 0) return 'CUTOFF PASSED';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-white tracking-wide uppercase">
            Settlement Risk &amp; Cutoff Control Tower
          </h2>
          <p className="text-xs text-slate-400">
            Intraday countdown clocks, queue delay variance, and predictive failure probability monitoring.
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            Monitored Rails: <span className="text-blue-400 font-bold">4 Active</span>
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            Pending Value: <span className="text-emerald-400 font-bold">₹{(state.settlements.reduce((sum, s) => sum + s.amount, 0) / 10000000).toFixed(2)} Cr</span>
          </span>
        </div>
      </div>

      {/* Payment Rails Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {state.paymentRails.map((rail) => (
          <div
            key={rail.name}
            className={`p-4 rounded-xl border shadow-sm ${
              rail.operatingStatus === 'OUTAGE'
                ? 'bg-rose-950/20 border-rose-900/60'
                : rail.operatingStatus === 'DEGRADED'
                ? 'bg-amber-950/20 border-amber-900/60'
                : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white font-mono">{rail.name}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  rail.operatingStatus === 'NORMAL'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : rail.operatingStatus === 'DEGRADED'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}
              >
                {rail.operatingStatus}
              </span>
            </div>

            <div className="mt-3 space-y-1 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Avg Latency:</span>
                <span className="font-bold text-slate-200">{rail.avgLatencyMs} ms</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Queue Variance:</span>
                <span className="text-slate-300">&plusmn;{rail.latencyVarianceMs} ms</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Capacity Util.:</span>
                <span className="text-slate-300">{(rail.capacityUtilization * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Failure Rate:</span>
                <span className={rail.failureRate > 0.05 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                  {(rail.failureRate * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Real-Time Settlements Queue Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-md">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Intraday Payment &amp; Settlement Queue Telemetry
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            {state.settlements.filter(s => s.status !== 'CONFIRMED').length} Transactions In-Flight
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Ref Number</th>
                <th className="py-3.5 px-4">Route (Source &rarr; Dest)</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Rail</th>
                <th className="py-3.5 px-4 text-center">Countdown To Cutoff</th>
                <th className="py-3.5 px-4 text-center">Failure Risk</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {state.settlements.map((st) => {
                const isHighRisk = st.failureProbability > 0.50 && st.status !== 'CONFIRMED';
                const isConfirmed = st.status === 'CONFIRMED';

                return (
                  <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-300">{st.referenceNumber}</td>
                    <td className="py-3 px-4 font-sans text-slate-300">
                      <div className="flex items-center space-x-1.5">
                        <span className="truncate max-w-[120px]">{st.sourceAccountName}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500 flex-shrink-0" />
                        <span className="truncate max-w-[120px] text-blue-400">{st.destAccountName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      ₹{(st.amount / 10000000).toFixed(2)} Cr
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-700">
                        {st.rail}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold">
                      <div className="flex flex-col items-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                          isConfirmed
                            ? 'text-slate-500'
                            : st.timeRemainingSeconds < 600
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80'
                            : 'bg-slate-800 text-amber-300'
                        }`}>
                          {isConfirmed ? 'COMPLETED' : formatRemainingTime(st.timeRemainingSeconds)}
                        </span>
                        {!isConfirmed && (
                          <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                            Cutoff: {formatTimeIST(st.cutoffTime)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center space-x-1.5">
                        <span className={`font-bold ${
                          isConfirmed ? 'text-emerald-400' : isHighRisk ? 'text-rose-400' : 'text-slate-300'
                        }`}>
                          {(st.failureProbability * 100).toFixed(0)}%
                        </span>
                        {isHighRisk && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        isConfirmed
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : isHighRisk
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {st.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      {isHighRisk ? (
                        <button
                          onClick={() => {
                            const rerouteRec = state.recommendations.find(r => r.actionType === 'REROUTE_PAYMENT');
                            if (rerouteRec) approveRecommendation(rerouteRec.id);
                          }}
                          className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold transition flex items-center space-x-1 ml-auto cursor-pointer"
                        >
                          <Zap className="w-3 h-3" />
                          <span>REROUTE TO RTGS</span>
                        </button>
                      ) : (
                        <span className="text-slate-600 text-[11px] font-mono">OK</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
