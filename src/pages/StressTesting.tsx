import React, { useState } from 'react';
import { useTreasury } from '../context/TreasuryContext';
import { StressTestingService } from '../services/stress.service';
import { StressScenarioResult } from '../types';
import { Flame, AlertTriangle, ShieldAlert, ArrowRight, Play, RefreshCw, Zap, Activity } from 'lucide-react';

export const StressTesting: React.FC = () => {
  const { state } = useTreasury();

  const scenarios = [
    'CCP Margin Shock & Cascading Haircut Devaluation',
    'Major Settlement Bank Failure & RTGS Blackout',
    'Massive Intraday Corporate Client Deposit Flight',
    'Sovereign Yield Curve Shift (+150 bps Intraday)'
  ];

  const [selectedScenario, setSelectedScenario] = useState<string>(scenarios[0]);
  const [intensity, setIntensity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME'>('HIGH');
  const [result, setResult] = useState<StressScenarioResult | null>(() => {
    return StressTestingService.executeScenario(scenarios[0], 'HIGH', state.kpis.lcr, state.kpis.crr);
  });
  const [isSimulating, setIsSimulating] = useState(false);

  const runSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const res = StressTestingService.executeScenario(selectedScenario, intensity, state.kpis.lcr, state.kpis.crr);
      setResult(res);
      setIsSimulating(false);
    }, 400);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-white tracking-wide uppercase">
            Intraday Tail-Risk &amp; Stress Testing Engine
          </h2>
          <p className="text-xs text-slate-400">
            Simulate systemic liquidity shocks, cascading margin calls, and clearing member default propagation.
          </p>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded">
          Stress Framework: <span className="text-purple-400 font-bold">BCBS 238 &amp; RBI Stress Norms</span>
        </div>
      </div>

      {/* Scenario & Shock Configurator */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Select Stress Scenario
            </label>
            <div className="space-y-2">
              {scenarios.map((sc) => (
                <button
                  key={sc}
                  onClick={() => setSelectedScenario(sc)}
                  className={`w-full text-left p-3 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                    selectedScenario === sc
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Flame className={`w-4 h-4 ${selectedScenario === sc ? 'text-blue-400' : 'text-slate-500'}`} />
                    <span>{sc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Shock Severity Intensity
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['LOW', 'MEDIUM', 'HIGH', 'EXTREME'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setIntensity(lvl)}
                    className={`py-2.5 rounded text-xs font-black transition cursor-pointer uppercase ${
                      intensity === lvl
                        ? lvl === 'EXTREME'
                          ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                          : lvl === 'HIGH'
                          ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                          : 'bg-blue-600 text-white'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
              <span className="font-bold text-slate-300 block">Active Simulation Parameters:</span>
              <p className="text-[11px]">
                Intensity <span className="text-white font-mono">{intensity}</span> applies a{' '}
                <span className="text-amber-400 font-mono">
                  {intensity === 'EXTREME' ? '4.0x' : intensity === 'HIGH' ? '2.5x' : intensity === 'MEDIUM' ? '1.5x' : '1.0x'}
                </span>{' '}
                multiplier against baseline volatility, widening dynamic haircuts and depleting available liquidity buffers.
              </p>
            </div>

            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className="w-full py-2.5 rounded bg-rose-700 hover:bg-rose-600 text-white font-semibold text-xs shadow-sm flex items-center justify-center space-x-2 transition cursor-pointer disabled:opacity-50 border border-rose-600/50"
            >
              <ShieldAlert className="w-4 h-4 text-rose-200" />
              <span>{isSimulating ? 'Simulating Contagion Cascade...' : 'Execute Stress Simulation'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stress Results Display */}
      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Post-Stress Impact Matrix ({result.scenarioName})</span>
            </h3>
            <span className="text-xs font-mono text-rose-400 font-bold">
              EST. RECOVERY: {result.estimatedRecoveryMinutes} MINUTES
            </span>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cash Depletion</span>
              <p className="text-base font-black text-rose-400 mt-1">₹{(result.cashImpactAmount / 10000000).toFixed(2)} Cr</p>
              <span className="text-[10px] text-slate-500">Immediate Liquidity Outflow</span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Collateral Deval.</span>
              <p className="text-base font-black text-rose-400 mt-1">₹{(result.collateralDevaluation / 10000000).toFixed(2)} Cr</p>
              <span className="text-[10px] text-slate-500">Haircut Spread Widening</span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Post-Stress LCR</span>
              <p className={`text-base font-black mt-1 ${result.postStressLcr < 100 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {result.postStressLcr}%
              </p>
              <span className="text-[10px] text-slate-500">Floor: 100.0%</span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Post-Stress CRR</span>
              <p className={`text-base font-black mt-1 ${result.postStressCrr < 4.5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {result.postStressCrr}%
              </p>
              <span className="text-[10px] text-slate-500">Floor: 4.50%</span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Margin Shortfall</span>
              <p className="text-base font-black text-amber-400 mt-1">₹{(result.marginShortfall / 10000000).toFixed(2)} Cr</p>
              <span className="text-[10px] text-slate-500">CCIL Margin Deficit</span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Predicted Fails</span>
              <p className="text-base font-black text-rose-400 mt-1">{result.predictedSettlementFailures} Txns</p>
              <span className="text-[10px] text-slate-500">Cutoff Breaches</span>
            </div>
          </div>

          {/* Step-by-Step Cascading Contagion Chain */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-purple-400" />
              <span>Cascading Contagion Propagation Chain (Transmission Mechanism)</span>
            </h4>
            <div className="space-y-2">
              {result.systemicPropagationChain.map((step, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300">
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
