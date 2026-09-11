import { SettlementItem, RailItem } from '../types';

/**
 * TREASURYX SETTLEMENT RISK ENGINE
 * Assesses cutoff timing, queue congestion, latency variance, and predictive failure score.
 */
export class SettlementRiskEngine {
  public static assessSettlements(settlements: SettlementItem[], rails: RailItem[]): SettlementItem[] {
    const now = Date.now();

    return settlements.map(st => {
      const cutoffEpoch = new Date(st.cutoffTime).getTime();
      const timeRemainingSec = Math.max(0, Math.floor((cutoffEpoch - now) / 1000));
      const railInfo = rails.find(r => r.name === st.rail) || {
        name: 'RTGS' as const,
        avgLatencyMs: 2500,
        latencyVarianceMs: 1200,
        capacityUtilization: 0.5,
        operatingStatus: 'NORMAL' as const,
        failureRate: 0.02
      };

      // Failure occurs if (Latency + QueueDelay) > Remaining Time
      const expectedLatencySec = (railInfo.avgLatencyMs + (railInfo.latencyVarianceMs * 2)) / 1000;
      let riskScore = 0.01;

      if (timeRemainingSec <= 0 && st.status !== 'CONFIRMED') {
        riskScore = 1.0;
      } else if (timeRemainingSec < 300) {
        // Less than 5 minutes left
        riskScore = Math.min(0.95, (expectedLatencySec / (timeRemainingSec + 0.1)) * 0.8 + railInfo.failureRate);
      } else if (timeRemainingSec < 900) {
        riskScore = Math.min(0.85, 0.25 + railInfo.failureRate * 2);
      } else {
        riskScore = Math.min(0.35, railInfo.failureRate * 1.5);
      }

      let status = st.status;
      if (riskScore >= 0.85 && status !== 'CONFIRMED') {
        status = 'PENDING';
      }

      return {
        ...st,
        timeRemainingSeconds: timeRemainingSec,
        failureProbability: parseFloat(riskScore.toFixed(3)),
        status
      };
    });
  }
}
