import { FXConversionQuote } from '../types';

/**
 * TREASURYX FX CONVERSION & SPREAD ENGINE
 */
export class FXEngine {
  private static baseRatesToINR: Record<string, number> = {
    INR: 1.0,
    USD: 83.25,
    EUR: 90.15,
    GBP: 105.40
  };

  public static getRate(curr: string, volatilityMultiplier: number = 1.0): number {
    const base = this.baseRatesToINR[curr] || 1.0;
    return base * (1 + (volatilityMultiplier - 1) * 0.02);
  }

  public static quoteConversion(
    from: string,
    to: string,
    amount: number,
    marketVol: number
  ): FXConversionQuote {
    const rateFrom = this.getRate(from, 1 + marketVol);
    const rateTo = this.getRate(to, 1 + marketVol);
    const crossRate = rateFrom / rateTo;

    // Spread increases with volatility
    const spreadPercent = 0.0015 * (1 + marketVol * 2);
    const rawConverted = amount * crossRate;
    const spreadAmount = rawConverted * spreadPercent;
    const operationalFee = Math.max(150, rawConverted * 0.0002);
    const netReceived = rawConverted - spreadAmount - operationalFee;

    return {
      fromCurrency: from,
      toCurrency: to,
      fromAmount: amount,
      convertedAmount: parseFloat(rawConverted.toFixed(2)),
      fxRate: parseFloat(crossRate.toFixed(4)),
      spreadAmount: parseFloat(spreadAmount.toFixed(2)),
      operationalFee: parseFloat(operationalFee.toFixed(2)),
      netReceived: parseFloat(netReceived.toFixed(2))
    };
  }
}
