import { StressScenarioResult } from '../types';

/**
 * TREASURYX STRESS TESTING SERVICE
 * Simulates severe intraday tail-risk shocks, haircut widenings, rail outages, and systemic cascades.
 */
export class StressTestingService {
  public static executeScenario(
    scenario: string,
    intensity: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME',
    currentLcr: number,
    currentCrr: number
  ): StressScenarioResult {
    const multiplier = intensity === 'EXTREME' ? 4.0 : (intensity === 'HIGH' ? 2.5 : (intensity === 'MEDIUM' ? 1.5 : 1.0));

    let cashLoss = 45000000 * multiplier;
    let collateralHit = 35000000 * multiplier;
    let lcrDrop = 18 * multiplier;
    let marginShortfall = 65000000 * multiplier;
    let failures = Math.floor(2 * multiplier);

    let propagation: string[] = [];

    if (scenario.includes('CCP Margin Shock')) {
      propagation = [
        '1. Initial Shock: Margin Requirement increased by 65% across CCIL / CME Clearing pools',
        '2. Tier-1 Liquidity: Operating account balances depleted to meet intra-morning call within 45 mins',
        '3. Collateral Devaluation: Volatility increases haircuts across AA/BBB corporate bonds (+450 bps)',
        '4. Rail Congestion: Counterparty queues delay expected inflows by 42 minutes',
        '5. Systemic Spreading: Bank Beta invokes reciprocal bilateral liquidity lines with Tier-1 members'
      ];
    } else if (scenario.includes('Settlement Bank Failure')) {
      propagation = [
        '1. Counterparty Default: Clearing bank freezes outward RTGS settlement gateway',
        '2. Trapped Liquidity: ₹145 Cr intraday funds locked in bilateral settlement queue',
        '3. Secondary Shock: 4 wholesale corporate settlements miss market cutoffs',
        '4. Depository Penalties: Mandatory buy-in triggered by Clearing Corporation',
        '5. Contagion: Overdraft facility draws spike at RBI discount window'
      ];
    } else if (scenario.includes('Deposit Flight')) {
      propagation = [
        '1. Corporate Run: Top 5 wholesale depositors initiate intraday outflows totaling ₹350 Cr',
        '2. LCR Compression: 30-day net outflows surge, dropping LCR below 100% statutory floor',
        '3. Unencumbered Paper Pledged: Bank is forced to pledge sovereign G-Secs in Tri-Party Repo',
        '4. Secondary Reserves: CRR account maintained at edge of compliance buffer (4.52%)',
        '5. Liquidity Defense: Internal treasury asset-liability committee enters Level-3 escalation'
      ];
    } else {
      // Yield Curve Shift
      propagation = [
        '1. Rate Hike / Sovereign Curve Spike: 10Y Benchmark G-Sec yield rises +150 bps intraday',
        '2. Mark-to-Market Loss: Collateral asset base devalues by 3.8% across debt portfolio',
        '3. Dynamic Haircut Widening: CCIL haircut rules expand base haircut from 2.0% to 5.2%',
        '4. Variation Margin Call: CCIL issues supplementary intraday margin call of ₹95 Cr',
        '5. Portfolio Rebalance: Treasury Desk substitutes corporate paper to protect sovereign HQLA'
      ];
    }

    return {
      scenarioName: scenario,
      intensity,
      cashImpactAmount: parseFloat(cashLoss.toFixed(2)),
      collateralDevaluation: parseFloat(collateralHit.toFixed(2)),
      postStressLcr: Math.max(45, parseFloat((currentLcr - lcrDrop).toFixed(1))),
      postStressCrr: Math.max(3.2, parseFloat((currentCrr - 0.4 * multiplier).toFixed(2))),
      marginShortfall: parseFloat(marginShortfall.toFixed(2)),
      predictedSettlementFailures: failures,
      affectedCounterparties: ['CCIL Clearing Pool', 'Apex Investment Bank', 'National Settlement Corp', 'EuroClear Member 4'],
      estimatedRecoveryMinutes: Math.floor(45 * multiplier),
      systemicPropagationChain: propagation
    };
  }
}
