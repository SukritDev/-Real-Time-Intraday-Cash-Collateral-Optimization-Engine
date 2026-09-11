import React from 'react';
import { RecommendationItem } from '../types';
import { CheckCircle, ArrowRight, HelpCircle, Shield, AlertTriangle, X, Cpu, FileCheck } from 'lucide-react';
import { formatTimeIST } from '../utils/dateUtils';

interface ExplainabilityModalProps {
  rec: RecommendationItem | null;
  onClose: () => void;
  onApprove: (id: string) => void;
}

export const ExplainabilityModal: React.FC<ExplainabilityModalProps> = ({ rec, onClose, onApprove }) => {
  if (!rec) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0B0F19] border border-slate-700 w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#0E1726] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-blue-400">
            <FileCheck className="w-4 h-4" />
            <h2 className="font-bold text-xs sm:text-sm text-white tracking-wide uppercase font-sans">
              Algorithmic Decision Justification &amp; Pre-Trade Verification
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          {/* Action Overview Card */}
          <div className="p-3.5 rounded bg-[#0E1726] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Recommended Action</span>
              <p className="font-bold text-white text-sm mt-0.5">{rec.actionType.replace('_', ' ')}</p>
              <div className="flex items-center space-x-2 mt-1 text-slate-300 text-xs font-mono">
                <span>{rec.sourceName}</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span className="text-emerald-400 font-semibold">{rec.destinationName}</span>
              </div>
            </div>
            <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Notional Allocation</span>
              <p className="text-xl font-bold text-white font-mono tabular-nums">
                ₹{(rec.amount / 10000000).toFixed(2)} Cr
              </p>
              <span className="text-[10px] text-slate-400 font-mono">Est. Friction Fee: ₹{rec.expectedCost.toLocaleString()}</span>
            </div>
          </div>

          {/* Quantitative Justification */}
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Quantitative Optimization Rationale</span>
            </h3>
            <div className="p-3 rounded bg-[#070b12] border border-slate-800/90 text-slate-200 leading-relaxed text-xs">
              {rec.whyExplanation}
            </div>
          </div>

          {/* Risk of Inaction */}
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Counterfactual Impact (Risk If Inaction Persists)</span>
            </h3>
            <div className="p-3 rounded bg-rose-950/20 border border-rose-900/40 text-rose-200 leading-relaxed text-xs">
              {rec.consequenceIfIgnored}
            </div>
          </div>

          {/* Key Metric Gauges */}
          <div className="grid grid-cols-3 gap-2.5 text-center pt-2 border-t border-slate-800/80">
            <div className="p-2.5 rounded bg-[#0E1726] border border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Penalty Avoidance</span>
              <p className="text-xs font-bold text-emerald-400 mt-0.5 font-mono tabular-nums">₹{(rec.riskReductionAmount / 10000000).toFixed(2)} Cr</p>
            </div>
            <div className="p-2.5 rounded bg-[#0E1726] border border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Execution Cutoff</span>
              <p className="text-xs font-mono text-amber-300 mt-0.5">{formatTimeIST(rec.cutoffTime)}</p>
            </div>
            <div className="p-2.5 rounded bg-[#0E1726] border border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Algorithm Confidence</span>
              <p className="text-xs font-bold text-blue-400 mt-0.5 font-mono">{(rec.confidence * 100).toFixed(0)}%</p>
            </div>
          </div>

          {/* Solver Telemetry */}
          <div className="p-2 rounded bg-[#070b12] border border-slate-800 text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>Solver Engine: Simplex Primal-Dual LP &bull; Execution time: &lt; 10 ms</span>
            </div>
            <span className="text-emerald-400 font-semibold">STATUS: OPTIMAL</span>
          </div>
        </div>

        {/* 4-Eyes Compliance Authorization Bar */}
        <div className="px-5 py-3 bg-[#070b12] border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-slate-500 font-mono">Institutional Policy: 4-Eyes Supervisory Sign-off Required</p>
          <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => onApprove(rec.id)}
              className="px-3.5 py-1.5 rounded text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm flex items-center space-x-1.5 transition cursor-pointer border border-emerald-500/50"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Authorize &amp; Execute Order</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
