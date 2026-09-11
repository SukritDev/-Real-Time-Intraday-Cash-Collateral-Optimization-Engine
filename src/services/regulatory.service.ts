export interface RegulatoryMetrics {
  lcr: { value: number; required: number; headroom: number; status: 'COMPLIANT' | 'WARNING' | 'BREACH' };
  crr: { value: number; required: number; headroom: number; status: 'COMPLIANT' | 'WARNING' | 'BREACH' };
  slr: { value: number; required: number; headroom: number; status: 'COMPLIANT' | 'WARNING' | 'BREACH' };
}

/**
 * TREASURYX REGULATORY COMPLIANCE ENGINE
 * Enforces Basel III & Reserve Bank of India Frameworks:
 * 1. CRR: Cash in RBI Reserve Account / NDTL >= 4.50%
 * 2. SLR: (Unencumbered G-Secs + Cash in Excess) / NDTL >= 18.00%
 * 3. LCR: Stock of High-Quality Liquid Assets (HQLA) / 30-Day Net Outflows >= 100.00%
 */
export class RegulatoryComplianceEngine {
  public static evaluate(
    accounts: Array<{ name: string; availableBalance: number }>,
    collaterals: Array<{ type: string; marketValue: number; effectiveHaircut: number }>,
    netCashOutflow30Days: number = 450000000,
    ndtl: number = 1200000000,
    minCrr: number = 4.50,
    minSlr: number = 18.00,
    minLcr: number = 100.00
  ): RegulatoryMetrics {
    // 1. CRR: Cash deposited in Reserve Account / NDTL
    const reserveAcct = accounts.find(a => a.name.toLowerCase().includes('reserve'));
    const reserveBalance = reserveAcct ? reserveAcct.availableBalance : 55000000;
    const crrPercent = parseFloat(((reserveBalance / ndtl) * 100).toFixed(2));
    const crrHeadroom = parseFloat((crrPercent - minCrr).toFixed(2));

    // 2. SLR: (Unencumbered G-Secs + Excess Cash) / NDTL
    const gsecValue = collaterals
      .filter(c => c.type === 'GOVERNMENT_SECURITIES')
      .reduce((sum, c) => sum + (c.marketValue * (1 - c.effectiveHaircut)), 0);
    const slrPercent = parseFloat((((gsecValue + reserveBalance) / ndtl) * 100).toFixed(2));
    const slrHeadroom = parseFloat((slrPercent - minSlr).toFixed(2));

    // 3. LCR: Total Stock of High-Quality Liquid Assets (HQLA) / 30-day Net Cash Outflows
    const operatingBalance = accounts.find(a => a.name.includes('Operating'))?.availableBalance || 0;
    const hqlaTotal = gsecValue + reserveBalance + operatingBalance;
    const lcrPercent = parseFloat(((hqlaTotal / netCashOutflow30Days) * 100).toFixed(2));
    const lcrHeadroom = parseFloat((lcrPercent - minLcr).toFixed(2));

    return {
      crr: {
        value: crrPercent,
        required: minCrr,
        headroom: crrHeadroom,
        status: crrHeadroom < 0 ? 'BREACH' : (crrHeadroom < 0.35 ? 'WARNING' : 'COMPLIANT')
      },
      slr: {
        value: slrPercent,
        required: minSlr,
        headroom: slrHeadroom,
        status: slrHeadroom < 0 ? 'BREACH' : (slrHeadroom < 0.75 ? 'WARNING' : 'COMPLIANT')
      },
      lcr: {
        value: lcrPercent,
        required: minLcr,
        headroom: lcrHeadroom,
        status: lcrHeadroom < 0 ? 'BREACH' : (lcrHeadroom < 8.0 ? 'WARNING' : 'COMPLIANT')
      }
    };
  }
}
