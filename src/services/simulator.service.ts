import { SystemState, EntityCode, AccountItem, CollateralItem, SettlementItem, RailItem, AuditLogItem, TenantConfig } from '../types';
import { HaircutEngine } from './haircut.service';
import { RegulatoryComplianceEngine } from './regulatory.service';
import { SettlementRiskEngine } from './settlement.service';
import { IntradayOptimizationEngine } from './optimizer.service';
import { formatTimeIST } from '../utils/dateUtils';

export class MarketSimulator {
  private static instances: Map<EntityCode, MarketSimulator> = new Map();
  private state: SystemState;
  private shockMode: boolean = false;

  private constructor(private entityCode: EntityCode) {
    this.state = this.initializeState();
  }

  public static getInstance(entityCode: EntityCode): MarketSimulator {
    if (!this.instances.has(entityCode)) {
      this.instances.set(entityCode, new MarketSimulator(entityCode));
    }
    return this.instances.get(entityCode)!;
  }

  private initializeState(): SystemState {
    const now = Date.now();

    const initialSettings: TenantConfig = {
      minCrrThreshold: 4.5,
      minSlrThreshold: 18.0,
      minLcrThreshold: 100.0,
      simulationSpeedMs: 2000,
      autoOptimization: false,
      ndtlAmount: 1200000000,
      net30DayOutflow: 450000000
    };

    const accounts: AccountItem[] = [
      {
        id: `${this.entityCode}-acct-01`,
        name: 'Bank Operating Account',
        accountNumber: `${this.entityCode}-OPS-001928`,
        currency: 'INR',
        cashBalance: 685000000,
        availableBalance: 595000000,
        reservedBalance: 90000000,
        minRequiredBalance: 150000000,
        status: 'ACTIVE',
        lastUpdated: new Date().toISOString()
      },
      {
        id: `${this.entityCode}-acct-02`,
        name: 'CCP Margin Account',
        accountNumber: `${this.entityCode}-CCP-992100`,
        currency: 'INR',
        cashBalance: 320000000,
        availableBalance: 40000000,
        reservedBalance: 280000000,
        minRequiredBalance: 250000000,
        status: 'ACTIVE',
        lastUpdated: new Date().toISOString()
      },
      {
        id: `${this.entityCode}-acct-03`,
        name: 'Settlement Account (RTGS)',
        accountNumber: `${this.entityCode}-SET-440212`,
        currency: 'INR',
        cashBalance: 185000000,
        availableBalance: 145000000,
        reservedBalance: 40000000,
        minRequiredBalance: 80000000,
        status: 'ACTIVE',
        lastUpdated: new Date().toISOString()
      },
      {
        id: `${this.entityCode}-acct-04`,
        name: 'RBI Reserve Account (CRR)',
        accountNumber: `${this.entityCode}-RES-000001`,
        currency: 'INR',
        cashBalance: 580000000,
        availableBalance: 580000000,
        reservedBalance: 0,
        minRequiredBalance: 540000000,
        status: 'ACTIVE',
        lastUpdated: new Date().toISOString()
      },
      {
        id: `${this.entityCode}-acct-05`,
        name: 'Collateral Pool Account Alpha',
        accountNumber: `${this.entityCode}-COL-101`,
        currency: 'INR',
        cashBalance: 210000000,
        availableBalance: 160000000,
        reservedBalance: 50000000,
        minRequiredBalance: 50000000,
        status: 'ACTIVE',
        lastUpdated: new Date().toISOString()
      },
      {
        id: `${this.entityCode}-acct-06`,
        name: 'Collateral Pool Account Beta',
        accountNumber: `${this.entityCode}-COL-102`,
        currency: 'INR',
        cashBalance: 140000000,
        availableBalance: 110000000,
        reservedBalance: 30000000,
        minRequiredBalance: 30000000,
        status: 'ACTIVE',
        lastUpdated: new Date().toISOString()
      },
      {
        id: `${this.entityCode}-acct-07`,
        name: 'FX Nostro USD Account',
        accountNumber: `${this.entityCode}-FX-USD`,
        currency: 'USD',
        cashBalance: 12500000, // $12.5M
        availableBalance: 9800000,
        reservedBalance: 2700000,
        minRequiredBalance: 4000000,
        status: 'ACTIVE',
        lastUpdated: new Date().toISOString()
      },
      {
        id: `${this.entityCode}-acct-08`,
        name: 'FX Nostro EUR Account',
        accountNumber: `${this.entityCode}-FX-EUR`,
        currency: 'EUR',
        cashBalance: 8200000, // €8.2M
        availableBalance: 6100000,
        reservedBalance: 2100000,
        minRequiredBalance: 2000000,
        status: 'ACTIVE',
        lastUpdated: new Date().toISOString()
      },
      {
        id: `${this.entityCode}-acct-09`,
        name: 'FX Nostro GBP Account',
        accountNumber: `${this.entityCode}-FX-GBP`,
        currency: 'GBP',
        cashBalance: 4500000, // £4.5M
        availableBalance: 3200000,
        reservedBalance: 1300000,
        minRequiredBalance: 1500000,
        status: 'ACTIVE',
        lastUpdated: new Date().toISOString()
      }
    ];

    const collateral: CollateralItem[] = [
      {
        id: `${this.entityCode}-col-01`,
        assetIdentifier: 'IN0020230085',
        name: '7.18% GS 2033 (Govt of India)',
        type: 'GOVERNMENT_SECURITIES',
        currency: 'INR',
        marketValue: 480000000,
        quantity: 4800000,
        baseHaircut: 0.02,
        effectiveHaircut: 0.025,
        adjustedValue: 468000000,
        eligibleCCPs: ['CCIL_INDIA', 'NSE_CLEARING'],
        pledgedValue: 300000000,
        availableValue: 168000000,
        maturityDate: '2033-08-14',
        creditRating: 'AAA'
      },
      {
        id: `${this.entityCode}-col-02`,
        assetIdentifier: 'INE002A08427',
        name: 'Reliance Industries Corp Bond 2028',
        type: 'CORPORATE_BONDS',
        currency: 'INR',
        marketValue: 220000000,
        quantity: 220000,
        baseHaircut: 0.06,
        effectiveHaircut: 0.075,
        adjustedValue: 203500000,
        eligibleCCPs: ['CCIL_INDIA', 'BSE_CLEARING'],
        pledgedValue: 120000000,
        availableValue: 83500000,
        maturityDate: '2028-11-20',
        creditRating: 'AAA'
      },
      {
        id: `${this.entityCode}-col-03`,
        assetIdentifier: 'INE040A08035',
        name: 'HDFC Bank Tier-2 Infra Bond',
        type: 'FIXED_INCOME',
        currency: 'INR',
        marketValue: 180000000,
        quantity: 180000,
        baseHaircut: 0.05,
        effectiveHaircut: 0.065,
        adjustedValue: 168300000,
        eligibleCCPs: ['CCIL_INDIA'],
        pledgedValue: 60000000,
        availableValue: 108300000,
        maturityDate: '2029-04-15',
        creditRating: 'AA+'
      },
      {
        id: `${this.entityCode}-col-04`,
        assetIdentifier: 'US912828ZG88',
        name: 'US Treasury Note 4.25% 2029',
        type: 'GOVERNMENT_SECURITIES',
        currency: 'USD',
        marketValue: 15000000,
        quantity: 150000,
        baseHaircut: 0.015,
        effectiveHaircut: 0.02,
        adjustedValue: 14700000,
        eligibleCCPs: ['CME_CLEARING', 'LCH_CLEARNET'],
        pledgedValue: 5000000,
        availableValue: 9700000,
        maturityDate: '2029-02-28',
        creditRating: 'AAA'
      }
    ];

    const settlements: SettlementItem[] = [
      {
        id: `${this.entityCode}-st-01`,
        referenceNumber: 'TX-RTGS-8910291',
        sourceAccountId: `${this.entityCode}-acct-01`,
        sourceAccountName: 'Bank Operating Account',
        destAccountId: `${this.entityCode}-acct-02`,
        destAccountName: 'CCP Margin Account',
        amount: 85000000,
        currency: 'INR',
        rail: 'RTGS',
        createdAt: new Date(now - 10 * 60 * 1000).toISOString(),
        expectedSettlement: new Date(now + 12 * 60 * 1000).toISOString(),
        cutoffTime: new Date(now + 28 * 60 * 1000).toISOString(),
        latencyMs: 1800,
        status: 'PENDING',
        failureProbability: 0.12,
        timeRemainingSeconds: 1680
      },
      {
        id: `${this.entityCode}-st-02`,
        referenceNumber: 'TX-NEFT-5412988',
        sourceAccountId: `${this.entityCode}-acct-03`,
        sourceAccountName: 'Settlement Account (RTGS)',
        destAccountId: `${this.entityCode}-acct-01`,
        destAccountName: 'Bank Operating Account',
        amount: 145000000,
        currency: 'INR',
        rail: 'NEFT',
        createdAt: new Date(now - 30 * 60 * 1000).toISOString(),
        expectedSettlement: new Date(now + 8 * 60 * 1000).toISOString(),
        cutoffTime: new Date(now + 14 * 60 * 1000).toISOString(),
        latencyMs: 4200,
        status: 'PENDING',
        failureProbability: 0.68,
        timeRemainingSeconds: 840
      },
      {
        id: `${this.entityCode}-st-03`,
        referenceNumber: 'TX-IMPS-1192837',
        sourceAccountId: `${this.entityCode}-acct-01`,
        sourceAccountName: 'Bank Operating Account',
        destAccountId: `${this.entityCode}-acct-05`,
        destAccountName: 'Collateral Pool Account Alpha',
        amount: 32000000,
        currency: 'INR',
        rail: 'IMPS',
        createdAt: new Date(now - 5 * 60 * 1000).toISOString(),
        expectedSettlement: new Date(now + 3 * 60 * 1000).toISOString(),
        cutoffTime: new Date(now + 60 * 60 * 1000).toISOString(),
        latencyMs: 850,
        status: 'CONFIRMED',
        failureProbability: 0.01,
        timeRemainingSeconds: 3600
      }
    ];

    const paymentRails: RailItem[] = [
      { name: 'RTGS', avgLatencyMs: 1200, latencyVarianceMs: 450, capacityUtilization: 0.62, operatingStatus: 'NORMAL', failureRate: 0.005 },
      { name: 'NEFT', avgLatencyMs: 3800, latencyVarianceMs: 1400, capacityUtilization: 0.84, operatingStatus: 'DEGRADED', failureRate: 0.045 },
      { name: 'IMPS', avgLatencyMs: 650, latencyVarianceMs: 180, capacityUtilization: 0.48, operatingStatus: 'NORMAL', failureRate: 0.008 },
      { name: 'INTERNAL_TRANSFER', avgLatencyMs: 50, latencyVarianceMs: 10, capacityUtilization: 0.22, operatingStatus: 'NORMAL', failureRate: 0.0001 }
    ];

    const auditLogs: AuditLogItem[] = [
      {
        id: `audit-${now - 600000}`,
        time: formatTimeIST(now - 600000),
        user: 'System_Daemon',
        action: 'ENGINE_INITIALIZED',
        details: `Loaded multi-account state for ${this.entityCode} with 9 accounts and 4 collateral pools`,
        status: 'SUCCESS'
      },
      {
        id: `audit-${now - 300000}`,
        time: formatTimeIST(now - 300000),
        user: 'Officer_Alpha_Lead',
        action: 'BASELINE_EVALUATION',
        details: 'Basel III & RBI regulatory metrics evaluated (CRR: 4.83%, SLR: 19.45%, LCR: 128.4%)',
        status: 'SUCCESS'
      }
    ];

    const reg = RegulatoryComplianceEngine.evaluate(
      accounts.map(a => ({ name: a.name, availableBalance: a.availableBalance })),
      collateral.map(c => ({ type: c.type, marketValue: c.marketValue, effectiveHaircut: c.effectiveHaircut })),
      initialSettings.net30DayOutflow,
      initialSettings.ndtlAmount
    );

    return {
      entityCode: this.entityCode,
      timestamp: new Date().toISOString(),
      marketVolatility: 0.12,
      fxRates: { USD: 83.25, EUR: 90.15, GBP: 105.40 },
      kpis: {
        totalCash: 2120000000,
        availableLiquidity: 1630000000,
        totalCollateral: 1048000000,
        availableCollateral: 369500000,
        requiredCcpMargin: 380000000,
        lcr: reg.lcr.value,
        crr: reg.crr.value,
        slr: reg.slr.value,
        fxExposure: 215000000,
        atRiskSettlementsCount: 1,
        predictedFailuresCount: 0,
        projectedOptimizationSavings: 385000,
        systemicRiskScore: 24.5,
        systemicRiskLevel: 'LOW'
      },
      accounts,
      collateral,
      settlements,
      recommendations: [],
      paymentRails,
      auditLogs,
      tenantSettings: initialSettings
    };
  }

  public tick(): SystemState {
    // Continuous controlled real-time Brownian simulation
    const volDrift = this.shockMode ? (Math.random() * 0.04 + 0.02) : ((Math.random() - 0.5) * 0.01);
    this.state.marketVolatility = parseFloat(Math.min(0.75, Math.max(0.08, this.state.marketVolatility + volDrift)).toFixed(3));

    // Update Collateral effective haircuts based on volatility
    this.state.collateral = this.state.collateral.map(c => {
      const effHaircut = HaircutEngine.calculateHaircut(c.baseHaircut, c.creditRating, c.type, this.state.marketVolatility, 'CCIL_INDIA');
      const adjVal = HaircutEngine.calculateAdjustedValue(c.marketValue, effHaircut);
      return {
        ...c,
        effectiveHaircut: effHaircut,
        adjustedValue: adjVal,
        availableValue: Math.max(0, adjVal - c.pledgedValue)
      };
    });

    // Recalculate settlement risk countdowns
    this.state.settlements = SettlementRiskEngine.assessSettlements(this.state.settlements, this.state.paymentRails);

    // Recalculate regulatory metrics
    const reg = RegulatoryComplianceEngine.evaluate(
      this.state.accounts.map(a => ({ name: a.name, availableBalance: a.availableBalance })),
      this.state.collateral.map(c => ({ type: c.type, marketValue: c.marketValue, effectiveHaircut: c.effectiveHaircut })),
      this.state.tenantSettings.net30DayOutflow,
      this.state.tenantSettings.ndtlAmount,
      this.state.tenantSettings.minCrrThreshold,
      this.state.tenantSettings.minSlrThreshold,
      this.state.tenantSettings.minLcrThreshold
    );

    // Re-evaluate continuous recommendations
    const recs = IntradayOptimizationEngine.solve(
      this.state.entityCode,
      this.state.accounts,
      this.state.collateral,
      this.state.settlements,
      this.state.marketVolatility
    );
    this.state.recommendations = recs;

    // Auto-execute if autoOptimization is enabled
    if (this.state.tenantSettings.autoOptimization && recs.length > 0) {
      this.approveRecommendation(recs[0].id, 'Auto_Optimization_Daemon');
    }

    // Update aggregate KPIs
    const atRiskCount = this.state.settlements.filter(s => s.failureProbability > 0.5 && s.status !== 'CONFIRMED').length;
    const predFailures = this.state.settlements.filter(s => s.failureProbability > 0.85 && s.status !== 'CONFIRMED').length;

    let sysRiskScore = (this.state.marketVolatility * 40) + (atRiskCount * 15) + (reg.lcr.headroom < 15 ? 20 : 0);
    sysRiskScore = parseFloat(Math.min(99.9, Math.max(5.0, sysRiskScore)).toFixed(1));
    let sysLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (sysRiskScore > 75) sysLevel = 'CRITICAL';
    else if (sysRiskScore > 50) sysLevel = 'HIGH';
    else if (sysRiskScore > 30) sysLevel = 'MODERATE';

    this.state.kpis = {
      totalCash: this.state.accounts.reduce((sum, a) => sum + a.cashBalance, 0),
      availableLiquidity: this.state.accounts.reduce((sum, a) => sum + a.availableBalance, 0),
      totalCollateral: this.state.collateral.reduce((sum, c) => sum + c.marketValue, 0),
      availableCollateral: this.state.collateral.reduce((sum, c) => sum + c.availableValue, 0),
      requiredCcpMargin: parseFloat((380000000 * (1 + this.state.marketVolatility * 0.85)).toFixed(2)),
      lcr: reg.lcr.value,
      crr: reg.crr.value,
      slr: reg.slr.value,
      fxExposure: 215000000 * (1 + this.state.marketVolatility * 0.5),
      atRiskSettlementsCount: atRiskCount,
      predictedFailuresCount: predFailures,
      projectedOptimizationSavings: 385000 + (recs.length * 125000),
      systemicRiskScore: sysRiskScore,
      systemicRiskLevel: sysLevel
    };

    this.state.timestamp = new Date().toISOString();
    return this.state;
  }

  public triggerMarketShock(): void {
    this.shockMode = true;
    this.state.marketVolatility = 0.58;
    const neftRail = this.state.paymentRails.find(r => r.name === 'NEFT');
    if (neftRail) {
      neftRail.operatingStatus = 'DEGRADED';
      neftRail.avgLatencyMs = 8500;
    }
    this.logAudit('SHOCK_TRIGGERED', 'Market volatility spiked to 58.0% | NEFT payment rail capacity degraded', 'WARNING');
    this.tick();
  }

  public triggerMarginCall(): void {
    this.state.marketVolatility = 0.42;
    const ccpAcct = this.state.accounts.find(a => a.name.includes('CCP Margin'));
    if (ccpAcct) {
      ccpAcct.reservedBalance += 85000000;
      ccpAcct.availableBalance = Math.max(0, ccpAcct.cashBalance - ccpAcct.reservedBalance);
    }
    this.logAudit('MARGIN_CALL_SPIKE', 'CCIL Clearing issued supplementary intraday margin call (+₹8.50 Cr reserved)', 'CRITICAL');
    this.tick();
  }

  public triggerRailDelay(): void {
    const neftRail = this.state.paymentRails.find(r => r.name === 'NEFT');
    if (neftRail) {
      neftRail.operatingStatus = 'OUTAGE';
      neftRail.avgLatencyMs = 15000;
      neftRail.failureRate = 0.35;
    }
    const st = this.state.settlements.find(s => s.rail === 'NEFT');
    if (st) {
      st.failureProbability = 0.94;
    }
    this.logAudit('RAIL_GRIDLOCK', 'NEFT core settlement switch entered OUTAGE state (Latency: 15,000ms, 94% fail risk)', 'CRITICAL');
    this.tick();
  }

  public resetDemo(): void {
    this.shockMode = false;
    this.state = this.initializeState();
    this.logAudit('SYSTEM_RESET', 'Simulation baseline restored across all 9 accounts and collateral pools', 'SUCCESS');
  }

  public approveRecommendation(recId: string, operator: string = 'Officer_Alpha_Lead'): boolean {
    const rec = this.state.recommendations.find(r => r.id === recId);
    if (!rec) return false;

    rec.status = 'APPROVED';

    // Execute transfer rebalance
    const src = this.state.accounts.find(a => a.id === rec.sourceId);
    const dst = this.state.accounts.find(a => a.id === rec.destinationId);
    if (src && dst) {
      src.availableBalance -= rec.amount;
      src.cashBalance -= rec.amount;
      dst.availableBalance += rec.amount;
      dst.cashBalance += rec.amount;
      src.lastUpdated = new Date().toISOString();
      dst.lastUpdated = new Date().toISOString();
    }

    // Resolve at-risk settlement if reroute
    if (rec.actionType === 'REROUTE_PAYMENT') {
      const st = this.state.settlements.find(s => s.status !== 'CONFIRMED');
      if (st) {
        st.status = 'CONFIRMED';
        st.failureProbability = 0.01;
        st.rail = 'RTGS';
      }
    }

    // Collateral substitution execution
    if (rec.actionType === 'SUBSTITUTE_COLLATERAL') {
      const corp = this.state.collateral.find(c => c.type === 'CORPORATE_BONDS');
      const gsec = this.state.collateral.find(c => c.type === 'GOVERNMENT_SECURITIES');
      if (corp && gsec) {
        corp.pledgedValue += rec.amount;
        corp.availableValue = Math.max(0, corp.adjustedValue - corp.pledgedValue);
        gsec.pledgedValue = Math.max(0, gsec.pledgedValue - rec.amount);
        gsec.availableValue = gsec.adjustedValue - gsec.pledgedValue;
      }
    }

    this.logAudit(
      'OPTIMIZATION_EXECUTED',
      `Approved ${rec.actionType}: ₹${(rec.amount / 10000000).toFixed(2)} Cr (${rec.sourceName} -> ${rec.destinationName})`,
      'SUCCESS',
      operator
    );

    // Lower volatility after recovery action
    this.shockMode = false;
    this.state.marketVolatility = Math.max(0.12, this.state.marketVolatility - 0.25);
    this.tick();
    return true;
  }

  public updateTenantSettings(newSettings: Partial<TenantConfig>): void {
    this.state.tenantSettings = { ...this.state.tenantSettings, ...newSettings };
    this.logAudit('CONFIG_UPDATED', `Updated tenant parameters: CRR ${this.state.tenantSettings.minCrrThreshold}%, SLR ${this.state.tenantSettings.minSlrThreshold}%, LCR ${this.state.tenantSettings.minLcrThreshold}%`, 'SUCCESS');
    this.tick();
  }

  public logAudit(action: string, details: string, status: 'SUCCESS' | 'WARNING' | 'CRITICAL' = 'SUCCESS', user: string = 'System_Daemon'): void {
    const entry: AuditLogItem = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      time: formatTimeIST(),
      user,
      action,
      details,
      status
    };
    this.state.auditLogs.unshift(entry);
    if (this.state.auditLogs.length > 50) {
      this.state.auditLogs.pop();
    }
  }

  public getState(): SystemState {
    return this.state;
  }
}
