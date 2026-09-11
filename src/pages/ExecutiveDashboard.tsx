import React from 'react';
import { useTreasury } from '../context/TreasuryContext';
import { formatTimeIST } from '../utils/dateUtils';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid
} from 'recharts';
import {
  AlertOctagon,
  CheckCircle2,
  TrendingUp,
  Activity,
  ShieldCheck,
  Sliders,
  ArrowRight,
  Clock,
  Layers,
  HelpCircle,
  TrendingDown
} from 'lucide-react';

export const ExecutiveDashboard: React.FC = () => {
  const { state, setActiveModalRec, approveRecommendation, runOptimization } = useTreasury();

  if (!state) return null;

  const cashMillions = state.kpis.totalCash / 1000000;
  const colMillions = state.kpis.totalCollateral / 1000000;

  const intradayFlowData = [
    { time: '09:00', cash: Math.round(cashMillions * 0.94), collateral: Math.round(colMillions * 0.98) },
    { time: '10:30', cash: Math.round(cashMillions * 0.98), collateral: Math.round(colMillions * 0.99) },
    { time: '12:00', cash: Math.round(cashMillions * 1.02), collateral: Math.round(colMillions * 1.01) },
    { time: '13:30', cash: Math.round(cashMillions * 0.99), collateral: Math.round(colMillions * 1.00) },
    { time: '15:00', cash: Math.round(cashMillions * 1.04), collateral: Math.round(colMillions * 1.03) },
    { time: '16:30', cash: Math.round(cashMillions * 1.01), collateral: Math.round(colMillions * 1.01) },
    { time: '17:00 (Close)', cash: Math.round(cashMillions * 1.06), collateral: Math.round(colMillions * 1.02) }
  ];

  const formatCr = (val: number) => `₹${(val / 10000000).toFixed(2)} Cr`;

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Real-Time Action Advisory / Directive */}
      {state.recommendations.length > 0 ? (
        <div className="p-4 rounded-lg bg-[#0E1726] border border-blue-900/60 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-2 rounded bg-blue-600/20 border border-blue-500/40 text-blue-400 mt-0.5">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h3 className="text-xs font-bold tracking-wide text-white uppercase font-sans">
                  Intraday Optimization Opportunity ({state.recommendations.length} Pending Directive{state.recommendations.length > 1 ? 's' : ''})
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                  Breach Prevention
                </span>
                <span className="text-[11px] font-mono text-amber-300 flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Execution Cutoff: {formatTimeIST(state.recommendations[0].cutoffTime)}</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                {state.recommendations[0].reason}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 flex-shrink-0">
            <button
              onClick={() => setActiveModalRec(state.recommendations[0])}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition flex items-center space-x-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Algorithmic Rationale</span>
            </button>
            <button
              onClick={() => approveRecommendation(state.recommendations[0].id)}
              className="px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-sm flex items-center space-x-1.5 transition cursor-pointer border border-emerald-500/60"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Authorize ₹{(state.recommendations[0].amount / 10000000).toFixed(2)} Cr Transfer</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-lg bg-[#0E1726] border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 text-xs text-emerald-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-medium text-slate-200">
              Optimal Balance Sheet Equilibrium: CRR (4.50%), SLR (18.00%), and LCR (100.00%) prudential floors are satisfied with unencumbered margin coverage.
            </span>
          </div>
          <button
            onClick={() => runOptimization()}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-xs font-medium flex items-center space-x-1 cursor-pointer"
          >
            <Sliders className="w-3 h-3 text-slate-400" />
            <span>Recalculate Model</span>
          </button>
        </div>
      )}

      {/* 12 Key Institutional Position & Regulatory Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          {
            label: 'Total Cash Position',
            value: formatCr(state.kpis.totalCash),
            sub: '9 Operating & Settlement Accounts',
            color: 'text-white'
          },
          {
            label: 'Unencumbered Liquidity',
            value: formatCr(state.kpis.availableLiquidity),
            sub: 'Instant Free Liquidity Buffer',
            color: 'text-emerald-400'
          },
          {
            label: 'Total Collateral Pool',
            value: formatCr(state.kpis.totalCollateral),
            sub: 'G-Sec, T-Bills, AAA Corporate',
            color: 'text-white'
          },
          {
            label: 'Available Collateral',
            value: formatCr(state.kpis.availableCollateral),
            sub: 'Post Haircut Borrowing Capacity',
            color: 'text-blue-400'
          },
          {
            label: 'Required CCP Margin',
            value: formatCr(state.kpis.requiredCcpMargin),
            sub: 'CCIL Triparty & DVP Margin',
            color: 'text-amber-400'
          },
          {
            label: 'Liquidity Coverage Ratio (LCR)',
            value: `${state.kpis.lcr}%`,
            sub: 'RBI Baseline Floor: 100%',
            color: state.kpis.lcr < 100 ? 'text-rose-400 font-bold' : 'text-emerald-400'
          },
          {
            label: 'Cash Reserve Ratio (CRR)',
            value: `${state.kpis.crr}%`,
            sub: 'RBI Statutory Minimum: 4.50%',
            color: state.kpis.crr < 4.5 ? 'text-rose-400 font-bold' : 'text-emerald-400'
          },
          {
            label: 'Statutory Liquidity (SLR)',
            value: `${state.kpis.slr}%`,
            sub: 'RBI Statutory Minimum: 18.00%',
            color: state.kpis.slr < 18.0 ? 'text-rose-400 font-bold' : 'text-emerald-400'
          },
          {
            label: 'Net FX Exposure',
            value: formatCr(state.kpis.fxExposure),
            sub: 'USD, EUR & GBP Nostro Total',
            color: 'text-slate-200'
          },
          {
            label: 'At-Risk Settlements',
            value: state.kpis.atRiskSettlementsCount,
            sub: 'Cutoff Proximity Warnings',
            color: state.kpis.atRiskSettlementsCount > 0 ? 'text-amber-400 font-bold' : 'text-slate-300'
          },
          {
            label: 'Predicted Fails (EOD)',
            value: state.kpis.predictedFailuresCount,
            sub: 'High Probability Default Risk',
            color: state.kpis.predictedFailuresCount > 0 ? 'text-rose-400 font-bold' : 'text-slate-300'
          },
          {
            label: 'Cost Friction Avoided',
            value: `₹${state.kpis.projectedOptimizationSavings.toLocaleString()}`,
            sub: 'Penalties & Overdraft Avoided',
            color: 'text-emerald-400 font-semibold'
          }
        ].map((kpi, idx) => (
          <div key={idx} className="p-3 rounded-lg bg-[#0E1726] border border-slate-800 shadow-sm hover:border-slate-700 transition">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
              {kpi.label}
            </span>
            <p className={`text-base font-bold mt-1 font-mono tracking-tight tabular-nums ${kpi.color}`}>
              {kpi.value}
            </p>
            <span className="text-[10px] text-slate-500 block mt-0.5 truncate font-sans">{kpi.sub}</span>
          </div>
        ))}
      </div>

      {/* Primary Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Intraday Liquidity Trajectory */}
        <div className="p-4 rounded-lg bg-[#0E1726] border border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Intraday Liquidity &amp; Collateral Trajectory
              </h3>
              <p className="text-[11px] text-slate-400">Simulated Cumulative Inflow/Outflow Path (in Millions ₹)</p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono">
              <span className="flex items-center space-x-1 text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span>
                <span>Cash Buffer</span>
              </span>
              <span className="flex items-center space-x-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                <span>Collateral Pool</span>
              </span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={intradayFlowData}>
                <defs>
                  <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} domain={['auto', 'auto']} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', borderRadius: '6px', fontSize: '11px', color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="cash" name="Cash Buffer (₹M)" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCash)" />
                <Area type="monotone" dataKey="collateral" name="Eligible Collateral (₹M)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCol)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Rails Throughput & Latency */}
        <div className="p-4 rounded-lg bg-[#0E1726] border border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Clearing Rails Latency &amp; Queue Telemetry
              </h3>
              <p className="text-[11px] text-slate-400">Average Processing Latency (ms) Across Domestic Clearing Rails</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
              GATEWAYS OPERATIONAL
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={state.paymentRails}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', borderRadius: '6px', fontSize: '11px', color: '#f8fafc' }}
                />
                <Bar dataKey="avgLatencyMs" name="Avg Latency (ms)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Systemic Risk Telemetry & Market Quotes Bar */}
      <div className="p-3.5 rounded-lg bg-[#0E1726] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded ${
            state.kpis.systemicRiskLevel === 'CRITICAL' ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60' :
            state.kpis.systemicRiskLevel === 'HIGH' ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60' : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
          }`}>
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white uppercase">Interbank Contagion Index</span>
              <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                state.kpis.systemicRiskLevel === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                state.kpis.systemicRiskLevel === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {state.kpis.systemicRiskLevel} ({state.kpis.systemicRiskScore}/100)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Derived from market volatility ({(state.marketVolatility * 100).toFixed(1)}%), payment rail failure probabilities, and interbank exposure limits.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px]">USD/INR:</span>
            <span className="text-slate-200 font-semibold">{state.fxRates.USD}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">EUR/INR:</span>
            <span className="text-slate-200 font-semibold">{state.fxRates.EUR}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">GBP/INR:</span>
            <span className="text-slate-200 font-semibold">{state.fxRates.GBP}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
