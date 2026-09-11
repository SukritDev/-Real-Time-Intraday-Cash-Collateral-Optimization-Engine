import React, { useState } from 'react';
import { X, ArrowRightLeft, DollarSign, Calculator, RefreshCw } from 'lucide-react';
import { FXEngine } from '../services/fx.service';
import { useTreasury } from '../context/TreasuryContext';

interface FXCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FXCalculatorModal: React.FC<FXCalculatorModalProps> = ({ isOpen, onClose }) => {
  const { state } = useTreasury();
  const [fromCurr, setFromCurr] = useState('USD');
  const [toCurr, setToCurr] = useState('INR');
  const [amount, setAmount] = useState<number>(1000000);

  if (!isOpen) return null;

  const quote = FXEngine.quoteConversion(fromCurr, toCurr, amount, state.marketVolatility);

  const swapCurrencies = () => {
    const temp = fromCurr;
    setFromCurr(toCurr);
    setToCurr(temp);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="px-6 py-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-purple-400">
            <ArrowRightLeft className="w-5 h-5" />
            <h2 className="font-bold text-sm text-white tracking-wide uppercase">
              INSTITUTIONAL FX CONVERSION &amp; SPREAD QUOTE
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">From Currency</label>
              <select
                value={fromCurr}
                onChange={(e) => setFromCurr(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded p-2 text-xs font-semibold focus:ring-1 focus:ring-purple-500"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="INR">INR - Indian Rupee</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">To Currency</label>
              <select
                value={toCurr}
                onChange={(e) => setToCurr(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded p-2 text-xs font-semibold focus:ring-1 focus:ring-purple-500"
              >
                <option value="INR">INR - Indian Rupee</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>
          </div>

          <div className="flex justify-center -my-2">
            <button
              onClick={swapCurrencies}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-purple-400 border border-slate-700 transition cursor-pointer"
              title="Swap currencies"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Principal Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Math.max(1, parseFloat(e.target.value) || 0))}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded p-2.5 text-sm font-mono focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Quote breakdown card */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5 font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Indicative Cross Rate:</span>
              <span className="font-bold text-white">1 {fromCurr} = {quote.fxRate} {toCurr}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Volatility Spread:</span>
              <span className="text-amber-400">- {quote.spreadAmount.toLocaleString()} {toCurr}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Operational Transfer Fee:</span>
              <span className="text-slate-400">- {quote.operationalFee.toLocaleString()} {toCurr}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <span className="text-slate-300 font-sans font-bold">Net Received:</span>
              <span className="text-lg font-black text-emerald-400">
                {quote.netReceived.toLocaleString()} {toCurr}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic text-center">
            Spread automatically expands with market volatility index (currently {(state.marketVolatility * 100).toFixed(1)}%).
          </p>
        </div>

        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
