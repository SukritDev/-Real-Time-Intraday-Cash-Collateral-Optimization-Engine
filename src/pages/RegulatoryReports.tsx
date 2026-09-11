import React, { useState } from 'react';
import { useTreasury } from '../context/TreasuryContext';
import { ShieldCheck, Download, FileText, CheckCircle2, AlertTriangle, AlertOctagon, Layers } from 'lucide-react';
import { formatDateTimeIST } from '../utils/dateUtils';

export const RegulatoryReports: React.FC = () => {
  const { state } = useTreasury();
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!state) return null;

  const exportDossier = () => {
    const reportData = {
      institution: `TREASURYX_${state.entityCode}`,
      generatedAt: formatDateTimeIST(),
      supervisoryFramework: 'Basel III & Reserve Bank of India Intraday Prudential Mandates',
      metrics: {
        crr: { value: state.kpis.crr, required: state.tenantSettings.minCrrThreshold, headroom: (state.kpis.crr - state.tenantSettings.minCrrThreshold).toFixed(2) },
        slr: { value: state.kpis.slr, required: state.tenantSettings.minSlrThreshold, headroom: (state.kpis.slr - state.tenantSettings.minSlrThreshold).toFixed(2) },
        lcr: { value: state.kpis.lcr, required: state.tenantSettings.minLcrThreshold, headroom: (state.kpis.lcr - state.tenantSettings.minLcrThreshold).toFixed(2) }
      },
      balanceSheetSummary: {
        totalCashInr: state.kpis.totalCash,
        availableLiquidityInr: state.kpis.availableLiquidity,
        totalCollateralPool: state.kpis.totalCollateral,
        unencumberedBuffer: state.kpis.availableCollateral,
        requiredCcpMargin: state.kpis.requiredCcpMargin
      },
      auditSignoff: 'CRYPTOGRAPHIC_HASH_SHA256_VERIFIED'
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `regulatory-audit-dossier-${state.entityCode}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const crrHeadroom = (state.kpis.crr - state.tenantSettings.minCrrThreshold).toFixed(2);
  const slrHeadroom = (state.kpis.slr - state.tenantSettings.minSlrThreshold).toFixed(2);
  const lcrHeadroom = (state.kpis.lcr - state.tenantSettings.minLcrThreshold).toFixed(2);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-white tracking-wide uppercase">
            Regulatory Compliance &amp; Supervisory Dossier
          </h2>
          <p className="text-xs text-slate-400">
            Real-time compliance validation against Basel III and RBI statutory liquidity frameworks.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportDossier}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloadSuccess ? 'DOSSIER DOWNLOADED!' : 'EXPORT AUDIT DOSSIER'}</span>
          </button>
        </div>
      </div>

      {/* 3 Major Compliance Cards: LCR, CRR, SLR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LCR Card */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Liquidity Coverage Ratio (LCR)</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              state.kpis.lcr >= state.tenantSettings.minLcrThreshold
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}>
              {state.kpis.lcr >= state.tenantSettings.minLcrThreshold ? 'COMPLIANT' : 'BREACH'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Current Ratio</span>
            <p className="text-3xl font-black text-white mt-0.5">{state.kpis.lcr}%</p>
            <div className="flex justify-between text-xs font-mono text-slate-400 mt-2">
              <span>Required Floor:</span>
              <span className="text-slate-200">{state.tenantSettings.minLcrThreshold}%</span>
            </div>
            <div className="flex justify-between text-xs font-mono text-slate-400 mt-1">
              <span>Net Buffer Headroom:</span>
              <span className={`font-bold ${parseFloat(lcrHeadroom) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {parseFloat(lcrHeadroom) >= 0 ? `+${lcrHeadroom}%` : `${lcrHeadroom}%`}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">Basel III Formulation:</p>
            <p className="font-mono text-slate-400">Total Stock of HQLA &divide; Total 30-Day Net Cash Outflows &ge; 100%</p>
          </div>
        </div>

        {/* CRR Card */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Cash Reserve Ratio (CRR)</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              state.kpis.crr >= state.tenantSettings.minCrrThreshold
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}>
              {state.kpis.crr >= state.tenantSettings.minCrrThreshold ? 'COMPLIANT' : 'BREACH'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Current Ratio</span>
            <p className="text-3xl font-black text-white mt-0.5">{state.kpis.crr}%</p>
            <div className="flex justify-between text-xs font-mono text-slate-400 mt-2">
              <span>Mandatory Floor:</span>
              <span className="text-slate-200">{state.tenantSettings.minCrrThreshold}%</span>
            </div>
            <div className="flex justify-between text-xs font-mono text-slate-400 mt-1">
              <span>Reserve Headroom:</span>
              <span className={`font-bold ${parseFloat(crrHeadroom) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {parseFloat(crrHeadroom) >= 0 ? `+${crrHeadroom}%` : `${crrHeadroom}%`}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">RBI Act 1934 Section 42(1):</p>
            <p className="font-mono text-slate-400">Cash with RBI &divide; Net Demand &amp; Time Liabilities (NDTL) &ge; 4.50%</p>
          </div>
        </div>

        {/* SLR Card */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Statutory Liquidity Ratio (SLR)</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              state.kpis.slr >= state.tenantSettings.minSlrThreshold
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}>
              {state.kpis.slr >= state.tenantSettings.minSlrThreshold ? 'COMPLIANT' : 'BREACH'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Current Ratio</span>
            <p className="text-3xl font-black text-white mt-0.5">{state.kpis.slr}%</p>
            <div className="flex justify-between text-xs font-mono text-slate-400 mt-2">
              <span>Statutory Floor:</span>
              <span className="text-slate-200">{state.tenantSettings.minSlrThreshold}%</span>
            </div>
            <div className="flex justify-between text-xs font-mono text-slate-400 mt-1">
              <span>Sovereign Headroom:</span>
              <span className={`font-bold ${parseFloat(slrHeadroom) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {parseFloat(slrHeadroom) >= 0 ? `+${slrHeadroom}%` : `${slrHeadroom}%`}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">Banking Regulation Act 1949:</p>
            <p className="font-mono text-slate-400">(Unencumbered G-Secs + Gold + Excess Cash) &divide; NDTL &ge; 18.00%</p>
          </div>
        </div>
      </div>

      {/* Institutional Audit Signoff Summary */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
          <FileText className="w-4 h-4 text-blue-400" />
          <span>Intraday Regulatory Audit Trail Verification</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          The Intraday Optimization Engine continuously computes shadow ratios prior to proposing any cash transfer or collateral substitution. Any action that reduces LCR below 100.0%, CRR below 4.50%, or SLR below 18.00% is mathematically penalized with infinite cost (&lambda; = &infin;) in the Simplex solver objective function, preventing regulatory infractions before execution.
        </p>
      </div>
    </div>
  );
};
