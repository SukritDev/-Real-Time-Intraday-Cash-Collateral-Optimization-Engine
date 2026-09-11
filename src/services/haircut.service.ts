/**
 * TREASURYX DYNAMIC HAIRCUT ENGINE
 * Mathematical Formulation:
 * Haircut = Base + Volatility_Adj + Liquidity_Adj + Rating_Adj + CCP_Specific_Rule
 */
export class HaircutEngine {
  public static calculateHaircut(
    baseHaircut: number,
    creditRating: string,
    assetType: string,
    marketVolatility: number,
    targetCcp: string = 'CCIL_INDIA'
  ): number {
    let ratingAdjustment = 0;
    switch (creditRating) {
      case 'AAA': ratingAdjustment = 0.000; break;
      case 'AA+': ratingAdjustment = 0.005; break;
      case 'AA':  ratingAdjustment = 0.012; break;
      case 'A+':  ratingAdjustment = 0.025; break;
      case 'BBB': ratingAdjustment = 0.045; break;
      default:    ratingAdjustment = 0.070;
    }

    // Non-linear market volatility penalty multiplier: alpha * max(0, sigma_market - sigma_baseline)
    const volatilityPenalty = Math.max(0, (marketVolatility - 0.15) * 0.25);

    // Asset class specific liquidity friction adjustment: beta * (1 - MarketTurnoverRatio)
    let liquidityAdjustment = 0;
    if (assetType === 'CORPORATE_BONDS') liquidityAdjustment = 0.02;
    if (assetType === 'EQUITIES') liquidityAdjustment = 0.06;
    if (assetType === 'FIXED_INCOME') liquidityAdjustment = 0.015;

    // CCP-specific margin policies (CCIL vs CME vs LCH)
    let ccpBias = 0;
    if (targetCcp === 'CCIL_INDIA') ccpBias = -0.005; // Sovereign domestic preference
    if (targetCcp === 'CME_CLEARING') ccpBias = 0.005;

    const finalHaircut = baseHaircut + ratingAdjustment + volatilityPenalty + liquidityAdjustment + ccpBias;
    return Math.min(Math.max(0.01, parseFloat(finalHaircut.toFixed(4))), 0.50);
  }

  public static calculateAdjustedValue(marketValue: number, effectiveHaircut: number): number {
    return parseFloat((marketValue * (1 - effectiveHaircut)).toFixed(2));
  }
}
