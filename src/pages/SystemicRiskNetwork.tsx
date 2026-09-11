import React, { useState } from 'react';
import { useTreasury } from '../context/TreasuryContext';
import { Network, Activity, ShieldAlert, ArrowRight, Layers, AlertTriangle } from 'lucide-react';

interface NetworkNode {
  id: string;
  name: string;
  type: 'TIER1_BANK' | 'CLEARING_CORP' | 'CENTRAL_BANK' | 'NBFC' | 'DEALER';
  status: 'HEALTHY' | 'STRESSED' | 'CRITICAL';
  x: number;
  y: number;
  liquidityBufferCr: number;
  unencumberedColCr: number;
  interbankExposureCr: number;
}

interface NetworkLink {
  source: string;
  target: string;
  exposureCr: number;
  flowDirection: 'FORWARD' | 'REVERSE' | 'BIDIRECTIONAL';
  status: 'ACTIVE' | 'CONGESTED' | 'DELAYED';
}

export const SystemicRiskNetwork: React.FC = () => {
  const { state } = useTreasury();

  const [selectedNodeId, setSelectedNodeId] = useState<string>('ALPHA');

  const nodes: NetworkNode[] = [
    {
      id: 'RBI',
      name: 'Reserve Bank of India (Settlement)',
      type: 'CENTRAL_BANK',
      status: 'HEALTHY',
      x: 400,
      y: 70,
      liquidityBufferCr: 12500,
      unencumberedColCr: 45000,
      interbankExposureCr: 8900
    },
    {
      id: 'CCIL',
      name: 'CCIL Clearing Corporation',
      type: 'CLEARING_CORP',
      status: state.marketVolatility > 0.4 ? 'STRESSED' : 'HEALTHY',
      x: 400,
      y: 220,
      liquidityBufferCr: 4200,
      unencumberedColCr: 18400,
      interbankExposureCr: 6200
    },
    {
      id: 'ALPHA',
      name: 'State Bank of India (Primary Dealer)',
      type: 'TIER1_BANK',
      status: state.kpis.systemicRiskLevel === 'CRITICAL' ? 'CRITICAL' : state.kpis.systemicRiskLevel === 'HIGH' ? 'STRESSED' : 'HEALTHY',
      x: 180,
      y: 360,
      liquidityBufferCr: state.kpis.totalCash / 10000000,
      unencumberedColCr: state.kpis.totalCollateral / 10000000,
      interbankExposureCr: 380
    },
    {
      id: 'BETA',
      name: 'HDFC Bank (Clearing Member)',
      type: 'TIER1_BANK',
      status: 'HEALTHY',
      x: 620,
      y: 360,
      liquidityBufferCr: 185,
      unencumberedColCr: 320,
      interbankExposureCr: 240
    },
    {
      id: 'GAMMA',
      name: 'Tata Capital Financial (Wholesale NBFC)',
      type: 'NBFC',
      status: state.marketVolatility > 0.35 ? 'STRESSED' : 'HEALTHY',
      x: 400,
      y: 450,
      liquidityBufferCr: 95,
      unencumberedColCr: 140,
      interbankExposureCr: 180
    },
    {
      id: 'APEX',
      name: 'Apex Investment Bank',
      type: 'DEALER',
      status: 'HEALTHY',
      x: 130,
      y: 190,
      liquidityBufferCr: 240,
      unencumberedColCr: 410,
      interbankExposureCr: 195
    },
    {
      id: 'CME',
      name: 'CME Clearing House',
      type: 'CLEARING_CORP',
      status: 'HEALTHY',
      x: 670,
      y: 190,
      liquidityBufferCr: 3100,
      unencumberedColCr: 9200,
      interbankExposureCr: 1200
    }
  ];

  const links: NetworkLink[] = [
    { source: 'ALPHA', target: 'CCIL', exposureCr: 38, flowDirection: 'BIDIRECTIONAL', status: 'ACTIVE' },
    { source: 'BETA', target: 'CCIL', exposureCr: 24, flowDirection: 'BIDIRECTIONAL', status: 'ACTIVE' },
    { source: 'GAMMA', target: 'ALPHA', exposureCr: 18, flowDirection: 'FORWARD', status: state.marketVolatility > 0.35 ? 'CONGESTED' : 'ACTIVE' },
    { source: 'CCIL', target: 'RBI', exposureCr: 620, flowDirection: 'BIDIRECTIONAL', status: 'ACTIVE' },
    { source: 'ALPHA', target: 'RBI', exposureCr: 58, flowDirection: 'FORWARD', status: 'ACTIVE' },
    { source: 'BETA', target: 'RBI', exposureCr: 45, flowDirection: 'FORWARD', status: 'ACTIVE' },
    { source: 'APEX', target: 'ALPHA', exposureCr: 19.5, flowDirection: 'BIDIRECTIONAL', status: 'ACTIVE' },
    { source: 'ALPHA', target: 'CME', exposureCr: 14.7, flowDirection: 'BIDIRECTIONAL', status: 'ACTIVE' },
    { source: 'GAMMA', target: 'BETA', exposureCr: 12, flowDirection: 'FORWARD', status: 'ACTIVE' }
  ];

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[2];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-white tracking-wide uppercase">
            Interbank Contagion &amp; Systemic Risk Topology
          </h2>
          <p className="text-xs text-slate-400">
            Directed graph topology modeling bilateral liquidity dependencies, CCP margin exposures, and default propagation vectors.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-xs font-mono text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded">
            Network Contagion Coefficient: <span className="text-amber-400 font-bold">0.342 (Stable)</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Canvas & Node Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Network Graph Canvas */}
        <div className="lg:col-span-2 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md relative min-h-[500px] flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 z-10">
            <span className="font-semibold text-white uppercase tracking-wider">Topological Network Map</span>
            <span>Click any node to inspect bilateral exposures</span>
          </div>

          {/* SVG Diagram */}
          <div className="w-full flex-1 flex items-center justify-center py-4">
            <svg viewBox="0 0 800 520" className="w-full h-auto max-h-[480px]">
              {/* Defs for gradients & markers */}
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
                </marker>
              </defs>

              {/* Render Links */}
              {links.map((link, idx) => {
                const s = nodes.find(n => n.id === link.source);
                const t = nodes.find(n => n.id === link.target);
                if (!s || !t) return null;

                const isCongested = link.status === 'CONGESTED';
                return (
                  <g key={idx}>
                    <line
                      x1={s.x}
                      y1={s.y}
                      x2={t.x}
                      y2={t.y}
                      stroke={isCongested ? '#f43f5e' : '#334155'}
                      strokeWidth={Math.min(5, Math.max(1.5, link.exposureCr / 10))}
                      strokeDasharray={isCongested ? '4 4' : undefined}
                      markerEnd="url(#arrow)"
                    />
                  </g>
                );
              })}

              {/* Render Nodes */}
              {nodes.map((node) => {
                const isSelected = node.id === selectedNodeId;
                const fillColor =
                  node.status === 'CRITICAL' ? '#f43f5e' :
                  node.status === 'STRESSED' ? '#f59e0b' : '#3b82f6';

                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className="cursor-pointer transition-transform hover:scale-110"
                  >
                    {/* Ring highlight if selected */}
                    {isSelected && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={28}
                        fill="none"
                        stroke="#60a5fa"
                        strokeWidth={2.5}
                        strokeDasharray="3 3"
                        className="animate-spin"
                      />
                    )}

                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.type === 'CENTRAL_BANK' || node.type === 'CLEARING_CORP' ? 22 : 18}
                      fill="#0f172a"
                      stroke={fillColor}
                      strokeWidth={3}
                    />

                    {/* Node ID label */}
                    <text
                      x={node.x}
                      y={node.y + 4}
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize={10}
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {node.id}
                    </text>

                    {/* Full Name label beneath */}
                    <text
                      x={node.x}
                      y={node.y + 32}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize={10}
                      fontWeight="600"
                    >
                      {node.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex items-center space-x-4 text-[11px] text-slate-400 z-10 border-t border-slate-800 pt-2 font-mono">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
              <span>Healthy Node</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
              <span>Stressed Node</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
              <span>Critical Risk</span>
            </span>
          </div>
        </div>

        {/* Node Inspector Panel */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
            <Network className="w-4 h-4" />
            <span>Counterparty &amp; Node Telemetry</span>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Inspected Entity</span>
              <p className="text-base font-extrabold text-white mt-0.5">{selectedNode.name}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {selectedNode.type}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  selectedNode.status === 'HEALTHY'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : selectedNode.status === 'STRESSED'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}>
                  {selectedNode.status}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Liquidity Buffer:</span>
                <span className="font-bold text-emerald-400">₹{selectedNode.liquidityBufferCr.toFixed(2)} Cr</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Unencumbered Collateral:</span>
                <span className="font-bold text-blue-400">₹{selectedNode.unencumberedColCr.toFixed(2)} Cr</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Interbank Exposure:</span>
                <span className="font-bold text-amber-400">₹{selectedNode.interbankExposureCr.toFixed(2)} Cr</span>
              </div>
            </div>
          </div>

          {/* Bilateral Connections */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Active Bilateral Links ({links.filter(l => l.source === selectedNode.id || l.target === selectedNode.id).length})
            </span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {links
                .filter(l => l.source === selectedNode.id || l.target === selectedNode.id)
                .map((link, idx) => {
                  const counterpartId = link.source === selectedNode.id ? link.target : link.source;
                  const counterpart = nodes.find(n => n.id === counterpartId);
                  return (
                    <div key={idx} className="p-2.5 rounded bg-slate-950 border border-slate-800 text-xs font-mono flex items-center justify-between">
                      <div>
                        <span className="text-slate-300 font-bold">{counterpart?.name || counterpartId}</span>
                        <span className="text-[10px] text-slate-500 block">Direction: {link.flowDirection}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-blue-400 font-bold">₹{link.exposureCr} Cr</span>
                        <span className="text-[10px] text-emerald-400 block">{link.status}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
