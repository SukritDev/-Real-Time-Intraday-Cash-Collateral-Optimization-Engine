import React, { useState } from 'react';
import { TreasuryProvider, useTreasury } from './context/TreasuryContext';
import { Navbar } from './components/Navbar';
import { ExplainabilityModal } from './components/ExplainabilityModal';
import { FXCalculatorModal } from './components/FXCalculatorModal';

import { ExecutiveDashboard } from './pages/ExecutiveDashboard';
import { LiquidityAccounts } from './pages/LiquidityAccounts';
import { CollateralManagement } from './pages/CollateralManagement';
import { OptimizationEngineView } from './pages/OptimizationEngineView';
import { SettlementControlTower } from './pages/SettlementControlTower';
import { StressTesting } from './pages/StressTesting';
import { SystemicRiskNetwork } from './pages/SystemicRiskNetwork';
import { RegulatoryReports } from './pages/RegulatoryReports';
import { AuditTrailView } from './pages/AuditTrailView';
import { SettingsView } from './pages/SettingsView';

const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const { activeModalRec, setActiveModalRec, approveRecommendation, activeFxModal, setActiveFxModal } = useTreasury();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ExecutiveDashboard />;
      case 'liquidity':
        return <LiquidityAccounts />;
      case 'collateral':
        return <CollateralManagement />;
      case 'optimizer':
        return <OptimizationEngineView />;
      case 'settlement':
        return <SettlementControlTower />;
      case 'stress':
        return <StressTesting />;
      case 'network':
        return <SystemicRiskNetwork />;
      case 'regulatory':
        return <RegulatoryReports />;
      case 'audit':
        return <AuditTrailView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <ExecutiveDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation & Controls */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main View Area */}
      <main className="flex-1 overflow-y-auto">
        {renderActiveView()}
      </main>

      {/* Bottom Status Bar */}
      <footer className="bg-[#0b0f19] border-t border-slate-800 px-5 py-2 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2 font-mono select-none">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-slate-300 font-semibold">SOLVER ENGINE: ONLINE (TICK: 2000ms | LATENCY: 8.4ms)</span>
          </span>
          <span className="text-slate-700">|</span>
          <span className="text-slate-400">CLEARING: CCIL DVP-III &bull; RBI E-KUBER RTGS (ISO 20022 MX)</span>
        </div>
        <div className="flex items-center space-x-4 text-slate-500">
          <span>FRAMEWORK: BASEL III / BCBS 248 INTRADAY</span>
          <span className="text-slate-400">SECURITY: SHA-256 SIGNED LEDGER</span>
          <span className="text-emerald-400 font-semibold">STATUS: NOMINAL</span>
        </div>
      </footer>

      {/* Modals */}
      <ExplainabilityModal
        rec={activeModalRec}
        onClose={() => setActiveModalRec(null)}
        onApprove={(id) => approveRecommendation(id)}
      />

      <FXCalculatorModal
        isOpen={activeFxModal}
        onClose={() => setActiveFxModal(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <TreasuryProvider>
      <MainContent />
    </TreasuryProvider>
  );
}

export default App;
