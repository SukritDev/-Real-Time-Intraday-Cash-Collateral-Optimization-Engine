import React, { useState } from 'react';
import { useTreasury } from '../context/TreasuryContext';
import { Settings, Save, CheckCircle2, Sliders, Shield, Zap } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { state, updateTenantSettings } = useTreasury();

  const [crr, setCrr] = useState(state.tenantSettings.minCrrThreshold);
  const [slr, setSlr] = useState(state.tenantSettings.minSlrThreshold);
  const [lcr, setLcr] = useState(state.tenantSettings.minLcrThreshold);
  const [speed, setSpeed] = useState(state.tenantSettings.simulationSpeedMs);
  const [autoOpt, setAutoOpt] = useState(state.tenantSettings.autoOptimization);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateTenantSettings({
      minCrrThreshold: crr,
      minSlrThreshold: slr,
      minLcrThreshold: lcr,
      simulationSpeedMs: speed,
      autoOptimization: autoOpt
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-white tracking-wide uppercase">
            Tenant &amp; Regulatory Parameters Configuration
          </h2>
          <p className="text-xs text-slate-400">
            Tune statutory policy floors, solver execution cadence, and automated execution thresholds for {state.entityCode}.
          </p>
        </div>
      </div>

      {/* Settings Form */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-md space-y-6">
        {/* Regulatory Thresholds */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-800 pb-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span>Statutory Supervisory Floors</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Cash Reserve Ratio (CRR %)
              </label>
              <input
                type="number"
                step="0.1"
                value={crr}
                onChange={(e) => setCrr(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded p-2.5 text-xs font-mono focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">RBI Benchmark: 4.50%</span>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Statutory Liquidity Ratio (SLR %)
              </label>
              <input
                type="number"
                step="0.1"
                value={slr}
                onChange={(e) => setSlr(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded p-2.5 text-xs font-mono focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">RBI Benchmark: 18.00%</span>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Liquidity Coverage Ratio (LCR %)
              </label>
              <input
                type="number"
                step="1"
                value={lcr}
                onChange={(e) => setLcr(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded p-2.5 text-xs font-mono focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Basel III Floor: 100.0%</span>
            </div>
          </div>
        </div>

        {/* Engine Dynamics */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-800 pb-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            <span>Simulation Speed &amp; Automation</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Tick Interval (Simulation Cadence)
              </label>
              <select
                value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value, 10))}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded p-2.5 text-xs font-mono focus:ring-1 focus:ring-blue-500"
              >
                <option value={1000}>1,000 ms (Fast - High Frequency)</option>
                <option value={2000}>2,000 ms (Default Real-Time)</option>
                <option value={3000}>3,000 ms (Moderate)</option>
                <option value={5000}>5,000 ms (Low Overhead)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div>
                <span className="text-xs font-bold text-white block">Auto-Execute Optimizer</span>
                <span className="text-[10px] text-slate-400 block">
                  Automatically approve optimal transfer recommendations without manual intervention.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAutoOpt(!autoOpt)}
                className={`w-12 h-6 rounded-full transition-colors flex items-center p-1 cursor-pointer ${
                  autoOpt ? 'bg-emerald-600 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <span className="text-xs text-slate-500">Changes apply immediately to continuous background telemetry.</span>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saved ? 'PARAMETERS SAVED!' : 'APPLY CONFIGURATION'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
