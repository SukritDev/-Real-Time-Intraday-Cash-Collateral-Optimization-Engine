import React, { useState } from 'react';
import { useTreasury } from '../context/TreasuryContext';
import { Shield, TrendingUp, Layers, CheckCircle, Search, Filter, Download, Info, Sliders } from 'lucide-react';

export const CollateralManagement: React.FC = () => {
  const { state } = useTreasury();
  const [assetClassFilter, setAssetClassFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!state) return null;

  const filteredCollateral = state.collateral.filter(col => {
    const matchesFilter = assetClassFilter === 'ALL' || col.type.includes(assetClassFilter);
    const matchesSearch =
      col.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      col.assetIdentifier.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalMarketVal = state.collateral.reduce((acc, c) => acc + c.marketValue, 0);
  const totalAdjustedVal = state.collateral.reduce((acc, c) => acc + c.adjustedValue, 0);
  const totalPledgedVal = state.collateral.reduce((acc, c) => acc + c.pledgedValue, 0);
  const totalAvailVal = state.collateral.reduce((acc, c) => acc + c.availableValue, 0);
  const weightedHaircut = totalMarketVal > 0 ? ((1 - (totalAdjustedVal / totalMarketVal)) * 100).toFixed(2) : '0.00';

  const exportCollateralCSV = () => {
    const headers = ['ISIN', 'Security Name', 'Type', 'Rating', 'Market Value', 'Base Haircut %', 'Effective Haircut %', 'Adjusted Value', 'Pledged Value', 'Available Value', 'Eligible CCPs'];
    const rows = filteredCollateral.map(c => [
      `"${c.assetIdentifier}"`,
      `"${c.name}"`,
      c.type,
      c.creditRating,
      c.marketValue,
      (c.baseHaircut * 100).toFixed(2),
      (c.effectiveHaircut * 100).toFixed(2),
      c.adjustedValue,
      c.pledgedValue,
      c.availableValue,
      `"${c.eligibleCCPs.join('; ')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TreasuryX_Collateral_Pool_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-5 space-y-5 max-w-[1720px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">
              Collateral Inventory &amp; Dynamic Haircut Valuation
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              HQLA LEVEL 1 &amp; 2A POOL
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Non-linear volatility-adjusted haircut schedule and cheapest-to-deliver (CTD) CCP margin allocation engine.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search ISIN / Security..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs text-white rounded pl-8 pr-3 py-1.5 focus:outline-none focus:border-blue-500 w-44 transition font-mono"
            />
          </div>

          {/* Filter tabs */}
          <div className="inline-flex rounded bg-slate-900 border border-slate-800 p-0.5 text-xs font-mono">
            {['ALL', 'GOVERNMENT', 'CORPORATE', 'CASH'].map(f => (
              <button
                key={f}
                onClick={() => setAssetClassFilter(f)}
                className={`px-2 py-1 rounded text-[11px] transition cursor-pointer ${
                  assetClassFilter === f
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Export CSV */}
          <button
            onClick={exportCollateralCSV}
            className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Aggregate Valuation Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Gross Market Value
          </span>
          <p className="text-xl font-bold font-mono text-white mt-1">₹{(totalMarketVal / 10000000).toFixed(2)} Cr</p>
          <span className="text-[11px] text-slate-500 block mt-0.5">Nominal Sovereign &amp; PSU Inventory</span>
        </div>
        <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
            Weighted Average Haircut
          </span>
          <p className="text-xl font-bold font-mono text-blue-400 mt-1">{weightedHaircut}%</p>
          <span className="text-[11px] text-slate-500 block mt-0.5">Implied Volatility Surcharge: +{(state.marketVolatility * 5).toFixed(2)}%</span>
        </div>
        <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
            Pledged to CCIL / CME
          </span>
          <p className="text-xl font-bold font-mono text-amber-400 mt-1">₹{(totalPledgedVal / 10000000).toFixed(2)} Cr</p>
          <span className="text-[11px] text-slate-500 block mt-0.5">Encumbered Initial &amp; Variation Margins</span>
        </div>
        <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
            Free Unencumbered Headroom
          </span>
          <p className="text-xl font-bold font-mono text-emerald-400 mt-1">₹{(totalAvailVal / 10000000).toFixed(2)} Cr</p>
          <span className="text-[11px] text-slate-500 block mt-0.5">Post-haircut liquidity buffer</span>
        </div>
      </div>

      {/* Model Rationale Box */}
      <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 text-xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white uppercase text-[11px]">Dynamic Valuation Formula:</span>
            <code className="font-mono text-blue-300 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-900/60 text-[11px]">
              H_k(σ) = H_base,k + α · max(0, σ_mkt - 0.15) + Δ_rating + CCP_surcharge
            </code>
          </div>
          <p className="text-[11px] text-slate-400">
            Market volatility benchmark is currently <span className="font-mono text-amber-300 font-semibold">{(state.marketVolatility * 100).toFixed(1)}%</span>. Non-linear haircuts compress collateral capacity automatically before central counterparty margin alerts trigger.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400 flex-shrink-0">
          <span>CLEARING CCP RULES:</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-semibold">CCIL DVP-III</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-semibold">CME TREASURY</span>
        </div>
      </div>

      {/* Collateral Table */}
      <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/90 text-slate-400 font-semibold uppercase text-[10px] tracking-wider font-mono">
                <th className="py-3 px-4">ISIN / Security</th>
                <th className="py-3 px-4">Asset Class</th>
                <th className="py-3 px-4 text-center">Credit Rating</th>
                <th className="py-3 px-4 text-right">Market Value</th>
                <th className="py-3 px-4 text-right">Base Haircut</th>
                <th className="py-3 px-4 text-right">Dynamic Haircut</th>
                <th className="py-3 px-4 text-right">Adjusted Collateral</th>
                <th className="py-3 px-4 text-right">Pledged</th>
                <th className="py-3 px-4 text-right">Available</th>
                <th className="py-3 px-4 text-center">Eligible CCPs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredCollateral.map((col) => (
                <tr key={col.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-sans font-semibold text-slate-200">
                    <p>{col.name}</p>
                    <span className="text-[10px] text-slate-500 font-mono block">{col.assetIdentifier}</span>
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-300">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-medium border border-slate-700">
                      {col.type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-blue-400">{col.creditRating}</td>
                  <td className="py-3 px-4 text-right font-bold text-white">
                    {col.currency === 'INR' ? `₹${(col.marketValue / 10000000).toFixed(2)} Cr` : `$${(col.marketValue / 1000000).toFixed(2)}M`}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400">{(col.baseHaircut * 100).toFixed(1)}%</td>
                  <td className="py-3 px-4 text-right font-bold text-amber-400">
                    {(col.effectiveHaircut * 100).toFixed(2)}%
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-400">
                    {col.currency === 'INR' ? `₹${(col.adjustedValue / 10000000).toFixed(2)} Cr` : `$${(col.adjustedValue / 1000000).toFixed(2)}M`}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400">
                    {col.currency === 'INR' ? `₹${(col.pledgedValue / 10000000).toFixed(2)} Cr` : `$${(col.pledgedValue / 1000000).toFixed(2)}M`}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-blue-400">
                    {col.currency === 'INR' ? `₹${(col.availableValue / 10000000).toFixed(2)} Cr` : `$${(col.availableValue / 1000000).toFixed(2)}M`}
                  </td>
                  <td className="py-3 px-4 text-center font-sans">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {col.eligibleCCPs.map((ccp, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] font-mono text-slate-300 border border-slate-700">
                          {ccp}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
