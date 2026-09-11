import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Play,
  Pause,
  ArrowRightLeft,
  Clock,
  Building,
  AlertTriangle,
  Flame,
  RotateCcw,
  Activity,
  CheckCircle2,
  ChevronDown,
  User,
  Radio,
  FileText
} from 'lucide-react';
import { useTreasury } from '../context/TreasuryContext';
import { EntityCode } from '../types';
import { formatDateTimeIST } from '../utils/dateUtils';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const {
    state,
    selectedEntity,
    setSelectedEntity,
    triggerShock,
    runOptimization,
    isLiveScriptRunning,
    scriptStepDescription,
    runLiveScriptDemo,
    isPaused,
    setIsPaused,
    setActiveFxModal
  } = useTreasury();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [showScenarioMenu, setShowScenarioMenu] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(formatDateTimeIST());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Executive Cockpit' },
    { id: 'liquidity', label: 'Liquidity & Nostro' },
    { id: 'collateral', label: 'Collateral & HQLA' },
    { id: 'optimizer', label: 'Optimization Solver' },
    { id: 'settlement', label: 'Settlement Monitor' },
    { id: 'stress', label: 'Stress Scenarios' },
    { id: 'network', label: 'Interbank Topology' },
    { id: 'regulatory', label: 'Regulatory Dossier' },
    { id: 'audit', label: 'Audit Ledger' },
    { id: 'settings', label: 'Desk Settings' }
  ];

  return (
    <header className="bg-[#0B0F19] border-b border-slate-800 text-slate-100 sticky top-0 z-40 select-none shadow-md">
      {/* Active Scenario Playback Banner (Clean institutional status) */}
      {isLiveScriptRunning && (
        <div className="bg-blue-950/80 border-b border-blue-800/60 px-6 py-1.5 text-xs text-blue-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
            <span className="font-semibold tracking-wide text-white uppercase text-[11px]">SCENARIO EXECUTION SEQUENCE ACTIVE:</span>
            <span className="font-mono text-blue-100 font-medium">{scriptStepDescription}</span>
          </div>
          <span className="text-[10px] font-mono text-blue-300 uppercase tracking-wider">Automated Supervisory Playback</span>
        </div>
      )}

      {/* Main Top Header Bar */}
      <div className="px-6 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand, Desk & Entity Selector */}
        <div className="flex items-center space-x-5">
          {/* Logo Monogram */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold tracking-wider text-sm text-white border border-blue-400/30 shadow-inner">
              TX
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold tracking-tight text-base text-white">TREASURYX</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  ILCMS v4.8
                </span>
                <span className="inline-flex items-center space-x-1 text-[10px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>LIVE FEED</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5">
                Intraday Liquidity &amp; Collateral Optimization System
              </p>
            </div>
          </div>

          {/* Institutional Entity Switcher */}
          <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-slate-800">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold leading-none">Institution Desk</span>
              <select
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value as EntityCode)}
                className="bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs font-medium text-slate-200 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer mt-0.5"
              >
                <option value="ALPHA">State Bank of India • Global Markets (LEI: 3358005Q7R0Y3P123456)</option>
                <option value="BETA">HDFC Bank • Institutional Treasury (LEI: 3358009K9L8M7N654321)</option>
                <option value="GAMMA">Tata Capital Financial • Wholesale NBFC (LEI: 3358004J3H2G1F098765)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Real-Time Market Ticker & Clocks */}
        <div className="hidden xl:flex items-center space-x-4 text-[11px] font-mono text-slate-400 border-l border-r border-slate-800 px-4 py-0.5">
          <div className="flex items-center space-x-1.5">
            <Radio className="w-3 h-3 text-emerald-400" />
            <span className="text-slate-500">RTGS:</span>
            <span className="text-slate-200 font-semibold">14ms</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500">TREPS:</span>
            <span className="text-slate-200 font-semibold">6.45%</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500">MIBOR 1D:</span>
            <span className="text-slate-200 font-semibold">6.50%</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center space-x-1.5 text-slate-300">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{currentTime || 'Syncing IST...'}</span>
          </div>
        </div>

        {/* Desk Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Scenario Trigger Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowScenarioMenu(!showScenarioMenu)}
              className="bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium px-2.5 py-1.5 rounded transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              <span>Stress Tests</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showScenarioMenu && (
              <div
                className="absolute right-0 mt-1 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-1 z-50 text-xs text-slate-200 divide-y divide-slate-800"
                onMouseLeave={() => setShowScenarioMenu(false)}
              >
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Supervisory Shock Triggers
                </div>
                <div>
                  <button
                    onClick={() => {
                      triggerShock('MARGIN_CALL');
                      setShowScenarioMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center space-x-2 transition"
                  >
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    <div>
                      <div className="font-semibold text-rose-300">CCP Margin Call (+40%)</div>
                      <div className="text-[10px] text-slate-400">Triggers intraday cash shortfall</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      triggerShock('RAIL_DELAY');
                      setShowScenarioMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center space-x-2 transition"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <div>
                      <div className="font-semibold text-amber-300">Payment Rail Latency Delay</div>
                      <div className="text-[10px] text-slate-400">Threatens settlement cutoff breach</div>
                    </div>
                  </button>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => {
                      triggerShock('RESET');
                      setShowScenarioMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 rounded flex items-center space-x-1.5 text-slate-300 transition"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-400" />
                    <span>Reset to Baseline Positions</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Scenario Sequence Walkthrough */}
          <button
            onClick={() => runLiveScriptDemo()}
            disabled={isLiveScriptRunning}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium px-2.5 py-1.5 rounded transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            title="Execute automated 30s supervisory rebalancing sequence"
          >
            <Play className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">{isLiveScriptRunning ? 'Simulating...' : 'Demo Walkthrough'}</span>
          </button>

          {/* FX Calculator Modal */}
          <button
            onClick={() => setActiveFxModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium px-2.5 py-1.5 rounded transition flex items-center space-x-1 cursor-pointer"
            title="Cross-Currency Nostro Matrix"
          >
            <ArrowRightLeft className="w-3 h-3 text-slate-400" />
            <span className="hidden sm:inline">FX Nostro</span>
          </button>

          {/* Feed Pause / Resume */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? 'Resume live feed (2000ms cadence)' : 'Pause feed'}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 p-1.5 rounded transition cursor-pointer"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
          </button>

          {/* Run LP Optimizer */}
          <button
            onClick={() => runOptimization()}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center space-x-1.5 shadow transition cursor-pointer border border-blue-500/50"
            title="Execute Linear Programming optimization solver [Ctrl+O]"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Run LP Solver</span>
          </button>

          {/* User Profile Pill */}
          <div className="hidden md:flex items-center space-x-2 pl-3 border-l border-slate-800">
            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-[10px] font-bold">
              SS
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-medium text-slate-200 leading-none">S. Sarkar</span>
              <span className="text-[9px] text-slate-400 leading-none mt-0.5">Chief Treasury Officer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="px-6 flex space-x-0.5 overflow-x-auto text-xs font-medium border-t border-slate-800/80 bg-[#070b12] scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 px-3 whitespace-nowrap transition-all border-b-2 cursor-pointer font-sans ${
              activeTab === tab.id
                ? 'border-blue-500 text-white font-semibold bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
};
