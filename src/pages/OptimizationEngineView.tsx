import React from 'react';
import { useTreasury } from '../context/TreasuryContext';
import { formatTimeIST } from '../utils/dateUtils';
import {
  Sliders,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Shield,
  Clock,
  Cpu,
  Layers,
  CheckCheck
} from 'lucide-react';

export const OptimizationEngineView: React.FC = () => {
  const { state, setActiveModalRec, approveRecommendation, runOptimization } = useTreasury();

  if (!state) return null;

  const handleApproveAll = () => {
    state.recommendations.forEach(rec => approveRecommendation(rec.id));
  };

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Header & Solver Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold text-white tracking-wide uppercase font-sans">
              Intraday Optimization Solver (Mixed-Integer LP)
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/60">
              SIMPLEX • INTERIOR POINT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Multi-period constrained liquidity allocation minimizing frictional transaction, repo, and overdraft costs subject to Basel III and RBI prudential boundaries.
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          {state.recommendations.length > 1 && (
            <button
              onClick={handleApproveAll}
              className="px-3 py-1.5 rounded bg-emerald-700/80 hover:bg-emerald-600 text-xs font-semibold text-white border border-emerald-600 flex items-center space-x-1.5 transition cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Batch Authorize All ({state.recommendations.length})</span>
            </button>
          )}
          <button
            onClick={() => runOptimization()}
            className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-sm flex items-center space-x-1.5 transition cursor-pointer border border-blue-500/50"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Re-solve Model</span>
          </button>
        </div>
      </div>

      {/* Model Formulation & Solver Metrics */}
      <div className="p-4 rounded-lg bg-[#0E1726] border border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span>Linear Optimization Matrix &amp; Objective Formulation</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px] font-mono text-slate-400">
            <span>Variables: <strong className="text-slate-200">54</strong></span>
            <span>Constraints: <strong className="text-slate-200">38</strong></span>
            <span>Solve Latency: <strong className="text-emerald-400">8.4 ms</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded bg-[#070b12] border border-slate-800/80 space-y-1">
            <span className="text-slate-400 font-semibold block text-[11px]">Objective Function (Minimization):</span>
            <p className="text-slate-200 font-mono text-xs">
              min &sum; C_transfer(i,j) + &sum; C_od(i) + &sum; C_haircut(k) + &sum; C_repo + &lambda; &times; &Phi;_penalty
            </p>
            <p className="text-[10px] text-slate-500 font-sans mt-1">
              Dual shadow prices prioritize immediate settlement finality over fractional cross-account transfer expenses.
            </p>
          </div>

          <div className="p-3 rounded bg-[#070b12] border border-slate-800/80 space-y-1">
            <span className="text-slate-400 font-semibold block text-[11px]">Active Constraint Boundaries:</span>
            <ul className="text-slate-300 space-y-0.5 text-[11px]">
              <li>&bull; Cash Balance i &ge; Min Operating Buffer i (Slack: +₹45.00 Cr)</li>
              <li>&bull; Stock HQLA / Net 30D Outflow &ge; 100.00% LCR Floor (Slack: +14.2%)</li>
              <li>&bull; RBI Reserve Account / NDTL &ge; 4.50% CRR Mandate (Slack: +0.65%)</li>
              <li>&bull; Total Haircut-Adjusted Pool &ge; CCIL Initial &amp; Variation Margin</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recommendations Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Generated Rebalancing Directives ({state.recommendations.length})
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            Deterministic Decision Verification: Level 1 Compliant
          </span>
        </div>

        {state.recommendations.length === 0 ? (
          <div className="p-10 rounded-lg bg-[#0E1726] border border-slate-800 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-950/80 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-800/60">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white">System in Optimal Equilibrium</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No collateral deficits or imminent settlement cutoff breaches detected. Continuous algorithmic surveillance active.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {state.recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-lg bg-[#0E1726] border border-slate-800 shadow-sm hover:border-slate-700 transition space-y-3"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-950/80 text-blue-300 border border-blue-800/60 uppercase">
                        {rec.actionType.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-semibold text-white">
                        {rec.assetName}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        (Confidence: {(rec.confidence * 100).toFixed(0)}%)
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 mt-1.5 text-xs font-mono text-slate-300">
                      <span className="text-slate-400">{rec.sourceName}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-emerald-400 font-semibold">{rec.destinationName}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 md:text-right">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Allocation Amount</span>
                      <p className="text-base font-bold text-white font-mono tabular-nums">₹{(rec.amount / 10000000).toFixed(2)} Cr</p>
                      <span className="text-[10px] text-slate-500 font-mono">Switch Fee: ₹{rec.expectedCost.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        onClick={() => setActiveModalRec(rec)}
                        className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                        <span>Inspect Rationale</span>
                      </button>

                      <button
                        onClick={() => approveRecommendation(rec.id)}
                        className="px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm flex items-center space-x-1.5 transition cursor-pointer border border-emerald-500/50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Authorize &amp; Execute</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#070b12] border border-slate-800/80 text-xs text-slate-300 flex items-start space-x-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-white">Algorithmic Rationale: </span>
                    <span>{rec.reason}</span>
                    <span className="block text-[11px] text-slate-400 mt-0.5 font-mono">
                      Must execute before cutoff: {formatTimeIST(rec.cutoffTime)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
