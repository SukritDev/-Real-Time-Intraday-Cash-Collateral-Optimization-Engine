import React, { useState } from 'react';
import { useTreasury } from '../context/TreasuryContext';
import { Building2, ArrowUpRight, ArrowDownRight, RefreshCcw, Filter, DollarSign, Wallet, ShieldAlert, Search, Download, ArrowRightLeft } from 'lucide-react';

export const LiquidityAccounts: React.FC = () => {
  const { state, setActiveFxModal } = useTreasury();
  const [currencyFilter, setCurrencyFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!state) return null;

  const filteredAccounts = state.accounts.filter(a => {
    const matchesCurrency = currencyFilter === 'ALL' || a.currency === currencyFilter;
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.accountNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCurrency && matchesSearch;
  });

  const totalInr = state.accounts
    .filter(a => a.currency === 'INR')
    .reduce((sum, a) => sum + a.cashBalance, 0);

  const availableInr = state.accounts
    .filter(a => a.currency === 'INR')
    .reduce((sum, a) => sum + a.availableBalance, 0);

  const reservedInr = state.accounts
    .filter(a => a.currency === 'INR')
    .reduce((sum, a) => sum + a.reservedBalance, 0);

  const exportAccountsCSV = () => {
    const headers = ['Account Name', 'Account Number', 'Currency', 'Cash Balance', 'Available', 'Reserved', 'Min Required', 'Status'];
    const rows = filteredAccounts.map(a => [
      `"${a.name}"`,
      `"${a.accountNumber}"`,
      a.currency,
      a.cashBalance,
      a.availableBalance,
      a.reservedBalance,
      a.minRequiredBalance,
      a.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TreasuryX_Liquidity_Accounts_${new Date().toISOString().slice(0, 10)}.csv`);
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
              Multi-Account Liquidity Architecture &amp; Nostro Ledgers
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              LEDGER: REAL-TIME RTGS / CCIL
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Continuous balance tracking across statutory reserve (RBI CRR), clearing margins (CCIL), and cross-border nostro correspondent accounts.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search account / IBAN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs text-white rounded pl-8 pr-3 py-1.5 focus:outline-none focus:border-blue-500 w-48 transition"
            />
          </div>

          {/* Currency selector chips */}
          <div className="inline-flex rounded bg-slate-900 border border-slate-800 p-0.5 text-xs font-mono">
            {['ALL', 'INR', 'USD', 'EUR', 'GBP'].map(curr => (
              <button
                key={curr}
                onClick={() => setCurrencyFilter(curr)}
                className={`px-2 py-1 rounded text-[11px] transition cursor-pointer ${
                  currencyFilter === curr
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>

          {/* Export CSV button */}
          <button
            onClick={exportAccountsCSV}
            className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer"
            title="Download account balances as CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* FX Rates Calculator */}
          <button
            onClick={() => setActiveFxModal(true)}
            className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">FX Rates</span>
          </button>
        </div>
      </div>

      {/* Aggregate Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Domestic INR Holdings
          </span>
          <p className="text-xl font-bold font-mono text-white mt-1">₹{(totalInr / 10000000).toFixed(2)} Cr</p>
          <span className="text-[11px] text-slate-500 block mt-0.5">Includes Operating, CCP Margins &amp; RBI Reserve Balances</span>
        </div>
        <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
            Unencumbered Available Balance
          </span>
          <p className="text-xl font-bold font-mono text-emerald-400 mt-1">₹{(availableInr / 10000000).toFixed(2)} Cr</p>
          <span className="text-[11px] text-slate-500 block mt-0.5">Freely deployable for settlement queue clearing</span>
        </div>
        <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
            Reserved / Encumbered Balances
          </span>
          <p className="text-xl font-bold font-mono text-amber-400 mt-1">₹{(reservedInr / 10000000).toFixed(2)} Cr</p>
          <span className="text-[11px] text-slate-500 block mt-0.5">Committed to statutory minimums &amp; clearing house margin pledges</span>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/90 text-slate-400 font-semibold uppercase text-[10px] tracking-wider font-mono">
                <th className="py-3 px-4">Account Designation</th>
                <th className="py-3 px-4">Identifier / IBAN</th>
                <th className="py-3 px-4 text-center">CCY</th>
                <th className="py-3 px-4 text-right">Cash Balance</th>
                <th className="py-3 px-4 text-right">Available</th>
                <th className="py-3 px-4 text-right">Reserved</th>
                <th className="py-3 px-4 text-right">Floor Limit</th>
                <th className="py-3 px-4 text-center">Buffer Headroom</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredAccounts.map((acc) => {
                const isWarning = acc.availableBalance < acc.minRequiredBalance;
                const headroomPct = Math.round((acc.availableBalance / (acc.cashBalance || 1)) * 100);

                return (
                  <tr key={acc.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-sans font-semibold text-slate-200 flex items-center space-x-2">
                      <Building2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                      <span>{acc.name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{acc.accountNumber}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-700">
                        {acc.currency}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-white">
                      {acc.currency === 'INR' ? `₹${(acc.cashBalance / 10000000).toFixed(2)} Cr` : `${acc.cashBalance.toLocaleString()} ${acc.currency}`}
                    </td>
                    <td className={`py-3 px-4 text-right font-bold ${isWarning ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {acc.currency === 'INR' ? `₹${(acc.availableBalance / 10000000).toFixed(2)} Cr` : `${acc.availableBalance.toLocaleString()} ${acc.currency}`}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      {acc.currency === 'INR' ? `₹${(acc.reservedBalance / 10000000).toFixed(2)} Cr` : `${acc.reservedBalance.toLocaleString()} ${acc.currency}`}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500">
                      {acc.currency === 'INR' ? `₹${(acc.minRequiredBalance / 10000000).toFixed(2)} Cr` : `${acc.minRequiredBalance.toLocaleString()} ${acc.currency}`}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${headroomPct > 50 ? 'bg-emerald-500' : headroomPct > 20 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${Math.min(headroomPct, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono w-7 text-right">{headroomPct}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        acc.status === 'ACTIVE' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                      }`}>
                        {acc.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
