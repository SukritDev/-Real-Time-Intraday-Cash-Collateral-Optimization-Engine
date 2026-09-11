import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { SystemState, EntityCode, RecommendationItem, TenantConfig } from '../types';
import { MarketSimulator } from '../services/simulator.service';

interface TreasuryContextType {
  state: SystemState;
  selectedEntity: EntityCode;
  setSelectedEntity: (entity: EntityCode) => void;
  triggerShock: (type: 'MARKET_SHOCK' | 'MARGIN_CALL' | 'RAIL_DELAY' | 'RESET') => void;
  approveRecommendation: (id: string) => void;
  runOptimization: () => void;
  activeModalRec: RecommendationItem | null;
  setActiveModalRec: (rec: RecommendationItem | null) => void;
  isLiveScriptRunning: boolean;
  scriptStepDescription: string;
  runLiveScriptDemo: () => Promise<void>;
  isPaused: boolean;
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>;
  updateTenantSettings: (settings: Partial<TenantConfig>) => void;
  activeFxModal: boolean;
  setActiveFxModal: (open: boolean) => void;
}

const TreasuryContext = createContext<TreasuryContextType | undefined>(undefined);

export const TreasuryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedEntity, setSelectedEntity] = useState<EntityCode>('ALPHA');
  const [state, setState] = useState<SystemState>(() => MarketSimulator.getInstance('ALPHA').getState());
  const [activeModalRec, setActiveModalRec] = useState<RecommendationItem | null>(null);
  const [isLiveScriptRunning, setIsLiveScriptRunning] = useState(false);
  const [scriptStepDescription, setScriptStepDescription] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [activeFxModal, setActiveFxModal] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Sync state when entity changes
  useEffect(() => {
    const sim = MarketSimulator.getInstance(selectedEntity);
    setState({ ...sim.getState() });
  }, [selectedEntity]);

  // Real-time continuous 2000ms tick interval
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const sim = MarketSimulator.getInstance(selectedEntity);
    const intervalMs = state.tenantSettings.simulationSpeedMs || 2000;

    timerRef.current = window.setInterval(() => {
      const updated = sim.tick();
      setState({ ...updated });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [selectedEntity, isPaused, state.tenantSettings.simulationSpeedMs]);

  const triggerShock = useCallback((type: 'MARKET_SHOCK' | 'MARGIN_CALL' | 'RAIL_DELAY' | 'RESET') => {
    const sim = MarketSimulator.getInstance(selectedEntity);
    if (type === 'MARKET_SHOCK') sim.triggerMarketShock();
    else if (type === 'MARGIN_CALL') sim.triggerMarginCall();
    else if (type === 'RAIL_DELAY') sim.triggerRailDelay();
    else sim.resetDemo();

    setState({ ...sim.getState() });
  }, [selectedEntity]);

  const approveRecommendation = useCallback((id: string) => {
    const sim = MarketSimulator.getInstance(selectedEntity);
    const ok = sim.approveRecommendation(id);
    if (ok) {
      setState({ ...sim.getState() });
      setActiveModalRec(null);
    }
  }, [selectedEntity]);

  const runOptimization = useCallback(() => {
    const sim = MarketSimulator.getInstance(selectedEntity);
    const updated = sim.tick();
    setState({ ...updated });
  }, [selectedEntity]);

  const updateTenantSettings = useCallback((settings: Partial<TenantConfig>) => {
    const sim = MarketSimulator.getInstance(selectedEntity);
    sim.updateTenantSettings(settings);
    setState({ ...sim.getState() });
  }, [selectedEntity]);

  // Automated 30-Second Hackathon Judge Presentation Scripted Sequence
  const runLiveScriptDemo = useCallback(async () => {
    if (isLiveScriptRunning) return;
    setIsLiveScriptRunning(true);

    try {
      // Step 1 (0-3s): Reset to baseline clean state
      setScriptStepDescription('Step 1/5: Resetting to baseline optimal balance sheet...');
      triggerShock('RESET');
      await new Promise(r => setTimeout(r, 2500));

      // Step 2 (3-7s): Trigger Market Volatility & CCP Margin Spike
      setScriptStepDescription('Step 2/5: Market Volatility Spike! Clearing House (CCIL) margin call +₹8.50 Cr issued...');
      triggerShock('MARGIN_CALL');
      await new Promise(r => setTimeout(r, 3500));

      // Step 3 (7-11s): Trigger Payment Rail Lag
      setScriptStepDescription('Step 3/5: NEFT Payment Rail Degradation! Settlement #5412988 reaches 94% failure risk...');
      triggerShock('RAIL_DELAY');
      await new Promise(r => setTimeout(r, 3500));

      // Step 4 (11-16s): Run Optimizer & Pop Up Explainability
      setScriptStepDescription('Step 4/5: Intraday Optimization Engine solving constraints in <15ms...');
      runOptimization();
      await new Promise(r => setTimeout(r, 2000));

      const sim = MarketSimulator.getInstance(selectedEntity);
      const currentRecs = sim.getState().recommendations;
      if (currentRecs.length > 0) {
        setScriptStepDescription('Step 5/5: Opening Algorithmic Explainability Dossier: "Why this action?"');
        setActiveModalRec(currentRecs[0]);
      }
    } finally {
      setTimeout(() => {
        setIsLiveScriptRunning(false);
        setScriptStepDescription('');
      }, 4000);
    }
  }, [isLiveScriptRunning, selectedEntity, triggerShock, runOptimization]);

  return (
    <TreasuryContext.Provider
      value={{
        state,
        selectedEntity,
        setSelectedEntity,
        triggerShock,
        approveRecommendation,
        runOptimization,
        activeModalRec,
        setActiveModalRec,
        isLiveScriptRunning,
        scriptStepDescription,
        runLiveScriptDemo,
        isPaused,
        setIsPaused,
        updateTenantSettings,
        activeFxModal,
        setActiveFxModal
      }}
    >
      {children}
    </TreasuryContext.Provider>
  );
};

export const useTreasury = () => {
  const context = useContext(TreasuryContext);
  if (!context) throw new Error('useTreasury must be used within TreasuryProvider');
  return context;
};
